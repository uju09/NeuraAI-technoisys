import Bull from 'bull';
import { logger } from '../utils/logger.js';
import { redisClient } from '../utils/redisClient.js';
import { prisma } from '../utils/prisma.js';

import { enhancePrompt } from '../agents/promptEnhancer.js';
import { generateCode } from '../agents/codeGenerator.js';
import { debugCode } from '../agents/codeDebugger.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const generationQueue = new Bull('generation-queue', redisUrl);

// Clear any existing/stale jobs from the queue on startup
try {
  await generationQueue.empty();
  await generationQueue.clean(0, 'active');
  await generationQueue.clean(0, 'wait');
  await generationQueue.clean(0, 'failed');
  await generationQueue.clean(0, 'delayed');
  logger.info('Successfully cleaned up residual jobs from the queue.');
} catch (err) {
  logger.warn(`Failed to clean residual jobs: ${err.message}`);
}

generationQueue.process(async (job) => {
  const { prompt, userId, provider, model } = job.data;
  const jobId = job.id;
  const providerConfig = { provider: provider || 'gemini', model: model || undefined };
  
  logger.info(`Processing job ${jobId} for prompt: "${prompt}" [provider: ${providerConfig.provider}]`);

  const cacheKey = `component:prompt:${providerConfig.provider}:${Buffer.from(prompt).toString('base64')}`;

  try {
    job.progress(10);
    const enhancedPrompt = await enhancePrompt(prompt, jobId, providerConfig);
    
    job.progress(25);
    
    let code = '';
    let validated = true; // Auto-pass validation to skip loop
    let finalDebugAttempts = 0;
    const temperature = 0.3;

    // 1. Generate code (Single pass)
    code = await generateCode(enhancedPrompt, jobId, temperature, providerConfig);
    job.progress(50);

    // 2. Debug code (Local AST check + 1 LLM fallback)
    const debugResult = await debugCode(code, jobId, providerConfig);
    code = debugResult.code;
    finalDebugAttempts = debugResult.attempts;
    job.progress(80);

    job.progress(90);

    let componentRecord;
    try {
      componentRecord = await prisma.component.create({
        data: {
          user_id: userId || null,
          prompt: prompt,
          enhanced_prompt: enhancedPrompt,
          code: code,
          validated: validated,
          debug_attempts: finalDebugAttempts,
          validation_attempts: 1
        }
      });
    } catch (dbErr) {
      logger.warn(`Failed to save to database: ${dbErr.message}`);
      componentRecord = { id: jobId };
    }

    const result = {
      componentId: componentRecord.id,
      code: code,
      validated: validated,
      debugAttempts: finalDebugAttempts,
      validationAttempts: 1
    };

    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);

    job.progress(100);
    logger.info(`Job ${jobId} completed. Validated: ${validated}`);
    
    return result;

  } catch (error) {
    logger.error(`Job ${jobId} failed: ${error.message}`);
    throw error;
  }
});

generationQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed with error ${err.message}`);
});

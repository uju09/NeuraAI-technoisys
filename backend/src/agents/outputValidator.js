import { callAI } from '../utils/aiClient.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';

export async function validateOutput(originalPrompt, code, jobId, providerConfig = {}) {
  logger.info(`[Agent 4: Output Validator] Validating code for job ${jobId}`);

  const systemPrompt = `You are a strict QA reviewer. Compare the original user query against the provided code.
Original Query: "${originalPrompt}"
Does the code implement the required features?
Return a JSON verdict matching this structure exactly (no markdown wrappers like \`\`\`json):
{"valid": boolean, "issues": ["issue 1", "issue 2"]}`;

  const { text, latencyMs } = await callAI(systemPrompt, code, 0.3, providerConfig);
  
  await prisma.pipelineLog.create({
    data: {
      job_id: jobId,
      agent: 'OutputValidator',
      latency_ms: latencyMs,
      prompt_len: originalPrompt.length + code.length,
      resp_len: text.length
    }
  });

  let valid = true;
  let issues = [];

  try {
    const cleaned = text.replace(/^```json\n?/i, '').replace(/\n?```$/, '').trim();
    const result = JSON.parse(cleaned);
    if (typeof result.valid === 'boolean') {
      valid = result.valid;
      issues = result.issues || [];
    }
  } catch (err) {
    logger.warn(`[Agent 4: Output Validator] Failed to parse JSON, falling back to valid: ${err.message}`);
  }

  return { valid, issues };
}

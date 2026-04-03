import { generationQueue } from '../jobs/generationQueue.js';
import { redisClient } from '../utils/redisClient.js';
import { logger } from '../utils/logger.js';

export async function generateComponent(req, res) {
  try {
    const { prompt, userId, provider, model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const selectedProvider = provider || 'gemini';
    const cacheKey = `component:prompt:${selectedProvider}:${Buffer.from(prompt).toString('base64')}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info(`Cache hit for prompt: "${prompt}" [provider: ${selectedProvider}]`);
      return res.status(200).json({ status: 'completed', result: JSON.parse(cached) });
    }

    const job = await generationQueue.add({ prompt, userId, provider: selectedProvider, model });
    res.status(202).json({ jobId: job.id, status: 'queued' });
  } catch (error) {
    logger.error(`Generate Component Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getJobStatus(req, res) {
  try {
    const { jobId } = req.params;
    const job = await generationQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState();
    const progress = job._progress;
    
    if (state === 'completed') {
      return res.status(200).json({ status: state, progress: 100, result: job.returnvalue });
    } else if (state === 'failed') {
      return res.status(200).json({ status: state, error: job.failedReason });
    }

    res.status(200).json({ status: state, progress });
  } catch (error) {
    logger.error(`Get Job Status Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

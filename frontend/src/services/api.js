import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Maps backend job progress (0-100) to human-readable loading step names.
 */
function progressToStep(progress) {
  if (progress <= 10) return 'enhancing';
  if (progress <= 40) return 'generating';
  if (progress <= 70) return 'generating';
  if (progress <= 90) return 'generating';
  return 'building';
}

/**
 * Generates a component via the backend pipeline.
 * The backend handles: prompt enhancement → code generation → debugging → validation.
 *
 * @param {string} prompt - The raw user prompt
 * @param {string} userId - Persistent user ID for history tracking
 * @param {object} callbacks - Optional callbacks for progress tracking
 * @param {function} callbacks.onProgress - Called with (progress: number, step: string)
 * @param {object} options - Optional provider options
 * @param {string} options.provider - "gemini" or "openrouter"
 * @param {string} options.model - Model name (optional, uses provider default)
 * @param {AbortSignal} options.signal - Optional AbortSignal to cancel the request
 * @returns {Promise<{code: string, validated: boolean, componentId: string}>}
 */
export async function generateComponentCode(prompt, userId, callbacks = {}, options = {}) {
  const { onProgress } = callbacks;
  const { provider, model, signal } = options;

  // 1. Queue the generation job (or get cache hit)
  const response = await api.post('/generate', { prompt, userId, provider, model }, { signal });
  const data = response.data;

  // Handle cache hit — backend returns completed result immediately with no jobId
  if (data.status === 'completed' && data.result) {
    if (onProgress) onProgress(100, 'building');
    return data.result;
  }

  const { jobId, error } = data;
  if (error || !jobId) {
    throw new Error(error || 'Failed to start generation job');
  }

  if (onProgress) onProgress(5, 'enhancing');

  // 2. Poll for job completion
  const POLL_INTERVAL = 2000; // 2 seconds
  const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minute timeout
  const startTime = Date.now();

  while (true) {
    if (signal?.aborted) {
      throw new Error('Generation cancelled by user');
    }

    if (Date.now() - startTime > MAX_POLL_TIME) {
      throw new Error('Generation timed out after 5 minutes');
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

    if (signal?.aborted) {
      throw new Error('Generation cancelled by user');
    }

    const statusRes = await api.get(`/generate/status/${jobId}`, { signal });
    const { status, progress, result, error: jobError } = statusRes.data;

    if (status === 'completed') {
      if (onProgress) onProgress(100, 'building');
      return result;
    }

    if (status === 'failed') {
      throw new Error(jobError || 'Job failed during generation process');
    }

    // Update progress for queued/active states
    if (onProgress && typeof progress === 'number') {
      onProgress(progress, progressToStep(progress));
    }
  }
}

/**
 * Fetch generation history for a user from the backend.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function fetchHistory(userId) {
  const response = await api.get(`/history/${userId}`);
  return response.data.history || [];
}

/**
 * Delete a component from history.
 * @param {string} componentId
 * @returns {Promise<boolean>}
 */
export async function deleteComponent(componentId) {
  const response = await api.delete(`/component/${componentId}`);
  return response.data.success;
}

export default api;

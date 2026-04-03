import { callGemini } from './geminiClient.js';
import { callOpenRouter } from './openrouterClient.js';
import { callGroq } from './groqClient.js';
import { callOllama } from './ollamaClient.js';
import { logger } from './logger.js';

/**
 * Unified AI client that routes to the correct provider.
 * 
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {number} temperature
 * @param {{ provider: 'gemini'|'openrouter'|'groq'|'ollama', model?: string }} providerConfig
 * @returns {Promise<{ text: string, latencyMs: number }>}
 */
export async function callAI(systemPrompt, userPrompt, temperature, providerConfig = {}) {
  const { provider = 'gemini', model } = providerConfig;

  logger.info(`[AI Client] Routing to provider: ${provider}${model ? `, model: ${model}` : ''}`);

  if (provider === 'openrouter') {
    return callOpenRouter(systemPrompt, userPrompt, temperature, model);
  } else if (provider === 'groq') {
    return callGroq(systemPrompt, userPrompt, temperature, model);
  } else if (provider === 'ollama') {
    return callOllama(systemPrompt, userPrompt, temperature, model);
  }

  // Default: Gemini
  return callGemini(systemPrompt, userPrompt, temperature);
}

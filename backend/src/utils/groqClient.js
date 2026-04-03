import dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MAX_RETRIES = 3;
const DEFAULT_MODEL = process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile';

export async function callGroq(systemPrompt, userPrompt, temperature, model) {
  let attempt = 0;
  let backoff = 1000;
  const selectedModel = model || DEFAULT_MODEL;

  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }

  while (attempt < MAX_RETRIES) {
    try {
      const startTime = Date.now();
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: temperature,
        })
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      
      if (!text) {
        throw new Error('Groq response text is empty');
      }

      logger.info(`[Groq] Model: ${selectedModel}, Latency: ${latencyMs}ms`);
      return { text, latencyMs };
    } catch (error) {
      attempt++;
      logger.error(`Groq API Error (Attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);
      if (attempt >= MAX_RETRIES) {
        throw new Error(`Groq failed after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }
}

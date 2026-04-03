import { Ollama } from 'ollama';
import { logger } from './logger.js';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'https://ezequiel-nonenviable-neta.ngrok-free.dev';
const OLLAMA_DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || 'llama-3.3-70b-versatile'; // Wait, user said 'llama3' or similar. I'll use 'qwen2.5-coder:32b' or 'llama3'

const ollama = new Ollama({
  host: OLLAMA_HOST,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

export async function callOllama(systemPrompt, userPrompt, temperature, model) {
  const selectedModel = model || process.env.OLLAMA_DEFAULT_MODEL || 'llama3';
  
  try {
    const startTime = Date.now();
    
    // Convert temperature to float (ollama expects float)
    const options = {
        temperature: parseFloat(temperature) || 0.3
    };

    const response = await ollama.chat({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      options: options
    });

    const latencyMs = Date.now() - startTime;
    const text = response.message?.content;

    if (!text) {
      throw new Error('Ollama response text is empty');
    }

    logger.info(`[Ollama] Model: ${selectedModel}, Latency: ${latencyMs}ms`);
    return { text, latencyMs };
    
  } catch (error) {
    logger.error(`Ollama API Error: ${error.message}`);
    throw error;
  }
}

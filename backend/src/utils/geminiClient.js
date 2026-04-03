import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { logger } from './logger.js';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MAX_RETRIES = 3;

export async function callGemini(systemPrompt, userPrompt, temperature) {
  let attempt = 0;
  let backoff = 1000;

  while (attempt < MAX_RETRIES) {
    try {
      const startTime = Date.now();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: temperature,
        }
      });
      const latencyMs = Date.now() - startTime;
      
      if (!response.text) {
        throw new Error("Response text is empty");
      }
      return { text: response.text, latencyMs };
    } catch (error) {
      attempt++;
      logger.error(`Gemini API Error (Attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);
      if (attempt >= MAX_RETRIES) {
        throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }
}

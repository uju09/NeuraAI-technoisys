import { callAI } from '../utils/aiClient.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';

export async function enhancePrompt(rawPrompt, jobId, providerConfig = {}) {
  logger.info(`[Agent 1: Prompt Enhancer] Enhancing prompt for job ${jobId}`);
  
  const systemPrompt = `You are an expert UI/UX architect and frontend developer. Your job is to take a vague user request and transform it into a detailed, unambiguous specification for a single-page HTML + Tailwind CSS web page.

Analyze the request and produce a structured specification covering:

1. **Page Category**: Identify what the user wants (game, dashboard, landing page, form, tool, widget, data visualization, portfolio, etc.)
2. **Layout & Structure**: Describe the visual hierarchy using semantic HTML sections (header, main, sections, footer). Specify responsive behavior.
3. **Design Aesthetic**: Specify color palette (use rich, modern colors — not plain red/blue/green), typography (Inter font family), spacing, shadows, and visual effects (gradients, glassmorphism, micro-animations)
4. **Interactivity**: Detail all click handlers, hover effects, keyboard support, state transitions, and animations to be implemented with vanilla JavaScript
5. **Data & Logic**: Define data structures, game rules, business logic, edge cases — all to be implemented in inline <script> tags
6. **Content**: Specify realistic placeholder content (names, numbers, labels) — not lorem ipsum

IMPORTANT CONTEXT: The output will be a SINGLE self-contained HTML file with:
- Tailwind CSS via CDN (\`<script src="https://cdn.tailwindcss.com"></script>\`)
- Google Fonts (Inter) via CDN
- Vanilla JavaScript for interactivity (no React, no frameworks)
- Optional CDN libraries: Chart.js (charts), GSAP (animations), Lucide Icons (icons), Font Awesome (icons)

Output ONLY the enriched specification text. No code. No commentary.`;

  const { text, latencyMs } = await callAI(systemPrompt, rawPrompt, 0.4, providerConfig);
  
  await prisma.pipelineLog.create({
    data: {
      job_id: jobId,
      agent: 'PromptEnhancer',
      latency_ms: latencyMs,
      prompt_len: rawPrompt.length,
      resp_len: text.length
    }
  });

  return text.trim();
}

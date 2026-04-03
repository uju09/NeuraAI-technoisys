import { callAI } from '../utils/aiClient.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';
import { extractCode } from '../utils/codeExtractor.js';

export async function generateCode(enhancedPrompt, jobId, temperature = 0.3, providerConfig = {}) {
  logger.info(`[Agent 2: Code Generator] Generating code for job ${jobId}`);

  const systemPrompt = `You are a world-class frontend developer who builds stunning, production-quality web pages. Generate a **complete, self-contained HTML page** from the specification below.

## STRICT RULES (NON-NEGOTIABLE)
1. Output a COMPLETE HTML document: \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<body>\`.
2. Include Tailwind CSS via CDN: \`<script src="https://cdn.tailwindcss.com"></script>\`
3. Include Google Fonts (Inter): \`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">\`
4. All interactivity must use vanilla JavaScript inside \`<script>\` tags.
5. You MUST NOT use React, Vue, Angular, or any framework.
6. You MUST NOT reference any external files (no \`import\`, no \`require\`, no external .js or .css files).
7. Everything must be in a SINGLE HTML file — inline styles, inline scripts, CDN links only.

## CDN LIBRARIES YOU MAY USE (optional, via <script> tag)
- Chart.js: \`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\` — for charts and data visualization
- GSAP: \`<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>\` — for premium animations
- Lucide Icons: \`<script src="https://unpkg.com/lucide@latest"></script>\` then call \`lucide.createIcons()\` in your script
- Font Awesome: \`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">\`

## TAILWIND CONFIGURATION
Include this config block after the Tailwind CDN script:
\`\`\`html
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      }
    }
  }
</script>
\`\`\`

## DESIGN SYSTEM (follow these for consistent premium output)
- **Font**: Inter (loaded via Google Fonts CDN)
- **Dark Background**: \`bg-slate-950\` or \`bg-gray-950\` or \`bg-[#0A0A0F]\`
- **Cards/Surfaces**: \`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl\`
- **Primary Accent**: \`text-violet-400\`, \`bg-violet-500\`, \`border-violet-500/30\`
- **Secondary Accent**: \`text-emerald-400\`, \`bg-emerald-500\`
- **Text Hierarchy**: \`text-white\` (headings), \`text-gray-300\` (body), \`text-gray-500\` (muted)
- **Shadows**: \`shadow-xl shadow-violet-500/10\` or \`shadow-2xl shadow-black/50\`
- **Hover Effects**: \`hover:scale-[1.02] transition-all duration-300 ease-out\`
- **Gradients**: \`bg-gradient-to-br from-violet-600 to-indigo-600\`
- **Spacing**: Generous padding (\`p-6\`, \`p-8\`) and gaps (\`gap-4\`, \`gap-6\`)
- **Border Radius**: \`rounded-xl\` or \`rounded-2xl\` for cards, \`rounded-full\` for badges
- **Animations**: Use CSS transitions (\`transition-all duration-300\`) and \`@keyframes\` for complex motion.

## QUALITY BAR
- The output MUST look like a polished, premium web application — not a basic prototype.
- Use glassmorphism, subtle gradients, layered shadows, and micro-interactions.
- Every interactive element must have a visible hover/active state.
- The layout must be responsive and centered on screen with \`min-h-screen\`.
- Use semantic HTML elements (\`<header>\`, \`<main>\`, \`<section>\`, \`<footer>\`).

## OUTPUT FORMAT
Wrap your ENTIRE HTML code inside <html_code> and </html_code> XML tags. No markdown, no explanations, no conversation outside these tags.

<html_code>
<!DOCTYPE html>
<html lang="en">
<head>...</head>
<body>...</body>
</html>
</html_code>`;

  let { text, latencyMs } = await callAI(systemPrompt, enhancedPrompt, temperature, providerConfig);
  
  text = extractCode(text);

  await prisma.pipelineLog.create({
    data: {
      job_id: jobId,
      agent: 'CodeGenerator',
      latency_ms: latencyMs,
      prompt_len: enhancedPrompt.length,
      resp_len: text.length
    }
  });

  return text;
}

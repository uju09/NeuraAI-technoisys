import { callAI } from '../utils/aiClient.js';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';
import { extractCode } from '../utils/codeExtractor.js';

/**
 * Run structural checks on HTML and auto-fix common issues without LLM calls.
 */
function htmlAutoFix(code) {
  const fixes = [];

  // 1. Ensure <!DOCTYPE html> exists
  if (!/<!DOCTYPE\s+html>/i.test(code)) {
    code = `<!DOCTYPE html>\n${code}`;
    fixes.push('Added missing <!DOCTYPE html>');
  }

  // 2. Ensure <html> tag exists
  if (!/<html/i.test(code)) {
    code = `<html lang="en">\n${code}\n</html>`;
    fixes.push('Wrapped in <html> tags');
  }

  // 3. Ensure Tailwind CDN is present
  if (!/cdn\.tailwindcss\.com/i.test(code)) {
    // Inject before </head> if <head> exists, else before <body>
    if (/<\/head>/i.test(code)) {
      code = code.replace(/<\/head>/i, `  <script src="https://cdn.tailwindcss.com"></script>\n</head>`);
    } else if (/<body/i.test(code)) {
      code = code.replace(/<body/i, `<head><script src="https://cdn.tailwindcss.com"></script></head>\n<body`);
    }
    fixes.push('Injected Tailwind CSS CDN');
  }

  // 4. Ensure <body> tag exists
  if (!/<body/i.test(code)) {
    // Try to wrap content after </head> in <body>
    if (/<\/head>/i.test(code)) {
      code = code.replace(/<\/head>/i, '</head>\n<body>');
      code += '\n</body>';
    }
    fixes.push('Added missing <body> tags');
  }

  // 5. Remove any React/framework imports (AI might still hallucinate them)
  const importRegex = /import\s+.*from\s+['"][^'"]+['"];?\s*\n?/g;
  if (importRegex.test(code)) {
    code = code.replace(importRegex, '');
    fixes.push('Removed framework import statements');
  }

  return { code, fixes };
}

export async function debugCode(initialCode, jobId, providerConfig = {}) {
  logger.info(`[Agent 3: Code Debugger] Debugging code for job ${jobId}`);
  
  const maxAttempts = parseInt(process.env.MAX_DEBUG_LOOPS || '2', 10);
  let attempts = 0;
  let code = extractCode(initialCode);

  // --- Phase 1: HTML auto-fixes (no LLM cost) ---
  const { code: fixedCode, fixes } = htmlAutoFix(code);
  code = fixedCode;
  if (fixes.length > 0) {
    logger.info(`[Agent 3: Code Debugger] Auto-fixed ${fixes.length} issue(s): ${fixes.join(', ')}`);
  }

  // --- Phase 2: Structural validation ---
  const hasDoctype = /<!DOCTYPE\s+html>/i.test(code);
  const hasHtml = /<html/i.test(code);
  const hasBody = /<body/i.test(code);
  const hasTailwind = /cdn\.tailwindcss\.com/i.test(code);

  if (hasDoctype && hasHtml && hasBody && hasTailwind) {
    logger.info(`[Agent 3: Code Debugger] HTML structure valid on attempt 1`);
    return { code, success: true, attempts: 1 };
  }

  // --- Phase 3: LLM-assisted fix (only if structure is broken) ---
  while (attempts < maxAttempts) {
    attempts++;

    const issues = [];
    if (!hasDoctype) issues.push('Missing <!DOCTYPE html>');
    if (!hasHtml) issues.push('Missing <html> tag');
    if (!hasBody) issues.push('Missing <body> tag');
    if (!hasTailwind) issues.push('Missing Tailwind CSS CDN script');

    logger.warn(`[Agent 3: Code Debugger] Issues found: ${issues.join(', ')}`);

    const systemPrompt = `You are an HTML debugging assistant. The following HTML page has structural issues:
${issues.join('\n')}

Fix the issues and return the COMPLETE, corrected HTML page.
The page MUST include: <!DOCTYPE html>, <html>, <head> with Tailwind CDN, <body>, and proper closing tags.
Wrap your output inside <html_code> and </html_code> XML tags. No explanations.`;

    const { text, latencyMs } = await callAI(systemPrompt, code, 0.3, providerConfig);
    code = extractCode(text);

    // Re-apply auto-fixes
    const { code: reFixedCode } = htmlAutoFix(code);
    code = reFixedCode;

    await prisma.pipelineLog.create({
      data: {
        job_id: jobId,
        agent: 'CodeDebugger',
        latency_ms: latencyMs,
        prompt_len: systemPrompt.length + initialCode.length,
        resp_len: code.length
      }
    });

    // Check again
    if (/<!DOCTYPE\s+html>/i.test(code) && /<html/i.test(code) && /<body/i.test(code) && /cdn\.tailwindcss\.com/i.test(code)) {
      logger.info(`[Agent 3: Code Debugger] HTML fixed on attempt ${attempts}`);
      return { code, success: true, attempts };
    }
  }

  return { code, success: false, attempts };
}

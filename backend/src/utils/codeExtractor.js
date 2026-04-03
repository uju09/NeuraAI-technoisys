export function extractCode(text) {
  if (!text) return '';
  
  // Primary Method: Extract from <html_code> tags
  const htmlMatch = text.match(/<html_code>([\s\S]*?)<\/html_code>/i);
  if (htmlMatch && htmlMatch[1].trim()) {
    return htmlMatch[1].trim();
  }

  // Secondary Method: Extract from <react_code> tags (backward compat)
  const reactMatch = text.match(/<react_code>([\s\S]*?)<\/react_code>/i);
  if (reactMatch && reactMatch[1].trim()) {
    return reactMatch[1].trim();
  }

  // Fallback Method: Extract from Markdown blocks
  const codeBlockRegex = /```(?:html|jsx|js|javascript|typescript|ts|react)?\s*([\s\S]*?)```/i;
  const match = text.match(codeBlockRegex);
  if (match && match[1].trim()) {
    return match[1].trim();
  }
  
  // Fallback: Return raw string
  return text.trim();
}

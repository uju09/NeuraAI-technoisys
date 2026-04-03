import * as parser from '@babel/parser';

export function analyzeCode(code) {
  try {
    parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    return { success: true, errors: [] };
  } catch (e) {
    return { success: false, errors: [e.message] };
  }
}

import { WebContainer } from '@webcontainer/api';
import { useStore } from '../store';

let webcontainerInstance = null;
let currentDevProcess = null;
let isBooting = false;
let bootPromise = null;
let mountCounter = 0;

/**
 * Pre-built Vite + React project template.
 * The generated component goes into src/GeneratedComponent.jsx
 * and is imported/rendered by a stable App.jsx wrapper.
 */
function buildProjectFiles(componentCode) {
  // Strip markdown fences the AI might wrap code in
  let cleaned = componentCode;
  cleaned = cleaned.replace(/^```(?:jsx?|tsx?|javascript|typescript)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  cleaned = cleaned.trim();

  return {
    'package.json': {
      file: {
        contents: JSON.stringify({
          name: 'preview-app',
          private: true,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite --host'
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            'lucide-react': '^0.300.0',
            'framer-motion': '^11.0.0',
            'recharts': '^2.10.0'
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.2.1',
            vite: '^5.0.12'
          }
        }, null, 2)
      }
    },

    'vite.config.js': {
      file: {
        contents: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3111,
    strictPort: false,
    hmr: { overlay: true }
  }
});
`
      }
    },

    'index.html': {
      file: {
        contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
              brand: {
                pink: '#FF0055',
                purple: '#7C3AED',
                blue: '#3B82F6',
              }
            },
            animation: {
              'fade-in': 'fadeIn 0.5s ease-out forwards',
              'slide-up': 'slideUp 0.5s ease-out forwards',
              'slide-down': 'slideDown 0.4s ease-out forwards',
              'scale-in': 'scaleIn 0.3s ease-out forwards',
              'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
            },
            keyframes: {
              fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
              },
              slideUp: {
                '0%': { opacity: '0', transform: 'translateY(20px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
              },
              slideDown: {
                '0%': { opacity: '0', transform: 'translateY(-10px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
              },
              scaleIn: {
                '0%': { opacity: '0', transform: 'scale(0.95)' },
                '100%': { opacity: '1', transform: 'scale(1)' },
              },
              pulseSoft: {
                '0%, 100%': { opacity: '1' },
                '50%': { opacity: '0.7' },
              },
            },
          }
        }
      }
    <\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <style>
      *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      body { background-color: #0A0A0F; color: white; }
      #root { min-height: 100vh; width: 100%; }
      /* Smooth scrollbar */
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"><\/script>
  </body>
</html>`
      }
    },

    src: {
      directory: {
        'main.jsx': {
          file: {
            contents: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
          }
        },

        // Stable App wrapper — imports the generated component with error boundary
        'App.jsx': {
          file: {
            contents: `import React from 'react';
import GeneratedComponent from './GeneratedComponent';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          fontFamily: 'monospace',
          color: '#ef4444',
          background: '#0f172a',
          minHeight: '100vh',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>⚠️ Render Error</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <pre style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <GeneratedComponent />
    </ErrorBoundary>
  );
}
`
          }
        },

        // The generated code goes here.
        // We handle multiple export patterns by re-exporting safely.
        'GeneratedComponent.jsx': {
          file: {
            contents: buildComponentWrapper(cleaned)
          }
        }
      }
    }
  };
}

/**
 * Wrap the generated code so it always has a valid default export.
 * Handles cases where the AI generates:
 *   - export default function Foo()    → works as-is
 *   - export default class Foo         → works as-is
 *   - function Foo() {} export default Foo  → works as-is
 *   - const Foo = () => {} export default Foo → works as-is
 *   - No export at all                → we find the component and export it
 */
function buildComponentWrapper(code) {
  // If code already has `export default`, use it directly
  if (/export\s+default\s/.test(code)) {
    return code;
  }

  // Try to find a function/class/const component declaration and export it
  // Look for: function ComponentName, const ComponentName, class ComponentName
  const funcMatch = code.match(/(?:function|class)\s+([A-Z][A-Za-z0-9]*)/);
  const constMatch = code.match(/(?:const|let|var)\s+([A-Z][A-Za-z0-9]*)\s*=/);
  const componentName = funcMatch?.[1] || constMatch?.[1];

  if (componentName) {
    return `${code}\n\nexport default ${componentName};\n`;
  }

  // Last resort: wrap entire code in a component
  return `import React from 'react';

function GeneratedComponent() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', color: '#94a3b8', background: '#0f172a', minHeight: '100vh' }}>
      <p>⚠️ Could not detect a valid React component in the generated code.</p>
      <pre style={{ marginTop: '1rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}</pre>
    </div>
  );
}

export default GeneratedComponent;
`;
}


export function useWebContainer() {
  const { setLoadingStep, setIframeUrl, iframeUrl, loadingStep } = useStore();

  /**
   * Boot the singleton WebContainer instance.
   * Returns the instance, de-duplicating concurrent boot calls.
   */
  async function ensureBooted() {
    if (webcontainerInstance) return webcontainerInstance;

    if (isBooting && bootPromise) return bootPromise;

    isBooting = true;
    bootPromise = WebContainer.boot().then((instance) => {
      webcontainerInstance = instance;
      isBooting = false;
      return instance;
    }).catch((err) => {
      isBooting = false;
      bootPromise = null;
      throw err;
    });

    return bootPromise;
  }

  /**
   * Kill the currently running dev server process.
   */
  async function teardownDevServer() {
    if (currentDevProcess) {
      try { currentDevProcess.kill(); } catch (_) {}
      currentDevProcess = null;
    }
  }

  /**
   * Mount the generated code, install deps, and start Vite.
   * On re-mount: kills old dev server, re-writes files, re-runs install+dev.
   */
  async function bootAndMount(code) {
    const thisMountId = ++mountCounter;

    try {
      setLoadingStep('building');
      setIframeUrl(null);

      // Tear down previous dev server
      await teardownDevServer();

      // Boot WebContainer (singleton)
      const wc = await ensureBooted();

      // Check if this mount is still current (user might have triggered another)
      if (thisMountId !== mountCounter) return;

      // Mount the complete project files
      const files = buildProjectFiles(code);
      await wc.mount(files);

      if (thisMountId !== mountCounter) return;

      // --- npm install ---
      console.log('[WebContainer] Running npm install...');
      const installProcess = await wc.spawn('npm', ['install']);

      // Log output
      installProcess.output.pipeTo(new WritableStream({
        write(chunk) {
          console.log('[npm install]', chunk);
        }
      })).catch(() => {});

      const installExit = await installProcess.exit;
      if (installExit !== 0) {
        console.error('[WebContainer] npm install failed, exit code:', installExit);
        setLoadingStep('idle');
        return;
      }

      if (thisMountId !== mountCounter) return;

      // --- Start Vite dev server ---
      console.log('[WebContainer] Starting Vite dev server...');
      currentDevProcess = await wc.spawn('npm', ['run', 'dev']);

      currentDevProcess.output.pipeTo(new WritableStream({
        write(chunk) {
          console.log('[vite]', chunk);
        }
      })).catch(() => {});

      // Listen for server-ready
      wc.on('server-ready', (port, url) => {
        if (thisMountId !== mountCounter) return; // stale listener guard
        console.log('[WebContainer] Server ready:', url, 'port:', port);
        setIframeUrl(url);
        setLoadingStep('ready');
      });

    } catch (err) {
      console.error('[WebContainer] Error:', err);
      if (thisMountId === mountCounter) {
        setLoadingStep('idle');
      }
    }
  }

  /**
   * Hot-update: If WebContainer is already running, just overwrite
   * the GeneratedComponent.jsx file without re-installing deps.
   */
  async function hotUpdate(code) {
    if (!webcontainerInstance) {
      return bootAndMount(code);
    }

    const thisMountId = ++mountCounter;

    try {
      setLoadingStep('building');

      let cleaned = code;
      cleaned = cleaned.replace(/^```(?:jsx?|tsx?|javascript|typescript)?\s*\n?/i, '');
      cleaned = cleaned.replace(/\n?```\s*$/i, '');
      cleaned = cleaned.trim();

      const wrappedCode = buildComponentWrapper(cleaned);

      await webcontainerInstance.fs.writeFile('/src/GeneratedComponent.jsx', wrappedCode);
      console.log('[WebContainer] Hot-updated GeneratedComponent.jsx');

      // Vite HMR should pick this up automatically
      // If not already ready, the server-ready listener will fire
      if (loadingStep === 'ready' || iframeUrl) {
        setLoadingStep('ready');
      }
    } catch (err) {
      console.error('[WebContainer] Hot update error:', err);
      // Fall back to full mount
      return bootAndMount(code);
    }
  }

  return {
    bootAndMount,
    hotUpdate,
    startWebContainer: bootAndMount,
    teardownDevServer,
    previewUrl: iframeUrl,
    isBooted: loadingStep === 'ready',
    isBuilding: loadingStep === 'building',
  };
}
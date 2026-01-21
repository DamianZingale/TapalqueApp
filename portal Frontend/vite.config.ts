/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'src/test/']
      }
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8090',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            bootstrap: ['bootstrap', 'react-bootstrap'],
            router: ['react-router-dom'],
            utils: ['axios', 'jwt-decode', 'react-datepicker', 'react-icons']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: mode === 'development'
    },
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __ENVIRONMENT__: JSON.stringify(mode)
    }
  };
});

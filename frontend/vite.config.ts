import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import http from 'http';

function checkServerAvailability(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, () => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.end();
  });
}

let targetUrl = 'http://localhost:8000';
(async () => {
  const isAvailable = await checkServerAvailability('http://localhost:8000');
  targetUrl = isAvailable ? 'http://localhost:8000' : '$backendUrl';
})();

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: targetUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/new-api': {
        target: 'https://studybuddy-q343o0bbe-sais-projects-fe74e6b2.vercel.app',
        changeOrigin: true,
      },
    },
  },
});

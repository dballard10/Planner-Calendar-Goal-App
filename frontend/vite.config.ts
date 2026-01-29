import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('@tabler/icons-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@lezer')) {
              return 'vendor-lezer';
            }
            if (id.includes('@codemirror') || id.includes('@uiw/react-codemirror')) {
              return 'vendor-codemirror';
            }
            if (id.includes('react-big-calendar')) {
              return 'vendor-calendar';
            }
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('unified') || id.includes('mdast') || id.includes('hast')) {
              return 'vendor-markdown';
            }
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
          }
        },
      },
    },
  },
  server: {
    proxy: {
      // Proxy /api requests to the Python backend
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      // Also proxy /health for convenience
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})

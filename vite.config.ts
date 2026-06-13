import path from 'path'
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to bypass Vite's host header validation for preview domains
function allowAllHostsPlugin(): Plugin {
  return {
    name: 'allow-all-hosts',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Rewrite Host header to localhost to bypass Vite's validation
        if (req.headers.host && req.headers.host.includes('.preview-hellofig.live')) {
          req.headers.host = 'localhost:5173'
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [allowAllHostsPlugin(), react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    hmr: {
      clientPort: 443
    }
  }
})

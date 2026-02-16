import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Disable SSL verification for development proxy
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use('/api/proxy', async (req, res, next) => {
          try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const targetUrl = url.searchParams.get('url');

            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url parameter');
              return;
            }

            console.log(`Proxying request to: ${targetUrl}`);

            // Read request body
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const body = Buffer.concat(buffers);

            // Prepare headers
            const headers = { ...req.headers };
            delete headers.host;
            delete headers['content-length'];

            const response = await fetch(targetUrl, {
              method: req.method,
              headers: headers,
              body: (req.method !== 'GET' && req.method !== 'HEAD') ? body : undefined,
            });

            // Copy key response headers
            response.headers.forEach((value, key) => {
              res.setHeader(key, value);
            });

            // Set CORS headers to allow everything
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-lang, x-application, x-client-name, x-device-id, x-device-type, x-client-version, x-device-model, x-os-version, x-build-version, x-build-no, x-is-mock');

            res.statusCode = response.status;

            const arrayBuffer = await response.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          } catch (error) {
            console.error('Proxy error:', error);
            res.statusCode = 500;
            res.end(`Proxy error: ${error.message}`);
          }
        });
      },
    },
  ],
})

import { defineConfig } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig(({mode}) => ({
  root,
  plugins: [{
    name: 'local-development-certificate',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/__dev/ca.crt') return next();
        const certificate = `${root}.runtime/https/ca.crt`;
        res.setHeader('Cache-Control', 'no-store');
        if (!existsSync(certificate)) { res.statusCode = 404; res.end('Execute npm run setup:https para gerar o certificado.'); return; }
        res.setHeader('Content-Type', 'application/x-x509-ca-cert');
        res.setHeader('Content-Disposition', 'attachment; filename="museu-vr-dev-ca.crt"');
        res.end(readFileSync(certificate));
      });
    },
  }],
  server: { allowedHosts: ['adjust-circus-pools-happiness.trycloudflare.com'], strictPort: true, fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.runtime/**'] }, ...(mode === 'https' ? { https: {
    key: readFileSync(`${root}.runtime/https/key.pem`),
    cert: readFileSync(`${root}.runtime/https/cert.pem`),
  } } : {}) },
  build: { emptyOutDir: false, rollupOptions: { input: {
    museum: `${root}index.html`,
    marie: `${root}sites/marie-curie/index.html`,
    hedy: `${root}sites/hedy-lamarr/index.html`,
    katherine: `${root}sites/katherine-johnson/index.html`,
  }, output: { manualChunks: id => id.includes('node_modules/three/') ? 'three' : undefined } }, chunkSizeWarningLimit: 650 },
}));

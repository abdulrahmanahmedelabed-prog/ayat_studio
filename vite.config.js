import { defineConfig } from 'vite';
// صفحتان: index.html صفحة الهبوط، و app.html التطبيق نفسه (يحمّله غلافا ويندوز وأندرويد مباشرة).
export default defineConfig({ base: './', build: { target: 'es2020', chunkSizeWarningLimit: 900, rollupOptions: { input: { index: 'index.html', app: 'app.html' } } } });

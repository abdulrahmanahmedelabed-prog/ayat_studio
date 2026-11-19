import { defineConfig } from 'vite';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const SITE = 'https://abdulrahmanahmedelabed-prog.github.io/ayat_studio/';

// ينشر version.json مع الموقع: تقرؤه نسخ ويندوز وأندرويد المثبّتة لتعرف بصدور نسخة أحدث.
const versionFile = () => ({
  name: 'version-json',
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({
      version: pkg.version, notes: pkg.releaseNotes || '',
      android: SITE + 'downloads/Mashhadaya-Android.apk',
      windows: 'https://github.com/abdulrahmanahmedelabed-prog/ayat_studio/releases/latest',
    }, null, 2) });
  },
});

// صفحتان: index.html صفحة الهبوط، و app.html التطبيق نفسه (يحمّله غلافا ويندوز وأندرويد مباشرة).
export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version), __UPDATE_URL__: JSON.stringify(SITE + 'version.json') },
  plugins: [versionFile()],
  build: { target: 'es2020', chunkSizeWarningLimit: 900, rollupOptions: { input: { index: 'index.html', app: 'app.html' } } },
});

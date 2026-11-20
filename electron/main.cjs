// نسخة سطح المكتب (ويندوز): نافذة واحدة تعرض التطبيق من بروتوكول محلي app://
const { app, BrowserWindow, protocol, net, shell, Menu, session, dialog } = require('electron');
const { execFile } = require('node:child_process');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const DIST = path.join(__dirname, '..', 'dist');
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 380, minHeight: 600, backgroundColor: '#0b1417', title: 'مَشهَدآية',
    icon: path.join(__dirname, 'icon.png'), autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) e.preventDefault(); });
  win.loadURL('app://mashhadaya/app.html');
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  protocol.handle('app', (req) => {
    const rel = decodeURIComponent(new URL(req.url).pathname).replace(/^\/+/, '') || 'app.html';
    const file = path.normalize(path.join(DIST, rel));
    if (!file.startsWith(DIST)) return new Response('forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  // الفيديو المحفوظ: Electron لا يرمّز H.264/AAC، فيُسجَّل WebM (VP9/Opus) ثم يُحوَّل هنا بـ ffmpeg إلى MP4 قياسي
  // يعمل صوته في كل المشغّلات (الهاتف، واتساب، ويندوز).
  session.defaultSession.on('will-download', (e, item, wc) => {
    let name = item.getFilename();
    if (!/\.(webm|mp4)$/i.test(name)) { if (!/^video\//.test(item.getMimeType())) return; name = 'mashhadaya-video.webm'; }
    const tmp = path.join(app.getPath('temp'), `mashhadaya-${Date.now()}-${name}`);
    item.setSavePath(tmp);
    item.once('done', async (ev, state) => {
      if (state !== 'completed') return;
      const win = BrowserWindow.fromWebContents(wc) || undefined;
      const { filePath, canceled } = await dialog.showSaveDialog(win, { title: 'حفظ الفيديو', defaultPath: path.join(app.getPath('videos'), name.replace(/\.(webm|mp4)$/i, '.mp4')), filters: [{ name: 'MP4', extensions: ['mp4'] }] });
      if (canceled || !filePath) return;
      let ff = null; try { ff = require('ffmpeg-static'); } catch { /* غير متوفر */ }
      if (ff) ff = ff.replace('app.asar', 'app.asar.unpacked');
      const args = ['-y', '-i', tmp, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', filePath];
      const finish = (err) => {
        if (err) { require('node:fs').copyFileSync(tmp, filePath.replace(/\.mp4$/i, '.webm')); dialog.showMessageBox(win, { type: 'warning', message: 'تعذّر التحويل إلى MP4، فحُفظ الفيديو بصيغة WebM.' }); }
        else dialog.showMessageBox(win, { type: 'info', message: 'حُفظ الفيديو بصيغة MP4.', detail: filePath });
        require('node:fs').rm(tmp, { force: true }, () => {});
      };
      if (!ff) return finish(new Error('no ffmpeg'));
      execFile(ff, args, { windowsHide: true }, finish);
    });
  });
  createWindow();
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());

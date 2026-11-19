// يبني نسخة ويندوز محمولة (zip) من لينكس دون wine: يحزم التطبيق ثم يضع الأيقونة وبيانات الإصدار بـ resedit.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import * as ResEdit from 'resedit';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
execFileSync('npx', ['electron-builder', '--win', 'dir', '--x64', '-c.win.signAndEditExecutable=false'], { stdio: 'inherit' });
const exePath = `release/win-unpacked/${pkg.build.productName}.exe`;
const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
const res = ResEdit.NtExecutableResource.from(exe);
const ico = ResEdit.Data.IconFile.from(fs.readFileSync('electron/icon.ico'));
for (const g of ResEdit.Resource.IconGroupEntry.fromEntries(res.entries))
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, g.id, g.lang, ico.icons.map((i) => i.data));
const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];
const [a, b, c] = pkg.version.split('.').map(Number);
vi.setFileVersion(a, b, c, 0); vi.setProductVersion(a, b, c, 0);
vi.setStringValues({ lang: 1033, codepage: 1200 }, { ProductName: pkg.build.productName, FileDescription: 'Mashhadaya — Quran Verses Studio', CompanyName: 'Mashhadaya', LegalCopyright: 'MIT', OriginalFilename: `${pkg.build.productName}.exe` });
vi.outputToResourceEntries(res.entries);
res.outputResource(exe);
fs.writeFileSync(exePath, Buffer.from(exe.generate()));
const zip = `Mashhadaya-Windows-x64-${pkg.version}.zip`;
fs.rmSync(`release/${zip}`, { force: true });
fs.renameSync('release/win-unpacked', 'release/Mashhadaya');
execFileSync('zip', ['-qr', '-9', zip, 'Mashhadaya'], { cwd: 'release', stdio: 'inherit' });
fs.renameSync('release/Mashhadaya', 'release/win-unpacked');
console.log('built release/' + zip);

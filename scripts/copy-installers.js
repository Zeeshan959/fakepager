import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigate up from scripts/ to project root
const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.join(rootDir, 'release');
const publicDir = path.join(rootDir, 'public');

const filesToCopy = [
  'Pagerlo-Setup.exe',
  'Pagerlo.dmg',
  'Pagerlo.AppImage'
];

console.log('--- Post-Build: Copying Installers to Public Folder ---');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

let copiedCount = 0;

filesToCopy.forEach(file => {
  const src = path.join(releaseDir, file);
  const dest = path.join(publicDir, file);

  if (fs.existsSync(src)) {
    try {
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied ${file} to public/`);
      copiedCount++;
    } catch (err) {
      console.error(`❌ Failed to copy ${file}:`, err);
    }
  }
});

if (copiedCount === 0) {
  console.log('⚠️ No installer files found in release/. This is normal if you only built for one platform.');
} else {
  console.log(`🎉 Successfully moved ${copiedCount} installer(s) to public/. Ready for deployment!`);
}

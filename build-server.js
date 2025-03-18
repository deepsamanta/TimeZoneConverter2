// Custom build script to improve bundling for Vercel
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure api directory exists in dist
const apiDistDir = path.join('dist', 'api');
if (!fs.existsSync(apiDistDir)) {
  fs.mkdirSync(apiDistDir, { recursive: true });
}

console.log('Building client...');
execSync('vite build', { stdio: 'inherit' });

console.log('Building server with improved configuration...');
execSync(
  'esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:./src/* --external:@shared/* --minify',
  { stdio: 'inherit' }
);

// Copy API files to dist folder
console.log('Copying API files to dist folder...');
const apiFiles = fs.readdirSync('api');
apiFiles.forEach(file => {
  const src = path.join('api', file);
  const dest = path.join('dist', 'api', file);
  fs.copyFileSync(src, dest);
});

console.log('Build completed successfully!');
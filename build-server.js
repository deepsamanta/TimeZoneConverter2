// Custom build script to improve bundling for Vercel
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure directories exist in dist
const apiDistDir = path.join('dist', 'api');
if (!fs.existsSync(apiDistDir)) {
  fs.mkdirSync(apiDistDir, { recursive: true });
}

// Clean up any existing server files to avoid contamination
console.log('Cleaning existing server files...');
if (fs.existsSync('dist/index.js')) {
  fs.unlinkSync('dist/index.js');
}

console.log('Building client...');
execSync('vite build', { stdio: 'inherit' });

// Don't bundle server code in client build for Vercel deployment
console.log('Skipping server bundling for Vercel deployment...');

// Instead of bundling server code, only copy API files
console.log('Copying API files to dist folder...');
const apiFiles = fs.readdirSync('api');
apiFiles.forEach(file => {
  const src = path.join('api', file);
  const dest = path.join('dist', 'api', file);
  fs.copyFileSync(src, dest);
});

// Create empty index.js in dist to satisfy Vercel
fs.writeFileSync('dist/index.js', '// This file is intentionally empty for Vercel deployment\n');

console.log('Build completed successfully!');
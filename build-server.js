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

// Create a simple index.js for Vercel that serves the static site
console.log('Creating minimal entry point for Vercel...');
fs.writeFileSync('dist/index.js', `
// This is a minimal server file for Vercel deployment
// It's only used during local preview, as Vercel uses its own routing

// In Vercel deployments, this file is not actually used for routing
// Instead, Vercel uses the configuration in vercel.json
// This file just satisfies Vercel's requirement for an entry point
export default function handler(req, res) {
  // This function should never be called in production
  // as Vercel will handle routing via vercel.json configuration
  res.status(200).end('Timezone Converter is running!');
}
`);

console.log('Build completed successfully!');
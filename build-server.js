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

// Create a proper index.js for Vercel
console.log('Creating entry point for Vercel...');
fs.writeFileSync('dist/index.js', `
// This file routes all requests to the Vite client bundle
// No server-side code is executed here for security
import { createServer } from 'http';
import { join } from 'path';
import { readFileSync } from 'fs';

const PORT = process.env.PORT || 3000;
const indexHTML = readFileSync(join(__dirname, 'index.html'), 'utf-8');

createServer((req, res) => {
  // API requests are handled by Vercel serverless functions
  if (req.url.startsWith('/api/')) {
    res.statusCode = 404;
    res.end('API endpoints are handled by Vercel Functions');
    return;
  }

  // Serve the index.html for all other requests (SPA routing)
  res.setHeader('Content-Type', 'text/html');
  res.end(indexHTML);
}).listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`);

console.log('Build completed successfully!');
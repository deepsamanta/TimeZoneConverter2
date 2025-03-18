// Root API handler for Vercel
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());

// Enable CORS - Using CORS logic from original code, but expanding allowed methods
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT'); // Expanded allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

registerRoutes(app);

export default app;
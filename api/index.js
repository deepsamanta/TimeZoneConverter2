// Root API handler for Vercel - API Documentation and Health Check
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add server timestamp for health checks
  const serverTime = new Date().toISOString();
  
  // Return API information
  return res.status(200).json({
    name: 'Timezone Converter API',
    version: '1.0.0',
    status: 'operational',
    serverTime,
    environment: process.env.NODE_ENV || 'development',
    endpoints: [
      { path: '/api/timezones', methods: ['GET'], description: 'Get list of supported timezones' },
      { path: '/api/favorites', methods: ['GET', 'POST', 'DELETE'], description: 'Manage favorite timezone conversions' },
      { path: '/api/conversions', methods: ['GET', 'POST', 'DELETE'], description: 'Manage conversion history' }
    ],
    documentation: {
      description: 'This API provides timezone conversion services with persistent storage for favorites and conversion history',
      author: 'Timezone Converter Team',
      lastUpdated: '2025-03-18'
    }
  });
}
// Root API handler for Vercel
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
  
  // Return API information
  return res.status(200).json({
    name: 'Timezone Converter API',
    version: '1.0.0',
    endpoints: [
      { path: '/api/timezones', methods: ['GET'], description: 'Get list of supported timezones' },
      { path: '/api/favorites', methods: ['GET', 'POST', 'DELETE'], description: 'Manage favorite timezone conversions' },
      { path: '/api/conversions', methods: ['GET', 'POST', 'DELETE'], description: 'Manage conversion history' }
    ]
  });
}
// API handler for conversions
// Use in-memory storage for serverless functions
let conversions = [];
let nextId = 1;

export default async function handler(req, res) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Handle GET request
    if (req.method === 'GET') {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const limitedConversions = limit ? conversions.slice(0, limit) : conversions;
      return res.status(200).json(limitedConversions);
    }
    
    // Handle POST request
    if (req.method === 'POST') {
      const newConversion = {
        id: nextId++,
        sourceTimezone: req.body.sourceTimezone,
        targetTimezone: req.body.targetTimezone,
        sourceTime: req.body.sourceTime,
        targetTime: req.body.targetTime,
        date: req.body.date,
        createdAt: new Date().toISOString()
      };
      
      // Add to the beginning of the array (for most recent first)
      conversions.unshift(newConversion);
      
      // Keep only the latest 50 conversions
      if (conversions.length > 50) {
        conversions = conversions.slice(0, 50);
      }
      
      return res.status(201).json(newConversion);
    }
    
    // Handle DELETE request (clear all conversions)
    if (req.method === 'DELETE') {
      conversions = [];
      return res.status(200).json({ success: true });
    }
    
    // If none of the above methods match
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling conversions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
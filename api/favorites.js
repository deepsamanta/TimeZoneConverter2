// API handler for favorites
// Use in-memory storage for serverless functions
let favorites = [];
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
      return res.status(200).json(favorites);
    }
    
    // Handle POST request
    if (req.method === 'POST') {
      const newFavorite = {
        id: nextId++,
        sourceTimezone: req.body.sourceTimezone,
        targetTimezone: req.body.targetTimezone,
        name: req.body.name,
        createdAt: new Date().toISOString()
      };
      
      favorites.push(newFavorite);
      return res.status(201).json(newFavorite);
    }
    
    // Handle DELETE request
    if (req.method === 'DELETE') {
      const id = parseInt(req.query.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      
      const index = favorites.findIndex(f => f.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Favorite not found' });
      }
      
      favorites.splice(index, 1);
      return res.status(200).json({ success: true });
    }
    
    // If none of the above methods match
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling favorites:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
// API handler for conversions
// Use in-memory storage for serverless functions with persistence
import { Storage } from './_storage';

// Initialize storage outside handler to maintain state between invocations in the same instance
const storage = new Storage();

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
      const conversions = storage.getConversions(limit);
      return res.status(200).json(conversions);
    }
    
    // Handle POST request
    if (req.method === 'POST') {
      const newConversion = storage.createConversion({
        sourceTimezone: req.body.sourceTimezone,
        targetTimezone: req.body.targetTimezone,
        sourceTime: req.body.sourceTime,
        targetTime: req.body.targetTime,
        date: req.body.date
      });
      
      return res.status(201).json(newConversion);
    }
    
    // Handle DELETE request (clear all conversions)
    if (req.method === 'DELETE') {
      storage.clearConversions();
      return res.status(200).json({ success: true });
    }
    
    // If none of the above methods match
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling conversions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
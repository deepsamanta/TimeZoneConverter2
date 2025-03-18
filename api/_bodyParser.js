// Helper for parsing JSON request bodies in API routes

/**
 * Parse the request body into a JSON object
 * This is needed because Vercel serverless functions don't 
 * automatically parse JSON bodies like Express does
 */
export async function parseRequestBody(req) {
  return new Promise((resolve) => {
    if (!req.body) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        if (body) {
          try {
            const parsedBody = JSON.parse(body);
            req.body = parsedBody;
            resolve(parsedBody);
          } catch (e) {
            req.body = {};
            resolve({});
          }
        } else {
          req.body = {};
          resolve({});
        }
      });
    } else {
      resolve(req.body);
    }
  });
}
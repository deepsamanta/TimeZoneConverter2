// Shared storage for serverless functions
// This acts as a simple in-memory database for Vercel serverless functions

// Avoid depending on any server-side types to prevent bundling issues
// Define simple self-contained type definitions here

/**
 * Standalone storage implementation for Vercel serverless functions
 * This implementation avoids any imports from the main codebase
 * to prevent code exposure in client bundles
 */
export class Storage {
  // These properties are declared here to avoid TypeScript errors
  favorites;
  conversions;
  nextFavoriteId;
  nextConversionId;
  
  constructor() {
    // Use global for stateful storage in serverless environment
    // This works because Vercel may reuse the same serverless instance for multiple invocations
    if (!global._timezoneAppState) {
      global._timezoneAppState = {
        favorites: [],
        conversions: [],
        nextFavoriteId: 1,
        nextConversionId: 1
      };
    }
    
    // Cache references to global state
    this.state = global._timezoneAppState;
    this.favorites = this.state.favorites;
    this.conversions = this.state.conversions;
    this.nextFavoriteId = this.state.nextFavoriteId;
    this.nextConversionId = this.state.nextConversionId;
  }
  
  // Favorite methods
  getFavorites() {
    return [...this.favorites].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  createFavorite(favoriteData) {
    const id = this.state.nextFavoriteId++;
    const createdAt = new Date().toISOString();
    const newFavorite = { ...favoriteData, id, createdAt };
    
    this.favorites.push(newFavorite);
    return newFavorite;
  }
  
  deleteFavorite(id) {
    const index = this.favorites.findIndex(f => f.id === id);
    if (index === -1) return false;
    
    this.favorites.splice(index, 1);
    return true;
  }
  
  // Conversion methods
  getConversions(limit = 10) {
    return [...this.conversions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  createConversion(conversionData) {
    const id = this.state.nextConversionId++;
    const createdAt = new Date().toISOString();
    const newConversion = { ...conversionData, id, createdAt };
    
    // Add to the beginning for most recent first
    this.conversions.unshift(newConversion);
    
    // Keep only the latest 50 conversions
    if (this.conversions.length > 50) {
      this.conversions = this.conversions.slice(0, 50);
    }
    
    return newConversion;
  }
  
  clearConversions() {
    this.conversions = [];
    return true;
  }
}
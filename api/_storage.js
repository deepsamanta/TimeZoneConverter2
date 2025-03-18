// Shared storage for serverless functions
// This acts as a simple in-memory database for Vercel serverless functions

export class Storage {
  constructor() {
    // Only initialize if not already initialized (to maintain state between function calls)
    this.favorites = global._favorites || [];
    this.conversions = global._conversions || [];
    this.nextFavoriteId = global._nextFavoriteId || 1;
    this.nextConversionId = global._nextConversionId || 1;
    
    // Store on the global object to persist between function invocations
    // on the same serverless instance
    global._favorites = this.favorites;
    global._conversions = this.conversions;
    global._nextFavoriteId = this.nextFavoriteId;
    global._nextConversionId = this.nextConversionId;
  }
  
  // Favorite methods
  getFavorites() {
    return [...this.favorites].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  createFavorite(favoriteData) {
    const id = global._nextFavoriteId++;
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
    const id = global._nextConversionId++;
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
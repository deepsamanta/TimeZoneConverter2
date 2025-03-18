import { 
  type User, 
  type InsertUser, 
  type Favorite, 
  type InsertFavorite,
  type Conversion,
  type InsertConversion
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Favorites
  getFavorites(): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<boolean>;
  
  // Conversions History
  getConversions(limit?: number): Promise<Conversion[]>;
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  clearConversions(): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private favoritesMap: Map<number, Favorite>;
  private conversionsMap: Map<number, Conversion>;
  userCurrentId: number;
  favoriteCurrentId: number;
  conversionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.favoritesMap = new Map();
    this.conversionsMap = new Map();
    this.userCurrentId = 1;
    this.favoriteCurrentId = 1;
    this.conversionCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Favorites Implementation
  async getFavorites(): Promise<Favorite[]> {
    return Array.from(this.favoritesMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteCurrentId++;
    const createdAt = new Date();
    const favorite: Favorite = { ...insertFavorite, id, createdAt };
    this.favoritesMap.set(id, favorite);
    return favorite;
  }
  
  async deleteFavorite(id: number): Promise<boolean> {
    return this.favoritesMap.delete(id);
  }
  
  // Conversions History Implementation
  async getConversions(limit = 10): Promise<Conversion[]> {
    return Array.from(this.conversionsMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  
  async createConversion(insertConversion: InsertConversion): Promise<Conversion> {
    const id = this.conversionCurrentId++;
    const createdAt = new Date();
    const conversion: Conversion = { ...insertConversion, id, createdAt };
    this.conversionsMap.set(id, conversion);
    return conversion;
  }
  
  async clearConversions(): Promise<boolean> {
    this.conversionsMap.clear();
    return true;
  }
}

export const storage = new MemStorage();

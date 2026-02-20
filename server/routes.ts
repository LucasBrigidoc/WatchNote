import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { insertFavoriteSchema, insertRatingSchema, insertListSchema, insertListItemSchema, insertPostSchema } from "@shared/schema";

const tokens = new Map<string, string>();

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function sanitizeUser(user: any) {
  const { password, ...safe } = user;
  return safe;
}

function getUserIdFromToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  return tokens.get(token) || null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Nome, email e senha são obrigatórios" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Este email já está em uso" });
      }

      const username = email.split("@")[0] + "_" + Date.now().toString(36);
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        name,
      });

      const token = generateToken();
      tokens.set(token, user.id);

      res.status(201).json({ user: sanitizeUser(user), token });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Erro ao criar conta" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }

      const token = generateToken();
      tokens.set(token, user.id);

      res.json({ user: sanitizeUser(user), token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const token = authHeader.split(" ")[1];
      const userId = tokens.get(token);
      if (!userId) {
        return res.status(401).json({ message: "Token inválido" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error("Auth me error:", error);
      res.status(500).json({ message: "Erro ao verificar autenticação" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      tokens.delete(token);
    }
    res.json({ message: "Desconectado com sucesso" });
  });

  // ---- Profile: Update Bio ----
  app.put("/api/profile/bio", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const { bio } = req.body;
      if (typeof bio !== "string") return res.status(400).json({ message: "Bio inválida" });
      const user = await storage.updateUserBio(userId, bio);
      if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
      res.json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error("Update bio error:", error);
      res.status(500).json({ message: "Erro ao atualizar bio" });
    }
  });

  // ---- Favorites ----
  app.get("/api/profile/favorites", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const favorites = await storage.getFavorites(userId);
      res.json({ favorites });
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ message: "Erro ao buscar favoritos" });
    }
  });

  app.put("/api/profile/favorites", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const parsed = insertFavoriteSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos" });
      const { category, title, mediaId, mediaImage } = parsed.data;
      const favorite = await storage.setFavorite(userId, category, title, mediaId, mediaImage);
      res.json({ favorite });
    } catch (error) {
      console.error("Set favorite error:", error);
      res.status(500).json({ message: "Erro ao salvar favorito" });
    }
  });

  app.delete("/api/profile/favorites/:category", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      await storage.deleteFavorite(userId, req.params.category as string);
      res.json({ message: "Favorito removido" });
    } catch (error) {
      console.error("Delete favorite error:", error);
      res.status(500).json({ message: "Erro ao remover favorito" });
    }
  });

  // ---- Ratings ----
  app.get("/api/profile/ratings", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const ratings = await storage.getRatings(userId);
      res.json({ ratings });
    } catch (error) {
      console.error("Get ratings error:", error);
      res.status(500).json({ message: "Erro ao buscar avaliações" });
    }
  });

  app.post("/api/profile/ratings", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const parsed = insertRatingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      const rating = await storage.upsertRating(userId, parsed.data);
      res.json({ rating });
    } catch (error) {
      console.error("Upsert rating error:", error);
      res.status(500).json({ message: "Erro ao salvar avaliação" });
    }
  });

  app.delete("/api/profile/ratings/:mediaType/:mediaId", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      await storage.deleteRating(userId, req.params.mediaId as string, req.params.mediaType as string);
      res.json({ message: "Avaliação removida" });
    } catch (error) {
      console.error("Delete rating error:", error);
      res.status(500).json({ message: "Erro ao remover avaliação" });
    }
  });

  // ---- Profile Stats (ratings distribution + category counts) ----
  app.get("/api/profile/stats", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const stats = await storage.getRatingStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // ---- Lists ----
  app.get("/api/profile/lists", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const lists = await storage.getLists(userId);
      res.json({ lists });
    } catch (error) {
      console.error("Get lists error:", error);
      res.status(500).json({ message: "Erro ao buscar listas" });
    }
  });

  app.post("/api/profile/lists", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const parsed = insertListSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos" });
      const list = await storage.createList(userId, parsed.data.name, parsed.data.coverImage);
      res.status(201).json({ list });
    } catch (error) {
      console.error("Create list error:", error);
      res.status(500).json({ message: "Erro ao criar lista" });
    }
  });

  app.get("/api/profile/lists/:listId", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const list = await storage.getListById(req.params.listId as string);
      if (!list || list.userId !== userId) return res.status(404).json({ message: "Lista não encontrada" });
      const items = await storage.getListItems(list.id);
      res.json({ list, items });
    } catch (error) {
      console.error("Get list detail error:", error);
      res.status(500).json({ message: "Erro ao buscar lista" });
    }
  });

  app.patch("/api/profile/lists/:listId", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const { name, description, coverImage } = req.body;
      const list = await storage.updateList(userId, req.params.listId as string, { name, description, coverImage });
      if (!list) return res.status(404).json({ message: "Lista não encontrada" });
      res.json({ list });
    } catch (error) {
      console.error("Update list error:", error);
      res.status(500).json({ message: "Erro ao atualizar lista" });
    }
  });

  app.delete("/api/profile/lists/:listId", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      await storage.deleteList(userId, req.params.listId as string);
      res.json({ message: "Lista removida" });
    } catch (error) {
      console.error("Delete list error:", error);
      res.status(500).json({ message: "Erro ao remover lista" });
    }
  });

  app.get("/api/profile/lists/:listId/items", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const list = await storage.getListById(req.params.listId as string);
      if (!list || list.userId !== userId) return res.status(404).json({ message: "Lista não encontrada" });
      const items = await storage.getListItems(list.id);
      res.json({ items });
    } catch (error) {
      console.error("Get list items error:", error);
      res.status(500).json({ message: "Erro ao buscar itens da lista" });
    }
  });

  app.post("/api/profile/lists/:listId/items", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const list = await storage.getListById(req.params.listId as string);
      if (!list || list.userId !== userId) return res.status(404).json({ message: "Lista não encontrada" });
      const parsed = insertListItemSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos" });
      const item = await storage.addListItem(list.id, parsed.data);
      res.status(201).json({ item });
    } catch (error) {
      console.error("Add list item error:", error);
      res.status(500).json({ message: "Erro ao adicionar item" });
    }
  });

  app.delete("/api/profile/lists/:listId/items/:itemId", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const list = await storage.getListById(req.params.listId as string);
      if (!list || list.userId !== userId) return res.status(404).json({ message: "Lista não encontrada" });
      await storage.removeListItem(req.params.itemId as string);
      res.json({ message: "Item removido" });
    } catch (error) {
      console.error("Remove list item error:", error);
      res.status(500).json({ message: "Erro ao remover item" });
    }
  });

  // ---- Posts ----
  app.post("/api/posts", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const parsed = insertPostSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });

      const existing = await storage.findPostByUserAndMedia(userId, parsed.data.mediaId, parsed.data.mediaType);
      if (existing) {
        return res.status(409).json({ message: "Você já avaliou essa mídia" });
      }

      const post = await storage.createPost(userId, parsed.data);

      await storage.upsertRating(userId, {
        mediaId: parsed.data.mediaId,
        mediaType: parsed.data.mediaType,
        mediaTitle: parsed.data.mediaTitle,
        mediaImage: parsed.data.mediaImage,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      });

      if (parsed.data.isFavorite) {
        await storage.setFavorite(userId, parsed.data.mediaType, parsed.data.mediaTitle, parsed.data.mediaId, parsed.data.mediaImage);
      }
      res.status(201).json({ post });
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ message: "Erro ao criar post" });
    }
  });

  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const allPosts = await storage.getAllPosts();
      res.json({ posts: allPosts });
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ message: "Erro ao buscar posts" });
    }
  });

  app.get("/api/posts/user", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const userPosts = await storage.getUserPosts(userId);
      res.json({ posts: userPosts });
    } catch (error) {
      console.error("Get user posts error:", error);
      res.status(500).json({ message: "Erro ao buscar posts do usuário" });
    }
  });

  // ---- Search Users & Lists ----
  app.get("/api/search/users", async (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string) || "";
      if (q.length < 2) return res.json({ users: [] });
      const results = await storage.searchUsers(q);
      res.json({ users: results });
    } catch (error) {
      console.error("Search users error:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  app.get("/api/search/lists", async (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string) || "";
      if (q.length < 2) return res.json({ lists: [] });
      const results = await storage.searchLists(q);
      res.json({ lists: results });
    } catch (error) {
      console.error("Search lists error:", error);
      res.status(500).json({ message: "Erro ao buscar listas" });
    }
  });

  // ---- Follow/Unfollow ----
  app.post("/api/users/:userId/follow", async (req: Request, res: Response) => {
    try {
      const followerId = getUserIdFromToken(req);
      if (!followerId) return res.status(401).json({ message: "Não autenticado" });
      const followingId = req.params.userId;
      if (followerId === followingId) return res.status(400).json({ message: "Você não pode seguir a si mesmo" });
      await storage.followUser(followerId, followingId);
      res.json({ message: "Seguindo" });
    } catch (error) {
      console.error("Follow error:", error);
      res.status(500).json({ message: "Erro ao seguir" });
    }
  });

  app.delete("/api/users/:userId/follow", async (req: Request, res: Response) => {
    try {
      const followerId = getUserIdFromToken(req);
      if (!followerId) return res.status(401).json({ message: "Não autenticado" });
      await storage.unfollowUser(followerId, req.params.userId);
      res.json({ message: "Deixou de seguir" });
    } catch (error) {
      console.error("Unfollow error:", error);
      res.status(500).json({ message: "Erro ao deixar de seguir" });
    }
  });

  // ---- Public Profile ----
  app.get("/api/users/:userId/profile", async (req: Request, res: Response) => {
    try {
      const viewerId = getUserIdFromToken(req);
      const targetId = req.params.userId;
      const profile = await storage.getPublicProfile(targetId);
      const followerCount = await storage.getFollowerCount(targetId);
      const followingCount = await storage.getFollowingCount(targetId);
      const isFollowing = viewerId ? await storage.isFollowing(viewerId, targetId) : false;
      res.json({ ...profile, followerCount, followingCount, isFollowing });
    } catch (error: any) {
      if (error.message === "User not found") return res.status(404).json({ message: "Usuário não encontrado" });
      console.error("Public profile error:", error);
      res.status(500).json({ message: "Erro ao buscar perfil" });
    }
  });

  // ---- Own follow counts ----
  app.get("/api/profile/follow-counts", async (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) return res.status(401).json({ message: "Não autenticado" });
      const followerCount = await storage.getFollowerCount(userId);
      const followingCount = await storage.getFollowingCount(userId);
      res.json({ followerCount, followingCount });
    } catch (error) {
      console.error("Follow counts error:", error);
      res.status(500).json({ message: "Erro ao buscar contagem" });
    }
  });

  app.get("/api/movies/trending", async (req, res) => {
    try {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=pt-BR`
      );

      if (!response.ok) {
        throw new Error(`TMDB API responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching from TMDB:", error);
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/search", async (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    try {
      const apiKey = process.env.TMDB_API_KEY;
      const response = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
          query as string
        )}&language=pt-BR`
      );

      if (!response.ok) {
        throw new Error(`TMDB API responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching TMDB:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  app.get("/api/books/search", async (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    try {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          query as string
        )}&key=${apiKey}&maxResults=20`
      );

      if (!response.ok) {
        throw new Error(`Google Books API responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching Google Books:", error);
      res.status(500).json({ message: "Failed to search books" });
    }
  });

  app.get("/api/music/search", async (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    try {
      const response = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(query as string)}`
      );

      if (!response.ok) {
        throw new Error(`Deezer API responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching Deezer:", error);
      res.status(500).json({ message: "Failed to search music" });
    }
  });

  app.get("/api/anime/search", async (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query as string)}&limit=20`
      );

      if (!response.ok) {
        throw new Error(`Jikan API responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching Jikan:", error);
      res.status(500).json({ message: "Failed to search anime" });
    }
  });

  app.get("/api/manga/search", async (req, res) => {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query as string)}&limit=20`
      );

      if (!response.ok) {
        throw new Error(`Jikan API (Manga) responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching Jikan Manga:", error);
      res.status(500).json({ message: "Failed to search manga" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

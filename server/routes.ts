import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { storage } from "./storage";

const tokens = new Map<string, string>();

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function sanitizeUser(user: any) {
  const { password, ...safe } = user;
  return safe;
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

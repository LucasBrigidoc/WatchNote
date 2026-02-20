import {
  type User, type InsertUser, users,
  type UserFavorite, userFavorites,
  type UserRating, userRatings,
  type UserList, userLists,
  type UserListItem, userListItems,
  type Post, posts,
  type Follow, follows,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, ilike, or, ne, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBio(userId: string, bio: string): Promise<User | undefined>;

  getFavorites(userId: string): Promise<UserFavorite[]>;
  setFavorite(userId: string, category: string, title: string, mediaId?: string, mediaImage?: string): Promise<UserFavorite>;
  deleteFavorite(userId: string, category: string): Promise<void>;

  getRatings(userId: string): Promise<UserRating[]>;
  upsertRating(userId: string, data: { mediaId: string; mediaType: string; mediaTitle: string; mediaImage?: string; rating: number; comment?: string }): Promise<UserRating>;
  deleteRating(userId: string, mediaId: string, mediaType: string): Promise<void>;
  getRatingStats(userId: string): Promise<{ distribution: { stars: number; count: number }[]; categoryStats: { category: string; count: number }[] }>;

  getLists(userId: string): Promise<(UserList & { itemCount: number })[]>;
  getListById(listId: string): Promise<UserList | null>;
  createList(userId: string, name: string, coverImage?: string, description?: string): Promise<UserList>;
  updateList(userId: string, listId: string, data: { name?: string; description?: string; coverImage?: string }): Promise<UserList | null>;
  deleteList(userId: string, listId: string): Promise<void>;
  getListItems(listId: string): Promise<UserListItem[]>;
  addListItem(listId: string, data: { mediaId: string; mediaType: string; mediaTitle: string; mediaImage?: string }): Promise<UserListItem>;
  removeListItem(itemId: string): Promise<void>;

  findPostByUserAndMedia(userId: string, mediaId: string, mediaType: string): Promise<Post | null>;
  createPost(userId: string, data: { mediaId: string; mediaType: string; mediaTitle: string; mediaImage?: string; rating: number; comment: string; isFavorite?: boolean; firstTime?: boolean; hasSpoilers?: boolean }): Promise<Post>;
  getUserPosts(userId: string): Promise<(Post & { userName: string; userAvatar: string | null })[]>;
  getAllPosts(): Promise<(Post & { userName: string; userAvatar: string | null })[]>;

  searchUsers(query: string): Promise<{ id: string; name: string; username: string; avatarUrl: string | null; bio: string | null }[]>;
  searchLists(query: string): Promise<{ id: string; name: string; coverImage: string | null; itemCount: number; userName: string; userId: string }[]>;
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowerCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
  getPublicProfile(userId: string): Promise<{ user: any; favorites: UserFavorite[]; stats: any; posts: any[]; listCount: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserBio(userId: string, bio: string): Promise<User | undefined> {
    const result = await db.update(users).set({ bio }).where(eq(users.id, userId)).returning();
    return result[0];
  }

  async getFavorites(userId: string): Promise<UserFavorite[]> {
    return db.select().from(userFavorites).where(eq(userFavorites.userId, userId));
  }

  async setFavorite(userId: string, category: string, title: string, mediaId?: string, mediaImage?: string): Promise<UserFavorite> {
    const existing = await db.select().from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.category, category)));

    if (existing.length > 0) {
      const result = await db.update(userFavorites)
        .set({ title, mediaId: mediaId || null, mediaImage: mediaImage || null })
        .where(and(eq(userFavorites.userId, userId), eq(userFavorites.category, category)))
        .returning();
      return result[0];
    }

    const result = await db.insert(userFavorites)
      .values({ userId, category, title, mediaId: mediaId || null, mediaImage: mediaImage || null })
      .returning();
    return result[0];
  }

  async deleteFavorite(userId: string, category: string): Promise<void> {
    await db.delete(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.category, category)));
  }

  async getRatings(userId: string): Promise<UserRating[]> {
    return db.select().from(userRatings).where(eq(userRatings.userId, userId));
  }

  async upsertRating(userId: string, data: { mediaId: string; mediaType: string; mediaTitle: string; mediaImage?: string; rating: number; comment?: string }): Promise<UserRating> {
    const existing = await db.select().from(userRatings)
      .where(and(
        eq(userRatings.userId, userId),
        eq(userRatings.mediaId, data.mediaId),
        eq(userRatings.mediaType, data.mediaType)
      ));

    if (existing.length > 0) {
      const result = await db.update(userRatings)
        .set({ rating: data.rating, comment: data.comment || "", mediaTitle: data.mediaTitle, mediaImage: data.mediaImage || null })
        .where(and(
          eq(userRatings.userId, userId),
          eq(userRatings.mediaId, data.mediaId),
          eq(userRatings.mediaType, data.mediaType)
        ))
        .returning();
      return result[0];
    }

    const result = await db.insert(userRatings)
      .values({
        userId,
        mediaId: data.mediaId,
        mediaType: data.mediaType,
        mediaTitle: data.mediaTitle,
        mediaImage: data.mediaImage || null,
        rating: data.rating,
        comment: data.comment || "",
      })
      .returning();
    return result[0];
  }

  async deleteRating(userId: string, mediaId: string, mediaType: string): Promise<void> {
    await db.delete(userRatings)
      .where(and(
        eq(userRatings.userId, userId),
        eq(userRatings.mediaId, mediaId),
        eq(userRatings.mediaType, mediaType)
      ));
  }

  async getRatingStats(userId: string): Promise<{ distribution: { stars: number; count: number }[]; categoryStats: { category: string; count: number }[] }> {
    const allRatings = await db.select().from(userRatings).where(eq(userRatings.userId, userId));

    const distMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const catMap: Record<string, number> = {};

    for (const r of allRatings) {
      distMap[r.rating] = (distMap[r.rating] || 0) + 1;
      catMap[r.mediaType] = (catMap[r.mediaType] || 0) + 1;
    }

    const distribution = [5, 4, 3, 2, 1].map(stars => ({ stars, count: distMap[stars] || 0 }));
    const categoryStats = Object.entries(catMap).map(([category, count]) => ({ category, count }));

    return { distribution, categoryStats };
  }

  async getLists(userId: string): Promise<(UserList & { itemCount: number })[]> {
    const lists = await db.select().from(userLists).where(eq(userLists.userId, userId));
    const result: (UserList & { itemCount: number })[] = [];

    for (const list of lists) {
      const items = await db.select({ count: sql<number>`count(*)` })
        .from(userListItems)
        .where(eq(userListItems.listId, list.id));
      result.push({ ...list, itemCount: Number(items[0]?.count || 0) });
    }

    return result;
  }

  async getListById(listId: string): Promise<UserList | null> {
    const result = await db.select().from(userLists).where(eq(userLists.id, listId));
    return result[0] || null;
  }

  async createList(userId: string, name: string, coverImage?: string, description?: string): Promise<UserList> {
    const result = await db.insert(userLists).values({ userId, name, coverImage: coverImage || null, description: description || "" }).returning();
    return result[0];
  }

  async updateList(userId: string, listId: string, data: { name?: string; description?: string; coverImage?: string }): Promise<UserList | null> {
    const updates: Record<string, any> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.coverImage !== undefined) updates.coverImage = data.coverImage;
    if (Object.keys(updates).length === 0) return this.getListById(listId);
    const result = await db.update(userLists)
      .set(updates)
      .where(and(eq(userLists.id, listId), eq(userLists.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async deleteList(userId: string, listId: string): Promise<void> {
    await db.delete(userListItems).where(eq(userListItems.listId, listId));
    await db.delete(userLists)
      .where(and(eq(userLists.id, listId), eq(userLists.userId, userId)));
  }

  async getListItems(listId: string): Promise<UserListItem[]> {
    return db.select().from(userListItems).where(eq(userListItems.listId, listId));
  }

  async addListItem(listId: string, data: { mediaId: string; mediaType: string; mediaTitle: string; mediaImage?: string }): Promise<UserListItem> {
    const result = await db.insert(userListItems)
      .values({
        listId,
        mediaId: data.mediaId,
        mediaType: data.mediaType,
        mediaTitle: data.mediaTitle,
        mediaImage: data.mediaImage || null,
      })
      .returning();
    return result[0];
  }

  async removeListItem(itemId: string): Promise<void> {
    await db.delete(userListItems).where(eq(userListItems.id, itemId));
  }

  async findPostByUserAndMedia(userId: string, mediaId: string, mediaType: string): Promise<Post | null> {
    const result = await db.select().from(posts).where(
      and(eq(posts.userId, userId), eq(posts.mediaId, mediaId), eq(posts.mediaType, mediaType))
    );
    return result[0] || null;
  }

  async createPost(userId: string, data: { mediaId: string; mediaType: string; mediaTitle: string; mediaImage?: string; rating: number; comment: string; isFavorite?: boolean; firstTime?: boolean; hasSpoilers?: boolean }): Promise<Post> {
    const result = await db.insert(posts).values({
      userId,
      mediaId: data.mediaId,
      mediaType: data.mediaType,
      mediaTitle: data.mediaTitle,
      mediaImage: data.mediaImage || null,
      rating: data.rating,
      comment: data.comment,
      isFavorite: data.isFavorite || false,
      firstTime: data.firstTime ?? true,
      hasSpoilers: data.hasSpoilers || false,
    }).returning();
    return result[0];
  }

  async getUserPosts(userId: string): Promise<(Post & { userName: string; userAvatar: string | null })[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        mediaId: posts.mediaId,
        mediaType: posts.mediaType,
        mediaTitle: posts.mediaTitle,
        mediaImage: posts.mediaImage,
        rating: posts.rating,
        comment: posts.comment,
        isFavorite: posts.isFavorite,
        firstTime: posts.firstTime,
        hasSpoilers: posts.hasSpoilers,
        likeCount: posts.likeCount,
        commentCount: posts.commentCount,
        createdAt: posts.createdAt,
        userName: users.name,
        userAvatar: users.avatarUrl,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
    return result;
  }

  async getAllPosts(): Promise<(Post & { userName: string; userAvatar: string | null })[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        mediaId: posts.mediaId,
        mediaType: posts.mediaType,
        mediaTitle: posts.mediaTitle,
        mediaImage: posts.mediaImage,
        rating: posts.rating,
        comment: posts.comment,
        isFavorite: posts.isFavorite,
        firstTime: posts.firstTime,
        hasSpoilers: posts.hasSpoilers,
        likeCount: posts.likeCount,
        commentCount: posts.commentCount,
        createdAt: posts.createdAt,
        userName: users.name,
        userAvatar: users.avatarUrl,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));
    return result;
  }

  async searchUsers(query: string): Promise<{ id: string; name: string; username: string; avatarUrl: string | null; bio: string | null }[]> {
    const result = await db
      .select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl, bio: users.bio })
      .from(users)
      .where(or(ilike(users.name, `%${query}%`), ilike(users.username, `%${query}%`)))
      .limit(20);
    return result;
  }

  async searchLists(query: string): Promise<{ id: string; name: string; coverImage: string | null; itemCount: number; userName: string; userId: string }[]> {
    const listsResult = await db
      .select({ id: userLists.id, name: userLists.name, coverImage: userLists.coverImage, userId: userLists.userId, userName: users.name })
      .from(userLists)
      .innerJoin(users, eq(userLists.userId, users.id))
      .where(ilike(userLists.name, `%${query}%`))
      .limit(20);

    const result: { id: string; name: string; coverImage: string | null; itemCount: number; userName: string; userId: string }[] = [];
    for (const list of listsResult) {
      const items = await db.select({ count: sql<number>`count(*)` }).from(userListItems).where(eq(userListItems.listId, list.id));
      result.push({ ...list, itemCount: Number(items[0]?.count || 0) });
    }
    return result;
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    await db.insert(follows).values({ followerId, followingId }).onConflictDoNothing();
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return result.length > 0;
  }

  async getFollowerCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(follows).where(eq(follows.followingId, userId));
    return Number(result[0]?.count || 0);
  }

  async getFollowingCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(follows).where(eq(follows.followerId, userId));
    return Number(result[0]?.count || 0);
  }

  async getPublicProfile(userId: string): Promise<{ user: any; favorites: UserFavorite[]; stats: any; posts: any[]; listCount: number }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const { password, ...safeUser } = user;
    const favorites = await this.getFavorites(userId);
    const stats = await this.getRatingStats(userId);
    const userPosts = await this.getUserPosts(userId);
    const lists = await db.select({ count: sql<number>`count(*)` }).from(userLists).where(eq(userLists.userId, userId));
    const listCount = Number(lists[0]?.count || 0);

    return { user: safeUser, favorites, stats, posts: userPosts, listCount };
  }
}

export const storage = new DatabaseStorage();

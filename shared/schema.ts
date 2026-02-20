import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, uniqueIndex, boolean as pgBoolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio").default(""),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFavorites = pgTable("user_favorites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  title: text("title").notNull(),
  mediaId: text("media_id"),
  mediaImage: text("media_image"),
}, (table) => [
  uniqueIndex("user_favorites_user_category_idx").on(table.userId, table.category),
]);

export const userRatings = pgTable("user_ratings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mediaId: text("media_id").notNull(),
  mediaType: text("media_type").notNull(),
  mediaTitle: text("media_title").notNull(),
  mediaImage: text("media_image"),
  rating: integer("rating").notNull(),
  comment: text("comment").default(""),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("user_ratings_user_media_idx").on(table.userId, table.mediaId, table.mediaType),
]);

export const userLists = pgTable("user_lists", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").default(""),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userListItems = pgTable("user_list_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  listId: varchar("list_id").notNull().references(() => userLists.id),
  mediaId: text("media_id").notNull(),
  mediaType: text("media_type").notNull(),
  mediaTitle: text("media_title").notNull(),
  mediaImage: text("media_image"),
  addedAt: timestamp("added_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mediaId: text("media_id").notNull(),
  mediaType: text("media_type").notNull(),
  mediaTitle: text("media_title").notNull(),
  mediaImage: text("media_image"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  isFavorite: pgBoolean("is_favorite").default(false),
  firstTime: pgBoolean("first_time").default(true),
  hasSpoilers: pgBoolean("has_spoilers").default(false),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
});

export const insertFavoriteSchema = z.object({
  category: z.enum(["film", "series", "music", "anime", "manga", "book"]),
  title: z.string().min(1),
  mediaId: z.string().optional(),
  mediaImage: z.string().optional(),
});

export const insertRatingSchema = z.object({
  mediaId: z.string().min(1),
  mediaType: z.enum(["film", "series", "music", "anime", "manga", "book"]),
  mediaTitle: z.string().min(1),
  mediaImage: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const insertListSchema = z.object({
  name: z.string().min(1),
  coverImage: z.string().optional(),
});

export const insertListItemSchema = z.object({
  mediaId: z.string().min(1),
  mediaType: z.string().min(1),
  mediaTitle: z.string().min(1),
  mediaImage: z.string().optional(),
});

export const insertPostSchema = z.object({
  mediaId: z.string().min(1),
  mediaType: z.string().min(1),
  mediaTitle: z.string().min(1),
  mediaImage: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
  isFavorite: z.boolean().optional(),
  firstTime: z.boolean().optional(),
  hasSpoilers: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type UserRating = typeof userRatings.$inferSelect;
export type UserList = typeof userLists.$inferSelect;
export type UserListItem = typeof userListItems.$inferSelect;
export type Post = typeof posts.$inferSelect;

import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  phoneNumber: text("phone_number").notNull(),
  callerName: text("caller_name"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  riskScore: integer("risk_score").notNull().default(0),
  category: text("category").notNull().default("unknown"),
  transcription: text("transcription"),
  aiResponse: text("ai_response"),
  duration: integer("duration"),
  blocked: boolean("blocked").default(false).notNull(),
});

export const blockedRules = pgTable("blocked_rules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  phoneNumber: text("phone_number").notNull(),
  ruleName: text("rule_name").notNull(),
  isWildcard: boolean("is_wildcard").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  screeningEnabled: boolean("screening_enabled").default(true).notNull(),
  protectionLevel: text("protection_level").notNull().default("medium"),
  quietHoursStart: text("quiet_hours_start"),
  quietHoursEnd: text("quiet_hours_end"),
  autoBlockThreshold: integer("auto_block_threshold").default(70).notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull().default("New Conversation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export const insertCallSchema = createInsertSchema(calls);
export const selectCallSchema = createSelectSchema(calls);
export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = z.infer<typeof selectCallSchema>;

export const insertBlockedRuleSchema = createInsertSchema(blockedRules);
export const selectBlockedRuleSchema = createSelectSchema(blockedRules);
export type InsertBlockedRule = z.infer<typeof insertBlockedRuleSchema>;
export type BlockedRule = z.infer<typeof selectBlockedRuleSchema>;

export const insertUserSettingsSchema = createInsertSchema(userSettings);
export const selectUserSettingsSchema = createSelectSchema(userSettings);
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = z.infer<typeof selectUserSettingsSchema>;

export const insertConversationSchema = createInsertSchema(conversations);
export const selectConversationSchema = createSelectSchema(conversations);
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = z.infer<typeof selectConversationSchema>;

export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = z.infer<typeof selectMessageSchema>;

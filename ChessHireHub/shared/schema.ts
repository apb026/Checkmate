import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePictureUrl: text("profile_picture_url"),
  googleId: text("google_id").unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  profilePictureUrl: true,
  googleId: true,
});

// Resume model
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  parsedContent: json("parsed_content"), // Parsed content from the resume
});

export const insertResumeSchema = createInsertSchema(resumes).pick({
  userId: true,
  fileName: true,
  fileUrl: true,
});

// Interviews model
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  resumeId: integer("resume_id").references(() => resumes.id),
  targetRole: text("target_role").notNull(),
  experienceLevel: text("experience_level").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  status: text("status").notNull().default("in_progress"), // in_progress, completed, cancelled
  interviewerCharacter: text("interviewer_character").notNull(), // queen, bishop, knight etc.
});

export const insertInterviewSchema = createInsertSchema(interviews).pick({
  userId: true,
  resumeId: true,
  targetRole: true,
  experienceLevel: true,
  interviewerCharacter: true,
});

// Interview messages model
export const interviewMessages = pgTable("interview_messages", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").notNull().references(() => interviews.id),
  sender: text("sender").notNull(), // user, ai
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const insertInterviewMessageSchema = createInsertSchema(interviewMessages).pick({
  interviewId: true,
  sender: true,
  content: true,
});

// Exported types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type InterviewMessage = typeof interviewMessages.$inferSelect;
export type InsertInterviewMessage = z.infer<typeof insertInterviewMessageSchema>;

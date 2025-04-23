import type { 
  User, InsertUser,
  Resume, InsertResume,
  Interview, InsertInterview,
  InterviewMessage, InsertInterviewMessage
} from "@shared/schema";
import db from './db';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume methods
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUser(userId: number): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResumeParsedContent(id: number, parsedContent: any): Promise<Resume | undefined>;
  
  // Interview methods
  getInterview(id: number): Promise<Interview | undefined>;
  getInterviewsByUser(userId: number): Promise<Interview[]>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterviewStatus(id: number, status: string, endedAt?: Date): Promise<Interview | undefined>;
  
  // Interview messages methods
  getInterviewMessages(interviewId: number): Promise<InterviewMessage[]>;
  createInterviewMessage(message: InsertInterviewMessage): Promise<InterviewMessage>;
}

export class SQLiteStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    try {
      const user = db.prepare('SELECT * FROM users WHERE googleId = ?').get(googleId);
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by Google ID:', error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const stmt = db.prepare(`
        INSERT INTO users (username, email, password, firstName, lastName, profilePictureUrl, googleId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const info = stmt.run(
        insertUser.username,
        insertUser.email,
        insertUser.password || null,
        insertUser.firstName || null,
        insertUser.lastName || null,
        insertUser.profilePictureUrl || null,
        insertUser.googleId || null
      );
      
      const id = info.lastInsertRowid as number;
      const user = await this.getUser(id);
      
      if (!user) {
        throw new Error('Failed to retrieve created user');
      }
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Resume methods
  async getResume(id: number): Promise<Resume | undefined> {
    try {
      const resume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(id);
      if (resume && resume.parsedContent) {
        try {
          resume.parsedContent = JSON.parse(resume.parsedContent);
        } catch (e) {
          console.warn('Failed to parse resume content:', e);
        }
      }
      if (resume && resume.uploadedAt) {
        resume.uploadedAt = new Date(resume.uploadedAt);
      }
      return resume || undefined;
    } catch (error) {
      console.error('Error getting resume by ID:', error);
      return undefined;
    }
  }
  
  async getResumesByUser(userId: number): Promise<Resume[]> {
    try {
      const resumes = db.prepare('SELECT * FROM resumes WHERE userId = ? ORDER BY uploadedAt DESC').all(userId);
      return resumes.map(resume => {
        if (resume.parsedContent) {
          try {
            resume.parsedContent = JSON.parse(resume.parsedContent);
          } catch (e) {
            console.warn('Failed to parse resume content:', e);
          }
        }
        if (resume.uploadedAt) {
          resume.uploadedAt = new Date(resume.uploadedAt);
        }
        return resume;
      });
    } catch (error) {
      console.error('Error getting resumes by user ID:', error);
      return [];
    }
  }
  
  async createResume(insertResume: InsertResume): Promise<Resume> {
    try {
      const stmt = db.prepare(`
        INSERT INTO resumes (userId, fileName, fileUrl, uploadedAt, parsedContent)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const uploadedAt = new Date().toISOString();
      
      const info = stmt.run(
        insertResume.userId,
        insertResume.fileName,
        insertResume.fileUrl,
        uploadedAt,
        null
      );
      
      const id = info.lastInsertRowid as number;
      const resume = await this.getResume(id);
      
      if (!resume) {
        throw new Error('Failed to retrieve created resume');
      }
      
      return resume;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  }
  
  async updateResumeParsedContent(id: number, parsedContent: any): Promise<Resume | undefined> {
    try {
      const stringifiedContent = JSON.stringify(parsedContent);
      
      const stmt = db.prepare(`
        UPDATE resumes
        SET parsedContent = ?
        WHERE id = ?
      `);
      
      stmt.run(stringifiedContent, id);
      
      return await this.getResume(id);
    } catch (error) {
      console.error('Error updating resume parsed content:', error);
      return undefined;
    }
  }
  
  // Interview methods
  async getInterview(id: number): Promise<Interview | undefined> {
    try {
      const interview = db.prepare('SELECT * FROM interviews WHERE id = ?').get(id);
      if (interview) {
        if (interview.startedAt) interview.startedAt = new Date(interview.startedAt);
        if (interview.endedAt) interview.endedAt = new Date(interview.endedAt);
      }
      return interview || undefined;
    } catch (error) {
      console.error('Error getting interview by ID:', error);
      return undefined;
    }
  }
  
  async getInterviewsByUser(userId: number): Promise<Interview[]> {
    try {
      const interviews = db.prepare('SELECT * FROM interviews WHERE userId = ? ORDER BY startedAt DESC').all(userId);
      return interviews.map(interview => {
        if (interview.startedAt) interview.startedAt = new Date(interview.startedAt);
        if (interview.endedAt) interview.endedAt = new Date(interview.endedAt);
        return interview;
      });
    } catch (error) {
      console.error('Error getting interviews by user ID:', error);
      return [];
    }
  }
  
  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    try {
      const stmt = db.prepare(`
        INSERT INTO interviews (userId, resumeId, targetRole, experienceLevel, startedAt, status, interviewerCharacter)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const startedAt = new Date().toISOString();
      
      const info = stmt.run(
        insertInterview.userId,
        insertInterview.resumeId || null,
        insertInterview.targetRole,
        insertInterview.experienceLevel,
        startedAt,
        'in_progress',
        insertInterview.interviewerCharacter
      );
      
      const id = info.lastInsertRowid as number;
      const interview = await this.getInterview(id);
      
      if (!interview) {
        throw new Error('Failed to retrieve created interview');
      }
      
      return interview;
    } catch (error) {
      console.error('Error creating interview:', error);
      throw error;
    }
  }
  
  async updateInterviewStatus(id: number, status: string, endedAt?: Date): Promise<Interview | undefined> {
    try {
      let stmt;
      
      if (endedAt) {
        stmt = db.prepare(`
          UPDATE interviews
          SET status = ?, endedAt = ?
          WHERE id = ?
        `);
        stmt.run(status, endedAt.toISOString(), id);
      } else {
        stmt = db.prepare(`
          UPDATE interviews
          SET status = ?
          WHERE id = ?
        `);
        stmt.run(status, id);
      }
      
      return await this.getInterview(id);
    } catch (error) {
      console.error('Error updating interview status:', error);
      return undefined;
    }
  }
  
  // Interview messages methods
  async getInterviewMessages(interviewId: number): Promise<InterviewMessage[]> {
    try {
      const messages = db.prepare('SELECT * FROM interview_messages WHERE interviewId = ? ORDER BY sentAt ASC').all(interviewId);
      return messages.map(message => {
        if (message.sentAt) message.sentAt = new Date(message.sentAt);
        return message;
      });
    } catch (error) {
      console.error('Error getting interview messages by interview ID:', error);
      return [];
    }
  }
  
  async createInterviewMessage(insertMessage: InsertInterviewMessage): Promise<InterviewMessage> {
    try {
      const stmt = db.prepare(`
        INSERT INTO interview_messages (interviewId, sender, content, sentAt)
        VALUES (?, ?, ?, ?)
      `);
      
      const sentAt = new Date().toISOString();
      
      const info = stmt.run(
        insertMessage.interviewId,
        insertMessage.sender,
        insertMessage.content,
        sentAt
      );
      
      const id = info.lastInsertRowid as number;
      const message = db.prepare('SELECT * FROM interview_messages WHERE id = ?').get(id);
      
      if (!message) {
        throw new Error('Failed to retrieve created message');
      }
      
      message.sentAt = new Date(message.sentAt);
      
      return message;
    } catch (error) {
      console.error('Error creating interview message:', error);
      throw error;
    }
  }
}

export const storage = new SQLiteStorage();

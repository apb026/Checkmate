import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertResumeSchema, 
  insertInterviewSchema, 
  insertInterviewMessageSchema 
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exportInterviewsToCSV, exportInterviewMessagesToCSV, exportAllDataToJSON } from "./exportUtils";
import { v4 as uuidv4 } from "uuid";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, Word documents, and plain text files
    const allowedMimeTypes = [
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("Only PDF, Word documents, and plain text files are allowed"));
      return;
    }
    cb(null, true);
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development",
});

// Session validation middleware
const validateSession = async (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  req.user = user;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Register authentication routes
  
  // Register route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Set user session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password (in a real app, you would use bcrypt)
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set user session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // Google auth route
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { googleId, email, firstName, lastName, profilePictureUrl } = req.body;
      
      // Check if user exists by Google ID
      let user = await storage.getUserByGoogleId(googleId);
      
      if (!user) {
        // Check if there's a user with the same email
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Update existing user with Google ID
          // In a real implementation, you'd update the user in the database
          user = await storage.createUser({
            ...user,
            googleId
          });
        } else {
          // Create new user
          const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
          user = await storage.createUser({
            username,
            email,
            password: '', // Empty password for Google auth users
            firstName,
            lastName,
            profilePictureUrl,
            googleId
          });
        }
      }
      
      // Set user session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to authenticate with Google" });
    }
  });
  
  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "Logged out successfully" });
    }
  });
  
  // Get current user
  app.get("/api/auth/me", validateSession, (req, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
  });
  
  // Register resume routes
  
  // Upload resume
  app.post("/api/resumes", validateSession, upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No resume file uploaded" });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      const fileName = req.file.originalname;
      
      const resumeData = {
        userId: req.user.id,
        fileName,
        fileUrl
      };
      
      const resume = await storage.createResume(resumeData);
      
      // In a real implementation, you would parse the PDF file here
      // For demo purposes, we'll add some mock parsed content after a delay
      setTimeout(async () => {
        await storage.updateResumeParsedContent(resume.id, {
          name: req.user.firstName + ' ' + req.user.lastName,
          email: req.user.email,
          skills: ["React", "JavaScript", "Node.js", "Express"],
          experience: [
            { title: "Frontend Developer", company: "Tech Corp", duration: "2 years" }
          ],
          education: [
            { degree: "Computer Science", institution: "University of Technology" }
          ]
        });
      }, 2000);
      
      res.status(201).json(resume);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload resume" });
    }
  });
  
  // Get user's resumes
  app.get("/api/resumes", validateSession, async (req, res) => {
    try {
      const resumes = await storage.getResumesByUser(req.user.id);
      res.status(200).json(resumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get resumes" });
    }
  });
  
  // Get a specific resume
  app.get("/api/resumes/:id", validateSession, async (req, res) => {
    try {
      const resume = await storage.getResume(parseInt(req.params.id));
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      if (resume.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this resume" });
      }
      
      res.status(200).json(resume);
    } catch (error) {
      res.status(500).json({ message: "Failed to get resume" });
    }
  });
  
  // Register interview routes
  
  // Create new interview
  app.post("/api/interviews", validateSession, async (req, res) => {
    try {
      const interviewData = insertInterviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // If resumeId is provided, verify it belongs to the user
      if (interviewData.resumeId) {
        const resume = await storage.getResume(interviewData.resumeId);
        if (!resume || resume.userId !== req.user.id) {
          return res.status(403).json({ message: "Not authorized to use this resume" });
        }
      }
      
      const interview = await storage.createInterview(interviewData);
      
      // Create initial AI message
      const initialMessage = {
        interviewId: interview.id,
        sender: "ai",
        content: `Hello! I'm your ${interview.interviewerCharacter} interviewer. Welcome to ChessView. Let's start with a brief introduction. Could you tell me a bit about yourself and your background in ${interview.targetRole}?`
      };
      
      await storage.createInterviewMessage(initialMessage);
      
      res.status(201).json(interview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create interview" });
    }
  });
  
  // Get user's interviews
  app.get("/api/interviews", validateSession, async (req, res) => {
    try {
      const interviews = await storage.getInterviewsByUser(req.user.id);
      res.status(200).json(interviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to get interviews" });
    }
  });
  
  // Get a specific interview
  app.get("/api/interviews/:id", validateSession, async (req, res) => {
    try {
      const interview = await storage.getInterview(parseInt(req.params.id));
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      if (interview.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this interview" });
      }
      
      res.status(200).json(interview);
    } catch (error) {
      res.status(500).json({ message: "Failed to get interview" });
    }
  });
  
  // End an interview
  app.patch("/api/interviews/:id/end", validateSession, async (req, res) => {
    try {
      const interview = await storage.getInterview(parseInt(req.params.id));
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      if (interview.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this interview" });
      }
      
      const updatedInterview = await storage.updateInterviewStatus(interview.id, "completed", new Date());
      
      res.status(200).json(updatedInterview);
    } catch (error) {
      res.status(500).json({ message: "Failed to end interview" });
    }
  });
  
  // Register interview messages routes
  
  // Get messages for an interview
  app.get("/api/interviews/:id/messages", validateSession, async (req, res) => {
    try {
      const interview = await storage.getInterview(parseInt(req.params.id));
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      if (interview.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this interview" });
      }
      
      const messages = await storage.getInterviewMessages(interview.id);
      
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get interview messages" });
    }
  });
  
  // Send a message in an interview
  app.post("/api/interviews/:id/messages", validateSession, async (req, res) => {
    try {
      const interview = await storage.getInterview(parseInt(req.params.id));
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      if (interview.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this interview" });
      }
      
      if (interview.status !== "in_progress") {
        return res.status(400).json({ message: "Cannot send messages to a completed or cancelled interview" });
      }
      
      // Create user message
      const messageData = insertInterviewMessageSchema.parse({
        interviewId: interview.id,
        sender: "user",
        content: req.body.content
      });
      
      const userMessage = await storage.createInterviewMessage(messageData);
      
      // Get interview history for context
      const messages = await storage.getInterviewMessages(interview.id);
      
      // Get resume data if available
      let resumeContext = "";
      if (interview.resumeId) {
        const resume = await storage.getResume(interview.resumeId);
        if (resume && resume.parsedContent) {
          resumeContext = `The user's resume shows the following information: ${JSON.stringify(resume.parsedContent)}`;
        }
      }
      
      // Get AI response using OpenAI
      const aiResponseContent = await getAIResponse(
        interview.interviewerCharacter,
        interview.targetRole,
        interview.experienceLevel,
        messages,
        resumeContext
      );
      
      // Save AI response
      const aiResponseData = {
        interviewId: interview.id,
        sender: "ai",
        content: aiResponseContent
      };
      
      const aiMessage = await storage.createInterviewMessage(aiResponseData);
      
      res.status(201).json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  // Helper function to get AI response
  async function getAIResponse(
    character: string, 
    role: string, 
    level: string, 
    messages: any[], 
    resumeContext: string
  ): Promise<string> {
    try {
      // Format past messages for OpenAI
      const formattedMessages = messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content
      }));
      
      // System message with instructions
      const systemMessage = {
        role: "system",
        content: `You are an AI interviewer for a ${role} position. You embody the personality of a chess ${character} piece.
        The candidate's experience level is ${level}.
        ${resumeContext}
        Ask relevant technical questions based on the role and experience level.
        Keep responses concise (2-3 sentences max).
        Be professional but incorporate subtle chess metaphors or references when appropriate.`
      };
      
      // Create completion with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [systemMessage, ...formattedMessages],
        max_tokens: 250,
      });
      
      return response.choices[0].message.content || "I'm processing your response. Please give me a moment.";
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I apologize, but I'm having trouble forming a response. Let's continue our interview. Could you tell me more about your experience?";
    }
  }
  
  // Export routes
  
  // Export interviews to CSV
  app.get("/api/export/interviews", validateSession, async (req, res) => {
    try {
      const userId = req.user.id;
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.startDate) {
        startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        endDate = new Date(req.query.endDate as string);
      }
      
      const exportPath = await exportInterviewsToCSV({
        userId,
        startDate,
        endDate,
        format: 'csv'
      });
      
      if (typeof exportPath === 'string' && exportPath.startsWith('/')) {
        // It's a file path, send the file
        res.download(exportPath, `interview_export_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        // It's a message
        res.status(200).json({ message: exportPath });
      }
    } catch (error) {
      console.error('Error exporting interviews:', error);
      res.status(500).json({ message: "Failed to export interviews" });
    }
  });
  
  // Export interview messages to CSV
  app.get("/api/export/interviews/:id/messages", validateSession, async (req, res) => {
    try {
      const interviewId = parseInt(req.params.id);
      const interview = await storage.getInterview(interviewId);
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      if (interview.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this interview" });
      }
      
      const exportPath = await exportInterviewMessagesToCSV(interviewId);
      
      if (typeof exportPath === 'string' && exportPath.startsWith('/')) {
        // It's a file path, send the file
        res.download(exportPath, `interview_${interviewId}_messages_${new Date().toISOString().split('T')[0]}.csv`);
      } else {
        // It's a message
        res.status(200).json({ message: exportPath });
      }
    } catch (error) {
      console.error('Error exporting interview messages:', error);
      res.status(500).json({ message: "Failed to export interview messages" });
    }
  });
  
  // Export all data to JSON (admin only)
  app.get("/api/export/all", validateSession, async (req, res) => {
    try {
      // In a real app, you would check if user is admin
      // For demo purposes, we'll just check if they are the first user
      if (req.user.id !== 1) {
        return res.status(403).json({ message: "Not authorized to perform this action" });
      }
      
      const exportPath = await exportAllDataToJSON();
      
      if (typeof exportPath === 'string' && exportPath.startsWith('/')) {
        // It's a file path, send the file
        res.download(exportPath, `chessview_export_${new Date().toISOString().split('T')[0]}.json`);
      } else {
        // It's a message
        res.status(200).json({ message: exportPath });
      }
    } catch (error) {
      console.error('Error exporting all data:', error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  return httpServer;
}

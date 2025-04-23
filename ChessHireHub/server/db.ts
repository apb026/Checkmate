import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create/connect to SQLite database
const dbPath = path.join(dataDir, 'chessview.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      firstName TEXT,
      lastName TEXT,
      profilePictureUrl TEXT,
      googleId TEXT UNIQUE
    )
  `);

  // Resumes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      fileName TEXT NOT NULL,
      fileUrl TEXT NOT NULL,
      uploadedAt TEXT NOT NULL,
      parsedContent TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  // Interviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      resumeId INTEGER,
      targetRole TEXT NOT NULL,
      experienceLevel TEXT NOT NULL,
      startedAt TEXT NOT NULL,
      endedAt TEXT,
      status TEXT NOT NULL,
      interviewerCharacter TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (resumeId) REFERENCES resumes(id)
    )
  `);

  // Interview messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS interview_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interviewId INTEGER NOT NULL,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      sentAt TEXT NOT NULL,
      FOREIGN KEY (interviewId) REFERENCES interviews(id)
    )
  `);

  console.log('Database initialized successfully');
}

// Run initialization
initializeDatabase();

export default db;
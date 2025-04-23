import fs from 'fs';
import path from 'path';
import db from './db';

interface ExportOptions {
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  format: 'csv' | 'json';
}

// Create exports directory if it doesn't exist
const ensureExportDirExists = () => {
  const exportsDir = path.join(process.cwd(), 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }
  return exportsDir;
};

// Convert object to CSV row
const objectToCSVRow = (obj: any): string => {
  const values = Object.values(obj).map(value => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
    return `"${String(value).replace(/"/g, '""')}"`;
  });
  return values.join(',');
};

// Export interviews to CSV
export const exportInterviewsToCSV = async (options: ExportOptions): Promise<string> => {
  const exportsDir = ensureExportDirExists();
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `interviews_export_${timestamp}.csv`;
  const filePath = path.join(exportsDir, filename);
  
  let query = 'SELECT * FROM interviews';
  const queryParams: any[] = [];
  
  if (options.userId) {
    query += ' WHERE userId = ?';
    queryParams.push(options.userId);
  }
  
  if (options.startDate) {
    const operator = options.userId ? 'AND' : 'WHERE';
    query += ` ${operator} startedAt >= ?`;
    queryParams.push(options.startDate.toISOString());
  }
  
  if (options.endDate) {
    const operator = options.userId || options.startDate ? 'AND' : 'WHERE';
    query += ` ${operator} startedAt <= ?`;
    queryParams.push(options.endDate.toISOString());
  }
  
  query += ' ORDER BY startedAt DESC';
  
  try {
    const interviews = db.prepare(query).all(...queryParams);
    
    if (interviews.length === 0) {
      return "No interviews found matching the criteria";
    }
    
    // Get headers from first interview
    const headers = Object.keys(interviews[0]).join(',');
    
    // Convert to CSV rows
    const rows = interviews.map(interview => objectToCSVRow(interview));
    
    // Write to file
    const content = [headers, ...rows].join('\n');
    fs.writeFileSync(filePath, content);
    
    return filePath;
  } catch (error) {
    console.error('Error exporting interviews to CSV:', error);
    throw new Error('Failed to export interviews');
  }
};

// Export interview messages to CSV
export const exportInterviewMessagesToCSV = async (
  interviewId: number
): Promise<string> => {
  const exportsDir = ensureExportDirExists();
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `interview_${interviewId}_messages_${timestamp}.csv`;
  const filePath = path.join(exportsDir, filename);
  
  try {
    // First get interview info
    const interview = db.prepare('SELECT * FROM interviews WHERE id = ?').get(interviewId);
    
    if (!interview) {
      throw new Error('Interview not found');
    }
    
    // Get messages for this interview
    const messages = db.prepare(
      'SELECT * FROM interview_messages WHERE interviewId = ? ORDER BY sentAt ASC'
    ).all(interviewId);
    
    if (messages.length === 0) {
      return "No messages found for this interview";
    }
    
    // Get headers from first message
    const headers = Object.keys(messages[0]).join(',');
    
    // Convert to CSV rows
    const rows = messages.map(message => objectToCSVRow(message));
    
    // Write to file
    const content = [headers, ...rows].join('\n');
    fs.writeFileSync(filePath, content);
    
    return filePath;
  } catch (error) {
    console.error('Error exporting interview messages to CSV:', error);
    throw new Error('Failed to export interview messages');
  }
};

// Export all data (users, resumes, interviews, messages) to JSON
export const exportAllDataToJSON = async (): Promise<string> => {
  const exportsDir = ensureExportDirExists();
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `chessview_export_${timestamp}.json`;
  const filePath = path.join(exportsDir, filename);
  
  try {
    const users = db.prepare('SELECT * FROM users').all();
    const resumes = db.prepare('SELECT * FROM resumes').all();
    const interviews = db.prepare('SELECT * FROM interviews').all();
    const messages = db.prepare('SELECT * FROM interview_messages').all();
    
    // Parse JSON content in resumes
    resumes.forEach(resume => {
      if (resume.parsedContent) {
        try {
          resume.parsedContent = JSON.parse(resume.parsedContent);
        } catch (e) {
          console.warn('Failed to parse resume content:', e);
        }
      }
    });
    
    const exportData = {
      exportDate: new Date().toISOString(),
      data: {
        users,
        resumes,
        interviews,
        messages
      }
    };
    
    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    
    return filePath;
  } catch (error) {
    console.error('Error exporting all data to JSON:', error);
    throw new Error('Failed to export data');
  }
};
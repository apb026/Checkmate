export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  googleId?: string;
}

export interface Resume {
  id: number;
  userId: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  parsedContent: any;
}

export interface Interview {
  id: number;
  userId: number;
  resumeId?: number;
  targetRole: string;
  experienceLevel: string;
  startedAt: string;
  endedAt?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  interviewerCharacter: string;
}

export interface InterviewMessage {
  id: number;
  interviewId: number;
  sender: 'user' | 'ai';
  content: string;
  sentAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface GoogleAuthData {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
}

export interface CreateInterviewData {
  resumeId?: number;
  targetRole: string;
  experienceLevel: string;
  interviewerCharacter: string;
}

export interface ExperienceLevel {
  id: string;
  name: string;
  icon: string;
}

export interface JobRole {
  id: string;
  name: string;
}

export interface Interviewer {
  id: string;
  name: string;
  icon: string;
  description: string;
}

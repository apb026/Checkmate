import { apiRequest } from "./queryClient";
import { InterviewMessage } from "@/types";

// Function to send a message and get AI response
export const sendMessageAndGetResponse = async (
  interviewId: number, 
  content: string
): Promise<{ userMessage: InterviewMessage, aiMessage: InterviewMessage }> => {
  try {
    const response = await apiRequest(
      "POST", 
      `/api/interviews/${interviewId}/messages`, 
      { content }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Parse resume data from PDF using OpenAI
export const parseResumeWithAI = async (resumeText: string) => {
  try {
    const prompt = `
      Extract the following information from this resume:
      1. Name
      2. Email
      3. Phone number
      4. Skills (as an array)
      5. Work experience (as an array of objects with company, title, duration, and description)
      6. Education (as an array of objects with institution, degree, and graduation date)
      
      Format the response as a JSON object.
      
      Here's the resume text:
      ${resumeText}
    `;
    
    // In a real implementation, you would call OpenAI API directly here
    // For now, we'll return a mock result
    
    return {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      skills: ["JavaScript", "React", "Node.js", "Express", "TypeScript"],
      workExperience: [
        {
          company: "Tech Company",
          title: "Senior Frontend Developer",
          duration: "2020-2023",
          description: "Built responsive web applications using React and TypeScript"
        },
        {
          company: "Startup Inc.",
          title: "Full Stack Developer",
          duration: "2018-2020",
          description: "Developed RESTful APIs and frontend interfaces"
        }
      ],
      education: [
        {
          institution: "University of Technology",
          degree: "Bachelor of Science in Computer Science",
          graduationDate: "2018"
        }
      ]
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
};

export default { sendMessageAndGetResponse, parseResumeWithAI };

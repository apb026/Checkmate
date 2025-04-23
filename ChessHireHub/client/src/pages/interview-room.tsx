import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { sendMessageAndGetResponse } from "@/lib/openai";
import { Interview, InterviewMessage, User } from "@/types";
import VideoInterview from "@/components/VideoInterview";

// Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const jobRoles = {
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  fullstack: "Full Stack Developer",
  data: "Data Scientist",
  devops: "DevOps Engineer",
  mobile: "Mobile Developer",
  qa: "QA Engineer",
  manager: "Engineering Manager",
};

const interviewerInfo = {
  queen: {
    name: "Queen Interviewer",
    title: "Senior Technical Interviewer",
    quote: "I'll be evaluating your technical skills and problem-solving approach. Let's have a productive conversation about your experience.",
    icon: "fas fa-chess-queen"
  },
  king: {
    name: "King Interviewer",
    title: "Leadership Assessment Specialist",
    quote: "I'm here to assess your strategic thinking and decision making. Let's discuss how you approach challenges.",
    icon: "fas fa-chess-king"
  },
  rook: {
    name: "Rook Interviewer",
    title: "Technical Systems Architect",
    quote: "I focus on architecture and system design. Let's talk about how you build scalable solutions.",
    icon: "fas fa-chess-rook"
  },
  bishop: {
    name: "Bishop Interviewer",
    title: "Problem Solving Specialist",
    quote: "I analyze approach and methodology. Show me how you solve complex technical problems.",
    icon: "fas fa-chess-bishop"
  },
  knight: {
    name: "Knight Interviewer",
    title: "Creative Technical Assessor",
    quote: "I'm looking for unique approaches and creative solutions to technical challenges.",
    icon: "fas fa-chess-knight"
  }
};

interface InterviewRoomProps {
  id: number;
}

export default function InterviewRoom({ id }: InterviewRoomProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [interviewMode, setInterviewMode] = useState<"text" | "video">("text");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch interview data
  const { data: interview, isLoading: interviewLoading } = useQuery<Interview>({
    queryKey: [`/api/interviews/${id}`],
  });
  
  // Fetch interview messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<InterviewMessage[]>({
    queryKey: [`/api/interviews/${id}/messages`],
    enabled: !!interview,
    refetchInterval: interview?.status === "in_progress" ? 5000 : false,
  });
  
  // Fetch user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return sendMessageAndGetResponse(id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${id}/messages`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // End interview mutation
  const endInterviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/interviews/${id}/end`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      
      toast({
        title: "Interview ended",
        description: "Your interview has been completed. You can review it later.",
      });
      
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Failed to end interview",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // AI typing animation
  useEffect(() => {
    let typing = false;
    
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === "ai") {
        // Simulate AI typing effect
        typing = true;
        setTimeout(() => {
          setIsTyping(false);
        }, 500);
      }
    }
    
    setIsTyping(typing);
  }, [messages]);
  
  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || sendMessageMutation.isPending) {
      return;
    }
    
    sendMessageMutation.mutate(message);
    setMessage("");
  };
  
  // Calculate interview progress
  const calculateProgress = () => {
    if (!messages.length) return 10;
    
    const messageCount = messages.length;
    // Assuming a typical interview has around 20 messages (10 exchanges)
    return Math.min(Math.round((messageCount / 20) * 100), 100);
  };
  
  // Determine current interview stage
  const getInterviewStage = () => {
    const progress = calculateProgress();
    
    if (progress < 25) return "Introduction";
    if (progress < 50) return "Technical Assessment";
    if (progress < 75) return "Problem Solving";
    return "Final Evaluation";
  };
  
  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (interviewLoading || !interview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#4A3F35] text-white">
        <Card className="p-8 bg-[#2A2520] border-none">
          <div className="flex flex-col items-center">
            <i className="fas fa-chess-board text-5xl text-[#D6A62C] animate-pulse mb-4"></i>
            <h1 className="text-xl font-bold">Loading interview...</h1>
          </div>
        </Card>
      </div>
    );
  }
  
  // Get interviewer info
  const interviewer = interviewerInfo[interview.interviewerCharacter as keyof typeof interviewerInfo] || interviewerInfo.queen;
  
  return (
    <div className="min-h-screen bg-[#4A3F35] text-white">
      <div className="container mx-auto px-4 py-6 flex flex-col h-screen">
        {/* Header */}
        <header className="flex justify-between items-center py-3 border-b border-gray-700 mb-4">
          <div className="flex items-center">
            <i className="fas fa-chess-knight text-2xl text-[#D6A62C] mr-2"></i>
            <h2 className="font-serif text-xl font-bold">Interview Room</h2>
          </div>
          <div className="flex items-center gap-2">
            {interview.status === "completed" && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs flex items-center gap-1 text-white border-[#D6A62C] hover:bg-[#4A3F35]"
                onClick={() => window.open(`/api/export/interviews/${id}/messages`, '_blank')}
              >
                <i className="fas fa-file-csv text-[#D6A62C]"></i> Export Messages
              </Button>
            )}
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (interview.status === "in_progress") {
                  if (confirm("Are you sure you want to end this interview?")) {
                    endInterviewMutation.mutate();
                  }
                } else {
                  setLocation("/dashboard");
                }
              }}
              disabled={endInterviewMutation.isPending}
            >
              <i className="fas fa-door-open mr-1"></i> 
              {interview.status === "in_progress" ? (
                endInterviewMutation.isPending ? "Exiting..." : "Exit"
              ) : (
                "Return to Dashboard"
              )}
            </Button>
          </div>
        </header>
        
        {/* Interview Mode Toggle */}
        <div className="flex items-center justify-center my-2">
          <div className="flex items-center space-x-2 bg-[#2A2520] p-2 rounded-lg">
            <Label htmlFor="interview-mode" className="text-sm">Video Interview Mode</Label>
            <Switch 
              id="interview-mode" 
              checked={interviewMode === "video"}
              onCheckedChange={(checked) => setInterviewMode(checked ? "video" : "text")}
              disabled={interview.status !== "in_progress"}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left Panel - Interviewer (only shown in text mode) */}
          {interviewMode === "text" && (
            <div className="hidden lg:block w-1/3 rounded-lg shadow-lg relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center">
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-16 w-16 mr-4">
                    <i className={`${interviewer.icon} text-6xl text-[#D6A62C]`}></i>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">{interviewer.name}</h3>
                    <p className="text-gray-300">{interviewer.title}</p>
                  </div>
                </div>
                <div className="bg-[#2A2520] bg-opacity-60 rounded-lg p-4 mb-4">
                  <p className="italic text-gray-300">{interviewer.quote}</p>
                </div>
                <div className="mt-auto">
                  <h4 className="font-medium mb-2">Interview Progress</h4>
                  <Progress value={calculateProgress()} className="bg-gray-700 h-2.5 w-full rounded-full">
                    <div 
                      className="bg-[#D6A62C] h-2.5 rounded-full"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </Progress>
                  <div className="flex justify-between text-sm mt-1">
                    <span>{getInterviewStage()}</span>
                    <span>{calculateProgress()}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Video Interview Interface */}
          {interviewMode === "video" && interview && interview.status === "in_progress" ? (
            <div className="flex-1">
              <VideoInterview 
                interview={interview}
                messages={messages}
                onSendMessage={async (content) => {
                  await sendMessageMutation.mutateAsync(content);
                  return;
                }}
                onEndInterview={() => {
                  if (confirm("Are you sure you want to end this interview?")) {
                    endInterviewMutation.mutate();
                  }
                }}
              />
            </div>
          ) : null}
          
          {/* Right Panel - Chat Interface */}
          {interviewMode === "text" && (
            <div className="flex-1 bg-[#2A2520] rounded-lg shadow-lg flex flex-col overflow-hidden">
              {/* Chat History */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4" 
                id="chat-container"
                ref={chatContainerRef}
              >
                {/* System Message */}
                <div className="bg-[#4A3F35] bg-opacity-50 rounded-lg p-3 text-center text-sm">
                  <p>
                    Interview {interview.status === "in_progress" ? "started" : "conducted"} • 
                    {new Date(interview.startedAt).toLocaleDateString()} at 
                    {new Date(interview.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <i className="fas fa-circle-notch fa-spin text-[#D6A62C] text-2xl mr-3"></i>
                    <p>Loading conversation...</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex items-start ${msg.sender === 'ai' ? '' : 'justify-end'} mb-4`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="flex-shrink-0 mr-3">
                          <i className={`${interviewer.icon} text-2xl text-[#D6A62C]`}></i>
                        </div>
                      )}
                      
                      <div 
                        className={`rounded-lg p-3 max-w-3xl ${
                          msg.sender === 'ai' 
                            ? 'bg-[#4A3F35]' 
                            : 'bg-[#D6A62C] bg-opacity-90 text-[#2A2520]'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className="text-right text-xs opacity-70 mt-1">
                          {formatMessageTime(msg.sentAt)}
                        </div>
                      </div>
                      
                      {msg.sender === 'user' && (
                        <div className="flex-shrink-0 ml-3">
                          {user?.profilePictureUrl ? (
                            <img 
                              src={user.profilePictureUrl} 
                              alt={user.username} 
                              className="h-8 w-8 rounded-full" 
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-[#D6A62C] flex items-center justify-center text-[#4A3F35] font-bold">
                              {user?.firstName?.[0] || user?.username?.[0] || "U"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {/* AI Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mr-3">
                      <i className={`${interviewer.icon} text-2xl text-[#D6A62C]`}></i>
                    </div>
                    <div className="bg-[#4A3F35] rounded-lg p-3 max-w-3xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="border-t border-gray-700 p-4">
                {interview.status === "in_progress" ? (
                  <form className="flex items-center" onSubmit={handleSendMessage}>
                    <Input
                      type="text"
                      className="flex-1 bg-[#4A3F35] border border-gray-700 rounded-l-md py-2 px-4 focus:outline-none focus:border-[#D6A62C] transition-colors"
                      placeholder="Type your response..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button 
                      type="submit" 
                      className="bg-[#D6A62C] hover:bg-opacity-90 text-[#2A2520] py-2 px-4 rounded-r-md"
                      disabled={sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? (
                        <i className="fas fa-circle-notch fa-spin"></i>
                      ) : (
                        <i className="fas fa-paper-plane"></i>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="bg-[#4A3F35] bg-opacity-50 rounded-lg p-3 text-center">
                    <p>This interview has been completed.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

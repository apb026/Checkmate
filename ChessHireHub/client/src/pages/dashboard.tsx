import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { logoutFromFirebase } from "@/lib/firebase";
import { User, Resume, Interview, CreateInterviewData } from "@/types";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormError } from "@/components/ui/form-error";

const jobRoles = [
  { id: "frontend", name: "Frontend Developer" },
  { id: "backend", name: "Backend Developer" },
  { id: "fullstack", name: "Full Stack Developer" },
  { id: "data", name: "Data Scientist" },
  { id: "devops", name: "DevOps Engineer" },
  { id: "mobile", name: "Mobile Developer" },
  { id: "qa", name: "QA Engineer" },
  { id: "manager", name: "Engineering Manager" },
];

const experienceLevels = [
  { id: "beginner", name: "Beginner", icon: "fas fa-chess-pawn" },
  { id: "intermediate", name: "Intermediate", icon: "fas fa-chess-knight" },
  { id: "advanced", name: "Advanced", icon: "fas fa-chess-queen" },
];

const interviewerCharacters = [
  { id: "queen", name: "Queen", icon: "fas fa-chess-queen" },
  { id: "king", name: "King", icon: "fas fa-chess-king" },
  { id: "rook", name: "Rook", icon: "fas fa-chess-rook" },
  { id: "bishop", name: "Bishop", icon: "fas fa-chess-bishop" },
  { id: "knight", name: "Knight", icon: "fas fa-chess-knight" },
];

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState(0); // 0: not uploaded, 1: uploaded
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedInterviewer, setSelectedInterviewer] = useState("queen");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Fetch user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });
  
  // Fetch resumes
  const { data: resumes = [], isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
    enabled: !!user,
  });
  
  // Fetch past interviews
  const { data: interviews = [], isLoading: interviewsLoading } = useQuery<Interview[]>({
    queryKey: ["/api/interviews"],
    enabled: !!user,
  });
  
  // Upload resume mutation
  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      
      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload resume");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully.",
      });
      setUploadStep(1);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Create interview mutation
  const createInterviewMutation = useMutation({
    mutationFn: async (data: CreateInterviewData) => {
      const response = await apiRequest("POST", "/api/interviews", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Interview created",
        description: "Your interview has been set up. Redirecting to interview room...",
      });
      
      // Redirect to interview room
      setTimeout(() => {
        setLocation(`/interview/${data.id}`);
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Failed to create interview",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutFromFirebase();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      setLocation("/auth");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle resume upload
  const handleResumeUpload = () => {
    if (selectedFile) {
      uploadResumeMutation.mutate(selectedFile);
    } else {
      setErrorMessage("Please select a file to upload.");
    }
  };
  
  // Handle interview setup
  const handleStartInterview = () => {
    if (!selectedRole) {
      setErrorMessage("Please select a target role.");
      return;
    }
    
    if (!selectedLevel) {
      setErrorMessage("Please select an experience level.");
      return;
    }
    
    // Get the most recent resume if available
    const resumeId = resumes.length > 0 ? resumes[0].id : undefined;
    
    createInterviewMutation.mutate({
      resumeId,
      targetRole: selectedRole,
      experienceLevel: selectedLevel,
      interviewerCharacter: selectedInterviewer,
    });
  };
  
  // Reset form error when selections change
  useEffect(() => {
    setErrorMessage("");
  }, [selectedRole, selectedLevel, selectedInterviewer]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  };
  
  return (
    <div className="min-h-screen bg-[#F8F6F0] relative">
      {/* Background Chessboard Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(45deg, #4A3F35 25%, transparent 25%),
            linear-gradient(-45deg, #4A3F35 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #4A3F35 75%),
            linear-gradient(-45deg, transparent 75%, #4A3F35 75%)
          `,
          backgroundSize: '80px 80px',
          backgroundPosition: '0 0, 0 40px, 40px -40px, -40px 0px'
        }}>
      </div>
      
      {/* Header/Navigation */}
      <header className="bg-[#4A3F35] text-white shadow-md z-10 relative">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <i className="fas fa-chess-knight text-2xl text-[#D6A62C] mr-2"></i>
            <h2 className="font-serif text-xl font-bold">ChessView</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              <a href="#" className="hover:text-[#D6A62C] transition-colors">Dashboard</a>
              <a href="#" className="hover:text-[#D6A62C] transition-colors">Interviews</a>
              <a href="#" className="hover:text-[#D6A62C] transition-colors">Profile</a>
            </div>
            <div className="relative">
              <div className="flex items-center space-x-2 focus:outline-none">
                {user?.profilePictureUrl ? (
                  <img 
                    src={user.profilePictureUrl} 
                    alt="User" 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#D6A62C] flex items-center justify-center text-[#4A3F35] font-bold">
                    {user?.firstName?.[0] || user?.username?.[0] || "U"}
                  </div>
                )}
                <span className="hidden md:inline-block">{user?.firstName || user?.username}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-white hover:text-[#D6A62C]"
                >
                  <i className="fas fa-sign-out-alt ml-1"></i>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section with Chess-themed Welcome Card */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-xl p-6 border-l-4 border-[#D6A62C] mb-6">
            <div className="flex items-center">
              <div className="mr-6 hidden md:block">
                <div className="grid grid-cols-4 grid-rows-4 w-32 h-32 border border-[#4A3F35]">
                  {Array(16).fill(0).map((_, i) => {
                    const row = Math.floor(i / 4);
                    const col = i % 4;
                    const isBlack = (row + col) % 2 === 1;
                    return (
                      <div 
                        key={i} 
                        className={`w-8 h-8 ${isBlack ? 'bg-[#4A3F35]' : 'bg-[#F0D9B5]'} flex items-center justify-center`}
                      >
                        {i === 5 && <i className="fas fa-chess-knight text-[#D6A62C] text-lg"></i>}
                        {i === 10 && <i className="fas fa-chess-queen text-white text-lg"></i>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-[#4A3F35] mb-2">
                  Welcome back, {user?.firstName || user?.username}!
                </h1>
                <p className="text-[#2A2520] opacity-80">
                  Your next career move awaits. Upload your resume, select your target role, 
                  and begin your interview preparation journey today.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-md flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#F0D9B5] flex items-center justify-center mb-2">
                <i className="fas fa-upload text-[#4A3F35]"></i>
              </div>
              <h3 className="font-medium">Upload Resume</h3>
              <p className="text-sm text-gray-600">Submit your resume for AI analysis</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#F0D9B5] flex items-center justify-center mb-2">
                <i className="fas fa-chess text-[#4A3F35]"></i>
              </div>
              <h3 className="font-medium">Choose Interviewer</h3>
              <p className="text-sm text-gray-600">Select your preferred chess-themed interviewer</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#F0D9B5] flex items-center justify-center mb-2">
                <i className="fas fa-comments text-[#4A3F35]"></i>
              </div>
              <h3 className="font-medium">Start Interview</h3>
              <p className="text-sm text-gray-600">Begin your personalized interview session</p>
            </div>
          </div>
        </div>
        
        {/* Upload Resume Card */}
        <Card className="relative mb-8 shadow-lg overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[5px] before:bg-[#D6A62C]">
          <CardContent className="p-6">
            {uploadStep === 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl font-bold text-[#4A3F35]">Upload Your Resume</h2>
                  <i className="fas fa-file-upload text-[#D6A62C] text-2xl"></i>
                </div>
                <p className="mb-4 text-[#2A2520] opacity-80">
                  Upload your resume to begin. We'll analyze it to personalize your interview experience.
                </p>
                <div className="border-2 border-dashed border-[#F0D9B5] rounded-lg p-8 text-center">
                  <i className="fas fa-file-alt text-4xl text-[#D6A62C] mb-3"></i>
                  <p className="mb-4">Drag and drop your resume (PDF, Word, or TXT) here, or click to browse</p>
                  <input 
                    type="file" 
                    id="resume-upload" 
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Button 
                      onClick={() => document.getElementById("resume-upload")?.click()}
                      className="bg-[#4A3F35] text-white py-2 px-6 rounded-md hover:bg-opacity-90 inline-flex items-center"
                      variant="default"
                    >
                      <i className="fas fa-upload mr-2"></i> Select Resume
                    </Button>
                    {selectedFile && (
                      <>
                        <p className="text-sm text-[#4A3F35]">{selectedFile.name}</p>
                        <Button 
                          onClick={handleResumeUpload}
                          className="bg-[#D6A62C] text-white"
                          disabled={uploadResumeMutation.isPending}
                        >
                          {uploadResumeMutation.isPending ? (
                            "Uploading..."
                          ) : (
                            <>Upload Now</>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {errorMessage && <FormError message={errorMessage} />}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl font-bold text-[#4A3F35]">Resume Uploaded</h2>
                  <i className="fas fa-check-circle text-green-500 text-2xl"></i>
                </div>
                <div className="flex items-center p-4 border border-[#F0D9B5] rounded-lg bg-white">
                  <i className="fas fa-file-alt text-3xl text-[#D6A62C] mr-4"></i>
                  <div className="flex-1">
                    <p className="font-medium">{selectedFile?.name || resumes[0]?.fileName}</p>
                    <p className="text-sm text-[#2A2520] opacity-70">Uploaded successfully</p>
                  </div>
                  <button className="text-[#D6A62C] hover:text-[#4A3F35]" onClick={() => setUploadStep(0)}>
                    <i className="fas fa-pen"></i>
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Interview Setup Card */}
        <Card className="relative mb-8 shadow-lg overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[5px] before:bg-[#D6A62C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-[#4A3F35]">Set Up Your Interview</h2>
              <i className="fas fa-chess-queen text-[#D6A62C] text-2xl"></i>
            </div>
            <p className="mb-4 text-[#2A2520] opacity-80">
              Select your target role and experience level.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="role-select">
                  Target Role
                </label>
                <Select onValueChange={setSelectedRole} value={selectedRole}>
                  <SelectTrigger className="w-full rounded-md py-2 px-3 bg-white border-[#F0D9B5]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobRoles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {experienceLevels.map(level => (
                    <button 
                      key={level.id}
                      className={`border-2 ${selectedLevel === level.id ? 'border-[#D6A62C] bg-[#F0D9B5]/30' : 'border-[#F0D9B5]'} rounded-md py-2 px-4 flex flex-col items-center hover:border-[#D6A62C] hover:bg-[#F0D9B5]/30 transition-colors`}
                      onClick={() => setSelectedLevel(level.id)}
                    >
                      <i className={`${level.icon} text-xl mb-1`}></i>
                      <span>{level.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Choose Your Interviewer</label>
                <div className="grid grid-cols-5 gap-2">
                  {interviewerCharacters.map(character => (
                    <button 
                      key={character.id}
                      className={`border-2 ${selectedInterviewer === character.id ? 'border-[#D6A62C] bg-[#F0D9B5]/30' : 'border-[#F0D9B5]'} rounded-md py-2 px-2 flex flex-col items-center hover:border-[#D6A62C] hover:bg-[#F0D9B5]/30 transition-colors`}
                      onClick={() => setSelectedInterviewer(character.id)}
                    >
                      <i className={`${character.icon} text-xl mb-1`}></i>
                      <span className="text-sm">{character.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {errorMessage && <FormError message={errorMessage} />}
              
              <div className="pt-4">
                <Button 
                  className="w-full bg-[#D6A62C] text-white py-3 px-4 rounded-md hover:bg-opacity-90 font-medium flex items-center justify-center"
                  onClick={handleStartInterview}
                  disabled={createInterviewMutation.isPending}
                >
                  <i className="fas fa-door-open mr-2"></i> 
                  {createInterviewMutation.isPending ? "Setting up..." : "Enter Interview Room"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Previous Interviews Card */}
        <Card className="relative mb-8 shadow-lg overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[5px] before:bg-[#D6A62C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-[#4A3F35]">Previous Interviews</h2>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs flex items-center gap-1 text-[#4A3F35] border-[#D6A62C] hover:bg-[#F0D9B5]"
                  onClick={() => window.open('/api/export/interviews', '_blank')}
                  disabled={interviews.length === 0}
                >
                  <i className="fas fa-file-csv text-[#D6A62C]"></i> Export CSV
                </Button>
                <i className="fas fa-history text-[#D6A62C] text-xl"></i>
              </div>
            </div>
            <p className="mb-4 text-[#2A2520] opacity-80">
              View and analyze your past interview sessions. Export your interviews to CSV for detailed analysis.
            </p>
            
            <div className="divide-y divide-[#F0D9B5]">
              {interviewsLoading ? (
                <div className="py-8 text-center text-[#2A2520] opacity-70">
                  <i className="fas fa-circle-notch fa-spin text-4xl mb-3"></i>
                  <p>Loading your interview history...</p>
                </div>
              ) : interviews.length === 0 ? (
                <div className="py-8 text-center text-[#2A2520] opacity-70">
                  <i className="fas fa-chess-board text-4xl mb-3"></i>
                  <p>No previous interviews yet. Start your first interview to see results here.</p>
                </div>
              ) : (
                interviews.map(interview => (
                  <div key={interview.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-[#4A3F35]">
                          {jobRoles.find(r => r.id === interview.targetRole)?.name || interview.targetRole}
                        </h3>
                        <p className="text-sm text-[#2A2520] opacity-70">
                          {interview.status === 'completed' ? 'Completed' : interview.status === 'in_progress' ? 'In Progress' : 'Cancelled'} • 
                          {formatDate(interview.startedAt)}
                        </p>
                      </div>
                      <Button 
                        onClick={() => setLocation(`/interview/${interview.id}`)}
                        className="bg-[#4A3F35] text-white hover:bg-[#2A2520]"
                        size="sm"
                      >
                        {interview.status === 'in_progress' ? 'Continue' : 'Review'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Interview Recordings Card */}
        <Card className="relative shadow-lg overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[5px] before:bg-[#D6A62C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-[#4A3F35]">Interview Recordings</h2>
              <div className="flex items-center gap-2">
                <i className="fas fa-video text-[#D6A62C] text-xl"></i>
              </div>
            </div>
            <p className="mb-4 text-[#2A2520] opacity-80">
              Your interview recordings are downloaded to your device when you click "Stop Recording" during an interview.
            </p>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
              <div className="flex items-start">
                <i className="fas fa-info-circle text-amber-600 text-xl mt-1 mr-3"></i>
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">Where are my recordings?</h3>
                  <p className="text-sm text-amber-700">
                    When you click "Stop Recording" in an interview, a file named <code className="bg-white px-1 py-0.5 rounded">interview-[ID].webm</code> is 
                    automatically downloaded to your default downloads folder. You can play this file using any modern web browser or media player 
                    that supports WebM format.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-[#F0D9B5] rounded-lg p-4">
                <h3 className="font-medium text-[#4A3F35] mb-2 flex items-center">
                  <i className="fas fa-folder-open text-[#D6A62C] mr-2"></i> Locate Your Recordings
                </h3>
                <p className="text-sm text-[#2A2520]">
                  Check your computer's download folder for files named <code className="bg-gray-100 px-1 py-0.5 rounded">interview-[ID].webm</code>.
                  These are your interview recordings saved in WebM format.
                </p>
              </div>
              
              <div className="bg-white border border-[#F0D9B5] rounded-lg p-4">
                <h3 className="font-medium text-[#4A3F35] mb-2 flex items-center">
                  <i className="fas fa-play-circle text-[#D6A62C] mr-2"></i> Play Recordings
                </h3>
                <p className="text-sm text-[#2A2520]">
                  Open your downloaded recording files with any modern web browser. Simply drag the file into a browser 
                  window or use File → Open to view your recordings.
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline"
                className="text-[#4A3F35] border-[#D6A62C] hover:bg-[#F0D9B5] w-full"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Cloud storage for interview recordings will be available in a future update.",
                  });
                }}
              >
                <i className="fas fa-cloud-upload-alt mr-2"></i> Looking for Cloud Storage?
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

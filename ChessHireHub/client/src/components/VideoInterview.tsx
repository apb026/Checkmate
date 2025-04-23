import { useState, useRef, useEffect } from 'react';
import RecordRTC, { RecordRTCPromisesHandler } from 'recordrtc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';

// Import SVG chess icons
import { ChessPiece, Rook, Knight, Bishop, Queen, King, Pawn } from '@/components/ChessPieceIcons';

// Import types
import { Interview, InterviewMessage } from '@/types';

// Define interview settings interface
interface InterviewSettings {
  voice: {
    accent: string;
    gender: string;
    speed: number;
    volume: number;
  };
  subtitles: boolean;
  recording: boolean;
  interviewer: string;
}

// Define available accent options
const accentOptions = [
  { label: 'American', value: 'en-US' },
  { label: 'British', value: 'en-GB' },
  { label: 'Australian', value: 'en-AU' },
  { label: 'Indian', value: 'en-IN' }
];

// Define available voice gender options
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' }
];

// Define interview personas (matching the ones in ChessBackground component)
const interviewerPersonas = {
  pawn: {
    name: "Pawn",
    title: "The Entry-Level Interviewer",
    description: "Straightforward and focused on foundational skills.",
    interviewStyle: "Covers the basics thoroughly before moving to more complex topics."
  },
  knight: {
    name: "Knight",
    title: "The Tactical Problem Solver",
    description: "Approaches interviews from unexpected angles.",
    interviewStyle: "Presents scenario-based questions and puzzles to test adaptability."
  },
  bishop: {
    name: "Bishop",
    title: "The Strategic Thinker",
    description: "Evaluates long-term potential and vision.",
    interviewStyle: "Asks about career goals and how experiences align with future plans."
  },
  rook: {
    name: "Rook",
    title: "The Technical Expert",
    description: "Direct and thorough in technical assessment.",
    interviewStyle: "Conducts deep dives into technical knowledge with practical examples."
  },
  queen: {
    name: "Queen",
    title: "The Versatile Leader",
    description: "Evaluates across multiple dimensions.",
    interviewStyle: "Combines technical, behavioral, and leadership questions."
  },
  king: {
    name: "King",
    title: "The Executive Interviewer",
    description: "Focuses on overall fit and leadership potential.",
    interviewStyle: "Assesses cultural alignment and executive presence."
  }
};

// Map chess piece name to icon component
const chessPieceIcons: Record<string, React.FC> = {
  pawn: Pawn,
  knight: Knight,
  bishop: Bishop,
  rook: Rook,
  queen: Queen,
  king: King
};

interface VideoInterviewProps {
  interview: Interview;
  messages: InterviewMessage[];
  onSendMessage: (content: string) => Promise<void>;
  onEndInterview: () => void;
}

const VideoInterview: React.FC<VideoInterviewProps> = ({
  interview,
  messages,
  onSendMessage,
  onEndInterview
}) => {
  // References for media elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<RecordRTCPromisesHandler | null>(null);
  
  // State variables
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [settings, setSettings] = useState<InterviewSettings>({
    voice: {
      accent: 'en-US',
      gender: 'female',
      speed: 1,
      volume: 1
    },
    subtitles: true,
    recording: true,
    interviewer: interview.interviewerCharacter || 'queen'
  });
  const [speechSynthesisVoices, setSpeechSynthesisVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
  
  // Start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };
  
  // Start recording
  const startRecording = async () => {
    if (!videoRef.current?.srcObject) {
      await startCamera();
    }
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      
      try {
        mediaRecorderRef.current = new RecordRTCPromisesHandler(stream, {
          type: 'video',
          mimeType: 'video/webm;codecs=vp9',
          disableLogs: true,
          videoBitsPerSecond: 128000,
          frameRate: 30
        });
        
        await mediaRecorderRef.current.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };
  
  // Stop recording
  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      try {
        await mediaRecorderRef.current.stopRecording();
        const blob = await mediaRecorderRef.current.getBlob();
        
        // Add the recorded blob to our array
        setRecordedBlobs(prevBlobs => [...prevBlobs, blob]);
        
        // Save the recording (implement this function)
        await saveRecording(blob);
        
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
  };
  
  // Save recording to Firebase Storage
  const saveRecording = async (blob: Blob) => {
    // This would be implemented with Firebase Storage
    // For now, we'll just create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `interview-${uuidv4()}.webm`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  // Speech synthesis (text-to-speech)
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice based on selected accent and gender
      const voice = speechSynthesisVoices.find(v => 
        v.lang === settings.voice.accent && 
        v.name.toLowerCase().includes(settings.voice.gender)
      );
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = settings.voice.speed;
      utterance.volume = settings.voice.volume;
      
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Speech recognition (speech-to-text)
  const startTranscription = () => {
    if ('webkitSpeechRecognition' in window) {
      // TypeScript doesn't have types for webkitSpeechRecognition
      // @ts-ignore
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = settings.voice.accent;
      
      recognition.onstart = () => {
        setIsTranscribing(true);
      };
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsTranscribing(false);
      };
      
      recognition.onend = () => {
        setIsTranscribing(false);
      };
      
      recognition.start();
      
      // Store reference for cleanup
      // @ts-ignore
      window.currentRecognition = recognition;
    }
  };
  
  const stopTranscription = () => {
    // @ts-ignore
    if (window.currentRecognition) {
      // @ts-ignore
      window.currentRecognition.stop();
      setIsTranscribing(false);
    }
  };
  
  // Handle voice settings change
  const handleSettingChange = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (parent === 'voice') {
        setSettings({
          ...settings,
          voice: {
            ...settings.voice,
            [child]: value
          }
        });
      }
    } else {
      setSettings({
        ...settings,
        [key]: value
      });
    }
  };
  
  // Submit the transcribed text as a message
  const submitTranscript = async () => {
    if (transcript.trim()) {
      await onSendMessage(transcript);
      setTranscript('');
      
      // Stop transcription after submitting
      stopTranscription();
    }
  };
  
  // Initialize speech synthesis voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setSpeechSynthesisVoices(voices);
        }
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);
  
  // Speak the AI messages when they arrive
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'ai') {
      speakMessage(lastMessage.content);
    }
  }, [messages]);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.destroy();
      }
      
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      stopTranscription();
      window.speechSynthesis.cancel();
    };
  }, []);
  
  // Get the interviewer persona
  const interviewer = interviewerPersonas[settings.interviewer as keyof typeof interviewerPersonas];
  const InterviewerIcon = chessPieceIcons[settings.interviewer] || Queen;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* Video section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span>Video Interview</span>
            {isRecording && (
              <Badge variant="destructive" className="ml-2">
                Recording
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
            
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={startCamera}>
                  Start Camera
                </Button>
              </div>
            )}
            
            {/* Subtitles overlay */}
            {settings.subtitles && speaking && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-center">
                {messages[messages.length - 1]?.content}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 w-full">
            <Button 
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!cameraActive}
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            
            <Button 
              variant={isTranscribing ? "secondary" : "outline"}
              onClick={isTranscribing ? stopTranscription : startTranscription}
              disabled={!cameraActive}
            >
              {isTranscribing ? "Stop Listening" : "Start Listening"}
            </Button>
          </div>
          
          {/* Transcript input area */}
          {isTranscribing && (
            <div className="w-full mt-4">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full h-20 p-2 border rounded"
                placeholder="Your speech will appear here..."
              />
              <Button 
                onClick={submitTranscript}
                disabled={!transcript.trim()}
                className="mt-2"
              >
                Send Message
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Interviewer section */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center">
          <div className="bg-amber-100 p-2 rounded-full mr-4">
            <InterviewerIcon />
          </div>
          <div>
            <CardTitle>{interviewer.name}</CardTitle>
            <p className="text-sm text-gray-500">{interviewer.title}</p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{interviewer.description}</p>
          <p className="text-sm italic">{interviewer.interviewStyle}</p>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="subtitles">Show Subtitles</Label>
              <Switch 
                id="subtitles"
                checked={settings.subtitles}
                onCheckedChange={(checked) => handleSettingChange('subtitles', checked)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voice-accent">Accent</Label>
                <Select 
                  value={settings.voice.accent}
                  onValueChange={(value) => handleSettingChange('voice.accent', value)}
                >
                  <SelectTrigger id="voice-accent">
                    <SelectValue placeholder="Select accent" />
                  </SelectTrigger>
                  <SelectContent>
                    {accentOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="voice-gender">Voice Gender</Label>
                <Select 
                  value={settings.voice.gender}
                  onValueChange={(value) => handleSettingChange('voice.gender', value)}
                >
                  <SelectTrigger id="voice-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="interviewer">Chess Interviewer</Label>
              <Select 
                value={settings.interviewer}
                onValueChange={(value) => handleSettingChange('interviewer', value)}
              >
                <SelectTrigger id="interviewer">
                  <SelectValue placeholder="Select interviewer" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(interviewerPersonas).map(key => (
                    <SelectItem key={key} value={key}>
                      {interviewerPersonas[key as keyof typeof interviewerPersonas].name} - {
                        interviewerPersonas[key as keyof typeof interviewerPersonas].title
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            onClick={onEndInterview}
            className="w-full"
          >
            End Interview
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VideoInterview;
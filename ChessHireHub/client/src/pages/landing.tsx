import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ChessBackground from "@/components/ChessBackground";
import { King, Queen, Knight, Bishop, Rook } from "@/components/ChessPieceIcons";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ChessBackground />
      
      {/* Navigation */}
      <header className="relative z-10 py-4 px-6 md:px-10 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/90">
            <div className="h-6 w-6 text-black">
              <King />
            </div>
          </div>
          <h1 className="ml-3 text-2xl font-semibold text-white">ChessView</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/auth">
            <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
              Login
            </Button>
          </Link>
          <Link href="/auth?register=true">
            <Button className="bg-amber-500 text-black hover:bg-amber-600">
              Get Started
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col">
        <section className="pt-10 pb-16 md:pt-20 md:pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Master Your <span className="text-amber-500">Career Game</span> With AI-Powered Interviews
              </h1>
              <p className="text-lg md:text-xl text-gray-300">
                ChessView helps you prepare for job interviews with AI interviewers that adapt to your resume 
                and provide strategic feedback - just like a chess master plans their moves.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link href="/auth?register=true">
                  <Button size="lg" className="bg-amber-500 text-black hover:bg-amber-600 w-full sm:w-auto">
                    Start Free Interview
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="lg" variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10 w-full sm:w-auto">
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                <div className="absolute top-0 left-0 w-full h-full grid grid-cols-8 grid-rows-8 opacity-70">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const isEvenRow = Math.floor(i / 8) % 2 === 0;
                    const isEvenCol = i % 8 % 2 === 0;
                    const isBlack = (isEvenRow && !isEvenCol) || (!isEvenRow && isEvenCol);
                    return (
                      <div 
                        key={i}
                        className={`${isBlack ? 'bg-amber-900/70' : 'bg-amber-100/20'} border border-amber-500/30`} 
                      />
                    );
                  })}
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="h-32 w-32 text-amber-500">
                    <King />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features */}
        <section className="py-16 px-6 md:px-10 bg-gray-900/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Strategic <span className="text-amber-500">Interview Preparation</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<div className="h-12 w-12 text-amber-500"><Knight /></div>}
                title="AI Chess Interviewers"
                description="Practice with unique AI interviewers modeled after chess pieces, each with their own interview style and approach."
              />
              <FeatureCard 
                icon={<div className="h-12 w-12 text-amber-500"><Bishop /></div>}
                title="Resume Analysis"
                description="Upload your resume for AI-powered analysis that adapts interview questions to your experience and skills."
              />
              <FeatureCard 
                icon={<div className="h-12 w-12 text-amber-500"><Rook /></div>}
                title="Video & Audio"
                description="Engage in natural video interviews with AI that speaks in different accents and can understand your verbal responses."
              />
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              What Our Users <span className="text-amber-500">Say</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <TestimonialCard 
                quote="The chess-themed AI interviewers brought a unique perspective to my prep. I felt so much more confident in my actual interview!"
                author="Sarah L."
                role="Software Engineer"
              />
              <TestimonialCard 
                quote="I was struggling with technical interviews until I started practicing with the Rook interviewer. The detailed feedback helped me understand my weaknesses."
                author="James T."
                role="Data Scientist"
              />
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 px-6 md:px-10 bg-gradient-to-r from-amber-900/40 to-gray-900/40 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to <span className="text-amber-500">Checkmate</span> Your Next Interview?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of job seekers who have improved their interview skills with ChessView's AI-powered practice.
            </p>
            <Link href="/auth?register=true">
              <Button size="lg" className="bg-amber-500 text-black hover:bg-amber-600">
                Start Free Interview
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 md:px-10 bg-gray-900/60 backdrop-blur-sm border-t border-amber-500/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/90">
              <div className="h-5 w-5 text-black">
                <King />
              </div>
            </div>
            <span className="ml-2 text-lg font-semibold text-white">ChessView</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-amber-500">About</a>
            <a href="#" className="hover:text-amber-500">Privacy</a>
            <a href="#" className="hover:text-amber-500">Terms</a>
            <a href="#" className="hover:text-amber-500">Contact</a>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-400">
            &copy; 2025 ChessView. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-amber-500/20 rounded-lg p-6 hover:border-amber-500/40 transition-colors">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white text-center mb-3">{title}</h3>
      <p className="text-gray-300 text-center">{description}</p>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ quote, author, role }: { 
  quote: string; 
  author: string; 
  role: string 
}) => {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-amber-500/20 rounded-lg p-6">
      <div className="mb-4 text-amber-500">"</div>
      <p className="text-gray-300 italic mb-6">{quote}</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
          {author.charAt(0)}
        </div>
        <div className="ml-3">
          <p className="text-white font-medium">{author}</p>
          <p className="text-gray-400 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};
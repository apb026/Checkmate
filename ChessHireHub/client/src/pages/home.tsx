import { useState } from 'react';
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormError } from "@/components/ui/form-error";
import ChessBackground from "@/components/ChessBackground";
import { Loader2 } from "lucide-react";
import { chessPiecePersonas } from "@/components/ChessBackground";

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Handle login submission
  const handleLogin = async (values: LoginFormValues) => {
    try {
      setLoginError(null);
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      
      if (res.ok) {
        setLocation("/dashboard");
      } else {
        const data = await res.json();
        setLoginError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setLoginError("An error occurred during login. Please try again.");
    }
  };
  
  // Handle register submission
  const handleRegister = async (values: RegisterFormValues) => {
    try {
      setRegisterError(null);
      
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      });
      
      if (res.ok) {
        setLocation("/dashboard");
      } else {
        const data = await res.json();
        setRegisterError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setRegisterError("An error occurred during registration. Please try again.");
    }
  };
  
  // Handle guest login
  const handleGuestLogin = async () => {
    try {
      // Generate random guest credentials
      const guestId = Math.floor(10000 + Math.random() * 90000);
      const username = `guest${guestId}`;
      const email = `guest${guestId}@example.com`;
      const password = `guest${guestId}`;
      
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });
      
      if (res.ok) {
        setLocation("/dashboard");
      } else {
        setRegisterError("Guest login failed. Please try again.");
      }
    } catch (error) {
      setRegisterError("An error occurred during guest login. Please try again.");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <ChessBackground />
      
      {/* Header Section */}
      <header className="relative z-10 py-4 px-6 md:px-10 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/90">
            <span className="text-black text-xl font-bold">♚</span>
          </div>
          <h1 className="ml-3 text-2xl font-semibold text-white">ChessView</h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl w-full bg-gray-900/50 backdrop-blur-md p-6 rounded-xl border border-amber-500/20">
          {/* Left Column - Auth Forms */}
          <div className="flex flex-col justify-center">
            <div className="mb-6 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white">
                Master Your <span className="text-amber-500">Interview Game</span>
              </h1>
              <p className="mt-2 text-gray-300">
                Practice with AI-powered chess piece interviewers and improve your career prospects
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <Card className="border-amber-500/20 bg-gray-900/50 backdrop-blur-md text-white">
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription className="text-gray-300">
                      Sign in to your account to continue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="you@example.com" 
                                  {...field}
                                  className="bg-gray-800/50 border-gray-700" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="******" 
                                  {...field}
                                  className="bg-gray-800/50 border-gray-700" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {loginError && <FormError message={loginError} />}
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-amber-500 text-black hover:bg-amber-600"
                          disabled={loginForm.formState.isSubmitting}
                        >
                          {loginForm.formState.isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Sign In
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <div className="text-sm text-gray-400 text-center">
                      Don't have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0 text-amber-400 hover:text-amber-300" 
                        onClick={() => setActiveTab("register")}
                      >
                        Register
                      </Button>
                    </div>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-gray-900/50 px-2 text-gray-400">or</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                      onClick={handleGuestLogin}
                    >
                      Continue as Guest
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register">
                <Card className="border-amber-500/20 bg-gray-900/50 backdrop-blur-md text-white">
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription className="text-gray-300">
                      Get started with your interview preparation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="johndoe" 
                                  {...field}
                                  className="bg-gray-800/50 border-gray-700" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="you@example.com" 
                                  {...field}
                                  className="bg-gray-800/50 border-gray-700" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="******" 
                                  {...field}
                                  className="bg-gray-800/50 border-gray-700" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="******" 
                                  {...field}
                                  className="bg-gray-800/50 border-gray-700" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {registerError && <FormError message={registerError} />}
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-amber-500 text-black hover:bg-amber-600"
                          disabled={registerForm.formState.isSubmitting}
                        >
                          {registerForm.formState.isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Sign Up
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <div className="text-sm text-gray-400 text-center">
                      Already have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0 text-amber-400 hover:text-amber-300" 
                        onClick={() => setActiveTab("login")}
                      >
                        Login
                      </Button>
                    </div>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-gray-900/50 px-2 text-gray-400">or</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                      onClick={handleGuestLogin}
                    >
                      Continue as Guest
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Feature Highlights */}
          <div className="hidden md:flex flex-col justify-center space-y-8 p-6">
            <h2 className="text-2xl font-semibold text-white">
              Meet Your Chess <span className="text-amber-500">Interviewers</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(chessPiecePersonas).slice(0, 4).map(([key, persona]) => (
                <Card key={key} className="bg-gray-800/40 border-amber-500/20 text-white backdrop-blur-sm">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-amber-500 text-2xl">
                        {key === 'pawn' && '♟'}
                        {key === 'knight' && '♞'}
                        {key === 'bishop' && '♝'}
                        {key === 'rook' && '♜'}
                        {key === 'queen' && '♛'}
                        {key === 'king' && '♚'}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{persona.name}</CardTitle>
                        <CardDescription className="text-xs text-gray-400">
                          {persona.title}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-gray-300">{persona.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                  ✓
                </div>
                <p className="text-gray-300 text-sm">AI-powered interview practice tailored to your experience</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                  ✓
                </div>
                <p className="text-gray-300 text-sm">Interactive video interviews with realistic AI responses</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                  ✓
                </div>
                <p className="text-gray-300 text-sm">Detailed feedback and improvement suggestions</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-6 px-6 md:px-10 text-center text-gray-400 text-sm">
        <p>© 2025 ChessView Interviews. All rights reserved.</p>
      </footer>
    </div>
  );
}
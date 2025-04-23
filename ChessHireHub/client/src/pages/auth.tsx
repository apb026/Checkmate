import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import ChessBackground from "@/components/ChessBackground";
import { signInWithGoogle } from "@/lib/firebase";

// Components
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FormError } from "@/components/ui/form-error";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

// Register schema
const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });
  
  // Handle login
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setApiError("");
    
    try {
      const response = await apiRequest(
        "POST", 
        "/api/auth/login", 
        { email: values.email, password: values.password }
      );
      
      const user = await response.json();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName || user.username}!`,
      });
      
      setLocation("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setApiError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle register
  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setApiError("");
    
    try {
      const response = await apiRequest(
        "POST", 
        "/api/auth/register", 
        {
          username: values.username,
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
        }
      );
      
      const user = await response.json();
      
      toast({
        title: "Registration successful",
        description: `Welcome to ChessView, ${user.firstName || user.username}!`,
      });
      
      setLocation("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      setApiError("Registration failed. This email or username may already be in use.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setApiError("");
    
    try {
      const user = await signInWithGoogle();
      
      toast({
        title: "Google sign-in successful",
        description: `Welcome to ChessView, ${user.firstName || user.username}!`,
      });
      
      setLocation("/dashboard");
    } catch (error) {
      console.error("Google sign-in error:", error);
      setApiError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle guest login
  const handleGuestLogin = async () => {
    setIsLoading(true);
    setApiError("");
    
    try {
      // Create a random guest username
      const guestUsername = `guest${Math.floor(Math.random() * 10000)}`;
      
      const response = await apiRequest(
        "POST", 
        "/api/auth/register", 
        {
          username: guestUsername,
          email: `${guestUsername}@guest.chessview.com`,
          password: `guest${Math.random().toString(36).slice(2, 10)}`,
          firstName: "Guest",
          lastName: "User",
        }
      );
      
      const user = await response.json();
      
      toast({
        title: "Guest access granted",
        description: "Welcome to ChessView! You're browsing as a guest user.",
      });
      
      setLocation("/dashboard");
    } catch (error) {
      console.error("Guest login error:", error);
      setApiError("Failed to create guest account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative bg-[#F8F6F0]">
      <ChessBackground />
      
      {/* Logo and Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <i className="fas fa-chess-knight text-5xl text-[#D6A62C] mr-3"></i>
          <h1 className="font-serif text-4xl font-bold text-[#4A3F35]">ChessView</h1>
        </div>
        <p className="font-accent text-xl text-[#2A2520]">Master Your Career Game</p>
      </div>
      
      {/* Auth Card */}
      <Card className="relative w-full max-w-md shadow-xl mb-8 bg-[#F8F6F0] rounded-lg overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[5px] before:bg-[#D6A62C]">
        <CardContent className="p-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#F0D9B5] mb-6">
            <button 
              className={`py-2 px-4 font-medium ${isLogin ? 'text-[#4A3F35] border-b-2 border-[#D6A62C]' : 'text-[#2A2520] opacity-70'}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button 
              className={`py-2 px-4 font-medium ${!isLogin ? 'text-[#4A3F35] border-b-2 border-[#D6A62C]' : 'text-[#2A2520] opacity-70'}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>
          
          {/* API Error Message */}
          {apiError && <FormError message={apiError} />}
          
          {/* Login Form */}
          {isLogin && (
            <>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="your@email.com" 
                            className="rounded-md py-2 px-3 bg-[#F0D9B5] border-2 border-[#4A3F35] focus:border-[#D6A62C] transition-all" 
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
                            {...field} 
                            type="password" 
                            placeholder="••••••••" 
                            className="rounded-md py-2 px-3 bg-[#F0D9B5] border-2 border-[#4A3F35] focus:border-[#D6A62C] transition-all" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                              className="h-4 w-4 rounded border-[#4A3F35] data-[state=checked]:bg-[#D6A62C] data-[state=checked]:text-white"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <a href="#" className="text-sm text-[#D6A62C] hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#4A3F35] text-white py-2 px-4 rounded-md hover:bg-opacity-90 font-medium relative overflow-hidden transition-all btn-chess"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#F8F6F0] text-[#2A2520]">Or continue with</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 font-medium flex items-center justify-center mb-4 relative overflow-hidden transition-all btn-chess"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                Sign in with Google
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-amber-200 bg-amber-50 text-amber-800 py-2 px-4 rounded-md hover:bg-amber-100 font-medium flex items-center justify-center relative overflow-hidden transition-all btn-chess"
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                <i className="fas fa-user-clock mr-2"></i>
                Continue as Guest
              </Button>
            </>
          )}
          
          {/* Register Form */}
          {!isLogin && (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="John" 
                            className="rounded-md py-2 px-3 bg-[#F0D9B5] border-2 border-[#4A3F35] focus:border-[#D6A62C] transition-all" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Doe" 
                            className="rounded-md py-2 px-3 bg-[#F0D9B5] border-2 border-[#4A3F35] focus:border-[#D6A62C] transition-all" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="your@email.com" 
                          className="rounded-md py-2 px-3 bg-[#F0D9B5] border-2 border-[#4A3F35] focus:border-[#D6A62C] transition-all" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="username" 
                          className="rounded-md py-2 px-3 bg-[#F0D9B5] border-2 border-[#4A3F35] focus:border-[#D6A62C] transition-all" 
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
                          {...field} 
                          type="password" 
                          placeholder="••••••••" 
                          className="rounded-md py-2 px-3 bg-[#F0D9B5] border-2 border-[#4A3F35] focus:border-[#D6A62C] transition-all" 
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
                          {...field} 
                          type="password" 
                          placeholder="••••••••" 
                          className="rounded-md py-2 px-3 bg-[#F0D9B5] border-2 border-[#4A3F35] focus:border-[#D6A62C] transition-all" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                          className="h-4 w-4 mt-1 rounded border-[#4A3F35] data-[state=checked]:bg-[#D6A62C] data-[state=checked]:text-white"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I agree to the <a href="#" className="text-[#D6A62C] hover:underline">Terms of Service</a> and <a href="#" className="text-[#D6A62C] hover:underline">Privacy Policy</a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#4A3F35] text-white py-2 px-4 rounded-md hover:bg-opacity-90 font-medium relative overflow-hidden transition-all btn-chess"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#F8F6F0] text-[#2A2520]">Or try without registering</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-amber-200 bg-amber-50 text-amber-800 py-2 px-4 rounded-md hover:bg-amber-100 font-medium flex items-center justify-center relative overflow-hidden transition-all btn-chess"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  <i className="fas fa-user-clock mr-2"></i>
                  Continue as Guest
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="text-center text-sm text-[#2A2520] opacity-70">
        <p>&copy; 2023 ChessView Interviews. All rights reserved.</p>
      </div>
    </div>
  );
}

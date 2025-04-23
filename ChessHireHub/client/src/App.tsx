import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import HomePage from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import InterviewRoom from "@/pages/interview-room";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

function Router() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { 
          method: "GET",
          credentials: "include"
        });
        
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          if (location !== "/" && location !== "/auth") {
            setLocation("/");
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        if (location !== "/" && location !== "/auth") {
          setLocation("/");
        }
      }
    };

    checkAuth();
  }, [location, setLocation]);

  // Don't render until we know authentication status
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Switch>
      <Route path="/" component={() => {
        // Show the home page with combined login/register/guest options if not authenticated
        // Redirect to dashboard if authenticated
        if (isAuthenticated) {
          setLocation("/dashboard");
          return null;
        } else {
          return <HomePage />;
        }
      }} />
      <Route 
        path="/dashboard" 
        component={() => {
          if (isAuthenticated) {
            return <Dashboard />;
          } else {
            setLocation("/");
            return null;
          }
        }} 
      />
      <Route 
        path="/interview/:id" 
        component={({params}) => {
          if (isAuthenticated) {
            return <InterviewRoom id={parseInt(params.id)} />;
          } else {
            setLocation("/");
            return null;
          }
        }} 
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Helmet>
        <title>ChessView Interviews</title>
        <meta name="description" content="Master your career game with AI-powered interview preparation" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@300;400;500&family=Cormorant+Garamond:wght@600&display=swap" rel="stylesheet" />
        <script src="https://kit.fontawesome.com/42d5adcbca.js" crossOrigin="anonymous"></script>
      </Helmet>
      <Router />
    </QueryClientProvider>
  );
}

export default App;

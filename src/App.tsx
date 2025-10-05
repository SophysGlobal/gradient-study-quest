import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./contexts/theme-context";
import { LoginScreen } from "./screens/auth/login-screen";
import { SignupScreen } from "./screens/auth/signup-screen";
import { QuestionnaireScreen } from "./screens/questionnaire-screen";
import { AILoadingScreen } from "./screens/ai-loading-screen";
import { SubscriptionScreen } from "./screens/subscription-screen";
import { SuccessScreen } from "./screens/success-screen";
import { DashboardScreen } from "./screens/dashboard-screen";
import { supabase } from "./integrations/supabase/client";
import { useToast } from "./components/ui/use-toast";

const queryClient = new QueryClient();

type AppState = 'login' | 'signup' | 'questionnaire' | 'loading' | 'subscription' | 'success' | 'dashboard';

interface UserData {
  name: string;
  email: string;
  usage: string;
  subjects: string[];
  theme?: string;
}

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<AppState>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Check authentication state on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check if admin mode is active (bypasses auth)
        const isAdminMode = localStorage.getItem('ada-admin-mode') === 'true';
        
        if (isAdminMode) {
          // Admin mode - check if questionnaire completed
          const savedUserData = localStorage.getItem('ada-user-data');
          if (savedUserData) {
            setUserData(JSON.parse(savedUserData));
            setCurrentScreen('dashboard');
          } else {
            setCurrentScreen('questionnaire');
          }
        } else if (session?.user) {
          setUser(session.user);
          
          // Regular user flow
          const savedUserData = localStorage.getItem('ada-user-data');
          if (savedUserData) {
            setUserData(JSON.parse(savedUserData));
            
            // Check subscription status
            const { data: subscription } = await supabase
              .from('stripe_user_subscriptions')
              .select('*')
              .maybeSingle();
            
            if (subscription && (subscription as any).subscription_status === 'active') {
              setCurrentScreen('dashboard');
            } else {
              // Check URL for success redirect
              const urlParams = new URLSearchParams(window.location.search);
              if (urlParams.get('session_id')) {
                setCurrentScreen('success');
              } else {
                setCurrentScreen('subscription');
              }
            }
          } else {
            setCurrentScreen('questionnaire');
          }
        } else {
          setCurrentScreen('login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setCurrentScreen('login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        // Navigate user after successful login
        const savedUserData = localStorage.getItem('ada-user-data');
        if (savedUserData) {
          setUserData(JSON.parse(savedUserData));
          
          // Check subscription status
          const { data: subscription } = await supabase
            .from('stripe_user_subscriptions')
            .select('*')
            .maybeSingle();
          
          if (subscription && (subscription as any).subscription_status === 'active') {
            setCurrentScreen('dashboard');
          } else {
            // Check URL for success redirect
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('session_id')) {
              setCurrentScreen('success');
            } else {
              setCurrentScreen('subscription');
            }
          }
        } else {
          setCurrentScreen('questionnaire');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserData(null);
        localStorage.removeItem('ada-user-data');
        localStorage.removeItem('ada-admin-mode');
        setCurrentScreen('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // Auth state change will handle navigation
  };

  const handleSignup = () => {
    // Auth state change will handle navigation
  };

  const handleQuestionnaireComplete = async (data: { usage: string; subjects: string[]; theme: string }) => {
    const isAdminMode = localStorage.getItem('ada-admin-mode') === 'true';

    const newUserData = {
      name: isAdminMode ? 'Admin User' : (user?.email?.split('@')[0] || 'User'),
      email: isAdminMode ? 'admin@ada.dev' : (user?.email || ''),
      usage: data.usage,
      subjects: data.subjects,
      theme: data.theme
    };

    setUserData(newUserData);
    localStorage.setItem('ada-user-data', JSON.stringify(newUserData));

    // Save questionnaire data to database
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: authUser.id,
            usage_type: data.usage,
            selected_subjects: data.subjects,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }

    setCurrentScreen('loading');
  };

  const handleAILoadingComplete = () => {
    setCurrentScreen('subscription');
  };

  const handlePlanSelect = (plan: string, billing: 'monthly' | 'yearly') => {
    // Subscription screen handles the actual checkout
    console.log(`Selected plan: ${plan} (${billing})`);
  };

  const handleSuccessContinue = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-gradient-purple border-t-transparent rounded-full"></div>
            </div>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          
          <div className="app-container bg-background text-foreground min-h-screen">
            {currentScreen === 'login' && (
              <LoginScreen 
                onLogin={handleLogin}
                onNavigateToSignup={() => setCurrentScreen('signup')}
              />
            )}
            
            {currentScreen === 'signup' && (
              <SignupScreen 
                onSignup={handleSignup}
                onNavigateToLogin={() => setCurrentScreen('login')}
              />
            )}
            
            {currentScreen === 'questionnaire' && (
              <QuestionnaireScreen onComplete={handleQuestionnaireComplete} />
            )}
            
            {currentScreen === 'loading' && userData && (
              <AILoadingScreen 
                onComplete={handleAILoadingComplete} 
                userInfo={{
                  usage: userData.usage,
                  subjects: userData.subjects,
                  theme: userData.theme || 'dark'
                }}
              />
            )}
            
            {currentScreen === 'subscription' && (
              <SubscriptionScreen onSelectPlan={handlePlanSelect} />
            )}
            
            {currentScreen === 'success' && (
              <SuccessScreen onContinue={handleSuccessContinue} />
            )}
            
            {currentScreen === 'dashboard' && userData && (
              <DashboardScreen 
                user={userData}
                selectedSubjects={userData.subjects}
                onLogout={handleLogout}
              />
            )}
          </div>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
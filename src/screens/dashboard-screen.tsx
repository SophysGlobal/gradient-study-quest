import React, { useState, useEffect } from 'react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { GradientCard } from '@/components/ui/gradient-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { ParticleBackground } from '@/components/animations/particle-background';
import { QuickQuiz } from '@/components/mini-games/quick-quiz';
import { MemoryMatch } from '@/components/mini-games/memory-match';
import { TimeTrial } from '@/components/mini-games/time-trial';
import { WordScramble } from '@/components/mini-games/word-scramble';
import { SpeedMatch } from '@/components/mini-games/speed-match';
import { AITutorScreen } from './ai-tutor-screen';
import { LearnScreen } from './learn-screen';
import { QuestsScreen } from './quests-screen';
import { AppSettings } from '@/components/app-settings';
import { MiniGameLauncher } from '@/components/mini-game-launcher';
import { MiniGameUpgradeModal } from '@/components/mini-game-upgrade-modal';
import { GamesScreen } from './games-screen';
import { useTheme } from '@/contexts/theme-context';
import { supabase } from '@/integrations/supabase/client';
import { getProductByPriceId } from '@/stripe-config';
import { Star, Target, Trophy, Zap, Brain, Timer, Shuffle, Flame, Award, RotateCcw, ChevronDown, ChevronLeft, ChevronRight, User, Settings, CreditCard, Bell, Shield, CircleHelp as HelpCircle, Moon, Sun, Mail, Phone, Calendar, MapPin, CreditCard as Edit, LogOut, Crown, Sparkles, Grid2x2 as Grid, BookOpen, CircleCheck as CheckCircle } from 'lucide-react';
import { Gamepad2 } from 'lucide-react';
import { NotificationSettingsModal } from '@/components/notification-settings-modal';
import { PrivacySettingsModal } from '@/components/privacy-settings-modal';
import { useToast } from '@/hooks/use-toast';

interface DashboardScreenProps {
  user: {
    name: string;
  };
  selectedSubjects: string[];
  onLogout: () => void;
}

const minigames = [
  {
    id: 'quick-quiz',
    title: 'Quick Quiz',
    description: 'Rapid-fire questions',
    icon: Zap,
    xpReward: 25,
    difficulty: 'Easy',
    requiresPremium: false
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Match concepts',
    icon: Brain,
    xpReward: 35,
    difficulty: 'Medium',
    requiresPremium: false
  },
  {
    id: 'time-trial',
    title: 'Time Trial',
    description: 'Beat the clock',
    icon: Timer,
    xpReward: 50,
    difficulty: 'Hard',
    requiresPremium: false
  },
  {
    id: 'word-scramble',
    title: 'Word Scramble',
    description: 'Unscramble terms',
    icon: Shuffle,
    xpReward: 30,
    difficulty: 'Medium',
    requiresPremium: false
  },
  {
    id: 'speed-match',
    title: 'Speed Match',
    description: 'Quick matching',
    icon: Flame,
    xpReward: 40,
    difficulty: 'Hard',
    requiresPremium: false
  },
  {
    id: 'pattern-puzzle',
    title: 'Pattern Puzzle',
    description: 'Solve number patterns',
    icon: Sparkles,
    xpReward: 60,
    difficulty: 'Hard',
    requiresPremium: true
  },
  {
    id: 'logic-grid',
    title: 'Logic Grid',
    description: 'Mini Sudoku puzzles',
    icon: Grid,
    xpReward: 70,
    difficulty: 'Expert',
    requiresPremium: true
  }
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  selectedSubjects,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSubject, setSelectedSubject] = useState(selectedSubjects[0] || '');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showMiniGameUpgrade, setShowMiniGameUpgrade] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [userTokens, setUserTokens] = useState(1250);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();
        
        setSubscriptionData(data as any);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    fetchSubscription();
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getSubscriptionInfo = () => {
    if (!subscriptionData?.price_id) return null;
    const product = getProductByPriceId(subscriptionData.price_id);
    return product;
  };

  if (activeTab === 'dashboard') {
    const subscriptionInfo = getSubscriptionInfo();
    
    return <div className="min-h-screen bg-background relative pb-20">
        <ParticleBackground />

        <div className="relative z-10 p-6 space-y-6">
          {/* Greeting Header */}
          <div className="text-center stagger-item">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-text-primary">
                  {getGreeting()}, {user.name}
                </h1>
                <p className="text-text-secondary">Ready to level up your knowledge?</p>
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={onLogout}
                  className="gradient-outline rounded-lg p-1 hover:scale-105 transition-transform"
                  title="Log Out"
                >
                  <div className="gradient-outline-content rounded-lg p-2">
                    <LogOut className="w-5 h-5 text-gradient-purple" />
                  </div>
                </button>
              </div>
            </div>
            
            {/* Subscription Status */}
            {subscriptionInfo && (
              <div className="mt-4 flex justify-center">
                <div className="gradient-outline rounded-full p-1">
                  <div className="gradient-outline-content rounded-full px-4 py-2 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-gradient-orange" />
                    <span className="text-sm font-semibold gradient-text">
                      {subscriptionInfo.name.includes('Personal+') ? 'Personal+' : 'Personal'} Plan
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Streak Counter */}
            <div className="mt-4 flex justify-center">
              <div className="gradient-outline rounded-full p-1">
                <div className="gradient-outline-content rounded-full px-4 py-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gradient-orange" />
                  <span className="text-sm font-semibold gradient-text">7 Day Streak!</span>
                  <Zap className="w-4 h-4 text-gradient-orange" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 stagger-item">
            <GradientCard className="cursor-pointer hover:scale-[1.02] transition-transform">
              <div 
                className="flex items-center gap-3 p-4"
                onClick={() => setActiveTab('learn')}
              >
                <div className="gradient-outline rounded-lg p-1">
                  <div className="gradient-outline-content rounded-lg p-2">
                    <BookOpen className="w-6 h-6 text-gradient-purple" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">Start Learning</h3>
                  <p className="text-xs text-text-secondary">Study tools & modes</p>
                </div>
              </div>
            </GradientCard>

            <GradientCard className="cursor-pointer hover:scale-[1.02] transition-transform">
              <div 
                className="flex items-center gap-3 p-4"
                onClick={() => setActiveTab('games')}
              >
                <div className="gradient-outline rounded-lg p-1">
                  <div className="gradient-outline-content rounded-lg p-2">
                    <Gamepad2 className="w-6 h-6 text-gradient-orange" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">All Games</h3>
                  <p className="text-xs text-text-secondary">Mini-games & challenges</p>
                </div>
              </div>
            </GradientCard>
          </div>

          {/* Progress Overview */}
          <div className="space-y-4 stagger-item">
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gradient-orange" />
              Your Progress
            </h2>
            
            {/* Weekly Progress Chart */}
            <GradientCard className="stagger-item">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text-primary">This Week</h3>
                  <span className="text-sm text-gradient-purple font-medium">7 days active</span>
                </div>
                
                <div className="flex items-end justify-between gap-2 h-24">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const height = [60, 80, 45, 90, 75, 100, 85][index];
                    return (
                      <div key={day} className="flex flex-col items-center gap-2 flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500 to-orange-500 rounded-t-lg transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-text-muted">{day}</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-text-secondary">
                    <span className="text-gaming-xp font-semibold">+420 XP</span> earned this week
                  </p>
                </div>
              </div>
            </GradientCard>
            
            {/* Subject Progress */}
            <GradientCard className="stagger-item">
              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary">Subject Mastery</h3>
                
                <div className="space-y-3">
                  {selectedSubjects.slice(0, 4).map((subject, index) => {
                    const progress = [85, 72, 91, 68][index] || 75;
                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-text-primary">{subject}</span>
                          <span className="text-sm text-gradient-purple font-semibold">{progress}%</span>
                        </div>
                        <div className="gradient-outline rounded-full p-1">
                          <div className="gradient-outline-content rounded-full">
                            <div className="w-full bg-surface-muted rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {selectedSubjects.length > 4 && (
                  <div className="text-center">
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className="text-sm text-gradient-purple font-medium hover:underline"
                    >
                      View all {selectedSubjects.length} subjects →
                    </button>
                  </div>
                )}
              </div>
            </GradientCard>
            
            {/* Study Statistics */}
            <div className="grid grid-cols-2 gap-4 stagger-item">
              <GradientCard>
                <div className="text-center space-y-3 p-4">
                  <div className="gradient-outline rounded-full p-1 w-16 h-16 mx-auto">
                    <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gradient-purple" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gradient-purple">142</p>
                    <p className="text-sm text-text-muted">Cards Studied</p>
                  </div>
                </div>
              </GradientCard>
              
              <GradientCard>
                <div className="text-center space-y-3 p-4">
                  <div className="gradient-outline rounded-full p-1 w-16 h-16 mx-auto">
                    <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                      <Target className="w-8 h-8 text-gradient-orange" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gradient-orange">89%</p>
                    <p className="text-sm text-text-muted">Accuracy Rate</p>
                  </div>
                </div>
              </GradientCard>
            </div>
            
            {/* Recent Achievements */}
            <GradientCard className="stagger-item">
              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Award className="w-5 h-5 text-gradient-orange" />
                  Recent Achievements
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted">
                    <div className="gradient-outline rounded-full p-1">
                      <div className="gradient-outline-content rounded-full p-2">
                        <Flame className="w-5 h-5 text-gradient-orange" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">7-Day Streak!</p>
                      <p className="text-sm text-text-secondary">Keep up the momentum</p>
                    </div>
                    <span className="text-xs text-gaming-xp font-semibold">+50 XP</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted">
                    <div className="gradient-outline rounded-full p-1">
                      <div className="gradient-outline-content rounded-full p-2">
                        <Star className="w-5 h-5 text-gradient-purple" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">Quiz Master</p>
                      <p className="text-sm text-text-secondary">Scored 90%+ on 5 quizzes</p>
                    </div>
                    <span className="text-xs text-gaming-xp font-semibold">+100 XP</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted">
                    <div className="gradient-outline rounded-full p-1">
                      <div className="gradient-outline-content rounded-full p-2">
                        <Brain className="w-5 h-5 text-gradient-orange" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">Study Champion</p>
                      <p className="text-sm text-text-secondary">Studied 100+ flashcards</p>
                    </div>
                    <span className="text-xs text-gaming-xp font-semibold">+75 XP</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="text-sm text-gradient-purple font-medium hover:underline"
                  >
                    View all achievements →
                  </button>
                </div>
              </div>
            </GradientCard>
            
            {/* Study Goals */}
            <GradientCard className="stagger-item">
              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Target className="w-5 h-5 text-gradient-purple" />
                  Today's Goals
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gaming-success flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-text-primary">Study 20 flashcards</span>
                    </div>
                    <span className="text-xs text-gaming-success font-semibold">20/20</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="gradient-outline rounded-full p-1">
                        <div className="gradient-outline-content rounded-full p-1">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-orange-500" />
                        </div>
                      </div>
                      <span className="text-sm text-text-primary">Complete 2 quizzes</span>
                    </div>
                    <span className="text-xs text-gradient-purple font-semibold">1/2</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-2 border-surface-muted flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-surface-muted" />
                      </div>
                      <span className="text-sm text-text-primary">Play 1 mini-game</span>
                    </div>
                    <span className="text-xs text-text-muted font-semibold">0/1</span>
                  </div>
                </div>
                
                <div className="gradient-outline rounded-full p-1">
                  <div className="gradient-outline-content rounded-full">
                    <div className="w-full bg-surface-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: '67%' }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-text-secondary">
                    <span className="text-gradient-purple font-semibold">2/3</span> goals completed today
                  </p>
                </div>
              </div>
            </GradientCard>
          </div>

          {/* Active Game Modal */}
          {activeGame && <div className="fixed inset-0 w-screen h-screen bg-background/80 backdrop-blur-sm z-[9999] overflow-y-auto !m-0 top-0 left-0">
              <div className="max-w-2xl mx-auto p-4">
                <MiniGameLauncher gameId={activeGame} subject={selectedSubject} onClose={() => setActiveGame(null)} />
              </div>
            </div>}

          {/* App Settings Modal - Show on any tab */}
          {showAppSettings && <AppSettings onClose={() => setShowAppSettings(false)} />}

          {/* Mini Game Upgrade Modal */}
          <MiniGameUpgradeModal 
            isOpen={showMiniGameUpgrade} 
            onClose={() => setShowMiniGameUpgrade(false)} 
          />
        </div>

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>;
  }

  // AI Tutor Tab
  if (activeTab === 'ai-tutor') {
    const subscriptionInfo = getSubscriptionInfo();
    const subscriptionTier = subscriptionInfo?.name.includes('Personal+') ? 'Premium' : 
                            subscriptionInfo?.name.includes('Enterprise') ? 'Enterprise' : 'Basic';
    
    return (
      <>
        <AITutorScreen 
          user={user} 
          selectedSubjects={selectedSubjects} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          subscriptionTier={subscriptionTier}
          onUpgrade={() => setActiveTab('profile')} // Navigate to profile for subscription management
        />
        {/* App Settings Modal - Global */}
        {showAppSettings && <AppSettings onClose={() => setShowAppSettings(false)} />}
      </>
    );
  }

  // Learn Mode Tab
  if (activeTab === 'learn') {
    const subscriptionInfo = getSubscriptionInfo();
    const subscriptionTier = subscriptionInfo?.name.includes('Personal+') ? 'Premium' : 
                            subscriptionInfo?.name.includes('Enterprise') ? 'Enterprise' : 'Basic';
    
    return (
      <>
        <div className="min-h-screen bg-background relative pb-20">
          <ParticleBackground />
          <div className="relative z-10 p-6 page-content">
            <LearnScreen 
              selectedSubjects={selectedSubjects} 
              subscriptionTier={subscriptionTier}
            />
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {/* App Settings Modal - Global */}
        {showAppSettings && <AppSettings onClose={() => setShowAppSettings(false)} />}
      </>
    );
  }

  // Quests Tab
  if (activeTab === 'quests') {
    return <>
        <QuestsScreen activeTab={activeTab} onTabChange={setActiveTab} />
        {/* App Settings Modal - Global */}
        {showAppSettings && <AppSettings onClose={() => setShowAppSettings(false)} />}
      </>;
  }

  // Store Tab
  if (activeTab === 'games') {
    const subscriptionInfo = getSubscriptionInfo();
    const subscriptionTier = subscriptionInfo?.name.includes('Personal+') ? 'Premium' : 
                            subscriptionInfo?.name.includes('Enterprise') ? 'Enterprise' : 'Basic';
    
    return (
      <>
        <GamesScreen 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          selectedSubjects={selectedSubjects}
          subscriptionTier={subscriptionTier}
        />
        {/* App Settings Modal - Global */}
        {showAppSettings && <AppSettings onClose={() => setShowAppSettings(false)} />}
      </>
    );
  }

  // Store Tab
  if (activeTab === 'store') {
    const handlePurchase = (cost: number, itemName: string) => {
      if (userTokens >= cost) {
        setUserTokens(prev => prev - cost);
        toast({
          title: "Purchase Successful!",
          description: `You bought ${itemName} for ${cost} tokens`,
        });
      } else {
        toast({
          title: "Insufficient Tokens",
          description: `You need ${cost - userTokens} more tokens`,
          variant: "destructive"
        });
      }
    };

    return <div className="min-h-screen bg-background relative pb-20">
        <ParticleBackground />
        <div className="relative z-10 p-6 space-y-6">
          <div className="text-center space-y-4 stagger-item">
            <h1 className="text-2xl font-bold text-text-primary">Token Store</h1>
            <p className="text-text-secondary">Spend your tokens on avatars, power-ups, and special items!</p>

            <div className="gradient-outline rounded-full p-1 inline-block mt-2">
              <div className="gradient-outline-content rounded-full px-4 py-1">
                <span className="gradient-text font-semibold">🪙 {userTokens.toLocaleString()} Tokens</span>
              </div>
            </div>
          </div>
          
          {/* Avatars */}
          <div className="space-y-3 stagger-item">
            <h2 className="text-lg font-semibold gradient-text">Avatars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🐱</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Scholar Cat</h3>
                      <p className="text-sm text-text-secondary">Wise feline companion</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(300, 'Scholar Cat')}
                    disabled={userTokens < 300}
                  >
                    300 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🦉</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Wise Owl</h3>
                      <p className="text-sm text-text-secondary">Nocturnal study buddy</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(400, 'Wise Owl')}
                    disabled={userTokens < 400}
                  >
                    400 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🐉</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Study Dragon</h3>
                      <p className="text-sm text-text-secondary">Mythical learning companion</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(750, 'Study Dragon')}
                    disabled={userTokens < 750}
                  >
                    750 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <h3 className="font-medium text-text-primary">AI Assistant</h3>
                      <p className="text-sm text-text-secondary">Future tech avatar</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(600, 'AI Assistant')}
                    disabled={userTokens < 600}
                  >
                    600 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧙‍♂️</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Study Wizard</h3>
                      <p className="text-sm text-text-secondary">Magical learning guide</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(850, 'Study Wizard')}
                    disabled={userTokens < 850}
                  >
                    850 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🦄</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Unicorn Scholar</h3>
                      <p className="text-sm text-text-secondary">Rare mythical companion</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(1200, 'Unicorn Scholar')}
                    disabled={userTokens < 1200}
                  >
                    1200 🪙
                  </GradientButton>
                </div>
              </GradientCard>
            </div>
          </div>

          {/* Power-ups */}
          <div className="space-y-3 stagger-item">
            <h2 className="text-lg font-semibold gradient-text">Power-ups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Streak Freeze</h3>
                      <p className="text-sm text-text-secondary">Protect your streak for 1 day</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(100, 'Streak Freeze')}
                    disabled={userTokens < 100}
                  >
                    100 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h3 className="font-medium text-text-primary">XP Booster</h3>
                      <p className="text-sm text-text-secondary">Double XP for 1 hour</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(150, 'XP Booster')}
                    disabled={userTokens < 150}
                  >
                    150 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💎</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Gem Multiplier</h3>
                      <p className="text-sm text-text-secondary">2x tokens for next game</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(200, 'Gem Multiplier')}
                    disabled={userTokens < 200}
                  >
                    200 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Fire Boost</h3>
                      <p className="text-sm text-text-secondary">Triple XP for 30 minutes</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(250, 'Fire Boost')}
                    disabled={userTokens < 250}
                  >
                    250 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Perfect Shot</h3>
                      <p className="text-sm text-text-secondary">Guarantee next answer correct</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(300, 'Perfect Shot')}
                    disabled={userTokens < 300}
                  >
                    300 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Time Warp</h3>
                      <p className="text-sm text-text-secondary">Add 30 seconds to any game</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(180, 'Time Warp')}
                    disabled={userTokens < 180}
                  >
                    180 🪙
                  </GradientButton>
                </div>
              </GradientCard>
            </div>
          </div>

          {/* Special Items */}
          <div className="space-y-3 stagger-item">
            <h2 className="text-lg font-semibold gradient-text">Special Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Accuracy Badge</h3>
                      <p className="text-sm text-text-secondary">Perfect score achievement</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(500, 'Accuracy Badge')}
                    disabled={userTokens < 500}
                  >
                    500 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👑</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Master Crown</h3>
                      <p className="text-sm text-text-secondary">Complete subject mastery</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(1000, 'Master Crown')}
                    disabled={userTokens < 1000}
                  >
                    1000 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Star Collector</h3>
                      <p className="text-sm text-text-secondary">Legendary achievement badge</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(800, 'Star Collector')}
                    disabled={userTokens < 800}
                  >
                    800 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💫</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Cosmic Badge</h3>
                      <p className="text-sm text-text-secondary">Ultimate mastery symbol</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(1500, 'Cosmic Badge')}
                    disabled={userTokens < 1500}
                  >
                    1500 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎨</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Theme Pack</h3>
                      <p className="text-sm text-text-secondary">Exclusive color themes</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(400, 'Theme Pack')}
                    disabled={userTokens < 400}
                  >
                    400 🪙
                  </GradientButton>
                </div>
              </GradientCard>
              <GradientCard className="cursor-pointer hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <h3 className="font-medium text-text-primary">Study Sounds</h3>
                      <p className="text-sm text-text-secondary">Focus music pack</p>
                    </div>
                  </div>
                  <GradientButton 
                    size="sm"
                    onClick={() => handlePurchase(350, 'Study Sounds')}
                    disabled={userTokens < 350}
                  >
                    350 🪙
                  </GradientButton>
                </div>
              </GradientCard>
            </div>
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* App Settings Modal - Global */}
        {showAppSettings && <AppSettings onClose={() => setShowAppSettings(false)} />}
      </div>;
  }

  // Profile Tab (default)
  const subscriptionInfo = getSubscriptionInfo();

  return <div className="min-h-screen bg-background relative pb-16">
      <ParticleBackground />

      <div className="relative z-10 p-6 space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-4 stagger-item">
          <div className="gradient-outline rounded-full p-1 w-24 h-24 mx-auto">
            <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
              <User className="w-12 h-12 text-gradient-purple" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">{user.name}</h1>
            <p className="text-text-secondary">Student • Level 12</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="text-center">
                <p className="text-sm text-gaming-xp font-semibold">2,450 XP</p>
                <p className="text-xs text-text-muted">Experience</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-token-silver font-semibold">1,250</p>
                <p className="text-xs text-text-muted">Tokens</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gaming-success font-semibold">7 Days</p>
                <p className="text-xs text-text-muted">Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        {subscriptionInfo && (
          <GradientCard className="stagger-item">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold gradient-text">Subscription</h2>
                <Crown className="w-5 h-5 text-gradient-orange" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Plan</span>
                  <span className="font-semibold text-gradient-purple">
                    {subscriptionInfo.name.includes('Personal+') ? 'Personal+' : 'Personal'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Price</span>
                  <span className="text-gaming-success font-semibold">
                    ${subscriptionInfo.price}/{subscriptionInfo.interval}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Status</span>
                  <span className="text-gaming-success font-medium capitalize">
                    {subscriptionData?.subscription_status || 'Active'}
                  </span>
                </div>
                
                {subscriptionData?.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">Next billing</span>
                    <span className="text-text-secondary text-sm">
                      {new Date(subscriptionData.current_period_end * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </GradientCard>
        )}

        {/* Personal Information */}
        <GradientCard className="stagger-item">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold gradient-text">Personal Information</h2>
              <Edit className="w-5 h-5 text-text-secondary cursor-pointer hover:text-text-primary transition-colors" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gradient-purple" />
                <div>
                  <p className="text-sm text-text-muted">Email</p>
                  <p className="text-text-primary">{user.name}@email.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gradient-purple" />
                <div>
                  <p className="text-sm text-text-muted">Member Since</p>
                  <p className="text-text-primary">January 2024</p>
                </div>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Account Settings */}
        <GradientCard className="stagger-item">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold gradient-text">Account Settings</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gradient-orange" />
                  <span className="text-text-primary">Notifications</span>
                </div>
                <button 
                  onClick={() => setShowNotificationSettings(true)}
                  className="text-sm gradient-text font-medium hover:scale-105 transition-transform"
                >
                  Manage
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gradient-purple" />
                  <span className="text-text-primary">Privacy & Security</span>
                </div>
                <button 
                  onClick={() => setShowPrivacySettings(true)}
                  className="text-sm gradient-text font-medium hover:scale-105 transition-transform"
                >
                  Settings
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-gradient-orange" /> : <Sun className="w-5 h-5 text-gradient-orange" />}
                  <span className="text-text-primary">Theme</span>
                </div>
                <button onClick={toggleTheme} className="text-sm gradient-text font-medium capitalize">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Study Statistics */}
        <GradientCard className="stagger-item">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold gradient-text">Study Statistics</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="gradient-outline rounded-lg p-1 mb-2">
                  <div className="gradient-outline-content rounded-lg p-3">
                    <p className="text-2xl font-bold text-gradient-purple">142</p>
                    <p className="text-xs text-text-muted">Cards Studied</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="gradient-outline rounded-lg p-1 mb-2">
                  <div className="gradient-outline-content rounded-lg p-3">
                    <p className="text-2xl font-bold text-gradient-orange">89%</p>
                    <p className="text-xs text-text-muted">Accuracy Rate</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="gradient-outline rounded-lg p-1 mb-2">
                  <div className="gradient-outline-content rounded-lg p-3">
                    <p className="text-2xl font-bold text-gaming-success">24</p>
                    <p className="text-xs text-text-muted">Quests Completed</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="gradient-outline rounded-lg p-1 mb-2">
                  <div className="gradient-outline-content rounded-lg p-3">
                    <p className="text-2xl font-bold text-gaming-xp">15</p>
                    <p className="text-xs text-text-muted">Achievements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Achievements */}
        <GradientCard className="stagger-item">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold gradient-text flex items-center gap-2">
              <Award className="w-5 h-5 text-gradient-orange" />
              Achievements
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted">
                <div className="gradient-outline rounded-full p-1">
                  <div className="gradient-outline-content rounded-full p-2">
                    <Flame className="w-5 h-5 text-gradient-orange" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">7-Day Streak!</p>
                  <p className="text-sm text-text-secondary">Keep up the momentum</p>
                </div>
                <span className="text-xs text-gaming-xp font-semibold">+50 XP</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted">
                <div className="gradient-outline rounded-full p-1">
                  <div className="gradient-outline-content rounded-full p-2">
                    <Star className="w-5 h-5 text-gradient-purple" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">Quiz Master</p>
                  <p className="text-sm text-text-secondary">Scored 90%+ on 5 quizzes</p>
                </div>
                <span className="text-xs text-gaming-xp font-semibold">+100 XP</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted">
                <div className="gradient-outline rounded-full p-1">
                  <div className="gradient-outline-content rounded-full p-2">
                    <Brain className="w-5 h-5 text-gradient-orange" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">Study Champion</p>
                  <p className="text-sm text-text-secondary">Studied 100+ flashcards</p>
                </div>
                <span className="text-xs text-gaming-xp font-semibold">+75 XP</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted">
                <div className="gradient-outline rounded-full p-1">
                  <div className="gradient-outline-content rounded-full p-2">
                    <Target className="w-5 h-5 text-gradient-purple" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">Perfect Score</p>
                  <p className="text-sm text-text-secondary">100% accuracy on quiz</p>
                </div>
                <span className="text-xs text-gaming-xp font-semibold">+150 XP</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted">
                <div className="gradient-outline rounded-full p-1">
                  <div className="gradient-outline-content rounded-full p-2">
                    <Trophy className="w-5 h-5 text-gradient-orange" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">Quick Learner</p>
                  <p className="text-sm text-text-secondary">Completed 10 lessons in one day</p>
                </div>
                <span className="text-xs text-gaming-xp font-semibold">+80 XP</span>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Support & Help */}
        <GradientCard className="stagger-item">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold gradient-text">Support & Help</h2>
            
            <div className="space-y-3">
              <button className="flex items-center gap-3 w-full text-left hover:bg-surface-muted rounded-lg p-2 transition-colors">
                <HelpCircle className="w-5 h-5 text-gradient-purple" />
                <span className="text-text-primary">Help Center</span>
              </button>
              
              <button onClick={() => {
              const emailSubject = encodeURIComponent('ADA App Support Request');
              const emailBody = encodeURIComponent('Hello ADA Support Team,\n\nI need assistance with:\n\n[Please describe your issue here]\n\nThanks!');
              window.open(`mailto:adacompanyus@gmail.com?subject=${emailSubject}&body=${emailBody}`, '_blank');
            }} className="flex items-center gap-3 w-full text-left hover:bg-surface-muted rounded-lg p-2 transition-colors">
                <Mail className="w-5 h-5 text-gradient-orange" />
                <span className="text-text-primary">Contact Support</span>
              </button>
              
              <button onClick={() => setShowAppSettings(true)} className="flex items-center gap-3 w-full text-left hover:bg-surface-muted rounded-lg p-2 transition-colors">
                <Settings className="w-5 h-5 text-gradient-purple" />
                <span className="text-text-primary">App Settings</span>
              </button>
            </div>
          </div>
        </GradientCard>

        {/* Logout */}
        <GradientCard className="cursor-pointer hover:scale-[1.02] stagger-item">
          <button onClick={onLogout} className="flex items-center justify-center gap-3 w-full text-error">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </GradientCard>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* App Settings Modal - Global */}
      {showAppSettings && <AppSettings onClose={() => setShowAppSettings(false)} />}
      
      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
      
      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={showPrivacySettings}
        onClose={() => setShowPrivacySettings(false)}
      />
    </div>;
};
import React, { useState, useEffect, useRef } from 'react';
import { ParticleBackground } from '@/components/animations/particle-background';
import { GradientCard } from '@/components/ui/gradient-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { GradientInput } from '@/components/ui/gradient-input';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { MiniGameUpgradeModal } from '@/components/mini-game-upgrade-modal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { usePromptLimits } from '@/hooks/use-prompt-limits';
import { Bot, Send, User, Loader as Loader2, Brain, Sparkles, MessageCircle, Check } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AITutorScreenProps {
  user: {
    name: string;
  };
  selectedSubjects: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  subscriptionTier?: string;
  onUpgrade?: () => void;
}

export const AITutorScreen: React.FC<AITutorScreenProps> = ({
  user,
  selectedSubjects,
  activeTab,
  onTabChange,
  subscriptionTier,
  onUpgrade
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusSubjects, setFocusSubjects] = useState<string[]>(selectedSubjects);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitType, setLimitType] = useState<'daily' | 'monthly'>('daily');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { usage, incrementUsage, hasUnlimitedPrompts } = usePromptLimits(subscriptionTier);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Initialize with welcome message
  useEffect(() => {
    const subjectText = focusSubjects.length === selectedSubjects.length ? 'all your subjects' : focusSubjects.join(', ');
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `${getGreeting()}, ${user.name}! I am your AI tutor and I am here to answer any questions you have, or any type of review you would like to do. I'm currently focusing on: ${subjectText}.`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [user.name, focusSubjects, selectedSubjects.length]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check prompt limits for Personal plan users
    if (!hasUnlimitedPrompts && !usage.canUsePrompt) {
      // Determine which limit was hit
      if (usage.dailyUsed >= usage.dailyLimit) {
        setLimitType('daily');
      } else if (usage.monthlyUsed >= usage.monthlyLimit) {
        setLimitType('monthly');
      }
      setShowUpgradeModal(true);
      return;
    }

    // Track usage for Personal plan users
    if (!hasUnlimitedPrompts) {
      const success = await incrementUsage();
      if (!success) return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          type: 'explanation',
          subject: focusSubjects.join(', '),
          prompt: inputMessage
        }
      });

      if (error) throw error;

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to get response from AI tutor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background relative pb-16">
      <ParticleBackground />

      <div className="relative z-10 flex flex-col h-screen">
        <style>{`
          @keyframes staggerFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .ai-tutor-item {
            animation: staggerFadeIn 0.4s ease-out forwards;
            opacity: 0;
          }
          .ai-tutor-item:nth-child(1) { animation-delay: 0.05s; }
          .ai-tutor-item:nth-child(2) { animation-delay: 0.1s; }
          .ai-tutor-item:nth-child(3) { animation-delay: 0.15s; }
          .ai-tutor-item:nth-child(4) { animation-delay: 0.2s; }
        `}</style>
        {/* Header */}
        <div className="flex-shrink-0 p-3 border-b border-card-border bg-surface/70 backdrop-blur-md ai-tutor-item sticky top-0 z-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="gradient-outline rounded-full p-1">
              <div className="gradient-outline-content rounded-full p-1.5">
                <Bot className="w-5 h-5 text-gradient-purple" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-text-primary">AI Tutor</h1>
              <p className="text-xs text-text-secondary truncate">Focus: {focusSubjects.join(', ')}</p>
            </div>
            {!hasUnlimitedPrompts && (
              <div className="text-right flex-shrink-0">
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="gradient-outline rounded-lg p-1 hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="gradient-outline-content px-2 py-1 bg-surface/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-medium text-gradient-purple">{usage.dailyUsed}/{usage.dailyLimit}</div>
                        <div className="text-xs font-medium text-gradient-orange">{usage.monthlyUsed}/{usage.monthlyLimit}</div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Subject Selection */}
          <div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFocusSubjects(selectedSubjects)}
                className={`px-2 py-0.5 rounded-full text-xs transition-all ${
                  focusSubjects.length === selectedSubjects.length
                    ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                    : 'bg-surface-muted text-text-secondary hover:bg-surface-hover'
                }`}
              >
                ALL
              </button>
              {selectedSubjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => {
                    if (focusSubjects.includes(subject)) {
                      setFocusSubjects(focusSubjects.filter(s => s !== subject));
                    } else {
                      setFocusSubjects([...focusSubjects, subject]);
                    }
                  }}
                  className={`px-2 py-0.5 rounded-full text-xs transition-all ${
                    focusSubjects.includes(subject)
                      ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                      : 'bg-surface-muted text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-3 max-w-[80%]`}>
                {!message.isUser && (
                  <div className="gradient-outline rounded-full p-1 flex-shrink-0">
                    <div className="gradient-outline-content rounded-full p-2">
                      <Brain className="w-5 h-5 text-gradient-purple" />
                    </div>
                  </div>
                )}
                
                <GradientCard className={`${message.isUser ? 'bg-gradient-to-r from-purple-500/10 to-orange-500/10' : ''}`}>
                  <div className="space-y-2">
                    <p className="text-text-primary whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs text-text-muted">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </GradientCard>

                {message.isUser && (
                  <div className="gradient-outline rounded-full p-1 flex-shrink-0">
                    <div className="gradient-outline-content rounded-full p-2 bg-surface">
                      <User className="w-5 h-5 text-gradient-orange" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="gradient-outline rounded-full p-1">
                  <div className="gradient-outline-content rounded-full p-2">
                    <Brain className="w-5 h-5 text-gradient-purple" />
                  </div>
                </div>
                <GradientCard>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gradient-purple" />
                    <span className="text-text-secondary">AI is thinking...</span>
                  </div>
                </GradientCard>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="fixed bottom-16 left-0 right-0 p-2 border-t border-card-border bg-surface/70 backdrop-blur-md z-40">
          <div className="flex justify-center w-full">
            <div className="flex gap-2 items-end max-w-4xl w-full px-4">
              <textarea
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your subjects..."
                disabled={isLoading}
                className="flex-1 bg-surface border border-card-border rounded-lg px-3 py-2 text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[40px] max-h-[120px]"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '40px',
                  maxHeight: '120px',
                  overflowY: inputMessage.split('\n').length > 3 ? 'auto' : 'hidden'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className={`h-[40px] rounded-lg transition-all duration-300 flex items-center justify-center relative overflow-hidden ${
                  !inputMessage.trim()
                    ? 'cursor-not-allowed'
                    : 'hover:scale-105 active:scale-95'
                }`}
              >
                <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                  !inputMessage.trim()
                    ? 'border-2 border-surface-muted'
                    : 'border-2 border-transparent bg-gradient-to-r from-purple-500 to-orange-500 p-[2px]'
                }`}>
                  <div className={`w-full h-full rounded-lg flex items-center justify-center px-3 ${
                    !inputMessage.trim()
                      ? 'bg-surface-muted'
                      : 'bg-surface'
                  }`}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gradient-purple" />
                    ) : (
                      <Send className={`w-4 h-4 ${!inputMessage.trim() ? 'text-text-muted' : 'text-gradient-purple'}`} />
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        
          {/* Quick Actions */}
          <div className="flex justify-center w-full mt-2">
            <div className="flex gap-1.5 flex-wrap max-w-4xl px-4 justify-center mb-1">
              <button
                onClick={() => setInputMessage('Explain the main concepts I should know for the upcoming test')}
                className="text-xs px-3 py-1 rounded-full bg-surface-muted text-text-secondary hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-orange-500/10 hover:text-gradient-purple transition-all whitespace-nowrap"
              >
                Test prep
              </button>
              <button
                onClick={() => setInputMessage('Give me practice problems to work on')}
                className="text-xs px-3 py-1 rounded-full bg-surface-muted text-text-secondary hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-orange-500/10 hover:text-gradient-purple transition-all whitespace-nowrap"
              >
                Practice
              </button>
              <button
                onClick={() => setInputMessage('What are the most important topics I should focus on?')}
                className="text-xs px-3 py-1 rounded-full bg-surface-muted text-text-secondary hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-orange-500/10 hover:text-gradient-purple transition-all whitespace-nowrap"
              >
                Study guide
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <MiniGameUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType={limitType}
      />
      
      <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};
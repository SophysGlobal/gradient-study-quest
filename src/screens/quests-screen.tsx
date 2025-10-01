import React, { useState } from 'react';
import { ParticleBackground } from '@/components/animations/particle-background';
import { GradientCard } from '@/components/ui/gradient-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
// Removed game imports - quests don't launch games directly
import { Trophy, Target, Star, CircleCheck as CheckCircle, Clock, Award, BookOpen, Zap, Crown, Flame, Lock } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement';
  progress: number;
  target: number;
  reward: { type: 'xp' | 'tokens' | 'badge'; amount: number | string };
  completed: boolean;
  icon: any;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface QuestsScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Removed game types - quests don't launch games directly

const quests: Quest[] = [
  {
    id: 'daily-flashcards',
    title: 'Daily Flashcard Master',
    description: 'Study 20 flashcards today',
    type: 'daily',
    progress: 12,
    target: 20,
    reward: { type: 'xp', amount: 50 },
    completed: false,
    icon: BookOpen,
    difficulty: 'Easy'
  },
  {
    id: 'weekly-streak',
    title: 'Study Streak Champion',
    description: 'Maintain a 7-day study streak',
    type: 'weekly',
    progress: 7,
    target: 7,
    reward: { type: 'tokens', amount: 200 },
    completed: true,
    icon: Flame,
    difficulty: 'Medium'
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Score 90% or higher on 5 quizzes',
    type: 'achievement',
    progress: 3,
    target: 5,
    reward: { type: 'badge', amount: 'Quiz Master' },
    completed: false,
    icon: Trophy,
    difficulty: 'Hard'
  },
  {
    id: 'time-trial-pro',
    title: 'Speed Demon',
    description: 'Complete 3 time trial games',
    type: 'daily',
    progress: 1,
    target: 3,
    reward: { type: 'xp', amount: 75 },
    completed: false,
    icon: Zap,
    difficulty: 'Medium'
  },
  {
    id: 'subject-explorer',
    title: 'Subject Explorer',
    description: 'Study flashcards from 5 different subjects',
    type: 'weekly',
    progress: 2,
    target: 5,
    reward: { type: 'tokens', amount: 150 },
    completed: false,
    icon: Target,
    difficulty: 'Easy'
  },
  {
    id: 'memory-champion',
    title: 'Memory Champion',
    description: 'Win 10 memory match games',
    type: 'achievement',
    progress: 0,
    target: 10,
    reward: { type: 'badge', amount: 'Memory Master' },
    completed: false,
    icon: Crown,
    difficulty: 'Hard'
  }
];

export const QuestsScreen: React.FC<QuestsScreenProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'daily' | 'weekly' | 'achievement'>('all');
  // Removed game/difficulty state for quests - users select difficulty in minigames themselves

  const filteredQuests = selectedFilter === 'all' 
    ? quests 
    : quests.filter(quest => quest.type === selectedFilter);

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'text-gradient-orange';
      case 'weekly': return 'text-gradient-purple';
      case 'achievement': return 'text-gaming-legendary';
      default: return 'text-gradient-purple';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-gaming-success';
      case 'Medium': return 'text-gaming-warning';
      case 'Hard': return 'text-gaming-error';
      default: return 'text-text-secondary';
    }
  };

  const handleQuestClick = (quest: Quest) => {
    if (quest.completed) return;
    
    // Route to appropriate activity based on quest type
    if (quest.id.includes('flashcard') || quest.id.includes('subject-explorer')) {
      onTabChange('flashcards');
    } else if (quest.id.includes('quiz') || quest.id.includes('time-trial') || quest.id.includes('memory') || quest.id.includes('game')) {
      onTabChange('games'); // All minigame quests go to games section
    } else {
      onTabChange('ai-tutor'); // Default to AI tutor for study activities
    }
  };

  // Removed game component rendering - quests don't launch games directly

  return (
    <div className="min-h-screen bg-background relative pb-20">
      <ParticleBackground />
      
      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold gradient-text">Quest Hub</h1>
          <p className="text-text-secondary">Complete quests to earn XP, tokens, and badges!</p>
          
          {/* Stats */}
          <div className="flex justify-center gap-4">
            <div className="gradient-outline rounded-lg p-1">
              <div className="gradient-outline-content rounded-lg px-3 py-2 text-center">
                <p className="text-sm text-gaming-xp font-semibold">
                  {quests.filter(q => q.completed).length}/{quests.length}
                </p>
                <p className="text-xs text-text-muted">Completed</p>
              </div>
            </div>
            <div className="gradient-outline rounded-lg p-1">
              <div className="gradient-outline-content rounded-lg px-3 py-2 text-center">
                <p className="text-sm text-token-silver font-semibold">
                  {quests.filter(q => q.type === 'daily' && !q.completed).length}
                </p>
                <p className="text-xs text-text-muted">Daily Left</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'daily', 'weekly', 'achievement'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedFilter === filter
                  ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                  : 'bg-surface-muted text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Quests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuests.map((quest) => {
            const Icon = quest.icon;
            const progressPercentage = getProgressPercentage(quest.progress, quest.target);
            
            return (
              <GradientCard 
                key={quest.id} 
                className={`transition-all hover:scale-[1.01] ${quest.completed ? 'opacity-75' : ''}`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="gradient-outline rounded-lg p-1">
                        <div className="gradient-outline-content rounded-lg p-2">
                          {quest.completed ? (
                            <CheckCircle className="w-6 h-6 text-gaming-success" />
                          ) : (
                            <Icon className="w-6 h-6 text-gradient-purple" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary flex items-center gap-2">
                          {quest.title}
                          {quest.completed && <CheckCircle className="w-4 h-4 text-gaming-success" />}
                        </h3>
                        <p className="text-sm text-text-secondary">{quest.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium ${getTypeColor(quest.type)}`}>
                            {quest.type.charAt(0).toUpperCase() + quest.type.slice(1)}
                          </span>
                          <span className="text-xs text-text-muted">•</span>
                          <span className={`text-xs ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reward */}
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {quest.reward.type === 'xp' && (
                          <span className="text-gaming-xp">+{quest.reward.amount} XP</span>
                        )}
                        {quest.reward.type === 'tokens' && (
                          <span className="text-token-silver">🪙 {quest.reward.amount}</span>
                        )}
                        {quest.reward.type === 'badge' && (
                          <span className="text-gaming-legendary">🏆 {quest.reward.amount}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">
                        Progress: {quest.progress}/{quest.target}
                      </span>
                      <span className="text-gradient-purple font-medium">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  {quest.completed ? (
                    <div className="flex items-center justify-center gap-2 text-gaming-success text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completed!</span>
                    </div>
                  ) : (
                    <GradientButton 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleQuestClick(quest)}
                    >
                      {progressPercentage === 100 ? 'Claim Reward' : 'View Progress'}
                    </GradientButton>
                  )}
                </div>
              </GradientCard>
            );
          })}
        </div>

        {filteredQuests.length === 0 && (
          <div className="text-center py-8">
            <div className="gradient-outline rounded-full p-1 w-16 h-16 mx-auto mb-4">
              <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                <Lock className="w-8 h-8 text-text-muted" />
              </div>
            </div>
            <p className="text-text-secondary">No quests available for this filter.</p>
          </div>
        )}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};
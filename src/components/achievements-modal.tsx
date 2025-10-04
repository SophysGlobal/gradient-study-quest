import React from 'react';
import { X, Award, Flame, Star, Brain, Target, Trophy, BookOpen, Zap, Timer, Crown, CircleCheck as CheckCircle, Lock } from 'lucide-react';
import { GradientCard } from './ui/gradient-card';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  xp: number;
  unlocked: boolean;
  unlockedDate?: string;
  category: 'study' | 'streak' | 'games' | 'mastery';
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const achievements: Achievement[] = [
  {
    id: '7-day-streak',
    title: '7-Day Streak!',
    description: 'Keep up the momentum',
    icon: Flame,
    xp: 50,
    unlocked: true,
    unlockedDate: 'Today',
    category: 'streak'
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Scored 90%+ on 5 quizzes',
    icon: Star,
    xp: 100,
    unlocked: true,
    unlockedDate: '2 days ago',
    category: 'study'
  },
  {
    id: 'study-champion',
    title: 'Study Champion',
    description: 'Studied 100+ flashcards',
    icon: Brain,
    xp: 75,
    unlocked: true,
    unlockedDate: '3 days ago',
    category: 'study'
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: '100% accuracy on quiz',
    icon: Target,
    xp: 150,
    unlocked: true,
    unlockedDate: '5 days ago',
    category: 'mastery'
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Completed 10 lessons in one day',
    icon: Trophy,
    xp: 80,
    unlocked: true,
    unlockedDate: '1 week ago',
    category: 'study'
  },
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Completed your first study session',
    icon: BookOpen,
    xp: 25,
    unlocked: true,
    unlockedDate: '2 weeks ago',
    category: 'study'
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete 5 time trials under 30 seconds',
    icon: Zap,
    xp: 120,
    unlocked: true,
    unlockedDate: '1 week ago',
    category: 'games'
  },
  {
    id: 'dedicated-student',
    title: 'Dedicated Student',
    description: 'Study for 30 days in a row',
    icon: Flame,
    xp: 200,
    unlocked: false,
    category: 'streak'
  },
  {
    id: 'memory-master',
    title: 'Memory Master',
    description: 'Win 20 memory match games',
    icon: Brain,
    xp: 150,
    unlocked: false,
    category: 'games'
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Study 500 flashcards',
    icon: BookOpen,
    xp: 250,
    unlocked: false,
    category: 'study'
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Get 100% on 10 different quizzes',
    icon: Crown,
    xp: 300,
    unlocked: false,
    category: 'mastery'
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Complete 50 AI tutor sessions',
    icon: Star,
    xp: 175,
    unlocked: false,
    category: 'study'
  }
];

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const totalXP = unlockedAchievements.reduce((sum, a) => sum + a.xp, 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'study': return 'text-gradient-purple';
      case 'streak': return 'text-gradient-orange';
      case 'games': return 'text-gaming-success';
      case 'mastery': return 'text-gaming-legendary';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-lg">
        <GradientCard className="h-full">
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-card-border">
              <div className="flex items-center gap-3">
                <div className="gradient-outline rounded-full p-1">
                  <div className="gradient-outline-content rounded-full p-2">
                    <Award className="w-6 h-6 text-gradient-orange" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold gradient-text">Achievements</h2>
                  <p className="text-sm text-text-secondary">
                    {unlockedAchievements.length}/{achievements.length} Unlocked • {totalXP} XP Earned
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Unlocked Achievements */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gradient-purple flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Unlocked ({unlockedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {unlockedAchievements.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                      <div
                        key={achievement.id}
                        className="p-3 rounded-lg bg-surface-muted border border-card-border hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="gradient-outline rounded-full p-1 flex-shrink-0">
                            <div className="gradient-outline-content rounded-full p-2">
                              <Icon className={`w-5 h-5 ${getCategoryColor(achievement.category)}`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-text-primary flex items-center gap-2">
                              {achievement.title}
                              <CheckCircle className="w-4 h-4 text-gaming-success flex-shrink-0" />
                            </h4>
                            <p className="text-sm text-text-secondary">{achievement.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gaming-xp font-semibold">+{achievement.xp} XP</span>
                              <span className="text-xs text-text-muted">{achievement.unlockedDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Locked Achievements */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-text-secondary flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Locked ({lockedAchievements.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lockedAchievements.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                      <div
                        key={achievement.id}
                        className="p-3 rounded-lg bg-surface-muted/50 border border-card-border opacity-60"
                      >
                        <div className="flex items-start gap-3">
                          <div className="border-2 border-surface-muted rounded-full p-2 flex-shrink-0">
                            <Icon className="w-5 h-5 text-text-muted" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-text-primary flex items-center gap-2">
                              {achievement.title}
                              <Lock className="w-4 h-4 text-text-muted flex-shrink-0" />
                            </h4>
                            <p className="text-sm text-text-secondary">{achievement.description}</p>
                            <div className="mt-2">
                              <span className="text-xs text-text-muted font-semibold">Reward: +{achievement.xp} XP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </GradientCard>
      </div>
    </div>
  );
};

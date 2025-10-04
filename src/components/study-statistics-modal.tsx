import React from 'react';
import { GradientCard } from '@/components/ui/gradient-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { BookOpen, Target, Trophy, Brain, X, TrendingUp, Calendar, Clock } from 'lucide-react';

interface StudyStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statType: 'cards' | 'accuracy' | 'quests' | 'achievements';
  onContinueStudying: () => void;
}

const statDetails = {
  cards: {
    title: 'Cards Studied',
    icon: BookOpen,
    value: 142,
    color: 'text-gradient-purple',
    bgColor: 'bg-purple-500/10',
    details: {
      today: 23,
      thisWeek: 142,
      thisMonth: 487,
      allTime: 1250,
      avgPerDay: 20,
      streak: 7
    },
    recentActivity: [
      { subject: 'AP Biology', cards: 15, time: '2 hours ago', accuracy: 92 },
      { subject: 'AP Chemistry', cards: 8, time: '5 hours ago', accuracy: 88 }
    ],
    targetActivity: 'flashcards'
  },
  accuracy: {
    title: 'Accuracy Rate',
    icon: Target,
    value: '89%',
    color: 'text-gradient-orange',
    bgColor: 'bg-orange-500/10',
    details: {
      today: '91%',
      thisWeek: '89%',
      thisMonth: '87%',
      allTime: '86%',
      bestStreak: 15,
      perfect: 8
    },
    recentActivity: [
      { subject: 'AP Biology', accuracy: 95, time: '2 hours ago', cards: 15 },
      { subject: 'AP Chemistry', accuracy: 85, time: '5 hours ago', cards: 8 }
    ],
    targetActivity: 'flashcards'
  },
  quests: {
    title: 'Quests Completed',
    icon: Trophy,
    value: 24,
    color: 'text-gaming-success',
    bgColor: 'bg-green-500/10',
    details: {
      daily: 12,
      weekly: 8,
      achievements: 4,
      totalXP: 1850,
      avgPerQuest: 77,
      streak: 5
    },
    recentActivity: [
      { name: 'Daily Flashcard Master', xp: 50, time: '1 hour ago', type: 'Daily' },
      { name: 'Quiz Master', xp: 100, time: '3 hours ago', type: 'Achievement' }
    ],
    targetActivity: 'quests'
  },
  achievements: {
    title: 'Achievements Unlocked',
    icon: Brain,
    value: 15,
    color: 'text-gaming-xp',
    bgColor: 'bg-yellow-500/10',
    details: {
      unlocked: 15,
      total: 30,
      totalXP: 2450,
      rarest: 'Study Legend',
      recent: 3,
      progress: 50
    },
    recentActivity: [
      { name: '7-Day Streak', xp: 50, time: 'Today', rarity: 'Common' },
      { name: 'Quiz Master', xp: 100, time: 'Yesterday', rarity: 'Rare' },
      { name: 'Study Champion', xp: 75, time: '3 days ago', rarity: 'Uncommon' }
    ],
    targetActivity: 'learn'
  }
};

export const StudyStatisticsModal: React.FC<StudyStatisticsModalProps> = ({ 
  isOpen, 
  onClose, 
  statType,
  onContinueStudying 
}) => {
  if (!isOpen) return null;

  const stat = statDetails[statType];
  const Icon = stat.icon;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-background/95 backdrop-blur-lg z-[9999] overflow-y-auto animate-fade-in">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="gradient-outline rounded-lg p-1">
              <div className={`gradient-outline-content rounded-lg p-3 ${stat.bgColor}`}>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">{stat.title}</h2>
              <p className="text-text-secondary">Detailed statistics and insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="gradient-outline rounded-lg p-1 hover:scale-105 transition-transform"
          >
            <div className="gradient-outline-content rounded-lg p-2">
              <X className="w-6 h-6 text-text-primary" />
            </div>
          </button>
        </div>

        {/* Current Value */}
        <GradientCard>
          <div className="text-center p-6">
            <p className={`text-6xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
            <p className="text-text-secondary">Current Total</p>
          </div>
        </GradientCard>

        {/* Detailed Stats Grid */}
        <GradientCard>
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gradient-purple" />
              Performance Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(stat.details).map(([key, value]) => (
                <div key={key} className="gradient-outline rounded-lg p-1">
                  <div className="gradient-outline-content rounded-lg p-3 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {typeof value === 'number' && key.includes('Streak') ? value : value}
                      {key.toLowerCase().includes('accuracy') || key.toLowerCase().includes('percent') ? '' : ''}
                    </p>
                    <p className="text-xs text-text-muted capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GradientCard>

        {/* Recent Activity */}
        <GradientCard>
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-gradient-orange" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {stat.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-surface-muted">
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">
                      {activity.subject || activity.name}
                    </p>
                    <p className="text-sm text-text-secondary">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    {activity.cards && (
                      <p className="text-sm font-semibold text-gradient-purple">
                        {activity.cards} cards
                      </p>
                    )}
                    {activity.accuracy && (
                      <p className="text-xs text-gradient-orange">{activity.accuracy}% accuracy</p>
                    )}
                    {activity.xp && (
                      <p className="text-sm font-semibold text-gaming-xp">+{activity.xp} XP</p>
                    )}
                    {activity.rarity && (
                      <p className="text-xs text-text-muted">{activity.rarity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GradientCard>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <GradientButton className="flex-1" onClick={onContinueStudying}>
            Continue Studying
          </GradientButton>
          <button
            onClick={onClose}
            className="gradient-outline rounded-lg p-1 px-6 hover:scale-105 transition-transform"
          >
            <div className="gradient-outline-content rounded-lg px-4 py-2">
              <span className="text-text-primary font-medium">Close</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

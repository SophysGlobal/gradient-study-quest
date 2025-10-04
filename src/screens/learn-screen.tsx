import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Target, Sparkles, Clock, MessageCircle, Grid2x2 as Grid, Lightbulb, PenTool, Crown, Library, ChartBar as BarChart3 } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { LearnModeLauncher } from '@/components/learn-mode-launcher';
import { FlashcardStudy } from '@/components/flashcard-study';
import { PremadeFlashcardStudy } from '@/components/premade-flashcard-study';
import { MiniGameUpgradeModal } from '@/components/mini-game-upgrade-modal';

type StudyMode = 'learn' | 'test' | 'match' | 'spaced-repetition' | 'write' | 'practice';

interface LearnScreenProps {
  selectedSubjects: string[];
  subscriptionTier?: string;
}

export const LearnScreen: React.FC<LearnScreenProps> = ({ selectedSubjects, subscriptionTier }) => {
  const [selectedSubject, setSelectedSubject] = useState(selectedSubjects[0] || '');
  const [studyMode, setStudyMode] = useState<StudyMode>('learn');
  const [activeLauncher, setActiveLauncher] = useState<StudyMode | null>(null);
  const [activeFlashcards, setActiveFlashcards] = useState(false);
  const [activePremadeFlashcards, setActivePremadeFlashcards] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const hasPersonalPlus = subscriptionTier === 'Premium' || subscriptionTier === 'Enterprise';

  const studyModes = [
    {
      id: 'learn',
      name: 'Learn',
      description: 'Adaptive learning with feedback',
      icon: Brain,
      color: 'text-gradient-orange',
      requiresPremium: false
    },
    {
      id: 'test',
      name: 'Test',
      description: 'Quiz yourself without hints',
      icon: Target,
      color: 'text-gaming-error',
      requiresPremium: false
    },
    {
      id: 'match',
      name: 'Match',
      description: 'Match terms with definitions',
      icon: Grid,
      color: 'text-gaming-success',
      requiresPremium: false
    },
    {
      id: 'spaced-repetition',
      name: 'Spaced Repetition',
      description: 'Scientifically optimized review',
      icon: Clock,
      color: 'text-gradient-purple',
      requiresPremium: true
    },
    {
      id: 'write',
      name: 'Write',
      description: 'Type out the answers',
      icon: MessageCircle,
      color: 'text-gradient-orange',
      requiresPremium: false
    },
    {
      id: 'practice',
      name: 'Practice',
      description: 'Mixed practice problems',
      icon: PenTool,
      color: 'text-gradient-purple',
      requiresPremium: true
    }
  ];

  // Handle flashcards separately with new component
  if (activeFlashcards) {
    return (
      <FlashcardStudy 
        selectedSubject={selectedSubject} 
        onClose={() => setActiveFlashcards(false)} 
      />
    );
  }

  // Handle pre-made flashcards separately
  if (activePremadeFlashcards) {
    return (
      <PremadeFlashcardStudy 
        selectedSubject={selectedSubject} 
        onClose={() => setActivePremadeFlashcards(false)} 
      />
    );
  }
  
  if (activeLauncher) {
    return (
      <LearnModeLauncher 
        mode={activeLauncher} 
        subject={selectedSubject} 
        onClose={() => setActiveLauncher(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative pb-16">
      <div className="relative z-10 p-6 space-y-6 page-content">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 stagger-item">
        <div className="gradient-outline rounded-full p-1">
          <div className="gradient-outline-content p-2">
            <BookOpen className="w-6 h-6 text-gradient-purple" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Learn Mode</h1>
          <p className="text-sm text-text-secondary">Master your subjects with adaptive study tools</p>
        </div>
      </div>

      {/* Subject Selection */}
      <GradientCard className="stagger-item">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gradient-orange" />
            Select Subject
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {selectedSubjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  selectedSubject === subject
                    ? 'gradient-outline'
                    : 'bg-surface-muted text-text-secondary hover:bg-surface'
                }`}
              >
                <div className={selectedSubject === subject ? 'gradient-outline-content p-2' : ''}>
                  {subject}
                </div>
              </button>
            ))}
          </div>
        </div>
      </GradientCard>

      {/* Flashcards Section */}
      <GradientCard className="stagger-item">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gradient-purple" />
            Flashcards
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Study with flashcards for {selectedSubject}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <GradientButton
              onClick={() => setActivePremadeFlashcards(true)}
              className="w-full"
              variant="secondary"
            >
              <Library className="w-4 h-4 mr-2" />
              Pre-Made
            </GradientButton>
            <GradientButton
              onClick={() => setActiveFlashcards(true)}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generated
            </GradientButton>
          </div>
          <GradientButton
            onClick={() => setShowMasteryView(true)}
            className="w-full mt-3"
            variant="secondary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Mastery Progress
          </GradientButton>
        </div>
      </GradientCard>

      {/* Study Mode Selector */}
      <GradientCard className="stagger-item">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-gradient-orange" />
            Study Modes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {studyModes.map((mode) => {
              const Icon = mode.icon;
              const isLocked = mode.requiresPremium && subscriptionTier !== 'Premium' && subscriptionTier !== 'Enterprise';
              
              return (
                <button
                  key={mode.id}
                  onClick={() => isLocked ? setShowUpgradeModal(true) : setActiveLauncher(mode.id as StudyMode)}
                  className={`p-4 rounded-lg text-left transition-all hover:scale-[1.02] relative ${
                    isLocked 
                      ? 'bg-surface-muted text-text-secondary opacity-60 cursor-not-allowed' 
                      : 'bg-surface-muted text-text-secondary hover:bg-surface'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute top-2 right-2">
                      <Crown className="w-4 h-4 text-gradient-orange" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${mode.color}`} />
                    <span className="font-medium text-sm text-text-primary">{mode.name}</span>
                  </div>
                  <p className="text-xs text-text-muted">{mode.description}</p>
                  {mode.requiresPremium && (
                    <p className="text-xs text-gradient-orange mt-1">Personal+ Exclusive</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </GradientCard>
      </div>
      
      {/* Mini Game Upgrade Modal */}
      <MiniGameUpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
};
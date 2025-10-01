import React, { useState } from 'react';
import { ParticleBackground } from '@/components/animations/particle-background';
import { GradientCard } from '@/components/ui/gradient-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { MiniGameLauncher } from '@/components/mini-game-launcher';
import { MiniGameUpgradeModal } from '@/components/mini-game-upgrade-modal';
import { Gamepad2, Zap, Brain, Timer, Shuffle, Flame, Sparkles, Grid2x2 as Grid, Crown, Trophy, Target, Star, ChevronDown } from 'lucide-react';

interface GamesScreenProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedSubjects: string[];
  subscriptionTier?: string;
}

const minigames = [
  {
    id: 'quick-quiz',
    title: 'Quick Quiz',
    description: 'Rapid-fire questions',
    icon: Zap,
    xpReward: 25,
    difficulty: 'Easy',
    requiresPremium: false,
    category: 'Quiz'
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Match concepts',
    icon: Brain,
    xpReward: 35,
    difficulty: 'Medium',
    requiresPremium: false,
    category: 'Memory'
  },
  {
    id: 'time-trial',
    title: 'Time Trial',
    description: 'Beat the clock',
    icon: Timer,
    xpReward: 50,
    difficulty: 'Hard',
    requiresPremium: false,
    category: 'Speed'
  },
  {
    id: 'word-scramble',
    title: 'Word Scramble',
    description: 'Unscramble terms',
    icon: Shuffle,
    xpReward: 30,
    difficulty: 'Medium',
    requiresPremium: false,
    category: 'Word'
  },
  {
    id: 'speed-match',
    title: 'Speed Match',
    description: 'Quick matching',
    icon: Flame,
    xpReward: 40,
    difficulty: 'Hard',
    requiresPremium: false,
    category: 'Speed'
  },
  {
    id: 'pattern-puzzle',
    title: 'Pattern Puzzle',
    description: 'Solve number patterns',
    icon: Sparkles,
    xpReward: 60,
    difficulty: 'Hard',
    requiresPremium: true,
    category: 'Logic'
  },
  {
    id: 'logic-grid',
    title: 'Logic Grid',
    description: 'Mini Sudoku puzzles',
    icon: Grid,
    xpReward: 70,
    difficulty: 'Expert',
    requiresPremium: true,
    category: 'Logic'
  }
];

const gameCategories = ['All', 'Quiz', 'Memory', 'Speed', 'Word', 'Logic'];

export const GamesScreen: React.FC<GamesScreenProps> = ({
  activeTab,
  onTabChange,
  selectedSubjects,
  subscriptionTier
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState(selectedSubjects[0] || '');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const hasPersonalPlus = subscriptionTier === 'Premium' || subscriptionTier === 'Enterprise';

  const filteredGames = selectedCategory === 'All' 
    ? minigames 
    : minigames.filter(game => game.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-gaming-success';
      case 'Medium': return 'text-gaming-warning';
      case 'Hard': return 'text-gaming-error';
      case 'Expert': return 'text-gradient-purple';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background relative pb-20">
      <ParticleBackground />
      
      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="gradient-outline rounded-full p-1">
              <div className="gradient-outline-content rounded-full p-2">
                <Gamepad2 className="w-6 h-6 text-gradient-purple" />
              </div>
            </div>
            <h1 className="text-2xl font-bold gradient-text">Game Center</h1>
          </div>
          <p className="text-text-secondary">Level up your learning with interactive games!</p>
          
          {/* Stats */}
          <div className="flex justify-center gap-4">
            <div className="gradient-outline rounded-lg p-1">
              <div className="gradient-outline-content rounded-lg px-3 py-2 text-center">
                <p className="text-sm text-gaming-xp font-semibold">2,450</p>
                <p className="text-xs text-text-muted">Total XP</p>
              </div>
            </div>
            <div className="gradient-outline rounded-lg p-1">
              <div className="gradient-outline-content rounded-lg px-3 py-2 text-center">
                <p className="text-sm text-gradient-purple font-semibold">15</p>
                <p className="text-xs text-text-muted">Games Won</p>
              </div>
            </div>
            <div className="gradient-outline rounded-lg p-1">
              <div className="gradient-outline-content rounded-lg px-3 py-2 text-center">
                <p className="text-sm text-gradient-orange font-semibold">7</p>
                <p className="text-xs text-text-muted">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="relative">
          <button
            onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
            className="w-full gradient-outline rounded-lg p-1"
          >
            <div className="gradient-outline-content px-4 py-3 flex items-center justify-between">
              <span className="font-medium text-text-primary">{selectedSubject}</span>
              <ChevronDown className="w-5 h-5 text-gradient-purple" />
            </div>
          </button>

          {showSubjectDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 gradient-outline rounded-lg p-1 z-50 animate-scale-in">
              <div className="gradient-outline-content rounded-lg max-h-48 overflow-y-auto">
                {selectedSubjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setShowSubjectDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-surface-muted transition-colors text-text-primary"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {gameCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                  : 'bg-surface-muted text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGames.map(game => {
            const Icon = game.icon;
            const isLocked = game.requiresPremium && !hasPersonalPlus;
            
            return (
              <GradientCard 
                key={game.id} 
                className="cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => isLocked ? setShowUpgradeModal(true) : setActiveGame(game.id)}
              >
                <div className="space-y-4 relative text-center">
                  {isLocked && (
                    <div className="absolute top-2 right-2">
                      <Crown className="w-4 h-4 text-gradient-orange" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center gap-3">
                    <div className="gradient-outline rounded-lg p-2">
                      <div className="gradient-outline-content rounded-lg p-2">
                        <Icon className="w-6 h-6 text-gradient-purple" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{game.title}</h3>
                      <p className="text-sm text-text-secondary">{game.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gaming-xp">+{game.xpReward} XP</span>
                        <span className="text-xs text-text-muted">•</span>
                        <span className={`text-xs ${getDifficultyColor(game.difficulty)}`}>
                          {game.difficulty}
                        </span>
                        <span className="text-xs text-text-muted">•</span>
                        <span className="text-xs text-gradient-purple">{game.category}</span>
                      </div>
                      {game.requiresPremium && (
                        <p className="text-xs text-gradient-orange mt-1">Personal+ Exclusive</p>
                      )}
                    </div>
                  </div>
                </div>
              </GradientCard>
            );
          })}
        </div>

        {/* Daily Challenges */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gradient-orange" />
            Daily Challenges
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            <GradientCard className="cursor-pointer hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="gradient-outline rounded-lg p-2">
                    <div className="gradient-outline-content rounded-lg p-2">
                      <Target className="w-5 h-5 text-gradient-purple" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Perfect Score Challenge</h3>
                    <p className="text-sm text-text-secondary">Get 100% on any quiz game</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gaming-xp">+100 XP</span>
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs text-token-silver">🪙 50 Tokens</span>
                    </div>
                  </div>
                </div>
                <GradientButton size="sm">
                  Start
                </GradientButton>
              </div>
            </GradientCard>
            
            <GradientCard className="cursor-pointer hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="gradient-outline rounded-lg p-2">
                    <div className="gradient-outline-content rounded-lg p-2">
                      <Flame className="w-5 h-5 text-gradient-orange" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Speed Demon</h3>
                    <p className="text-sm text-text-secondary">Complete 5 games in under 10 minutes</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gaming-xp">+150 XP</span>
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs text-token-silver">🪙 75 Tokens</span>
                    </div>
                  </div>
                </div>
                <GradientButton size="sm">
                  Start
                </GradientButton>
              </div>
            </GradientCard>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gradient-orange" />
            Weekly Leaderboard
          </h2>
          
          <GradientCard>
            <div className="space-y-3">
              {[
                { rank: 1, name: 'StudyMaster', score: 15420, badge: '👑' },
                { rank: 2, name: 'QuizWhiz', score: 12890, badge: '🥈' },
                { rank: 3, name: 'BrainPower', score: 11250, badge: '🥉' },
                { rank: 4, name: 'You', score: 8750, badge: '⭐' },
                { rank: 5, name: 'SmartCookie', score: 7890, badge: '🎯' }
              ].map((player) => (
                <div key={player.rank} className={`flex items-center justify-between p-3 rounded-lg ${
                  player.name === 'You' ? 'bg-gradient-to-r from-purple-500/10 to-orange-500/10' : 'bg-surface-muted'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{player.badge}</span>
                    <div>
                      <p className="font-semibold text-text-primary">{player.name}</p>
                      <p className="text-xs text-text-secondary">#{player.rank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gradient-purple">{player.score.toLocaleString()}</p>
                    <p className="text-xs text-text-muted">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </GradientCard>
        </div>

        {/* Active Game Modal */}
        {activeGame && (
          <div className="fixed inset-0 w-screen h-screen bg-background/80 backdrop-blur-sm z-[9999] overflow-y-auto !m-0 top-0 left-0">
            <div className="max-w-2xl mx-auto p-4">
              <MiniGameLauncher gameId={activeGame} subject={selectedSubject} onClose={() => setActiveGame(null)} />
            </div>
          </div>
        )}

        {/* Mini Game Upgrade Modal */}
        <MiniGameUpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)} 
        />
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};
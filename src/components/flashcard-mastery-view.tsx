import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Circle, CircleDot, CircleCheckBig, Award, Filter, Sparkles, Library } from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Progress } from '@/components/ui/progress';

type MasteryLevel = 'new' | 'learning' | 'familiar' | 'mastered';
type FlashcardType = 'premade' | 'ai-generated';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  mastery: MasteryLevel;
  lastStudied?: Date;
  timesStudied: number;
  type: FlashcardType;
}

interface FlashcardMasteryViewProps {
  onClose: () => void;
  selectedSubject?: string;
  availableSubjects: string[];
}

export const FlashcardMasteryView: React.FC<FlashcardMasteryViewProps> = ({ onClose, selectedSubject: initialSubject, availableSubjects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<MasteryLevel | 'all'>('all');
  const [filterType, setFilterType] = useState<FlashcardType | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'All Subjects');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const mockFlashcards: Flashcard[] = [
    { id: '1', front: 'What is photosynthesis?', back: 'Process by which plants convert light into energy', subject: 'Biology', mastery: 'mastered', timesStudied: 12, lastStudied: new Date(), type: 'premade' },
    { id: '2', front: 'Define momentum', back: 'Mass times velocity (p = mv)', subject: 'Physics', mastery: 'familiar', timesStudied: 7, type: 'ai-generated' },
    { id: '3', front: 'Pythagorean theorem', back: 'a² + b² = c²', subject: 'Mathematics', mastery: 'learning', timesStudied: 4, type: 'premade' },
    { id: '4', front: 'What is mitosis?', back: 'Cell division process', subject: 'Biology', mastery: 'new', timesStudied: 1, type: 'ai-generated' },
    { id: '5', front: "Newton's First Law", back: 'Object in motion stays in motion unless acted upon', subject: 'Physics', mastery: 'mastered', timesStudied: 10, type: 'premade' },
    { id: '6', front: 'Derivative of x²', back: '2x', subject: 'Mathematics', mastery: 'familiar', timesStudied: 6, type: 'ai-generated' },
    { id: '7', front: 'What is ATP?', back: 'Adenosine triphosphate - energy currency of cells', subject: 'Biology', mastery: 'learning', timesStudied: 3, type: 'premade' },
    { id: '8', front: 'Force equation', back: 'F = ma (Force = mass × acceleration)', subject: 'Physics', mastery: 'mastered', timesStudied: 9, type: 'ai-generated' },
    { id: '9', front: 'Quadratic formula', back: 'x = (-b ± √(b²-4ac)) / 2a', subject: 'Mathematics', mastery: 'learning', timesStudied: 5, type: 'premade' },
    { id: '10', front: 'DNA structure', back: 'Double helix with nucleotide base pairs', subject: 'Biology', mastery: 'familiar', timesStudied: 8, type: 'ai-generated' },
    { id: '11', front: 'Chemical bonding types', back: 'Ionic, covalent, and metallic bonds', subject: 'Chemistry', mastery: 'learning', timesStudied: 5, type: 'premade' },
    { id: '12', front: 'What is entropy?', back: 'Measure of disorder in a system', subject: 'Chemistry', mastery: 'familiar', timesStudied: 7, type: 'ai-generated' },
  ];

  const filteredCards = useMemo(() => {
    return mockFlashcards.filter(card => {
      const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterLevel === 'all' || card.mastery === filterLevel;
      const matchesType = filterType === 'all' || card.type === filterType;
      const matchesSubject = selectedSubject === 'All Subjects' || card.subject === selectedSubject;

      return matchesSearch && matchesFilter && matchesType && matchesSubject;
    });
  }, [searchTerm, filterLevel, filterType, selectedSubject]);

  const masteryStats = useMemo(() => {
    const total = mockFlashcards.length;
    const counts = {
      new: mockFlashcards.filter(c => c.mastery === 'new').length,
      learning: mockFlashcards.filter(c => c.mastery === 'learning').length,
      familiar: mockFlashcards.filter(c => c.mastery === 'familiar').length,
      mastered: mockFlashcards.filter(c => c.mastery === 'mastered').length,
    };
    const masteryPercentage = ((counts.familiar + counts.mastered) / total) * 100;

    return { total, counts, masteryPercentage };
  }, [mockFlashcards]);

  const getMasteryIcon = (level: MasteryLevel) => {
    switch (level) {
      case 'new':
        return <Circle className="w-5 h-5 text-text-muted" />;
      case 'learning':
        return <CircleDot className="w-5 h-5 text-yellow-500" />;
      case 'familiar':
        return <CircleDot className="w-5 h-5 text-blue-500" />;
      case 'mastered':
        return <CircleCheckBig className="w-5 h-5 text-gaming-success" />;
    }
  };

  const getMasteryColor = (level: MasteryLevel) => {
    switch (level) {
      case 'new':
        return 'bg-surface-muted border-card-border';
      case 'learning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'familiar':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'mastered':
        return 'bg-gaming-success/10 border-gaming-success/30';
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed inset-0 bg-background z-50 overflow-y-auto transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`min-h-screen p-4 pb-24 transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-8'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="gradient-outline rounded-full p-1">
              <div className="gradient-outline-content rounded-full p-2">
                <Award className="w-6 h-6 text-gradient-purple" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Mastery Progress</h2>
              {selectedSubject && selectedSubject !== 'All Subjects' && (
                <p className="text-sm text-text-secondary">{selectedSubject}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="gradient-outline rounded-full p-1 hover:scale-110 transition-transform"
          >
            <div className="gradient-outline-content rounded-full p-2">
              <X className="w-5 h-5 text-text-primary" />
            </div>
          </button>
        </div>

        {/* Subject Selector */}
        <div className="mb-6">
          <label className="text-sm text-text-muted mb-2 block">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-card-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="All Subjects">All Subjects</option>
            {availableSubjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Overall Progress */}
        <GradientCard className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Overall Mastery</h3>
              <span className="text-2xl font-bold text-gradient-purple">
                {Math.round(masteryStats.masteryPercentage)}%
              </span>
            </div>
            <Progress value={masteryStats.masteryPercentage} className="h-3 mb-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted">New</p>
                  <p className="text-lg font-semibold text-text-primary">{masteryStats.counts.new}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-text-muted">Learning</p>
                  <p className="text-lg font-semibold text-text-primary">{masteryStats.counts.learning}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-text-muted">Familiar</p>
                  <p className="text-lg font-semibold text-text-primary">{masteryStats.counts.familiar}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CircleCheckBig className="w-4 h-4 text-gaming-success" />
                <div>
                  <p className="text-xs text-text-muted">Mastered</p>
                  <p className="text-lg font-semibold text-text-primary">{masteryStats.counts.mastered}</p>
                </div>
              </div>
            </div>
          </div>
        </GradientCard>

        {/* Search and Filter */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search flashcards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-card-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-muted mb-2">Flashcard Type</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                    filterType === 'all'
                      ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                      : 'bg-surface border border-card-border text-text-secondary hover:border-purple-500/50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('premade')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                    filterType === 'premade'
                      ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-500'
                      : 'bg-surface border border-card-border text-text-secondary hover:border-blue-500/50'
                  }`}
                >
                  <Library className="w-3.5 h-3.5" />
                  Pre-Made
                </button>
                <button
                  onClick={() => setFilterType('ai-generated')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5 ${
                    filterType === 'ai-generated'
                      ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-500'
                      : 'bg-surface border border-card-border text-text-secondary hover:border-purple-500/50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Generated
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-text-muted mb-2">Mastery Level</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setFilterLevel('all')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    filterLevel === 'all'
                      ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                      : 'bg-surface border border-card-border text-text-secondary hover:border-purple-500/50'
                  }`}
                >
                  All ({mockFlashcards.length})
                </button>
            <button
              onClick={() => setFilterLevel('new')}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                filterLevel === 'new'
                  ? 'bg-surface-muted border-2 border-text-muted text-text-primary'
                  : 'bg-surface border border-card-border text-text-secondary hover:border-text-muted'
              }`}
            >
              New ({masteryStats.counts.new})
            </button>
            <button
              onClick={() => setFilterLevel('learning')}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                filterLevel === 'learning'
                  ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-500'
                  : 'bg-surface border border-card-border text-text-secondary hover:border-yellow-500/50'
              }`}
            >
              Learning ({masteryStats.counts.learning})
            </button>
            <button
              onClick={() => setFilterLevel('familiar')}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                filterLevel === 'familiar'
                  ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-500'
                  : 'bg-surface border border-card-border text-text-secondary hover:border-blue-500/50'
              }`}
            >
              Familiar ({masteryStats.counts.familiar})
            </button>
            <button
              onClick={() => setFilterLevel('mastered')}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                filterLevel === 'mastered'
                  ? 'bg-gaming-success/20 border-2 border-gaming-success text-gaming-success'
                  : 'bg-surface border border-card-border text-text-secondary hover:border-gaming-success/50'
              }`}
            >
              Mastered ({masteryStats.counts.mastered})
            </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flashcard List */}
        <div className="space-y-3">
          {filteredCards.length === 0 ? (
            <GradientCard>
              <div className="p-8 text-center">
                <p className="text-text-muted">No flashcards found matching your criteria</p>
              </div>
            </GradientCard>
          ) : (
            filteredCards.map((card) => (
              <GradientCard key={card.id} className="hover:scale-[1.01] transition-transform">
                <div className={`p-4 border-l-4 ${getMasteryColor(card.mastery)}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getMasteryIcon(card.mastery)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-text-primary mb-1">{card.front}</h4>
                          <p className="text-sm text-text-secondary">{card.back}</p>
                        </div>
                        <div className="text-right flex-shrink-0 space-y-1">
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-surface-muted text-text-muted">
                            {card.subject}
                          </span>
                          <div className="flex justify-end">
                            {card.type === 'premade' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30">
                                <Library className="w-3 h-3" />
                                Pre-Made
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/30">
                                <Sparkles className="w-3 h-3" />
                                AI
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>Studied {card.timesStudied} times</span>
                        {card.lastStudied && (
                          <span>Last: {card.lastStudied.toLocaleDateString()}</span>
                        )}
                        <span className="capitalize">{card.mastery}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GradientCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

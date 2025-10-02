import React, { useState } from 'react';
import { GradientCard } from './ui/gradient-card';
import { GradientButton } from './ui/gradient-button';
import { useToast } from './ui/use-toast';
import { 
  Brain, 
  ChevronLeft, 
  ChevronRight,
  Star,
  RotateCcw,
  BookOpen,
  Target,
  Check,
  X,
  Play,
  Pause,
  Gauge
} from 'lucide-react';
import { AP_CURRICULUM } from '@/data/ap-curriculum';
import type { CurriculumUnit } from '@/data/ap-curriculum';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  learned: boolean;
}

interface PremadeFlashcardStudyProps {
  selectedSubject: string;
  onClose?: () => void;
}

export const PremadeFlashcardStudy: React.FC<PremadeFlashcardStudyProps> = ({ 
  selectedSubject, 
  onClose 
}) => {
  const curriculum = AP_CURRICULUM[selectedSubject];
  const [selectedUnit, setSelectedUnit] = useState<CurriculumUnit | null>(curriculum?.[0] || null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(
    selectedUnit?.flashcards.map((card, idx) => ({
      id: `${idx}`,
      ...card,
      learned: false
    })) || []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(3000); // 3 seconds default
  const { toast } = useToast();

  React.useEffect(() => {
    if (selectedUnit) {
      setFlashcards(
        selectedUnit.flashcards.map((card, idx) => ({
          id: `${idx}`,
          ...card,
          learned: false
        }))
      );
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [selectedUnit]);

  React.useEffect(() => {
    if (!isAutoPlay) return;
    
    const timer = setInterval(() => {
      if (!isFlipped) {
        setIsFlipped(true);
      } else {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsFlipped(false);
        } else {
          setIsAutoPlay(false);
          toast({
            title: "Deck Complete!",
            description: "You've reviewed all flashcards in this set.",
          });
        }
      }
    }, autoPlaySpeed);

    return () => clearInterval(timer);
  }, [isAutoPlay, isFlipped, currentIndex, flashcards.length, autoPlaySpeed]);

  if (!curriculum) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <GradientCard>
          <div className="text-center py-12 space-y-4">
            <BookOpen className="w-16 h-16 text-text-muted mx-auto" />
            <h3 className="text-xl font-bold text-text-primary">No Pre-made Flashcards Available</h3>
            <p className="text-text-secondary">Pre-made flashcards are not available for {selectedSubject} yet.</p>
            {onClose && (
              <GradientButton onClick={onClose}>Go Back</GradientButton>
            )}
          </div>
        </GradientCard>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const learnedCount = flashcards.filter(c => c.learned).length;
  const progressPercentage = Math.round((learnedCount / flashcards.length) * 100);

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const toggleLearned = () => {
    if (!currentCard) return;
    
    setFlashcards(prev => prev.map(card => 
      card.id === currentCard.id 
        ? { ...card, learned: !card.learned }
        : card
    ));
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsAutoPlay(false);
    setFlashcards(prev => prev.map(card => ({ ...card, learned: false })));
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const changeSpeed = (speed: number) => {
    setAutoPlaySpeed(speed);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-outline rounded-full p-1">
            <div className="gradient-outline-content rounded-full p-2">
              <Brain className="w-6 h-6 text-gradient-purple" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Pre-made Flashcards</h1>
            <p className="text-text-secondary">{selectedSubject}</p>
          </div>
        </div>
        
        {onClose && (
          <GradientButton onClick={onClose} variant="secondary" size="sm">
            <X className="w-4 h-4" />
          </GradientButton>
        )}
      </div>

      {/* Unit Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {curriculum.map((unit) => (
          <button
            key={unit.id}
            onClick={() => setSelectedUnit(unit)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedUnit?.id === unit.id
                ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                : 'bg-surface-muted text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {unit.name}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Progress</h2>
          <span className="text-sm text-gradient-purple font-medium">
            {learnedCount} / {flashcards.length} learned
          </span>
        </div>
        
        <div className="gradient-outline rounded-full p-1">
          <div className="gradient-outline-content rounded-full">
            <div className="w-full bg-surface-muted rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auto-play Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-surface-muted rounded-lg">
        <GradientButton
          onClick={toggleAutoPlay}
          variant="secondary"
          size="sm"
        >
          {isAutoPlay ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isAutoPlay ? 'Pause' : 'Auto-play'}
        </GradientButton>
        
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-secondary">Speed:</span>
          {[
            { label: 'Slow', value: 5000 },
            { label: 'Normal', value: 3000 },
            { label: 'Fast', value: 1500 }
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => changeSpeed(value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                autoPlaySpeed === value
                  ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="gradient-outline rounded-2xl p-1">
            <div 
              className="gradient-outline-content rounded-2xl bg-surface cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-lg"
              onClick={flipCard}
              style={{ minHeight: '320px' }}
            >
              <div className="relative h-full p-8">
                {!isFlipped ? (
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                    <div className="gradient-outline rounded-full p-1 w-16 h-16">
                      <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                        <Star className="w-8 h-8 text-gradient-purple" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-xl font-medium text-text-primary leading-relaxed">
                        {currentCard.front}
                      </p>
                      
                      <div className="gradient-outline rounded-full p-1 inline-block">
                        <div className="gradient-outline-content rounded-full px-4 py-2">
                          <span className="text-sm text-gradient-purple font-medium">
                            Click to reveal answer
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-6">
                    <div className="gradient-outline rounded-full p-1 w-16 h-16">
                      <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                        <Target className="w-8 h-8 text-gradient-orange" />
                      </div>
                    </div>
                    
                    <p className="text-xl font-medium text-text-primary leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>
                )}
                
                {/* Card counter */}
                <div className="absolute top-4 right-4">
                  <div className="gradient-outline rounded-full p-1">
                    <div className="gradient-outline-content rounded-full px-3 py-1">
                      <span className="text-sm font-medium text-gradient-purple">
                        {currentIndex + 1} / {flashcards.length}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Learned indicator */}
                {currentCard?.learned && (
                  <div className="absolute top-4 left-4">
                    <div className="gradient-outline rounded-full p-1">
                      <div className="gradient-outline-content rounded-full p-2">
                        <Check className="w-4 h-4 text-gaming-success" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center items-center gap-6">
        <GradientButton
          onClick={prevCard}
          disabled={currentIndex === 0}
          variant="secondary"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </GradientButton>
        
        <GradientButton
          onClick={toggleLearned}
          variant="secondary"
          size="sm"
          className={currentCard?.learned ? 'bg-gaming-success/20' : ''}
        >
          {currentCard?.learned ? (
            <>
              <Check className="w-4 h-4 mr-2 text-gaming-success" />
              Learned
            </>
          ) : (
            <>Mark as Learned</>
          )}
        </GradientButton>
        
        <GradientButton
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
          variant="secondary"
          size="sm"
        >
          <ChevronRight className="w-4 h-4" />
        </GradientButton>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <GradientButton onClick={resetSession} variant="secondary" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Progress
        </GradientButton>
      </div>
    </div>
  );
};

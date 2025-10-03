import React, { useState, useEffect } from 'react';
import { GradientCard } from './ui/gradient-card';
import { GradientButton } from './ui/gradient-button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { 
  Brain, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Star,
  RotateCcw,
  Loader2,
  BookOpen,
  Target,
  Check,
  X
} from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  studied: boolean;
}

interface FlashcardStudyProps {
  selectedSubject: string;
  onClose?: () => void;
}

export const FlashcardStudy: React.FC<FlashcardStudyProps> = ({ 
  selectedSubject, 
  onClose 
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());
  const [sessionStats, setSessionStats] = useState({
    studied: 0,
    easy: 0,
    medium: 0,
    hard: 0
  });
  const { toast } = useToast();

  const generateFlashcards = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          type: 'flashcard',
          subject: selectedSubject,
          prompt: `Generate 8 high-quality flashcards for ${selectedSubject} at AP level. Focus on key concepts, definitions, and important facts. Return as valid JSON array with "front" and "back" properties.`
        }
      });

      if (error) throw error;

      if (data.success) {
        try {
          let cleanResponse = data.response.trim();
          if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
          } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
          }
          
          const newCards = JSON.parse(cleanResponse);
          const cardsWithId = newCards.map((card: any, index: number) => ({
            ...card,
            id: `${Date.now()}_${index}`,
            subject: selectedSubject,
            difficulty: 'medium' as const,
            studied: false
          }));
          
          setFlashcards(cardsWithId);
          setCurrentIndex(0);
          setIsFlipped(false);
          setStudiedCards(new Set());
          
          toast({
            title: "Success!",
            description: `Generated ${cardsWithId.length} new flashcards for ${selectedSubject}`,
          });
        } catch (parseError) {
          console.error('Parse error:', parseError);
          toast({
            title: "Error",
            description: "Failed to parse AI response. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateFlashcards();
  }, [selectedSubject]);

  const currentCard = flashcards[currentIndex];

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

  const markDifficulty = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentCard) return;
    
    setStudiedCards(prev => new Set([...prev, currentCard.id]));
    setSessionStats(prev => ({
      ...prev,
      studied: prev.studied + 1,
      [difficulty]: prev[difficulty] + 1
    }));
    
    // Update the card difficulty
    setFlashcards(prev => prev.map(card => 
      card.id === currentCard.id 
        ? { ...card, difficulty, studied: true }
        : card
    ));
    
    // Auto advance to next card
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        nextCard();
      } else {
        // End of deck
        toast({
          title: "Deck Complete!",
          description: `You studied ${sessionStats.studied + 1} cards this session.`,
        });
      }
    }, 500);
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setSessionStats({ studied: 0, easy: 0, medium: 0, hard: 0 });
    setFlashcards(prev => prev.map(card => ({ ...card, studied: false })));
  };

  const getProgressPercentage = () => {
    if (flashcards.length === 0) return 0;
    return Math.round((studiedCards.size / flashcards.length) * 100);
  };

  if (isGenerating && flashcards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="gradient-outline rounded-full p-1 w-20 h-20 mx-auto">
            <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
              <Brain className="w-10 h-10 text-gradient-purple animate-pulse" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Generating Flashcards</h2>
            <p className="text-text-secondary">Creating personalized study cards for {selectedSubject}...</p>
          </div>
          
          <div className="animate-spin w-8 h-8 border-2 border-gradient-purple border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <GradientCard>
          <div className="text-center py-12 space-y-4">
            <BookOpen className="w-16 h-16 text-text-muted mx-auto" />
            <h3 className="text-xl font-bold text-text-primary">No Flashcards Available</h3>
            <p className="text-text-secondary">Generate some flashcards to start studying!</p>
            <GradientButton onClick={generateFlashcards}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Flashcards
            </GradientButton>
          </div>
        </GradientCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-outline rounded-full p-1">
            <div className="gradient-outline-content rounded-full p-2">
              <Brain className="w-6 h-6 text-gradient-purple" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Flashcard Study</h1>
            <p className="text-text-secondary">{selectedSubject}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <GradientButton 
            onClick={generateFlashcards}
            disabled={isGenerating}
            size="sm"
            variant="secondary"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                New Set
              </>
            )}
          </GradientButton>
          
          {onClose && (
            <GradientButton onClick={onClose} variant="secondary" size="sm">
              <X className="w-4 h-4" />
            </GradientButton>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Study Progress</h2>
          <span className="text-sm text-gradient-purple font-medium">
            {studiedCards.size} / {flashcards.length} studied
          </span>
        </div>
        
        <div className="gradient-outline rounded-full p-1">
          <div className="gradient-outline-content rounded-full">
            <div className="w-full bg-surface-muted rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Flashcard */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl flashcard-container">
          <div className="gradient-outline rounded-2xl p-1">
            <div
              className="gradient-outline-content rounded-2xl bg-surface cursor-pointer shadow-lg"
              onClick={flipCard}
              style={{ minHeight: '320px' }}
            >
              <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
                {/* Front of card */}
                <div className="flashcard-face flashcard-front relative h-full p-8" style={{ minHeight: '320px' }}>
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

                  {/* Card counter in top right */}
                  <div className="absolute top-4 right-4">
                    <div className="gradient-outline rounded-full p-1">
                      <div className="gradient-outline-content rounded-full px-3 py-1">
                        <span className="text-sm font-medium text-gradient-purple">
                          {currentIndex + 1} / {flashcards.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Studied indicator */}
                  {studiedCards.has(currentCard.id) && (
                    <div className="absolute top-4 left-4">
                      <div className="gradient-outline rounded-full p-1">
                        <div className="gradient-outline-content rounded-full p-2">
                          <Check className="w-4 h-4 text-gaming-success" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back of card */}
                <div className="flashcard-face flashcard-back relative h-full p-8" style={{ minHeight: '320px' }}>
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-6">
                    <div className="gradient-outline rounded-full p-1 w-16 h-16">
                      <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                        <Target className="w-8 h-8 text-gradient-orange" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-xl font-medium text-text-primary leading-relaxed">
                        {currentCard.back}
                      </p>
                      
                      {/* Difficulty Rating Buttons */}
                      <div className="flex justify-center gap-4 pt-4">
                        <GradientButton
                          onClick={() => markDifficulty('hard')}
                          variant="secondary"
                          size="sm"
                          className="bg-gaming-error/10 hover:bg-gaming-error/20 border border-gaming-error/30"
                        >
                          <span className="text-gaming-error font-medium">Hard</span>
                        </GradientButton>
                        
                        <GradientButton
                          onClick={() => markDifficulty('medium')}
                          variant="secondary"
                          size="sm"
                          className="bg-gaming-warning/10 hover:bg-gaming-warning/20 border border-gaming-warning/30"
                        >
                          <span className="text-gaming-warning font-medium">Medium</span>
                        </GradientButton>
                        
                        <GradientButton
                          onClick={() => markDifficulty('easy')}
                          variant="secondary"
                          size="sm"
                          className="bg-gaming-success/10 hover:bg-gaming-success/20 border border-gaming-success/30"
                        >
                          <span className="text-gaming-success font-medium">Easy</span>
                        </GradientButton>
                      </div>
                    </div>
                  </div>

                  {/* Card counter in top right */}
                  <div className="absolute top-4 right-4">
                    <div className="gradient-outline rounded-full p-1">
                      <div className="gradient-outline-content rounded-full px-3 py-1">
                        <span className="text-sm font-medium text-gradient-purple">
                          {currentIndex + 1} / {flashcards.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Studied indicator */}
                  {studiedCards.has(currentCard.id) && (
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
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center">
        <div className="flex items-center gap-6">
          <GradientButton
            onClick={prevCard}
            disabled={currentIndex === 0}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </GradientButton>
          
          <div className="flex flex-col items-center gap-2">
            <GradientButton
              onClick={flipCard}
              className="px-8"
            >
              {isFlipped ? 'Show Question' : 'Show Answer'}
            </GradientButton>
            
            <span className="text-sm text-text-muted">
              or click the card
            </span>
          </div>
          
          <GradientButton
            onClick={nextCard}
            disabled={currentIndex === flashcards.length - 1}
            variant="secondary"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </GradientButton>
        </div>
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GradientCard>
          <div className="text-center p-4">
            <div className="gradient-outline rounded-full p-1 w-12 h-12 mx-auto mb-3">
              <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gradient-purple" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gradient-purple">{sessionStats.studied}</p>
            <p className="text-sm text-text-muted">Studied</p>
          </div>
        </GradientCard>
        
        <GradientCard>
          <div className="text-center p-4">
            <div className="gradient-outline rounded-full p-1 w-12 h-12 mx-auto mb-3">
              <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gaming-success"></div>
              </div>
            </div>
            <p className="text-2xl font-bold text-gaming-success">{sessionStats.easy}</p>
            <p className="text-sm text-text-muted">Easy</p>
          </div>
        </GradientCard>
        
        <GradientCard>
          <div className="text-center p-4">
            <div className="gradient-outline rounded-full p-1 w-12 h-12 mx-auto mb-3">
              <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gaming-warning"></div>
              </div>
            </div>
            <p className="text-2xl font-bold text-gaming-warning">{sessionStats.medium}</p>
            <p className="text-sm text-text-muted">Medium</p>
          </div>
        </GradientCard>
        
        <GradientCard>
          <div className="text-center p-4">
            <div className="gradient-outline rounded-full p-1 w-12 h-12 mx-auto mb-3">
              <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gaming-error"></div>
              </div>
            </div>
            <p className="text-2xl font-bold text-gaming-error">{sessionStats.hard}</p>
            <p className="text-sm text-text-muted">Hard</p>
          </div>
        </GradientCard>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <GradientButton
          onClick={resetSession}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Session
        </GradientButton>
        
        <GradientButton
          onClick={generateFlashcards}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate New Set
        </GradientButton>
      </div>
    </div>
  );
};
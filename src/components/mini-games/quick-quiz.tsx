import React, { useState, useEffect } from 'react';
import { GradientCard } from '../ui/gradient-card';
import { GradientButton } from '../ui/gradient-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle,
  Trophy,
  Star,
  RotateCcw
} from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuickQuizProps {
  subject: string;
  onClose: () => void;
}

export const QuickQuiz: React.FC<QuickQuizProps> = ({ subject, onClose }) => {
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  // Adjust time based on difficulty
  const getTimeByDifficulty = () => {
    switch (difficulty) {
      case 'Easy': return 90;    // 90 seconds
      case 'Medium': return 60;  // 60 seconds
      case 'Hard': return 45;    // 45 seconds
      default: return 60;
    }
  };
  
  const [timeLeft, setTimeLeft] = useState(getTimeByDifficulty());
  const [gameEnded, setGameEnded] = useState(false);
  const { toast } = useToast();

  // Timer countdown
  useEffect(() => {
    if (gameEnded || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameEnded]);

  // Generate questions
  useEffect(() => {
    const generateQuestions = async () => {
      setIsLoading(true);
      const newQuestions: QuizQuestion[] = [];
      
      for (let i = 0; i < 5; i++) {
        try {
          const { data, error } = await supabase.functions.invoke('ai-tutor', {
            body: {
              type: 'quiz',
              subject,
              prompt: `Generate a ${difficulty.toLowerCase()} difficulty quiz question for ${subject}. ${difficulty === 'Easy' ? 'Make it basic and straightforward for beginners' : difficulty === 'Hard' ? 'Make it very challenging with advanced concepts' : 'Make it moderately challenging for AP level students'}.`
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
              
              const questionData = JSON.parse(cleanResponse);
              newQuestions.push(questionData);
            } catch (parseError) {
              console.error('Parse error:', parseError);
            }
          }
        } catch (error) {
          console.error('Error generating question:', error);
        }
      }

      if (newQuestions.length === 0) {
        // Fallback questions
        newQuestions.push({
          question: `What is a key concept in ${subject}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0
        });
      }

      setQuestions(newQuestions);
      setIsLoading(false);
    };

    generateQuestions();
  }, [subject, difficulty]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameEnded) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameEnded(true);
      }
    }, 1500);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(getTimeByDifficulty());
    setGameEnded(false);
  };

  const handleDifficultyChange = (newDifficulty: 'Easy' | 'Medium' | 'Hard') => {
    setDifficulty(newDifficulty);
    // Reset the game when difficulty changes
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(() => {
      switch (newDifficulty) {
        case 'Easy': return 90;
        case 'Medium': return 60;
        case 'Hard': return 45;
        default: return 60;
      }
    });
    setGameEnded(false);
    setIsLoading(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-gradient-orange" />
            <h2 className="text-xl font-bold text-text-primary">Quick Quiz</h2>
          </div>
          <GradientButton onClick={onClose} variant="secondary" size="sm">
            Close
          </GradientButton>
        </div>
        
        <GradientCard>
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-gradient-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-text-secondary">Generating quiz questions...</p>
          </div>
        </GradientCard>
      </div>
    );
  }

  // Add safety check for questions
  if (!questions || questions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-gradient-orange" />
            <h2 className="text-xl font-bold text-text-primary">Quick Quiz</h2>
          </div>
          <GradientButton onClick={onClose} variant="secondary" size="sm">
            Close
          </GradientButton>
        </div>
        
        <GradientCard>
          <div className="text-center py-8 space-y-4">
            <XCircle className="w-12 h-12 text-gaming-error mx-auto" />
            <div>
              <p className="text-text-primary font-medium">Unable to generate quiz</p>
              <p className="text-text-secondary text-sm mt-2">AI service is temporarily unavailable. Please try again in a moment.</p>
            </div>
            <GradientButton onClick={onClose} className="w-full">
              Close
            </GradientButton>
          </div>
        </GradientCard>
      </div>
    );
  }

  if (gameEnded || timeLeft <= 0) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gradient-orange" />
            <h2 className="text-xl font-bold text-text-primary">Quiz Complete!</h2>
          </div>
          <GradientButton onClick={onClose} variant="secondary" size="sm">
            Close
          </GradientButton>
        </div>
        
        <GradientCard>
          <div className="text-center space-y-4">
            <div className="gradient-outline rounded-full p-1 w-20 h-20 mx-auto">
              <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                <Trophy className="w-10 h-10 text-gradient-orange" />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold gradient-text">{score}/{questions.length}</h3>
              <p className="text-text-secondary">{percentage}% Correct</p>
            </div>
            
            <div className="flex justify-center gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 ${i < Math.floor(percentage / 20) ? 'text-gradient-orange' : 'text-text-muted'}`}
                  fill={i < Math.floor(percentage / 20) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            
            <div className="space-y-2">
              <p className="text-gaming-xp font-semibold">+25 XP Earned!</p>
              {percentage >= 80 && (
                <p className="text-gaming-success">🎉 Excellent work!</p>
              )}
              {percentage >= 60 && percentage < 80 && (
                <p className="text-gradient-orange">👍 Good job!</p>
              )}
              {percentage < 60 && (
                <p className="text-text-secondary">Keep practicing!</p>
              )}
            </div>
            
            <GradientButton onClick={resetGame} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </GradientButton>
          </div>
        </GradientCard>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-gradient-orange" />
          <h2 className="text-xl font-bold text-text-primary">Quick Quiz</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={difficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger className="w-24 h-8 text-xs bg-surface border-card-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface border-card-border">
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <GradientButton onClick={onClose} variant="secondary" size="sm">
            Close
          </GradientButton>
        </div>
      </div>

      {/* Timer and Progress */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gradient-purple" />
          <span className="text-sm font-medium text-text-primary">{timeLeft}s</span>
        </div>
        <div className="text-sm text-text-secondary">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="text-sm text-gaming-xp font-medium">
          Score: {score}
        </div>
      </div>

      {/* Question */}
      <GradientCard>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-text-primary">
            {currentQ.question}
          </h3>
          
          <div className="space-y-2">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedAnswer === index
                    ? showResult
                      ? index === currentQ.correctAnswer
                        ? 'border-gaming-success bg-gaming-success/10'
                        : 'border-gaming-error bg-gaming-error/10'
                      : 'border-gradient-purple bg-gradient-to-r from-purple-500/10 to-orange-500/10'
                    : showResult && index === currentQ.correctAnswer
                    ? 'border-gaming-success bg-gaming-success/10'
                    : 'border-card-border hover:border-gradient-purple/50 bg-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">{option}</span>
                  {showResult && index === currentQ.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-gaming-success" />
                  )}
                  {showResult && selectedAnswer === index && index !== currentQ.correctAnswer && (
                    <XCircle className="w-5 h-5 text-gaming-error" />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {!showResult && selectedAnswer !== null && (
            <GradientButton onClick={handleNextQuestion} className="w-full">
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </GradientButton>
          )}
        </div>
      </GradientCard>
    </div>
  );
};
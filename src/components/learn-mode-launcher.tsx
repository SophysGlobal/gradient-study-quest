import React, { useState, useEffect } from 'react';
import { GradientCard } from './ui/gradient-card';
import { GradientButton } from './ui/gradient-button';
import { ParticleBackground } from './animations/particle-background';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  X, 
  BookOpen, 
  Brain, 
  Target, 
  Grid, 
  Clock, 
  MessageCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Loader2,
  Star,
  AlertTriangle
} from 'lucide-react';

interface Question {
  front: string;
  back: string;
  unit: string;
  type: 'flashcard' | 'multiple-choice' | 'typing' | 'true-false';
  options?: string[];
  correctAnswer?: number;
  difficulty?: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

interface LearnModeLauncherProps {
  mode: 'learn' | 'test' | 'match' | 'spaced-repetition' | 'write' | 'practice';
  subject: string;
  onClose: () => void;
}

export const LearnModeLauncher: React.FC<LearnModeLauncherProps> = ({
  mode,
  subject,
  onClose
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [session, setSession] = useState({ correct: 0, incorrect: 0, streak: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const modeConfig = {
    flashcards: { name: 'Flashcards', icon: BookOpen, description: 'Classic card review' },
    learn: { name: 'Learn', icon: Brain, description: 'Adaptive learning with feedback' },
    test: { name: 'Test', icon: Target, description: 'Quiz yourself without hints' },
    match: { name: 'Match', icon: Grid, description: 'Match terms with definitions' },
    'spaced-repetition': { name: 'Spaced Repetition', icon: Clock, description: 'Scientifically optimized review' },
    write: { name: 'Write', icon: MessageCircle, description: 'Type out the answers' }
  };

  const currentMode = modeConfig[mode];

  // Generate AI content for the selected mode
  useEffect(() => {
    const generateContent = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('ai-tutor', {
          body: {
            type: 'flashcard',
            subject: subject,
            prompt: `Generate 10 study questions for ${subject} appropriate for AP level students. Focus on key concepts, definitions, and important facts. Return as valid JSON array with "front" (question) and "back" (answer) properties. Make sure the JSON is properly formatted without any markdown code blocks.`
          }
        });

        if (error) {
          // Check for rate limit or payment errors
          if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
            toast({
              title: "Rate Limit Reached",
              description: "Please wait a moment before trying again.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          if (error.message?.includes('Payment') || error.message?.includes('402')) {
            toast({
              title: "Usage Limit Reached",
              description: "Please add credits to continue using AI features.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          throw error;
        }

        if (data.success) {
          try {
            let cleanResponse = data.response.trim();
            
            // Remove any markdown code blocks
            if (cleanResponse.startsWith('```json')) {
              cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
            } else if (cleanResponse.startsWith('```')) {
              cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
            }
            
            // Try to extract JSON if it's embedded in text
            const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              cleanResponse = jsonMatch[0];
            }
            
            const aiQuestions = JSON.parse(cleanResponse);
            
            if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
              throw new Error('Invalid response format');
            }
            
            const processedQuestions: Question[] = aiQuestions.map((q: any, index: number) => {
              let questionType: Question['type'] = 'flashcard';
              
              if (mode === 'test' || mode === 'learn') {
                const types: Question['type'][] = ['multiple-choice', 'typing', 'true-false'];
                questionType = types[index % 3];
              } else if (mode === 'write') {
                questionType = 'typing';
              }
              
              if (questionType === 'multiple-choice') {
                // Generate wrong answers
                const wrongAnswers = aiQuestions
                  .filter((other: any) => other.back !== q.back)
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 3)
                  .map((other: any) => other.back);
                
                const options = [q.back, ...wrongAnswers].sort(() => Math.random() - 0.5);
                const correctAnswer = options.indexOf(q.back);
                
                return {
                  ...q,
                  unit: 'AI Generated',
                  type: questionType,
                  options,
                  correctAnswer,
                  difficulty: 3
                };
              }
              
              return { 
                ...q, 
                unit: 'AI Generated', 
                type: questionType, 
                difficulty: 3 
              };
            });

            setQuestions(processedQuestions);
          } catch (parseError) {
            console.error('Parse error:', parseError);
            // Fallback to default questions if AI fails
            const fallbackQuestions: Question[] = [
              {
                front: `What is a fundamental concept in ${subject}?`,
                back: `A key principle or idea that forms the foundation of ${subject} studies.`,
                unit: 'General Concepts',
                type: 'flashcard',
                difficulty: 3
              },
              {
                front: `Name an important topic in ${subject}`,
                back: `Various topics are covered in ${subject} including core principles and applications.`,
                unit: 'Core Topics',
                type: 'flashcard', 
                difficulty: 3
              }
            ];
            setQuestions(fallbackQuestions);
          }
        } else {
          // Fallback questions if AI service fails
          const fallbackQuestions: Question[] = [
            {
              front: `What is a fundamental concept in ${subject}?`,
              back: `A key principle or idea that forms the foundation of ${subject} studies.`,
              unit: 'General Concepts',
              type: 'flashcard',
              difficulty: 3
            }
          ];
          setQuestions(fallbackQuestions);
        }
      } catch (error) {
        console.error('Error generating content:', error);
        // Fallback questions on any error
        const fallbackQuestions: Question[] = [
          {
            front: `What is a fundamental concept in ${subject}?`,
            back: `A key principle or idea that forms the foundation of ${subject} studies.`,
            unit: 'General Concepts',
            type: 'flashcard',
            difficulty: 3
          }
        ];
        setQuestions(fallbackQuestions);
      } finally {
        setLoading(false);
      }
    };

    generateContent();
  }, [mode, subject]);

  const getAIExplanation = async (question: Question, userAnswer: string) => {
    setLoadingExplanation(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          type: 'explanation',
          subject: subject,
          prompt: `The student answered "${userAnswer}" to the question "${question.front}". The correct answer is "${question.back}". Explain why their answer is wrong and help them understand the correct concept. Keep it under 80 words and be encouraging.`
        }
      });

      if (error) {
        // Check for rate limit or payment errors
        if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
          setAiExplanation("Rate limit reached. Please wait a moment before requesting an explanation.");
          setLoadingExplanation(false);
          return;
        }
        if (error.message?.includes('Payment') || error.message?.includes('402')) {
          setAiExplanation("Usage limit reached. Please add credits to continue using AI features.");
          setLoadingExplanation(false);
          return;
        }
        throw error;
      }

      if (data.success) {
        setAiExplanation(data.response);
      }
    } catch (error) {
      console.error('Error getting AI explanation:', error);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const gradeAnswer = (question: Question, answer: string | number): { isCorrect: boolean; confidence: number } => {
    if (question.type === 'multiple-choice') {
      return { isCorrect: answer === question.correctAnswer, confidence: 1.0 };
    }

    const userText = answer.toString().toLowerCase().trim();
    const correctText = question.back.toLowerCase().trim();
    
    // Exact match
    if (userText === correctText) {
      return { isCorrect: true, confidence: 1.0 };
    }

    // Partial match scoring
    const words = correctText.split(/\s+/);
    const userWords = userText.split(/\s+/);
    
    let matchedWords = 0;
    words.forEach(word => {
      if (userWords.some(userWord => 
        userWord.includes(word) || word.includes(userWord) || 
        levenshteinDistance(word, userWord) <= 1
      )) {
        matchedWords++;
      }
    });

    const confidence = matchedWords / words.length;
    
    // Accept if 70% or more words match
    return { 
      isCorrect: confidence >= 0.7, 
      confidence 
    };
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const checkAnswer = async () => {
    const question = questions[currentQuestion];
    let answer: string | number = '';
    
    if (question.type === 'multiple-choice') {
      answer = selectedOption || -1;
    } else {
      answer = userAnswer;
    }

    const grading = gradeAnswer(question, answer);
    setIsCorrect(grading.isCorrect);
    setShowResult(true);

    // Update session stats
    setSession(prev => ({
      ...prev,
      correct: grading.isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: grading.isCorrect ? prev.incorrect : prev.incorrect + 1,
      streak: grading.isCorrect ? prev.streak + 1 : 0
    }));

    if (grading.isCorrect) {
      toast({
        title: "Excellent! 🎉",
        description: grading.confidence < 1.0 ? `Smart grading: ${Math.round(grading.confidence * 100)}% match` : `Streak: ${session.streak + 1}`,
      });
    } else {
      toast({
        title: "Not quite right",
        description: grading.confidence > 0.3 ? "Close! Check the explanation below." : `The answer was: ${question.back}`,
        variant: "destructive"
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setUserAnswer('');
      setSelectedOption(null);
      setShowResult(false);
      setIsFlipped(false);
      setAiExplanation('');
    } else {
      // End of session
      setCurrentQuestion(0);
      setUserAnswer('');
      setSelectedOption(null);
      setShowResult(false);
      setIsFlipped(false);
      setAiExplanation('');
    }
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    onClose();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const renderFlashcardMode = () => {
    const question = questions[currentQuestion];
    if (!question) return null;

    return (
      <GradientCard className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xs text-text-muted mb-2">{question.unit}</div>
            <div 
              className="min-h-[200px] flex items-center justify-center cursor-pointer p-6 rounded-lg bg-surface-muted hover:bg-surface-hover transition-colors"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="text-center">
                {!isFlipped ? (
                  <div>
                    <Star className="w-8 h-8 text-gradient-purple mx-auto mb-4" />
                    <p className="text-xl font-medium text-text-primary">{question.front}</p>
                    <p className="text-sm text-text-muted mt-4">Click to reveal answer</p>
                  </div>
                ) : (
                  <div>
                    <Target className="w-8 h-8 text-gradient-orange mx-auto mb-4" />
                    <p className="text-xl font-medium text-text-primary">{question.back}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {isFlipped && (
            <div className="flex gap-4 justify-center">
              <div className="gradient-outline rounded-lg p-1">
                <button
                  onClick={() => {
                    setSession(prev => ({ ...prev, incorrect: prev.incorrect + 1, streak: 0 }));
                    handleNextQuestion();
                  }}
                  className="gradient-outline-content px-8 py-2 rounded-lg hover:scale-105 transition-transform"
                >
                  <span className="text-text-primary font-medium">😅 Hard</span>
                </button>
              </div>
              <div className="gradient-outline rounded-lg p-1">
                <button
                  onClick={() => {
                    setSession(prev => ({ ...prev, correct: prev.correct + 1, streak: prev.streak + 1 }));
                    handleNextQuestion();
                  }}
                  className="gradient-outline-content px-8 py-2 rounded-lg hover:scale-105 transition-transform"
                >
                  <span className="text-text-primary font-medium">😊 Easy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </GradientCard>
    );
  };

  const renderInteractiveMode = () => {
    const question = questions[currentQuestion];
    if (!question) return null;

    return (
      <GradientCard className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-xs text-text-muted mb-2">{question.unit}</div>
            <h3 className="text-2xl font-semibold text-text-primary mb-6">
              {question.front}
            </h3>
          </div>
          
          {!showResult ? (
            <div className="space-y-4">
              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(index)}
                      className={`w-full p-4 text-left rounded-lg border transition-all ${
                        selectedOption === index
                          ? 'border-gradient-purple bg-gradient-to-r from-purple-500/10 to-orange-500/10'
                          : 'border-card-border hover:border-gradient-purple/50 bg-surface'
                      }`}
                    >
                      <span className="text-base">{option}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {(question.type === 'typing' || question.type === 'true-false') && (
                <div className="space-y-4">
                  {question.type === 'true-false' ? (
                    <div className="flex gap-4 justify-center">
                      <div className="gradient-outline rounded-lg p-1">
                        <button 
                          onClick={() => { setUserAnswer('true'); }}
                          className={`gradient-outline-content px-12 py-4 text-lg rounded-lg transition-all ${
                            userAnswer === 'true' ? 'bg-gradient-to-r from-purple-500/20 to-orange-500/20' : ''
                          }`}
                        >
                          <span className="text-text-primary font-semibold">True</span>
                        </button>
                      </div>
                      <div className="gradient-outline rounded-lg p-1">
                        <button 
                          onClick={() => { setUserAnswer('false'); }}
                          className={`gradient-outline-content px-12 py-4 text-lg rounded-lg transition-all ${
                            userAnswer === 'false' ? 'bg-gradient-to-r from-purple-500/20 to-orange-500/20' : ''
                          }`}
                        >
                          <span className="text-text-primary font-semibold">False</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      className="w-full p-4 text-lg rounded-lg border border-card-border bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:border-gradient-purple"
                      onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                      autoFocus
                    />
                  )}
                </div>
              )}
              
              <div className="flex justify-center">
                <div className="gradient-outline rounded-lg p-1">
                  <button 
                    onClick={checkAnswer} 
                    disabled={
                      (question.type === 'multiple-choice' && selectedOption === null) ||
                      ((question.type === 'typing' || question.type === 'true-false') && !userAnswer.trim())
                    }
                    className="gradient-outline-content px-12 py-3 text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                  >
                    <span className="text-text-primary font-semibold">Submit Answer</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Result */}
              <div className={`p-6 rounded-lg ${isCorrect ? 'bg-gaming-success/10 border border-gaming-success' : 'bg-gaming-error/10 border border-gaming-error'}`}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-gaming-success" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gaming-error" />
                  )}
                  <span className={`text-lg font-medium ${isCorrect ? 'text-gaming-success' : 'text-gaming-error'}`}>
                    {isCorrect ? 'Excellent! 🎉' : 'Not quite right'}
                  </span>
                </div>
                <div className="text-center text-base text-text-primary">
                  <strong>Correct Answer:</strong> {question.back}
                </div>
              </div>

              {/* AI Explanation Button for wrong answers */}
              {!isCorrect && (mode === 'learn' || mode === 'write' || mode === 'spaced-repetition') && (
                <div className="space-y-4">
                  {!aiExplanation && !loadingExplanation && (
                    <div className="flex justify-center">
                      <div className="gradient-outline rounded-lg p-1">
                        <button 
                          onClick={() => getAIExplanation(question, userAnswer || selectedOption?.toString() || '')}
                          className="gradient-outline-content px-6 py-2 rounded-lg hover:scale-105 transition-transform"
                        >
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-gradient-orange" />
                            <span className="text-text-primary font-medium">Get AI Explanation</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {loadingExplanation && (
                    <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-surface-muted">
                      <Loader2 className="w-5 h-5 text-gradient-purple animate-spin" />
                      <span className="text-text-secondary">AI is explaining your mistake...</span>
                    </div>
                  )}

                  {aiExplanation && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-gradient-purple/30">
                      <div className="flex items-start gap-3 mb-3">
                        <Lightbulb className="w-5 h-5 text-gradient-orange mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-gradient-purple">AI Explanation:</span>
                      </div>
                      <p className="text-sm text-text-primary leading-relaxed">{aiExplanation}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center">
                <div className="gradient-outline rounded-lg p-1">
                  <button 
                    onClick={handleNextQuestion} 
                    className="gradient-outline-content px-12 py-3 text-lg rounded-lg hover:scale-105 transition-transform"
                  >
                    <span className="text-text-primary font-semibold">Continue</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </GradientCard>
    );
  };

  const renderCurrentMode = () => {
    // All modes use interactive rendering
    return renderInteractiveMode();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <ParticleBackground />
        
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <GradientCard className="max-w-md mx-auto">
            <div className="text-center py-12 space-y-4">
              <div className="gradient-outline rounded-full p-1 w-16 h-16 mx-auto">
                <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                  <Brain className="w-8 h-8 text-gradient-purple animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold gradient-text">Generating {currentMode.name} Content</h2>
              <p className="text-text-secondary">AI is creating personalized {mode} questions for {subject}...</p>
              <div className="animate-spin w-6 h-6 border-2 border-gradient-purple border-t-transparent rounded-full mx-auto"></div>
            </div>
          </GradientCard>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <ParticleBackground />
      
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-card-border bg-surface/80 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="gradient-outline rounded-full p-1">
              <div className="gradient-outline-content rounded-full p-2">
                <currentMode.icon className="w-6 h-6 text-gradient-purple" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{currentMode.name}</h1>
              <p className="text-sm text-text-secondary">{subject} • {currentMode.description}</p>
            </div>
          </div>
          
          <button 
            onClick={handleExit}
            className="p-3 rounded-full bg-surface-muted hover:bg-surface-hover transition-colors"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Session Stats */}
      {(session.correct > 0 || session.incorrect > 0) && (
        <div className="relative z-10 p-6 border-b border-card-border bg-surface/50">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-4">
              <GradientCard className="text-center p-3">
                <div className="text-sm text-text-secondary">Correct</div>
                <div className="text-xl font-bold text-gaming-success">{session.correct}</div>
              </GradientCard>
              <GradientCard className="text-center p-3">
                <div className="text-sm text-text-secondary">Incorrect</div>
                <div className="text-xl font-bold text-gaming-error">{session.incorrect}</div>
              </GradientCard>
              <GradientCard className="text-center p-3">
                <div className="text-sm text-text-secondary">Streak</div>
                <div className="text-xl font-bold text-gradient-purple">{session.streak}</div>
              </GradientCard>
              <GradientCard className="text-center p-3">
                <div className="text-sm text-text-secondary">Accuracy</div>
                <div className="text-xl font-bold text-gradient-orange">
                  {session.correct + session.incorrect > 0 ? Math.round((session.correct / (session.correct + session.incorrect)) * 100) : 0}%
                </div>
              </GradientCard>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {questions.length > 0 && (
        <div className="relative z-10 p-6 border-b border-card-border bg-surface/30">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-secondary">Progress</span>
              <span className="text-sm text-gradient-purple font-medium">
                {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <div className="w-full bg-surface-muted rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {questions.length > 0 ? (
            renderCurrentMode()
          ) : (
            <GradientCard className="max-w-2xl mx-auto">
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">Failed to generate content for {subject}</p>
                <GradientButton onClick={onClose} className="mt-4">
                  Go Back
                </GradientButton>
              </div>
            </GradientCard>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <GradientCard className="max-w-md mx-auto">
            <div className="text-center space-y-6 p-6">
              <div className="gradient-outline rounded-full p-1 w-16 h-16 mx-auto">
                <div className="gradient-outline-content rounded-full w-full h-full bg-surface flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-gradient-orange" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">End Study Session?</h3>
                <p className="text-text-secondary">
                  Are you sure you want to end your {currentMode.name.toLowerCase()} session? 
                  Your progress will be saved.
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="gradient-outline rounded-lg p-1 flex-1">
                  <button 
                    onClick={cancelExit} 
                    className="gradient-outline-content w-full py-3 rounded-lg hover:scale-105 transition-transform"
                  >
                    <span className="text-text-primary font-medium">No, Continue</span>
                  </button>
                </div>
                <div className="gradient-outline rounded-lg p-1 flex-1">
                  <button 
                    onClick={confirmExit} 
                    className="gradient-outline-content w-full py-3 rounded-lg hover:scale-105 transition-transform"
                  >
                    <span className="text-text-primary font-medium">Yes, End Session</span>
                  </button>
                </div>
              </div>
            </div>
          </GradientCard>
        </div>
      )}
    </div>
  );
};
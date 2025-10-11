import React, { useState } from 'react';
import { GradientCard } from './ui/gradient-card';
import { GradientButton } from './ui/gradient-button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { Brain, Send, Loader2, Sparkles } from 'lucide-react';

interface AITutorChatProps {
  subject: string;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({ subject }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Array<{front: string, back: string}>>([]);
  const { toast } = useToast();

  const handleGenerateFlashcards = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    console.log('Generating flashcards for:', subject, 'with prompt:', prompt);

    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          type: 'flashcard',
          subject: subject,
          prompt: `Generate 3 flashcards about: ${prompt}`
        }
      });

      console.log('Flashcard response:', { data, error });

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
          console.log('Parsing flashcard response:', data.response);
          const flashcards = JSON.parse(data.response);
          console.log('Parsed flashcards:', flashcards);

          if (Array.isArray(flashcards) && flashcards.length > 0) {
            setGeneratedFlashcards(flashcards);
            setResponse('Generated custom flashcards!');
            toast({
              title: "Success!",
              description: `Generated ${flashcards.length} flashcards`,
            });
          } else {
            throw new Error('Invalid flashcard format');
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          setResponse(data.response);
          toast({
            title: "Warning",
            description: "Flashcards generated but couldn't parse format",
            variant: "destructive",
          });
        }
      } else {
        console.error('Data not successful:', data);
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetExplanation = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          type: 'explanation',
          subject: subject,
          prompt: prompt
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
        setResponse(data.response);
        setGeneratedFlashcards([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to get explanation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-gradient-purple" />
        <h3 className="text-lg font-semibold text-text-primary">AI Tutor for {subject}</h3>
        <Sparkles className="w-4 h-4 text-gradient-orange animate-pulse" />
      </div>

      <GradientCard>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Ask your AI tutor anything about {subject}:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`e.g., "Explain derivatives" or "Create flashcards about photosynthesis"`}
              className="w-full p-3 rounded-lg border border-surface-muted bg-surface text-text-primary placeholder-text-muted resize-none h-24 focus:outline-none focus:ring-2 focus:ring-gradient-purple/20"
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <GradientButton 
              onClick={handleGetExplanation}
              disabled={loading || !prompt.trim()}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Get Explanation
                </>
              )}
            </GradientButton>

            <GradientButton 
              onClick={handleGenerateFlashcards}
              disabled={loading || !prompt.trim()}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Flashcards
                </>
              )}
            </GradientButton>
          </div>
        </div>
      </GradientCard>

      {response && !generatedFlashcards.length && (
        <GradientCard>
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary flex items-center gap-2">
              <Brain className="w-4 h-4 text-gradient-purple" />
              AI Tutor Response:
            </h4>
            <p className="text-text-secondary leading-relaxed">{response}</p>
          </div>
        </GradientCard>
      )}

      {generatedFlashcards.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gradient-orange" />
            AI Generated Flashcards:
          </h4>
          {generatedFlashcards.map((card, index) => (
            <GradientCard key={index}>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gradient-purple font-medium">Question:</span>
                  <p className="text-text-primary">{card.front}</p>
                </div>
                <div>
                  <span className="text-sm text-gradient-orange font-medium">Answer:</span>
                  <p className="text-text-secondary">{card.back}</p>
                </div>
              </div>
            </GradientCard>
          ))}
        </div>
      )}
    </div>
  );
};
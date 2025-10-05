import React, { useState } from 'react';
import { GradientCard } from './ui/gradient-card';
import { GradientButton } from './ui/gradient-button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { BookOpen, Loader as Loader2, RefreshCw } from 'lucide-react';

interface AIPracticeGeneratorProps {
  subject: string;
}

export const AIPracticeGenerator: React.FC<AIPracticeGeneratorProps> = ({ subject }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [problems, setProblems] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateProblems = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const difficultyText = difficulty === 'easy' ? 'basic' : difficulty === 'medium' ? 'intermediate' : 'advanced AP-level';

      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          type: 'explanation',
          subject: subject,
          prompt: `Generate 5 ${difficultyText} practice problems for ${topic} in ${subject}.

For each problem:
1. Provide the problem statement
2. Include any necessary diagrams or setup (described in text)
3. Add hints if needed
4. Provide the complete solution with step-by-step explanations

Make the problems progressively challenging and AP exam-style.`
        }
      });

      if (error) throw error;

      if (data.success) {
        setProblems(data.response);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate practice problems. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-gradient-orange" />
        <h3 className="text-lg font-semibold text-text-primary">AI Practice Problem Generator</h3>
      </div>

      <GradientCard>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., derivatives, photosynthesis, thermodynamics"
              className="w-full p-3 rounded-lg border border-surface-muted bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gradient-purple/20"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Difficulty Level
            </label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level as any)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    difficulty === level
                      ? 'border-gradient-purple bg-gradient-to-r from-purple-500/10 to-orange-500/10 text-gradient-purple font-medium'
                      : 'border-card-border bg-surface text-text-secondary hover:border-gradient-purple/50'
                  }`}
                  disabled={loading}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <GradientButton
            onClick={handleGenerateProblems}
            disabled={loading || !topic.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating Problems...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Practice Problems
              </>
            )}
          </GradientButton>
        </div>
      </GradientCard>

      {problems && (
        <GradientCard>
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gradient-orange" />
              Practice Problems
            </h4>
            <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
              {problems}
            </div>
            <GradientButton
              onClick={handleGenerateProblems}
              variant="secondary"
              size="sm"
              className="w-full mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Problems
            </GradientButton>
          </div>
        </GradientCard>
      )}
    </div>
  );
};

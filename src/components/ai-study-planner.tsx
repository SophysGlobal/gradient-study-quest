import React, { useState } from 'react';
import { GradientCard } from './ui/gradient-card';
import { GradientButton } from './ui/gradient-button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';
import { Calendar, Clock, Target, Loader as Loader2 } from 'lucide-react';

interface AIStudyPlannerProps {
  subject: string;
}

export const AIStudyPlanner: React.FC<AIStudyPlannerProps> = ({ subject }) => {
  const [daysUntilExam, setDaysUntilExam] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [studyPlan, setStudyPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    if (!daysUntilExam || !hoursPerDay) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
          type: 'explanation',
          subject: subject,
          prompt: `Create a detailed study plan for ${subject} with ${daysUntilExam} days until the AP exam and ${hoursPerDay} hours per day to study. Include:
- Daily topics to cover
- Time allocation for each topic
- Practice activities
- Review sessions
- Test-taking strategies

Format it as a clear, organized schedule.`
        }
      });

      if (error) throw error;

      if (data.success) {
        setStudyPlan(data.response);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate study plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gradient-purple" />
        <h3 className="text-lg font-semibold text-text-primary">AI Study Plan Generator</h3>
      </div>

      <GradientCard>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Days until exam
            </label>
            <input
              type="number"
              value={daysUntilExam}
              onChange={(e) => setDaysUntilExam(e.target.value)}
              placeholder="e.g., 30"
              className="w-full p-3 rounded-lg border border-surface-muted bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gradient-purple/20"
              disabled={loading}
              min="1"
              max="365"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Hours per day to study
            </label>
            <input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              placeholder="e.g., 2"
              className="w-full p-3 rounded-lg border border-surface-muted bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gradient-purple/20"
              disabled={loading}
              min="0.5"
              max="12"
              step="0.5"
            />
          </div>

          <GradientButton
            onClick={handleGeneratePlan}
            disabled={loading || !daysUntilExam || !hoursPerDay}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating Plan...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Generate Study Plan
              </>
            )}
          </GradientButton>
        </div>
      </GradientCard>

      {studyPlan && (
        <GradientCard>
          <div className="space-y-2">
            <h4 className="font-medium text-text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gradient-purple" />
              Your Personalized Study Plan
            </h4>
            <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
              {studyPlan}
            </div>
          </div>
        </GradientCard>
      )}
    </div>
  );
};

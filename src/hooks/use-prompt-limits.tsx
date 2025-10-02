import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PromptUsage {
  dailyUsed: number;
  monthlyUsed: number;
  dailyLimit: number;
  monthlyLimit: number;
  canUsePrompt: boolean;
}

export const usePromptLimits = (subscriptionTier?: string) => {
  const [usage, setUsage] = useState<PromptUsage>({
    dailyUsed: 0,
    monthlyUsed: 0,
    dailyLimit: 3,
    monthlyLimit: 15,
    canUsePrompt: true
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Personal+ and Enterprise have unlimited prompts
  const hasUnlimitedPrompts = subscriptionTier === 'Premium' || subscriptionTier === 'Enterprise';

  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_prompt_usage')
        .select('daily_prompts_used, monthly_prompts_used')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      const dailyUsed = data?.daily_prompts_used || 0;
      const monthlyUsed = data?.monthly_prompts_used || 0;

      setUsage({
        dailyUsed,
        monthlyUsed,
        dailyLimit: 3,
        monthlyLimit: 15,
        canUsePrompt: hasUnlimitedPrompts || (dailyUsed < 3 && monthlyUsed < 15)
      });
    } catch (error) {
      console.error('Error fetching prompt usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (): Promise<boolean> => {
    if (hasUnlimitedPrompts) return true;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const today = new Date().toISOString().split('T')[0];
      
      // Upsert usage record
      const { data, error } = await supabase
        .from('user_prompt_usage')
        .upsert({
          user_id: user.id,
          date: today,
          daily_prompts_used: usage.dailyUsed + 1,
          monthly_prompts_used: usage.monthlyUsed + 1
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setUsage(prev => ({
        ...prev,
        dailyUsed: data.daily_prompts_used,
        monthlyUsed: data.monthly_prompts_used,
        canUsePrompt: data.daily_prompts_used < 3 && data.monthly_prompts_used < 15
      }));

      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      toast({
        title: "Error",
        description: "Failed to track prompt usage. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [hasUnlimitedPrompts]);

  return {
    usage,
    loading,
    incrementUsage,
    refreshUsage: fetchUsage,
    hasUnlimitedPrompts
  };
};
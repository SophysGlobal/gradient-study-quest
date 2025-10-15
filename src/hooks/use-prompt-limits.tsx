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

const getESTDate = () => {
  const now = new Date();
  const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return estDate.toISOString().split('T')[0];
};

const getESTMonth = () => {
  const now = new Date();
  const estDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return `${estDate.getFullYear()}-${String(estDate.getMonth() + 1).padStart(2, '0')}`;
};

export const usePromptLimits = () => {
  const [usage, setUsage] = useState<PromptUsage>({
    dailyUsed: 0,
    monthlyUsed: 0,
    dailyLimit: 3,
    monthlyLimit: 15,
    canUsePrompt: true
  });
  const [loading, setLoading] = useState(true);
  const [hasUnlimitedPrompts, setHasUnlimitedPrompts] = useState(false);
  const { toast } = useToast();

  const checkUserPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return false;
      }

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('subscription_plan')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return false;
      }

      const plan = preferences?.subscription_plan || 'personal';
      console.log('User plan:', plan);

      return plan === 'personal-plus';
    } catch (error) {
      console.error('Error checking user plan:', error);
      return false;
    }
  };


  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const isUnlimited = await checkUserPlan();
      setHasUnlimitedPrompts(isUnlimited);

      if (isUnlimited) {
        console.log('User has unlimited prompts');
        setUsage({
          dailyUsed: 0,
          monthlyUsed: 0,
          dailyLimit: 999,
          monthlyLimit: 999,
          canUsePrompt: true
        });
        setLoading(false);
        return;
      }

      const todayEST = getESTDate();
      const currentMonthEST = getESTMonth();

      const { data, error } = await supabase
        .from('user_prompt_usage')
        .select('daily_prompts_used, monthly_prompts_used, date, created_at')
        .eq('user_id', user.id)
        .eq('date', todayEST)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage:', error);
      }

      let dailyUsed = 0;
      let monthlyUsed = 0;

      if (data) {
        const recordMonth = data.date.substring(0, 7);

        if (recordMonth === currentMonthEST) {
          monthlyUsed = data.monthly_prompts_used || 0;
        }

        dailyUsed = data.daily_prompts_used || 0;
      }

      console.log('Prompt usage:', { dailyUsed, monthlyUsed, canUsePrompt: dailyUsed < 3 && monthlyUsed < 15 });

      setUsage({
        dailyUsed,
        monthlyUsed,
        dailyLimit: 3,
        monthlyLimit: 15,
        canUsePrompt: dailyUsed < 3 && monthlyUsed < 15
      });
    } catch (error) {
      console.error('Error fetching prompt usage:', error);
      setUsage(prev => ({
        ...prev,
        canUsePrompt: true
      }));
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (): Promise<boolean> => {
    if (hasUnlimitedPrompts) {
      console.log('Unlimited prompts - skipping increment');
      return true;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const todayEST = getESTDate();
      const currentMonthEST = getESTMonth();

      const { data: existing } = await supabase
        .from('user_prompt_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayEST)
        .maybeSingle();

      let newDailyUsed = 1;
      let newMonthlyUsed = 1;

      if (existing) {
        const recordMonth = existing.date.substring(0, 7);
        newDailyUsed = (existing.daily_prompts_used || 0) + 1;
        newMonthlyUsed = recordMonth === currentMonthEST
          ? (existing.monthly_prompts_used || 0) + 1
          : 1;
      }

      console.log('Incrementing usage to:', { newDailyUsed, newMonthlyUsed });

      const { data, error } = await supabase
        .from('user_prompt_usage')
        .upsert({
          user_id: user.id,
          date: todayEST,
          daily_prompts_used: newDailyUsed,
          monthly_prompts_used: newMonthlyUsed,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error incrementing usage:', error);
        throw error;
      }

      if (data) {
        setUsage(prev => ({
          ...prev,
          dailyUsed: data.daily_prompts_used,
          monthlyUsed: data.monthly_prompts_used,
          canUsePrompt: data.daily_prompts_used < 3 && data.monthly_prompts_used < 15
        }));
      }

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
  }, []);

  return {
    usage,
    loading,
    incrementUsage,
    refreshUsage: fetchUsage,
    hasUnlimitedPrompts
  };
};

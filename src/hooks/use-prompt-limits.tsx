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
      if (!user) return false;

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('subscription_plan')
        .eq('user_id', user.id)
        .maybeSingle();

      return preferences?.subscription_plan === 'personal-plus';
    } catch (error) {
      console.error('Error checking user plan:', error);
      return false;
    }
  };

  const resetAdminPrompts = async () => {
    const isAdminMode = localStorage.getItem('ada-admin-mode') === 'true';
    if (!isAdminMode) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_prompt_usage')
        .delete()
        .eq('user_id', user.id);

      console.log('Admin prompts reset successfully');
    } catch (error) {
      console.error('Error resetting admin prompts:', error);
    }
  };

  const fetchUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await resetAdminPrompts();

      const isUnlimited = await checkUserPlan();
      setHasUnlimitedPrompts(isUnlimited);

      if (isUnlimited) {
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
        throw error;
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

      setUsage({
        dailyUsed,
        monthlyUsed,
        dailyLimit: 3,
        monthlyLimit: 15,
        canUsePrompt: dailyUsed < 3 && monthlyUsed < 15
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

      if (error) throw error;

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

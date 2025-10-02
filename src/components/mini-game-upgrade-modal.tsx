import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GradientButton } from '@/components/ui/gradient-button';
import { GradientCard } from '@/components/ui/gradient-card';
import { Crown, Building, Check, Loader as Loader2 } from 'lucide-react';
import { getProductsByMode } from '@/stripe-config';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MiniGameUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType?: 'daily' | 'monthly' | 'feature';
}

export const MiniGameUpgradeModal: React.FC<MiniGameUpgradeModalProps> = ({
  isOpen,
  onClose,
  limitType = 'feature'
}) => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const subscriptionProducts = getProductsByMode('subscription');

  const getProductForPlan = (planId: string, billing: 'monthly' | 'yearly') => {
    let productName = '';
    if (planId === 'personal-plus') {
      productName = billing === 'monthly'
        ? 'ADA Education Personal+ Plan (Monthly)'
        : 'ADA Education Personal+ Plan (Yearly)';
    }
    
    return subscriptionProducts.find(p => p.name === productName);
  };

  const yearlyDiscount = () => {
    const monthlyProduct = getProductForPlan('personal-plus', 'monthly');
    const yearlyProduct = getProductForPlan('personal-plus', 'yearly');
    
    if (!monthlyProduct || !yearlyProduct) return 0;
    
    const yearlyPrice = yearlyProduct.price;
    const monthlyYearlyPrice = monthlyProduct.price * 12;
    
    return Math.round(((monthlyYearlyPrice - yearlyPrice) / monthlyYearlyPrice) * 100);
  };

  const handleContinue = async () => {
    if (selectedPlan !== 'personal-plus') return;

    setLoading(true);
    
    try {
      // Check if admin mode is active
      const isAdminMode = localStorage.getItem('ada-admin-mode') === 'true';
      
      if (isAdminMode) {
        toast({
          title: "Admin Mode",
          description: "Simulating successful payment...",
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.href = `${window.location.origin}/success?session_id=admin_simulation`;
        return;
      }

      // Find the matching product based on billing cycle
      const productName = billingCycle === 'monthly'
        ? 'ADA Education Personal+ Plan (Monthly)'
        : 'ADA Education Personal+ Plan (Yearly)';

      const product = subscriptionProducts.find(p => p.name === productName);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // Create checkout session
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/`
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSales = () => {
    // For now, just show a message
    toast({
      title: "Contact Sales",
      description: "Enterprise features coming soon! Please contact support for more information.",
    });
  };

  const product = getProductForPlan('personal-plus', billingCycle);

  const getTitle = () => {
    if (limitType === 'daily') return 'Daily Prompts Exhausted';
    if (limitType === 'monthly') return 'Monthly Prompts Exhausted';
    return 'Unlock Premium Features';
  };

  const getDescription = () => {
    if (limitType === 'daily') return "You've used all 3 of your daily prompts. Upgrade to Personal+ for unlimited AI tutoring.";
    if (limitType === 'monthly') return "You've used all 15 of your monthly prompts. Upgrade to Personal+ for unlimited AI tutoring.";
    return 'Get unlimited access to all mini-games and AI tutoring';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center gradient-text">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center text-text-secondary text-sm">
            {getDescription()}
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center">
            <div className="gradient-outline rounded-full p-1">
              <div className="gradient-outline-content rounded-full flex">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === 'monthly' 
                      ? 'bg-gradient-purple text-white' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === 'yearly' 
                      ? 'bg-gradient-purple text-white' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Yearly
                  <span className="ml-1 text-xs bg-gaming-success text-white px-2 py-0.5 rounded-full">
                    Save {yearlyDiscount()}%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Plans */}
          <div className="space-y-3">
            {/* Personal+ Plan */}
            <GradientCard
              selectable
              selected={selectedPlan === 'personal-plus'}
              onClick={() => setSelectedPlan('personal-plus')}
              className="cursor-pointer gradient-glow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="gradient-outline rounded-lg p-2">
                      <div className="gradient-outline-content rounded-lg p-2">
                        <Crown className="w-5 h-5 text-gradient-purple" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">Personal+</h3>
                      {product && (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold gradient-text">
                            ${billingCycle === 'monthly' ? product.price : (product.price / 12).toFixed(2)}
                          </span>
                          <span className="text-sm text-text-muted">/month</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {billingCycle === 'yearly' && product && (
                  <div className="text-sm text-gaming-success bg-gaming-success/10 px-3 py-2 rounded-lg">
                    Save ${((getProductForPlan('personal-plus', 'monthly')?.price || 0) * 12 - product.price).toFixed(0)} per year ({yearlyDiscount()}% off)
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gaming-success flex-shrink-0" />
                    <span className="text-sm text-text-secondary">Unlimited AI prompts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gaming-success flex-shrink-0" />
                    <span className="text-sm text-text-secondary">All premium mini-games</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gaming-success flex-shrink-0" />
                    <span className="text-sm text-text-secondary">Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gaming-success flex-shrink-0" />
                    <span className="text-sm text-text-secondary">Priority updates</span>
                  </div>
                </div>
              </div>
            </GradientCard>

            {/* Enterprise Plan */}
            <GradientCard
              selectable
              selected={selectedPlan === 'enterprise'}
              onClick={() => setSelectedPlan('enterprise')}
              className="cursor-pointer opacity-75"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="gradient-outline rounded-lg p-2">
                      <div className="gradient-outline-content rounded-lg p-2">
                        <Building className="w-5 h-5 text-gradient-purple" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">Enterprise</h3>
                      <p className="text-sm text-text-secondary">Custom pricing</p>
                    </div>
                  </div>
                  <GradientButton size="sm" onClick={handleContactSales}>
                    Contact Sales
                  </GradientButton>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gaming-success flex-shrink-0" />
                    <span className="text-sm text-text-secondary">Everything in Personal+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gaming-success flex-shrink-0" />
                    <span className="text-sm text-text-secondary">Team licenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gaming-success flex-shrink-0" />
                    <span className="text-sm text-text-secondary">Dedicated support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gaming-success flex-shrink-0" />
                    <span className="text-sm text-text-secondary">Custom integrations</span>
                  </div>
                </div>
              </div>
            </GradientCard>
          </div>

          {/* Continue Button */}
          {selectedPlan === 'personal-plus' && (
            <div className="animate-scale-in">
              <GradientButton
                size="lg"
                className="w-full"
                onClick={handleContinue}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue with Personal+'
                )}
              </GradientButton>
            </div>
          )}

          <div className="flex gap-3">
            <GradientButton
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </GradientButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
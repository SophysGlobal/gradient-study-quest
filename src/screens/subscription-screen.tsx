import React, { useState, useEffect } from 'react';
import { GradientButton } from '@/components/ui/gradient-button';
import { GradientCard } from '@/components/ui/gradient-card';
import { ParticleBackground } from '@/components/animations/particle-background';
import { Check, Zap, Crown, Building, Loader as Loader2 } from 'lucide-react';
import { STRIPE_PRODUCTS, getProductsByMode } from '@/stripe-config';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionScreenProps {
  onSelectPlan: (plan: string, billing: 'monthly' | 'yearly') => void;
}

const plans = [
  {
    id: 'personal',
    name: 'Personal',
    icon: Zap,
    features: [
      'Access to all AP subjects',
      'Personalized learning tracking',
      'AI-powered flashcards',
      'Progress analytics',
      'Basic minigames'
    ],
    popular: false
  },
  {
    id: 'personal-plus',
    name: 'Personal+',
    icon: Crown,
    features: [
      'Everything in Personal',
      'AI tutoring & explanations',
      'Advanced analytics',
      'Priority updates',
      'Unlimited minigames',
      'Custom study plans'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building,
    features: [
      'Everything in Personal+',
      'Team licenses',
      'Dedicated support',
      'Custom integrations',
      'Admin dashboard',
      'Bulk management'
    ],
    popular: false
  }
];

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  onSelectPlan,
}) => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const subscriptionProducts = getProductsByMode('subscription');
  const [priceMap, setPriceMap] = useState<Record<string, { unit_amount: number; currency: string; interval?: 'month' | 'year' }>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      const priceIds = subscriptionProducts.map(p => p.priceId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase.functions.invoke('stripe-prices', {
        body: { price_ids: priceIds },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!error && Array.isArray(data)) {
        const map: Record<string, { unit_amount: number; currency: string; interval?: 'month' | 'year' }> = {};
        data.forEach((p: any) => { map[p.id] = { unit_amount: p.unit_amount, currency: p.currency, interval: p.recurring?.interval }; });
        setPriceMap(map);
      }
    };
    fetchPrices();
  }, []);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    if (!selectedPlan) return;

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No active user');
      }

      // Check if user is admin
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      // If admin, bypass Stripe and proceed without modifying preferences
      if (isAdmin) {
        toast({
          title: "Admin bypass",
          description: "Admin access granted. Skipping payment.",
        });
        setLoading(false);
        onSelectPlan(selectedPlan, billingCycle);
        return;
      }

      // Non-admin users: proceed with Stripe checkout
      // Find the matching product based on plan and billing cycle
      let productName = '';
      if (selectedPlan === 'personal') {
        productName = billingCycle === 'monthly' 
          ? 'ADA Education Personal Plan (Monthly)'
          : 'ADA Education Personal Plan (Yearly)';
      } else if (selectedPlan === 'personal-plus') {
        productName = billingCycle === 'monthly'
          ? 'ADA Education Personal+ Plan (Monthly)'
          : 'ADA Education Personal+ Plan (Yearly)';
      }

      const product = subscriptionProducts.find(p => p.name === productName);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Do not modify user_preferences here to avoid RLS trigger errors

      // Create checkout session
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/subscription`
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
      
      // Provide helpful error message
      let errorMessage = error.message || "Failed to start checkout process";
      
      if (error.message?.includes('not active') || error.message?.includes('not available')) {
        errorMessage = "Your Stripe products need to be activated. Please visit your Stripe Dashboard to activate the products.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProductForPlan = (planId: string, billing: 'monthly' | 'yearly') => {
    let productName = '';
    if (planId === 'personal') {
      productName = billing === 'monthly' 
        ? 'ADA Education Personal Plan (Monthly)'
        : 'ADA Education Personal Plan (Yearly)';
    } else if (planId === 'personal-plus') {
      productName = billing === 'monthly'
        ? 'ADA Education Personal+ Plan (Monthly)'
        : 'ADA Education Personal+ Plan (Yearly)';
    }
    
    return subscriptionProducts.find(p => p.name === productName);
  };

  const yearlyDiscount = (planId: string) => {
    const monthlyProduct = getProductForPlan(planId, 'monthly');
    const yearlyProduct = getProductForPlan(planId, 'yearly');
    if (!monthlyProduct || !yearlyProduct) return 0;
    const monthly = priceMap[monthlyProduct.priceId]?.unit_amount ? priceMap[monthlyProduct.priceId].unit_amount / 100 : monthlyProduct.price;
    const yearly = priceMap[yearlyProduct.priceId]?.unit_amount ? priceMap[yearlyProduct.priceId].unit_amount / 100 : yearlyProduct.price;
    const monthlyYearlyPrice = monthly * 12;
    return Math.round(((monthlyYearlyPrice - yearly) / monthlyYearlyPrice) * 100);
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col p-6">
      <ParticleBackground />
      
      <div className="relative z-10 flex-1 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8 stagger-item">
          <h1 className="text-3xl font-bold gradient-text mb-2">Choose Your Plan</h1>
          <p className="text-text-secondary">Unlock your full learning potential</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-8 stagger-item">
          <div className="gradient-outline rounded-full p-1">
            <div className="gradient-outline-content rounded-full flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-gradient-purple text-white' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'yearly' 
                    ? 'bg-gradient-purple text-white' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs bg-gaming-success text-white px-2 py-0.5 rounded-full">
                  Save up to 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4 mb-8 stagger-item">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isEnterprise = plan.id === 'enterprise';
            const product = getProductForPlan(plan.id, billingCycle);
            
            return (
              <GradientCard
                key={plan.id}
                selectable
                selected={isSelected}
                onClick={() => !isEnterprise && handlePlanSelect(plan.id)}
                className={`cursor-pointer relative ${plan.popular ? 'gradient-glow' : ''} ${isEnterprise ? 'opacity-75' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-gradient-purple to-gradient-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="space-y-4">
                  {/* Plan Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="gradient-outline rounded-lg p-2">
                        <div className="gradient-outline-content rounded-lg p-2">
                          <Icon className="w-6 h-6 text-gradient-purple" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-text-primary">{plan.name}</h3>
                            {!isEnterprise && product && (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold gradient-text">
                                  {
                                    (() => {
                                      if (billingCycle === 'monthly') {
                                        const live = priceMap[product.priceId]?.unit_amount;
                                        return `$${(live ? live / 100 : product.price).toFixed(2)}`;
                                      } else {
                                        const yearlyProduct = getProductForPlan(plan.id, 'yearly');
                                        const liveYear = yearlyProduct ? priceMap[yearlyProduct.priceId]?.unit_amount : undefined;
                                        const yearPrice = yearlyProduct ? (liveYear ? liveYear / 100 : yearlyProduct.price) : 0;
                                        return `$${(yearPrice / 12).toFixed(2)}`;
                                      }
                                    })()
                                  }
                                </span>
                                <span className="text-sm text-text-muted">/month</span>
                              </div>
                            )}
                      </div>
                    </div>
                    {isEnterprise && (
                      <GradientButton size="sm" disabled>
                        Coming Soon
                      </GradientButton>
                    )}
                  </div>

                  {/* Yearly Savings */}
                  {!isEnterprise && billingCycle === 'yearly' && product && (
                    <div className="text-sm text-gaming-success bg-gaming-success/10 px-3 py-2 rounded-lg">
                      {
                        (() => {
                          const monthlyProduct = getProductForPlan(plan.id, 'monthly');
                          const yearlyProduct = getProductForPlan(plan.id, 'yearly');
                          const monthly = monthlyProduct ? (priceMap[monthlyProduct.priceId]?.unit_amount ? priceMap[monthlyProduct.priceId].unit_amount / 100 : monthlyProduct.price) : 0;
                          const yearly = yearlyProduct ? (priceMap[yearlyProduct.priceId]?.unit_amount ? priceMap[yearlyProduct.priceId].unit_amount / 100 : yearlyProduct.price) : 0;
                          const saving = monthly * 12 - yearly;
                          return <>Save ${saving.toFixed(0)} per year ({yearlyDiscount(plan.id)}% off)</>;
                        })()
                      }
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-gaming-success flex-shrink-0" />
                        <span className="text-sm text-text-secondary">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </GradientCard>
            );
          })}
        </div>

        {/* Continue Button */}
        {selectedPlan && selectedPlan !== 'enterprise' && (
          <div className="stagger-item">
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
                `Continue with ${plans.find(p => p.id === selectedPlan)?.name}`
              )}
            </GradientButton>
          </div>
        )}
      </div>
    </div>
  );
};
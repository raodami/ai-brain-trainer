'use client';
import { useState } from 'react';
import {
  SparklesIcon,
  CheckCircleIcon,
  CreditCardIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

interface PricingProps {
  onUpgrade: () => void;
}

export default function Pricing({ onUpgrade }: PricingProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: ['3 sessions per day', 'All 4 games', 'Basic analytics', 'Mobile access'],
      cta: 'Get Started',
      popular: false,
    },
    {
      id: 'pro-monthly',
      name: 'Pro Monthly',
      price: '$9.99',
      period: '/month',
      description: 'Full access to all features',
      features: ['Unlimited sessions', 'All 4 games', 'Advanced analytics', 'Priority support', 'Offline mode', 'Custom training plans'],
      cta: 'Upgrade Monthly',
      popular: true,
    },
    {
      id: 'pro-annual',
      name: 'Pro Annual',
      price: '$59',
      period: '/year',
      description: 'Save 50% - best value',
      features: ['Everything in Monthly', 'Save $60/year', 'Early access to new games', 'Family sharing (up to 5)'],
      cta: 'Upgrade Annual',
      popular: false,
    },
  ];

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);
    
    try {
      // Call backend to create checkout session
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', plan_id: planId }),
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      // Demo mode - just trigger callback
      onUpgrade();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-purple-500/20">
      <div className="text-center mb-8">
        <h2 className="text-white text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-400">Start free, upgrade when ready</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-slate-900/50 rounded-2xl p-6 border transition-all hover:scale-105 ${
              plan.popular ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-purple-500/20'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full">
                Most Popular
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-white text-xl font-bold">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircleIcon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                plan.popular
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              } disabled:opacity-50`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
          <LockClosedIcon className="w-4 h-4" />
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}

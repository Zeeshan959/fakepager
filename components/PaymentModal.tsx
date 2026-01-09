
import React, { useState } from 'react';
import { PagerloLogoIcon } from './icons/PagerloLogoIcon';
import { LockIcon } from './icons/LockIcon';
import { Theme } from '../types';
import { useAuth } from '../hooks/useAuth';
import { SyncIcon } from './icons/SyncIcon';

const CHECKOUT_URL = 'https://buy.polar.sh/polar_cl_8j5qPiSFVkYO7ikMfp8XxGsYKdpycsTnjoeju0ESVGb';

interface PaymentModalProps {
  theme: Theme;
  onNavigateHome: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ theme, onNavigateHome }) => {
  const { user, signOut, refreshProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getSuccessUrl = () => {
    const cleanUrl = new URL(window.location.origin + "/reader");
    cleanUrl.searchParams.set('payment_success', 'true');
    return cleanUrl.toString();
  };

  const checkoutUrlWithParams = new URL(CHECKOUT_URL);
  checkoutUrlWithParams.searchParams.set('success_url', getSuccessUrl());
  if (user) {
    checkoutUrlWithParams.searchParams.set('metadata[client_reference_id]', user.id);
    checkoutUrlWithParams.searchParams.set('customer_email', user.email || '');
  }
  const finalCheckoutUrl = checkoutUrlWithParams.toString();

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigateHome(); // Redirect back to landing page after sign out
  };

  const modalBgClass = theme === Theme.White ? 'bg-white' : 'bg-gray-800';
  const modalTextClass = theme === Theme.White ? 'text-gray-800' : 'text-gray-200';
  const modalSubtleTextClass = theme === Theme.White ? 'text-gray-600' : 'text-gray-400';
  const modalSubtleTextClass2 = theme === Theme.White ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={`rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fade-in-up ${modalBgClass} ${modalTextClass}`}
        style={{ animationDuration: '0.3s' }}
      >
        <PagerloLogoIcon className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Trial Has Ended</h2>
        <p className={`${modalSubtleTextClass} mb-6`}>
          Thanks for trying Pagerlo! To continue reading and access all features, please purchase a lifetime license.
        </p>
        
        <div className="flex flex-col gap-3">
          <a
            href={finalCheckoutUrl}
            className="flex w-full items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-brand-primary rounded-lg shadow-lg hover:bg-brand-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-transform duration-200 ease-in-out hover:scale-105 active:scale-100"
          >
            <LockIcon className="w-5 h-5" />
            Unlock Full Access (One-Time)
          </a>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`flex w-full items-center justify-center gap-2.5 px-6 py-2.5 text-sm font-semibold rounded-lg border border-gray-500/30 hover:bg-gray-500/10 transition-colors disabled:opacity-50`}
          >
            <SyncIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Checking Status...' : 'Already Paid? Refresh Status'}
          </button>
        </div>

        <p className={`text-xs ${modalSubtleTextClass2} mt-4`}>
          Secure checkout via Polar.sh. Updates may take a few moments.
        </p>

        <div className="mt-8">
            <button
                onClick={handleSignOut}
                className={`text-sm font-medium underline-offset-4 hover:underline transition-colors ${modalSubtleTextClass}`}
            >
                Sign Out
            </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

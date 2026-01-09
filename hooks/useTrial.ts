import { useState, useEffect, useCallback } from 'react';
import { UserStatus } from '../types';

const TRIAL_START_DATE_KEY = 'pagerlo_trial_start_date';
const PAYMENT_STATUS_KEY = 'pagerlo_payment_status';
const TRIAL_DURATION_DAYS = 3;

export const useTrial = () => {
  const [status, setStatus] = useState<UserStatus>('NEVER_STARTED');
  const [daysRemaining, setDaysRemaining] = useState<number>(TRIAL_DURATION_DAYS);

  const checkStatus = useCallback(() => {
    const paymentStatus = localStorage.getItem(PAYMENT_STATUS_KEY);
    if (paymentStatus === 'paid') {
      setStatus('PAID');
      setDaysRemaining(Infinity);
      return;
    }

    const trialStartDateStr = localStorage.getItem(TRIAL_START_DATE_KEY);
    if (trialStartDateStr) {
      const trialStartDate = parseInt(trialStartDateStr, 10);
      const now = Date.now();
      const elapsedDays = (now - trialStartDate) / (1000 * 60 * 60 * 24);

      if (elapsedDays > TRIAL_DURATION_DAYS) {
        setStatus('TRIAL_ENDED');
        setDaysRemaining(0);
      } else {
        setStatus('TRIALING');
        setDaysRemaining(Math.ceil(TRIAL_DURATION_DAYS - elapsedDays));
      }
    } else {
      setStatus('NEVER_STARTED');
      setDaysRemaining(TRIAL_DURATION_DAYS);
    }
  }, []);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true') {
      localStorage.setItem(PAYMENT_STATUS_KEY, 'paid');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    checkStatus();
  }, [checkStatus]);

  const startTrial = () => {
    const trialStartDateStr = localStorage.getItem(TRIAL_START_DATE_KEY);
    const paymentStatus = localStorage.getItem(PAYMENT_STATUS_KEY);
    if (!trialStartDateStr && paymentStatus !== 'paid') {
        localStorage.setItem(TRIAL_START_DATE_KEY, Date.now().toString());
        checkStatus();
    }
  };

  return { status, daysRemaining, startTrial };
};

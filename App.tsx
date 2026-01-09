import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './pages/LandingPage';
import ReaderPage from './pages/ReaderPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import { useAuth } from './hooks/useAuth';

type Page = 'landing' | 'reader' | 'terms' | 'privacy' | 'contact';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const { user, loading, refreshProfile, pollForPaidStatus } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const syncPageWithUrl = useCallback(() => {
    // For Electron and SPAs, we use Hash Routing (e.g., #/reader)
    // This avoids issues with file:// protocols and server configurations
    const hash = window.location.hash;
    
    // Handle Supabase Auth redirects (which often use hash fragments)
    if (hash.includes('access_token=') || hash.includes('id_token=')) {
        setCurrentPage('reader');
        return;
    }

    // Extract the route from the hash (remove the leading #)
    // e.g., "#/reader" -> "/reader"
    const route = hash.replace(/^#/, '');

    if (route === '/privacy') setCurrentPage('privacy');
    else if (route === '/terms') setCurrentPage('terms');
    else if (route === '/contact') setCurrentPage('contact');
    else if (route === '/reader') setCurrentPage('reader');
    else setCurrentPage('landing');
  }, []);

  const navigateTo = useCallback((path: string) => {
    // Update the hash instead of the pathname
    window.location.hash = path;
  }, []);

  // Initial sync
  useEffect(() => {
    syncPageWithUrl();
    window.addEventListener('hashchange', syncPageWithUrl);
    return () => window.removeEventListener('hashchange', syncPageWithUrl);
  }, [syncPageWithUrl]);

  // Protected Route Logic
  useEffect(() => {
    if (!loading && currentPage === 'reader' && !user) {
      navigateTo('/');
    }
  }, [user, loading, currentPage, navigateTo]);

  // Payment Success Handling
  useEffect(() => {
    const url = new URL(window.location.href);
    const paramsToRemove = ['payment_success', 'client_reference_id', 'customer_email', 'error', 'error_description'];
    
    // Check search params (standard web) or hash (some auth flows)
    const isPaymentSuccess = url.searchParams.get('payment_success') === 'true';

    if (isPaymentSuccess) {
        refreshProfile(); 
        pollForPaidStatus();
        
        // Clean up URL
        paramsToRemove.forEach(param => url.searchParams.delete(param));
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
        
        navigateTo('/reader');
    }
  }, [refreshProfile, pollForPaidStatus, navigateTo]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FCFDFF]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Verifying Session</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'reader') {
    if (!user) return null;
    return <ReaderPage onNavigateHome={() => navigateTo('/')} />;
  }
  
  if (currentPage === 'terms') {
    return <TermsPage onNavigateHome={() => navigateTo('/')} />;
  }

  if (currentPage === 'privacy') {
    return <PrivacyPage onNavigateHome={() => navigateTo('/')} />;
  }

  if (currentPage === 'contact') {
    return <ContactPage onNavigateHome={() => navigateTo('/')} />;
  }

  return <LandingPage 
    onStartReading={() => navigateTo('/reader')} 
    onNavigateToTerms={() => navigateTo('/terms')}
    onNavigateToPrivacy={() => navigateTo('/privacy')}
    onNavigateToContact={() => navigateTo('/contact')}
  />;
};

export default App;
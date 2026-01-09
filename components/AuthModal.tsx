import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PagerloLogoIcon } from './icons/PagerloLogoIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLoginView) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.session) {
          onClose();
        } else {
          setMessage('Check your email for the confirmation link!');
        }
      }
    } catch (err: any) {
      setError(err.error_description || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            // Redirect specifically to the clean reader view after login
            redirectTo: `${window.location.origin}/reader`,
          },
        });
        if (error) throw error;
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="rounded-2xl shadow-2xl p-8 max-w-sm w-full bg-white text-gray-800 animate-fade-in-up"
        style={{ animationDuration: '0.3s' }}
        onClick={(e) => e.stopPropagation()}
      >
        <PagerloLogoIcon className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-center">{isLoginView ? 'Welcome Back' : 'Create an Account'}</h2>
        <p className="text-gray-600 mb-6 text-center text-sm">
          {isLoginView ? "Sign in to access your bookshelf." : "Start your free 3-day trial."}
        </p>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{message}</p>}

        <form onSubmit={handleAuthAction}>
          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 font-semibold text-white bg-brand-primary rounded-md shadow-sm hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <GoogleIcon className="w-5 h-5" />
          <span className="text-sm font-semibold text-gray-700">Google</span>
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => { setIsLoginView(!isLoginView); setError(null); setMessage(null); }} 
            className="font-semibold text-brand-primary hover:underline focus:outline-none"
          >
            {isLoginView ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;

import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';
import ThemeSwitcher from './ThemeSwitcher';
import FileUpload from './FileUpload';
import { PagerloLogoIcon } from './icons/PagerloLogoIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import { UserIcon } from './icons/UserIcon';
import { LogOutIcon } from './icons/LogOutIcon';

const CHECKOUT_URL = 'https://buy.polar.sh/polar_cl_8j5qPiSFVkYO7ikMfp8XxGsYKdpycsTnjoeju0ESVGb';

interface HeaderProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  isPdfLoaded: boolean;
  controlsVisible: boolean;
  onToggleControls: () => void;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentTheme, onThemeChange, onFileSelect, onClear, onDownload, isDownloading, 
  isPdfLoaded, controlsVisible, onToggleControls, onNavigateHome
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, signOut, status, daysRemaining, loading: authLoading } = useAuth();

  const getSuccessUrl = () => {
    const cleanUrl = new URL(window.location.origin + window.location.pathname);
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

  const isDark = currentTheme !== Theme.White;
  const headerBgClass = isDark ? 'bg-slate-900/80' : 'bg-white/80';
  const headerBorderClass = isDark ? 'border-slate-800' : 'border-slate-100';
  const controlHoverClass = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const controlTextClass = isDark ? 'text-slate-300' : 'text-slate-600';
  const menuBgClass = isDark ? 'bg-slate-800' : 'bg-white';
  
  const actionButtonClass = `p-2.5 rounded-xl ${controlHoverClass} ${controlTextClass} transition-all duration-200`;
  const mobileMenuItemClass = `w-full text-left px-4 py-3 text-sm flex items-center gap-3 ${controlHoverClass} ${controlTextClass}`;
  const skeletonBgClass = isDark ? 'bg-slate-800' : 'bg-slate-100';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    setIsMoreMenuOpen(false);
    await signOut();
    onNavigateHome(); // Redirect to landing page
  };

  return (
    <>
      <header className={`flex-shrink-0 backdrop-blur-xl border-b ${headerBorderClass} z-20 h-16 flex items-center ${headerBgClass} transition-colors duration-500`}>
        <div className="w-full px-4 lg:px-12">
          <div className="flex justify-between items-center">
            <button onClick={onNavigateHome} className="flex items-center gap-3 focus:outline-none rounded-xl p-1.5 transition-all duration-200 hover:bg-slate-500/5 group">
              <PagerloLogoIcon className="h-7 w-7 transition-transform group-hover:scale-105" />
              <h1 className="text-xl font-[1000] tracking-tighter leading-none hidden sm:block">
                Pagerlo
              </h1>
            </button>

            {status === 'TRIALING' && user && (
                <div className="hidden xl:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className={`flex items-center gap-3 border rounded-full px-4 py-1.5 text-xs font-bold ${isDark ? 'bg-slate-800/50 border-slate-700 text-indigo-400' : 'bg-indigo-50/50 border-indigo-100 text-indigo-600'}`}>
                        <span>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left in trial</span>
                        <div className="w-px h-3 bg-indigo-200/50"></div>
                        <a href={finalCheckoutUrl} className="hover:underline">Upgrade</a>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3">
              <ThemeSwitcher currentTheme={currentTheme} onThemeChange={onThemeChange} />
              
              {authLoading ? (
                <div className="flex items-center gap-2 animate-pulse">
                  <div className={`h-10 w-24 ${skeletonBgClass} rounded-xl`}></div>
                  <div className={`hidden md:block h-10 w-10 ${skeletonBgClass} rounded-full`}></div>
                </div>
              ) : user ? (
                <>
                  <div className="flex items-center gap-2">
                    <FileUpload 
                      onFileSelect={onFileSelect} 
                      disabled={status === 'TRIAL_ENDED'} 
                    />
                    
                    {isPdfLoaded && (
                      <div className="hidden md:flex items-center gap-1.5">
                        <button onClick={onToggleControls} title={controlsVisible ? 'Hide Overlays' : 'Show Overlays'} className={actionButtonClass}>
                          {controlsVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={onDownload} disabled={isDownloading} title="Download" className={`${actionButtonClass} disabled:opacity-50`}>
                          {isDownloading ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          ) : ( <DownloadIcon className="w-5 h-5" /> )}
                        </button>
                        <button onClick={onClear} title="Clear" className={actionButtonClass}>
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Desktop User Menu Dropdown */}
                  <div className="hidden md:block relative" ref={userMenuRef}>
                      <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                        className={`${actionButtonClass} flex items-center justify-center`}
                        title="Profile"
                      >
                        <UserIcon className="w-5 h-5" />
                      </button>
                      
                      {isUserMenuOpen && (
                        <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl border ${headerBorderClass} ${menuBgClass} py-2 origin-top-right animate-card-fade-in z-50`}>
                          <div className="px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">User Account</p>
                            <p className="font-bold truncate text-sm">{user.email}</p>
                          </div>
                          <div className={`h-px ${isDark ? 'bg-slate-700' : 'bg-slate-100'} my-2 mx-4`}></div>
                          <button onClick={handleSignOut} className={`${mobileMenuItemClass} text-red-500 font-bold`}>
                            <LogOutIcon className="w-5 h-5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      )}
                  </div>

                  {/* Mobile Actions/More Menu */}
                  <div className="md:hidden relative" ref={moreMenuRef}>
                    <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className={actionButtonClass}>
                      <MoreVerticalIcon className="w-5 h-5" />
                    </button>
                    {isMoreMenuOpen && (
                      <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl border ${headerBorderClass} ${menuBgClass} py-2 origin-top-right animate-card-fade-in z-50`}>
                        {isPdfLoaded && (
                          <>
                            <button onClick={() => { onToggleControls(); setIsMoreMenuOpen(false); }} className={mobileMenuItemClass}>
                              {controlsVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                              <span>{controlsVisible ? 'Hide Overlays' : 'Show Overlays'}</span>
                            </button>
                            <button onClick={() => { onDownload(); setIsMoreMenuOpen(false); }} disabled={isDownloading} className={mobileMenuItemClass}>
                              <DownloadIcon className="w-5 h-5" /><span>Download PDF</span>
                            </button>
                            <button onClick={() => { onClear(); setIsMoreMenuOpen(false); }} className={mobileMenuItemClass}>
                              <TrashIcon className="w-5 h-5" /><span>Clear Session</span>
                            </button>
                            <div className={`h-px ${isDark ? 'bg-slate-700' : 'bg-slate-100'} my-2 mx-4`}></div>
                          </>
                        )}
                        <div className="px-4 py-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Account</p>
                           <p className="text-xs font-bold truncate opacity-60">{user.email}</p>
                        </div>
                        <button onClick={handleSignOut} className={`${mobileMenuItemClass} text-red-500 font-bold`}>
                          <LogOutIcon className="w-5 h-5" /><span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-100 transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;

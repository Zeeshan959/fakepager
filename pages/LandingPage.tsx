
import React, { useState, useEffect } from 'react';
import { PagerloLogoIcon } from '../components/icons/PagerloLogoIcon';
import { ArrowRightIcon } from '../components/icons/ArrowRightIcon';
import { ThemeIcon } from '../components/icons/ThemeIcon';
import { HighlightIcon } from '../components/icons/HighlightIcon';
import { SyncIcon } from '../components/icons/SyncIcon';
import { UploadCloudIcon } from '../components/icons/UploadCloudIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { LockIcon } from '../components/icons/LockIcon';
import { DesktopIcon } from '../components/icons/DesktopIcon';
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/AuthModal';

interface LandingPageProps {
  onStartReading: () => void;
  onNavigateToTerms: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToContact: () => void;
}

const FeatureCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  delay: string;
  illustration: React.ReactNode;
}> = ({ icon, title, description, delay, illustration }) => (
    <div 
        className="group relative flex flex-col items-start p-10 bg-white rounded-[3.5rem] border border-gray-100 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_100px_-15px_rgba(79,70,229,0.1)] transition-all duration-700 hover:-translate-y-2 animate-card-fade-in opacity-0"
        style={{ animationDelay: delay }}
    >
        {/* Modern Icon Frame */}
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] mb-10 transition-all duration-500 group-hover:bg-[#4F46E5] group-hover:text-white group-hover:scale-110 shadow-sm">
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
        </div>

        {/* Text Area */}
        <div className="mb-14">
            <h3 className="text-[26px] font-[900] text-[#0F172A] mb-3 tracking-tighter leading-tight">{title}</h3>
            <p className="text-[#64748B] text-[16px] leading-relaxed font-medium">
                {description}
            </p>
        </div>

        {/* Dynamic Art Plate */}
        <div className="mt-auto w-full flex items-center justify-center h-24">
            {illustration}
        </div>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStartReading, onNavigateToTerms, onNavigateToPrivacy, onNavigateToContact }) => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [osType, setOsType] = useState<'win' | 'mac' | 'linux'>('win');
  const [downloadFileName, setDownloadFileName] = useState('Pagerlo-Setup.exe');

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('mac') !== -1) {
        setOsType('mac');
        setDownloadFileName('Pagerlo.dmg');
    }
    else if (userAgent.indexOf('linux') !== -1) {
        setOsType('linux');
        setDownloadFileName('Pagerlo.AppImage');
    }
    else {
        setOsType('win');
        setDownloadFileName('Pagerlo-Setup.exe');
    }
  }, []);

  const handleStartReadingClick = () => {
    if (user) {
      onStartReading();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FCFDFF] text-gray-900 flex flex-col overflow-x-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: `linear-gradient(#4F46E5 1.5px, transparent 1.5px), linear-gradient(90deg, #4F46E5 1.5px, transparent 1.5px)`, 
            backgroundSize: '60px 60px' 
          }}
        ></div>
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-indigo-100/30 rounded-full blur-[140px]"></div>
      </div>

      {/* Persistent Nav */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <PagerloLogoIcon className="h-9 w-9" />
          <span className="text-2xl font-black tracking-tighter text-gray-900">Pagerlo</span>
        </div>
        
        <div className="flex items-center gap-4">
            <a 
                href={`/${downloadFileName}`}
                download
                className="hidden md:flex items-center gap-2 px-5 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-indigo-600 transition-all uppercase tracking-widest shadow-sm cursor-pointer no-underline"
            >
                <DesktopIcon className="w-4 h-4" />
                <span>Download {osType === 'mac' ? 'for Mac' : 'App'}</span>
            </a>
            <button 
                onClick={handleStartReadingClick}
                className="px-8 py-3.5 text-sm font-bold text-white bg-gray-900 rounded-full hover:bg-black shadow-xl shadow-gray-200 transition-all active:scale-95 tracking-widest uppercase"
            >
                {user ? 'Dashboard' : 'Start Reading'}
            </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pt-16 pb-12 lg:pt-24 lg:pb-16 w-full max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-5 py-2 mb-10 text-[11px] font-bold uppercase tracking-[0.25em] text-indigo-600 bg-white border border-gray-100 shadow-sm rounded-full animate-fade-in-up opacity-0">
            <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></div>
            Private Desktop Environment
        </div>

        <h1 
            className="text-6xl sm:text-7xl lg:text-9xl font-[900] tracking-tighter text-gray-900 mb-8 animate-fade-in-up opacity-0 leading-[0.95]"
            style={{ animationDelay: '0.1s' }}
        >
          Focus on <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">Every Word</span>
        </h1>

        <p 
            className="max-w-xl mx-auto text-lg sm:text-xl text-gray-500 font-medium mb-12 animate-fade-in-up opacity-0 leading-relaxed"
            style={{ animationDelay: '0.2s' }}
        >
          Download the native desktop app for Windows and Mac. Your PDFs, your privacy, your focus.
        </p>

        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s' }}>
          <button 
              onClick={handleStartReadingClick}
              className="group flex items-center justify-center gap-6 px-14 py-6 text-lg font-bold text-white bg-[#5D57F5] rounded-full shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.4)] transition-all duration-300 hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
          >
            <span>Launch Web App</span>
            <ArrowRightIcon className="w-6 h-6 transition-transform group-hover:translate-x-2" />
          </button>
          
          <div className="mt-6">
             <a 
                href={`/${downloadFileName}`}
                download
                className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest cursor-pointer"
             >
                Download {osType === 'mac' ? 'Mac' : 'Windows'} Installer
             </a>
          </div>
        </div>
      </main>

      {/* One-Line Headline Section */}
      <div className="relative w-full py-12 mb-20 flex justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-indigo-50/30 -z-10"></div>
        <div className="h-px w-1/4 bg-gradient-to-r from-transparent via-gray-200 to-transparent absolute top-0"></div>
        <div className="h-px w-1/4 bg-gradient-to-r from-transparent via-gray-200 to-transparent absolute bottom-0"></div>
        <h2 className="text-[12px] sm:text-[14px] font-bold uppercase tracking-widest-extreme text-gray-400 animate-fade-in-up text-center px-6">
            The Professional Standard for Private Desktop Reading.
        </h2>
      </div>

      {/* Lifetime Offer Section */}
      <section className="relative z-10 w-full py-40 lg:py-60 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-slate-50/50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-24 lg:gap-32 xl:gap-48">
            
            {/* Visual Column */}
            <div className="flex-1 relative w-full max-w-[580px]">
              <div className="relative group">
                <div className="absolute -top-10 -left-10 w-full h-full bg-slate-100 rounded-[4rem] -rotate-3 transition-transform duration-700 group-hover:rotate-0"></div>
                
                <div className="relative z-10 bg-white rounded-[4rem] p-12 lg:p-16 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.08)] border border-gray-100 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-2 border border-emerald-100">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Secured</span>
                        </div>
                    </div>

                    <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white shadow-2xl mb-16 transition-transform group-hover:scale-110 duration-500">
                        <LockIcon className="w-8 h-8" />
                    </div>

                    <div className="space-y-4 mb-24 opacity-20">
                        <div className="h-3.5 w-full bg-slate-200 rounded-full"></div>
                        <div className="h-3.5 w-4/5 bg-slate-200 rounded-full"></div>
                        <div className="h-3.5 w-2/3 bg-slate-200 rounded-full"></div>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-3">License Key</p>
                            <p className="text-4xl font-[900] tracking-tighter text-[#0F172A]">LIFETIME ACCESS.</p>
                        </div>
                    </div>
                </div>

                {/* Floating "One Time" Toast */}
                <div className="absolute -bottom-16 -right-4 lg:-right-20 bg-[#0F172A] text-white p-10 lg:p-14 rounded-[3.5rem] shadow-2xl animate-float max-w-[240px] text-center z-30 ring-8 ring-white/10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-500 mb-4">Payment</p>
                    <p className="text-7xl font-[900] tracking-tighter leading-none mb-3">PAID.</p>
                    <p className="text-[12px] font-bold text-indigo-400 uppercase tracking-widest">No Monthly Fees</p>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 flex flex-col items-start pt-12 lg:pt-0">
              <div className="inline-flex items-center px-4 py-2 mb-10 text-[10px] font-bold uppercase tracking-[0.35em] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full">
                Reader Ownership
              </div>
              
              <h2 className="text-6xl lg:text-7xl xl:text-8xl font-[900] leading-[1.1] text-gray-900 mb-10 tracking-tighter">
                Reading is <br />
                Forever. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-900">Your Tools Should Be Too.</span>
              </h2>

              <p className="text-xl text-slate-500 font-medium mb-16 max-w-[480px] leading-relaxed">
                Skip the subscription noise. One payment grants you a professional focused workspace that lives in your browser forever.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-10 mb-16 w-full">
                {[
                  { icon: <EyeIcon />, title: "3 View Modes", desc: "Native Black, Dim, and White themes." },
                  { icon: <SyncIcon />, title: "Instant Sync", desc: "Local state persists on your device." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group cursor-default">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-[#0F172A] group-hover:text-white transition-all duration-300">
                        {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F172A] text-xl leading-tight mb-1 tracking-tight">{item.title}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleStartReadingClick}
                className="group w-full sm:w-auto flex items-center justify-between gap-16 px-12 py-7 bg-[#0F172A] text-white rounded-3xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-black transition-all duration-500 shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 active:scale-95"
              >
                <span>{user ? 'Open Dashboard' : 'Secure Lifetime Access'}</span>
                <ArrowRightIcon className="w-7 h-7 transition-transform group-hover:translate-x-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE EXPERIENCE SECTION */}
      <section className="relative z-10 w-full py-48 bg-[#F8FAFF] border-t border-slate-100">
        <div className="max-w-[1280px] mx-auto px-8">
            <div className="mb-32 flex flex-col items-center text-center">
                <div className="w-px h-24 bg-gradient-to-b from-transparent via-indigo-600 to-transparent mb-12"></div>
                <h2 className="text-6xl sm:text-7xl lg:text-9xl font-[900] text-[#0F172A] mb-8 tracking-tighter leading-[0.95]">Reading, refined.</h2>
                <p className="text-[#64748B] font-semibold text-xl leading-relaxed max-w-[520px]">
                    A minimalist engine designed to get out of your way and let your content breathe.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                <FeatureCard 
                    icon={<UploadCloudIcon />} 
                    title="Simple Upload"
                    description="Instantly drop your PDF files into your browser. No registration required for local use."
                    delay="0.1s"
                    illustration={
                        <div className="w-full flex flex-col items-center opacity-40">
                            <div className="w-20 h-14 rounded-2xl border-2 border-dashed border-indigo-400 flex items-center justify-center">
                                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    }
                />
                <FeatureCard 
                    icon={<ThemeIcon />} 
                    title="Adaptable UI"
                    description="Toggle between high-contrast White, soft Dim, and immersive Black modes."
                    delay="0.2s"
                    illustration={
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-12 bg-[#0F172A] rounded-xl shadow-lg"></div>
                            <div className="w-10 h-16 bg-white border border-slate-100 rounded-xl shadow-md scale-110 z-10"></div>
                            <div className="w-8 h-12 bg-slate-200 rounded-xl shadow-sm"></div>
                        </div>
                    }
                />
                <FeatureCard 
                    icon={<HighlightIcon />} 
                    title="Smart Ink"
                    description="Keep your insights with color-coded highlighting that saves to your local profile."
                    delay="0.3s"
                    illustration={
                        <div className="flex flex-col gap-3 w-full px-6">
                            <div className="h-2 w-full bg-[#FEF08A]/60 rounded-full"></div>
                            <div className="h-2 w-3/4 bg-[#C7D2FE]/60 rounded-full"></div>
                            <div className="h-2 w-1/2 bg-[#FBCFE8]/60 rounded-full"></div>
                        </div>
                    }
                />
                <FeatureCard 
                    icon={<SyncIcon />} 
                    title="Deep Memory"
                    description="We remember your exact page, zoom level, and highlights automatically."
                    delay="0.4s"
                    illustration={
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-2 border-indigo-100 flex items-center justify-center">
                                <SyncIcon className="w-6 h-6 text-indigo-300 animate-spin" style={{ animationDuration: '6s' }} />
                            </div>
                        </div>
                    }
                />
            </div>

            {/* Focus mastery notice */}
            <div className="flex justify-center animate-card-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>
                <div className="group flex flex-col md:flex-row items-center gap-10 p-12 lg:p-16 bg-[#0F172A] rounded-[4rem] w-full max-w-5xl border border-gray-800 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                         <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }}></div>
                    </div>
                    
                    <div className="flex gap-4 relative z-10">
                        <div className="flex items-center justify-center px-6 py-4 bg-gray-800 text-white rounded-2xl font-black text-sm shadow-xl border border-gray-700 tracking-widest">CTRL</div>
                        <div className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl border border-indigo-500 tracking-widest">H</div>
                    </div>

                    <div className="flex-1 text-center md:text-left relative z-10">
                        <h4 className="text-white font-black text-2xl mb-2 tracking-tight">Master Focus Mode</h4>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed">Instantly hide the entire interface for the ultimate distraction-free reading session. Tap the keys again to bring back your tools.</p>
                    </div>
                </div>
            </div>
            
            {/* Minimal Footer */}
            <footer className="mt-60 pt-20 border-t border-slate-100">
                <div className="flex flex-col md:flex-row items-start justify-between w-full gap-16 mb-24">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <PagerloLogoIcon className="h-10 w-10" />
                            <span className="text-2xl font-black tracking-tighter">Pagerlo</span>
                        </div>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.4em]">The Future of Focused Reading.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-20 gap-y-10">
                        <div className="flex flex-col gap-5">
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Legal</span>
                            <button onClick={onNavigateToPrivacy} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors text-left">Privacy</button>
                            <button onClick={onNavigateToTerms} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors text-left">Terms</button>
                        </div>
                        <div className="flex flex-col gap-5">
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Connect</span>
                            <button onClick={onNavigateToContact} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors text-left">Support</button>
                            <a href="https://x.com/pagerlo" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">X / Twitter</a>
                        </div>
                        <div className="flex flex-col gap-5 col-span-2 sm:col-span-1">
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">Get Pagerlo</span>
                             <a 
                                href={`/${downloadFileName}`}
                                download
                                className="px-4 py-2.5 bg-gray-900 text-white rounded-2xl flex items-center gap-3 border border-gray-800 hover:bg-black transition-all shadow-lg w-fit cursor-pointer no-underline"
                              >
                                <DesktopIcon className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Download</span>
                              </a>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pb-12">
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">&copy; {new Date().getFullYear()} Pagerlo.</p>
                    <div className="flex items-center gap-4 text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">
                        <span>Crafted for deep work</span>
                        <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                        <span>Desktop Optimized</span>
                    </div>
                </div>
            </footer>
        </div>
      </section>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes card-fade-in {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-fade-in-up { animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-card-fade-in { animation: card-fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LandingPage;

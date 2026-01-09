
import React from 'react';
import { Theme } from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ThemeButton: React.FC<{
  label: string;
  theme: Theme;
  currentTheme: Theme;
  onClick: (theme: Theme) => void;
  children: React.ReactNode;
}> = ({ label, theme, currentTheme, onClick, children }) => {
  const isActive = currentTheme === theme;
  const isDark = currentTheme !== Theme.White;
  
  const baseClasses = "p-2 rounded-xl focus:outline-none transition-all duration-300 flex items-center justify-center";
  
  const activeClass = isActive 
    ? (theme === Theme.White ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20')
    : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600');

  return (
    <button
      aria-label={`Switch to ${label} mode`}
      title={`${label} Mode`}
      className={`${baseClasses} ${activeClass}`}
      onClick={() => onClick(theme)}
    >
      {children}
    </button>
  );
};

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  const isDark = currentTheme !== Theme.White;
  return (
    <div className={`flex items-center gap-1 p-1 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
      <ThemeButton label="White" theme={Theme.White} currentTheme={currentTheme} onClick={onThemeChange}>
        <SunIcon className="w-4 h-4" />
      </ThemeButton>
      <ThemeButton label="Dim" theme={Theme.Dim} currentTheme={currentTheme} onClick={onThemeChange}>
        <MoonIcon className="w-4 h-4" />
      </ThemeButton>
       <ThemeButton label="Black" theme={Theme.Black} currentTheme={currentTheme} onClick={onThemeChange}>
         <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/20"></div>
      </ThemeButton>
    </div>
  );
};

export default ThemeSwitcher;

import React from 'react';
import { DesktopIcon } from './icons/DesktopIcon';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="rounded-3xl shadow-2xl p-8 max-w-md w-full bg-white text-gray-800 animate-fade-in-up relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-indigo-50 p-4 rounded-2xl mb-4">
            <DesktopIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Install Pagerlo</h2>
          <p className="text-gray-500 font-medium mt-2">Get the best reading experience by installing the app on your device.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs">1</span>
              Chrome / Edge (Desktop)
            </h3>
            <p className="text-sm text-gray-600 pl-7">
              Click the <span className="font-bold">Install icon</span> in the right side of your browser's address bar.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
               <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs">2</span>
               Safari (iOS / Mac)
            </h3>
            <p className="text-sm text-gray-600 pl-7">
              Tap the <span className="font-bold">Share</span> button and select <span className="font-bold">"Add to Home Screen"</span>.
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-8 w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default InstallModal;
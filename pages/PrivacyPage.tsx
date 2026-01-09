import React from 'react';
import { PagerloLogoIcon } from '../components/icons/PagerloLogoIcon';

interface PrivacyPageProps {
  onNavigateHome: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen w-full bg-brand-bg text-brand-text flex flex-col">
      <header className="sticky top-0 z-20 p-4 sm:p-6 lg:px-12 bg-brand-bg/80 backdrop-blur-md border-b border-gray-200/80">
        <nav className="flex justify-between items-center">
          <button onClick={onNavigateHome} className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg -ml-2 p-2 transition-colors duration-200 hover:bg-gray-500/10">
            <PagerloLogoIcon className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">Pagerlo</span>
          </button>
        </nav>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="prose prose-indigo lg:prose-lg text-brand-text/90">
          <h1>Privacy Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>We value your privacy. This Privacy Policy informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
          
          <h3>Information Collection and Use</h3>
          <p>Pagerlo is designed to be a privacy-focused application. We use your browser's local IndexedDB storage to save your PDF files and associated data (like highlights and current page number). This data is stored entirely on your device and is not transmitted to our servers or any third party. We do not collect any personally identifiable information from you.</p>
          
          <h3>Local Storage (IndexedDB)</h3>
          <p>The PDF files you upload are stored directly in your web browser's IndexedDB. This database is sandboxed, meaning other websites cannot access this data. The data persists on your device until you manually clear it, either through the "Clear Book" functionality within the app or by clearing your browser's site data.</p>
          
          <h3>Changes to This Privacy Policy</h3>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
        </div>
      </main>
      <style>{`
        .prose h1 { color: #1F2937; }
        .prose h2 { color: #1F2937; }
        .prose h3 { color: #1F2937; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
        .prose a { color: #4F46E5; }
        .prose hr { border-color: #e5e7eb; }
      `}</style>
    </div>
  );
};
export default PrivacyPage;
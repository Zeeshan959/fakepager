import React from 'react';
import { PagerloLogoIcon } from '../components/icons/PagerloLogoIcon';

interface TermsPageProps {
  onNavigateHome: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onNavigateHome }) => {
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
          <h1>Terms of Service</h1>
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Pagerlo PDF Reader application (the "Service") operated by Pagerlo ("us", "we", or "our").</p>
          <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
          
          <h3>Content</h3>
          <p>Our Service allows you to upload, store, and view PDF documents ("User Content"). You are responsible for the User Content that you upload to the Service, including its legality, reliability, and appropriateness. We do not claim ownership of your content.</p>
          
          <h3>Disclaimer</h3>
          <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>
          
          <h3>Changes</h3>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
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
export default TermsPage;
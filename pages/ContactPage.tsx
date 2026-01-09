import React from 'react';
import { PagerloLogoIcon } from '../components/icons/PagerloLogoIcon';

interface ContactPageProps {
  onNavigateHome: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onNavigateHome }) => {
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
          <h1>Contact Us</h1>
          <p>We'd love to hear from you! Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.</p>
          
          <h3>Get in Touch</h3>
          <p>
            For support, feedback, or inquiries, please email us directly at:
          </p>
          <p className="text-xl font-semibold">
            <a href="mailto:pagerloapp@gmail.com" className="text-brand-primary hover:text-brand-primary-hover">pagerloapp@gmail.com</a>
          </p>
          
          <p>
            We aim to respond to all inquiries within 24-48 hours.
          </p>
        </div>
      </main>
      <style>{`
        .prose h1 { color: #1F2937; }
        .prose h3 { color: #1F2937; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
        .prose a { color: #4F46E5; }
      `}</style>
    </div>
  );
};
export default ContactPage;
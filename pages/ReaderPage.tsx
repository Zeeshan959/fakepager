
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Theme } from '../types';
import Header from '../components/Header';
import PdfViewer from '../components/PdfViewer';
import * as idb from '../lib/idb';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../hooks/useAuth';

const BOOK_KEY = 'current-book';
const THEME_KEY = 'pagerlo-theme';

interface ReaderPageProps {
  onNavigateHome: () => void;
}

const ReaderPage: React.FC<ReaderPageProps> = ({ onNavigateHome }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return (savedTheme as Theme) || Theme.White;
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [bookData, setBookData] = useState<any>(null);
  
  // Independent visibility states
  const [headerVisible, setHeaderVisible] = useState(true);
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadTrigger, setDownloadTrigger] = useState(0);
  const debounceRef = useRef<number | null>(null);
  const { status } = useAuth();

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const body = document.body;
    body.classList.add('transition-all', 'duration-500');
    
    // Reset classes
    body.classList.remove('bg-theme-white-bg', 'bg-theme-dim-bg', 'bg-theme-black-bg', 'bg-brand-bg');
    body.classList.remove('text-theme-white-text', 'text-theme-dim-text', 'text-theme-black-text', 'text-brand-text');

    switch (theme) {
      case Theme.Dim:
        body.classList.add('bg-theme-dim-bg', 'text-theme-dim-text');
        break;
      case Theme.Black:
        body.classList.add('bg-theme-black-bg', 'text-theme-black-text');
        break;
      case Theme.White:
      default:
        body.classList.add('bg-theme-white-bg', 'text-theme-white-text');
        break;
    }
  }, [theme]);

  // Keyboard shortcut for Toggling Navbar (Ctrl + H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setHeaderVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await idb.get(BOOK_KEY) as any;
        if (data && data.file) {
          const url = URL.createObjectURL(data.file);
          setPdfUrl(url);
          setBookData({
            highlights: data.highlights || {},
            pageNum: data.pageNum || 1,
            scale: data.scale || 1.5,
            filename: data.filename || 'book.pdf',
          });
        }
      } catch (error) {
        console.error("Failed to load book from IndexedDB", error);
      }
    };
    loadInitialData();
  }, []);
  
  const handleFileSelect = async (file: File) => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    const newUrl = URL.createObjectURL(file);
    setPdfUrl(newUrl);

    const newBookData = {
      highlights: {},
      pageNum: 1,
      scale: 1.5,
      filename: file.name,
    };
    setBookData(newBookData);
    
    try {
      await idb.set({ id: BOOK_KEY, file, ...newBookData });
    } catch (error) {
      console.error("Failed to save book to IndexedDB", error);
    }
  };

  const handleClear = async () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setBookData(null);
    try {
      await idb.del(BOOK_KEY);
    } catch (error) {
      console.error("Failed to delete book from IndexedDB", error);
    }
  };

  const handlePdfStateChange = useCallback((newState: { pageNum: number; scale: number; highlights: any }) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const currentBook = await idb.get(BOOK_KEY) as any;
        if (currentBook) {
          await idb.set({ ...currentBook, ...newState });
        }
      } catch (error) {
        console.error("Failed to update book state in IndexedDB", error);
      }
    }, 500);
  }, []);

  const handleToggleOverlays = () => setOverlaysVisible(v => !v);

  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadTrigger(Date.now());
  };

  const handleDownloadComplete = () => setIsDownloading(false);

  return (
    <div className={`flex flex-col h-screen font-sans overflow-hidden`}>
      {/* Header Wrapper: Toggled by Ctrl + H */}
      <div 
        className={`flex-shrink-0 transition-all duration-300 ease-in-out z-20 ${
          headerVisible ? 'h-16 opacity-100 overflow-visible' : 'h-0 opacity-0 pointer-events-none overflow-hidden'
        }`}
      >
        <Header 
          currentTheme={theme} 
          onThemeChange={setTheme} 
          onFileSelect={handleFileSelect}
          onClear={handleClear}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          isPdfLoaded={!!pdfUrl}
          controlsVisible={overlaysVisible} 
          onToggleControls={handleToggleOverlays}
          onNavigateHome={onNavigateHome}
        />
      </div>
      
      <main className="flex-grow flex items-center justify-center overflow-hidden relative z-0">
        <PdfViewer 
          pdfUrl={pdfUrl} 
          currentTheme={theme} 
          initialData={bookData}
          onStateChange={handlePdfStateChange}
          controlsVisible={overlaysVisible} 
          downloadTrigger={downloadTrigger}
          onDownloadComplete={handleDownloadComplete}
        />
      </main>
      
      {status === 'TRIAL_ENDED' && (
        <PaymentModal 
          theme={theme} 
          onNavigateHome={onNavigateHome} 
        />
      )}
    </div>
  );
};

export default ReaderPage;

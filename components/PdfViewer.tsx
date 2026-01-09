
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { PagerloLogoIcon } from './icons/PagerloLogoIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { CopyIcon } from './icons/CopyIcon';
import { Theme } from '../types';

declare const pdfjsLib: any;
declare const PDFLib: any;

interface PdfViewerProps {
  pdfUrl: string | null;
  currentTheme: Theme;
  initialData: {
    pageNum: number;
    scale: number;
    highlights: HighlightsCollection;
    filename?: string;
  } | null;
  onStateChange: (newState: { pageNum: number; scale: number; highlights: HighlightsCollection; }) => void;
  controlsVisible: boolean;
  downloadTrigger: number;
  onDownloadComplete: () => void;
}

const HIGHLIGHT_COLORS = {
  yellow: 'rgba(255, 255, 0, 0.4)',
  green: 'rgba(134, 239, 172, 0.5)',
  blue: 'rgba(147, 197, 253, 0.5)',
  pink: 'rgba(249, 168, 212, 0.5)',
  grey: 'rgba(156, 163, 175, 0.5)',
};

type Highlight = {
  id: string;
  rects: Array<{ top: number; left: number; width: number; height: number; }>;
  color: string;
};
type HighlightsCollection = { [key: number]: Array<Highlight> };

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl, currentTheme, initialData, onStateChange, controlsVisible, downloadTrigger, onDownloadComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snapshotRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageRendering, setPageRendering] = useState<boolean>(false);
  
  const [pageNum, setPageNum] = useState<number>(1);
  const [scale, setScale] = useState(1.5);
  const [highlights, setHighlights] = useState<HighlightsCollection>({});
  const [activeHighlightColor, setActiveHighlightColor] = useState(HIGHLIGHT_COLORS.yellow);
  const [hoverArea, setHoverArea] = useState<'left' | 'right' | null>(null);
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
  const [selectionToolbar, setSelectionToolbar] = useState<{ visible: boolean; top: number; left: number; }>({ visible: false, top: 0, left: 0 });

  const selectionRangeRef = useRef<Range | null>(null);
  const saveStateTimeoutRef = useRef<number | null>(null);
  const scaleRef = useRef(scale);
  const zoomDebounceTimeoutRef = useRef<number | null>(null);
  const renderTaskRef = useRef<any>(null);
  const lastRenderedPageNum = useRef<number>(1);

  const basePageSizeRef = useRef<{ width: number; height: number } | null>(null);
  const lastScrollPos = useRef({ left: 0, top: 0 });
  const zoomCenterRef = useRef({ x: 0, y: 0, active: false });
  const isZoomingRef = useRef(false);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    setPageNum(initialData?.pageNum ?? 1);
    const initialScale = initialData?.scale ?? 1.5;
    setScale(initialScale);
    scaleRef.current = initialScale;
    setHighlights(initialData?.highlights ?? {});
    lastRenderedPageNum.current = initialData?.pageNum ?? 1;
  }, [initialData]);

  useEffect(() => {
    if (!initialData) return;
    if (saveStateTimeoutRef.current) clearTimeout(saveStateTimeoutRef.current);
    
    saveStateTimeoutRef.current = window.setTimeout(() => {
        onStateChange({ pageNum, scale, highlights });
    }, 500);

    return () => {
        if (saveStateTimeoutRef.current) clearTimeout(saveStateTimeoutRef.current);
    };
  }, [pageNum, scale, highlights, onStateChange, initialData]);

  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl) {
        setPdfDoc(null);
        setTotalPages(0);
        basePageSizeRef.current = null;
        return;
      }
      setLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPdf();
  }, [pdfUrl]);

  const hideSnapshot = () => {
    if (snapshotRef.current) {
      snapshotRef.current.style.display = 'none';
      snapshotRef.current.width = 0;
      snapshotRef.current.height = 0;
    }
  };

  useEffect(() => {
    if (!pdfDoc) return;
    const renderPage = async () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
      const isPageTurn = lastRenderedPageNum.current !== pageNum;
      if (isPageTurn) {
        setPageRendering(true);
        hideSnapshot();
      }
      try {
        const page = await pdfDoc.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1.0 });
        basePageSizeRef.current = { width: baseViewport.width, height: baseViewport.height };

        const textLayer = textLayerRef.current;
        const canvas = canvasRef.current;
        if (!canvas || !textLayer) return;

        const viewport = page.getViewport({ scale });
        const MIN_CANVAS_WIDTH = 1800;
        const baseDpr = window.devicePixelRatio || 1;
        const dynamicDpr = viewport.width > 0 ? MIN_CANVAS_WIDTH / viewport.width : baseDpr;
        const dpr = Math.min(Math.max(baseDpr, dynamicDpr, 2), 4);
        
        const outputWidth = Math.floor(viewport.width * dpr);
        const outputHeight = Math.floor(viewport.height * dpr);

        if (viewerRef.current) {
          viewerRef.current.style.width = `${viewport.width}px`;
          viewerRef.current.style.height = `${viewport.height}px`;
        }

        canvas.width = outputWidth;
        canvas.height = outputHeight;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) return;

        if ('imageSmoothingQuality' in canvasContext) {
          canvasContext.imageSmoothingQuality = 'high';
        }
        const transform = [dpr, 0, 0, dpr, 0, 0];
        const renderContext = { canvasContext, viewport, transform };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
        lastRenderedPageNum.current = pageNum;

        textLayer.innerHTML = '';
        textLayer.style.width = `${viewport.width}px`;
        textLayer.style.height = `${viewport.height}px`;
        const textContent = await page.getTextContent();
        pdfjsLib.renderTextLayer({ textContent, container: textLayer, viewport, textDivs: [] });
        hideSnapshot();
      } catch (error: any) {
        if (error.name !== 'RenderingCancelledException') {
            console.error('Error rendering PDF page:', error);
        }
      } finally {
        setPageRendering(false);
      }
    };
    renderPage();
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNum, scale]);

  const performZoom = (targetScale: number, center: { x: number, y: number }) => {
    const canvas = canvasRef.current;
    const snapshot = snapshotRef.current;
    if (canvas && snapshot && canvas.width > 0) {
        snapshot.width = canvas.width;
        snapshot.height = canvas.height;
        const ctx = snapshot.getContext('2d');
        if (ctx) {
            ctx.drawImage(canvas, 0, 0);
            snapshot.style.display = 'block';
        }
    }

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
        const currentScrollLeft = scrollContainer.scrollLeft;
        const currentScrollTop = scrollContainer.scrollTop;
        const ratio = targetScale / scaleRef.current;
        const newScrollLeft = (currentScrollLeft + center.x) * ratio - center.x;
        const newScrollTop = (currentScrollTop + center.y) * ratio - center.y;
        lastScrollPos.current = { left: newScrollLeft, top: newScrollTop };
        zoomCenterRef.current = { ...center, active: true };
    }
    setScale(targetScale);
    isZoomingRef.current = false;
  };

  useEffect(() => {
    const viewerElement = viewerRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!pdfDoc || !viewerElement || !scrollContainer) return;

    const handleWheel = (event: WheelEvent) => {
        if (!event.ctrlKey) return;
        event.preventDefault();

        isZoomingRef.current = true;
        if (zoomDebounceTimeoutRef.current) clearTimeout(zoomDebounceTimeoutRef.current);

        // Get coordinates relative to the scroll container (viewport)
        const scrollRect = scrollContainer.getBoundingClientRect();
        const mouseX = event.clientX - scrollRect.left;
        const mouseY = event.clientY - scrollRect.top;

        // Origin in PDF coordinates
        const viewerRect = viewerElement.getBoundingClientRect();
        const originX = ((event.clientX - viewerRect.left) / viewerRect.width) * 100;
        const originY = ((event.clientY - viewerRect.top) / viewerRect.height) * 100;

        const zoomFactor = -0.003; 
        const delta = Math.exp(event.deltaY * zoomFactor);
        const newScaleVal = scaleRef.current * delta;
        const clampedScale = Math.max(0.5, Math.min(newScaleVal, 5.0));
        
        const currentRenderScale = scale; 
        const cssScale = clampedScale / currentRenderScale;

        // Apply visual transform immediately without moving the origin mid-gesture
        viewerElement.style.transformOrigin = `${originX}% ${originY}%`;
        viewerElement.style.transform = `scale(${cssScale})`;
        viewerElement.style.willChange = 'transform';

        scaleRef.current = clampedScale;

        zoomDebounceTimeoutRef.current = window.setTimeout(() => {
             performZoom(clampedScale, { x: mouseX, y: mouseY });
        }, 100);
    };

    let initialPinchDistance = 0;
    let initialScale = 1;

    const getDistance = (touches: TouchList) => {
      return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
      );
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        isZoomingRef.current = true;
        if (zoomDebounceTimeoutRef.current) {
            clearTimeout(zoomDebounceTimeoutRef.current);
            zoomDebounceTimeoutRef.current = null;
        }
        initialPinchDistance = getDistance(event.touches);
        initialScale = scaleRef.current;
        
        const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
        const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
        const rect = viewerElement.getBoundingClientRect();
        const originX = ((midX - rect.left) / rect.width) * 100;
        const originY = ((midY - rect.top) / rect.height) * 100;
        viewerElement.style.transformOrigin = `${originX}% ${originY}%`;
        viewerElement.style.willChange = 'transform';
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2 && initialPinchDistance > 0) {
        event.preventDefault();
        const newDist = getDistance(event.touches);
        const ratio = newDist / initialPinchDistance;
        const newScale = initialScale * ratio;
        const clamped = Math.max(0.5, Math.min(newScale, 5.0));
        scaleRef.current = clamped;
        const cssScale = clamped / scale;
        viewerElement.style.transform = `scale(${cssScale})`;
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
        if (event.touches.length < 2 && initialPinchDistance > 0) {
            initialPinchDistance = 0;
            zoomDebounceTimeoutRef.current = window.setTimeout(() => {
                const scrollRect = scrollContainer.getBoundingClientRect();
                performZoom(scaleRef.current, { x: scrollRect.width / 2, y: scrollRect.height / 2 });
            }, 80);
        }
    };

    viewerElement.addEventListener('wheel', handleWheel, { passive: false });
    viewerElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    viewerElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewerElement.addEventListener('touchend', handleTouchEnd);
    viewerElement.addEventListener('touchcancel', handleTouchEnd);
    
    return () => {
      viewerElement.removeEventListener('wheel', handleWheel);
      viewerElement.removeEventListener('touchstart', handleTouchStart);
      viewerElement.removeEventListener('touchmove', handleTouchMove);
      viewerElement.removeEventListener('touchend', handleTouchEnd);
      viewerElement.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [pdfDoc, scale]);

  useLayoutEffect(() => {
      const viewer = viewerRef.current;
      const canvas = canvasRef.current;
      const snapshot = snapshotRef.current;
      const container = scrollContainerRef.current;
      if (viewer && container && canvas && zoomCenterRef.current.active) {
          viewer.style.transform = 'none';
          viewer.style.transformOrigin = '0 0';
          viewer.style.willChange = 'auto';
          if (basePageSizeRef.current) {
              const newWidth = basePageSizeRef.current.width * scale;
              const newHeight = basePageSizeRef.current.height * scale;
              viewer.style.width = `${newWidth}px`;
              viewer.style.height = `${newHeight}px`;
              canvas.style.width = `${newWidth}px`;
              canvas.style.height = `${newWidth}px`;
              if (snapshot) {
                  snapshot.style.width = `${newWidth}px`;
                  snapshot.style.height = `${newHeight}px`;
              }
          }
          container.scrollLeft = lastScrollPos.current.left;
          container.scrollTop = lastScrollPos.current.top;
          zoomCenterRef.current.active = false;
      }
  }, [scale]);

  useEffect(() => {
    if (downloadTrigger > 0 && pdfUrl) {
      generatePdfWithHighlights();
    }
  }, [downloadTrigger]);

  const handleCopy = async () => {
    const textToCopy = selectionRangeRef.current?.toString() || window.getSelection()?.toString();
    if (textToCopy) {
      try { await navigator.clipboard.writeText(textToCopy); } catch (err) { console.error('Failed to copy text: ', err); }
    }
    setSelectionToolbar({ visible: false, top: 0, left: 0 });
    window.getSelection()?.removeAllRanges();
    selectionRangeRef.current = null;
  };
  
  const handleHighlight = (color: string) => {
    const range = selectionRangeRef.current;
    if (!range || !textLayerRef.current || !textLayerRef.current.contains(range.commonAncestorContainer)) return;
    const textLayerRect = textLayerRef.current.getBoundingClientRect();
    const currentScale = scaleRef.current;
    const rects = Array.from(range.getClientRects()).map((rect: DOMRect) => ({
      top: (rect.top - textLayerRect.top) / currentScale,
      left: (rect.left - textLayerRect.left) / currentScale,
      width: rect.width / currentScale,
      height: rect.height / currentScale,
    }));
    if (rects.length > 0) {
      const newHighlight: Highlight = { id: Date.now().toString(), rects, color };
      setHighlights(prev => ({ ...prev, [pageNum]: [...(prev[pageNum] || []), newHighlight], }));
    }
    setSelectionToolbar({ visible: false, top: 0, left: 0 });
    window.getSelection()?.removeAllRanges();
    selectionRangeRef.current = null;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-selection-toolbar]')) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
       if (selectionToolbar.visible) setSelectionToolbar(prev => ({ ...prev, visible: false }));
       return;
    }
    const range = selection.getRangeAt(0);
    if (textLayerRef.current && textLayerRef.current.contains(range.commonAncestorContainer)) {
        const rangeRect = range.getBoundingClientRect();
        const containerRect = e.currentTarget.getBoundingClientRect();
        const top = rangeRect.top - containerRect.top - 50; 
        const left = rangeRect.left - containerRect.left + (rangeRect.width / 2);
        setSelectionToolbar({ visible: true, top, left });
        selectionRangeRef.current = range.cloneRange();
    } else {
        if (selectionToolbar.visible) setSelectionToolbar(prev => ({ ...prev, visible: false }));
    }
  };

  const generatePdfWithHighlights = async () => {
    if (!pdfUrl || !pdfDoc) {
      onDownloadComplete();
      return;
    }
    try {
      const originalPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDocLib = await PDFLib.PDFDocument.load(originalPdfBytes);
      const pages = pdfDocLib.getPages();
      const parseRgba = (rgbaString: string) => {
        const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) return { rgb: PDFLib.rgb(0, 0, 0), opacity: 1 };
        const r = parseInt(match[1], 10) / 255;
        const g = parseInt(match[2], 10) / 255;
        const b = parseInt(match[3], 10) / 255;
        const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
        return { rgb: PDFLib.rgb(r, g, b), opacity: a };
      };
      for (const pageNumStr in highlights) {
        const pageNum = parseInt(pageNumStr, 10);
        const pageHighlights = highlights[pageNum];
        if (!pageHighlights || pageHighlights.length === 0) continue;
        const pageJs = await pdfDoc.getPage(pageNum);
        const viewport = pageJs.getViewport({ scale: 1 });
        const { height } = viewport;
        const pageLib = pages[pageNum - 1];
        pageHighlights.forEach(highlight => {
          const { rgb, opacity } = parseRgba(highlight.color);
          highlight.rects.forEach(rect => {
            pageLib.drawRectangle({
              x: rect.left, y: height - rect.top - rect.height, width: rect.width, height: rect.height,
              color: rgb, opacity: opacity, blendMode: PDFLib.BlendMode.Multiply,
            });
          });
        });
      }
      const pdfBytes = await pdfDocLib.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const originalFilename = initialData?.filename || 'book.pdf';
      const baseName = originalFilename.replace(/\.pdf$/i, '');
      link.download = `${baseName}-highlighted.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Failed to generate PDF with highlights:", error);
      alert("Sorry, an error occurred while generating the highlighted PDF.");
    } finally {
      onDownloadComplete();
    }
  };

  const handlePrevPage = () => { if (pageNum > 1) setPageNum(p => p - 1); };
  const handleNextPage = () => { if (pageNum < totalPages) setPageNum(p => p + 1); };
  const handleZoomIn = () => {
    const scrollContainer = scrollContainerRef.current;
    if(scrollContainer) {
        const rect = scrollContainer.getBoundingClientRect();
        performZoom(Math.min(scale + 0.25, 5.0), { x: rect.width/2, y: rect.height/2 });
    } else { setScale(s => Math.min(s + 0.25, 5.0)); }
  };
  const handleZoomOut = () => {
    const scrollContainer = scrollContainerRef.current;
    if(scrollContainer) {
        const rect = scrollContainer.getBoundingClientRect();
        performZoom(Math.max(scale - 0.25, 0.5), { x: rect.width/2, y: rect.height/2 });
    } else { setScale(s => Math.max(s - 0.25, 0.5)); }
  };
  const handleToggleToolsPanel = () => setIsToolsPanelOpen(v => !v);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewerRef.current) { if (hoverArea) setHoverArea(null); return; }
    if ((e.target as HTMLElement).closest('[data-is-control="true"]') || (e.target as HTMLElement).closest('[data-selection-toolbar]')) {
      if (hoverArea) setHoverArea(null); return;
    }
    const rect = viewerRef.current.getBoundingClientRect();
    const isOverPdf = e.clientX >= rect.left && e.clientX <= rect.right;
    if (!isOverPdf && e.clientX < rect.left) { if (hoverArea !== 'left') setHoverArea('left'); }
    else if (!isOverPdf && e.clientX > rect.right) { if (hoverArea !== 'right') setHoverArea('right'); }
    else { if (hoverArea) setHoverArea(null); }
  };

  const handleMouseLeave = () => setHoverArea(null);
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (hoverArea === 'left') handlePrevPage();
    else if (hoverArea === 'right') handleNextPage();
  };

  if (!pdfUrl) {
    return (
      <div className="text-center p-8"><PagerloLogoIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16" /><h2 className="mt-4 text-xl sm:text-2xl font-semibold ">Start Reading</h2><p className="mt-2 text-sm sm:text-base text-gray-500">Upload a PDF document to begin your reading session.</p></div>
    );
  }
  if (loading) {
    return (
      <div className="text-center p-8"><svg className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-4 text-base sm:text-lg">Loading your book...</p></div>
    );
  }

  const canvasInvertClass = currentTheme === Theme.Black || currentTheme === Theme.Dim ? 'invert' : '';
  const controlBgClass = currentTheme === Theme.White ? 'bg-white/80' : 'bg-gray-800/80';
  const controlBorderClass = currentTheme === Theme.White ? 'border-gray-300/50' : 'border-gray-500/20';
  const controlHoverClass = currentTheme === Theme.White ? 'hover:bg-gray-200' : 'hover:bg-gray-700';
  const highlightBlendMode = currentTheme === Theme.White ? 'multiply' : 'screen';

  return (
    <div ref={scrollContainerRef} className="h-full w-full overflow-auto relative">
      <div onClick={handleContainerClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onMouseUp={handleMouseUp} className={`grid place-items-center min-h-full p-2 sm:p-4 pb-28 md:pb-24 relative ${hoverArea ? 'cursor-pointer' : ''}`}>
        {selectionToolbar.visible && (
          <div data-selection-toolbar className={`absolute z-30 flex items-center gap-1 p-1.5 rounded-full border shadow-lg backdrop-blur-md animate-fade-in-up-sm ${controlBgClass} ${controlBorderClass}`} style={{ top: `${selectionToolbar.top}px`, left: `${selectionToolbar.left}px`, transform: 'translateX(-50%)', }}>
            <button onClick={handleCopy} className={`p-2 rounded-full ${controlHoverClass} transition-colors`} title="Copy Text"><CopyIcon className="w-5 h-5" /></button>
            <div className="w-px h-5 bg-gray-500/30 mx-1"></div>
            <div className="flex items-center gap-1.5">
              {Object.entries(HIGHLIGHT_COLORS).map(([name, color]) => (
                <button key={name} onClick={() => handleHighlight(color)} className={`w-7 h-7 rounded-full border-2 border-transparent hover:scale-110 transition-transform`} style={{ backgroundColor: color }} title={`Highlight ${name}`} />
              ))}
            </div>
          </div>
        )}
        <div ref={viewerRef} className="relative shadow-lg border border-gray-500/20 z-10" style={{ touchAction: 'none', transformOrigin: '0 0' }}>
          <canvas ref={snapshotRef} className={canvasInvertClass} style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, }} />
          <canvas ref={canvasRef} className={canvasInvertClass} />
          <div className="absolute top-0 left-0 pointer-events-none w-full h-full" style={{ mixBlendMode: highlightBlendMode as any }}>
            {Object.entries((highlights[pageNum] || []).reduce((acc, h) => { (acc[h.color] = acc[h.color] || []).push(h); return acc; }, {} as any)).map(([color, highlightsGroup]) => {
              const match = color.match(/rgba\((\d+,\s*\d+,\s*\d+),\s*([\d.]+)\)/);
              if (!match) {
                return (highlightsGroup as Highlight[]).flatMap(h => h.rects.map((rect, i) => (
                  <div key={`${h.id}-${i}`} style={{ position: 'absolute', top: rect.top * scale, left: rect.left * scale, width: rect.width * scale, height: rect.height * scale, backgroundColor: color, }} />
                )));
              }
              const opaqueColor = `rgb(${match[1]})`;
              const opacity = parseFloat(match[2]);
              return (
                <div key={color} style={{ opacity, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                  {(highlightsGroup as Highlight[]).flatMap(h => h.rects.map((rect, i) => (
                    <div key={`${h.id}-${i}`} style={{ position: 'absolute', top: rect.top * scale, left: rect.left * scale, width: rect.width * scale, height: rect.height * scale, backgroundColor: opaqueColor, }} />
                  )))}
                </div>
              );
            })}
          </div>
          <div ref={textLayerRef} className="textLayer absolute top-0 left-0" />
          {pageRendering && (!snapshotRef.current || snapshotRef.current.style.display === 'none') && (<div className={`absolute inset-0 ${currentTheme === Theme.White ? 'bg-white/50' : 'bg-black/50'} flex items-center justify-center`}><svg className="animate-spin h-6 w-6 sm:h-8 sm:h-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>)}
        </div>
      </div>
      <div className={`fixed left-8 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-200 pointer-events-none ${hoverArea === 'left' && controlsVisible ? 'opacity-100' : 'opacity-0'}`}><ChevronLeftIcon className="w-10 h-10 text-white/80" /></div>
      <div className={`fixed right-8 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-200 pointer-events-none ${hoverArea === 'right' && controlsVisible ? 'opacity-100' : 'opacity-0'}`}><ChevronRightIcon className="w-10 h-10 text-white/80" /></div>
      <div data-is-control="true" className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center justify-center gap-2 ${controlBgClass} backdrop-blur-md p-2 rounded-full border ${controlBorderClass} shadow-md transition-all duration-300 ease-in-out ${controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <button onClick={handlePrevPage} disabled={pageNum <= 1 || pageRendering} className={`p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${controlHoverClass} transition-colors`}><ChevronLeftIcon className="w-6 h-6" /></button>
        <span className="font-mono text-sm w-24 text-center">Page {pageNum} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={pageNum >= totalPages || pageRendering} className={`p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${controlHoverClass} transition-colors`}><ChevronRightIcon className="w-6 h-6" /></button>
      </div>
      <div data-is-control="true" className={`fixed left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center justify-center gap-2 ${controlBgClass} backdrop-blur-md p-2 rounded-2xl border ${controlBorderClass} shadow-md transition-all duration-300 ease-in-out ${controlsVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}>
        <button onClick={handleZoomIn} disabled={pageRendering} className={`p-1.5 rounded-full disabled:opacity-50 ${controlHoverClass} transition-colors`}><ZoomInIcon className="w-5 h-5" /></button>
        <span className="font-mono text-xs font-medium w-full text-center px-1">{Math.round(scale * 100)}%</span>
        <button onClick={handleZoomOut} disabled={pageRendering} className={`p-1.5 rounded-full disabled:opacity-50 ${controlHoverClass} transition-colors`}><ZoomOutIcon className="w-5 h-5" /></button>
        <div className="w-full h-px bg-gray-500/30 my-1"></div>
        <div className="flex flex-col gap-2">
          {Object.entries(HIGHLIGHT_COLORS).map(([name, color]) => (
            <button key={name} onClick={() => setActiveHighlightColor(color)} className={`w-6 h-6 rounded-full border-2 transition-all ${activeHighlightColor === color ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: color }} title={`Highlight ${name}`} />
          ))}
        </div>
      </div>
      <div data-is-control="true" className={`fixed bottom-4 left-4 right-4 z-20 md:hidden flex items-center justify-between gap-2 ${controlBgClass} backdrop-blur-md p-2 rounded-full border ${controlBorderClass} shadow-lg transition-all duration-300 ease-in-out ${controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <button onClick={handlePrevPage} disabled={pageNum <= 1 || pageRendering} className={`p-2 rounded-full disabled:opacity-50 ${controlHoverClass}`}><ChevronLeftIcon className="w-6 h-6" /></button>
        <span className="font-mono text-sm text-center"> {pageNum} / {totalPages}</span>
        <button onClick={handleNextPage} disabled={pageNum >= totalPages || pageRendering} className={`p-2 rounded-full disabled:opacity-50 ${controlHoverClass}`}><ChevronRightIcon className="w-6 h-6" /></button>
        <div className="flex-grow"></div>
        <button onClick={handleToggleToolsPanel} className={`p-2 rounded-full ${controlHoverClass} ${isToolsPanelOpen ? (currentTheme === Theme.White ? 'bg-indigo-100' : 'bg-indigo-500') : '' }`}><PaletteIcon className="w-6 h-6" /></button>
      </div>
       <div className={`md:hidden fixed inset-0 z-30 transition-all duration-300 ease-in-out ${controlsVisible && isToolsPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} >
         <div className="absolute inset-0 bg-black/30" onClick={handleToggleToolsPanel}></div>
         <div className={`absolute bottom-0 left-0 right-0 p-4 pb-6 rounded-t-2xl border-t shadow-2xl ${controlBgClass} ${controlBorderClass} transition-transform duration-300 ease-in-out ${isToolsPanelOpen ? 'translate-y-0' : 'translate-y-full'}`}>
           <div className="flex flex-col gap-4">
              <div className="text-center font-bold text-lg">Tools</div>
              <div className="flex items-center justify-around gap-2 p-2 rounded-full bg-black/5 dark:bg-white/5">
                <button onClick={handleZoomOut} disabled={pageRendering} className={`p-2 rounded-full disabled:opacity-50 ${controlHoverClass}`}><ZoomOutIcon className="w-7 h-7" /></button>
                <span className="font-mono text-base w-20 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={handleZoomIn} disabled={pageRendering} className={`p-2 rounded-full disabled:opacity-50 ${controlHoverClass}`}><ZoomInIcon className="w-7 h-7" /></button>
              </div>
              <div className="w-full h-px bg-gray-500/20 my-1"></div>
              <div className="flex items-center justify-around">
                {Object.entries(HIGHLIGHT_COLORS).map(([name, color]) => (
                  <button key={name} onClick={() => { setActiveHighlightColor(color); handleToggleToolsPanel(); }} className={`w-9 h-9 rounded-full border-2 transition-all ${activeHighlightColor === color ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: color }} title={`Highlight ${name}`} />
                ))}
              </div>
           </div>
         </div>
       </div>
    </div>
  );
};

export default PdfViewer;

import React, { useState, useRef } from 'react';
import { ResumeData, TemplateId } from '../../types';
import { ModernTemplate } from './templates/ModernTemplate';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { MinimalAtsTemplate } from './templates/MinimalAtsTemplate';
import { CreativeTechTemplate } from './templates/CreativeTechTemplate';
import { SinglePageAtsTemplate } from './templates/SinglePageAtsTemplate';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  Download,
  Sparkles,
  Layout,
  Palette,
  CheckCircle,
  Info,
  Loader2,
  FileCode,
  FileText,
  Check,
} from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  onTemplateChange?: (id: TemplateId) => void;
  onColorChange?: (color: string) => void;
  onOpenPolishModal?: () => void;
}

const TEMPLATES: { id: TemplateId; name: string; tag: string; badgeColor: string }[] = [
  { id: 'single-page', name: 'Single Page Elite', tag: '100% 1-Page Match', badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200' },
  { id: 'modern', name: 'Modern', tag: 'Balanced & Visual', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200' },
  { id: 'professional', name: 'Professional', tag: 'Executive Classic', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200' },
  { id: 'minimal-ats', name: 'Minimal ATS', tag: '99% Parser Score', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200' },
  { id: 'creative-tech', name: 'Creative Tech', tag: 'Developer Dark Matrix', badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200' },
];

const THEME_COLORS = ['#2563eb', '#059669', '#7c3aed', '#ea580c', '#0f172a', '#dc2626'];

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  onTemplateChange,
  onColorChange,
  onOpenPolishModal,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [showPrintTip, setShowPrintTip] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const showSuccessNotification = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  /**
   * Direct PDF Download Engine using html2canvas + jsPDF
   * Captures the exact rendered DOM at 2x crisp DPI, preserving exact colors, fonts, gaps, and sizes
   */
  const handleDirectDownloadPdf = async () => {
    const resumeEl = document.getElementById('resume-printable-a4');
    if (!resumeEl) return;

    setIsGeneratingPdf(true);
    const originalZoom = zoom;
    setZoom(100); // Normalize zoom to 100% for 1:1 pixel accuracy

    try {
      // Allow DOM to settle at scale(1)
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(resumeEl, {
        scale: 2, // High-resolution print quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('resume-printable-a4');
          if (el) {
            el.style.transform = 'none';
          }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add extra pages if content spans across multiple A4 pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const cleanName = (data.personal.fullName || 'Candidate_Resume')
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`${cleanName}_Resume.pdf`);
      showSuccessNotification('✓ PDF downloaded successfully!');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      // Fallback to system print dialog
      window.print();
    } finally {
      setZoom(originalZoom);
      setIsGeneratingPdf(false);
    }
  };

  /**
   * System Print / Save as PDF dialog
   */
  const handleNativePrint = () => {
    const currentZoom = zoom;
    setZoom(100);
    setTimeout(() => {
      window.print();
      setZoom(currentZoom);
    }, 100);
  };

  /**
   * Standalone Offline HTML File Download
   */
  const handleDownloadHtml = () => {
    const resumeEl = document.getElementById('resume-printable-a4');
    if (!resumeEl) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.personal.fullName || 'Resume'} - ${data.personal.title || 'Resume'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; }
      @page { size: A4 portrait; margin: 0; }
    }
  </style>
</head>
<body class="bg-slate-100 flex justify-center p-4">
  <div style="max-width: 800px; width: 100%; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
    ${resumeEl.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.personal.fullName || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume.html`;
    a.click();
    showSuccessNotification('✓ Standalone HTML file downloaded!');
  };

  /**
   * JSON Data Export
   */
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.personal.fullName || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_')}_${data.templateId}.json`;
    a.click();
    showSuccessNotification('✓ JSON resume data exported!');
  };

  const renderActiveTemplate = () => {
    switch (data.templateId) {
      case 'single-page':
        return <SinglePageAtsTemplate data={data} />;
      case 'professional':
        return <ProfessionalTemplate data={data} />;
      case 'minimal-ats':
        return <MinimalAtsTemplate data={data} />;
      case 'creative-tech':
        return <CreativeTechTemplate data={data} />;
      case 'modern':
      default:
        return <SinglePageAtsTemplate data={data} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Toast Notification */}
      {downloadSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between gap-2 border-b border-emerald-700 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="text-white/80 hover:text-white text-[10px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Template Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-slate-400 font-bold flex items-center gap-1 mr-1 text-[11px]">
            <Layout className="w-3.5 h-3.5" /> Template:
          </span>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onTemplateChange && onTemplateChange(t.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] flex items-center gap-1.5 ${
                data.templateId === t.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Action Controls & Zoom */}
        <div className="flex items-center gap-2">
          {/* Theme Colors */}
          {data.templateId !== 'minimal-ats' && onColorChange && (
            <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
              <Palette className="w-3 h-3 text-slate-400" />
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    data.themeColor === color ? 'scale-125 ring-2 ring-offset-1 ring-blue-500' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Select theme color ${color}`}
                />
              ))}
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px]">
            <button
              onClick={() => setZoom(Math.max(60, zoom - 15))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center font-mono font-bold">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(140, zoom + 15))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Print Tip Toggle */}
          <button
            onClick={() => setShowPrintTip(!showPrintTip)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Download & Print Quality Tips"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Direct Download PDF Button */}
          <button
            onClick={handleDirectDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition text-xs shadow-md active:scale-95"
            title="Download high-resolution PDF file directly"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          {/* Native Print / System PDF */}
          <button
            onClick={handleNativePrint}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-xs"
            title="Open browser print dialog (Save as PDF / Print)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* HTML Standalone */}
          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-xs"
            title="Download standalone offline HTML document"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>

          {/* JSON Export */}
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-xs"
            title="Export JSON Data for backup"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Print Quality Tip Banner */}
      {showPrintTip && (
        <div className="bg-blue-50 dark:bg-blue-950/60 border-b border-blue-200 dark:border-blue-900/60 p-3 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Pixel-Perfect Quality Guarantee:</strong> Clicking <strong>Download PDF</strong> automatically captures all live typography, font sizes, custom hex colors, margins, and A4 spacing. When using the <strong>Print</strong> dialog, make sure <em>"Background graphics"</em> is checked.
            </span>
          </div>
          <button
            onClick={() => setShowPrintTip(false)}
            className="text-[11px] font-bold text-blue-600 hover:underline shrink-0"
          >
            Got it
          </button>
        </div>
      )}

      {/* A4 Canvas Container with Zoom */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-slate-200/70 dark:bg-slate-950">
        <div
          ref={printRef}
          id="resume-printable-a4"
          className="transition-transform origin-top duration-150 rounded-2xl overflow-hidden shadow-2xl bg-white text-slate-900"
          style={{
            transform: `scale(${zoom / 100})`,
            width: '800px',
            minHeight: '1050px',
          }}
        >
          {renderActiveTemplate()}
        </div>
      </div>
    </div>
  );
};

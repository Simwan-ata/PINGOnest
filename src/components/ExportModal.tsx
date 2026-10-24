import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileCode,
  FileSpreadsheet,
  Check,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { PersonNode } from '../types/pingonest';
import { exportPeopleToExcel } from '../services/excelService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: PersonNode[];
  orgName: string;
  isRtl: boolean;
}

export default function ExportModal({
  isOpen,
  onClose,
  people,
  orgName,
  isRtl
}: ExportModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState(orgName || 'چارت سازمانی پینگونست');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Download complete standalone PingoNest Pro single HTML file
  const handleDownloadFullAppHtml = async () => {
    try {
      setDownloading(true);
      // Fetch the standalone PingoNest-Pro.html
      const resp = await fetch('/PingoNest-Pro.html');
      if (!resp.ok) {
        throw new Error('Could not fetch standalone template');
      }
      let htmlText = await resp.text();

      // Inject the live current people and orgName into the standalone HTML
      const peopleJson = JSON.stringify(people);
      const orgEscaped = title.replace(/"/g, '\\"');

      // Replace State.orgName and State.people in the single HTML
      htmlText = htmlText.replace(
        /orgName:\s*'[^']*'/,
        `orgName: '${orgEscaped}'`
      );
      htmlText = htmlText.replace(
        /people:\s*\[[\s\S]*?\](?=,\s*projects:)/,
        `people: ${peopleJson}`
      );

      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PingoNest-Pro-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to inject live data, fallback to raw standalone file', err);
      // Fallback: direct download link to static PingoNest-Pro.html
      const a = document.createElement('a');
      a.href = '/PingoNest-Pro.html';
      a.download = 'PingoNest-Pro.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open('/PingoNest-Pro.html', '_blank');
  };

  const handleExportXlsx = () => {
    exportPeopleToExcel(people, `${title}.xlsx`);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
              {isRtl ? 'خروجی و دانلود فایل تکی HTML' : 'Export & Download Single HTML'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 space-y-5">
          {/* Main Feature: Single File HTML App */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-950/50 dark:via-violet-950/30 dark:to-purple-950/40 border-2 border-indigo-200 dark:border-indigo-800 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                    ویژه
                  </span>
                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                    نرم‌افزار کامل PingoNest Pro در قالب یک فایل تکی HTML
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  این فایل شامل <b>تمام امکانات ارتقا یافته</b> (چارت تعاملی درختی، استودیو فرآیند BPMN 2.0، ماتریس پروژه‌ها، آنالیز هوشمند، اکسل آفلاین و تغییر تم) در یک فایل HTML مستقل است که بدون نیاز به اینترنت و بدون نیاز به نصب هر نرم‌افزاری، با دوبار کلیک در هر کامپیوتری اجرا می‌شود.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleDownloadFullAppHtml}
                disabled={downloading}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>فایل دانلود شد!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{downloading ? 'در حال آماده‌سازی...' : 'دانلود فایل تکی HTML (PingoNest-Pro.html)'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenInNewTab}
                className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>مشاهده مستقیم در تب جدید</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isRtl ? 'نام سازمان در گزارش' : 'Organization Name in Export'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
            />
          </div>

          {/* Other Formats */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleExportXlsx}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-right flex items-center gap-3 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">فایل اکسل (.xlsx)</span>
                <span className="text-[10px] text-slate-500">خروجی کامل جدول افراد و سطوح</span>
              </div>
            </button>

            <button
              onClick={handlePrint}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-right flex items-center gap-3 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">چاپ / خروجی PDF</span>
                <span className="text-[10px] text-slate-500">از طریق منوی پرینت مرورگر</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

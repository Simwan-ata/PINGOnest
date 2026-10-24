import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  GitBranch,
  FolderKanban,
  BarChart3,
  ArrowLeftRight,
  Shield,
  Download,
  Upload,
  RotateCcw,
  RotateCw,
  Sun,
  Moon,
  Globe,
  Database,
  Plus,
  FileCode,
  Zap,
  ChevronDown,
  Server,
  FileSpreadsheet,
  HardDrive,
  Users,
  Settings2,
  Sparkles,
  GitFork,
  Award,
  Target,
  PanelLeftClose,
  PanelLeftOpen,
  HelpCircle,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { UserRole } from '../types/pingonest';
import { ROLE_PERMISSIONS } from '../services/storageService';

interface TopNavProps {
  orgName: string;
  onOpenQuickCreate: () => void;
  onOpenBpmn: () => void;
  onOpenRaci: () => void;
  onOpenProjects: () => void;
  onOpenAnalytics: () => void;
  onOpenCompare: () => void;
  onOpenSt1Bridge: () => void;
  onOpenExport: () => void;
  onOpenDatabase: () => void;
  onOpenScenarioSimulation?: () => void;
  onOpenSuccession?: () => void;
  onOpenCompetencyRadar?: () => void;
  onOpenUserManagement?: () => void;
  onSaveProjectFile?: () => void;
  currentSession?: { name: string; role: string; email: string };
  onTriggerImport: () => void;
  onLoadSample: (key: 'TECH' | 'PHARMA' | 'ENERGY') => void;
  onAddPerson: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isRtl: boolean;
  onToggleLanguage: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onReplayIntro?: () => void;
  onOpenHelp?: () => void;
  onOpenWorkloadForecast?: () => void;
}

export default function TopNav({
  orgName,
  onOpenQuickCreate,
  onOpenBpmn,
  onOpenRaci,
  onOpenProjects,
  onOpenAnalytics,
  onOpenCompare,
  onOpenSt1Bridge,
  onOpenExport,
  onOpenDatabase,
  onOpenScenarioSimulation,
  onOpenSuccession,
  onOpenCompetencyRadar,
  onOpenUserManagement,
  onSaveProjectFile,
  currentSession,
  onTriggerImport,
  onLoadSample,
  onAddPerson,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  theme,
  onToggleTheme,
  isRtl,
  onToggleLanguage,
  isSidebarOpen = true,
  onToggleSidebar,
  onReplayIntro,
  onOpenHelp,
  onOpenWorkloadForecast
}: TopNavProps) {
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dataMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dataMenuRef.current && !dataMenuRef.current.contains(e.target as Node)) {
        setDataMenuOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setToolsMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleConfig = currentSession?.role && ROLE_PERMISSIONS[currentSession.role as UserRole]
    ? ROLE_PERMISSIONS[currentSession.role as UserRole]
    : null;

  return (
    <header className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between z-30 flex-shrink-0 select-none">
      {/* Brand & Organization Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex-shrink-0"
            title={isRtl ? (isSidebarOpen ? 'بستن منوی کناری' : 'باز کردن منوی کناری') : 'Toggle Sidebar'}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        )}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 flex-shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-black text-sm tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <span>PingoNest</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Enterprise</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Python & SQLite</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] lg:max-w-xs">
            {orgName}
          </p>
        </div>
      </div>

      {/* Segmented Workspace Navigation (Modern Studio Switcher) */}
      <nav className="hidden md:flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs font-bold text-slate-600 dark:text-slate-300">
        <button
          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{isRtl ? 'چارت سازمانی' : 'Org Chart'}</span>
        </button>

        <button
          onClick={onOpenBpmn}
          className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/40 flex items-center gap-1.5 transition-all"
          title={isRtl ? 'استودیو فرآیندها و گردش کار استاندارد Signavio BPMN 2.0' : 'BPMN 2.0 Studio'}
        >
          <GitBranch className="w-4 h-4 text-indigo-500" />
          <span>{isRtl ? 'فرآیندها (BPMN)' : 'BPMN Studio'}</span>
        </button>

        <button
          onClick={onOpenRaci}
          className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/40 flex items-center gap-1.5 transition-all"
          title={isRtl ? 'ماتریس مسئولیت‌های فرآیندی و حاکمیت سازمانی (RACI / RASCI)' : 'RACI Matrix'}
        >
          <FileSpreadsheet className="w-4 h-4 text-rose-500" />
          <span>{isRtl ? 'ماتریس RACI' : 'RACI Matrix'}</span>
        </button>

        <button
          onClick={onOpenProjects}
          className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/40 flex items-center gap-1.5 transition-all"
          title={isRtl ? 'مدیریت ماتریسی پروژه‌ها و تخصیص منابع' : 'Matrix Projects'}
        >
          <FolderKanban className="w-4 h-4 text-purple-500" />
          <span>{isRtl ? 'پروژه‌ها' : 'Projects'}</span>
        </button>

        <button
          onClick={onOpenAnalytics}
          className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/40 flex items-center gap-1.5 transition-all"
          title={isRtl ? 'تحلیل هوشمند ساختار، گلوگاه‌ها و شاخص‌های سازمانی' : 'Org Analytics'}
        >
          <BarChart3 className="w-4 h-4 text-emerald-500" />
          <span>{isRtl ? 'هوش سازمانی' : 'Analytics'}</span>
        </button>

        {onOpenWorkloadForecast && (
          <button
            onClick={onOpenWorkloadForecast}
            className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/40 flex items-center gap-1.5 transition-all text-indigo-700 dark:text-indigo-300 font-bold"
            title={isRtl ? 'ویژوالایزر پیش‌بینی بار کاری دپارتمان‌ها با Recharts' : 'Workload Forecast Visualizer'}
          >
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{isRtl ? 'پیش‌بینی بار کاری' : 'Workload'}</span>
          </button>
        )}
      </nav>

      {/* Mobile Studio Switcher Dropdown (visible on < md screens) */}
      <div className="relative md:hidden" ref={mobileMenuRef}>
        <button
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            setDataMenuOpen(false);
            setToolsMenuOpen(false);
          }}
          className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
            mobileMenuOpen
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/80 dark:border-indigo-700 dark:text-indigo-300'
              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{isRtl ? 'استودیوها' : 'Studios'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {mobileMenuOpen && (
          <div className="absolute top-full mt-2 start-0 w-56 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              {isRtl ? 'انتخاب استودیو' : 'Switch Studio'}
            </div>
            <div className="p-1 space-y-0.5">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-start flex items-center gap-2 text-xs font-bold"
              >
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>{isRtl ? 'چارت سازمانی' : 'Org Chart'}</span>
              </button>
              <button
                onClick={() => {
                  onOpenBpmn();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-start flex items-center gap-2 text-xs font-bold"
              >
                <GitBranch className="w-4 h-4 text-indigo-500" />
                <span>{isRtl ? 'فرآیندها (BPMN)' : 'BPMN Studio'}</span>
              </button>
              <button
                onClick={() => {
                  onOpenRaci();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-start flex items-center gap-2 text-xs font-bold"
              >
                <FileSpreadsheet className="w-4 h-4 text-rose-500" />
                <span>{isRtl ? 'ماتریس RACI' : 'RACI Matrix'}</span>
              </button>
              <button
                onClick={() => {
                  onOpenProjects();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-start flex items-center gap-2 text-xs font-bold"
              >
                <FolderKanban className="w-4 h-4 text-purple-500" />
                <span>{isRtl ? 'پروژه‌ها' : 'Projects'}</span>
              </button>
              <button
                onClick={() => {
                  onOpenAnalytics();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-start flex items-center gap-2 text-xs font-bold"
              >
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span>{isRtl ? 'هوش سازمانی' : 'Analytics'}</span>
              </button>

              {onOpenWorkloadForecast && (
                <button
                  onClick={() => {
                    onOpenWorkloadForecast();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-start flex items-center gap-2 text-xs font-bold"
                >
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>{isRtl ? 'پیش‌بینی بار کاری (Recharts)' : 'Workload Forecast'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Cluster & Quick Tools */}
      <div className="flex items-center gap-2">
        {/* Quick Create Action (Primary Action) */}
        <button
          onClick={onOpenQuickCreate}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          title={isRtl ? 'ایجاد سریع و همزمان مشاغل، پرسنل، فرآیندها و پروژه‌ها' : 'Quick Create Hub'}
        >
          <Zap className="w-4 h-4 fill-current text-amber-100" />
          <span className="hidden sm:inline">{isRtl ? 'ایجاد سریع' : 'Quick Create'}</span>
          <span className="sm:hidden">+</span>
        </button>

        {/* Data & Database Dropdown Menu */}
        <div className="relative" ref={dataMenuRef}>
          <button
            onClick={() => {
              setDataMenuOpen(!dataMenuOpen);
              setToolsMenuOpen(false);
            }}
            className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              dataMenuOpen
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/80 dark:border-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden lg:inline">{isRtl ? 'داده و پایگاه داده' : 'Data & DB'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dataMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {dataMenuOpen && (
            <div className="absolute top-full mt-2 end-0 w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                {isRtl ? 'مدیریت داده‌ها و پایگاه داده' : 'Data & Storage Hub'}
              </div>

              <div className="p-1 space-y-0.5">
                {/* Python SQLite Database */}
                <button
                  onClick={() => {
                    onOpenDatabase();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-start flex items-center gap-3 transition-colors group"
                >
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {isRtl ? 'پایگاه داده پایتون و SQLite' : 'Python SQLite Database'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isRtl ? 'همگام‌سازی ابری/لوکال با server.py' : 'Local SQLite sync and snapshots'}
                    </div>
                  </div>
                </button>

                {/* Import Excel */}
                <button
                  onClick={() => {
                    onTriggerImport();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-start flex items-center gap-3 transition-colors group"
                >
                  <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {isRtl ? 'ورود چارت سازمانی از اکسل' : 'Import from Excel (.xlsx)'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isRtl ? 'بارگذاری دسته‌جمعی پرسنل و روابط' : 'Bulk load people and reports'}
                    </div>
                  </div>
                </button>

                {/* Save Project File Directly */}
                {onSaveProjectFile && (
                  <button
                    onClick={() => {
                      onSaveProjectFile();
                      setDataMenuOpen(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-start flex items-center gap-3 transition-colors group"
                  >
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {isRtl ? 'ذخیره فایل پروژه روی کامپیوتر' : 'Download Project (.pingo)'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {isRtl ? 'بکاپ کامل مستقل جهت بازگشایی بعدی' : 'Save full offline backup file'}
                      </div>
                    </div>
                  </button>
                )}

                {/* Export & Print */}
                <button
                  onClick={() => {
                    onOpenExport();
                    setDataMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-start flex items-center gap-3 transition-colors group"
                >
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {isRtl ? 'خروجی گزارش، اکسل و چاپ' : 'Export & Print Center'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isRtl ? 'خروجی Excel، چاپ PDF و کارت‌های سازمانی' : 'Export reports and high-res chart'}
                    </div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                {/* Preset Datasets */}
                <div className="px-3 py-1.5 text-[10px] font-black text-slate-400">
                  {isRtl ? 'مجموعه داده‌های پیش‌فرض سازمانی:' : 'Sample Datasets:'}
                </div>
                <div className="grid grid-cols-2 gap-1 px-1">
                  <button
                    onClick={() => {
                      onLoadSample('TECH');
                      setDataMenuOpen(false);
                    }}
                    className="p-2 text-center text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    پارس تک (فناوری)
                  </button>
                  <button
                    onClick={() => {
                      onLoadSample('PHARMA');
                      setDataMenuOpen(false);
                    }}
                    className="p-2 text-center text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    هولدینگ سینا (دارویی)
                  </button>
                </div>

                {/* Single HTML shortcut */}
                <a
                  href="/PingoNest-Pro.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 w-full px-3 py-2 rounded-xl text-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 flex items-center justify-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'مشاهده نسخه تکی آفلاین HTML' : 'Open Single HTML file'}</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Tools & Architecture Dropdown */}
        <div className="relative" ref={toolsMenuRef}>
          <button
            onClick={() => {
              setToolsMenuOpen(!toolsMenuOpen);
              setDataMenuOpen(false);
            }}
            className={`p-2 rounded-2xl border transition-all ${
              toolsMenuOpen
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={isRtl ? 'ابزارهای تخصصی و معماری' : 'Specialized Tools'}
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {toolsMenuOpen && (
            <div className="absolute top-full mt-2 end-0 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                {isRtl ? 'ابزارهای پیشرفته سازمانی' : 'Advanced Tools'}
              </div>

              <div className="p-1 space-y-0.5">
                {onOpenScenarioSimulation && (
                  <button
                    onClick={() => {
                      onOpenScenarioSimulation();
                      setToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-start flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <GitFork className="w-4 h-4 text-amber-600" />
                    <span>{isRtl ? 'شبیه‌ساز چارت و بودجه (What-If)' : 'What-If Org & Budget'}</span>
                  </button>
                )}

                {onOpenSuccession && (
                  <button
                    onClick={() => {
                      onOpenSuccession();
                      setToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-start flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>{isRtl ? 'جانشین‌پروری و ماتریس ۹گانه' : 'Succession & 9-Box'}</span>
                  </button>
                )}

                {onOpenCompetencyRadar && (
                  <button
                    onClick={() => {
                      onOpenCompetencyRadar();
                      setToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-start flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Target className="w-4 h-4 text-teal-600" />
                    <span>{isRtl ? 'رادار شایستگی و توسعه فردی' : 'Competency Radar & IDP'}</span>
                  </button>
                )}

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    onOpenCompare();
                    setToolsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-start flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                  <span>{isRtl ? 'OrgDiff (مقایسه و تغییرات چارت)' : 'OrgDiff Comparison'}</span>
                </button>

                <button
                  onClick={() => {
                    onOpenSt1Bridge();
                    setToolsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-start flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>{isRtl ? 'معماری و پل ارتباطی ST1' : 'ST1 Architecture Bridge'}</span>
                </button>

                {onOpenUserManagement && (
                  <button
                    onClick={() => {
                      onOpenUserManagement();
                      setToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-start flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>{isRtl ? 'مدیریت کاربران و دسترسی‌ها (RBAC)' : 'User Roles & RBAC'}</span>
                  </button>
                )}

                {onReplayIntro && (
                  <button
                    onClick={() => {
                      onReplayIntro();
                      setToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-start flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{isRtl ? 'پخش مجدد اینترو سازمانی' : 'Replay Intro'}</span>
                  </button>
                )}

                {onOpenHelp && (
                  <button
                    onClick={() => {
                      onOpenHelp();
                      setToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-start flex items-center gap-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>{isRtl ? 'راهنمای جامع و تفصیلی نرم‌افزار' : 'Comprehensive User Manual'}</span>
                  </button>
                )}

                {onOpenWorkloadForecast && (
                  <button
                    onClick={() => {
                      onOpenWorkloadForecast();
                      setToolsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-start flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>{isRtl ? 'ویژوالایزر پیش‌بینی بار کاری (Recharts)' : 'Workload Forecast (Recharts)'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Pill */}
        {currentSession && (
          <button
            onClick={onOpenUserManagement || onOpenDatabase}
            className="px-3 py-1.5 rounded-2xl flex items-center gap-2 transition-all border text-xs font-black"
            style={{
              backgroundColor: roleConfig ? `${roleConfig.badgeColor}15` : '#F1F5F9',
              borderColor: roleConfig ? `${roleConfig.badgeColor}40` : '#CBD5E1',
              color: roleConfig?.badgeColor || '#475569'
            }}
            title={isRtl ? 'نقش کاربری فعال شما — کلیک برای مدیریت دسترسی‌ها' : 'Active Role'}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: roleConfig?.badgeColor || '#475569' }}
            />
            <span className="hidden sm:inline">
              {roleConfig ? roleConfig.labelFa.split(' ')[0] : 'کاربر'}
            </span>
          </button>
        )}

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* Undo / Redo Cluster */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-all"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-all"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Help Center Button */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="px-2.5 py-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm"
            title={isRtl ? 'راهنمای جامع نرم‌افزار (F1 یا ?)' : 'Help & Documentation (F1)'}
          >
            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">{isRtl ? 'راهنما' : 'Help'}</span>
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          title={theme === 'dark' ? 'حالت روز (Light)' : 'حالت شب (Dark)'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Language Toggle */}
        <button
          onClick={onToggleLanguage}
          className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          title="تغییر زبان (FA / EN)"
        >
          {isRtl ? 'EN' : 'فا'}
        </button>
      </div>
    </header>
  );
}

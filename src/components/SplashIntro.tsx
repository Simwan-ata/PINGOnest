import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, Activity, ShieldCheck, Database, GitBranch } from 'lucide-react';

interface SplashIntroProps {
  onComplete?: () => void;
  onFinish?: () => void;
  isRtl?: boolean;
}

export default function SplashIntro({ onComplete, onFinish, isRtl = true }: SplashIntroProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'nodes' | 'reveal' | 'ready' | 'exit'>('nodes');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Stage timings over 3 seconds
    const t1 = setTimeout(() => setStage('reveal'), 700);
    const t2 = setTimeout(() => setStage('ready'), 2100);
    const t3 = setTimeout(() => handleFinish(), 3100);

    // Smooth progress bar counter
    const startTime = Date.now();
    const duration = 2900;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 30);

    // Keyboard listener: Escape or Space to skip immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleFinish = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onFinish) onFinish();
      else if (onComplete) onComplete();
    }, 600);
  };

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-slate-950 text-white select-none overflow-hidden cursor-pointer transition-all duration-700 ease-out ${
        isClosing ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 45%, rgba(99, 102, 241, 0.22) 0%, transparent 60%),
          radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 45%),
          radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 45%)
        `
      }}
    >
      {/* Dynamic Animated Constellation Canvas / Background SVG Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <defs>
          <linearGradient id="introLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#C084FC" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Ambient Orbiting Circles */}
        <circle
          cx="50%"
          cy="45%"
          r="160"
          fill="none"
          stroke="url(#introLineGrad)"
          strokeWidth="1"
          strokeDasharray="6 8"
          className="animate-[spin_40s_linear_infinite]"
        />
        <circle
          cx="50%"
          cy="45%"
          r="260"
          fill="none"
          stroke="rgba(148, 163, 184, 0.12)"
          strokeWidth="1"
          strokeDasharray="4 6"
          className="animate-[spin_60s_linear_infinite_reverse]"
        />

        {/* Connecting Network Beams to Central Emblem */}
        <line x1="20%" y1="25%" x2="50%" y2="45%" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1.5" strokeDasharray="5 5" />
        <line x1="80%" y1="30%" x2="50%" y2="45%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1.5" strokeDasharray="5 5" />
        <line x1="25%" y1="70%" x2="50%" y2="45%" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" strokeDasharray="5 5" />
        <line x1="75%" y1="65%" x2="50%" y2="45%" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1.5" strokeDasharray="5 5" />
      </svg>

      {/* Top Header: Skip indicator */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
            System Initializing
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 backdrop-blur-md"
        >
          <span>{isRtl ? 'رد شدن' : 'Skip'}</span>
          <span className="text-[10px] text-slate-400 font-mono">({Math.ceil((100 - progress) / 33)}s)</span>
        </button>
      </div>

      {/* Centerpiece: Emblem & Brand Reveal */}
      <div className="flex flex-col items-center justify-center text-center z-10 space-y-6 my-auto">
        {/* Emblem with Glowing Backlight */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 rounded-3xl blur-2xl opacity-50 animate-pulse" />

          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 border border-white/20 shadow-2xl flex items-center justify-center transform transition-all duration-700 hover:scale-105">
            <Layers className="w-12 h-12 sm:w-14 sm:h-14 text-white drop-shadow-md animate-bounce" />
          </div>
        </div>

        {/* Brand Name & Typography */}
        <div className="space-y-2 max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              PingoNest
            </span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold">
              Enterprise
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed px-4">
            {isRtl
              ? 'سامانه جامع هوشمندی ساختار، فرآیندهای سازمانی Signavio و مدیریت استعداد'
              : 'Enterprise Org Architecture, BPMN 2.0 Workflows & Talent Intelligence'}
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 flex items-center gap-1.5 backdrop-blur-md">
            <Database className="w-3 h-3 text-indigo-400" />
            <span>Python & SQLite Engine</span>
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700/50 flex items-center gap-1.5 backdrop-blur-md">
            <GitBranch className="w-3 h-3 text-purple-400" />
            <span>BPMN 2.0 & RACI Matrix</span>
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-teal-950/80 text-teal-300 border border-teal-700/50 flex items-center gap-1.5 backdrop-blur-md">
            <ShieldCheck className="w-3 h-3 text-teal-400" />
            <span>Succession & 9-Box Grid</span>
          </span>
        </div>
      </div>

      {/* Bottom Progress Bar & Status */}
      <div className="w-full max-w-md space-y-2 z-10">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 font-mono px-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>
              {progress < 40
                ? (isRtl ? 'بارگذاری پایگاه داده و سلسله‌مراتب...' : 'Loading hierarchy...')
                : progress < 80
                ? (isRtl ? 'پیکربندی استودیوهای فرآیند و RACI...' : 'Setting up studios...')
                : (isRtl ? 'آماده‌سازی بوم سازمانی...' : 'Ready.')}
            </span>
          </span>
          <span>{progress}%</span>
        </div>

        {/* Glowing Progress Track */}
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(99,102,241,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-center text-[10px] text-slate-500">
          {isRtl ? 'جهت ورود فوری کلیک کنید یا کلید فاصله (Space) را بفشارید' : 'Click anywhere or press Space to skip'}
        </div>
      </div>
    </div>
  );
}

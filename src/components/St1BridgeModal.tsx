import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Download,
  Key,
  Terminal,
  Cpu,
  Lock,
  ArrowRight,
  Database
} from 'lucide-react';
import { PersonNode, BpmnProcess } from '../types/pingonest';
import { bridgeToSt1Bundle } from '../services/st1Bridge';
import { evaluateAuthorization } from '../domain/authorization';

interface St1BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  people: PersonNode[];
  processes: BpmnProcess[];
  isRtl: boolean;
}

export default function St1BridgeModal({
  isOpen,
  onClose,
  orgName,
  people,
  processes,
  isRtl
}: St1BridgeModalProps) {
  if (!isOpen) return null;

  // Compile current org & processes into ST1 bundle
  const { bundle, validationReport } = useMemo(() => {
    return bridgeToSt1Bundle(orgName, people, processes);
  }, [orgName, people, processes]);

  // Auth Sandbox state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(bundle.subjects[0]?.id || '');
  const [selectedAction, setSelectedAction] = useState<string>('workspace:write');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(bundle.workspaces[0]?.id || '');

  const authDecision = useMemo(() => {
    if (!selectedSubjectId || !selectedTargetId) return null;
    return evaluateAuthorization(
      selectedSubjectId,
      selectedAction,
      selectedTargetId,
      bundle.organizations[0].id,
      bundle
    );
  }, [selectedSubjectId, selectedAction, selectedTargetId, bundle]);

  const handleDownloadBundleJson = () => {
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pingonest-st1-bundle-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                  {isRtl ? 'پل اتصال به معماری استاندارد PingoNest ST1' : 'PingoNest ST1 Enterprise Bridge'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  SCHEMA VALIDATED
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isRtl
                  ? 'ترجمه خودکار چارت و فرآیندها به بسته داده استاندارد ST1 با شناسه‌های پایدار URN و اعتبارسنجی Ajv'
                  : 'Automated compilation into ST1 Canonical Bundle with stable URNs, JSON Schema, and 8-Step Auth'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBundleJson}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              {isRtl ? 'دانلود بسته JSON استاندارد' : 'Download Bundle JSON'}
            </button>
            <button onClick={onClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Compilation Summary Banner */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">موجودیت‌های سازمان (Workspaces)</span>
              <div className="font-black text-2xl text-slate-900 dark:text-slate-100 mt-1">
                {bundle.workspaces.length} دپارتمان
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">کاربران حاکمیتی (Subjects)</span>
              <div className="font-black text-2xl text-slate-900 dark:text-slate-100 mt-1">
                {bundle.subjects.length} عضو
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">تخصیص نقش‌ها (Role Grants)</span>
              <div className="font-black text-2xl text-slate-900 dark:text-slate-100 mt-1">
                {bundle.grants.length} مجوز
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">اعتبارسنجی با موتور Ajv 2020</span>
              <div className="font-black text-xl text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                {validationReport.isValid ? '۱۰۰٪ منطبق' : `${validationReport.totalErrors} خطا`}
              </div>
            </div>
          </div>

          {/* 8-Step Authorization Engine Sandbox */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <Key className="w-5 h-5" />
              سندباکس ارزیابی ۸ مرحله‌ای مجوزها (8-Step Canonical Auth Engine)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              ارزیابی بر اساس اصل عدم دسترسی پیش‌فرض (Default-Deny)، تفکیک وظایف و اعتبارسنجی محدوده اسکوپ سازمانی:
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  کاربر درخواست‌دهنده (Subject)
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  {bundle.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.identifier_handle} ({s.security_clearance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عملیات درخواستی (Action)</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono"
                >
                  <option value="workspace:read">workspace:read (مشاهده دپارتمان)</option>
                  <option value="workspace:write">workspace:write (تغییر ساختار)</option>
                  <option value="approval:submit">approval:submit (تصویب فرآیند)</option>
                  <option value="nest:manage">nest:manage (مدیریت پایگاه عملیاتی)</option>
                  <option value="audit:read">audit:read (مشاهده دفتر کل بازرسی)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">منبع هدف (Resource)</label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                >
                  {bundle.workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      دپارتمان: {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Decision Evaluation Result Box */}
            {authDecision && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  authDecision.decision === 'PERMIT'
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100'
                    : 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 text-rose-900 dark:text-rose-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-black uppercase ${
                        authDecision.decision === 'PERMIT' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {authDecision.decision}
                    </span>
                    <span className="font-bold text-xs">{authDecision.reasonCode}</span>
                  </div>
                  <div className="text-[11px] opacity-80 mt-1 font-mono">
                    {authDecision.auditExplanation}
                  </div>
                </div>

                <div className="text-[11px] font-mono opacity-60">
                  مرحله ارزیابی: {authDecision.stepFailed ? `گام ${authDecision.stepFailed} ناموفق` : 'کامل تأیید شد'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

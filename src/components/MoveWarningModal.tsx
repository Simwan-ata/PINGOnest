import React from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  ShieldAlert,
  Building2,
  Users,
  Award,
  Layers
} from 'lucide-react';
import { MoveValidationResult } from '../services/hierarchyValidator';
import PersonAvatar from './PersonAvatar';

interface MoveWarningModalProps {
  validationResult: MoveValidationResult | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmMove: (syncDepartment: boolean) => void;
  isRtl: boolean;
}

export default function MoveWarningModal({
  validationResult,
  isOpen,
  onClose,
  onConfirmMove,
  isRtl
}: MoveWarningModalProps) {
  if (!isOpen || !validationResult) return null;

  const { canProceed, issues, sourcePerson, targetPerson } = validationResult;
  const isCritical = issues.some((i) => i.blocking);
  const hasDeptMismatch = issues.some((i) => i.id === 'department_mismatch');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Banner */}
        <div
          className={`p-5 flex items-center justify-between border-b ${
            isCritical
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl shadow-md ${
                isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
              }`}
            >
              {isCritical ? <AlertOctagon className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-black text-base">
                {isCritical
                  ? isRtl ? 'خطای حیاتی: نقض منطق ساختار درختی' : 'Critical Hierarchy Violation'
                  : isRtl ? 'اخطار و ارزیابی جابجایی سازمانی' : 'Organizational Move Warning'}
              </h3>
              <p className="text-xs opacity-80">
                {isCritical
                  ? isRtl ? 'این جابجایی به دلیل ایجاد حلقه مدیریتی مسدود شده است.' : 'Action blocked due to cyclical dependency.'
                  : isRtl ? 'جابجایی انتخاب‌شده حاوی تناقضات رده یا دپارتمان است.' : 'Illogical position transfer detected.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Comparison Cards: From Source -> To Target Parent */}
          <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Source Person */}
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <PersonAvatar name={sourcePerson.name} photo={sourcePerson.photo} size={48} />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                  {isRtl ? 'پست در حال انتقال' : 'Position to move'}
                </span>
                <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 truncate">
                  {sourcePerson.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{sourcePerson.title}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                  <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                    رده {sourcePerson.level}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 truncate">{sourcePerson.department}</span>
                </div>
              </div>
            </div>

            {/* Transfer Arrow */}
            <div className="flex flex-col items-center justify-center px-2 text-slate-400">
              {isRtl ? <ArrowLeft className="w-5 h-5 text-indigo-500" /> : <ArrowRight className="w-5 h-5 text-indigo-500" />}
              <span className="text-[9px] font-bold text-slate-400 mt-0.5">انتقال به زیردست</span>
            </div>

            {/* Target Person */}
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <PersonAvatar name={targetPerson.name} photo={targetPerson.photo} size={48} />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">
                  {isRtl ? 'مدیر مستقیم جدید' : 'New Parent Manager'}
                </span>
                <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 truncate">
                  {targetPerson.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{targetPerson.title}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                  <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                    رده {targetPerson.level}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 truncate">{targetPerson.department}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            <h5 className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{isRtl ? 'مغایرت‌ها و هشدارهای شناسایی‌شده:' : 'Detected Structural Issues:'}</span>
            </h5>

            <div className="space-y-2.5">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3.5 rounded-2xl border text-xs ${
                    issue.severity === 'critical'
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-100'
                      : issue.severity === 'high'
                      ? 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 text-orange-950 dark:text-orange-100'
                      : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs flex items-center gap-1.5">
                      {issue.blocking ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      )}
                      <span>{isRtl ? issue.titleFa : issue.titleEn}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        issue.severity === 'critical'
                          ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100'
                          : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                      }`}
                    >
                      {issue.blocking ? (isRtl ? 'غیرمجاز' : 'Blocked') : (isRtl ? 'هشدار منطقی' : 'Warning')}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90 mt-1">
                    {isRtl ? issue.descriptionFa : issue.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40 flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isRtl ? 'انصراف و لغو جابجایی' : 'Cancel Move'}
          </button>

          <div className="flex items-center gap-2">
            {!canProceed ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/30 transition-all"
              >
                {isRtl ? 'متوجه شدم (عدم امکان جابجایی)' : 'Understood (Blocked)'}
              </button>
            ) : (
              <>
                {hasDeptMismatch && (
                  <button
                    type="button"
                    onClick={() => {
                      onConfirmMove(true);
                      onClose();
                    }}
                    className="px-4 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1.5"
                    title={isRtl ? `تغییر دپارتمان به «${targetPerson.department}» همراه با انتساب مدیر` : 'Update department to match parent'}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'انتقال و تغییر خودکار دپارتمان' : 'Move & Sync Dept'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onConfirmMove(false);
                    onClose();
                  }}
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md shadow-amber-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'تایید و اعمال جابجایی با آگاهی' : 'Confirm & Proceed'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

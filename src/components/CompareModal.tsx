import React, { useState, useMemo } from 'react';
import {
  X,
  Upload,
  UserPlus,
  UserMinus,
  RefreshCw,
  Move,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  FileSpreadsheet,
  FileCode,
  ArrowRight,
  TrendingUp,
  Search,
  Eye,
  Filter
} from 'lucide-react';
import { PersonNode, DiffResult, OrgDiffRow, OrgDiffResult, OrgDiffChangeType } from '../types/pingonest';
import { parseExcelFile, exportPeopleToExcel } from '../services/excelService';
import { OrgDiffEngine } from '../services/analyticsService';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPeople: PersonNode[];
  onApplyDiffHighlight: (diff: DiffResult | null) => void;
  isRtl: boolean;
}

const COLORS: Record<OrgDiffChangeType, string> = {
  added: '#10B981',     // Emerald
  removed: '#EF4444',   // Red
  changed: '#F59E0B',   // Amber
  moved: '#3B82F6',     // Blue
  promoted: '#8B5CF6',  // Purple
  demoted: '#EC4899',   // Pink
  unchanged: '#94A3B8'  // Slate
};

const TYPE_LABELS_FA: Record<OrgDiffChangeType, string> = {
  added: 'افزوده‌شده',
  removed: 'حذف‌شده',
  changed: 'تغییر اطلاعات',
  moved: 'جابه‌جایی',
  promoted: 'ارتقای سازمانی',
  demoted: 'تنزل سازمانی',
  unchanged: 'بدون تغییر'
};

const TYPE_ICONS: Record<OrgDiffChangeType, string> = {
  added: '＋',
  removed: '−',
  changed: '✦',
  moved: '↗',
  promoted: '↑',
  demoted: '↓',
  unchanged: '•'
};

export default function CompareModal({
  isOpen,
  onClose,
  currentPeople,
  onApplyDiffHighlight,
  isRtl
}: CompareModalProps) {
  if (!isOpen) return null;

  const [comparePeople, setComparePeople] = useState<PersonNode[] | null>(null);
  const [versionBName, setVersionBName] = useState<string>('');
  const [diffResult, setDiffResult] = useState<OrgDiffResult | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [activeTypeFilters, setActiveTypeFilters] = useState<Set<OrgDiffChangeType>>(
    new Set(['added', 'removed', 'moved', 'promoted', 'demoted', 'changed'])
  );

  // Tree comparison view toggle
  const [showTreeComparison, setShowTreeComparison] = useState<boolean>(false);
  const [focusedPersonId, setFocusedPersonId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Handle file upload (Supports both Excel and JSON)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let parsed: PersonNode[] = [];

      if (ext === 'json') {
        const text = await file.text();
        const json = JSON.parse(text);
        parsed = Array.isArray(json) ? json : json.people || json.rawData || [];
      } else {
        const buffer = await file.arrayBuffer();
        parsed = parseExcelFile(buffer);
      }

      if (parsed.length === 0) {
        alert(isRtl ? 'هیچ رکوردی در فایل یافت نشد.' : 'No records found in file.');
        return;
      }

      setComparePeople(parsed);
      setVersionBName(file.name);
      const diff = OrgDiffEngine.runComparison(currentPeople, parsed);
      setDiffResult(diff);
    } catch (err) {
      alert(isRtl ? 'خطا در خواندن فایل مقایسه' : 'Error reading comparison file');
    }
    e.target.value = '';
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!diffResult) return [];
    return diffResult.rows.filter((r) => {
      if (!activeTypeFilters.has(r.changeType)) return false;
      if (selectedDept && r.department !== selectedDept) return false;

      if (selectedRisk === 'high' && r.risk < 60) return false;
      if (selectedRisk === 'mid' && (r.risk < 30 || r.risk >= 60)) return false;
      if (selectedRisk === 'low' && r.risk >= 30) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const hay = `${r.name} ${r.department} ${r.titleA} ${r.titleB}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [diffResult, activeTypeFilters, selectedDept, selectedRisk, searchTerm]);

  // Apply to chart
  const handleApplyToChart = () => {
    if (!diffResult) return;
    const added: PersonNode[] = diffResult.rows.filter((r) => r.changeType === 'added' && r.after).map((r) => r.after!);
    const removed: PersonNode[] = diffResult.rows.filter((r) => r.changeType === 'removed' && r.before).map((r) => r.before!);
    const changed = diffResult.rows
      .filter((r) => (r.changeType === 'changed' || r.changeType === 'promoted' || r.changeType === 'demoted') && r.before && r.after)
      .map((r) => ({ before: r.before!, after: r.after!, fields: r.changedFields }));
    const moved = diffResult.rows
      .filter((r) => r.changeType === 'moved' && r.before && r.after)
      .map((r) => ({ person: r.after!, oldParentId: r.before!.parentId, newParentId: r.after!.parentId }));

    onApplyDiffHighlight({ added, removed, changed, moved });
    onClose();
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTypeFilter = (type: OrgDiffChangeType) => {
    setActiveTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 60) return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    if (risk >= 30) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 60) return 'پرریسک';
    if (risk >= 30) return 'متوسط';
    return 'کم‌ریسک';
  };

  // Export OrgDiff as JSON
  const handleExportJson = () => {
    if (!diffResult) return;
    const blob = new Blob([JSON.stringify(diffResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orgdiff-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export OrgDiff as Excel
  const handleExportExcel = () => {
    if (!diffResult) return;
    const rows = diffResult.rows.map((r, i) => ({
      ردیف: i + 1,
      'شناسه پرسنلی': r.id,
      'نام و نام خانوادگی': r.name,
      دپارتمان: r.department,
      'سمت قبلی (نسخه A)': r.titleA || '—',
      'سمت جدید (نسخه B)': r.titleB || '—',
      وضعیت: r.status,
      'نوع تغییر': TYPE_LABELS_FA[r.changeType],
      'امتیاز ریسک': r.risk,
      'اثر بر سازمان': r.impact
    }));
    exportPeopleToExcel(
      rows.map((x) => ({
        id: x['شناسه پرسنلی'],
        name: x['نام و نام خانوادگی'],
        title: x['سمت جدید (نسخه B)'],
        department: x['دپارتمان'],
        parentId: '',
        level: 1,
        subCount: 0,
        status: 'فعال'
      })),
      'OrgDiff-Report.xlsx'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md">
      <div className="w-full max-w-6xl h-[92vh] max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-black">
              ↔
            </div>
            <div>
              <div className="text-[10px] font-black tracking-widest text-teal-400 uppercase">
                ORGANIZATIONAL INTELLIGENCE
              </div>
              <h2 className="font-bold text-base text-white">
                {isRtl ? 'OrgDiff — تحلیل تفاضلی سازمان' : 'OrgDiff — Organizational Change Intelligence'}
              </h2>
              <p className="text-xs text-slate-400">
                {versionBName ? `نسخه B: ${versionBName}` : isRtl ? 'مقایسه چارت فعلی با نسخه جدید (اکسل یا JSON)' : 'Compare current org with Version B'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md">
              <Upload className="w-4 h-4" />
              <span>{isRtl ? 'بارگذاری نسخه B' : 'Upload Version B'}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {diffResult && (
              <button
                onClick={handleApplyToChart}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isRtl ? 'نمایش روی چارت' : 'Show on Chart'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Body */}
        {!diffResult ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950/40">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-900 border border-teal-500/30 text-teal-300 text-3xl font-black flex items-center justify-center shadow-xl mb-4">
              ↔
            </div>
            <h3 className="font-black text-xl text-slate-900 dark:text-slate-100 mb-2">
              {isRtl ? 'تغییرات سازمان را در یک نگاه ببینید' : 'See Organization Changes at a Glance'}
            </h3>
            <p className="max-w-xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {isRtl
                ? 'فایل نسخه جدید سازمان را (با فرمت Excel یا JSON) بارگذاری کنید تا پینگونست به‌طور هوشمند افراد اضافه‌شده، حذف‌شده، جابه‌جایی‌ها، تغییر سمت و ارتقا/تنزل را همراه با امتیاز ریسک محاسبه کند.'
                : 'Upload the new organization version (Excel or JSON) to automatically detect additions, deletions, lateral moves, promotions, and risk scores.'}
            </p>
            <label className="cursor-pointer px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all">
              <Upload className="w-5 h-5" />
              <span>{isRtl ? 'انتخاب فایل نسخه B (Excel یا JSON)' : 'Select Version B File'}</span>
              <input
                type="file"
                accept=".xlsx,.xls,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <div className="flex items-center gap-3 mt-6 text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg">✓ Excel (.xlsx)</span>
              <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg">✓ JSON Structure</span>
              <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg">✓ ارزیابی ریسک</span>
              <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg">✓ مقایسه ساختاری درختی</span>
            </div>
          </div>
        ) : (
          /* OrgDiff Workspace */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 bg-slate-50 dark:bg-slate-950/40">
            {/* Hero AI Change Intelligence */}
            <section className="p-5 rounded-2xl bg-gradient-to-r from-white to-teal-50/50 dark:from-slate-900 dark:to-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-black tracking-wider text-teal-600 dark:text-teal-400 uppercase">
                  CHANGE INTELLIGENCE
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                  {isRtl ? 'چه چیزی در سازمان تغییر کرده است؟' : 'What Changed in the Organization?'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1 max-w-3xl">
                  {isRtl
                    ? `در این مقایسه مجموعاً ${diffResult.rows.length} تغییر ساختاری شناسایی شد؛ شامل ${diffResult.meta.addedCount} نفر استخدام جدید، ${diffResult.meta.removedCount} نفر خروجی، ${diffResult.meta.movedCount} جابه‌جایی دپارتمانی یا مدیریتی و ${diffResult.meta.promotedCount + diffResult.meta.demotedCount} تغییر سطح سازمانی. موارد پرریسک نیاز به تأییدیه منابع انسانی دارند.`
                    : `Identified ${diffResult.rows.length} total changes: ${diffResult.meta.addedCount} added, ${diffResult.meta.removedCount} removed, ${diffResult.meta.movedCount} moved, and ${diffResult.meta.promotedCount + diffResult.meta.demotedCount} level changes.`}
                </p>
              </div>

              {/* Health Ring */}
              <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0">
                <div className="w-14 h-14 rounded-full border-4 border-teal-500/20 border-t-teal-500 flex items-center justify-center font-black text-sm text-teal-600 dark:text-teal-400">
                  {diffResult.meta.healthScore}%
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                    {diffResult.meta.highRiskCount > 0 ? 'نیازمند بررسی' : 'تغییرات کنترل‌شده'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {diffResult.meta.highRiskCount > 0 ? `${diffResult.meta.highRiskCount} تغییر پرریسک` : 'بدون ریسک بحرانی'}
                  </div>
                </div>
              </div>
            </section>

            {/* KPI Cards */}
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-[11px] font-bold text-slate-500">کل تغییرات</div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{diffResult.rows.length}</div>
                <div className="text-[10px] text-slate-400">تفاضل کل بین دو نسخه</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
                <div className="text-[11px] font-bold text-emerald-600">افزوده‌شده</div>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">{diffResult.meta.addedCount}</div>
                <div className="text-[10px] text-slate-400">افراد جدید در نسخه B</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-rose-500">
                <div className="text-[11px] font-bold text-rose-600">حذف‌شده</div>
                <div className="text-2xl font-black text-rose-600 mt-0.5">{diffResult.meta.removedCount}</div>
                <div className="text-[10px] text-slate-400">حذف از ساختار چارت</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-500">
                <div className="text-[11px] font-bold text-blue-600">جابه‌جایی</div>
                <div className="text-2xl font-black text-blue-600 mt-0.5">{diffResult.meta.movedCount}</div>
                <div className="text-[10px] text-slate-400">تغییر دپارتمان یا مدیر</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-purple-500">
                <div className="text-[11px] font-bold text-purple-600">تغییر لایه</div>
                <div className="text-2xl font-black text-purple-600 mt-0.5">
                  {diffResult.meta.promotedCount + diffResult.meta.demotedCount}
                </div>
                <div className="text-[10px] text-slate-400">ارتقا یا تنزل در لایه‌ها</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-rose-600">
                <div className="text-[11px] font-bold text-rose-600">تغییرات پرریسک</div>
                <div className="text-2xl font-black text-rose-600 mt-0.5">{diffResult.meta.highRiskCount}</div>
                <div className="text-[10px] text-slate-400">امتیاز ریسک بالای ۶۰</div>
              </div>
            </section>

            {/* Top 5 High-Risk Changes and Insights */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Risk Distribution */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 mb-1">توزیع ریسک تغییرات</h4>
                <p className="text-[11px] text-slate-500 mb-3">شدت و وسعت اثرگذاری تصمیمات بر ساختار</p>
                <div className="flex flex-col gap-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-rose-600">پرریسک (امتیاز ۶۰+)</span>
                      <span>{diffResult.meta.highRiskCount} نفر</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{
                          width: `${diffResult.rows.length ? (diffResult.meta.highRiskCount / diffResult.rows.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-amber-600">متوسط (امتیاز ۳۰-۵۹)</span>
                      <span>{diffResult.rows.filter((r) => r.risk >= 30 && r.risk < 60).length} نفر</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${diffResult.rows.length ? (diffResult.rows.filter((r) => r.risk >= 30 && r.risk < 60).length / diffResult.rows.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-emerald-600">کم‌ریسک (زیر ۳۰)</span>
                      <span>{diffResult.rows.filter((r) => r.risk < 30).length} نفر</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${diffResult.rows.length ? (diffResult.rows.filter((r) => r.risk < 30).length / diffResult.rows.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top 5 High-Risk Items */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 mb-1">مهم‌ترین تغییرات حساس</h4>
                <p className="text-[11px] text-slate-500 mb-3">عناصری که بیشترین پیامد عملیاتی را دارند</p>
                <div className="flex flex-col gap-2">
                  {diffResult.rows
                    .slice()
                    .sort((a, b) => b.risk - a.risk)
                    .slice(0, 4)
                    .map((r, i) => (
                      <div
                        key={r.id}
                        onClick={() => setFocusedPersonId(r.id)}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-black flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{r.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {TYPE_LABELS_FA[r.changeType]} • {r.department}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${getRiskColor(r.risk)}`}>
                          {r.risk}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Insights */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 mb-1">نکات کلیدی مدیریتی</h4>
                  <p className="text-[11px] text-slate-500 mb-3">الگوهای شناسایی‌شده در نسخه جدید</p>
                  <div className="flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-300">
                    {diffResult.meta.movedCount > 0 && (
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                        <b>جابه‌جایی ساختاری:</b> {diffResult.meta.movedCount} نفر تغییر مدیر بالادست یا دپارتمان داشته‌اند.
                      </div>
                    )}
                    {diffResult.meta.removedCount > 0 && (
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                        <b>تعدیل / خروج:</b> {diffResult.meta.removedCount} نفر در نسخه جدید حضور ندارند.
                      </div>
                    )}
                    {diffResult.meta.highRiskCount === 0 && (
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                        <b>ثبات تشکیلاتی:</b> تمام تغییرات شناسایی‌شده در محدوده ایمن هستند.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setShowTreeComparison(!showTreeComparison)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1 border transition-all ${
                      showTreeComparison
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <FolderTree className="w-3.5 h-3.5" />
                    <span>{showTreeComparison ? 'پنهان‌سازی درخت' : '🌳 مقایسه ساختاری درختی'}</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    title="خروجی اکسل گزارش OrgDiff"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    title="خروجی JSON"
                  >
                    <FileCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Tree Comparison View */}
            {showTreeComparison && comparePeople && (
              <section className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      مقایسه درختی ساختار A و B (گزارش‌دهی لایه‌ای)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">برای فوکوس، روی هر گره کلیک کنید</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {/* Side A */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-black text-slate-700 dark:text-slate-300 mb-2">نسخه A (چارت فعلی)</div>
                    <div className="flex flex-col gap-1 text-xs">
                      {currentPeople.slice(0, 15).map((p) => (
                        <div
                          key={p.id}
                          style={{ paddingRight: `${(p.level - 1) * 16}px` }}
                          onClick={() => setFocusedPersonId(p.id)}
                          className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                            focusedPersonId === p.id
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                              : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-500">{p.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Side B */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-black text-slate-700 dark:text-slate-300 mb-2">نسخه B (جدید)</div>
                    <div className="flex flex-col gap-1 text-xs">
                      {comparePeople.slice(0, 15).map((p) => {
                        const row = diffResult.rows.find((r) => r.id === p.id);
                        return (
                          <div
                            key={p.id}
                            style={{ paddingRight: `${(p.level - 1) * 16}px` }}
                            onClick={() => setFocusedPersonId(p.id)}
                            className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                              focusedPersonId === p.id
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              {row && (
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: COLORS[row.changeType] }}
                                />
                              )}
                              <span>{p.name}</span>
                            </span>
                            <span className="text-[10px] text-slate-500">{p.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Workspace Table with Multi-Filter */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1">
              {/* Filter bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجو در نام، دپارتمان یا سمت..."
                    className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Type chips */}
                <div className="flex items-center gap-1 flex-wrap">
                  {(['added', 'removed', 'moved', 'promoted', 'demoted', 'changed'] as OrgDiffChangeType[]).map((type) => {
                    const count = diffResult.rows.filter((r) => r.changeType === type).length;
                    if (count === 0) return null;
                    const isActive = activeTypeFilters.has(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleTypeFilter(type)}
                        style={{
                          borderColor: isActive ? COLORS[type] : undefined,
                          backgroundColor: isActive ? `${COLORS[type]}15` : undefined,
                          color: isActive ? COLORS[type] : undefined
                        }}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                          isActive
                            ? 'shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 bg-white dark:bg-slate-900 opacity-60'
                        }`}
                      >
                        <span>{TYPE_ICONS[type]}</span> {TYPE_LABELS_FA[type]} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Dept Filter */}
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">همه دپارتمان‌ها</option>
                  {Array.from(new Set(diffResult.rows.map((r) => r.department))).filter(Boolean).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Risk Filter */}
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">همه سطوح ریسک</option>
                  <option value="high">پرریسک (۶۰+)</option>
                  <option value="mid">متوسط (۳۰-۵۹)</option>
                  <option value="low">کم‌ریسک (زیر ۳۰)</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-8"></th>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">فرد</th>
                      <th className="py-2.5 px-3">دپارتمان</th>
                      <th className="py-2.5 px-3">سمت در نسخه A</th>
                      <th className="py-2.5 px-3">سمت در نسخه B</th>
                      <th className="py-2.5 px-3">نوع تغییر</th>
                      <th className="py-2.5 px-3">امتیاز ریسک</th>
                      <th className="py-2.5 px-3">شرح اثر سازمانی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          موردی با فیلترهای انتخابی یافت نشد.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((r, i) => {
                        const isExpanded = expandedRows.has(r.id);
                        return (
                          <React.Fragment key={r.id}>
                            <tr
                              className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                focusedPersonId === r.id ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''
                              }`}
                            >
                              <td className="py-2 px-3 text-center">
                                <button
                                  onClick={() => toggleRowExpansion(r.id)}
                                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-mono text-sm"
                                >
                                  {isExpanded ? '▼' : '▶'}
                                </button>
                              </td>
                              <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                              <td className="py-2 px-3">
                                <div className="font-bold text-slate-900 dark:text-slate-100">{r.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{r.id}</div>
                              </td>
                              <td className="py-2 px-3">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                                  {r.department}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-500 line-through">
                                {r.titleA || '—'}
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                                {r.titleB || '—'}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  style={{
                                    backgroundColor: `${COLORS[r.changeType]}18`,
                                    color: COLORS[r.changeType]
                                  }}
                                  className="px-2 py-0.5 rounded-lg text-[11px] font-black inline-flex items-center gap-1"
                                >
                                  <span>{TYPE_ICONS[r.changeType]}</span>
                                  <span>{TYPE_LABELS_FA[r.changeType]}</span>
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded-lg border font-bold text-[11px] ${getRiskColor(r.risk)}`}>
                                  {r.risk} ({getRiskLabel(r.risk)})
                                </span>
                              </td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs">
                                {r.impact}
                              </td>
                            </tr>

                            {/* Expanded Detail Box */}
                            {isExpanded && (
                              <tr className="bg-slate-50/70 dark:bg-slate-950/40">
                                <td colSpan={9} className="p-3 border-t border-slate-100 dark:border-slate-800">
                                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                                      <span>جزئیات دقیق تغییرات فیلدها</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                                        <span className="text-[10px] text-slate-400 block">سمت:</span>
                                        <span className="text-slate-500 line-through text-[11px]">{r.before?.title || '—'}</span>{' '}
                                        <span className="text-indigo-600 font-bold text-[11px]">→ {r.after?.title || '—'}</span>
                                      </div>
                                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                                        <span className="text-[10px] text-slate-400 block">دپارتمان:</span>
                                        <span className="text-slate-500 line-through text-[11px]">{r.before?.department || '—'}</span>{' '}
                                        <span className="text-indigo-600 font-bold text-[11px]">→ {r.after?.department || '—'}</span>
                                      </div>
                                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                                        <span className="text-[10px] text-slate-400 block">کد مدیر بالادست:</span>
                                        <span className="text-slate-500 line-through text-[11px]">{r.before?.parentId || 'ریشه'}</span>{' '}
                                        <span className="text-indigo-600 font-bold text-[11px]">→ {r.after?.parentId || 'ریشه'}</span>
                                      </div>
                                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                                        <span className="text-[10px] text-slate-400 block">تعداد زیرمجموعه مستقیم:</span>
                                        <span className="text-slate-500 line-through text-[11px]">{r.before?.subCount || 0}</span>{' '}
                                        <span className="text-indigo-600 font-bold text-[11px]">→ {r.after?.subCount || 0}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

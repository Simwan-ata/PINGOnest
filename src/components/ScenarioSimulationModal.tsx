import React, { useState, useMemo } from 'react';
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  ArrowRight,
  GitFork,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { PersonNode } from '../types/pingonest';

interface ScenarioSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPeople: PersonNode[];
  onApplyScenario: (updatedPeople: PersonNode[]) => void;
  isRtl: boolean;
}

interface SimulatedChange {
  id: string;
  type: 'add' | 'remove' | 'move' | 'salary';
  personId: string;
  personName: string;
  description: string;
  payrollDelta: number;
}

export default function ScenarioSimulationModal({
  isOpen,
  onClose,
  originalPeople,
  onApplyScenario,
  isRtl
}: ScenarioSimulationModalProps) {
  // Sandbox state
  const [sandboxPeople, setSandboxPeople] = useState<PersonNode[]>(() => JSON.parse(JSON.stringify(originalPeople)));
  const [scenarioName, setScenarioName] = useState<string>('سناریوی بهینه‌سازی ساختار و بودجه Q3');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [newSalary, setNewSalary] = useState<number>(35000000);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // Reset sandbox when modal opens or user clicks reset
  const handleReset = () => {
    setSandboxPeople(JSON.parse(JSON.stringify(originalPeople)));
    setAppliedSuccess(false);
  };

  // Original metrics
  const originalStats = useMemo(() => {
    const headcount = originalPeople.length;
    const totalPayroll = originalPeople.reduce((sum, p) => sum + (p.salary || 30000000), 0);
    const avgSalary = headcount > 0 ? totalPayroll / headcount : 0;
    const managers = originalPeople.filter((p) => originalPeople.some((c) => c.parentId === p.id));
    const avgSpan = managers.length > 0 ? (headcount - 1) / managers.length : 0;
    return { headcount, totalPayroll, avgSalary, avgSpan };
  }, [originalPeople]);

  // Sandbox metrics
  const sandboxStats = useMemo(() => {
    const headcount = sandboxPeople.length;
    const totalPayroll = sandboxPeople.reduce((sum, p) => sum + (p.salary || 30000000), 0);
    const avgSalary = headcount > 0 ? totalPayroll / headcount : 0;
    const managers = sandboxPeople.filter((p) => sandboxPeople.some((c) => c.parentId === p.id));
    const avgSpan = managers.length > 0 ? (headcount - 1) / managers.length : 0;
    return { headcount, totalPayroll, avgSalary, avgSpan };
  }, [sandboxPeople]);

  // Deltas
  const deltas = useMemo(() => {
    return {
      headcount: sandboxStats.headcount - originalStats.headcount,
      payroll: sandboxStats.totalPayroll - originalStats.totalPayroll,
      avgSalary: sandboxStats.avgSalary - originalStats.avgSalary,
      avgSpan: sandboxStats.avgSpan - originalStats.avgSpan
    };
  }, [originalStats, sandboxStats]);

  // Detected changes list
  const detectedChanges = useMemo<SimulatedChange[]>(() => {
    const origMap = new Map(originalPeople.map((p) => [p.id, p]));
    const sandMap = new Map(sandboxPeople.map((p) => [p.id, p]));
    const list: SimulatedChange[] = [];

    // Added
    sandboxPeople.forEach((p) => {
      if (!origMap.has(p.id)) {
        list.push({
          id: `add-${p.id}`,
          type: 'add',
          personId: p.id,
          personName: p.name,
          description: `افزودن سمت جدید: «${p.title}» در دپارتمان ${p.department}`,
          payrollDelta: p.salary || 30000000
        });
      }
    });

    // Removed
    originalPeople.forEach((p) => {
      if (!sandMap.has(p.id)) {
        list.push({
          id: `del-${p.id}`,
          type: 'remove',
          personId: p.id,
          personName: p.name,
          description: `حذف سمت: «${p.title} (${p.name})»`,
          payrollDelta: -(p.salary || 30000000)
        });
      }
    });

    // Modified
    sandboxPeople.forEach((p) => {
      const orig = origMap.get(p.id);
      if (orig) {
        if (orig.parentId !== p.parentId) {
          const newParent = sandMap.get(p.parentId);
          list.push({
            id: `move-${p.id}`,
            type: 'move',
            personId: p.id,
            personName: p.name,
            description: `انتقال به سرپرست جدید: «${newParent ? newParent.name : 'سطح ریشه'}»`,
            payrollDelta: 0
          });
        }
        if ((orig.salary || 0) !== (p.salary || 0)) {
          const diff = (p.salary || 0) - (orig.salary || 0);
          list.push({
            id: `sal-${p.id}`,
            type: 'salary',
            personId: p.id,
            personName: p.name,
            description: `تغییر حقوق از ${((orig.salary || 0) / 1000000).toLocaleString()} به ${((p.salary || 0) / 1000000).toLocaleString()} م.ت`,
            payrollDelta: diff
          });
        }
      }
    });

    return list;
  }, [originalPeople, sandboxPeople]);

  // Departments list
  const departments = useMemo(() => {
    return Array.from(new Set(sandboxPeople.map((p) => p.department).filter(Boolean)));
  }, [sandboxPeople]);

  // Actions
  const handleAddMockPerson = () => {
    if (!newTitle.trim()) return;
    const parent = sandboxPeople.find((p) => p.id === newParentId);
    const newPerson: PersonNode = {
      id: `sim-${Date.now()}`,
      name: newName.trim() || `(بلاتصدی - ${newTitle})`,
      title: newTitle.trim(),
      department: newDept || (parent ? parent.department : 'عمومی'),
      parentId: newParentId || '',
      level: parent ? parent.level + 1 : 1,
      subCount: 0,
      status: 'فعال',
      salary: newSalary,
      contractType: 'official'
    };
    setSandboxPeople([...sandboxPeople, newPerson]);
    setNewTitle('');
    setNewName('');
    setShowAddForm(false);
  };

  const handleDeleteMock = (id: string) => {
    // Re-link children to grandparent
    const personToDelete = sandboxPeople.find((p) => p.id === id);
    if (!personToDelete) return;
    const next = sandboxPeople
      .filter((p) => p.id !== id)
      .map((p) => (p.parentId === id ? { ...p, parentId: personToDelete.parentId } : p));
    setSandboxPeople(next);
  };

  const handleUpdateSalary = (id: string, salary: number) => {
    setSandboxPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, salary } : p))
    );
  };

  const handleApply = () => {
    onApplyScenario(sandboxPeople);
    setAppliedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {isRtl ? 'شبیه‌ساز سناریوی چارت و بودجه (What-If Sandbox)' : 'What-If Org & Budget Simulation'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                  سندباکس ایزوله
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تغییرات چارت، حذف یا افزودن پست‌ها و اثرات بودجه‌ای را بدون دستکاری چارت اصلی تست کنید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              title="بازنشانی به وضعیت فعلی سازمان"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isRtl ? 'بازنشانی سناریو' : 'Reset'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive KPI Delta Dashboard */}
        <div className="p-4 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Headcount */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>تعداد کل پرسنل</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {sandboxStats.headcount}
              </span>
              <span
                className={`text-xs font-black flex items-center gap-0.5 ${
                  deltas.headcount > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : deltas.headcount < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {deltas.headcount > 0 ? `+${deltas.headcount}` : deltas.headcount} نفر
              </span>
            </div>
          </div>

          {/* Monthly Payroll */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>بار مالی ماهانه حقوق</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {(sandboxStats.totalPayroll / 1000000).toLocaleString('fa-IR')}
              </span>
              <span className="text-[10px] text-slate-400">م.ت</span>
              <span
                className={`text-xs font-black ms-auto flex items-center gap-0.5 ${
                  deltas.payroll > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : deltas.payroll < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {deltas.payroll > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 inline" />
                ) : deltas.payroll < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 inline" />
                ) : null}
                {deltas.payroll !== 0 && `${(Math.abs(deltas.payroll) / 1000000).toLocaleString('fa-IR')} م.ت`}
              </span>
            </div>
          </div>

          {/* Average Salary */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>میانگین حقوق ناخالص</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {(Math.round(sandboxStats.avgSalary) / 1000000).toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">م.ت / نفر</span>
            </div>
          </div>

          {/* Span of Control */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
              <span>میانگین حیطه نظارت مدیران</span>
              <Building2 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {sandboxStats.avgSpan.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">نفر به ازای مدیر</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Sandbox People Management */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  پرسنل و مشاغل سناریو ({sandboxPeople.length} مورد)
                </span>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
                >
                  <option value="all">همه دپارتمان‌ها</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن موقعیت تستی</span>
              </button>
            </div>

            {/* Quick Add Form */}
            {showAddForm && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-in fade-in">
                <div className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                  ایجاد جایگاه شغلی جدید در این سناریو:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="عنوان شغل (مثلا: مدیر بازاریابی دیجیتال)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="نام تصدی‌کننده (اختیاری)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="">انتخاب دپارتمان...</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={newParentId}
                    onChange={(e) => setNewParentId(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="">گزارش مستقیم به... (سرپرست)</option>
                    {sandboxPeople.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.name})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold">حقوق برآوردی:</span>
                    <input
                      type="number"
                      step={5000000}
                      value={newSalary}
                      onChange={(e) => setNewSalary(Number(e.target.value))}
                      className="px-3 py-1.5 flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={handleAddMockPerson}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow"
                  >
                    ثبت در سناریو
                  </button>
                </div>
              </div>
            )}

            {/* People List in Sandbox */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pe-1">
              {sandboxPeople
                .filter((p) => selectedDeptFilter === 'all' || p.department === selectedDeptFilter)
                .map((person) => {
                  const isNew = !originalPeople.some((orig) => orig.id === person.id);
                  const parent = sandboxPeople.find((p) => p.id === person.parentId);

                  return (
                    <div
                      key={person.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isNew
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-900 dark:text-slate-100 truncate">
                            {person.title}
                          </span>
                          {isNew && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-600 text-white">
                              جدید
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {person.department}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{person.name}</span>
                          <span>•</span>
                          <span>سرپرست: {parent ? parent.name : '—'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-end">
                          <div className="text-[10px] text-slate-400 font-bold">حقوق سناریو</div>
                          <div className="flex items-center gap-1 font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                            <input
                              type="number"
                              step={2000000}
                              value={person.salary || 30000000}
                              onChange={(e) => handleUpdateSalary(person.id, Number(e.target.value))}
                              className="w-24 px-1.5 py-0.5 text-center text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                            />
                            <span className="text-[10px] text-slate-400">ت</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMock(person.id)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                          title="حذف جایگاه در سناریو"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Col: Change Log & Executive Summary */}
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col">
            <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 mb-2 flex items-center justify-between">
              <span>گزارش تغییرات سناریو</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold">
                {detectedChanges.length} تغییر
              </span>
            </h3>

            {detectedChanges.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-bold">هنوز تغییری ایجاد نشده است.</p>
                <p className="text-[11px] mt-1 text-slate-500">
                  سمتی جدید بیافزایید یا حقوق و سرپرست‌ها را تغییر دهید تا اثرات بودجه‌ای را ببینید.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pe-1 max-h-[340px]">
                {detectedChanges.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-200">{ch.description}</div>
                    {ch.payrollDelta !== 0 && (
                      <div className="text-[10px] font-mono font-bold flex items-center justify-between text-slate-500">
                        <span>اثر بودجه‌ای:</span>
                        <span
                          className={
                            ch.payrollDelta > 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {ch.payrollDelta > 0 ? '+' : ''}
                          {(ch.payrollDelta / 1000000).toLocaleString()} م.ت
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-800 space-y-2">
              {appliedSuccess ? (
                <div className="p-3 rounded-2xl bg-emerald-600 text-white text-center text-xs font-black flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>سناریو با موفقیت روی چارت اصلی اعمال شد!</span>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={detectedChanges.length === 0}
                  className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                    detectedChanges.length === 0
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:scale-[1.01]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعمال رسمی سناریو روی چارت سازمان</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

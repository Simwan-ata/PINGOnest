import React, { useState, useMemo } from 'react';
import {
  X,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Layers,
  ShieldAlert,
  ArrowRight,
  GitMerge,
  UserMinus,
  CheckCircle2
} from 'lucide-react';
import { PersonNode } from '../types/pingonest';
import { computeOrgKpis, computeNetworkCentrality } from '../services/analyticsService';
import { NetworkCentrality } from '../types/pingonest';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: PersonNode[];
  isRtl: boolean;
}

export default function AnalyticsModal({
  isOpen,
  onClose,
  people,
  isRtl
}: AnalyticsModalProps) {
  if (!isOpen) return null;

  const kpis = useMemo(() => computeOrgKpis(people), [people]);
  const network = useMemo(() => computeNetworkCentrality(people), [people]);

  // Tabs State
  const [scenarioTab, setScenarioTab] = useState<'OVERVIEW' | 'SPOF' | 'WHAT_IF' | 'NETWORK'>('OVERVIEW');

  // Departure Simulation
  const [simPersonId, setSimPersonId] = useState<string>(people[0]?.id || '');

  // Dept Merge Simulation
  const departments = Array.from(new Set(people.map((p) => p.department)));
  const [mergeDeptA, setMergeDeptA] = useState<string>(departments[0] || '');
  const [mergeDeptB, setMergeDeptB] = useState<string>(departments[1] || departments[0] || '');

  // Simulation: Person Leaves
  const simPerson = people.find((p) => p.id === simPersonId);
  const simDirectReports = people.filter((p) => p.parentId === simPersonId);
  const simCascadeCount = simPerson ? simPerson.subCount : 0;
  const simCascadePercent = kpis.totalCount > 0 ? Math.round((simCascadeCount / kpis.totalCount) * 100) : 0;

  // Simulation: Dept Merge
  const deptAMembers = people.filter((p) => p.department === mergeDeptA);
  const deptBMembers = people.filter((p) => p.department === mergeDeptB);
  const combinedHeadcount = deptAMembers.length + deptBMembers.length;
  const deptASpan = kpis.deptStats.find((d) => d.dept === mergeDeptA)?.avgSpan || 0;
  const deptBSpan = kpis.deptStats.find((d) => d.dept === mergeDeptB)?.avgSpan || 0;
  const hasSpanWarning = deptASpan > 6 || deptBSpan > 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                {isRtl ? 'هوش سازمانی و تحلیل ساختاری عمیق' : 'Organizational Intelligence & Analytics'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isRtl
                  ? 'بررسی حوزه کنترل مدیران، شناسایی گلوگاه‌های کلیدی، زنجیره‌های تک‌نفره و سناریوسازی فرضی'
                  : 'Span of control, Single Point of Failure (SPOF) risks, and What-if Scenario Modeling'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => setScenarioTab('OVERVIEW')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  scenarioTab === 'OVERVIEW'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isRtl ? 'شاخص‌های کلیدی (KPIs)' : 'Overview'}
              </button>
              <button
                onClick={() => setScenarioTab('SPOF')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  scenarioTab === 'SPOF'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isRtl ? 'ریسک تمرکز (SPOF)' : 'Concentration Risk'}
              </button>
              <button
                onClick={() => setScenarioTab('WHAT_IF')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  scenarioTab === 'WHAT_IF'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isRtl ? 'سناریوسازی فرضی (What-If)' : 'What-If Scenarios'}
              </button>
              <button
                onClick={() => setScenarioTab('NETWORK')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  scenarioTab === 'NETWORK'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isRtl ? 'مرکزیت و پل‌های ارتباطی' : 'Network & Bridges'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {scenarioTab === 'OVERVIEW' && (
            <>
              {/* KPI Stat Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">کل پرسنل فعال</span>
                  <div className="font-black text-2xl text-slate-900 dark:text-slate-100 mt-1">
                    {kpis.totalCount} <span className="text-xs font-semibold text-emerald-600">({kpis.activeCount} فعال)</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">میانگین حوزه کنترل (Span)</span>
                  <div className="font-black text-2xl text-slate-900 dark:text-slate-100 mt-1">
                    {kpis.avgSpanOfControl} <span className="text-xs font-semibold text-slate-600">نفر به ازای هر مدیر</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">تعداد سطوح سلسله‌مراتب</span>
                  <div className="font-black text-2xl text-slate-900 dark:text-slate-100 mt-1">
                    {kpis.maxLevel} <span className="text-xs font-semibold text-slate-600">لایه سازمانی</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">مجموع حقوق و دستمزد</span>
                  <div className="font-black text-xl text-slate-900 dark:text-slate-100 mt-1 font-mono">
                    {(kpis.totalPayroll / 1000000).toLocaleString()}M <span className="text-xs font-semibold text-slate-600">ریال</span>
                  </div>
                </div>
              </div>

              {/* Department Statistics Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
                  <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    {isRtl ? 'تحلیل تفکیکی دپارتمان‌ها و حوزه‌های مدیریتی' : 'Departmental Breakdown'}
                  </h4>
                  <span className="text-xs text-slate-600">{kpis.departmentCount} دپارتمان ثبت‌شده</span>
                </div>
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b">
                    <tr>
                      <th className="p-3">دپارتمان</th>
                      <th className="p-3">تعداد نیرو</th>
                      <th className="p-3">تعداد مدیران</th>
                      <th className="p-3">میانگین زیرمجموعه مستقیم</th>
                      <th className="p-3">سهم حقوق دپارتمان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {kpis.deptStats.map((d) => (
                      <tr key={d.dept} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{d.dept}</td>
                        <td className="p-3 font-semibold">{d.count} نفر</td>
                        <td className="p-3">{d.managerCount} مدیر</td>
                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{d.avgSpan} نفر</td>
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400">
                          {(d.totalSalary / 1000000).toLocaleString()}M ریال
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Single Report Chains (Redundant Layer Warning) */}
              {kpis.singleReportChains.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900">
                  <h4 className="font-bold text-xs text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    زنجیره‌های گزارش‌دهی تک‌نفره (احتمال لایه اضافی یا گلوگاه ارتباطی)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {kpis.singleReportChains.map(({ manager, subordinate }) => (
                      <div
                        key={manager.id}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800 text-xs flex items-center justify-between"
                      >
                        <span className="font-bold">{manager.name} ({manager.title})</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                        <span>{subordinate.name} ({subordinate.title})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {scenarioTab === 'SPOF' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  ریسک تمرکز سازمانی و افراد کلیدی (Single Point of Failure - SPOF)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  افرادی که خروج غیرمترقبه یا غیبت آن‌ها بخش عظیمی از پرسنل و زنجیره عملیاتی را بدون سرپرست می‌گذارد.
                </p>
              </div>

              <div className="space-y-2.5">
                {kpis.spofRisks.map(({ person, cascadePercentage, directReports }) => (
                  <div
                    key={person.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 font-bold flex items-center justify-center text-sm">
                        {cascadePercentage}%
                      </div>
                      <div>
                        <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{person.name}</h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {person.title} • {person.department}
                        </p>
                      </div>
                    </div>

                    <div className="text-left text-xs">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100">
                        {person.subCount} نفر زیرمجموعه کل
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        {directReports} نفر گزارش مستقیم
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scenarioTab === 'WHAT_IF' && (
            <div className="space-y-6">
              {/* Scenario 1: Person Leaves */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <UserMinus className="w-5 h-5" />
                  سناریو ۱: اگر این شخص سازمان را ترک کند (شبیه‌سازی اثر آبشاری)
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={simPersonId}
                    onChange={(e) => setSimPersonId(e.target.value)}
                    className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.title} - {p.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                  <div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">زیرمجموعه‌های مستقیم متأثر</span>
                    <div className="font-black text-xl text-rose-600 mt-1">{simDirectReports.length} نفر</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">کل پرسنل متأثر در شاخه‌های پایین</span>
                    <div className="font-black text-xl text-amber-600 mt-1">{simCascadeCount} نفر</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">سهم از کل سازمان</span>
                    <div className="font-black text-xl text-indigo-600 mt-1">{simCascadePercent}%</div>
                  </div>
                </div>
              </div>

              {/* Scenario 2: Merge Departments */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <GitMerge className="w-5 h-5" />
                  سناریو ۲: ادغام فرضی دو دپارتمان سازمانی
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={mergeDeptA}
                    onChange={(e) => setMergeDeptA(e.target.value)}
                    className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        دپارتمان مبدأ: {d}
                      </option>
                    ))}
                  </select>
                  <select
                    value={mergeDeptB}
                    onChange={(e) => setMergeDeptB(e.target.value)}
                    className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        دپارتمان مقصد: {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>مجموع نیروهای ادغام‌شده: {combinedHeadcount} نفر</span>
                    <span className="text-emerald-600 font-mono">
                      مجموع بودجه: {((deptAMembers.reduce((a, b) => a + (b.salary || 0), 0) + deptBMembers.reduce((a, b) => a + (b.salary || 0), 0)) / 1000000).toLocaleString()}M ریال
                    </span>
                  </div>
                  {hasSpanWarning ? (
                    <div className="flex items-center gap-2 text-rose-600 text-xs font-bold pt-1">
                      <AlertTriangle className="w-4 h-4" />
                      هشدار: حداقل یکی از دپارتمان‌ها در حال حاضر حوزه کنترل بالایی دارد؛ ادغام ممکن است بار نظارتی مدیر را از آستانه مجاز فراتر ببرد.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      حوزه کنترل هر دو دپارتمان در محدوده مجاز و بهینه ارزیابی می‌شود.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {scenarioTab === 'NETWORK' && (
            <div className="space-y-6">
              {/* Network Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500">مجموع روابط همبستگی</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1">
                    {network.totalRelationships} <span className="text-xs font-semibold text-slate-500">رابطه</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500">روابط رسمی و وظیفه‌ای</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {network.formalCount} <span className="text-xs font-semibold text-slate-500">رسمی</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500">روابط غیررسمی و همکاری</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {network.informalCount} <span className="text-xs font-semibold text-slate-500">غیررسمی</span>
                  </div>
                </div>
              </div>

              {/* Two columns: Bridges vs Degree */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Key Bridges (Betweenness Centrality) */}
                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                      پل‌های ارتباطی کلیدی (Betweenness Centrality)
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      افرادی که بیشترین نقش را در وصل‌کردن بخش‌ها و دپارتمان‌های مختلف ایفا می‌کنند — خروج یا انزوای این افراد شبکه سازمانی را دچار گسست می‌کند.
                    </p>

                    <div className="space-y-2.5">
                      {network.betweennessRanking.length === 0 ? (
                        <div className="text-xs text-slate-400 p-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          هنوز روابط جانبی یا ماتریسی بین پرسنل ثبت نشده است. با راست‌کلیک روی افراد می‌توانید رابطه اضافه کنید.
                        </div>
                      ) : (
                        network.betweennessRanking.slice(0, 6).map((item, idx) => (
                          <div
                            key={item.person.id}
                            className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  {item.person.name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {item.person.title} • {item.person.department}
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-black text-xs">
                              شاخص: {item.bridgeScore}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Most Connected People (Degree Centrality) */}
                <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                      پرارتباط‌ترین افراد (Degree Centrality)
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      افرادی با بیشترین تعداد روابط ثبت‌شده مستقیم (مشاوره‌ای، پروژه‌ای، اطلاعاتی یا ماتریسی) در سراسر شرکت.
                    </p>

                    <div className="space-y-2.5">
                      {network.degreeRanking.length === 0 ? (
                        <div className="text-xs text-slate-400 p-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          هنوز روابط جانبی یا ماتریسی بین پرسنل ثبت نشده است.
                        </div>
                      ) : (
                        network.degreeRanking.slice(0, 6).map((item, idx) => (
                          <div
                            key={item.person.id}
                            className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  {item.person.name}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {item.person.title} • {item.person.department}
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-black text-xs">
                              {item.connections} اتصال
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

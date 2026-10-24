import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  AlertTriangle,
  Users,
  Clock,
  Layers,
  Calendar,
  Sliders,
  Filter,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  BarChart2,
  Activity,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { PersonNode, ProjectEntity, BpmnProcess } from '../types/pingonest';

interface DepartmentWorkloadVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: PersonNode[];
  projects?: ProjectEntity[];
  processes?: BpmnProcess[];
  isRtl?: boolean;
}

type TimeHorizon = 'monthly' | 'quarterly' | 'annual';
type ChartStyle = 'area' | 'bar' | 'composed';

const DEPT_COLORS: Record<string, string> = {
  'فنی و مهندسی': '#6366F1', // Indigo
  'مدیریت محصول': '#8B5CF6', // Purple
  'مارکتینگ و رشد': '#EC4899', // Pink
  'مالی و اداری': '#F59E0B', // Amber
  'منابع انسانی': '#10B981', // Emerald
  'حقوقی': '#06B6D4', // Cyan
  'هیئت مدیره': '#3B82F6', // Blue
  'عملیات': '#F97316' // Orange
};

const DEFAULT_COLOR = '#64748B';

export default function DepartmentWorkloadVisualizerModal({
  isOpen,
  onClose,
  people,
  projects = [],
  processes = [],
  isRtl = true
}: DepartmentWorkloadVisualizerModalProps) {
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('quarterly');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('area');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [growthStressFactor, setGrowthStressFactor] = useState<number>(15); // +15% default pipeline growth

  // Extract distinct departments and staff counts
  const departments = useMemo(() => {
    const map = new Map<string, number>();
    people.forEach((p) => {
      const d = p.department || (isRtl ? 'سایر' : 'Other');
      map.set(d, (map.get(d) || 0) + 1);
    });
    return Array.from(map.entries()).map(([dept, count]) => ({ dept, count }));
  }, [people, isRtl]);

  // Compute baseline capacity and workloads for departments
  const departmentWorkloads = useMemo(() => {
    return departments.map(({ dept, count }) => {
      // 160 hours per FTE per month
      const monthlyFteCapacity = count * 160;

      // Project allocation from people in this department
      const deptMembers = people.filter((p) => p.department === dept);
      const totalProjectHours = deptMembers.reduce((acc, person) => {
        const roles = person.projectRoles || [];
        const personAllocSum = roles.reduce((sum, r) => sum + (r.allocation || 0), 0);
        // Allocation is percentage of work time (160h * alloc%)
        return acc + Math.round((160 * personAllocSum) / 100);
      }, 0);

      // BPMN process tasks mapped to this department
      const deptProcesses = processes.filter((proc) =>
        proc.lanes?.some((lane) => lane.department === dept)
      );
      const routineOpsHours = Math.round(deptMembers.length * 100 + deptProcesses.length * 25);

      const baselineMonthlyHours = totalProjectHours + routineOpsHours;
      const baselineUtilization = monthlyFteCapacity > 0 ? Math.round((baselineMonthlyHours / monthlyFteCapacity) * 100) : 0;

      return {
        dept,
        count,
        monthlyFteCapacity,
        routineOpsHours,
        totalProjectHours,
        baselineMonthlyHours,
        baselineUtilization,
        color: DEPT_COLORS[dept] || DEFAULT_COLOR
      };
    });
  }, [departments, people, processes]);

  // Generate forecasted time-series data based on horizon and stress growth
  const forecastedData = useMemo(() => {
    const growthMultiplier = 1 + growthStressFactor / 100;

    if (timeHorizon === 'quarterly') {
      const quarters = [
        { key: 'Q1 (بهار)', labelEn: 'Q1 (Spring)', factor: 1.0 },
        { key: 'Q2 (تابستان)', labelEn: 'Q2 (Summer)', factor: 1.08 * growthMultiplier },
        { key: 'Q3 (پاییز)', labelEn: 'Q3 (Autumn)', factor: 1.18 * growthMultiplier },
        { key: 'Q4 (زمستان)', labelEn: 'Q4 (Winter)', factor: 1.25 * growthMultiplier }
      ];

      return quarters.map((q) => {
        const row: Record<string, any> = {
          period: isRtl ? q.key : q.labelEn
        };

        let totalOrgWorkload = 0;
        let totalOrgCapacity = 0;

        departmentWorkloads.forEach((d) => {
          // Quarterly capacity = 3 months
          const qCapacity = d.monthlyFteCapacity * 3;
          // Projected workload with seasonal ramping
          const qWorkload = Math.round(d.baselineMonthlyHours * 3 * q.factor);
          const qUtil = qCapacity > 0 ? Math.round((qWorkload / qCapacity) * 100) : 0;

          row[d.dept] = qWorkload;
          row[`${d.dept}_util`] = qUtil;
          row[`${d.dept}_cap`] = qCapacity;

          totalOrgWorkload += qWorkload;
          totalOrgCapacity += qCapacity;
        });

        row['کل بار کاری'] = totalOrgWorkload;
        row['کل ظرفیت'] = totalOrgCapacity;
        row['میانگین بهره‌وری'] = totalOrgCapacity > 0 ? Math.round((totalOrgWorkload / totalOrgCapacity) * 100) : 0;

        return row;
      });
    }

    if (timeHorizon === 'monthly') {
      const months = isRtl
        ? ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
        : ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12'];

      return months.map((m, index) => {
        // Progressive curve with peak in Q3/Q4
        const curveFactor = 1 + (index / 11) * 0.3 * growthMultiplier;
        const row: Record<string, any> = {
          period: m
        };

        let totalOrgWorkload = 0;
        let totalOrgCapacity = 0;

        departmentWorkloads.forEach((d) => {
          const mCapacity = d.monthlyFteCapacity;
          const mWorkload = Math.round(d.baselineMonthlyHours * curveFactor);
          const mUtil = mCapacity > 0 ? Math.round((mWorkload / mCapacity) * 100) : 0;

          row[d.dept] = mWorkload;
          row[`${d.dept}_util`] = mUtil;
          row[`${d.dept}_cap`] = mCapacity;

          totalOrgWorkload += mWorkload;
          totalOrgCapacity += mCapacity;
        });

        row['کل بار کاری'] = totalOrgWorkload;
        row['کل ظرفیت'] = totalOrgCapacity;
        row['میانگین بهره‌وری'] = totalOrgCapacity > 0 ? Math.round((totalOrgWorkload / totalOrgCapacity) * 100) : 0;

        return row;
      });
    }

    // Annual 3-year strategic horizon
    const years = [
      { key: 'سال جاری (۱۴۰۴)', labelEn: 'Current Year', factor: 1.0 },
      { key: 'سال آینده (۱۴۰۵)', labelEn: 'Year 2 (Projected)', factor: 1.22 * growthMultiplier },
      { key: 'افق سه ساله (۱۴۰۶)', labelEn: 'Year 3 (Long-term)', factor: 1.48 * growthMultiplier }
    ];

    return years.map((y) => {
      const row: Record<string, any> = {
        period: isRtl ? y.key : y.labelEn
      };

      let totalOrgWorkload = 0;
      let totalOrgCapacity = 0;

      departmentWorkloads.forEach((d) => {
        const yCapacity = d.monthlyFteCapacity * 12;
        const yWorkload = Math.round(d.baselineMonthlyHours * 12 * y.factor);
        const yUtil = yCapacity > 0 ? Math.round((yWorkload / yCapacity) * 100) : 0;

        row[d.dept] = yWorkload;
        row[`${d.dept}_util`] = yUtil;
        row[`${d.dept}_cap`] = yCapacity;

        totalOrgWorkload += yWorkload;
        totalOrgCapacity += yCapacity;
      });

      row['کل بار کاری'] = totalOrgWorkload;
      row['کل ظرفیت'] = totalOrgCapacity;
      row['میانگین بهره‌وری'] = totalOrgCapacity > 0 ? Math.round((totalOrgWorkload / totalOrgCapacity) * 100) : 0;

      return row;
    });
  }, [timeHorizon, growthStressFactor, departmentWorkloads, isRtl]);

  // Overall KPI highlights
  const kpis = useMemo(() => {
    if (departmentWorkloads.length === 0) {
      return { peakDept: 'نامشخص', bottleneckDept: 'نامشخص', avgUtil: 0, overUtilCount: 0 };
    }

    const sortedByUtil = [...departmentWorkloads].sort((a, b) => b.baselineUtilization - a.baselineUtilization);
    const peak = sortedByUtil[0];
    const totalCap = departmentWorkloads.reduce((acc, d) => acc + d.monthlyFteCapacity, 0);
    const totalLoad = departmentWorkloads.reduce((acc, d) => acc + d.baselineMonthlyHours, 0);
    const avgUtil = totalCap > 0 ? Math.round((totalLoad / totalCap) * 100) : 0;
    const overUtil = departmentWorkloads.filter((d) => d.baselineUtilization > 95);

    return {
      peakDept: peak?.dept || '—',
      peakUtil: peak?.baselineUtilization || 0,
      avgUtil,
      overUtilCount: overUtil.length,
      totalHeadcount: people.length
    };
  }, [departmentWorkloads, people]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-6xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isRtl ? 'ویژوالایزر پیش‌بینی بار کاری دپارتمان‌ها (Workload Forecast)' : 'Department Workload Forecast Visualizer'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono font-bold">
                  Recharts Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {isRtl
                  ? 'شبیه‌سازی بار کاری تعهدشده و پیش‌بینی تقاضای پروژه‌ها، ظرفیت نیروی انسانی و گلوگاه‌های سازمانی'
                  : 'Multi-horizon workload forecast, resource capacity vs demand, and bottleneck detection'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/50">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>{isRtl ? 'میانگین بهره‌وری سازمانی' : 'Avg Org Utilization'}</span>
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {kpis.avgUtil}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {kpis.avgUtil > 90
                ? (isRtl ? '⚠️ نزدیک به مرز اشباع' : 'High pressure')
                : (isRtl ? '✓ در محدوده ظرفیت بهینه' : 'Optimal capacity')}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>{isRtl ? 'دپارتمان با بیشترین بار کاری' : 'Peak Department'}</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1 truncate">
              {kpis.peakDept}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isRtl ? `اشغال کاری فعلی: ${kpis.peakUtil}%` : `Peak load: ${kpis.peakUtil}%`}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>{isRtl ? 'دپارتمان‌های در مرز اضافه‌بار' : 'Overcapacity Units'}</span>
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {kpis.overUtilCount} {isRtl ? 'واحد' : 'Depts'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {kpis.overUtilCount > 0
                ? (isRtl ? 'ریسک سوختگی شغلی و تاخیر پروژه' : 'Burnout risk')
                : (isRtl ? 'توازن توزیع منابع' : 'Balanced')}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span>{isRtl ? 'تعداد کل پرسنل فعال' : 'Total Workforce FTE'}</span>
              <Users className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {kpis.totalHeadcount} {isRtl ? 'نفر' : 'Staff'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isRtl ? `${departmentWorkloads.length} دپارتمان فعال` : `${departmentWorkloads.length} Active Departments`}
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setTimeHorizon('monthly')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                timeHorizon === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isRtl ? 'ماهانه (۱۲ ماه)' : 'Monthly'}
            </button>
            <button
              onClick={() => setTimeHorizon('quarterly')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                timeHorizon === 'quarterly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isRtl ? 'فصلی (۴ فصل)' : 'Quarterly'}
            </button>
            <button
              onClick={() => setTimeHorizon('annual')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                timeHorizon === 'annual'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isRtl ? 'استراتژیک ۳ ساله' : '3-Year Annual'}
            </button>
          </div>

          {/* Department Filter & Chart Style Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">{isRtl ? 'دپارتمان:' : 'Dept:'}</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">{isRtl ? 'همه دپارتمان‌ها (چندگانه)' : 'All Departments'}</option>
                {departmentWorkloads.map((d) => (
                  <option key={d.dept} value={d.dept}>
                    {d.dept} ({d.count} نفر)
                  </option>
                ))}
              </select>
            </div>

            {/* Chart Style Switch */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => setChartStyle('area')}
                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all ${
                  chartStyle === 'area'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500'
                }`}
                title="Area Chart"
              >
                {isRtl ? 'ناحیه‌ای (Area)' : 'Area'}
              </button>
              <button
                onClick={() => setChartStyle('bar')}
                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all ${
                  chartStyle === 'bar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500'
                }`}
                title="Bar Chart"
              >
                {isRtl ? 'میله‌ای (Bar)' : 'Bar'}
              </button>
              <button
                onClick={() => setChartStyle('composed')}
                className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all ${
                  chartStyle === 'composed'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500'
                }`}
                title="Composed Chart"
              >
                {isRtl ? 'ترکیبی (Composed)' : 'Composed'}
              </button>
            </div>
          </div>

          {/* Stress Test Growth Slider */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              {isRtl ? 'تست رشد تقاضا:' : 'Growth Stress:'}
            </span>
            <input
              type="range"
              min="-20"
              max="60"
              step="5"
              value={growthStressFactor}
              onChange={(e) => setGrowthStressFactor(Number(e.target.value))}
              className="w-20 accent-indigo-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-indigo-600 text-xs">
              {growthStressFactor > 0 ? `+${growthStressFactor}%` : `${growthStressFactor}%`}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Visualizer Chart (Recharts) */}
          <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isRtl ? 'روند تغییرات بار کاری پیش‌بینی‌شده (بر حسب ساعت کار)' : 'Workload Forecast Trend (Hours)'}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedDept === 'all'
                    ? (isRtl ? 'نمایش همزمان تمام دپارتمان‌ها بر حسب ساعت کار در افق انتخابی' : 'All departments projected hours')
                    : (isRtl ? `پیش‌بینی اختصاصی برای واحد «${selectedDept}»` : `Detailed projection for ${selectedDept}`)}
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-slate-400">
                1 FTE = 160 hrs/mo
              </div>
            </div>

            {/* Recharts Container */}
            <div className="w-full h-72 sm:h-84" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                {chartStyle === 'area' ? (
                  <AreaChart data={forecastedData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                      {departmentWorkloads.map((d) => (
                        <linearGradient key={`grad_${d.dept}`} id={`grad_${d.dept}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={d.color} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={d.color} stopOpacity={0.05} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                    <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#F8FAFC',
                        fontSize: '11px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {selectedDept === 'all' ? (
                      departmentWorkloads.map((d) => (
                        <Area
                          key={d.dept}
                          type="monotone"
                          dataKey={d.dept}
                          stroke={d.color}
                          fillOpacity={1}
                          fill={`url(#grad_${d.dept})`}
                          strokeWidth={2}
                        />
                      ))
                    ) : (
                      <>
                        <Area
                          type="monotone"
                          dataKey={selectedDept}
                          stroke={DEPT_COLORS[selectedDept] || '#6366F1'}
                          fillOpacity={1}
                          fill={`url(#grad_${selectedDept})`}
                          strokeWidth={2.5}
                        />
                        <Line
                          type="stepAfter"
                          dataKey={`${selectedDept}_cap`}
                          name={isRtl ? `ظرفیت اسمی (${selectedDept})` : `Max Capacity (${selectedDept})`}
                          stroke="#EF4444"
                          strokeDasharray="5 5"
                          strokeWidth={2}
                        />
                      </>
                    )}
                  </AreaChart>
                ) : chartStyle === 'bar' ? (
                  <BarChart data={forecastedData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                    <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#F8FAFC',
                        fontSize: '11px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {selectedDept === 'all' ? (
                      departmentWorkloads.map((d) => (
                        <Bar key={d.dept} dataKey={d.dept} fill={d.color} radius={[6, 6, 0, 0]} />
                      ))
                    ) : (
                      <>
                        <Bar
                          dataKey={selectedDept}
                          fill={DEPT_COLORS[selectedDept] || '#6366F1'}
                          radius={[6, 6, 0, 0]}
                        />
                        <Line
                          type="monotone"
                          dataKey={`${selectedDept}_cap`}
                          name={isRtl ? 'ظرفیت اسمی' : 'Capacity'}
                          stroke="#EF4444"
                          strokeWidth={2}
                        />
                      </>
                    )}
                  </BarChart>
                ) : (
                  <ComposedChart data={forecastedData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                    <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} />
                    <YAxis yAxisId="left" stroke="#94A3B8" fontSize={11} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={11} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '12px',
                        border: '1px solid #334155',
                        color: '#F8FAFC',
                        fontSize: '11px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <ReferenceLine yAxisId="right" y={100} stroke="#EF4444" strokeDasharray="3 3" label="100% Saturation" />

                    <Bar yAxisId="left" dataKey="کل بار کاری" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    <Line yAxisId="left" type="monotone" dataKey="کل ظرفیت" stroke="#10B981" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="میانگین بهره‌وری" stroke="#F59E0B" strokeWidth={2.5} />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Department Capacity Table & Recommendations */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center justify-between">
              <span>{isRtl ? 'جدول تحلیل تفصیلی ظرفیت و پیش‌بینی شکاف نیروی کار (Headcount Gap Analysis)' : 'Department Capacity & Gap Analysis Table'}</span>
              <span className="text-xs font-normal text-slate-500">
                {isRtl ? 'مرتب‌شده بر اساس درصد بهره‌وری' : 'Sorted by Utilization'}
              </span>
            </h4>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs text-xs">
              <table className="w-full text-start border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3 text-start font-bold">{isRtl ? 'دپارتمان' : 'Department'}</th>
                    <th className="p-3 text-start font-bold">{isRtl ? 'نیروی فعال (FTE)' : 'Active FTE'}</th>
                    <th className="p-3 text-start font-bold">{isRtl ? 'ظرفیت اسمی ماهانه' : 'Monthly Capacity'}</th>
                    <th className="p-3 text-start font-bold">{isRtl ? 'بار کاری پروژه‌ها' : 'Project Load'}</th>
                    <th className="p-3 text-start font-bold">{isRtl ? 'عملیات جاری' : 'Routine Ops'}</th>
                    <th className="p-3 text-start font-bold">{isRtl ? 'نرخ بهره‌وری' : 'Utilization %'}</th>
                    <th className="p-3 text-start font-bold">{isRtl ? 'پیش‌بینی کسری/مازاد نیرو' : 'FTE Gap Forecast'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {departmentWorkloads.map((d) => {
                    const projectedLoad = Math.round(d.baselineMonthlyHours * (1 + growthStressFactor / 100));
                    const gapHours = projectedLoad - d.monthlyFteCapacity;
                    const fteGap = Math.round((gapHours / 160) * 10) / 10;
                    const isOver = d.baselineUtilization > 95;
                    const isOptimal = d.baselineUtilization >= 70 && d.baselineUtilization <= 95;

                    return (
                      <tr key={d.dept} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span>{d.dept}</span>
                        </td>
                        <td className="p-3 font-mono">{d.count} نفر</td>
                        <td className="p-3 font-mono">{d.monthlyFteCapacity.toLocaleString('fa-IR')} ساعت</td>
                        <td className="p-3 font-mono">{d.totalProjectHours.toLocaleString('fa-IR')} ساعت</td>
                        <td className="p-3 font-mono">{d.routineOpsHours.toLocaleString('fa-IR')} ساعت</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, d.baselineUtilization)}%`,
                                  backgroundColor: isOver ? '#EF4444' : isOptimal ? '#10B981' : '#F59E0B'
                                }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[11px]">{d.baselineUtilization}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {fteGap > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold font-mono">
                              +{fteGap} {isRtl ? 'نفر کمبود' : 'FTE Shortage'}
                            </span>
                          ) : fteGap < -0.5 ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold font-mono">
                              {Math.abs(fteGap)} {isRtl ? 'نفر ظرفیت آزاد' : 'FTE Available'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                              {isRtl ? 'متعادل' : 'Balanced'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              {isRtl
                ? 'محاسبات پیش‌بینی بر مبنای استانداردهای ارگونومی کاری ۱۶۰ ساعت در ماه برای هر FTE'
                : 'Forecast calculations based on 160 hrs/month standard FTE capacity'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors"
          >
            {isRtl ? 'بستن ویژوالایزر' : 'Close Visualizer'}
          </button>
        </div>
      </div>
    </div>
  );
}

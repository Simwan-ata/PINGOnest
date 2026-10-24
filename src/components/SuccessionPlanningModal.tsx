import React, { useState, useMemo } from 'react';
import {
  X,
  Award,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  Building
} from 'lucide-react';
import { PersonNode, SuccessorEntry } from '../types/pingonest';
import PersonAvatar from './PersonAvatar';

interface SuccessionPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: PersonNode[];
  onUpdatePerson: (person: PersonNode) => void;
  isRtl: boolean;
}

interface NineBoxConfig {
  id: string;
  titleFa: string;
  descFa: string;
  bgLight: string;
  bgDark: string;
  textColor: string;
  borderColor: string;
  minPerf: number;
  maxPerf: number;
  minPot: number;
  maxPot: number;
}

const NINE_BOX_CELLS: NineBoxConfig[] = [
  // Row 1 (High Potential)
  {
    id: 'rough_diamond',
    titleFa: 'الماس نتراشیده (Rough Diamond)',
    descFa: 'پتانسیل بسیار بالا، عملکرد هنوز تثبیت نشده',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800',
    minPerf: 1,
    maxPerf: 2.5,
    minPot: 3.8,
    maxPot: 5.0
  },
  {
    id: 'growth_engine',
    titleFa: 'ستاره در حال رشد (Growth Engine)',
    descFa: 'عملکرد خوب و ظرفیت رشد به سطوح ارشد',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/30',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    minPerf: 2.6,
    maxPerf: 3.7,
    minPot: 3.8,
    maxPot: 5.0
  },
  {
    id: 'star',
    titleFa: 'ستاره سازمان (Top Star / Leader)',
    descFa: 'رهبران آینده سازمان، عملکرد و پتانسیل ممتاز',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/30',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    minPerf: 3.8,
    maxPerf: 5.0,
    minPot: 3.8,
    maxPot: 5.0
  },

  // Row 2 (Medium Potential)
  {
    id: 'dilemma',
    titleFa: 'نیازمند هدایت (Dilemma)',
    descFa: 'پتانسیل متوسط، نیاز به ارتقای عملکرد',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-800/40',
    textColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-700',
    minPerf: 1,
    maxPerf: 2.5,
    minPot: 2.5,
    maxPot: 3.7
  },
  {
    id: 'core_player',
    titleFa: 'مهره کلیدی هسته (Core Player)',
    descFa: 'ستون‌های باثبات سازمان با عملکرد مطمئن',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    minPerf: 2.6,
    maxPerf: 3.7,
    minPot: 2.5,
    maxPot: 3.7
  },
  {
    id: 'high_performer',
    titleFa: 'متخصص با عملکرد عالی (High Performer)',
    descFa: 'تسلط تخصصی بسیار بالا در شغل جاری',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-950/30',
    textColor: 'text-teal-700 dark:text-teal-300',
    borderColor: 'border-teal-200 dark:border-teal-800',
    minPerf: 3.8,
    maxPerf: 5.0,
    minPot: 2.5,
    maxPot: 3.7
  },

  // Row 3 (Low Potential)
  {
    id: 'risk',
    titleFa: 'منطقه ریسک (Underperformer)',
    descFa: 'عملکرد ضعیف و پتانسیل اندک، نیازمند برنامه بهبود',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/30',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200 dark:border-rose-800',
    minPerf: 1,
    maxPerf: 2.5,
    minPot: 1,
    maxPot: 2.4
  },
  {
    id: 'effective',
    titleFa: 'شاغل موثر (Effective Contributor)',
    descFa: 'عملکرد قابل قبول برای سمت فعلی',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-800/40',
    textColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-700',
    minPerf: 2.6,
    maxPerf: 3.7,
    minPot: 1,
    maxPot: 2.4
  },
  {
    id: 'trusted_expert',
    titleFa: 'متخصص مجرب (Trusted Expert)',
    descFa: 'با سابقه‌ترین و متخصص‌ترین افراد در نقش خود',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-950/30',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    minPerf: 3.8,
    maxPerf: 5.0,
    minPot: 1,
    maxPot: 2.4
  }
];

export default function SuccessionPlanningModal({
  isOpen,
  onClose,
  people,
  onUpdatePerson,
  isRtl
}: SuccessionPlanningModalProps) {
  const [activeTab, setActiveTab] = useState<'spof' | '9box' | 'pipeline'>('spof');
  const [selectedPersonId, setSelectedPersonId] = useState<string>(people[0]?.id || '');
  const [searchFilter, setSearchFilter] = useState('');
  const [newSuccessorId, setNewSuccessorId] = useState('');
  const [newReadiness, setNewReadiness] = useState<'ready_now' | 'ready_1_year' | 'ready_3_years'>('ready_now');

  // Augment people with realistic default scores if not explicitly provided
  const enrichedPeople = useMemo(() => {
    return people.map((p, idx) => {
      // Deterministic generation based on hash of id
      const hash = p.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const perf = p.performanceScore ?? Math.min(5, Math.max(2, 2.5 + ((hash % 25) / 10)));
      const pot = p.potentialScore ?? Math.min(5, Math.max(1.8, 2.0 + (((hash * 3) % 30) / 10)));
      return {
        ...p,
        performanceScore: Number(perf.toFixed(1)),
        potentialScore: Number(pot.toFixed(1))
      };
    });
  }, [people]);

  // Selected person
  const selectedPerson = useMemo(() => {
    return enrichedPeople.find((p) => p.id === selectedPersonId) || enrichedPeople[0];
  }, [enrichedPeople, selectedPersonId]);

  // Critical Positions & Single Point of Failure (SPOF)
  const spofAnalysis = useMemo(() => {
    const criticalList: Array<{
      person: PersonNode;
      isSpof: boolean;
      successorsCount: number;
      riskLevel: 'critical' | 'high' | 'medium' | 'low';
    }> = [];

    enrichedPeople.forEach((p) => {
      const isExecutive = p.level <= 2;
      const isDirector = p.title.includes('مدیر') || p.title.includes('رئیس') || p.title.includes('معاون');
      const hasDirectReports = enrichedPeople.some((c) => c.parentId === p.id);
      const isCritical = isExecutive || (isDirector && hasDirectReports);

      if (isCritical) {
        const successorsCount = p.successors?.length || 0;
        const isSpof = successorsCount === 0;
        let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';

        if (isSpof && isExecutive) riskLevel = 'critical';
        else if (isSpof) riskLevel = 'high';
        else if (successorsCount === 1) riskLevel = 'medium';

        criticalList.push({
          person: p,
          isSpof,
          successorsCount,
          riskLevel
        });
      }
    });

    return criticalList.sort((a, b) => {
      const weight = { critical: 4, high: 3, medium: 2, low: 1 };
      return weight[b.riskLevel] - weight[a.riskLevel];
    });
  }, [enrichedPeople]);

  // 9-Box mapping
  const boxAssignments = useMemo(() => {
    const map = new Map<string, PersonNode[]>();
    NINE_BOX_CELLS.forEach((cell) => map.set(cell.id, []));

    enrichedPeople.forEach((p) => {
      const perf = p.performanceScore || 3;
      const pot = p.potentialScore || 3;

      for (const cell of NINE_BOX_CELLS) {
        if (perf >= cell.minPerf && perf <= cell.maxPerf && pot >= cell.minPot && pot <= cell.maxPot) {
          map.get(cell.id)?.push(p);
          return;
        }
      }
      // fallback to core player
      map.get('core_player')?.push(p);
    });

    return map;
  }, [enrichedPeople]);

  // Handle adding successor
  const handleAddSuccessor = () => {
    if (!selectedPerson || !newSuccessorId || newSuccessorId === selectedPerson.id) return;
    const currentSuccessors = selectedPerson.successors || [];
    if (currentSuccessors.some((s) => s.personId === newSuccessorId)) return;

    const updated: PersonNode = {
      ...selectedPerson,
      successors: [
        ...currentSuccessors,
        {
          personId: newSuccessorId,
          readiness: newReadiness,
          rating: 4
        }
      ]
    };
    onUpdatePerson(updated);
    setNewSuccessorId('');
  };

  const handleRemoveSuccessor = (targetId: string) => {
    if (!selectedPerson) return;
    const updated: PersonNode = {
      ...selectedPerson,
      successors: (selectedPerson.successors || []).filter((s) => s.personId !== targetId)
    };
    onUpdatePerson(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/25">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {isRtl ? 'جانشین‌پروری و ماتریس استعداد ۹گانه (Succession & 9-Box Grid)' : 'Succession & 9-Box Studio'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  مدیریت ریسک منابع انسانی
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                شناسایی نقاط بحرانی بدون جانشین (SPOF)، ماتریس ۹گانه شایستگی و آمادگی جانشینان پست‌های کلیدی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('spof')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'spof'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>تحلیل SPOF</span>
              </button>
              <button
                onClick={() => setActiveTab('9box')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === '9box'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ماتریس ۹گانه (9-Box)</span>
              </button>
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'pipeline'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>پایپ‌لاین جانشینان</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: SPOF & Critical Roles */}
          {activeTab === 'spof' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <span className="font-black">هشدار نقطه شکست بحرانی (Single Point of Failure):</span>
                  {' '}مشاغل کلیدی که هیچ جانشین مشخصی برای آن‌ها پیش‌بینی نشده است، در صورت ترک خدمت یا مرخصی ناگهانی فرد، کل زنجیره عملیاتی دپارتمان را متوقف می‌کنند.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {spofAnalysis.map(({ person, isSpof, successorsCount, riskLevel }) => (
                  <div
                    key={person.id}
                    onClick={() => {
                      setSelectedPersonId(person.id);
                      setActiveTab('pipeline');
                    }}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer hover:shadow-lg flex flex-col justify-between ${
                      riskLevel === 'critical'
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 hover:border-rose-500'
                        : riskLevel === 'high'
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 hover:border-amber-500'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            riskLevel === 'critical'
                              ? 'bg-rose-600 text-white animate-pulse'
                              : riskLevel === 'high'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {riskLevel === 'critical'
                            ? 'بسیار بحرانی (SPOF)'
                            : riskLevel === 'high'
                            ? 'ریسک بالا (بدون جانشین)'
                            : 'ریسک کنترل‌شده'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">سطح {person.level}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <PersonAvatar
                          name={person.name}
                          photo={person.photo}
                          size={40}
                          gender={person.gender}
                        />
                        <div className="min-w-0">
                          <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 truncate">
                            {person.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">{person.name}</p>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold truncate">
                            {person.department}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">تعداد جانشینان:</span>
                      <span
                        className={`font-black font-mono px-2 py-0.5 rounded-lg ${
                          successorsCount === 0
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                        }`}
                      >
                        {successorsCount} جانشین
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 9-Box Grid */}
          {activeTab === '9box' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>محور عمودی: پتانسیل رشد (Potential) • محور افقی: عملکرد فعلی (Performance)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  مجموع پرسنل ارزیابی‌شده: {enrichedPeople.length} نفر
                </span>
              </div>

              {/* 3x3 Grid */}
              <div className="grid grid-cols-3 gap-3">
                {NINE_BOX_CELLS.map((cell) => {
                  const assigned = boxAssignments.get(cell.id) || [];
                  return (
                    <div
                      key={cell.id}
                      className={`p-3.5 rounded-3xl border min-h-[160px] flex flex-col justify-between ${cell.bgLight} ${cell.bgDark} ${cell.borderColor}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-black ${cell.textColor}`}>{cell.titleFa}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono bg-white/80 dark:bg-slate-900/80 shadow-sm ${cell.textColor}`}
                          >
                            {assigned.length}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight mb-3">{cell.descFa}</p>
                      </div>

                      {/* People Chips */}
                      <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-[100px] overflow-y-auto">
                        {assigned.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedPersonId(p.id);
                              setActiveTab('pipeline');
                            }}
                            className="px-2 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 hover:scale-105 border border-slate-200/60 dark:border-slate-700/60 shadow-xs text-[10px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 transition-all"
                            title={`${p.name} - ${p.title}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="truncate max-w-[90px]">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Successor Pipeline Management */}
          {activeTab === 'pipeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Col: Target Position Selector */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                  انتخاب سمت هدف جهت جانشین‌پروری:
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="جستجوی سمت یا نام..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pe-1">
                  {enrichedPeople
                    .filter(
                      (p) =>
                        p.title.includes(searchFilter) ||
                        p.name.includes(searchFilter) ||
                        p.department.includes(searchFilter)
                    )
                    .map((p) => {
                      const isSelected = p.id === selectedPersonId;
                      const hasSuccessor = (p.successors?.length || 0) > 0;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPersonId(p.id)}
                          className={`p-2.5 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-black text-xs truncate">{p.title}</div>
                            <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                              {p.name} • {p.department}
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              hasSuccessor
                                ? isSelected
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : isSelected
                                ? 'bg-rose-500 text-white'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            }`}
                          >
                            {p.successors?.length || 0} جانشین
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Center & Right 2 Cols: Pipeline Details & Successor Form */}
              <div className="lg:col-span-2 space-y-4">
                {selectedPerson && (
                  <div className="p-4 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PersonAvatar
                        name={selectedPerson.name}
                        photo={selectedPerson.photo}
                        size={48}
                        gender={selectedPerson.gender}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                            {selectedPerson.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {selectedPerson.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          شاغل فعلی: {selectedPerson.name} • کد: #{selectedPerson.employeeCode || selectedPerson.id}
                        </p>
                      </div>
                    </div>

                    <div className="text-end">
                      <div className="text-[10px] text-slate-400 font-bold">امتیازات ارزیابی:</div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">
                        عملکرد: {selectedPerson.performanceScore} / ۵ • پتانسیل: {selectedPerson.potentialScore} / ۵
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Successor Form */}
                <div className="p-4 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
                  <div className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                    معرفی جانشین جدید برای این جایگاه:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={newSuccessorId}
                      onChange={(e) => setNewSuccessorId(e.target.value)}
                      className="sm:col-span-2 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    >
                      <option value="">انتخاب فرد واجد شرایط از کل سازمان...</option>
                      {enrichedPeople
                        .filter((p) => p.id !== selectedPerson?.id)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {p.title} ({p.department})
                          </option>
                        ))}
                    </select>

                    <select
                      value={newReadiness}
                      onChange={(e) => setNewReadiness(e.target.value as any)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    >
                      <option value="ready_now">آماده فوری (Ready Now)</option>
                      <option value="ready_1_year">آماده در ۱ الی ۲ سال</option>
                      <option value="ready_3_years">افق ۳ سال به بالا</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleAddSuccessor}
                      disabled={!newSuccessorId}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition-all ${
                        newSuccessorId
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ثبت جانشین در پایپ‌لاین</span>
                    </button>
                  </div>
                </div>

                {/* Successor Pipeline List */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                    جانشینان تعیین‌شده برای این پست ({selectedPerson?.successors?.length || 0} نفر):
                  </div>

                  {(!selectedPerson?.successors || selectedPerson.successors.length === 0) ? (
                    <div className="p-8 rounded-3xl border border-dashed border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20 text-center text-rose-600 dark:text-rose-400 space-y-1">
                      <AlertTriangle className="w-8 h-8 mx-auto opacity-60" />
                      <div className="font-black text-xs">هیچ جانشینی تعیین نشده است!</div>
                      <div className="text-[11px] opacity-80">این جایگاه در وضعیت بحرانی SPOF قرار دارد.</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPerson.successors.map((succ) => {
                        const personDetails = enrichedPeople.find((p) => p.id === succ.personId);
                        if (!personDetails) return null;

                        return (
                          <div
                            key={succ.personId}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <PersonAvatar
                                name={personDetails.name}
                                photo={personDetails.photo}
                                size={40}
                                gender={personDetails.gender}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-xs text-slate-900 dark:text-slate-100">
                                    {personDetails.name}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                      succ.readiness === 'ready_now'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                        : succ.readiness === 'ready_1_year'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    }`}
                                  >
                                    {succ.readiness === 'ready_now'
                                      ? 'آماده تصدی فوری'
                                      : succ.readiness === 'ready_1_year'
                                      ? 'آمادگی ۱ الی ۲ ساله'
                                      : 'افق ۳ ساله'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  {personDetails.title} • {personDetails.department}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveSuccessor(succ.personId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                              title="حذف جانشین"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

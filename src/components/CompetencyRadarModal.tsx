import React, { useState, useMemo } from 'react';
import {
  X,
  Target,
  Award,
  Sparkles,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Search,
  Sliders,
  Save,
  GraduationCap
} from 'lucide-react';
import { PersonNode, CompetencyScore } from '../types/pingonest';
import PersonAvatar from './PersonAvatar';

interface CompetencyRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: PersonNode[];
  onUpdatePerson: (person: PersonNode) => void;
  isRtl: boolean;
}

const DEFAULT_COMPETENCIES: CompetencyScore[] = [
  { name: 'رهبری و مدیریت تیم', category: 'leadership', requiredLevel: 4, currentLevel: 3.5 },
  { name: 'حل مسائل پیچیده', category: 'technical', requiredLevel: 4.5, currentLevel: 4 },
  { name: 'ارتباطات و مذاکره', category: 'soft', requiredLevel: 4, currentLevel: 4.5 },
  { name: 'مدیریت پروژه و زمان', category: 'domain', requiredLevel: 3.5, currentLevel: 3 },
  { name: 'تفکر استراتژیک', category: 'leadership', requiredLevel: 4, currentLevel: 3 },
  { name: 'تسلط فنی و ابزاری', category: 'technical', requiredLevel: 4.5, currentLevel: 4.5 },
  { name: 'تاب‌آوری و چابکی', category: 'soft', requiredLevel: 3.5, currentLevel: 4 }
];

export default function CompetencyRadarModal({
  isOpen,
  onClose,
  people,
  onUpdatePerson,
  isRtl
}: CompetencyRadarModalProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(people[0]?.id || '');
  const [searchFilter, setSearchFilter] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Selected person
  const selectedPerson = useMemo(() => {
    return people.find((p) => p.id === selectedPersonId) || people[0];
  }, [people, selectedPersonId]);

  // Current active competencies for selected person
  const [activeCompetencies, setActiveCompetencies] = useState<CompetencyScore[]>(() => {
    return selectedPerson?.competencies && selectedPerson.competencies.length > 0
      ? selectedPerson.competencies
      : DEFAULT_COMPETENCIES;
  });

  // When selected person changes, sync local state
  const handleSelectPerson = (id: string) => {
    setSelectedPersonId(id);
    const target = people.find((p) => p.id === id);
    if (target?.competencies && target.competencies.length > 0) {
      setActiveCompetencies(target.competencies);
    } else {
      // Generate realistic role-based profile
      const isLead = target?.level && target.level <= 2;
      const initial: CompetencyScore[] = DEFAULT_COMPETENCIES.map((c) => ({
        ...c,
        requiredLevel: isLead ? 4.5 : c.requiredLevel,
        currentLevel: Math.min(5, Math.max(2, c.currentLevel + (Math.random() > 0.5 ? 0.5 : -0.5)))
      }));
      setActiveCompetencies(initial);
    }
    setHasUnsavedChanges(false);
  };

  // Adjust rating
  const handleLevelChange = (index: number, newLevel: number) => {
    setActiveCompetencies((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], currentLevel: newLevel };
      return next;
    });
    setHasUnsavedChanges(true);
  };

  // Save changes back to person node
  const handleSave = () => {
    if (!selectedPerson) return;
    onUpdatePerson({
      ...selectedPerson,
      competencies: activeCompetencies
    });
    setHasUnsavedChanges(false);
  };

  // Math for Radar polygon
  const radarData = useMemo(() => {
    const total = activeCompetencies.length;
    const center = 150;
    const radius = 110;
    const angleStep = (Math.PI * 2) / total;

    // Background concentric polygon rings (levels 1 to 5)
    const rings = [1, 2, 3, 4, 5].map((lvl) => {
      const r = (radius / 5) * lvl;
      const points = Array.from({ length: total }).map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      });
      return { level: lvl, points: points.join(' ') };
    });

    // Required points
    const reqPoints = activeCompetencies.map((c, i) => {
      const r = (radius / 5) * c.requiredLevel;
      const angle = i * angleStep - Math.PI / 2;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    });

    // Current points
    const curPoints = activeCompetencies.map((c, i) => {
      const r = (radius / 5) * c.currentLevel;
      const angle = i * angleStep - Math.PI / 2;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    });

    // Label coordinates (extended slightly outside radius)
    const labels = activeCompetencies.map((c, i) => {
      const r = radius + 22;
      const angle = i * angleStep - Math.PI / 2;
      return {
        name: c.name,
        category: c.category,
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    });

    return {
      center,
      rings,
      reqPolygon: reqPoints.map((p) => `${p.x},${p.y}`).join(' '),
      curPolygon: curPoints.map((p) => `${p.x},${p.y}`).join(' '),
      curPoints,
      labels
    };
  }, [activeCompetencies]);

  // Overall Match Percentage
  const matchStats = useMemo(() => {
    let totalReq = 0;
    let totalCur = 0;
    const gaps: Array<{ name: string; gap: number; category: string }> = [];

    activeCompetencies.forEach((c) => {
      totalReq += c.requiredLevel;
      totalCur += Math.min(c.currentLevel, c.requiredLevel);
      if (c.currentLevel < c.requiredLevel) {
        gaps.push({
          name: c.name,
          gap: Number((c.requiredLevel - c.currentLevel).toFixed(1)),
          category: c.category
        });
      }
    });

    const matchPercent = totalReq > 0 ? Math.round((totalCur / totalReq) * 100) : 100;
    return { matchPercent, gaps };
  }, [activeCompetencies]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {isRtl ? 'رادار شایستگی‌ها و شکاف مهارت (Competency Radar & IDP)' : 'Competency Radar & Gap Analysis'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  توسعه فردی (IDP)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مقایسه راداری مهارت‌های موردنیاز شغل در برابر وضعیت شاغل و برنامه‌ریزی دوره‌های ارتقا
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all animate-pulse"
              >
                <Save className="w-3.5 h-3.5" />
                <span>ذخیره ارزیابی</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (3 Cols): Personnel Selector */}
          <div className="lg:col-span-3 p-3.5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-black text-slate-800 dark:text-slate-200">
              انتخاب پرسنل جهت ارزیابی:
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute top-2.5 start-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="جستجو..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full ps-8 pe-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="space-y-1 max-h-[460px] overflow-y-auto pe-1">
              {people
                .filter((p) => p.name.includes(searchFilter) || p.title.includes(searchFilter))
                .map((p) => {
                  const isSelected = p.id === selectedPersonId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPerson(p.id)}
                      className={`p-2 rounded-2xl cursor-pointer border transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-300'
                      }`}
                    >
                      <PersonAvatar
                        name={p.name}
                        photo={p.photo}
                        size={32}
                        gender={p.gender}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{p.name}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {p.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Center Column (5 Cols): Interactive SVG Spider Chart */}
          <div className="lg:col-span-5 p-4 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-amber-500" />
                  <span>سطح استاندارد سمت</span>
                </span>
                <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span>سطح فعلی شاغل</span>
                </span>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs font-black text-slate-800 dark:text-slate-200">
                <span>تطابق:</span>
                <span
                  className={`px-2 py-0.5 rounded-md ${
                    matchStats.matchPercent >= 80
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {matchStats.matchPercent}%
                </span>
              </div>
            </div>

            {/* Radar SVG Container */}
            <div className="w-full h-[320px] flex items-center justify-center my-2">
              <svg className="w-full h-full" viewBox="0 0 300 300">
                {/* Background Concentric Rings */}
                {radarData.rings.map((ring) => (
                  <polygon
                    key={ring.level}
                    points={ring.points}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700/60"
                    strokeWidth="1"
                    strokeDasharray={ring.level === 5 ? '0' : '2,2'}
                  />
                ))}

                {/* Spoke Axes */}
                {Array.from({ length: activeCompetencies.length }).map((_, i) => {
                  const angle = (i * Math.PI * 2) / activeCompetencies.length - Math.PI / 2;
                  const x = radarData.center + 110 * Math.cos(angle);
                  const y = radarData.center + 110 * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={radarData.center}
                      y1={radarData.center}
                      x2={x}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-700/60"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Required Polygon (Target standard) */}
                <polygon
                  points={radarData.reqPolygon}
                  fill="rgba(245, 158, 11, 0.12)"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />

                {/* Current Polygon (Actual employee) */}
                <polygon
                  points={radarData.curPolygon}
                  fill="rgba(20, 184, 166, 0.28)"
                  stroke="#0D9488"
                  strokeWidth="2.5"
                />

                {/* Vertex Dots */}
                {radarData.curPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#0D9488"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Text Labels */}
                {radarData.labels.map((lbl, i) => (
                  <text
                    key={i}
                    x={lbl.x}
                    y={lbl.y}
                    fontSize="9"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-600 dark:fill-slate-300 select-none"
                  >
                    {lbl.name}
                  </text>
                ))}
              </svg>
            </div>

            <div className="text-[10px] text-slate-400 text-center">
              امتیازدهی استاندارد بین ۱ (مبتدی) تا ۵ (استاد / مربی ارشد)
            </div>
          </div>

          {/* Right Column (4 Cols): Live Sliders & Gap Actions */}
          <div className="lg:col-span-4 space-y-4">
            {/* Sliders Box */}
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-teal-600" />
                  <span>تنظیم سطح شایستگی‌های شاغل</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">۱ الی ۵</span>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pe-1">
                {activeCompetencies.map((c, i) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[170px]">
                        {c.name}
                      </span>
                      <span className="font-mono text-[11px] font-black text-teal-600 dark:text-teal-400">
                        {c.currentLevel} / {c.requiredLevel}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={c.currentLevel}
                      onChange={(e) => handleLevelChange(i, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Gap Analysis & IDP Recommendations */}
            <div className="p-4 rounded-3xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-teal-900 dark:text-teal-200">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  <span>برنامه توسعه فردی پیشنهادی (IDP)</span>
                </span>
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
                  {matchStats.gaps.length} شکاف مهارت
                </span>
              </div>

              {matchStats.gaps.length === 0 ? (
                <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تطابق کامل! هیچ شکاف مهارتی در این شغل وجود ندارد.</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pe-1">
                  {matchStats.gaps.map((g) => (
                    <div
                      key={g.name}
                      className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-teal-100 dark:border-teal-900 text-[11px] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {g.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          نیاز به کارگاه آموزشی و مربیگری
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 font-black font-mono text-[10px] flex-shrink-0">
                        -{g.gap}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

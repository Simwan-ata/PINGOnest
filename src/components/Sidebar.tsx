import React from 'react';
import {
  Search,
  Filter,
  Users,
  Layers,
  CheckCircle,
  FolderKanban,
  Eye,
  Sliders,
  RotateCcw,
  Sparkles,
  Palette
} from 'lucide-react';
import { ViewSettings, FilterSettings, ProjectEntity, PersonNode } from '../types/pingonest';

interface SidebarProps {
  people: PersonNode[];
  projects: ProjectEntity[];
  viewSettings: ViewSettings;
  filterSettings: FilterSettings;
  onUpdateViewSettings: (settings: Partial<ViewSettings>) => void;
  onUpdateFilterSettings: (settings: Partial<FilterSettings>) => void;
  onResetFilters: () => void;
  isRtl: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  people,
  projects,
  viewSettings,
  filterSettings,
  onUpdateViewSettings,
  onUpdateFilterSettings,
  onResetFilters,
  isRtl,
  onToggleCollapse
}: SidebarProps) {
  const departments = Array.from(new Set(people.map((p) => p.department))).sort();
  const activeCount = people.filter((p) => p.status === 'فعال' || p.status === 'Active').length;
  const maxLevel = Math.max(...people.map((p) => p.level || 1), 1);

  const toggleDepartmentFilter = (dept: string) => {
    const next = new Set(filterSettings.departments);
    if (next.has(dept)) {
      next.delete(dept);
    } else {
      next.add(dept);
    }
    onUpdateFilterSettings({ departments: next });
  };

  return (
    <aside className="w-76 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between overflow-y-auto p-4 space-y-6 flex-shrink-0 z-20 animate-in slide-in-from-start-2 duration-150">
      <div className="space-y-5">
        {/* Quick Search & Collapse header */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {isRtl ? 'جستجوی هوشمند در چارت' : 'Search Organization'}
            </label>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isRtl ? 'بستن منوی کناری' : 'Collapse Sidebar'}
              >
                <RotateCcw className="w-3 h-3 hidden" />
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">✕</span>
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-600 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
            <input
              type="text"
              value={filterSettings.search}
              onChange={(e) => onUpdateFilterSettings({ search: e.target.value })}
              placeholder={isRtl ? 'نام، سمت یا دپارتمان...' : 'Name, title, or dept...'}
              className="w-full text-xs pr-9 pl-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">کل پرسنل</span>
              <div className="font-black text-xl text-slate-900 dark:text-slate-100 mt-0.5">
                {people.length} <span className="text-[10px] text-slate-600">نفر</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">دپارتمان‌ها</span>
              <div className="font-black text-xl text-indigo-600 dark:text-indigo-400 mt-0.5">
                {departments.length} <span className="text-[10px] text-slate-600">واحد</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">سطوح چارت</span>
              <div className="font-black text-xl text-purple-600 dark:text-purple-400 mt-0.5">
                {maxLevel} <span className="text-[10px] text-slate-600">لایه</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">نفرات فعال</span>
              <div className="font-black text-xl text-emerald-600 dark:text-emerald-400 mt-0.5">
                {activeCount} <span className="text-[10px] text-slate-600">نفر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Color-by Mode */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            {isRtl ? 'طیف رنگ‌بندی کارت‌ها' : 'Color Mode'}
          </label>
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => onUpdateViewSettings({ colorBy: 'department' })}
              className={`py-1.5 rounded-lg transition-all ${
                viewSettings.colorBy === 'department'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isRtl ? 'دپارتمان' : 'Department'}
            </button>
            <button
              onClick={() => onUpdateViewSettings({ colorBy: 'level' })}
              className={`py-1.5 rounded-lg transition-all ${
                viewSettings.colorBy === 'level'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isRtl ? 'سطح سازمانی' : 'Level'}
            </button>
          </div>
        </div>

        {/* Highlight Matrix Project */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            {isRtl ? 'برجسته‌سازی اعضای پروژه' : 'Highlight Project'}
          </label>
          <select
            value={filterSettings.projectHighlight}
            onChange={(e) => onUpdateFilterSettings({ projectHighlight: e.target.value })}
            className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="">{isRtl ? '— هیچ‌کدام (نمای عادی) —' : '— None —'}</option>
            {projects.map((proj) => (
              <option key={proj.name} value={proj.name}>
                {proj.name} ({proj.code})
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {isRtl ? 'فیلتر دپارتمان‌ها' : 'Departments'}
            </label>
            {filterSettings.departments.size > 0 && (
              <button
                onClick={() => onUpdateFilterSettings({ departments: new Set() })}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {isRtl ? 'انتخاب همه' : 'Select All'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {departments.map((dept) => {
              const count = people.filter((p) => p.department === dept).length;
              const isSelected =
                filterSettings.departments.size === 0 || filterSettings.departments.has(dept);

              return (
                <button
                  key={dept}
                  onClick={() => toggleDepartmentFilter(dept)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-700 opacity-60'
                  }`}
                >
                  <span className="truncate max-w-[130px]">{dept}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display Settings Toggles */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            {isRtl ? 'تنظیمات نمایش کارت‌ها' : 'Display Options'}
          </label>

          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <span>عکس پرسنلی</span>
            <input
              type="checkbox"
              checked={viewSettings.showPhoto}
              onChange={(e) => onUpdateViewSettings({ showPhoto: e.target.checked })}
              className="rounded accent-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <span>سمت و عنوان شغلی</span>
            <input
              type="checkbox"
              checked={viewSettings.showTitle}
              onChange={(e) => onUpdateViewSettings({ showTitle: e.target.checked })}
              className="rounded accent-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <span>شمارش زیرمجموعه‌ها</span>
            <input
              type="checkbox"
              checked={viewSettings.showSubCount}
              onChange={(e) => onUpdateViewSettings({ showSubCount: e.target.checked })}
              className="rounded accent-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <span>کد پرسنلی (#ID)</span>
            <input
              type="checkbox"
              checked={viewSettings.showId}
              onChange={(e) => onUpdateViewSettings({ showId: e.target.checked })}
              className="rounded accent-indigo-600"
            />
          </label>

          <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <span>حقوق ماهانه</span>
            <input
              type="checkbox"
              checked={viewSettings.showSalary}
              onChange={(e) => onUpdateViewSettings({ showSalary: e.target.checked })}
              className="rounded accent-indigo-600"
            />
          </label>

          {/* Level spacing slider */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              <span>فاصله عمودی لایه‌ها</span>
              <span className="font-mono text-indigo-600">{viewSettings.levelSpacing}px</span>
            </div>
            <input
              type="range"
              min="80"
              max="180"
              step="10"
              value={viewSettings.levelSpacing}
              onChange={(e) => onUpdateViewSettings({ levelSpacing: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Reset Filters & About PingoNest */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onResetFilters}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isRtl ? 'بازنشانی فیلترها' : 'Reset Filters'}
        </button>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 space-y-1">
          <div className="font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>PingoNest Pro</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-mono">v14-Intelligence</span>
          </div>
          <div>معماری و توسعه: علیرضا ترانه‌جو</div>
          <div className="text-[9px] text-slate-400 font-mono">alireza.taranejoo@gmail.com</div>
        </div>
      </div>
    </aside>
  );
}

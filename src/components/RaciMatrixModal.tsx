import React, { useState, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Download,
  Filter,
  Search,
  Users,
  GitBranch,
  ShieldAlert,
  Info,
  Sparkles,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { PersonNode, BpmnProcess, BpmnNode } from '../types/pingonest';
import PersonAvatar from './PersonAvatar';

export type RaciRole = 'R' | 'A' | 'S' | 'C' | 'I';

export interface RaciMatrixEntry {
  processId: string;
  processName: string;
  nodeId: string;
  nodeLabel: string;
  assignments: Record<string, RaciRole>; // personId -> 'R' | 'A' | 'S' | 'C' | 'I'
}

interface RaciMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: PersonNode[];
  processes: BpmnProcess[];
  onUpdateProcesses: (updatedProcesses: BpmnProcess[]) => void;
  isRtl: boolean;
}

const RACI_CONFIG: Record<RaciRole, { labelFa: string; labelEn: string; color: string; bg: string; descFa: string }> = {
  R: {
    labelFa: 'مسئول اجرا (Responsible)',
    labelEn: 'Responsible',
    color: '#0284C7',
    bg: '#E0F2FE',
    descFa: 'فرد یا پستی که کار را مستقیماً انجام می‌دهد و خروجی را تولید می‌کند.'
  },
  A: {
    labelFa: 'پاسخگوی نهایی (Accountable)',
    labelEn: 'Accountable',
    color: '#DC2626',
    bg: '#FEE2E2',
    descFa: 'تنها فردی که مسئولیت و پاسخگویی حقوقی نهایی را بر عهده دارد و تاییدکننده کار است (دقیقاً ۱ نفر در هر فعالیت).'
  },
  S: {
    labelFa: 'پشتیبان (Support)',
    labelEn: 'Support',
    color: '#059669',
    bg: '#D1FAE5',
    descFa: 'شخص یا تیمی که منابع کمکی، مشاوره عملی یا تسهیلات لازم برای اجرای کار را فراهم می‌کند.'
  },
  C: {
    labelFa: 'مشاور (Consulted)',
    labelEn: 'Consulted',
    color: '#7C3AED',
    bg: '#EDE9FE',
    descFa: 'متخصص صاحب‌نظر که قبل از تصمیم‌گیری یا اجرای فعالیت مورد مشورت دوطرفه قرار می‌گیرد.'
  },
  I: {
    labelFa: 'مطلع (Informed)',
    labelEn: 'Informed',
    color: '#D97706',
    bg: '#FEF3C7',
    descFa: 'افرادی که پس از اتمام فعالیت یا تصمیم‌گیری، از نتایج و وضعیت کار مطلع می‌گردند (اطلاع‌رسانی یک‌طرفه).'
  }
};

export default function RaciMatrixModal({
  isOpen,
  onClose,
  people,
  processes,
  onUpdateProcesses,
  isRtl
}: RaciMatrixModalProps) {
  if (!isOpen) return null;

  const [selectedProcessId, setSelectedProcessId] = useState<string>('all');
  const [searchTask, setSearchTask] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'AUDIT'>('MATRIX');

  // Filtered People
  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      if (selectedDept !== 'all' && p.department !== selectedDept) return false;
      return true;
    });
  }, [people, selectedDept]);

  // Extract all task activities from processes
  const tasks = useMemo(() => {
    const list: {
      processId: string;
      processName: string;
      node: BpmnNode;
    }[] = [];

    processes.forEach((proc) => {
      if (selectedProcessId !== 'all' && proc.id !== selectedProcessId) return;
      proc.nodes.forEach((n) => {
        if (n.type === 'task') {
          if (searchTask.trim()) {
            const q = searchTask.toLowerCase();
            if (!n.label.toLowerCase().includes(q) && !proc.name.toLowerCase().includes(q)) {
              return;
            }
          }
          list.push({
            processId: proc.id,
            processName: proc.name,
            node: n
          });
        }
      });
    });

    return list;
  }, [processes, selectedProcessId, searchTask]);

  // Audit Analysis: Find Governance Violations
  const auditResults = useMemo(() => {
    const noAccountable: { taskLabel: string; procName: string }[] = [];
    const multiAccountable: { taskLabel: string; procName: string; count: number }[] = [];
    const noResponsible: { taskLabel: string; procName: string }[] = [];
    const personWorkload: Record<string, { rCount: number; aCount: number; person: PersonNode }> = {};

    people.forEach((p) => {
      personWorkload[p.id] = { rCount: 0, aCount: 0, person: p };
    });

    processes.forEach((proc) => {
      proc.nodes.forEach((n) => {
        if (n.type === 'task') {
          const raci = n.raci;
          const accountableId = raci?.accountableId;
          const responsibleId = raci?.responsibleId || n.personId;

          // Check Accountable
          if (!accountableId) {
            noAccountable.push({ taskLabel: n.label, procName: proc.name });
          } else if (personWorkload[accountableId]) {
            personWorkload[accountableId].aCount += 1;
          }

          // Check Responsible
          if (!responsibleId) {
            noResponsible.push({ taskLabel: n.label, procName: proc.name });
          } else if (personWorkload[responsibleId]) {
            personWorkload[responsibleId].rCount += 1;
          }
        }
      });
    });

    const overloaded = Object.values(personWorkload).filter((pw) => pw.rCount >= 5);
    const underutilized = Object.values(personWorkload).filter((pw) => pw.rCount === 0 && pw.aCount === 0);

    return {
      noAccountable,
      multiAccountable,
      noResponsible,
      overloaded,
      underutilized,
      totalIssues: noAccountable.length + multiAccountable.length + noResponsible.length
    };
  }, [processes, people]);

  // Toggle RACI role for a specific task and person
  const handleToggleRole = (processId: string, nodeId: string, personId: string, currentRole?: RaciRole) => {
    const rolesCycle: (RaciRole | undefined)[] = ['R', 'A', 'S', 'C', 'I', undefined];
    const nextIndex = (rolesCycle.indexOf(currentRole) + 1) % rolesCycle.length;
    const nextRole = rolesCycle[nextIndex];

    const nextProcesses = processes.map((proc) => {
      if (proc.id !== processId) return proc;
      const nextNodes = proc.nodes.map((n) => {
        if (n.id !== nodeId) return n;

        const currentRaci = n.raci || {};
        let newResponsible = currentRaci.responsibleId;
        let newAccountable = currentRaci.accountableId;
        let newConsulted = [...(currentRaci.consultedIds || [])];
        let newInformed = [...(currentRaci.informedIds || [])];

        // Clean previous role assignment for this person
        if (newResponsible === personId) newResponsible = undefined;
        if (newAccountable === personId) newAccountable = undefined;
        newConsulted = newConsulted.filter((id) => id !== personId);
        newInformed = newInformed.filter((id) => id !== personId);

        // Assign next role
        if (nextRole === 'R') {
          newResponsible = personId;
        } else if (nextRole === 'A') {
          newAccountable = personId;
        } else if (nextRole === 'C') {
          newConsulted.push(personId);
        } else if (nextRole === 'I') {
          newInformed.push(personId);
        }

        return {
          ...n,
          personId: newResponsible || n.personId,
          raci: {
            responsibleId: newResponsible,
            accountableId: newAccountable,
            consultedIds: newConsulted,
            informedIds: newInformed
          }
        };
      });

      return { ...proc, nodes: nextNodes };
    });

    onUpdateProcesses(nextProcesses);
  };

  // Helper to get role for task & person
  const getPersonRoleForTask = (node: BpmnNode, personId: string): RaciRole | undefined => {
    const raci = node.raci;
    if (raci?.accountableId === personId) return 'A';
    if (raci?.responsibleId === personId || node.personId === personId) return 'R';
    if (raci?.consultedIds?.includes(personId)) return 'C';
    if (raci?.informedIds?.includes(personId)) return 'I';
    return undefined;
  };

  // Export Matrix as CSV / Printable Table
  const handleExportCsv = () => {
    let csv = 'Process,Activity';
    filteredPeople.forEach((p) => {
      csv += `,"${p.name} (${p.title})"`;
    });
    csv += '\n';

    tasks.forEach((item) => {
      csv += `"${item.processName}","${item.node.label}"`;
      filteredPeople.forEach((p) => {
        const role = getPersonRoleForTask(item.node, p.id) || '-';
        csv += `,"${role}"`;
      });
      csv += '\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RACI_Matrix_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const departments = Array.from(new Set(people.map((p) => p.department)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Banner */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-lg shadow-rose-600/25">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  {isRtl ? 'ماتریس حاکمیت و مسئولیت‌های فرآیندی (RACI Matrix)' : 'Process RACI & Governance Matrix'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  RASCI Standard
                </span>
                {auditResults.totalIssues > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{auditResults.totalIssues} تداخل سازمانی</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRtl
                  ? 'اتصال رسمی چارت پرسنل به فعالیت‌های BPMN با تفکیک مجری (R)، پاسخگو (A)، پشتیبان (S)، مشاور (C) و مطلع (I)'
                  : 'Assign Responsible, Accountable, Support, Consulted, and Informed to all workflow activities'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isRtl ? 'خروجی اکسل (CSV)' : 'Export CSV'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Tabs Bar */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('MATRIX')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'MATRIX'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {isRtl ? 'جدول ماتریس RACI' : 'RACI Grid'}
              </button>
              <button
                onClick={() => setActiveTab('AUDIT')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'AUDIT'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{isRtl ? 'ممیزی و کشف حفره‌ها' : 'Governance Audit'}</span>
                {auditResults.totalIssues > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] flex items-center justify-center font-black">
                    {auditResults.totalIssues}
                  </span>
                )}
              </button>
            </div>

            {/* Process Filter */}
            <select
              value={selectedProcessId}
              onChange={(e) => setSelectedProcessId(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <option value="all">{isRtl ? 'همه فرآیندها' : 'All Processes'}</option>
              {processes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            >
              <option value="all">{isRtl ? 'همه دپارتمان‌ها' : 'All Departments'}</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Search task input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
            <input
              type="text"
              value={searchTask}
              onChange={(e) => setSearchTask(e.target.value)}
              placeholder={isRtl ? 'جستجوی فعالیت...' : 'Search task...'}
              className="w-full ps-9 pe-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* RACI Legend & Instruction bar */}
        <div className="px-5 py-2 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 flex-wrap gap-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">{isRtl ? 'راهنمای نقش‌ها (کلیک روی هر خانه برای تغییر):' : 'Click cell to cycle role:'}</span>
            {(['R', 'A', 'S', 'C', 'I'] as RaciRole[]).map((r) => (
              <span key={r} className="flex items-center gap-1">
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px]"
                  style={{ backgroundColor: RACI_CONFIG[r].bg, color: RACI_CONFIG[r].color }}
                >
                  {r}
                </span>
                <span>{RACI_CONFIG[r].labelEn}</span>
              </span>
            ))}
          </div>
          <div className="text-[10px] text-slate-400">
            {tasks.length} فعالیت فرآیندی · {filteredPeople.length} پست سازمانی
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-slate-100/50 dark:bg-slate-950/50">
          {activeTab === 'MATRIX' ? (
            <div className="min-w-full inline-block align-middle">
              <table className="w-full border-collapse text-xs select-none">
                {/* Table Header: Sticky Top */}
                <thead className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 shadow-sm">
                  <tr>
                    <th className="sticky start-0 z-30 bg-white dark:bg-slate-900 p-3 text-start font-black text-slate-900 dark:text-slate-100 min-w-[200px] border-e border-slate-200 dark:border-slate-800">
                      {isRtl ? 'فرآیند و نام فعالیت' : 'Process & Task'}
                    </th>
                    {filteredPeople.map((person) => (
                      <th
                        key={person.id}
                        className="p-2.5 text-center font-bold min-w-[110px] max-w-[130px] border-e border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <div className="flex flex-col items-center">
                          <PersonAvatar name={person.name} photo={person.photo} size={30} showStatusDot={false} />
                          <span className="font-black text-[11px] text-slate-900 dark:text-slate-100 truncate w-full mt-1">
                            {person.name}
                          </span>
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 truncate w-full">
                            {person.title}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Table Body: Tasks x People */}
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {tasks.map(({ processId, processName, node }) => {
                    const accountableId = node.raci?.accountableId;
                    const isMissingA = !accountableId;

                    return (
                      <tr
                        key={`${processId}-${node.id}`}
                        className={`hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors ${
                          isMissingA ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                        }`}
                      >
                        {/* Task Title & Process Name (Sticky Col) */}
                        <td className="sticky start-0 z-10 bg-white dark:bg-slate-900 p-3 border-e border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between gap-1">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">
                                {processName}
                              </span>
                              <span className="font-black text-slate-900 dark:text-slate-100">
                                {node.label}
                              </span>
                            </div>
                            {isMissingA && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex-shrink-0"
                                title="فاقد پاسخگوی نهایی (Accountable)"
                              >
                                ! No A
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Person Role Cell */}
                        {filteredPeople.map((person) => {
                          const role = getPersonRoleForTask(node, person.id);
                          const cfg = role ? RACI_CONFIG[role] : null;

                          return (
                            <td
                              key={person.id}
                              onClick={() => handleToggleRole(processId, node.id, person.id, role)}
                              className="p-1.5 text-center border-e border-slate-100 dark:border-slate-850 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 cursor-pointer transition-all"
                              title={
                                cfg
                                  ? `${cfg.labelFa} — کلیک برای تغییر نقش`
                                  : 'کلیک جهت انتساب نقش در این فعالیت'
                              }
                            >
                              {cfg ? (
                                <span
                                  className="inline-flex w-7 h-7 rounded-lg items-center justify-center font-black text-xs shadow-sm transition-transform hover:scale-110"
                                  style={{ backgroundColor: cfg.bg, color: cfg.color }}
                                >
                                  {role}
                                </span>
                              ) : (
                                <span className="inline-block w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 opacity-40 hover:opacity-100" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* AUDIT TAB: Governance Gaps & Overloads */
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Missing Accountable */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                      <AlertOctagon className="w-5 h-5" />
                    </span>
                    <span className="text-2xl font-black text-rose-600">
                      {auditResults.noAccountable.length}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    فعالیت‌های بدون پاسخگو (No Accountable)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    در اصول استاندارد Signavio، هر وظیفه باید دقیقاً ۱ نفر پاسخگوی نهایی داشته باشد.
                  </p>
                </div>

                {/* Card 2: Missing Responsible */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-900 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
                      <AlertTriangle className="w-5 h-5" />
                    </span>
                    <span className="text-2xl font-black text-amber-600">
                      {auditResults.noResponsible.length}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    فعالیت‌های بدون مجری (No Responsible)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    فعالیت‌هایی که هیچ کارشناس یا مسئولی برای اجرای آن تعیین نشده است.
                  </p>
                </div>

                {/* Card 3: Overloaded Staff */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600">
                      <Users className="w-5 h-5" />
                    </span>
                    <span className="text-2xl font-black text-purple-600">
                      {auditResults.overloaded.length}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    پرسنل با ریسک اضافه بار (Overloaded)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    افرادی که به عنوان مجری مستقیم بیش از ۵ وظیفه فرآیندی تعریف شده‌اند.
                  </p>
                </div>
              </div>

              {/* Detailed Violations List */}
              {auditResults.noAccountable.length > 0 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h5 className="font-black text-xs text-rose-600 flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4" />
                    <span>فهرست وظایفی که فاقد پاسخگوی نهایی هستند:</span>
                  </h5>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {auditResults.noAccountable.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{item.taskLabel}</span>
                        <span className="text-slate-400 text-[11px]">{item.procName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500 font-bold">
            {isRtl ? 'با کلیک روی هر خانه جدول، نقش فرد بین R -> A -> S -> C -> I تغییر می‌کند.' : 'Click any cell to cycle through RACI roles.'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
          >
            {isRtl ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

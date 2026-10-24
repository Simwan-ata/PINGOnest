import React, { useState } from 'react';
import {
  X,
  Zap,
  Briefcase,
  Users,
  GitBranch,
  FolderKanban,
  Plus,
  Trash2,
  Sparkles,
  Check,
  ArrowRight,
  Upload,
  Copy,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  PersonNode,
  BpmnProcess,
  ProjectEntity,
  JobPosition
} from '../types/pingonest';

interface QuickCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: PersonNode[];
  jobs: JobPosition[];
  processes: BpmnProcess[];
  projects: ProjectEntity[];
  onAddJobs: (newJobs: JobPosition[]) => void;
  onAddPeople: (newPeople: PersonNode[]) => void;
  onAddProcess: (newProcess: BpmnProcess) => void;
  onAddProject: (newProject: ProjectEntity) => void;
  isRtl: boolean;
}

export default function QuickCreationModal({
  isOpen,
  onClose,
  people,
  jobs,
  processes,
  projects,
  onAddJobs,
  onAddPeople,
  onAddProcess,
  onAddProject,
  isRtl
}: QuickCreationModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'JOBS' | 'PEOPLE' | 'PROCESSES' | 'PROJECTS'>('JOBS');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  /* ==================== 1. QUICK JOBS STATE ==================== */
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState('فنی و مهندسی');
  const [newJobLevel, setNewJobLevel] = useState(3);
  const [newJobReportsTo, setNewJobReportsTo] = useState('');
  const [newJobHeadcount, setNewJobHeadcount] = useState(1);
  const [newJobIsStaff, setNewJobIsStaff] = useState(false);
  const [newJobMinSalary, setNewJobMinSalary] = useState(50000000);
  const [newJobMaxSalary, setNewJobMaxSalary] = useState(70000000);

  // Bulk paste text for jobs
  const [jobsBulkText, setJobsBulkText] = useState('');

  const handleCreateSingleJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    const created: JobPosition = {
      id: `job-${Date.now()}`,
      code: `JOB-${newJobDept.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      title: newJobTitle.trim(),
      department: newJobDept,
      level: Number(newJobLevel),
      reportsToJobId: newJobReportsTo || undefined,
      isStaffAssistant: newJobIsStaff,
      approvedHeadcount: Number(newJobHeadcount),
      assignedPeopleIds: [],
      status: 'has_vacancies',
      minSalary: Number(newJobMinSalary),
      maxSalary: Number(newJobMaxSalary)
    };

    onAddJobs([created]);
    setNewJobTitle('');
    showSuccess('شغل سازمانی جدید با موفقیت ایجاد شد.');
  };

  const handleBulkAddJobs = () => {
    if (!jobsBulkText.trim()) return;
    const lines = jobsBulkText.trim().split('\n');
    const newJobs: JobPosition[] = [];

    lines.forEach((line, idx) => {
      // Format: عنوان شغل, دپارتمان, سطح, ظرفیت
      const parts = line.split(/[,\t|]/).map((p) => p.trim());
      if (parts[0]) {
        newJobs.push({
          id: `job-bulk-${Date.now()}-${idx}`,
          code: `JOB-${(parts[1] || 'GEN').slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
          title: parts[0],
          department: parts[1] || 'فنی و مهندسی',
          level: Number(parts[2]) || 3,
          approvedHeadcount: Number(parts[3]) || 1,
          assignedPeopleIds: [],
          status: 'has_vacancies'
        });
      }
    });

    if (newJobs.length > 0) {
      onAddJobs(newJobs);
      setJobsBulkText('');
      showSuccess(`${newJobs.length} شغل سازمانی به‌صورت تجمیعی افزوده شدند.`);
    }
  };

  /* ==================== 2. QUICK PEOPLE STATE ==================== */
  const [personName, setPersonName] = useState('');
  const [personTitle, setPersonTitle] = useState('');
  const [personDept, setPersonDept] = useState('فنی و مهندسی');
  const [personManagerId, setPersonManagerId] = useState('');
  const [personSalary, setPersonSalary] = useState(45000000);
  const [personStatus, setPersonStatus] = useState<'فعال' | 'غیرفعال'>('فعال');
  const [peopleBulkText, setPeopleBulkText] = useState('');

  const handleCreateSinglePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    const mgr = people.find((p) => p.id === personManagerId);
    const newPerson: PersonNode = {
      id: `${Date.now().toString().slice(-4)}`,
      name: personName.trim(),
      title: personTitle.trim() || 'کارشناس',
      department: personDept,
      parentId: personManagerId,
      level: mgr ? mgr.level + 1 : 1,
      subCount: 0,
      status: personStatus,
      salary: Number(personSalary),
      email: `${personName.trim().replace(/\s+/g, '.').toLowerCase()}@pingonest.internal`
    };

    onAddPeople([newPerson]);
    setPersonName('');
    setPersonTitle('');
    showSuccess('نیروی انسانی جدید به چارت سازمانی افزوده شد.');
  };

  const handleBulkAddPeople = () => {
    if (!peopleBulkText.trim()) return;
    const lines = peopleBulkText.trim().split('\n');
    const newPeopleList: PersonNode[] = [];

    lines.forEach((line, idx) => {
      // Format: نام, سمت, دپارتمان, حقوق
      const parts = line.split(/[,\t|]/).map((p) => p.trim());
      if (parts[0]) {
        newPeopleList.push({
          id: `${Date.now().toString().slice(-4)}${idx}`,
          name: parts[0],
          title: parts[1] || 'کارشناس',
          department: parts[2] || 'فنی و مهندسی',
          parentId: people[0]?.id || '',
          level: (people[0]?.level || 1) + 1,
          subCount: 0,
          status: 'فعال',
          salary: Number(parts[3]) || 40000000
        });
      }
    });

    if (newPeopleList.length > 0) {
      onAddPeople(newPeopleList);
      setPeopleBulkText('');
      showSuccess(`${newPeopleList.length} نیروی انسانی با موفقیت افزوده شدند.`);
    }
  };

  /* ==================== 3. QUICK PROCESS STATE ==================== */
  const [procName, setProcName] = useState('');
  const [procCategory, setProcCategory] = useState<'core' | 'support' | 'management'>('core');
  const [procTrigger, setProcTrigger] = useState('');
  const [procOutput, setProcOutput] = useState('');
  const [procNextId, setProcNextId] = useState('');
  const [procLanesList, setProcLanesList] = useState('فنی و مهندسی, محصول و طراحی, مالی و اداری');

  const handleCreateProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procName.trim()) return;

    const lanes = procLanesList.split(',').map((l, i) => ({
      id: `lane-quick-${Date.now()}-${i}`,
      label: l.trim(),
      department: l.trim()
    }));

    const newProcId = `proc-${Date.now()}`;
    const newProc: BpmnProcess = {
      id: newProcId,
      name: procName.trim(),
      category: procCategory,
      triggerInput: procTrigger || 'رویداد آغازین و ثبت درخواست',
      expectedOutput: procOutput || 'تکمیل فرآیند و تحویل خروجی',
      nextProcessId: procNextId || undefined,
      lanes: lanes.length > 0 ? lanes : [{ id: 'l1', label: 'دپارتمان اصلی', department: 'فنی و مهندسی' }],
      nodes: [
        {
          id: `start-${Date.now()}`,
          type: 'start',
          subtype: 'none',
          label: procTrigger || 'شروع فرآیند',
          laneId: lanes[0]?.id || 'l1',
          x: 40,
          y: 40
        },
        {
          id: `task-1-${Date.now()}`,
          type: 'task',
          subtype: 'user',
          label: 'بررسی و پالایش اولیه درخواست',
          laneId: lanes[0]?.id || 'l1',
          x: 200,
          y: 30
        },
        {
          id: `task-2-${Date.now()}`,
          type: 'task',
          subtype: 'user',
          label: 'انجام عملیات تخصصی و تصویب',
          laneId: lanes[1]?.id || lanes[0]?.id || 'l1',
          x: 420,
          y: 30
        },
        {
          id: `end-${Date.now()}`,
          type: 'end',
          subtype: 'none',
          label: procOutput || 'خاتمه و تحویل به فرآیند بعدی',
          laneId: lanes[lanes.length - 1]?.id || 'l1',
          x: 640,
          y: 40
        }
      ],
      edges: []
    };

    // link start -> task1 -> task2 -> end
    newProc.edges = [
      { id: `e1-${Date.now()}`, from: newProc.nodes[0].id, to: newProc.nodes[1].id },
      { id: `e2-${Date.now()}`, from: newProc.nodes[1].id, to: newProc.nodes[2].id },
      { id: `e3-${Date.now()}`, from: newProc.nodes[2].id, to: newProc.nodes[3].id }
    ];

    onAddProcess(newProc);
    setProcName('');
    setProcTrigger('');
    setProcOutput('');
    showSuccess('فرآیند جدید با موفقیت ایجاد و به زنجیره متصل شد.');
  };

  /* ==================== 4. QUICK PROJECT STATE ==================== */
  const [projName, setProjName] = useState('');
  const [projCode, setProjCode] = useState('');
  const [projLeadId, setProjLeadId] = useState('');
  const [projBudget, setProjBudget] = useState(250000000);
  const [projDesc, setProjDesc] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    const newProj: ProjectEntity = {
      name: projName.trim(),
      code: projCode.trim() || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      leadPersonId: projLeadId || undefined,
      budget: Number(projBudget),
      status: 'active',
      description: projDesc.trim() || 'پروژه استراتژیک سازمانی ماتریسی'
    };

    onAddProject(newProj);
    setProjName('');
    setProjCode('');
    setProjDesc('');
    showSuccess('پروژه ماتریسی جدید با موفقیت اضافه شد.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  {isRtl ? 'هاب ایجاد سریع ارکان سازمان' : 'Quick Creation Hub'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  سرعت بالا و ورودی تجمیعی
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl
                  ? 'ایجاد آنی و دسته‌جمعی مشاغل، پرسنل، فرآیندهای زنجیره‌ای و پروژه‌های ماتریسی'
                  : 'Fast creation of Jobs, People, Connected Processes, and Projects'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 flex-shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('JOBS')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'JOBS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>۱. لیست مشاغل سازمانی ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PEOPLE')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'PEOPLE'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>۲. لیست نیروی انسانی ({people.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PROCESSES')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'PROCESSES'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>۳. فرآیندهای زنجیره‌ای ({processes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
              activeTab === 'PROJECTS'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>۴. پروژه‌های ماتریسی ({projects.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* ==================== TAB 1: JOBS ==================== */}
          {activeTab === 'JOBS' && (
            <div className="space-y-6">
              {/* Single Job Quick Form */}
              <form onSubmit={handleCreateSingleJob} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>افزودن تکی شغل سازمانی</span>
                  </h4>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newJobIsStaff}
                      onChange={(e) => setNewJobIsStaff(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>پست مشاور / دستیار ستادی (Staff/Assistant)</span>
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">عنوان شغل / پست *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سرپرست تیم توسعه محصول"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">دپارتمان</label>
                    <select
                      value={newJobDept}
                      onChange={(e) => setNewJobDept(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    >
                      <option value="هیئت مدیره">هیئت مدیره</option>
                      <option value="فنی و مهندسی">فنی و مهندسی</option>
                      <option value="محصول و طراحی">محصول و طراحی</option>
                      <option value="مالی و اداری">مالی و اداری</option>
                      <option value="منابع انسانی">منابع انسانی</option>
                      <option value="بازاریابی و فروش">بازاریابی و فروش</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">سطح سلسله‌مراتب</label>
                    <select
                      value={newJobLevel}
                      onChange={(e) => setNewJobLevel(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    >
                      <option value={1}>سطح ۱ (رأس / مدیرعامل)</option>
                      <option value={2}>سطح ۲ (معاونت / C-Level)</option>
                      <option value={3}>سطح ۳ (مدیریت / سرپرستی)</option>
                      <option value={4}>سطح ۴ (کارشناس ارشد / عملیات)</option>
                      <option value={5}>سطح ۵ (کارشناس / پشتیبانی)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">ظرفیت مصوب (تعداد نفر)</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={newJobHeadcount}
                      onChange={(e) => setNewJobHeadcount(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ثبت و افزودن شغل</span>
                  </button>
                </div>
              </form>

              {/* Bulk Paste Area */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">چسباندن دسته‌جمعی لیست مشاغل (Bulk Paste)</h4>
                  </div>
                  <span className="text-[10px] text-slate-500">فرمت: عنوان شغل، دپارتمان، سطح، تعداد ظرفیت</span>
                </div>
                <textarea
                  rows={3}
                  placeholder={`کارشناس امنیت سایبری, فنی و مهندسی, 3, 2\nسرپرست روابط عمومی, منابع انسانی, 3, 1\nطراح ارشد رابط کاربری, محصول و طراحی, 4, 3`}
                  value={jobsBulkText}
                  onChange={(e) => setJobsBulkText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono outline-none"
                />
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() =>
                      setJobsBulkText(`کارشناس امنیت سایبری, فنی و مهندسی, 3, 2\nسرپرست روابط عمومی, منابع انسانی, 3, 1\nطراح ارشد رابط کاربری, محصول و طراحی, 4, 3\nتحلیل‌گر مالی و بودجه, مالی و اداری, 4, 2`)
                    }
                    className="text-[11px] text-indigo-600 font-bold hover:underline"
                  >
                    نمونه متن آزمایشی را درج کن
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkAddJobs}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    افزودن دسته‌جمعی مشاغل
                  </button>
                </div>
              </div>

              {/* Jobs List Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>لیست مشاغل تعریف‌شده ({jobs.length})</span>
                  <span>ظرفیت‌های خالی: {jobs.filter((j) => j.status === 'has_vacancies').length} شغل</span>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-56 overflow-y-auto">
                  {jobs.map((j) => (
                    <div key={j.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{j.title}</span>
                          {j.isStaffAssistant && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              دستیار / مشاور ستادی
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          دپارتمان: {j.department} • سطح {j.level} • ظرفیت مصوب: {j.approvedHeadcount} نفر
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        j.status === 'has_vacancies'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {j.status === 'has_vacancies' ? 'دارای پست خالی' : 'تکمیل'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: PEOPLE ==================== */}
          {activeTab === 'PEOPLE' && (
            <div className="space-y-6">
              {/* Single Person Quick Form */}
              <form onSubmit={handleCreateSinglePerson} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>ثبت و استخدام نیروی انسانی جدید</span>
                </h4>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">نام و نام خانوادگی *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سارا رضایی"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">سمت / شغل</label>
                    <input
                      type="text"
                      placeholder="مثال: طراح ارشد محصول"
                      value={personTitle}
                      onChange={(e) => setPersonTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">دپارتمان</label>
                    <select
                      value={personDept}
                      onChange={(e) => setPersonDept(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    >
                      <option value="هیئت مدیره">هیئت مدیره</option>
                      <option value="فنی و مهندسی">فنی و مهندسی</option>
                      <option value="محصول و طراحی">محصول و طراحی</option>
                      <option value="مالی و اداری">مالی و اداری</option>
                      <option value="منابع انسانی">منابع انسانی</option>
                      <option value="بازاریابی و فروش">بازاریابی و فروش</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">مدیر مستقیم (گزارش‌دهی به)</label>
                    <select
                      value={personManagerId}
                      onChange={(e) => setPersonManagerId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    >
                      <option value="">(انتخاب مدیر)</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.title})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن نیرو به چارت</span>
                  </button>
                </div>
              </form>

              {/* Bulk Paste People */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">چسباندن دسته‌جمعی پرسنل (Bulk Paste)</h4>
                  </div>
                  <span className="text-[10px] text-slate-500">فرمت: نام و نام خانوادگی، سمت، دپارتمان، حقوق</span>
                </div>
                <textarea
                  rows={3}
                  placeholder={`امیرحسین کاظمی, مهندس ارشد داده, فنی و مهندسی, 65000000\nنگار صادقی, کارشناس تضمین کیفیت, محصول و طراحی, 48000000\nکامران نوری, کارشناس حسابداری, مالی و اداری, 42000000`}
                  value={peopleBulkText}
                  onChange={(e) => setPeopleBulkText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono outline-none"
                />
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() =>
                      setPeopleBulkText(`امیرحسین کاظمی, مهندس ارشد داده, فنی و مهندسی, 65000000\nنگار صادقی, کارشناس تضمین کیفیت, محصول و طراحی, 48000000\nکامران نوری, کارشناس حسابداری, مالی و اداری, 42000000\nالهام ملکی, کارشناس جذب استعداد, منابع انسانی, 45000000`)
                    }
                    className="text-[11px] text-indigo-600 font-bold hover:underline"
                  >
                    نمونه متن پرسنلی را درج کن
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkAddPeople}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    افزودن دسته‌جمعی پرسنل
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: PROCESSES & CHAINING ==================== */}
          {activeTab === 'PROCESSES' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateProcess} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4 text-indigo-600" />
                    <span>ایجاد فرآیند متصل به زنجیره ارزش (Connected Process)</span>
                  </h4>
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    اتصال خروجی ⟵ ورودی فرآیند بعدی
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">نام فرآیند *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مدیریت و تحویل سفارشات مشتری"
                      value={procName}
                      onChange={(e) => setProcName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">دسته‌بندی در زنجیره ارزش</label>
                    <select
                      value={procCategory}
                      onChange={(e) => setProcCategory(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    >
                      <option value="core">فرآیند اصلی و عملیاتی (Core Value Stream)</option>
                      <option value="support">فرآیند پشتیبانی (Support / Enabling)</option>
                      <option value="management">فرآیند مدیریتی و حاکمیتی (Governance)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">فرآیند متصل بعدی (Next Linked Process)</label>
                    <select
                      value={procNextId}
                      onChange={(e) => setProcNextId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    >
                      <option value="">(پایان زنجیره / فرآیند نهایی)</option>
                      {processes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">سیگنال / شرط آغازین (Trigger / Input)</label>
                    <input
                      type="text"
                      placeholder="مثال: پرداخت موفق پیش‌فاکتور توسط مشتری"
                      value={procTrigger}
                      onChange={(e) => setProcTrigger(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">خروجی قابل تحویل (Expected Output)</label>
                    <input
                      type="text"
                      placeholder="مثال: صدور فاکتور رسمی و ارسال به انبار"
                      value={procOutput}
                      onChange={(e) => setProcOutput(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">استخرهای شنا (Swimlanes) - جداشده با کاما</label>
                  <input
                    type="text"
                    value={procLanesList}
                    onChange={(e) => setProcLanesList(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تولید و الصاق فرآیند به استودیو</span>
                  </button>
                </div>
              </form>

              {/* Connected Process Chain Visualizer */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>زنجیره پیوسته فرآیندهای سازمان (Value Chain Continuity)</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  {processes.map((p, idx) => (
                    <React.Fragment key={p.id}>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 min-w-56 shadow-sm flex-shrink-0">
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          ورودی: {p.triggerInput || 'ثبت درخواست'}
                        </div>
                        <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                          خروجی: {p.expectedOutput || 'تکمیل'}
                        </div>
                      </div>
                      {idx < processes.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: PROJECTS ==================== */}
          {activeTab === 'PROJECTS' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateProject} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FolderKanban className="w-4 h-4 text-indigo-600" />
                  <span>تعریف سریع پروژه ماتریسی و تخصیص بودجه</span>
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">نام پروژه *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: سامانه وفاداری مشتریان (Club)"
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">کد پروژه</label>
                    <input
                      type="text"
                      placeholder="PRJ-LOYAL-24"
                      value={projCode}
                      onChange={(e) => setProjCode(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">مدیر ارشد پروژه (Lead)</label>
                    <select
                      value={projLeadId}
                      onChange={(e) => setProjLeadId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    >
                      <option value="">(انتخاب مدیر)</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.title})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">بودجه تخصیصی (تومان)</label>
                    <input
                      type="number"
                      step={10000000}
                      value={projBudget}
                      onChange={(e) => setProjBudget(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">شرح و هدف استراتژیک</label>
                    <input
                      type="text"
                      placeholder="هدف افزایش نرخ نگهداشت و وفاداری مشتریان تا ۳۵٪"
                      value={projDesc}
                      onChange={(e) => setProjDesc(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ایجاد و ثبت پروژه ماتریسی</span>
                  </button>
                </div>
              </form>

              {/* Projects Overview */}
              <div className="grid grid-cols-2 gap-3">
                {projects.map((proj) => (
                  <div key={proj.code} className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-start">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{proj.name}</span>
                        <span className="font-mono text-[10px] text-slate-500 font-normal">[{proj.code}]</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{proj.description}</p>
                      <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
                        بودجه: {(proj.budget || 0).toLocaleString('fa-IR')} تومان
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>تغییرات بلافاصله بر روی چارت، فرآیندها و ماتریس پروژه‌ها اعمال می‌شوند.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            بستن و بازگشت به چارت
          </button>
        </footer>
      </div>
    </div>
  );
}

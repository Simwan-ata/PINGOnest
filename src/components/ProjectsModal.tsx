import React, { useState } from 'react';
import {
  X,
  Plus,
  FolderKanban,
  Users,
  DollarSign,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Search,
  ExternalLink
} from 'lucide-react';
import { ProjectEntity, PersonNode } from '../types/pingonest';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectEntity[];
  people: PersonNode[];
  onSaveProjects: (projects: ProjectEntity[]) => void;
  onUpdatePerson: (person: PersonNode) => void;
  onSelectHighlightProject: (projectName: string) => void;
  isRtl: boolean;
}

export default function ProjectsModal({
  isOpen,
  onClose,
  projects,
  people,
  onSaveProjects,
  onUpdatePerson,
  onSelectHighlightProject,
  isRtl
}: ProjectsModalProps) {
  if (!isOpen) return null;

  const [selectedProjectName, setSelectedProjectName] = useState<string>(projects[0]?.name || '');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  // New Project Form state
  const [newProjName, setNewProjName] = useState('');
  const [newProjCode, setNewProjCode] = useState('');
  const [newProjBudget, setNewProjBudget] = useState<number>(1000000000);
  const [newProjLeadId, setNewProjLeadId] = useState(people[0]?.id || '');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Add Member state
  const [memberToAddId, setMemberToAddId] = useState('');
  const [memberRole, setMemberRole] = useState('عضو تیم فنی');
  const [memberAlloc, setMemberAlloc] = useState(50);

  const currentProject = projects.find((p) => p.name === selectedProjectName) || projects[0];

  // Members currently assigned to this project
  const projectMembers = people
    .map((person) => {
      const match = person.projectRoles?.find((pr) => pr.project === currentProject?.name);
      return match ? { person, role: match.role, allocation: match.allocation } : null;
    })
    .filter(Boolean) as { person: PersonNode; role: string; allocation: number }[];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const newProject: ProjectEntity = {
      name: newProjName.trim(),
      code: newProjCode.trim() || `PRJ-${Date.now().toString().slice(-4)}`,
      budget: newProjBudget,
      leadPersonId: newProjLeadId,
      status: 'active',
      description: newProjDesc,
      membersCount: 1
    };

    const next = [...projects, newProject];
    onSaveProjects(next);
    setSelectedProjectName(newProject.name);
    setShowNewProjectForm(false);
    setNewProjName('');
  };

  const handleAddMember = () => {
    if (!memberToAddId || !currentProject) return;
    const person = people.find((p) => p.id === memberToAddId);
    if (!person) return;

    const existingRoles = person.projectRoles || [];
    const updatedPerson: PersonNode = {
      ...person,
      projectRoles: [
        ...existingRoles.filter((pr) => pr.project !== currentProject.name),
        { project: currentProject.name, role: memberRole, allocation: memberAlloc }
      ]
    };
    onUpdatePerson(updatedPerson);
    setMemberToAddId('');
  };

  const handleRemoveMember = (personId: string) => {
    const person = people.find((p) => p.id === personId);
    if (!person || !currentProject) return;

    const updatedPerson: PersonNode = {
      ...person,
      projectRoles: (person.projectRoles || []).filter((pr) => pr.project !== currentProject.name)
    };
    onUpdatePerson(updatedPerson);
  };

  // Check overallocated people across all projects
  const overallocatedPeople = people
    .map((p) => {
      const total = (p.projectRoles || []).reduce((acc, curr) => acc + curr.allocation, 0);
      return total > 100 ? { person: p, totalAlloc: total } : null;
    })
    .filter(Boolean) as { person: PersonNode; totalAlloc: number }[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                {isRtl ? 'مدیریت ماتریسی پروژه‌ها و تخصیص منابع' : 'Matrix Projects & Resource Allocation'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isRtl
                  ? 'مدیریت تیم‌های بین‌دپارتمانی، درصد درگیری زمانی و برجسته‌سازی اعضای پروژه روی چارت'
                  : 'Manage cross-departmental teams, allocation percentage, and highlight on org chart'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content Split: Project List vs Project Roster */}
        <div className="flex-1 flex overflow-hidden">
          {/* Project List Sidebar */}
          <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase text-slate-600 dark:text-slate-400">
                  {isRtl ? 'فهرست پروژه‌ها' : 'Projects List'}
                </span>
                <button
                  onClick={() => setShowNewProjectForm(true)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isRtl ? 'پروژه جدید' : 'New'}
                </button>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[58vh]">
                {projects.map((proj) => {
                  const isSelected = selectedProjectName === proj.name;
                  const memberCount = people.filter((p) =>
                    p.projectRoles?.some((pr) => pr.project === proj.name)
                  ).length;

                  return (
                    <div
                      key={proj.name}
                      onClick={() => {
                        setSelectedProjectName(proj.name);
                        setShowNewProjectForm(false);
                      }}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {proj.name}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {proj.code}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                        <span>{memberCount} نفر عضو</span>
                        {proj.budget && (
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            {(proj.budget / 1000000).toLocaleString()}M ریال
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Over-allocation warning banner */}
            {overallocatedPeople.length > 0 && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  هشدار تخصیص بیش از ۱۰۰٪
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-400">
                  {overallocatedPeople.length} نفر بیش از ۱۰۰٪ درگیر پروژه‌ها هستند.
                </p>
              </div>
            )}
          </div>

          {/* Project Details & Team Roster */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-slate-900">
            {showNewProjectForm ? (
              <form onSubmit={handleCreateProject} className="max-w-md mx-auto space-y-4">
                <h4 className="font-black text-base text-slate-900 dark:text-slate-100 pb-2 border-b">
                  {isRtl ? 'تعریف پروژه جدید' : 'Create New Project'}
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام پروژه
                  </label>
                  <input
                    type="text"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    placeholder="مثلاً: پلتفرم هوش مصنوعی سازمانی"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">کد پروژه</label>
                    <input
                      type="text"
                      value={newProjCode}
                      onChange={(e) => setNewProjCode(e.target.value)}
                      placeholder="PRJ-AI"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">بودجه مصوب (ریال)</label>
                    <input
                      type="number"
                      value={newProjBudget}
                      onChange={(e) => setNewProjBudget(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">مدیر / رهبر پروژه</label>
                  <select
                    value={newProjLeadId}
                    onChange={(e) => setNewProjLeadId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.title})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">توضیحات و اهداف</label>
                  <textarea
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectForm(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20"
                  >
                    ایجاد پروژه
                  </button>
                </div>
              </form>
            ) : currentProject ? (
              <div className="space-y-6">
                {/* Project Header Info */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base text-slate-900 dark:text-slate-100">
                        {currentProject.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {currentProject.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                      {currentProject.description || 'بدون توضیحات ثبت‌شده.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectHighlightProject(currentProject.name);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {isRtl ? 'نمایش اعضا روی چارت' : 'Highlight on Chart'}
                  </button>
                </div>

                {/* Add Member Bar */}
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center gap-2 flex-wrap">
                  <select
                    value={memberToAddId}
                    onChange={(e) => setMemberToAddId(e.target.value)}
                    className="flex-1 min-w-[200px] text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="">{isRtl ? '— انتخاب فرد برای عضویت در پروژه —' : '— Select Person —'}</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.title} - {p.department})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    placeholder="نقش در پروژه"
                    className="text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-36 outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={memberAlloc}
                      onChange={(e) => setMemberAlloc(Number(e.target.value))}
                      className="w-16 text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center"
                    />
                    <span className="text-xs font-bold text-slate-600">%</span>
                  </div>
                  <button
                    onClick={handleAddMember}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    + {isRtl ? 'افزودن عضو' : 'Add'}
                  </button>
                </div>

                {/* Members Roster Table */}
                <div>
                  <h5 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 mb-3">
                    {isRtl ? `اعضای فعال تیم پروژه (${projectMembers.length} نفر)` : `Team Members (${projectMembers.length})`}
                  </h5>
                  {projectMembers.length === 0 ? (
                    <div className="py-8 text-center text-slate-600 dark:text-slate-400 text-xs">
                      هنوز عضوی به این پروژه اضافه نشده است. از نوار بالا فرد مورد نظر را اضافه کنید.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {projectMembers.map(({ person, role, allocation }) => (
                        <div
                          key={person.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                              {person.name.slice(0, 2)}
                            </div>
                            <div>
                              <h6 className="font-bold text-xs text-slate-900 dark:text-slate-100">{person.name}</h6>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                {role} • <span className="font-bold text-indigo-600">{allocation}%</span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(person.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

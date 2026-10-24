import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  TECH_CORP_PEOPLE,
  TECH_CORP_PROJECTS,
  TECH_CORP_PROCESSES,
  TECH_CORP_JOBS
} from './services/sampleDatasets';
import {
  PersonNode,
  ProjectEntity,
  BpmnProcess,
  JobPosition,
  ViewSettings,
  FilterSettings,
  DiffResult,
  UserSession
} from './types/pingonest';
import { HierarchyEngine } from './services/analyticsService';
import { parseExcelFile } from './services/excelService';

import TopNav from './components/TopNav';
import Sidebar from './components/Sidebar';
import OrgChartCanvas from './components/OrgChartCanvas';
import BpmnStudioModal from './components/BpmnStudioModal';
import ProjectsModal from './components/ProjectsModal';
import AnalyticsModal from './components/AnalyticsModal';
import CompareModal from './components/CompareModal';
import PersonDrawer from './components/PersonDrawer';
import ExportModal from './components/ExportModal';
import St1BridgeModal from './components/St1BridgeModal';
import QuickCreationModal from './components/QuickCreationModal';
import DatabaseModal from './components/DatabaseModal';
import UserManagementModal from './components/UserManagementModal';
import RaciMatrixModal from './components/RaciMatrixModal';
import ScenarioSimulationModal from './components/ScenarioSimulationModal';
import SuccessionPlanningModal from './components/SuccessionPlanningModal';
import CompetencyRadarModal from './components/CompetencyRadarModal';
import HelpCenterModal from './components/HelpCenterModal';
import DepartmentWorkloadVisualizerModal from './components/DepartmentWorkloadVisualizerModal';
import SplashIntro from './components/SplashIntro';
import { StorageService, EnterpriseBackup, DEFAULT_USER_SESSIONS } from './services/storageService';
import { ApiService } from './services/apiService';

export default function App() {
  const [orgName, setOrgName] = useState<string>('پارس تک — شرکت راهکارهای جامع ابری و مالی');
  const [people, setPeople] = useState<PersonNode[]>(() => HierarchyEngine.recompute(TECH_CORP_PEOPLE));
  const [jobs, setJobs] = useState<JobPosition[]>(() => TECH_CORP_JOBS);
  const [projects, setProjects] = useState<ProjectEntity[]>(() => TECH_CORP_PROJECTS);
  const [processes, setProcesses] = useState<BpmnProcess[]>(() => TECH_CORP_PROCESSES);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<PersonNode[][]>([TECH_CORP_PEOPLE]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((nextPeople: PersonNode[]) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, nextPeople];
    });
    setHistoryIndex((idx) => idx + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex((i) => i - 1);
      setPeople(prev);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex((i) => i + 1);
      setPeople(next);
    }
  }, [historyIndex, history]);

  // Global Keyboard Shortcuts (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'F1' || (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  // View Settings
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    showPhoto: true,
    showName: true,
    showTitle: true,
    showDept: true,
    showSubCount: true,
    showId: false,
    showSalary: false,
    showProjects: true,
    levelSpacing: 110,
    linkThickness: 4,
    theme: 'light',
    colorBy: 'department',
    layoutOrientation: 'vertical'
  });

  // Filter Settings
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    search: '',
    status: 'all',
    departments: new Set(),
    projectHighlight: ''
  });

  // Language & Direction
  const [isRtl, setIsRtl] = useState(true);

  // Modals state
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isBpmnOpen, setIsBpmnOpen] = useState(false);
  const [isRaciOpen, setIsRaciOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSt1BridgeOpen, setIsSt1BridgeOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [isSuccessionOpen, setIsSuccessionOpen] = useState(false);
  const [isCompetencyRadarOpen, setIsCompetencyRadarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWorkloadOpen, setIsWorkloadOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('pingonest_intro_played');
    } catch {
      return true;
    }
  });

  const handleFinishSplash = () => {
    try {
      sessionStorage.setItem('pingonest_intro_played', 'true');
    } catch {}
    setShowSplash(false);
  };

  // Active User Session & Directory (RBAC)
  const [currentSession, setCurrentSession] = useState<UserSession>(() => StorageService.getCurrentSession());
  const [allSessions, setAllSessions] = useState<UserSession[]>(() => StorageService.getAvailableSessions());

  // Save Project File (.pingo / .json) directly to user's hard drive
  const handleSaveProjectFile = () => {
    const backup: EnterpriseBackup = {
      version: '4.0.0',
      timestamp: new Date().toISOString(),
      orgName,
      people,
      projects,
      processes,
      jobs,
      metadata: {
        totalEmployees: people.length,
        totalDepts: new Set(people.map((p) => p.department)).size,
        exportedBy: currentSession.name
      }
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = orgName.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
    a.download = `${safeName}_ProjectBackup_${new Date().toISOString().slice(0, 10)}.pingo`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Person Drawer state
  const [drawerPerson, setDrawerPerson] = useState<PersonNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Diff result applied
  const [diffHighlight, setDiffHighlight] = useState<DiffResult | null>(null);

  // Hidden Excel upload input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update people and push to history
  const updatePeople = (next: PersonNode[]) => {
    const recomputed = HierarchyEngine.recompute(next);
    setPeople(recomputed);
    pushHistory(recomputed);
  };

  // Jump from Help Center directly into appropriate studio
  const handleNavigateToModule = (moduleId: string) => {
    switch (moduleId) {
      case 'bpmn': setIsBpmnOpen(true); break;
      case 'raci': setIsRaciOpen(true); break;
      case 'projects': setIsProjectsOpen(true); break;
      case 'analytics': setIsAnalyticsOpen(true); break;
      case 'compare': setIsCompareOpen(true); break;
      case 'scenario': setIsScenarioOpen(true); break;
      case 'succession': setIsSuccessionOpen(true); break;
      case 'competency': setIsCompetencyRadarOpen(true); break;
      case 'database': setIsDatabaseOpen(true); break;
      case 'users': setIsUserManagementOpen(true); break;
      case 'export': setIsExportOpen(true); break;
      case 'st1': setIsSt1BridgeOpen(true); break;
      case 'workload': setIsWorkloadOpen(true); break;
      default: break;
    }
  };

  // Relationship handlers
  const handleSaveRelationship = (fromId: string, toId: string, rel: any) => {
    const next = people.map((p) => {
      if (p.id === fromId) {
        const existing = p.customRels || [];
        const filtered = existing.filter((r) => r.toId !== toId || r.typeId !== rel.typeId);
        return {
          ...p,
          customRels: [...filtered, rel]
        };
      }
      return p;
    });
    updatePeople(next);
  };

  const handleDeleteRelationship = (fromId: string, toId: string) => {
    const next = people.map((p) => {
      if (p.id === fromId && p.customRels) {
        return {
          ...p,
          customRels: p.customRels.filter((r) => r.toId !== toId)
        };
      }
      return p;
    });
    updatePeople(next);
  };

  const handleRestoreBackup = (backup: EnterpriseBackup) => {
    if (backup.orgName) setOrgName(backup.orgName);
    if (Array.isArray(backup.people)) updatePeople(backup.people);
    if (Array.isArray(backup.projects)) setProjects(backup.projects);
    if (Array.isArray(backup.processes)) setProcesses(backup.processes);
    if (Array.isArray(backup.jobs)) setJobs(backup.jobs);
  };

  // Node Actions
  const handleEditPerson = (person: PersonNode) => {
    setDrawerPerson(person);
    setIsDrawerOpen(true);
  };

  const handleAddSubordinate = (parentPerson: PersonNode) => {
    const newPerson: PersonNode = {
      id: `100${people.length + 1}`,
      name: '',
      title: 'کارشناس جدید',
      department: parentPerson.department,
      parentId: parentPerson.id,
      level: parentPerson.level + 1,
      subCount: 0,
      status: 'فعال',
      salary: 45000000
    };
    setDrawerPerson(newPerson);
    setIsDrawerOpen(true);
  };

  const handleAddPerson = () => {
    const newPerson: PersonNode = {
      id: `100${people.length + 1}`,
      name: '',
      title: '',
      department: people[0]?.department || 'فنی و مهندسی',
      parentId: people[0]?.id || '',
      level: 2,
      subCount: 0,
      status: 'فعال',
      salary: 50000000
    };
    setDrawerPerson(newPerson);
    setIsDrawerOpen(true);
  };

  const handleDeletePerson = (id: string) => {
    const target = people.find((p) => p.id === id);
    if (!target) return;

    // Reassign subordinates to target's parent
    const next = people
      .filter((p) => p.id !== id)
      .map((p) => (p.parentId === id ? { ...p, parentId: target.parentId } : p));

    updatePeople(next);
  };

  const handleMovePerson = (personId: string, newParentId: string, syncDepartment = false) => {
    const targetParent = people.find((p) => p.id === newParentId);
    const next = people.map((p) => {
      if (p.id === personId) {
        return {
          ...p,
          parentId: newParentId,
          department: (syncDepartment && targetParent) ? targetParent.department : p.department
        };
      }
      return p;
    });
    updatePeople(next);
  };

  const handleSavePersonFromDrawer = (updated: PersonNode) => {
    const exists = people.some((p) => p.id === updated.id);
    let next: PersonNode[];
    if (exists) {
      next = people.map((p) => (p.id === updated.id ? updated : p));
    } else {
      next = [...people, updated];
    }
    updatePeople(next);
  };

  // Excel File Upload
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const imported = parseExcelFile(buffer);
      if (imported.length > 0) {
        updatePeople(imported);
        alert(isRtl ? `چارت سازمانی با موفقیت بارگذاری شد (${imported.length} نفر).` : `Org chart imported (${imported.length} people).`);
      } else {
        alert(isRtl ? 'هیچ ردیف معتبری در فایل اکسل یافت نشد.' : 'No valid records found in Excel file.');
      }
    } catch (err) {
      alert(isRtl ? 'خطا در بارگذاری فایل اکسل' : 'Error importing Excel file.');
    }
    e.target.value = '';
  };

  // Preset Sample Switcher
  const handleLoadSample = (key: 'TECH' | 'PHARMA' | 'ENERGY') => {
    if (key === 'TECH') {
      setOrgName('پارس تک — شرکت راهکارهای جامع ابری و مالی');
      updatePeople(TECH_CORP_PEOPLE);
      setProjects(TECH_CORP_PROJECTS);
      setProcesses(TECH_CORP_PROCESSES);
    } else if (key === 'PHARMA') {
      setOrgName('هولدینگ دارویی و زیست‌فناوری سینا');
      const pharmaPeople: PersonNode[] = [
        { id: '2001', name: 'دکتر بهرام سرمدی', title: 'رئیس هیئت مدیره و مدیرعامل', department: 'هیئت مدیره', parentId: '', level: 1, subCount: 5, status: 'فعال', salary: 160000000 },
        { id: '2002', name: 'دکتر آناهیتا شمس', title: 'معاون تحقیق و توسعه (R&D)', department: 'تحقیق و توسعه', parentId: '2001', level: 2, subCount: 2, status: 'فعال', salary: 120000000 },
        { id: '2003', name: 'مهندس سعید جلالی', title: 'معاون تولید و خطوط داروسازی', department: 'تولید دارویی', parentId: '2001', level: 2, subCount: 1, status: 'فعال', salary: 110000000 },
        { id: '2004', name: 'دکتر فرشاد افشار', title: 'مدیر آزمایشگاه فرمولاسیون', department: 'تحقیق و توسعه', parentId: '2002', level: 3, subCount: 0, status: 'فعال', salary: 85000000 },
        { id: '2005', name: 'مهندس سمیرا باقری', title: 'مدیر مطالعات بالینی (Clinical Trials)', department: 'تحقیق و توسعه', parentId: '2002', level: 3, subCount: 0, status: 'فعال', salary: 82000000 },
        { id: '2006', name: 'مهندس نوید کاوه', title: 'سرپرست بسته‌بندی استریل', department: 'تولید دارویی', parentId: '2003', level: 3, subCount: 0, status: 'فعال', salary: 60000000 }
      ];
      updatePeople(pharmaPeople);
    }
  };

  // Filtered People for Canvas
  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      // Search
      if (filterSettings.search.trim()) {
        const q = filterSettings.search.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (filterSettings.status !== 'all' && p.status !== filterSettings.status) {
        return false;
      }

      // Department
      if (filterSettings.departments.size > 0 && !filterSettings.departments.has(p.department)) {
        return false;
      }

      return true;
    });
  }, [people, filterSettings]);

  // Sync theme
  useEffect(() => {
    if (viewSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [viewSettings.theme]);

  // Load initial organizational state from Python SQLite or localStorage on startup
  useEffect(() => {
    let isMounted = true;
    ApiService.loadOrgData().then((result) => {
      if (!isMounted || !result.data) return;
      const d = result.data;
      if (d.orgName) setOrgName(d.orgName);
      if (Array.isArray(d.people) && d.people.length > 0) {
        const recomputed = HierarchyEngine.recompute(d.people);
        setPeople(recomputed);
        setHistory([recomputed]);
      }
      if (Array.isArray(d.projects) && d.projects.length > 0) setProjects(d.projects);
      if (Array.isArray(d.processes) && d.processes.length > 0) setProcesses(d.processes);
      if (Array.isArray(d.jobs) && d.jobs.length > 0) setJobs(d.jobs);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced auto-save to Python backend and localStorage whenever organizational state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const backup: EnterpriseBackup = {
        version: '4.0.0-enterprise',
        timestamp: new Date().toISOString(),
        orgName,
        people,
        projects,
        processes,
        jobs,
        metadata: {
          totalEmployees: people.length,
          totalDepts: new Set(people.map((p) => p.department)).size,
          exportedBy: currentSession.name
        }
      };
      ApiService.saveOrgData(backup);
    }, 1500);
    return () => clearTimeout(timer);
  }, [orgName, people, projects, processes, jobs, currentSession.name]);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex flex-col w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans"
    >
      {/* Hidden file input for Excel import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls"
        onChange={handleExcelImport}
        className="hidden"
      />

      {/* Top Navbar */}
      <TopNav
        orgName={orgName}
        onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
        onOpenBpmn={() => setIsBpmnOpen(true)}
        onOpenRaci={() => setIsRaciOpen(true)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenSt1Bridge={() => setIsSt1BridgeOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenDatabase={() => setIsDatabaseOpen(true)}
        onOpenScenarioSimulation={() => setIsScenarioOpen(true)}
        onOpenSuccession={() => setIsSuccessionOpen(true)}
        onOpenCompetencyRadar={() => setIsCompetencyRadarOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onSaveProjectFile={handleSaveProjectFile}
        currentSession={currentSession}
        onTriggerImport={() => fileInputRef.current?.click()}
        onLoadSample={handleLoadSample}
        onAddPerson={handleAddPerson}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        theme={viewSettings.theme}
        onToggleTheme={() =>
          setViewSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))
        }
        isRtl={isRtl}
        onToggleLanguage={() => setIsRtl(!isRtl)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onReplayIntro={() => setShowSplash(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenWorkloadForecast={() => setIsWorkloadOpen(true)}
      />

      {/* Main Workspace: Sidebar + Org Chart Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {isSidebarOpen && (
          <Sidebar
            people={people}
            projects={projects}
            viewSettings={viewSettings}
            filterSettings={filterSettings}
            onUpdateViewSettings={(s) => setViewSettings((prev) => ({ ...prev, ...s }))}
            onUpdateFilterSettings={(s) => setFilterSettings((prev) => ({ ...prev, ...s }))}
            onResetFilters={() =>
              setFilterSettings({
                search: '',
                status: 'all',
                departments: new Set(),
                projectHighlight: ''
              })
            }
            onToggleCollapse={() => setIsSidebarOpen(false)}
            isRtl={isRtl}
          />
        )}

        <main className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
          <OrgChartCanvas
            people={filteredPeople}
            viewSettings={viewSettings}
            searchQuery={filterSettings.search}
            highlightProjectId={filterSettings.projectHighlight}
            userRole={currentSession.role}
            onEditPerson={handleEditPerson}
            onAddSubordinate={handleAddSubordinate}
            onDeletePerson={handleDeletePerson}
            onMovePerson={handleMovePerson}
            onAddToProject={(person) => {
              setDrawerPerson(person);
              setIsDrawerOpen(true);
            }}
            onSaveRelationship={handleSaveRelationship}
            onDeleteRelationship={handleDeleteRelationship}
            isRtl={isRtl}
          />
        </main>
      </div>

      {/* Modals & Drawers */}
      <BpmnStudioModal
        isOpen={isBpmnOpen}
        onClose={() => setIsBpmnOpen(false)}
        processes={processes}
        people={people}
        onSaveProcess={(updated) => {
          setProcesses((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p))
          );
        }}
        onDeleteProcess={(procId) => {
          setProcesses((prev) => prev.filter((p) => p.id !== procId));
        }}
        isRtl={isRtl}
      />

      <ProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        projects={projects}
        people={people}
        onSaveProjects={setProjects}
        onUpdatePerson={(updated) => {
          const next = people.map((p) => (p.id === updated.id ? updated : p));
          updatePeople(next);
        }}
        onSelectHighlightProject={(name) => {
          setFilterSettings((prev) => ({ ...prev, projectHighlight: name }));
        }}
        isRtl={isRtl}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        people={people}
        isRtl={isRtl}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currentPeople={people}
        onApplyDiffHighlight={setDiffHighlight}
        isRtl={isRtl}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        people={people}
        orgName={orgName}
        isRtl={isRtl}
      />

      <St1BridgeModal
        isOpen={isSt1BridgeOpen}
        onClose={() => setIsSt1BridgeOpen(false)}
        orgName={orgName}
        people={people}
        processes={processes}
        isRtl={isRtl}
      />

      <PersonDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setDrawerPerson(null);
        }}
        person={drawerPerson}
        allPeople={people}
        projects={projects}
        onSave={handleSavePersonFromDrawer}
        onDelete={handleDeletePerson}
        isRtl={isRtl}
      />

      <QuickCreationModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        people={people}
        jobs={jobs}
        processes={processes}
        projects={projects}
        onAddJobs={(newJobs) => setJobs((prev) => [...prev, ...newJobs])}
        onAddPeople={(newPeople) => updatePeople([...people, ...newPeople])}
        onAddProcess={(newProc) => setProcesses((prev) => [...prev, newProc])}
        onAddProject={(newProj) => setProjects((prev) => [...prev, newProj])}
        isRtl={isRtl}
      />

      <DatabaseModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
        orgName={orgName}
        people={people}
        projects={projects}
        processes={processes}
        jobs={jobs}
        currentSession={currentSession}
        onSwitchSession={(session) => {
          setCurrentSession(session);
          StorageService.setCurrentSession(session);
        }}
        onRestoreBackup={handleRestoreBackup}
        isRtl={isRtl}
      />

      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        currentSession={currentSession}
        onSwitchSession={(session) => {
          setCurrentSession(session);
          StorageService.setCurrentSession(session);
        }}
        allSessions={allSessions}
        onAddSession={(newSess) => {
          setAllSessions((prev: UserSession[]) => [...prev, newSess]);
        }}
        isRtl={isRtl}
      />

      <RaciMatrixModal
        isOpen={isRaciOpen}
        onClose={() => setIsRaciOpen(false)}
        people={people}
        processes={processes}
        onUpdateProcesses={(updated) => setProcesses(updated)}
        isRtl={isRtl}
      />

      <ScenarioSimulationModal
        isOpen={isScenarioOpen}
        onClose={() => setIsScenarioOpen(false)}
        originalPeople={people}
        onApplyScenario={(updatedPeople) => {
          updatePeople(updatedPeople);
        }}
        isRtl={isRtl}
      />

      <SuccessionPlanningModal
        isOpen={isSuccessionOpen}
        onClose={() => setIsSuccessionOpen(false)}
        people={people}
        onUpdatePerson={(updatedPerson) => {
          updatePeople(people.map((p) => (p.id === updatedPerson.id ? updatedPerson : p)));
        }}
        isRtl={isRtl}
      />

      <CompetencyRadarModal
        isOpen={isCompetencyRadarOpen}
        onClose={() => setIsCompetencyRadarOpen(false)}
        people={people}
        onUpdatePerson={(updatedPerson) => {
          updatePeople(people.map((p) => (p.id === updatedPerson.id ? updatedPerson : p)));
        }}
        isRtl={isRtl}
      />

      {/* Comprehensive Help Center & Documentation Modal */}
      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        isRtl={isRtl}
        onNavigateToModule={handleNavigateToModule}
      />

      {/* Recharts Department Workload Forecast Visualizer Modal */}
      <DepartmentWorkloadVisualizerModal
        isOpen={isWorkloadOpen}
        onClose={() => setIsWorkloadOpen(false)}
        people={people}
        projects={projects}
        processes={processes}
        isRtl={isRtl}
      />

      {/* 3-Second Executive Splash Intro */}
      {showSplash && (
        <SplashIntro
          onFinish={handleFinishSplash}
          isRtl={isRtl}
        />
      )}
    </div>
  );
}

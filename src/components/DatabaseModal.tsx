import React, { useState, useRef } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  Clock,
  RotateCcw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Users,
  AlertTriangle,
  FileCode,
  KeyRound,
  Server,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { PersonNode, ProjectEntity, BpmnProcess, JobPosition, UserRole, UserSession } from '../types/pingonest';
import { StorageService, EnterpriseBackup, StorageSnapshot, DEFAULT_USER_SESSIONS, ROLE_PERMISSIONS } from '../services/storageService';
import { ApiService, BackendStatus } from '../services/apiService';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  people: PersonNode[];
  projects: ProjectEntity[];
  processes: BpmnProcess[];
  jobs?: JobPosition[];
  currentSession: UserSession;
  onSwitchSession: (session: UserSession) => void;
  onRestoreBackup: (backup: EnterpriseBackup) => void;
  isRtl: boolean;
}

export default function DatabaseModal({
  isOpen,
  onClose,
  orgName,
  people,
  projects,
  processes,
  jobs,
  currentSession,
  onSwitchSession,
  onRestoreBackup,
  isRtl
}: DatabaseModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'STORAGE' | 'SNAPSHOTS' | 'RBAC' | 'PYTHON'>('STORAGE');
  const [snapshots, setSnapshots] = useState<StorageSnapshot[]>(() => StorageService.getSnapshots());
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const checkBackend = async () => {
    setIsCheckingBackend(true);
    try {
      const status = await ApiService.checkStatus();
      setBackendStatus(status);
    } finally {
      setIsCheckingBackend(false);
    }
  };

  React.useEffect(() => {
    checkBackend();
  }, []);

  const handleSyncToPython = async () => {
    const backup = getFullBackup();
    setIsCheckingBackend(true);
    const { serverSaved } = await ApiService.saveOrgData(backup);
    setIsCheckingBackend(false);
    if (serverSaved) {
      setFeedbackMsg({
        type: 'success',
        text: isRtl ? 'داده‌ها با موفقیت در پایگاه داده SQLite سرور پایتون ذخیره شدند.' : 'Synced to Python SQLite database successfully.'
      });
      checkBackend();
    } else {
      setFeedbackMsg({
        type: 'error',
        text: isRtl ? 'سرور پایتون در دسترس نیست. لطفا server.py را اجرا نمایید.' : 'Python server unreachable. Please run server.py.'
      });
    }
  };

  const handleFetchFromPython = async () => {
    setIsCheckingBackend(true);
    const result = await ApiService.loadOrgData();
    setIsCheckingBackend(false);
    if (result.source === 'server' && result.data) {
      onRestoreBackup(result.data);
      setFeedbackMsg({
        type: 'success',
        text: isRtl ? `داده‌ها با موفقیت از پایگاه داده پایتون بارگذاری شدند (${result.data.people.length} پرسنل).` : 'Data loaded from Python SQLite server.'
      });
    } else {
      setFeedbackMsg({
        type: 'error',
        text: isRtl ? 'خطا در ارتباط با سرور پایتون یا عدم وجود داده ذخیره‌شده.' : 'Could not fetch data from Python server.'
      });
    }
  };

  const getFullBackup = (): EnterpriseBackup => ({
    version: '4.0.0-enterprise',
    timestamp: new Date().toISOString(),
    orgName,
    people,
    projects,
    processes,
    jobs: jobs || [],
    metadata: {
      totalEmployees: people.length,
      totalDepts: new Set(people.map((p) => p.department)).size,
      exportedBy: currentSession.name
    }
  });

  const handleDownloadJson = () => {
    const backup = getFullBackup();
    StorageService.downloadBackupFile(backup);
    setFeedbackMsg({
      type: 'success',
      text: isRtl ? 'فایل پایگاه داده با موفقیت ذخیره و دانلود شد.' : 'Database exported successfully.'
    });
  };

  const handleCreateSnapshot = () => {
    const backup = getFullBackup();
    const updated = StorageService.createSnapshot(snapshotLabel.trim(), backup);
    setSnapshots(updated);
    setSnapshotLabel('');
    setFeedbackMsg({
      type: 'success',
      text: isRtl ? 'نسخه پشتیبان فوری در حافظه پایدار ثبت شد.' : 'Instant snapshot saved.'
    });
  };

  const handleRestoreSnapshot = (snapId: string) => {
    if (confirm(isRtl ? 'آیا از بازگردانی این نسخه پشتیبان اطمینان دارید؟ اطلاعات فعلی جایگزین خواهند شد.' : 'Restore this snapshot?')) {
      const data = StorageService.restoreSnapshot(snapId);
      if (data) {
        onRestoreBackup(data);
        setFeedbackMsg({
          type: 'success',
          text: isRtl ? 'پایگاه داده با موفقیت به نسخه انتخابی بازگردانی شد.' : 'Snapshot restored successfully.'
        });
      }
    }
  };

  const handleDeleteSnapshot = (snapId: string) => {
    const next = StorageService.deleteSnapshot(snapId);
    setSnapshots(next);
  };

  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed: EnterpriseBackup = JSON.parse(text);
      if (Array.isArray(parsed.people)) {
        onRestoreBackup(parsed);
        StorageService.saveMainData(parsed);
        setFeedbackMsg({
          type: 'success',
          text: isRtl ? `پایگاه داده با ${parsed.people.length} پرسنل بازیابی شد.` : `Database restored (${parsed.people.length} people).`
        });
      } else {
        throw new Error('فرمت فایل معتبر نیست.');
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: isRtl ? 'خطا در خواندن فایل پایگاه داده: فرمت نامعتبر.' : 'Error reading JSON backup.'
      });
    }
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{isRtl ? 'پایگاه داده، پشتیبان‌گیری و سطوح دسترسی (RBAC)' : 'Database & Roles'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Enterprise
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRtl ? 'ذخیره‌سازی مستقل از مرورگر، بازیابی اسنپ‌شات و مدیریت دسترسی‌ها' : 'Safe storage & RBAC management'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50 dark:bg-slate-800/20 text-xs font-bold">
          <button
            onClick={() => setActiveTab('STORAGE')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'STORAGE'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            {isRtl ? 'ذخیره‌سازی و بکاپ فایلی' : 'File Database'}
          </button>
          <button
            onClick={() => setActiveTab('SNAPSHOTS')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'SNAPSHOTS'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {isRtl ? `نسخه‌های پشتیبان (${snapshots.length})` : `Snapshots (${snapshots.length})`}
          </button>
          <button
            onClick={() => setActiveTab('RBAC')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'RBAC'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            {isRtl ? 'سطوح دسترسی (RBAC)' : 'User Roles'}
          </button>
          <button
            onClick={() => {
              setActiveTab('PYTHON');
              checkBackend();
            }}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'PYTHON'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{isRtl ? 'سرور پایتون و SQLite' : 'Python SQLite'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus?.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div
            className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between ${
              feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: FILE STORAGE & BACKUP */}
          {activeTab === 'STORAGE' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">
                <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-200 mb-1 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  {isRtl ? 'پایگاه داده مستقل و فایل بکاپ جامع' : 'Independent File Database'}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isRtl
                    ? 'برای جلوگیری از از بین رفتن اطلاعات با پاک شدن کش مرورگر، پایگاه داده را با یک کلیک به‌صورت فایل استاندارد JSON استخراج کنید و هر زمان نیاز بود با یک درگ ساده بازیابی نمایید.'
                    : 'Download your complete database file to protect against browser cache clears.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-right flex flex-col justify-between gap-3 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-black text-sm">{isRtl ? 'دانلود کل پایگاه داده (.json)' : 'Download Database (.json)'}</span>
                    <Download className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-[11px] opacity-80">
                    شامل {people.length} پرسنل، {projects.length} پروژه و {processes.length} فرآیند BPMN
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => jsonInputRef.current?.click()}
                  className="p-4 rounded-2xl border-2 border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 text-right flex flex-col justify-between gap-3 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-black text-sm">{isRtl ? 'بازیابی از فایل بکاپ' : 'Restore from Backup'}</span>
                    <Upload className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-[11px] opacity-80">
                    انتخاب فایل JSON قبلی و بازگردانی فوری تمام اطلاعات
                  </span>
                </button>
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </div>

              {/* Storage Stats */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-slate-800 dark:text-slate-200">{isRtl ? 'مشخصات داده‌های در حال اجرا:' : 'Current Database Metrics:'}</h5>
                <div className="grid grid-cols-3 gap-3 text-center pt-1">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border">
                    <div className="font-black text-base text-indigo-600">{people.length}</div>
                    <div className="text-[10px] text-slate-500">پرسنل ثبت‌شده</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border">
                    <div className="font-black text-base text-purple-600">{projects.length}</div>
                    <div className="text-[10px] text-slate-500">پروژه‌های ماتریسی</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border">
                    <div className="font-black text-base text-emerald-600">{processes.length}</div>
                    <div className="text-[10px] text-slate-500">فرآیندهای BPMN</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTANT SNAPSHOTS */}
          {activeTab === 'SNAPSHOTS' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                  placeholder={isRtl ? 'عنوان یا برچسب نسخه پشتیبان (اختیاری)...' : 'Snapshot label...'}
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
                <button
                  type="button"
                  onClick={handleCreateSnapshot}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Clock className="w-4 h-4" />
                  <span>{isRtl ? 'ثبت اسنپ‌شات فوری' : 'Take Snapshot'}</span>
                </button>
              </div>

              {/* Snapshots List */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'نسخه‌های پشتیبان ذخیره‌شده:' : 'Available Snapshots:'}
                </h5>

                {snapshots.length === 0 ? (
                  <p className="text-center py-8 text-slate-400">
                    {isRtl ? 'هنوز اسنپ‌شاتی ثبت نشده است.' : 'No snapshots recorded yet.'}
                  </p>
                ) : (
                  snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{snap.label}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-700">
                            {snap.peopleCount} نفر
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(snap.timestamp).toLocaleString('fa-IR')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRestoreSnapshot(snap.id)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 rounded-lg font-bold flex items-center gap-1 text-[11px]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isRtl ? 'بازگردانی' : 'Restore'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSnapshot(snap.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RBAC USER ROLES */}
          {activeTab === 'RBAC' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 rounded-2xl">
                <h4 className="font-black text-sm text-purple-900 dark:text-purple-200 mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  {isRtl ? 'مدیریت سطوح دسترسی کاربران سازمانی (RBAC)' : 'Role-Based Access Control'}
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  {isRtl
                    ? 'برای آزمایش عملکرد سامانه با اختیارات محدود یا کامل، نقش کاربری فعال را انتخاب فرمایید:'
                    : 'Select active role to test permission boundaries.'}
                </p>
              </div>

              {/* Roles Cards */}
              <div className="space-y-2.5">
                {DEFAULT_USER_SESSIONS.map((session) => {
                  const perm = ROLE_PERMISSIONS[session.role];
                  const isCurrent = currentSession.role === session.role;

                  return (
                    <div
                      key={session.id}
                      onClick={() => onSwitchSession(session)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 ring-2 ring-purple-400 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                          style={{ backgroundColor: perm.badgeColor }}
                        >
                          {session.role === 'super_admin' ? 'SA' : session.role === 'org_architect' ? 'AR' : session.role === 'hr_manager' ? 'HR' : 'VI'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-slate-900 dark:text-slate-100">
                              {perm.labelFa}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-600 text-white">
                                نقش فعال
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {session.name} ({session.email})
                          </p>
                        </div>
                      </div>

                      {/* Permissions badges */}
                      <div className="text-[10px] font-bold text-slate-500 space-x-1.5 flex items-center">
                        <span className={perm.canEditStructure ? 'text-emerald-600' : 'text-slate-400'}>
                          {perm.canEditStructure ? '✓ ویرایش چارت' : '× بدون ویرایش'}
                        </span>
                        <span>•</span>
                        <span className={perm.canEditSalary ? 'text-emerald-600' : 'text-slate-400'}>
                          {perm.canEditSalary ? '✓ مشاهده حقوق' : '× حقوق مخفی'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PYTHON BACKEND & SQLITE */}
          {activeTab === 'PYTHON' && (
            <div className="space-y-4">
              {/* Server Status Header Box */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  backendStatus?.online
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
                      backendStatus?.online ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                  >
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                        {backendStatus?.online
                          ? isRtl ? 'سرور پایتون فعال و متصل است' : 'Python Server Online'
                          : isRtl ? 'سرور پایتون آفلاین (حالت لوکال مرورگر فعال است)' : 'Python Server Offline (Local Mode Active)'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          backendStatus?.online
                            ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                            : 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                        }`}
                      >
                        {backendStatus?.database || 'SQLite'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {backendStatus?.online
                        ? `${backendStatus.engine} — پورت محلی آماده تبادل داده`
                        : isRtl ? 'جهت راه‌اندازی دائمی، کافیست دستور python server.py را در ترمینال اجرا کنید.' : 'Run python server.py in your terminal.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={checkBackend}
                  disabled={isCheckingBackend}
                  className="p-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                  title={isRtl ? 'بررسی مجدد اتصال' : 'Refresh status'}
                >
                  <RefreshCw className={`w-4 h-4 ${isCheckingBackend ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSyncToPython}
                  disabled={isCheckingBackend}
                  className="p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900 hover:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-right flex flex-col justify-between group transition-all"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
                      <HardDrive className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      POST /api/org
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
                      {isRtl ? 'ارسال و ثبت داده‌ها در دیتابیس SQLite' : 'Sync to SQLite Backend'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {isRtl
                        ? 'ساختار سازمانی و فرآیندها مستقیماً در دیتابیس database.sqlite و فایل data_store.json ذخیره می‌شوند.'
                        : 'Persists organizational state directly into SQLite database.'}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleFetchFromPython}
                  disabled={isCheckingBackend}
                  className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-800 text-right flex flex-col justify-between group transition-all"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="p-2 rounded-xl bg-slate-700 text-white shadow-md">
                      <Download className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      GET /api/org
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
                      {isRtl ? 'بازیابی داده‌ها از دیتابیس SQLite' : 'Fetch from SQLite Backend'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {isRtl
                        ? 'دریافت آخرین داده‌های ذخیره شده در سرور پایتون و به‌روزرسانی آنی چارت.'
                        : 'Loads the latest saved state from Python SQLite database.'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Terminal Quick Start Snippet */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>دستورات راه‌اندازی سرور اختصاصی پایتون</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-sans">Zero Dependencies</span>
                </div>
                <div className="space-y-1.5 text-[11px] pt-1">
                  <p className="text-slate-400"># ۱. اجرای فوری سرور با کتابخانه استاندارد پایتون ۳:</p>
                  <div className="p-2 rounded bg-slate-950 text-emerald-400 select-all">
                    python3 server.py
                  </div>
                  <p className="text-slate-400 mt-2"># ۲. اجرای پیشرفته با فریمورک پرسرعت FastAPI (اختیاری):</p>
                  <div className="p-2 rounded bg-slate-950 text-indigo-300 select-all">
                    pip install -r requirements.txt &amp;&amp; uvicorn server:app --reload --port 8000
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
          >
            {isRtl ? 'بستن' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

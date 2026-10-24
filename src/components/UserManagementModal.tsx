import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Users,
  Check,
  AlertCircle,
  UserPlus,
  Key,
  Lock,
  Layers,
  Sparkles,
  ArrowRightLeft,
  Eye,
  Edit3,
  Trash2,
  FileSpreadsheet,
  DollarSign,
  Workflow,
  Database
} from 'lucide-react';
import { UserRole, UserSession } from '../types/pingonest';
import { ROLE_PERMISSIONS, DEFAULT_USER_SESSIONS } from '../services/storageService';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
  onSwitchSession: (session: UserSession) => void;
  allSessions: UserSession[];
  onAddSession?: (session: UserSession) => void;
  isRtl?: boolean;
}

export default function UserManagementModal({
  isOpen,
  onClose,
  currentSession,
  onSwitchSession,
  allSessions,
  onAddSession,
  isRtl = true
}: UserManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'ROLES' | 'MATRIX' | 'USERS'>('ROLES');

  // New user state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('employee_viewer');
  const [newDept, setNewDept] = useState('فنی و مهندسی');

  if (!isOpen) return null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newUser: UserSession = {
      id: `user_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      department: newDept
    };

    if (onAddSession) {
      onAddSession(newUser);
    }
    setNewName('');
    setNewEmail('');
    setShowAddUser(false);
  };

  const roleEntries = Object.entries(ROLE_PERMISSIONS) as [UserRole, typeof ROLE_PERMISSIONS[UserRole]][];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {isRtl ? 'مدیریت کاربران و طبقه‌بندی سطوح دسترسی (RBAC)' : 'User Directory & Role-Based Access Control'}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Enterprise Security
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isRtl
                  ? 'دسته‌بندی اختیارات مدیران، معماران فرآیند، مدیران منابع انسانی و پرسنل با تضمین حریم خصوصی'
                  : 'Manage role hierarchy, permissions matrix, and enterprise access levels'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Role Indicator */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: ROLE_PERMISSIONS[currentSession.role]?.badgeColor || '#4F46E5' }} />
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400">{isRtl ? 'نقش فعال شما:' : 'Current Role:'}</div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {ROLE_PERMISSIONS[currentSession.role]?.labelFa}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ROLES')}
            className={`px-4 py-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ROLES'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>{isRtl ? 'طبقه‌بندی و تعریف نقش‌ها (۶ سطح)' : 'Role Hierarchy (6 Tiers)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`px-4 py-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'MATRIX'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isRtl ? 'ماتریس دسترسی‌ها و مجوزها (Matrix)' : 'Permissions Matrix'}</span>
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'USERS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isRtl ? 'فهرست کاربران و اکانت‌ها' : 'User Accounts & Directory'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
              {allSessions.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ROLES HIERARCHY */}
          {activeTab === 'ROLES' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-indigo-900 dark:text-indigo-200">
                  <span className="font-black">{isRtl ? 'سیستم یکپارچه تفکیک وظایف (SoD): ' : 'Segregation of Duties: '}</span>
                  {isRtl
                    ? 'هر نقش سازمانی دارای مرزهای مشخص امنیتی است. برای بررسی و تست کارایی سیستم از دید هر نقش، دکمه «سوییچ به این نقش» را روی هر کارت کلیک کنید.'
                    : 'Each enterprise role enforces security boundaries. Click "Switch to this Role" on any card to test the application under that role.'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleEntries.map(([roleKey, role]) => {
                  const isCurrent = currentSession.role === roleKey;
                  return (
                    <div
                      key={roleKey}
                      className={`rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/30 shadow-lg'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span
                            className="px-2.5 py-1 rounded-xl text-xs font-black text-white shadow-sm"
                            style={{ backgroundColor: role.badgeColor }}
                          >
                            {role.labelFa}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              {isRtl ? 'نقش فعال' : 'Active'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 font-semibold leading-relaxed">
                          {role.descriptionFa}
                        </p>

                        {/* Capability Badges */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>{isRtl ? 'ویرایش ساختار چارت:' : 'Edit Structure:'}</span>
                            <span className={role.canEditStructure ? 'font-black text-emerald-600' : 'text-rose-500'}>
                              {role.canEditStructure ? '✓ مجاز' : '✗ غیرمجاز'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>{isRtl ? 'مشاهده حقوق و دستمزد:' : 'View Salaries:'}</span>
                            <span className={role.canEditSalary ? 'font-black text-emerald-600' : 'text-rose-500'}>
                              {role.canEditSalary ? '✓ مجاز (محرمانه)' : '✗ فاقد دسترسی'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>{isRtl ? 'فرآیندهای BPMN و Signavio:' : 'BPMN Studio:'}</span>
                            <span className={role.canEditBpmn ? 'font-black text-emerald-600' : 'text-rose-500'}>
                              {role.canEditBpmn ? '✓ مجاز' : '✗ فقط مشاهده'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>{isRtl ? 'پشتیبان‌گیری و دیتابیس:' : 'Backups & DB:'}</span>
                            <span className={role.canCreateBackup ? 'font-black text-emerald-600' : 'text-rose-500'}>
                              {role.canCreateBackup ? '✓ مجاز' : '✗ فاقد دسترسی'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            const matching = allSessions.find((s) => s.role === roleKey) || {
                              id: `user_${roleKey}`,
                              name: role.labelFa,
                              role: roleKey,
                              email: `${roleKey}@pingonest.org`
                            };
                            onSwitchSession(matching);
                          }}
                          disabled={isCurrent}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                            isCurrent
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95'
                          }`}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>{isCurrent ? (isRtl ? 'در حال استفاده' : 'Currently Active') : (isRtl ? 'سوییچ به این نقش' : 'Switch to this Role')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PERMISSIONS MATRIX */}
          {activeTab === 'MATRIX' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-black text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3.5">{isRtl ? 'مجوز / عملیات سازمان' : 'Permission / Action'}</th>
                      <th className="p-3.5 text-center text-rose-600">{isRtl ? 'سوپر ادمین' : 'Super Admin'}</th>
                      <th className="p-3.5 text-center text-purple-600">{isRtl ? 'معمار سازمان' : 'Architect'}</th>
                      <th className="p-3.5 text-center text-emerald-600">{isRtl ? 'مدیر HR' : 'HR Manager'}</th>
                      <th className="p-3.5 text-center text-amber-600">{isRtl ? 'سرپرست بخش' : 'Dept Lead'}</th>
                      <th className="p-3.5 text-center text-sky-600">{isRtl ? 'ممیز ریسک' : 'Auditor'}</th>
                      <th className="p-3.5 text-center text-slate-500">{isRtl ? 'پرسنل عادی' : 'Viewer'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { title: 'ویرایش ساختار چارت و افزودن گره', sa: true, ar: true, hr: true, dl: true, au: false, vi: false },
                      { title: 'ترسیم و ویرایش خطوط روابط بین‌واحدی', sa: true, ar: true, hr: true, dl: true, au: false, vi: false },
                      { title: 'بارگذاری عکس پرسنل و ویرایش احکام', sa: true, ar: false, hr: true, dl: false, au: false, vi: false },
                      { title: 'مشاهده اطلاعات محرمانه حقوق و دستمزد', sa: true, ar: false, hr: true, dl: false, au: false, vi: false },
                      { title: 'طراحی استودیوی فرآیند BPMN 2.0 (Signavio)', sa: true, ar: true, hr: false, dl: false, au: false, vi: false },
                      { title: 'شبیه‌سازی هزینه فرآیند و ماتریس ریسک RCM', sa: true, ar: true, hr: false, dl: false, au: true, vi: false },
                      { title: 'تخصیص پرسنل به پروژه‌های ماتریسی', sa: true, ar: true, hr: true, dl: true, au: false, vi: false },
                      { title: 'دانلود فایل پروژه (.pingo) و بکاپ روی هارد', sa: true, ar: true, hr: true, dl: false, au: true, vi: false },
                      { title: 'مدیریت کاربران، تغییر نقش‌ها و سطوح دسترسی', sa: true, ar: false, hr: false, dl: false, au: false, vi: false },
                      { title: 'خروجی اکسل سازمانی و گزارش تفاضلی OrgDiff', sa: true, ar: true, hr: true, dl: true, au: true, vi: false }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{row.title}</td>
                        <td className="p-3.5 text-center">{row.sa ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                        <td className="p-3.5 text-center">{row.ar ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                        <td className="p-3.5 text-center">{row.hr ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                        <td className="p-3.5 text-center">{row.dl ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                        <td className="p-3.5 text-center">{row.au ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                        <td className="p-3.5 text-center">{row.vi ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USER ACCOUNTS DIRECTORY */}
          {activeTab === 'USERS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                    {isRtl ? 'کاربران فعال سامانه' : 'Enterprise Users'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'مدیریت حساب‌های سازمانی و سوییچ سریع به عنوان هر کاربر' : 'Manage organizational accounts and impersonate sessions'}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isRtl ? 'افزودن کاربر جدید' : 'New User'}</span>
                </button>
              </div>

              {/* Add User Drawer / Form */}
              {showAddUser && (
                <form onSubmit={handleCreateUser} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-indigo-600" />
                    <span>{isRtl ? 'ثبت کاربر سازمانی جدید با تعیین سطح دسترسی' : 'Create New User with Role'}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">{isRtl ? 'نام و نام خانوادگی' : 'Full Name'}</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={isRtl ? 'مثلاً: مهندس سارا ناصری' : 'e.g. Sara Naseri'}
                        required
                        className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">{isRtl ? 'پست الکترونیکی' : 'Email'}</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="sara.naseri@company.com"
                        required
                        className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">{isRtl ? 'نقش و سطح دسترسی' : 'Assigned Role'}</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        {roleEntries.map(([k, r]) => (
                          <option key={k} value={k}>{r.labelFa}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">{isRtl ? 'دپارتمان' : 'Department'}</label>
                      <input
                        type="text"
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        placeholder={isRtl ? 'فنی و مهندسی' : 'Engineering'}
                        className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      {isRtl ? 'انصراف' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      {isRtl ? 'ذخیره کاربر' : 'Create User'}
                    </button>
                  </div>
                </form>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 font-black text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3.5">{isRtl ? 'نام کاربر' : 'Name'}</th>
                      <th className="p-3.5">{isRtl ? 'ایمیل سازمانی' : 'Email'}</th>
                      <th className="p-3.5">{isRtl ? 'دپارتمان' : 'Department'}</th>
                      <th className="p-3.5">{isRtl ? 'سطح دسترسی (Role)' : 'Role'}</th>
                      <th className="p-3.5 text-center">{isRtl ? 'عملیات' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {allSessions.map((session) => {
                      const isCurrent = currentSession.id === session.id;
                      const roleMeta = ROLE_PERMISSIONS[session.role] || ROLE_PERMISSIONS.employee_viewer;
                      return (
                        <tr key={session.id} className={isCurrent ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: roleMeta.badgeColor }} />
                            <span>{session.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-bold">
                                {isRtl ? 'شما' : 'You'}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{session.email}</td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400">{session.department || '—'}</td>
                          <td className="p-3.5">
                            <span
                              className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white"
                              style={{ backgroundColor: roleMeta.badgeColor }}
                            >
                              {roleMeta.labelFa}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => onSwitchSession(session)}
                              disabled={isCurrent}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                isCurrent
                                  ? 'text-slate-400 cursor-default'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {isCurrent ? (isRtl ? 'فعال' : 'Active') : (isRtl ? 'ورود به عنوان این کاربر' : 'Login as User')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>
              {isRtl
                ? 'پروتکل امنیتی سطح سازمانی (RBAC Enforced) — تغییرات نقش بلافاصله در کل چارت و فرآیندها اعمال می‌گردد.'
                : 'Enterprise Role-Based Access Control active.'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-black transition-all"
          >
            {isRtl ? 'بستن پنجره' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

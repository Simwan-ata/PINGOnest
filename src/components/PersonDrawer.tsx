import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Camera,
  Trash2,
  Briefcase,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  FolderPlus,
  Users,
  ShieldCheck,
  Check,
  AlertCircle,
  Link,
  GraduationCap,
  Calendar,
  Award,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { PersonNode, ProjectEntity, StatusType, CustomRelationship } from '../types/pingonest';
import { HierarchyEngine } from '../services/analyticsService';
import { HierarchyValidator, MoveValidationResult } from '../services/hierarchyValidator';
import MoveWarningModal from './MoveWarningModal';
import PersonAvatar, { detectGender } from './PersonAvatar';
import { RELATIONSHIP_CONFIG } from './OrgChartCanvas';

interface PersonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  person: PersonNode | null;
  allPeople: PersonNode[];
  projects: ProjectEntity[];
  onSave: (updated: PersonNode) => void;
  onDelete: (id: string) => void;
  isRtl: boolean;
}

export default function PersonDrawer({
  isOpen,
  onClose,
  person,
  allPeople,
  projects,
  onSave,
  onDelete,
  isRtl
}: PersonDrawerProps) {
  if (!isOpen) return null;

  const isNew = !person?.id;
  const [formData, setFormData] = useState<PersonNode>(() => {
    if (person) return JSON.parse(JSON.stringify(person));
    return {
      id: `100${allPeople.length + 1}`,
      name: '',
      title: '',
      department: allPeople[0]?.department || 'فنی و مهندسی',
      parentId: allPeople[0]?.id || '',
      level: 2,
      subCount: 0,
      status: 'فعال',
      gender: 'male',
      employeeCode: `EMP-${1000 + allPeople.length + 1}`,
      nationalId: '',
      contractType: 'official',
      employmentStatus: 'active',
      education: 'کارشناسی مهندسی کامپیوتر',
      jobGrade: 'کارشناس ارشد',
      hireDate: '1401/01/15',
      salary: 55000000,
      email: '',
      phone: '',
      location: 'تهران — دفتر مرکزی',
      skills: ['مدیریت پروژه', 'حل مسئله'],
      projectRoles: [],
      customRels: []
    };
  });

  const [activeTab, setActiveTab] = useState<'GENERAL' | 'COMPREHENSIVE' | 'PROJECTS' | 'RELATIONSHIPS'>('GENERAL');
  const [newSkillText, setNewSkillText] = useState('');

  // Selected new project to add
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectRole, setNewProjectRole] = useState('عضو تیم');
  const [newProjectAlloc, setNewProjectAlloc] = useState<number>(30);

  // New relationship inside drawer
  const [newRelTargetId, setNewRelTargetId] = useState<string>('');
  const [newRelType, setNewRelType] = useState<CustomRelationship['typeId']>('matrix');
  const [newRelDir, setNewRelDir] = useState<'oneway' | 'twoway'>('oneway');
  const [newRelNote, setNewRelNote] = useState<string>('');

  useEffect(() => {
    if (person) {
      const copy = JSON.parse(JSON.stringify(person));
      if (!copy.gender) copy.gender = detectGender(copy.name);
      if (!copy.contractType) copy.contractType = 'official';
      if (!copy.employmentStatus) copy.employmentStatus = 'active';
      setFormData(copy);
    }
  }, [person]);

  const departments = Array.from(new Set(allPeople.map((p) => p.department)));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = () => {
    if (!newSkillText.trim()) return;
    const current = formData.skills || [];
    if (!current.includes(newSkillText.trim())) {
      setFormData({ ...formData, skills: [...current, newSkillText.trim()] });
    }
    setNewSkillText('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: (formData.skills || []).filter((s) => s !== skill)
    });
  };

  const handleAddProject = () => {
    if (!newProjectName) return;
    const existing = formData.projectRoles || [];
    setFormData({
      ...formData,
      projectRoles: [
        ...existing,
        { project: newProjectName, role: newProjectRole, allocation: newProjectAlloc }
      ]
    });
    setNewProjectName('');
  };

  const handleRemoveProject = (index: number) => {
    const next = [...(formData.projectRoles || [])];
    next.splice(index, 1);
    setFormData({ ...formData, projectRoles: next });
  };

  const handleAddCustomRel = () => {
    if (!newRelTargetId || newRelTargetId === formData.id) return;
    const existing = formData.customRels || [];
    const updated = [
      ...existing,
      {
        toId: newRelTargetId,
        typeId: newRelType,
        direction: newRelDir,
        strength: 3,
        confidence: 'confirmed' as const,
        note: newRelNote
      }
    ];
    setFormData({ ...formData, customRels: updated });
    setNewRelTargetId('');
    setNewRelNote('');
  };

  const handleRemoveCustomRel = (index: number) => {
    const next = [...(formData.customRels || [])];
    next.splice(index, 1);
    setFormData({ ...formData, customRels: next });
  };

  const [pendingDrawerValidation, setPendingDrawerValidation] = useState<MoveValidationResult | null>(null);

  const handleConfirmMoveFromDrawerModal = (syncDepartment: boolean) => {
    if (!pendingDrawerValidation) return;
    const targetDept = pendingDrawerValidation.targetPerson.department;
    const updated: PersonNode = {
      ...formData,
      parentId: pendingDrawerValidation.targetPerson.id,
      department: syncDepartment ? targetDept : formData.department
    };
    onSave(updated);
    setPendingDrawerValidation(null);
    onClose();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(isRtl ? 'لطفاً نام شخص را وارد کنید.' : 'Please enter the name.');
      return;
    }

    // Comprehensive Hierarchy Movement & Illogical Position Check
    if (formData.parentId && formData.id && formData.parentId !== person?.parentId) {
      const validation = HierarchyValidator.validateMove(allPeople, formData.id, formData.parentId);
      if (validation && (!validation.canProceed || validation.hasWarnings)) {
        setPendingDrawerValidation(validation);
        return;
      }
    }

    onSave(formData);
    onClose();
  };

  const directSubordinates = allPeople.filter((p) => p.parentId === formData.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                {isNew ? (isRtl ? 'ثبت پرسنل جدید' : 'New Personnel') : (isRtl ? 'شناسنامه جامع پرسنل' : 'Personnel Profile')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formData.name || (isRtl ? 'مشخصات فردی و جایگاه سازمانی' : 'Personal & Org Details')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50 dark:bg-slate-800/20 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('GENERAL')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'GENERAL'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {isRtl ? 'اطلاعات اصلی' : 'General'}
          </button>
          <button
            onClick={() => setActiveTab('COMPREHENSIVE')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'COMPREHENSIVE'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            {isRtl ? 'اطلاعات جامع و استخدامی' : 'HR & Contract'}
          </button>
          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'PROJECTS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            {isRtl ? `پروژه‌ها (${formData.projectRoles?.length || 0})` : `Projects (${formData.projectRoles?.length || 0})`}
          </button>
          <button
            onClick={() => setActiveTab('RELATIONSHIPS')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'RELATIONSHIPS'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            {isRtl ? `روابط و ماتریس (${formData.customRels?.length || 0})` : `Relationships (${formData.customRels?.length || 0})`}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: GENERAL */}
          {activeTab === 'GENERAL' && (
            <>
              {/* Photo & Gender & Avatar Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex items-center gap-4">
                <div className="relative">
                  <PersonAvatar
                    photo={formData.photo}
                    gender={formData.gender}
                    name={formData.name || 'کارمند'}
                    size={72}
                    status={formData.status}
                  />
                  <label className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-full shadow-md cursor-pointer hover:bg-indigo-700 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      {isRtl ? 'جنسیت (جهت نمایش کاراکتر اختصاصی)' : 'Gender (Character Avatar)'}
                    </span>
                    {formData.photo && (
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, photo: undefined }))}
                        className="text-[11px] text-rose-500 hover:underline"
                      >
                        {isRtl ? 'حذف عکس (استفاده از کاراکتر)' : 'Remove photo'}
                      </button>
                    )}
                  </div>

                  {/* Gender Selector Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, gender: 'male' }))}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        formData.gender === 'male'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400'
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>👨 آقا (مرد)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, gender: 'female' }))}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        formData.gender === 'female'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400'
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>👩 خانم (زن)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'نام و نام خانوادگی' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'عنوان شغلی / سمت' : 'Job Title'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              {/* Department & Manager */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'دپارتمان' : 'Department'}
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'مدیر مستقیم' : 'Direct Manager'}
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="">{isRtl ? '— ریشه بالاترین سطح (هیئت مدیره/مدیرعامل) —' : '— Top Root —'}</option>
                    {allPeople
                      .filter((p) => p.id !== formData.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.title})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Status and Salary */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'وضعیت' : 'Status'}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusType })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="فعال">فعال (Active)</option>
                    <option value="غیرفعال">غیرفعال (Inactive)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'حقوق ماهانه (تومان)' : 'Monthly Salary'}
                  </label>
                  <input
                    type="number"
                    value={formData.salary || 0}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'ایمیل سازمانی' : 'Corporate Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'شماره تماس' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0912..."
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {/* TAB 2: COMPREHENSIVE HR DETAILS */}
          {activeTab === 'COMPREHENSIVE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <h4 className="font-black text-xs text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-indigo-600" />
                  {isRtl ? 'شناسنامه پرسنلی و حقوقی ۳۶۰ درجه' : '360° HR & Contract Records'}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {isRtl ? 'مشخصات تکمیلی، نوع قرارداد، گرید سازمانی و سوابق تحصیلی' : 'Comprehensive employee records'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'کد پرسنلی' : 'Employee ID'}
                  </label>
                  <input
                    type="text"
                    value={formData.employeeCode || ''}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    placeholder="EMP-1042"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'کد ملی' : 'National ID'}
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId || ''}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="0012345678"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'نوع قرارداد' : 'Contract Type'}
                  </label>
                  <select
                    value={formData.contractType || 'official'}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="official">قرارداد رسمی (Official)</option>
                    <option value="contractual">قرارداد پیمانی (Contractual)</option>
                    <option value="project">قرارداد پروژه‌ای (Project-based)</option>
                    <option value="hourly">ساعتی / پاره‌وقت (Part-time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'وضعیت اشتغال' : 'Employment Status'}
                  </label>
                  <select
                    value={formData.employmentStatus || 'active'}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as any })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="active">اشتغال فعال (Active)</option>
                    <option value="leave">مرخصی استعلاجی / تحصیلی (On Leave)</option>
                    <option value="suspended">تعلیق موقت (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'گرید / رده شغلی' : 'Job Grade'}
                  </label>
                  <input
                    type="text"
                    value={formData.jobGrade || ''}
                    onChange={(e) => setFormData({ ...formData, jobGrade: e.target.value })}
                    placeholder="مثلاً: کارشناس ارشد، مدیر میانی، سرپرست"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'تاریخ استخدام' : 'Hire Date'}
                  </label>
                  <input
                    type="text"
                    value={formData.hireDate || ''}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    placeholder="1401/02/10"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'تحصیلات و رشته' : 'Education'}
                </label>
                <input
                  type="text"
                  value={formData.education || ''}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="کارشناسی ارشد مدیریت فناوری اطلاعات — دانشگاه تهران"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Skills Tag Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'مهارت‌ها و شایستگی‌ها' : 'Skills & Competencies'}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkillText}
                    onChange={(e) => setNewSkillText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder={isRtl ? 'تایپ مهارت جدید...' : 'Type skill...'}
                    className="flex-1 text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    + {isRtl ? 'افزودن' : 'Add'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formData.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 border border-indigo-200/50"
                    >
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-rose-600">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'PROJECTS' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-2">
                  {isRtl ? 'انتساب به پروژه ماتریسی جدید' : 'Assign to Matrix Project'}
                </h4>
                <div className="space-y-2">
                  <select
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="">{isRtl ? '— انتخاب پروژه —' : '— Select Project —'}</option>
                    {projects.map((proj) => (
                      <option key={proj.name} value={proj.name}>
                        {proj.name} ({proj.code})
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newProjectRole}
                      onChange={(e) => setNewProjectRole(e.target.value)}
                      placeholder={isRtl ? 'نقش در پروژه' : 'Role'}
                      className="text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={newProjectAlloc}
                        onChange={(e) => setNewProjectAlloc(Number(e.target.value))}
                        className="w-16 text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
                      />
                      <span className="text-xs font-bold text-slate-600">% {isRtl ? 'تخصیص' : 'Alloc'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    + {isRtl ? 'افزودن به پروژه' : 'Add to Project'}
                  </button>
                </div>
              </div>

              {/* Current Projects List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">
                  {isRtl ? 'پروژه‌های فعال این شخص' : 'Active Project Allocations'}
                </h4>
                {(!formData.projectRoles || formData.projectRoles.length === 0) ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                    {isRtl ? 'هنوز به پروژه‌ای اختصاص داده نشده است.' : 'No project roles assigned yet.'}
                  </p>
                ) : (
                  formData.projectRoles.map((pr, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">{pr.project}</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {pr.role} • {pr.allocation}% از زمان کاری
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RELATIONSHIPS */}
          {activeTab === 'RELATIONSHIPS' && (
            <div className="space-y-5">
              {/* Form to add custom relationship */}
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/60 space-y-3">
                <h4 className="font-black text-xs text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Link className="w-4 h-4 text-purple-600" />
                  {isRtl ? 'افزودن رابطه سفارشی با سایر پرسنل' : 'Add Custom Relationship'}
                </h4>

                <div className="space-y-2">
                  <select
                    value={newRelTargetId}
                    onChange={(e) => setNewRelTargetId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="">{isRtl ? '— انتخاب شخص مقصد —' : '— Select Target Person —'}</option>
                    {allPeople
                      .filter((p) => p.id !== formData.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.title} — {p.department})
                        </option>
                      ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newRelType}
                      onChange={(e) => setNewRelType(e.target.value as any)}
                      className="text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      {Object.entries(RELATIONSHIP_CONFIG).map(([typeId, cfg]) => (
                        <option key={typeId} value={typeId}>
                          {cfg.labelFa}
                        </option>
                      ))}
                    </select>

                    <select
                      value={newRelDir}
                      onChange={(e) => setNewRelDir(e.target.value as any)}
                      className="text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      <option value="oneway">{isRtl ? 'یک‌طرفه' : 'One-way'}</option>
                      <option value="twoway">{isRtl ? 'دوطرفه (متقابل)' : 'Two-way'}</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={newRelNote}
                    onChange={(e) => setNewRelNote(e.target.value)}
                    placeholder={isRtl ? 'یادداشت یا علت رابطه...' : 'Notes...'}
                    className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />

                  <button
                    type="button"
                    onClick={handleAddCustomRel}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30"
                  >
                    + {isRtl ? 'ثبت رابطه در چارت' : 'Attach Relationship'}
                  </button>
                </div>
              </div>

              {/* Existing Custom Relationships */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2">
                  {isRtl ? `روابط افقی و ماتریسی متصل (${formData.customRels?.length || 0})` : `Connected Custom Relationships (${formData.customRels?.length || 0})`}
                </h4>
                {(!formData.customRels || formData.customRels.length === 0) ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
                    {isRtl ? 'رابطه جانبی با سایر افراد ثبت نشده است.' : 'No custom relationships registered.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.customRels.map((rel, idx) => {
                      const target = allPeople.find((p) => p.id === rel.toId);
                      const cfg = RELATIONSHIP_CONFIG[rel.typeId] || RELATIONSHIP_CONFIG.other;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                <span>{target?.name || rel.toId}</span>
                                <span
                                  className="px-2 py-0.5 rounded text-[10px]"
                                  style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                                >
                                  {cfg.labelFa}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {rel.direction === 'twoway' ? 'متقابل (دوطرفه)' : 'یک‌طرفه'} {rel.note ? `• ${rel.note}` : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomRel(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Direct Subordinates List */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2">
                  {isRtl ? `زیرمجموعه‌های مستقیم (${directSubordinates.length} نفر)` : `Direct Subordinates (${directSubordinates.length})`}
                </h4>
                {directSubordinates.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
                    {isRtl ? 'این شخص زیرمجموعه مستقیمی ندارد.' : 'No direct subordinates.'}
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {directSubordinates.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{sub.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 mx-1.5">({sub.title})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700">
                          {sub.department}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {!isNew && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(isRtl ? 'آیا از حذف این شخص اطمینان دارید؟' : 'Delete this person?')) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
              >
                {isRtl ? 'حذف از چارت' : 'Delete'}
              </button>
            )}
            <div className="flex items-center gap-2 mr-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                {isRtl ? 'ذخیره تغییرات' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Movement Validation Modal in Drawer */}
      <MoveWarningModal
        isOpen={!!pendingDrawerValidation}
        validationResult={pendingDrawerValidation}
        onClose={() => setPendingDrawerValidation(null)}
        onConfirmMove={handleConfirmMoveFromDrawerModal}
        isRtl={isRtl}
      />
    </div>
  );
}

/**
 * PingoNest Pro - Enterprise Storage & RBAC Service
 * Provides multi-slot snapshots, JSON backup/restore, auto-recovery,
 * and Role-Based Access Control (RBAC) permission guards.
 */

import { PersonNode, ProjectEntity, BpmnProcess, JobPosition, UserRole, UserSession } from '../types/pingonest';

export interface EnterpriseBackup {
  version: string;
  timestamp: string;
  orgName: string;
  people: PersonNode[];
  projects: ProjectEntity[];
  processes: BpmnProcess[];
  jobs?: JobPosition[];
  metadata?: {
    totalEmployees: number;
    totalDepts: number;
    exportedBy: string;
  };
}

export interface StorageSnapshot {
  id: string;
  label: string;
  timestamp: string;
  peopleCount: number;
  data: EnterpriseBackup;
}

const STORAGE_KEY_MAIN = 'pingonest_enterprise_data_v4';
const STORAGE_KEY_SNAPSHOTS = 'pingonest_snapshots_history_v4';
const STORAGE_KEY_USER_SESSION = 'pingonest_current_session_v4';

export const DEFAULT_USER_SESSIONS: UserSession[] = [
  {
    id: 'user_super_admin',
    name: 'علیرضا ترانه‌جو (مدیر ارشد سامانه)',
    email: 'taranejoo.alireza@gmail.com',
    role: 'super_admin',
    department: 'هیئت مدیره'
  },
  {
    id: 'user_architect',
    name: 'معمار ارشد سازمان و متدولوژی Signavio',
    email: 'architect@pingonest.org',
    role: 'org_architect',
    department: 'معماری و فرآیندها'
  },
  {
    id: 'user_hr_manager',
    name: 'مدیر کل منابع انسانی و امور پرسنلی',
    email: 'hr.director@pingonest.org',
    role: 'hr_manager',
    department: 'منابع انسانی'
  },
  {
    id: 'user_dept_lead',
    name: 'مهندس مریم فراهانی (سرپرست دپارتمان فنی)',
    email: 'm.farahani@pingonest.org',
    role: 'dept_lead',
    department: 'فنی و مهندسی'
  },
  {
    id: 'user_compliance',
    name: 'حسابرس ریسک و کنترل‌های داخلی (RCM)',
    email: 'auditor@pingonest.org',
    role: 'compliance_auditor',
    department: 'حسابرسی و انطباق'
  },
  {
    id: 'user_viewer',
    name: 'پرسنل سازمان (مشاهده‌گر چارت و پرتال)',
    email: 'employee@pingonest.org',
    role: 'employee_viewer',
    department: 'عمومی'
  }
];

export const ROLE_PERMISSIONS: Record<UserRole, {
  labelFa: string;
  labelEn: string;
  descriptionFa: string;
  canEditStructure: boolean;
  canDeleteNodes: boolean;
  canEditSalary: boolean;
  canEditBpmn: boolean;
  canCreateBackup: boolean;
  canManageUsers: boolean;
  canManageRelationships: boolean;
  badgeColor: string;
}> = {
  super_admin: {
    labelFa: 'مدیر کل سامانه (Super Admin)',
    labelEn: 'Super Administrator',
    descriptionFa: 'دسترسی تام و بی‌نهایت به تمام ساختارها، پرسنل، حقوق، فرآیندها، پشتیبان‌گیری و تخصیص نقش‌ها',
    canEditStructure: true,
    canDeleteNodes: true,
    canEditSalary: true,
    canEditBpmn: true,
    canCreateBackup: true,
    canManageUsers: true,
    canManageRelationships: true,
    badgeColor: '#DC2626'
  },
  org_architect: {
    labelFa: 'معمار سازمان و طراح فرآیند (Signavio Lead)',
    labelEn: 'Enterprise & Process Architect',
    descriptionFa: 'طراحی ساختار کلان چارت، ترسیم روابط بین‌واحدی و استودیوی فرآیندهای BPMN 2.0 (فاقد دیدن حقوق)',
    canEditStructure: true,
    canDeleteNodes: true,
    canEditSalary: false,
    canEditBpmn: true,
    canCreateBackup: true,
    canManageUsers: false,
    canManageRelationships: true,
    badgeColor: '#7C3AED'
  },
  hr_manager: {
    labelFa: 'مدیر منابع انسانی (HR Director)',
    labelEn: 'HR Director',
    descriptionFa: 'مدیریت ۳۶۰ درجه پرسنل، تصویر و احکام، حقوق و دستمزد، استخدام و ارتقاء رتبه',
    canEditStructure: true,
    canDeleteNodes: false,
    canEditSalary: true,
    canEditBpmn: false,
    canCreateBackup: true,
    canManageUsers: false,
    canManageRelationships: true,
    badgeColor: '#059669'
  },
  dept_lead: {
    labelFa: 'مدیر دپارتمان / سرپرست میانی (Dept Lead)',
    labelEn: 'Department Lead',
    descriptionFa: 'مدیریت و ارزیابی اعضای تیم دپارتمان تخصصی خود و تخصیص پروژه‌های ماتریسی',
    canEditStructure: true,
    canDeleteNodes: false,
    canEditSalary: false,
    canEditBpmn: false,
    canCreateBackup: false,
    canManageUsers: false,
    canManageRelationships: true,
    badgeColor: '#D97706'
  },
  compliance_auditor: {
    labelFa: 'ممیز فرآیند و کنترل‌های داخلی (Auditor)',
    labelEn: 'Compliance & Risk Auditor',
    descriptionFa: 'مشاهده و ممیزی فرآیندهای Signavio، تحلیل ماتریس ریسک و کنترل RCM و سلامت داده‌ها (فقط خواندنی)',
    canEditStructure: false,
    canDeleteNodes: false,
    canEditSalary: false,
    canEditBpmn: false,
    canCreateBackup: true,
    canManageUsers: false,
    canManageRelationships: false,
    badgeColor: '#0284C7'
  },
  employee_viewer: {
    labelFa: 'بیننده سازمانی / کارمند (Employee)',
    labelEn: 'Employee / Viewer',
    descriptionFa: 'دسترسی فقط‌خواندنی به چارت سازمانی، پرتال ارتباطی و اطلاعات عمومی همکاران',
    canEditStructure: false,
    canDeleteNodes: false,
    canEditSalary: false,
    canEditBpmn: false,
    canCreateBackup: false,
    canManageUsers: false,
    canManageRelationships: false,
    badgeColor: '#64748B'
  }
};

export class StorageService {
  /**
   * Save complete organizational state
   */
  static saveMainData(backup: EnterpriseBackup): boolean {
    try {
      localStorage.setItem(STORAGE_KEY_MAIN, JSON.stringify(backup));
      return true;
    } catch (e) {
      console.error('Failed to save data to localStorage:', e);
      return false;
    }
  }

  /**
   * Load complete organizational state
   */
  static loadMainData(): EnterpriseBackup | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MAIN);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load data:', e);
      return null;
    }
  }

  /**
   * Create an automated timestamped snapshot
   */
  static createSnapshot(label: string, backup: EnterpriseBackup): StorageSnapshot[] {
    try {
      const existing = this.getSnapshots();
      const newSnapshot: StorageSnapshot = {
        id: `snap_${Date.now()}`,
        label: label || `نسخه خودکار ${new Date().toLocaleTimeString('fa-IR')}`,
        timestamp: new Date().toISOString(),
        peopleCount: backup.people.length,
        data: backup
      };
      // Keep last 15 snapshots
      const updated = [newSnapshot, ...existing].slice(0, 15);
      localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to create snapshot:', e);
      return [];
    }
  }

  /**
   * Get all available snapshots
   */
  static getSnapshots(): StorageSnapshot[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  /**
   * Restore a specific snapshot
   */
  static restoreSnapshot(snapshotId: string): EnterpriseBackup | null {
    const list = this.getSnapshots();
    const found = list.find((s) => s.id === snapshotId);
    if (found) {
      this.saveMainData(found.data);
      return found.data;
    }
    return null;
  }

  /**
   * Delete a snapshot
   */
  static deleteSnapshot(snapshotId: string): StorageSnapshot[] {
    const list = this.getSnapshots().filter((s) => s.id !== snapshotId);
    localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(list));
    return list;
  }

  /**
   * Export all data as a downloadable JSON file
   */
  static downloadBackupFile(backup: EnterpriseBackup, filename?: string) {
    const str = JSON.stringify(backup, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `PingoNest-Database-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get Current User Session (Defaults to Super Admin)
   */
  static getCurrentSession(): UserSession {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER_SESSION);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return DEFAULT_USER_SESSIONS[0]; // Super Admin default
  }

  /**
   * Get all predefined & available user sessions
   */
  static getAvailableSessions(): UserSession[] {
    return DEFAULT_USER_SESSIONS;
  }

  /**
   * Set Current User Session
   */
  static setCurrentSession(session: UserSession) {
    localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(session));
  }
}


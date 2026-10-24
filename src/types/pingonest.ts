/**
 * PingoNest Pro - Comprehensive Type Definitions
 * Unifies Org Chart, BPMN 2.0, Matrix Projects, RACI Engine, Analytics, and ST1 Bridge
 */

export type StatusType = 'فعال' | 'غیرفعال' | 'Active' | 'Inactive';

export interface ProjectRole {
  project: string;
  role: string;
  allocation: number; // 0 - 100 %
}

export interface CustomRelationship {
  toId: string;
  typeId: 'functional' | 'advisory' | 'matrix' | 'project' | 'dependency' | 'collaboration' | 'information' | 'influence' | 'other';
  direction: 'oneway' | 'twoway';
  strength: number; // 1 to 5
  confidence: 'confirmed' | 'reported' | 'inferred';
  note?: string;
  date?: string;
}

export interface PersonNode {
  id: string;
  name: string;
  title: string;
  department: string;
  parentId: string; // manager id or '' for top roots
  dottedLineParentId?: string; // functional/matrix manager
  level: number;
  subCount: number;
  status: StatusType;
  gender?: 'male' | 'female';
  photo?: string;
  employeeCode?: string;
  nationalId?: string;
  contractType?: 'official' | 'contractual' | 'project' | 'hourly';
  employmentStatus?: 'active' | 'leave' | 'suspended';
  education?: string;
  hireDate?: string;
  jobGrade?: string;
  email?: string;
  phone?: string;
  salary?: number;
  currency?: string;
  location?: string;
  skills?: string[];
  performanceScore?: number; // 1 - 5 (9-Box Performance)
  potentialScore?: number;   // 1 - 5 (9-Box Potential)
  successors?: SuccessorEntry[];
  competencies?: CompetencyScore[];
  projectRoles?: ProjectRole[];
  customRels?: CustomRelationship[];
  notes?: string;
}

export interface SuccessorEntry {
  personId: string;
  readiness: 'ready_now' | 'ready_1_year' | 'ready_3_years';
  rating: number; // 1 to 5
  notes?: string;
}

export interface CompetencyScore {
  name: string;
  category: 'technical' | 'leadership' | 'soft' | 'domain';
  requiredLevel: number; // 1 to 5
  currentLevel: number; // 1 to 5
}

/* ==================== USER ROLES & PERMISSIONS (RBAC) ==================== */

export type UserRole =
  | 'super_admin'        // مدیر کل سامانه (کنترل کامل)
  | 'org_architect'     // معمار سازمان و طراح فرآیند BPMN (Signavio Lead)
  | 'hr_manager'        // مدیر منابع انسانی (مدیریت پرسنل، عکس، استخدام)
  | 'dept_lead'         // مدیر دپارتمان / سرپرست میانی
  | 'compliance_auditor'// ممیز فرآیند و کنترل‌های داخلی (RCM Auditor)
  | 'employee_viewer';  // مشاهده‌گر / پرسنل (فقط خواندنی)

export interface RolePermissions {
  canEditOrgChart: boolean;
  canManageRelationships: boolean;
  canEditPersonnel: boolean;
  canUploadPhoto: boolean;
  canViewSalary: boolean;
  canEditBpmn: boolean;
  canPublishBpmn: boolean;
  canManageProjects: boolean;
  canExportData: boolean;
  canManageBackups: boolean;
  canManageUsers: boolean;
}

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  department?: string;
}

/* ==================== BPMN 2.0 TYPES ==================== */

export type BpmnNodeType = 'start' | 'task' | 'gateway' | 'end';

export type BpmnSubtype =
  | 'none'
  | 'message'
  | 'timer'
  | 'error'
  | 'user'
  | 'service'
  | 'manual'
  | 'rule'
  | 'call_activity' // Subprocess / Call Activity linking to another process
  | 'exclusive'     // XOR
  | 'parallel'      // AND
  | 'inclusive';    // OR

export interface RaciAssignment {
  responsibleId?: string;  // R: Who does the work (Person ID or Job ID)
  accountableId?: string;  // A: Who is accountable/approver (must be 1 person)
  consultedIds?: string[]; // C: Subject matter experts
  informedIds?: string[];  // I: Kept updated
}

export interface BpmnNode {
  id: string;
  type: BpmnNodeType;
  subtype?: BpmnSubtype;
  label: string;
  laneId: string;
  x: number;
  y: number;
  personId?: string;       // Primary direct assignee from People DB
  jobId?: string;          // Primary direct position from Job Dictionary
  targetProcessId?: string; // For Call Activities: Jump to another process
  raci?: RaciAssignment;
  estimatedDurationHours?: number;
  notes?: string;
}


export interface BpmnEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

export interface BpmnLane {
  id: string;
  label: string;
  department?: string;
  roleId?: string;
  height?: number;
}

/* ==================== JOB / POSITION TYPES ==================== */

export interface JobPosition {
  id: string;
  code: string;
  title: string;
  department: string;
  level: number;
  reportsToJobId?: string;
  isStaffAssistant?: boolean;
  approvedHeadcount: number;
  assignedPeopleIds: string[];
  status: 'active' | 'has_vacancies' | 'frozen';
  minSalary?: number;
  maxSalary?: number;
  jobDescription?: string;
  requiredSkills?: string[];
}

export interface BpmnProcess {
  id: string;
  name: string;
  code?: string;
  category?: 'core' | 'support' | 'management';
  description?: string;
  triggerInput?: string;
  expectedOutput?: string;
  nextProcessId?: string; // Downstream chained process
  parentProcessId?: string; // Upstream parent process (drilldown)
  ownerPersonId?: string;
  lanes: BpmnLane[];
  nodes: BpmnNode[];
  edges: BpmnEdge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BottleneckAlert {
  fromNodeId: string;
  toNodeId: string;
  fromPerson?: PersonNode;
  toPerson?: PersonNode;
  fromLabel: string;
  toLabel: string;
  orgDistance: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  soDConflict?: boolean; // Separation of duties conflict (same person creates and approves)
}

/* ==================== PROJECT MATRIX TYPES ==================== */

export interface ProjectEntity {
  name: string;
  code: string;
  leadPersonId?: string;
  budget?: number;
  status: 'active' | 'planning' | 'completed' | 'on_hold';
  description?: string;
  membersCount?: number;
}

/* ==================== DIFF & COMPARE TYPES ==================== */

export type OrgDiffChangeType = 'added' | 'removed' | 'moved' | 'promoted' | 'demoted' | 'changed' | 'unchanged';

export interface OrgDiffRow {
  id: string;
  name: string;
  department: string;
  titleA: string;
  titleB: string;
  status: string;
  changeType: OrgDiffChangeType;
  changedFields: string[];
  risk: number; // 0 - 100
  impact: string;
  before: PersonNode | null;
  after: PersonNode | null;
}

export interface OrgDiffResult {
  rows: OrgDiffRow[];
  meta: {
    totalA: number;
    totalB: number;
    addedCount: number;
    removedCount: number;
    movedCount: number;
    promotedCount: number;
    demotedCount: number;
    changedCount: number;
    highRiskCount: number;
    healthScore: number;
    dupA: string[];
    dupB: string[];
    orphansA: string[];
    orphansB: string[];
  };
}

export interface DiffResult {
  added: PersonNode[];
  removed: PersonNode[];
  changed: { before: PersonNode; after: PersonNode; fields: string[] }[];
  moved: { person: PersonNode; oldParentId: string; newParentId: string }[];
}

export interface NetworkCentrality {
  degreeRanking: { person: PersonNode; connections: number }[];
  betweennessRanking: { person: PersonNode; bridgeScore: number }[];
  totalRelationships: number;
  formalCount: number;
  informalCount: number;
}

/* ==================== SETTINGS & FILTER TYPES ==================== */

export interface ViewSettings {
  showPhoto: boolean;
  showName: boolean;
  showTitle: boolean;
  showDept: boolean;
  showSubCount: boolean;
  showId: boolean;
  showSalary: boolean;
  showProjects: boolean;
  levelSpacing: number;
  linkThickness: number;
  theme: 'light' | 'dark';
  colorBy: 'department' | 'level';
  layoutOrientation: 'vertical' | 'horizontal';
}

export interface FilterSettings {
  search: string;
  status: 'all' | 'فعال' | 'غیرفعال';
  departments: Set<string>;
  projectHighlight: string;
}

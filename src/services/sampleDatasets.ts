/**
 * Preset Rich Sample Datasets for PingoNest Pro
 * Includes complete Org Charts, Matrix Projects, and BPMN 2.0 Processes
 */
import { PersonNode, BpmnProcess, ProjectEntity } from '../types/pingonest';

export const TECH_CORP_PEOPLE: PersonNode[] = [
  {
    id: '1001',
    name: 'دکتر محمدرضا عسگری',
    title: 'مدیرعامل و عضو هیئت مدیره',
    department: 'هیئت مدیره',
    parentId: '',
    level: 1,
    subCount: 17,
    status: 'فعال',
    salary: 145000000,
    email: 'm.asgari@pingonest.internal',
    location: 'دفتر مرکزی - تهران',
    skills: ['رهبری استراتژیک', 'توسعه بازار', 'حاکمیت شرکتی'],
    projectRoles: [{ project: 'طراحی نئوبانک سازمانی', role: 'اسپانسر ارشد', allocation: 20 }],
    customRels: [
      { toId: '1017', typeId: 'advisory', direction: 'twoway', strength: 5, confidence: 'confirmed', note: 'مشاوره حقوقی و حاکمیت شرکتی' }
    ]
  },
  {
    id: '1002',
    name: 'مهندس مریم فراهانی',
    title: 'معاون فنی و مدیر ارشد فناوری (CTO)',
    department: 'فنی و مهندسی',
    parentId: '1001',
    dottedLineParentId: '',
    level: 2,
    subCount: 7,
    status: 'فعال',
    salary: 115000000,
    email: 'm.farahani@pingonest.internal',
    location: 'تهران - پارک فناوری پردیس',
    skills: ['معماری نرم‌افزار', 'Distributed Systems', 'DevOps'],
    projectRoles: [
      { project: 'طراحی نئوبانک سازمانی', role: 'مدیر فنی پروژه', allocation: 50 },
      { project: 'مهاجرت ابری زیرساخت', role: 'ناظر معماری', allocation: 30 }
    ],
    customRels: [
      { toId: '1004', typeId: 'collaboration', direction: 'twoway', strength: 5, confidence: 'confirmed', note: 'همکاری مستقیم محصول و فناوری' },
      { toId: '1003', typeId: 'matrix', direction: 'oneway', strength: 4, confidence: 'confirmed', note: 'همسوسازی بودجه فناوری و سرمایه‌گذاری' }
    ]
  },
  {
    id: '1003',
    name: 'حسین سلیمانی',
    title: 'معاون مالی و اداری (CFO)',
    department: 'مالی و اداری',
    parentId: '1001',
    level: 2,
    subCount: 3,
    status: 'فعال',
    salary: 95000000,
    email: 'h.soleimani@pingonest.internal',
    location: 'دفتر مرکزی - تهران',
    skills: ['بودجه‌ریزی', 'حسابرسی', 'ارزیابی سرمایه‌گذاری'],
    projectRoles: [{ project: 'طراحی نئوبانک سازمانی', role: 'مدیریت مالی و ریسک', allocation: 25 }],
    customRels: [
      { toId: '1005', typeId: 'information', direction: 'twoway', strength: 4, confidence: 'confirmed', note: 'هماهنگی بودجه حقوق و دستمزد پرسنل' }
    ]
  },
  {
    id: '1004',
    name: 'زهرا کاظمی',
    title: 'معاون بازاریابی و رشد (CMO)',
    department: 'بازاریابی و فروش',
    parentId: '1001',
    level: 2,
    subCount: 3,
    status: 'فعال',
    salary: 92000000,
    email: 'z.kazemi@pingonest.internal',
    location: 'دفتر مرکزی - تهران',
    skills: ['استراتژی برند', 'Growth Hacking', 'تحلیل بازار'],
    projectRoles: [{ project: 'کمپین تحول دیجیتال ۱۴۰۵', role: 'رهبر پروژه', allocation: 60 }],
    customRels: [
      { toId: '1009', typeId: 'project', direction: 'twoway', strength: 4, confidence: 'confirmed', note: 'توسعه کمپین‌های پرتال مشتریان' }
    ]
  },
  {
    id: '1005',
    name: 'دکتر علی نوری',
    title: 'معاون منابع انسانی (CHRO)',
    department: 'منابع انسانی',
    parentId: '1001',
    level: 2,
    subCount: 2,
    status: 'فعال',
    salary: 88000000,
    email: 'a.nouri@pingonest.internal',
    location: 'دفتر مرکزی - تهران',
    skills: ['جذب استعداد', 'توسعه سازمانی', 'OKRs'],
    projectRoles: [{ project: 'سامانه ارزیابی شایستگی ۳۶۰', role: 'مالک پروژه', allocation: 40 }],
    customRels: [
      { toId: '1001', typeId: 'advisory', direction: 'oneway', strength: 5, confidence: 'confirmed', note: 'مشاوره استراتژی سرمایه انسانی' }
    ]
  },
  {
    id: '1006',
    name: 'نیما بهرامی',
    title: 'مدیر مهندسی نرم‌افزار',
    department: 'فنی و مهندسی',
    parentId: '1002',
    level: 3,
    subCount: 4,
    status: 'فعال',
    salary: 82000000,
    email: 'n.bahrami@pingonest.internal',
    skills: ['Go', 'TypeScript', 'Kubernetes'],
    projectRoles: [{ project: 'طراحی نئوبانک سازمانی', role: 'تیم لید بک‌اند', allocation: 70 }],
    customRels: [
      { toId: '1007', typeId: 'dependency', direction: 'twoway', strength: 5, confidence: 'confirmed', note: 'وابستگی زیرساخت ابری و خط استقرار CI/CD' }
    ]
  },
  {
    id: '1007',
    name: 'روشنک داودی',
    title: 'مدیر زیرساخت و امنیت (DevSecOps)',
    department: 'فنی و مهندسی',
    parentId: '1002',
    level: 3,
    subCount: 1,
    status: 'فعال',
    salary: 80000000,
    email: 'r.davoodi@pingonest.internal',
    skills: ['Cloud Security', 'Terraform', 'CI/CD'],
    projectRoles: [{ project: 'مهاجرت ابری زیرساخت', role: 'مدیر فنی زیرساخت', allocation: 80 }]
  },
  {
    id: '1008',
    name: 'آرش شمس',
    title: 'توسعه‌دهنده ارشد بک‌اند',
    department: 'فنی و مهندسی',
    parentId: '1006',
    level: 4,
    subCount: 0,
    status: 'فعال',
    salary: 62000000,
    skills: ['Microservices', 'PostgreSQL', 'Redis'],
    projectRoles: [{ project: 'طراحی نئوبانک سازمانی', role: 'توسعه‌دهنده سرویس تراکنش', allocation: 90 }]
  },
  {
    id: '1009',
    name: 'پگاه صادقی',
    title: 'توسعه‌دهنده ارشد فرانت‌اند',
    department: 'فنی و مهندسی',
    parentId: '1006',
    level: 4,
    subCount: 0,
    status: 'فعال',
    salary: 60000000,
    skills: ['React', 'Next.js', 'Tailwind', 'UI/UX'],
    projectRoles: [{ project: 'طراحی نئوبانک سازمانی', role: 'توسعه داشبورد وب', allocation: 85 }],
    customRels: [
      { toId: '1010', typeId: 'collaboration', direction: 'twoway', strength: 4, confidence: 'confirmed', note: 'تست تضمین کیفیت رابط کاربری' }
    ]
  },
  {
    id: '1010',
    name: 'کیوان خسروی',
    title: 'مهندس تضمین کیفیت و تست (QA Lead)',
    department: 'فنی و مهندسی',
    parentId: '1006',
    level: 4,
    subCount: 0,
    status: 'فعال',
    salary: 54000000,
    skills: ['Test Automation', 'Cypress', 'Load Testing'],
    projectRoles: [{ project: 'طراحی نئوبانک سازمانی', role: 'ارزیابی کیفی انتشار', allocation: 80 }]
  },
  {
    id: '1011',
    name: 'سهراب معتمدی',
    title: 'مهندس امنیت شبکه',
    department: 'فنی و مهندسی',
    parentId: '1007',
    level: 4,
    subCount: 0,
    status: 'فعال',
    salary: 58000000,
    skills: ['Penetration Testing', 'SIEM', 'Compliance'],
    projectRoles: [{ project: 'مهاجرت ابری زیرساخت', role: 'تست نفوذ و انطباق', allocation: 60 }]
  },
  {
    id: '1012',
    name: 'سارا تقوی',
    title: 'مدیر حسابداری و خزانه',
    department: 'مالی و اداری',
    parentId: '1003',
    level: 3,
    subCount: 1,
    status: 'فعال',
    salary: 56000000,
    skills: ['حسابداری مالیاتی', 'گزارش‌گری IFRS', 'سپیدار']
  },
  {
    id: '1013',
    name: 'رضا کمالی',
    title: 'کارشناس امور مالی و تدارکات',
    department: 'مالی و اداری',
    parentId: '1012',
    level: 4,
    subCount: 0,
    status: 'فعال',
    salary: 38000000,
    skills: ['خرید و تدارکات', 'انبارداری', 'ارزیابی تامین‌کنندگان']
  },
  {
    id: '1014',
    name: 'فرزاد میرزایی',
    title: 'مدیر فروش و روابط با مشتریان سازمانی',
    department: 'بازاریابی و فروش',
    parentId: '1004',
    level: 3,
    subCount: 1,
    status: 'فعال',
    salary: 65000000,
    skills: ['B2B Sales', 'مذاکره قراردادها', 'CRM']
  },
  {
    id: '1015',
    name: 'الناز حبیبی',
    title: 'کارشناس دیجیتال مارکتینگ و محتوا',
    department: 'بازاریابی و فروش',
    parentId: '1014',
    level: 4,
    subCount: 0,
    status: 'فعال',
    salary: 42000000,
    skills: ['SEO', 'Google Ads', 'Content Strategy'],
    projectRoles: [{ project: 'کمپین تحول دیجیتال ۱۴۰۵', role: 'مدیریت کمپین دیجیتال', allocation: 70 }]
  },
  {
    id: '1016',
    name: 'نوید جهانگیری',
    title: 'مدیر جذب و استخدام (Talent Acquisition)',
    department: 'منابع انسانی',
    parentId: '1005',
    level: 3,
    subCount: 0,
    status: 'فعال',
    salary: 52000000,
    skills: ['مصاحبه تخصصی', 'Headhunting', 'برند کارفرمایی'],
    projectRoles: [{ project: 'سامانه ارزیابی شایستگی ۳۶۰', role: 'مجری پایلوت جذب', allocation: 50 }],
    customRels: [
      { toId: '1006', typeId: 'matrix', direction: 'oneway', strength: 4, confidence: 'confirmed', note: 'تامین نیروی تخصصی مهندسی نرم‌افزار' }
    ]
  },
  {
    id: '1017',
    name: 'مونا یوسفی',
    title: 'مشاور حقوقی و مالکیت معنوی',
    department: 'حقوقی',
    parentId: '1001',
    level: 2,
    subCount: 0,
    status: 'فعال',
    salary: 75000000,
    email: 'm.yousefi@pingonest.internal',
    skills: ['حقوق فناوری', 'قراردادهای SLA', 'رعایت حریم خصوصی'],
    customRels: [
      { toId: '1003', typeId: 'advisory', direction: 'twoway', strength: 4, confidence: 'confirmed', note: 'مشاوره مالیاتی و حقوقی' }
    ]
  }
];

export const TECH_CORP_PROJECTS: ProjectEntity[] = [
  {
    name: 'طراحی نئوبانک سازمانی',
    code: 'PRJ-NEOBANK',
    leadPersonId: '1002',
    budget: 4500000000,
    status: 'active',
    description: 'توسعه پلتفرم نسل جدید پرداخت و تسهیلات اعتباری برای مشتریان شرکتی',
    membersCount: 8
  },
  {
    name: 'مهاجرت ابری زیرساخت',
    code: 'PRJ-CLOUD-MIG',
    leadPersonId: '1007',
    budget: 1800000000,
    status: 'active',
    description: 'انتقال سرویس‌های محلی به زیرساخت ابری پایدار با معماری چندمنطقه‌ای',
    membersCount: 4
  },
  {
    name: 'کمپین تحول دیجیتال ۱۴۰۵',
    code: 'PRJ-DIGITAL-1405',
    leadPersonId: '1004',
    budget: 950000000,
    status: 'planning',
    description: 'توسعه سهم بازار سازمانی از طریق کمپین‌های یکپارچه و بهینه‌سازی کانال‌ها',
    membersCount: 3
  },
  {
    name: 'سامانه ارزیابی شایستگی ۳۶۰',
    code: 'PRJ-HR-360',
    leadPersonId: '1005',
    budget: 450000000,
    status: 'active',
    description: 'استقرار مدل شایستگی شغلی و سیستم بازخورد ۳۶۰ درجه برای کل پرسنل',
    membersCount: 2
  }
];

export const TECH_CORP_PROCESSES: BpmnProcess[] = [
  {
    id: 'proc-1',
    name: 'فرآیند انتشار نرم‌افزار و بازبینی کیفی (Release & Deployment)',
    description: 'نگاشت گردش کار بازبینی کد، تست کیفی، اعتبارسنجی امنیتی و استقرار نهایی در پروداکشن بر روی ساختار سازمانی',
    lanes: [
      { id: 'lane-eng', label: 'تیم توسعه نرم‌افزار', department: 'فنی و مهندسی' },
      { id: 'lane-qa', label: 'تیم تضمین کیفیت (QA)', department: 'فنی و مهندسی' },
      { id: 'lane-sec', label: 'تیم امنیت و زیرساخت (SecOps)', department: 'فنی و مهندسی' },
      { id: 'lane-mgmt', label: 'رهبری فنی (CTO / Lead)', department: 'فنی و مهندسی' }
    ],
    nodes: [
      {
        id: 'node-start',
        type: 'start',
        subtype: 'none',
        label: 'ایجاد Release Candidate',
        laneId: 'lane-eng',
        x: 180,
        y: 40,
        personId: '1008',
        raci: { responsibleId: '1008', accountableId: '1006' }
      },
      {
        id: 'node-task-build',
        type: 'task',
        subtype: 'service',
        label: 'اجرای تست‌های خودکار CI و Build',
        laneId: 'lane-eng',
        x: 320,
        y: 35,
        personId: '1006',
        raci: { responsibleId: '1006', accountableId: '1002' }
      },
      {
        id: 'node-task-qa',
        type: 'task',
        subtype: 'user',
        label: 'تست سناریوهای پذیرش (E2E Regression)',
        laneId: 'lane-qa',
        x: 480,
        y: 160,
        personId: '1010',
        raci: { responsibleId: '1010', accountableId: '1006', consultedIds: ['1009'] }
      },
      {
        id: 'node-gw-qa',
        type: 'gateway',
        subtype: 'exclusive',
        label: 'تست‌های QA موفق؟',
        laneId: 'lane-qa',
        x: 660,
        y: 165
      },
      {
        id: 'node-task-sec',
        type: 'task',
        subtype: 'rule',
        label: 'اسکن آسیب‌پذیری و تست نفوذ',
        laneId: 'lane-sec',
        x: 800,
        y: 290,
        personId: '1011',
        raci: { responsibleId: '1011', accountableId: '1007' }
      },
      {
        id: 'node-task-approval',
        type: 'task',
        subtype: 'user',
        label: 'تأییدیه نهایی استقرار (Go/No-Go)',
        laneId: 'lane-mgmt',
        x: 960,
        y: 420,
        personId: '1002',
        raci: { responsibleId: '1002', accountableId: '1001', informedIds: ['1003', '1004'] }
      },
      {
        id: 'node-end-success',
        type: 'end',
        subtype: 'none',
        label: 'انتشار موفق در Production',
        laneId: 'lane-mgmt',
        x: 1140,
        y: 425
      },
      {
        id: 'node-end-fail',
        type: 'end',
        subtype: 'error',
        label: 'رد انتشار و بازگشت به توسعه',
        laneId: 'lane-eng',
        x: 660,
        y: 40
      }
    ],
    edges: [
      { id: 'e1', from: 'node-start', to: 'node-task-build' },
      { id: 'e2', from: 'node-task-build', to: 'node-task-qa' },
      { id: 'e3', from: 'node-task-qa', to: 'node-gw-qa' },
      { id: 'e4', from: 'node-gw-qa', to: 'node-task-sec', label: 'بلی (تأیید)' },
      { id: 'e5', from: 'node-gw-qa', to: 'node-end-fail', label: 'خیر (وجود باگ)' },
      { id: 'e6', from: 'node-task-sec', to: 'node-task-approval' },
      { id: 'e7', from: 'node-task-approval', to: 'node-end-success', label: 'تأیید استقرار' }
    ]
  },
  {
    id: 'proc-2',
    name: 'فرآیند جذب، ارزیابی و استخدام پرسنل (Talent Acquisition)',
    description: 'گردش کار ایجاد ردیف شغلی، مصاحبه تخصصی، تایید بودجه مالی و بستن قرارداد استخدامی',
    lanes: [
      { id: 'lane-hr', label: 'منابع انسانی (HR)', department: 'منابع انسانی' },
      { id: 'lane-hiring', label: 'مدیر واحد متقاضی', department: 'فنی و مهندسی' },
      { id: 'lane-fin', label: 'امور مالی و بودجه', department: 'مالی و اداری' },
      { id: 'lane-ceo', label: 'مدیریت ارشد', department: 'هیئت مدیره' }
    ],
    nodes: [
      {
        id: 'n-start-hiring',
        type: 'start',
        subtype: 'none',
        label: 'اعلام نیاز ردیف استخدامی',
        laneId: 'lane-hiring',
        x: 180,
        y: 160,
        personId: '1006',
        raci: { responsibleId: '1006', accountableId: '1002' }
      },
      {
        id: 'n-task-fin-check',
        type: 'task',
        subtype: 'rule',
        label: 'تطبیق ردیف با بودجه سالانه',
        laneId: 'lane-fin',
        x: 340,
        y: 290,
        personId: '1012',
        raci: { responsibleId: '1012', accountableId: '1003' }
      },
      {
        id: 'n-task-sourcing',
        type: 'task',
        subtype: 'user',
        label: 'انتشار آگهی و غربال رزومه‌ها',
        laneId: 'lane-hr',
        x: 500,
        y: 40,
        personId: '1016',
        raci: { responsibleId: '1016', accountableId: '1005' }
      },
      {
        id: 'n-task-tech-interview',
        type: 'task',
        subtype: 'user',
        label: 'مصاحبه تخصصی و آزمون عملی',
        laneId: 'lane-hiring',
        x: 680,
        y: 160,
        personId: '1008',
        raci: { responsibleId: '1008', accountableId: '1006', consultedIds: ['1009'] }
      },
      {
        id: 'n-gw-decision',
        type: 'gateway',
        subtype: 'exclusive',
        label: 'نتیجه ارزیابی شایستگی؟',
        laneId: 'lane-hiring',
        x: 860,
        y: 165
      },
      {
        id: 'n-task-offer',
        type: 'task',
        subtype: 'user',
        label: 'تنظیم پیشنهاد شغلی (Offer Letter)',
        laneId: 'lane-hr',
        x: 1000,
        y: 40,
        personId: '1016',
        raci: { responsibleId: '1016', accountableId: '1005' }
      },
      {
        id: 'n-task-ceo-sign',
        type: 'task',
        subtype: 'user',
        label: 'تایید نهایی و امضای قرارداد',
        laneId: 'lane-ceo',
        x: 1160,
        y: 420,
        personId: '1001',
        raci: { responsibleId: '1001', accountableId: '1001', informedIds: ['1005', '1003'] }
      },
      {
        id: 'n-end-hired',
        type: 'end',
        subtype: 'none',
        label: 'استخدام قطعی و آغاز Onboarding',
        laneId: 'lane-hr',
        x: 1320,
        y: 45
      }
    ],
    edges: [
      { id: 'he1', from: 'n-start-hiring', to: 'n-task-fin-check' },
      { id: 'he2', from: 'n-task-fin-check', to: 'n-task-sourcing' },
      { id: 'he3', from: 'n-task-sourcing', to: 'n-task-tech-interview' },
      { id: 'he4', from: 'n-task-tech-interview', to: 'n-gw-decision' },
      { id: 'he5', from: 'n-gw-decision', to: 'n-task-offer', label: 'قبول (شایسته)' },
      { id: 'he6', from: 'n-task-offer', to: 'n-task-ceo-sign' },
      { id: 'he7', from: 'n-task-ceo-sign', to: 'n-end-hired' }
    ]
  }
];


/* ==================== SAMPLE JOBS / POSITIONS ==================== */

export const TECH_CORP_JOBS = [
  {
    id: 'job-101',
    code: 'JOB-EXEC-01',
    title: 'مدیرعامل و عضو هیئت مدیره',
    department: 'هیئت مدیره',
    level: 1,
    approvedHeadcount: 1,
    assignedPeopleIds: ['1001'],
    status: 'active' as const,
    minSalary: 120000000,
    maxSalary: 160000000,
    jobDescription: 'هدایت استراتژیک شرکت، تصمیم‌گیری‌های کلان و پاسخگویی به مجمع عمومی.',
    requiredSkills: ['رهبری استراتژیک', 'حاکمیت شرکتی', 'مدیریت بحران']
  },
  {
    id: 'job-102',
    code: 'JOB-ENG-01',
    title: 'معاون فنی و مدیر ارشد فناوری (CTO)',
    department: 'فنی و مهندسی',
    level: 2,
    reportsToJobId: 'job-101',
    approvedHeadcount: 1,
    assignedPeopleIds: ['1002'],
    status: 'active' as const,
    minSalary: 95000000,
    maxSalary: 130000000,
    jobDescription: 'معماری سامانه‌های مقیاس‌پذیر، نظارت بر استانداردهای مهندسی و هدایت تیم‌های فنی.',
    requiredSkills: ['معماری نرم‌افزار', 'سیستم‌های توزیع‌شده', 'رهبری تیم']
  },
  {
    id: 'job-103',
    code: 'JOB-FIN-01',
    title: 'معاون مالی و اداری (CFO)',
    department: 'مالی و اداری',
    level: 2,
    reportsToJobId: 'job-101',
    approvedHeadcount: 1,
    assignedPeopleIds: ['1003'],
    status: 'active' as const,
    minSalary: 80000000,
    maxSalary: 110000000,
    jobDescription: 'بودجه‌بندی، مدیریت جریان نقدینگی، کنترل داخلی و گزارش‌گری مالی قانونی.',
    requiredSkills: ['حسابرسی', 'مدیریت ریسک مالی', 'قوانین مالیاتی']
  },
  {
    id: 'job-104',
    code: 'JOB-PROD-01',
    title: 'مدیر ارشد محصول (CPO)',
    department: 'محصول و طراحی',
    level: 2,
    reportsToJobId: 'job-101',
    approvedHeadcount: 1,
    assignedPeopleIds: ['1004'],
    status: 'active' as const,
    minSalary: 75000000,
    maxSalary: 105000000,
    jobDescription: 'تدوین چشم‌انداز محصول، تحقیقات بازار و مدیریت اولویت‌های نیازمندی مشتریان.',
    requiredSkills: ['Product Strategy', 'UI/UX', 'تحلیل داده']
  },
  {
    id: 'job-105',
    code: 'JOB-HR-01',
    title: 'مدیر منابع انسانی و فرهنگ سازمانی',
    department: 'منابع انسانی',
    level: 2,
    reportsToJobId: 'job-101',
    approvedHeadcount: 1,
    assignedPeopleIds: ['1005'],
    status: 'active' as const,
    minSalary: 70000000,
    maxSalary: 95000000,
    jobDescription: 'توسعه سرمایه انسانی، طراحی شغل، آموزش، مدیریت عملکرد و نگهداشت پرسنل.',
    requiredSkills: ['Talent Acquisition', 'ارزیابی عملکرد', 'قوانین کار']
  },
  {
    id: 'job-106',
    code: 'JOB-STAFF-01',
    title: 'مشاور ارشد تحول دیجیتال و دستیار هیئت‌مدیره',
    department: 'هیئت مدیره',
    level: 2,
    reportsToJobId: 'job-101',
    isStaffAssistant: true,
    approvedHeadcount: 1,
    assignedPeopleIds: [],
    status: 'has_vacancies' as const,
    minSalary: 90000000,
    maxSalary: 125000000,
    jobDescription: 'پایش روندهای فناوری جهانی و ارائه مشاوره بی‌واسطه به مدیرعامل.',
    requiredSkills: ['تحول دیجیتال', 'مشاوره مدیریت', 'هوش تجاری']
  },
  {
    id: 'job-107',
    code: 'JOB-ENG-02',
    title: 'مهندس ارشد فرانت‌اند (Senior Frontend)',
    department: 'فنی و مهندسی',
    level: 3,
    reportsToJobId: 'job-102',
    approvedHeadcount: 3,
    assignedPeopleIds: ['1007', '1008'],
    status: 'has_vacancies' as const,
    minSalary: 55000000,
    maxSalary: 75000000,
    jobDescription: 'توسعه برنامه‌های وب مدرن با React، تست، پرفورمنس و بهینه‌سازی تجربه کاربری.',
    requiredSkills: ['React', 'TypeScript', 'Tailwind', 'Next.js']
  },
  {
    id: 'job-108',
    code: 'JOB-ENG-03',
    title: 'مهندس ارشد بک‌اند و دیتابیس (Go/Node)',
    department: 'فنی و مهندسی',
    level: 3,
    reportsToJobId: 'job-102',
    approvedHeadcount: 3,
    assignedPeopleIds: ['1006'],
    status: 'has_vacancies' as const,
    minSalary: 60000000,
    maxSalary: 85000000,
    jobDescription: 'طراحی میکروسرویس‌ها، کشینگ و پایگاه داده‌های رابطه‌ای و NoSQL.',
    requiredSkills: ['Golang', 'PostgreSQL', 'Redis', 'Kafka']
  }
];

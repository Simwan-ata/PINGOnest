/**
 * SheetJS Excel (.xlsx) Service for PingoNest Pro
 * Robust import, export, and template generation for Organizational Data
 */
import * as XLSX from 'xlsx';
import { PersonNode } from '../types/pingonest';

export function parseExcelFile(arrayBuffer: ArrayBuffer): PersonNode[] {
  const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const jsonRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const nodes: PersonNode[] = [];

  jsonRows.forEach((r, idx) => {
    const id = String(r['کد پرسنلی'] ?? r['کدپرسنلی'] ?? r['id'] ?? r['ID'] ?? `100${idx + 1}`).trim();
    const name = String(r['نام و نام خانوادگی'] ?? r['نام'] ?? r['name'] ?? r['Name'] ?? '').trim();
    if (!name) return;

    const title = String(r['سمت'] ?? r['عنوان شغلی'] ?? r['title'] ?? r['Title'] ?? 'کارشناس').trim();
    let parentId = String(r['کد مدیر'] ?? r['کدمدیر'] ?? r['managerId'] ?? r['parentId'] ?? '').trim();
    if (parentId === id || parentId === '—' || parentId === '-') parentId = '';

    const department = String(r['دپارتمان'] ?? r['واحد سازمانی'] ?? r['department'] ?? 'سایر').trim() || 'سایر';
    const status = String(r['وضعیت'] ?? r['status'] ?? 'فعال').trim() === 'غیرفعال' ? 'غیرفعال' : 'فعال';
    const salary = parseFloat(String(r['حقوق'] ?? r['حقوق ماهانه'] ?? r['salary'] ?? '0')) || undefined;
    const email = String(r['ایمیل'] ?? r['email'] ?? '').trim() || undefined;
    const phone = String(r['تلفن'] ?? r['phone'] ?? '').trim() || undefined;
    const location = String(r['محل خدمت'] ?? r['location'] ?? '').trim() || undefined;

    nodes.push({
      id,
      name,
      title,
      department,
      parentId,
      level: 1,
      subCount: 0,
      status,
      salary,
      email,
      phone,
      location
    });
  });

  return nodes;
}

export function exportPeopleToExcel(people: PersonNode[], filename = 'pingonest-organization.xlsx') {
  const rows = people.map((p) => ({
    'کد پرسنلی': p.id,
    'نام و نام خانوادگی': p.name,
    'سمت': p.title,
    'کد مدیر': p.parentId || '',
    'دپارتمان': p.department,
    'سطح': p.level,
    'تعداد زیرمجموعه': p.subCount,
    'وضعیت': p.status,
    'حقوق (ریال)': p.salary || '',
    'ایمیل': p.email || '',
    'محل خدمت': p.location || '',
    'پروژه‌ها': p.projectRoles?.map((pr) => `${pr.project} (${pr.role} - ${pr.allocation}%)`).join('; ') || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'سازمان');
  XLSX.writeFile(wb, filename);
}

export function generateExcelTemplate(): void {
  const templateRows = [
    {
      'کد پرسنلی': '1001',
      'نام و نام خانوادگی': 'نام مدیرعامل',
      'سمت': 'مدیرعامل',
      'کد مدیر': '',
      'دپارتمان': 'هیئت مدیره',
      'وضعیت': 'فعال',
      'حقوق (ریال)': 120000000,
      'ایمیل': 'ceo@company.com'
    },
    {
      'کد پرسنلی': '1002',
      'نام و نام خانوادگی': 'نام معاون فنی',
      'سمت': 'معاون فنی و مهندسی',
      'کد مدیر': '1001',
      'دپارتمان': 'فنی و مهندسی',
      'وضعیت': 'فعال',
      'حقوق (ریال)': 90000000,
      'ایمیل': 'cto@company.com'
    },
    {
      'کد پرسنلی': '1003',
      'نام و نام خانوادگی': 'نام مدیر توسعه',
      'سمت': 'مدیر تیم نرم‌افزار',
      'کد مدیر': '1002',
      'دپارتمان': 'فنی و مهندسی',
      'وضعیت': 'فعال',
      'حقوق (ریال)': 75000000,
      'ایمیل': 'dev.lead@company.com'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الگوی ورود داده');
  XLSX.writeFile(wb, 'pingonest-template.xlsx');
}

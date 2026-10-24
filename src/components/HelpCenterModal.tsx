import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Layers,
  GitBranch,
  FolderKanban,
  BarChart3,
  ArrowLeftRight,
  Database,
  Users,
  Shield,
  Download,
  Upload,
  Keyboard,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Zap,
  Target,
  Award,
  GitFork,
  Printer,
  ChevronRight,
  ChevronLeft,
  Server,
  FileSpreadsheet,
  MousePointer,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRtl?: boolean;
  onNavigateToModule?: (moduleId: string) => void;
}

interface HelpSection {
  id: string;
  titleFa: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'core' | 'modeling' | 'talent' | 'admin' | 'reference';
  moduleId?: string;
  summaryFa: string;
  contentFa: React.ReactNode;
}

export default function HelpCenterModal({
  isOpen,
  onClose,
  isRtl = true,
  onNavigateToModule
}: HelpCenterModalProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Comprehensive Help Sections
  const helpSections: HelpSection[] = useMemo(
    () => [
      {
        id: 'getting-started',
        titleFa: 'شروع به کار و نقشه راهبری سامانه',
        titleEn: 'Getting Started & Workspace Tour',
        icon: Zap,
        category: 'core',
        summaryFa: 'مروری بر معماری دسکتاپ PingoNest Enterprise، نوار ناوبری بالا، بوم اصلی و نوار کناری.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                  خوش‌آمدید به PingoNest Enterprise
                </div>
                <div className="text-xs text-indigo-800 dark:text-indigo-300">
                  این نرم‌افزار یک پلتفرم جامع و یکپارچه سازمانی است که برای تحلیل ساختار سلسله‌مراتبی،
                  مدل‌سازی ماتریسی پروژه‌ها، فرآیندنگاری استاندارد بر مبنای BPMN 2.0، ماتریس اختیارات RACI،
                  جانشین‌پروری ۹گانه، و رادار شایستگی‌های فردی طراحی شده است.
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                اجزای اصلی فضای کاربری
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                    ۱. نوار ابزار اصلی (TopNav)
                  </div>
                  <p className="text-xs text-slate-500">
                    دسترسی سریع به کلید «ایجاد سریع»، منوی جامع داده و دیتابیس SQLite، ابزارهای تخصصی، نقش کاربر و
                    دکمه‌های Undo/Redo.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                    ۲. نوار کناری (Sidebar)
                  </div>
                  <p className="text-xs text-slate-500">
                    جستجوی پیشرفته پرسنل، فیلتر دپارتمان‌ها و وضعیت کاری، تنظیمات دیداری کارت‌ها (عکس، حقوق، پروژه‌ها و ضخامت خطوط).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                    ۳. بوم بی‌نهایت چارت (Canvas)
                  </div>
                  <p className="text-xs text-slate-500">
                    بوم وکتور روان با بزرگنمایی، مینی‌مپ شناور، جابجایی درگ‌اند‌دراپ پرسنل و پورت‌های هوشمند اتصال مستقیم.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-base mb-2">
                گام‌های آغاز کار در ۵ دقیقه
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">بارگذاری دیتای نمونه یا اکسل:</strong> از منوی «داده و پایگاه داده» ➔ «ورود چارت از اکسل» یا یکی از دو مجموعه پیش‌فرض (پارس‌تک یا هلدینگ سینا) را بارگذاری کنید.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">مشاهده روابط در بوم:</strong> با چرخ ماوس یا کلیدهای بزرگنمایی زوم کنید، کارت‌ها را بررسی نموده و با کلیک روی هر کارت، کشوی اطلاعات کامل را باز کنید.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">ویرایش ساختار:</strong> برای افزودن کارمند جدید، دکمه «ایجاد سریع» یا نشانگر (+) روی هر کارت را بفشارید.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">شبیه‌سازی سناریو:</strong> پیش از تصمیم‌گیری کلان، با ابزار What-If تغییرات را به صورت ایزوله تحلیل کنید.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-slate-200">ذخیره پروژه:</strong> از منوی داده، گزینه «ذخیره مستقیم پروژه (.pingo)» را بزنید تا فایل بکاپ روی هارد شما ذخیره شود.
                </li>
              </ol>
            </div>
          </div>
        )
      },
      {
        id: 'org-chart-canvas',
        titleFa: 'بوم تعاملی، کارت‌ها و روابط سلسله‌مراتبی',
        titleEn: 'Interactive Org Chart & Connection Ports',
        icon: MousePointer,
        category: 'core',
        moduleId: 'canvas',
        summaryFa: 'نحوه جابجایی کارت‌ها، کشیدن خطوط اتصال والد-فرزندی، مینی‌مپ و محافظت از زیرمجموعه‌ها.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              بوم سازمانی قلب تپنده نرم‌افزار است که ساختار واقعی درخت سازمانی را با الگوریتم چیدمان سلسله‌مراتبی
              خودکار رسم می‌کند.
            </p>

            <div className="space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                ویژگی‌های کلیدی بوم و کارت‌ها
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                    🎯 پورت‌های اتصال والد و فرزند (Top & Bottom Connection Ports)
                  </div>
                  <p className="text-xs text-slate-500">
                    با نگه‌داشتن ماوس روی هر کارت، دو پورت دایره‌ای در بالا (والد) و پایین (فرزند) پدیدار می‌شوند. با درگ کردن خط از پورت پایین به کارت دیگر، فوراً رابطه سرپرستی ایجاد می‌شود.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                    ⚠️ پنجره هوشمند محافظت از جابجایی زیرمجموعه‌ها (Move Warning Modal)
                  </div>
                  <p className="text-xs text-slate-500">
                    هنگامی که یک مدیر دارای زیرمجموعه را به پست دیگری منتقل می‌کنید، سیستم به صورت هوشمند از شما می‌پرسد:
                    «آیا کل زیرمجموعه همراه ایشان منتقل شوند، یا فقط شخص منتقل شده و زیردستان به مدیر مافوق متصل شوند؟» این قابلیت مانع از به‌هم‌ریختگی تصادفی ساختار می‌شود.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                    🗺️ رادار ناوبری مینی‌مپ (Floating Mini-Map)
                  </div>
                  <p className="text-xs text-slate-500">
                    در گوشه پایین چپ بوم، مینی‌مپ شناور نمای کلی کل چارت چند هزار نفری را با کد رنگی دپارتمان‌ها و کادر قرمز نمای دید (Viewport) زنده نشان می‌دهد.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                    🎬 حالت ارائه و تمام‌صفحه (Presentation Mode)
                  </div>
                  <p className="text-xs text-slate-500">
                    در نوار پایین بوم، با فشردن دکمه «حالت ارائه»، سایدبار و نوار بالا جمع شده و چارت برای نمایش در جلسات هیئت مدیره و پروژکتور آماده می‌شود.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'database-storage',
        titleFa: 'پایگاه داده SQLite و موتور پایتون',
        titleEn: 'Python & SQLite Engine (.pingo & database.db)',
        icon: Database,
        category: 'core',
        moduleId: 'database',
        summaryFa: 'معماری فایل پایگاه داده لوکال، پشتیبان‌گیری، اسنپ‌شات‌ها و ذخیره‌سازی آفلاین و سازمانی.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
              <div className="font-bold text-emerald-950 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-600" />
                معماری ذخیره‌سازی داده‌ها (Dual Storage Architecture)
              </div>
              <p className="text-emerald-800 dark:text-emerald-300">
                PingoNest داده‌ها را در دو لایه ایمن نگه می‌دارد: لایه اول پایگاه داده رابطه‌ای SQLite با سرور پایتون (`server.py`) برای سازمان‌ها، و لایه دوم ذخیره مستقیم پروژه‌ای آفلاین با پسوند اختصاصی `.pingo`.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                جداول و ساختار پایگاه داده
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-start border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5 text-start font-bold">نام جدول (Table)</th>
                      <th className="p-2.5 text-start font-bold">شرح محتوا</th>
                      <th className="p-2.5 text-start font-bold">فیلدهای کلیدی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-indigo-600">people</td>
                      <td className="p-2.5">اطلاعات پرسنل، عناوین، حقوق، مدیر مافوق</td>
                      <td className="p-2.5 font-mono text-slate-500">id, name, parentId, dept, salary</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-purple-600">bpmn_processes</td>
                      <td className="p-2.5">فرآیندهای کسب‌وکار، گره‌ها و خطوط توالی</td>
                      <td className="p-2.5 font-mono text-slate-500">id, name, nodes, connections, xml</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-amber-600">projects</td>
                      <td className="p-2.5">پروژه‌های ماتریسی، بودجه، اعضا و نقش‌ها</td>
                      <td className="p-2.5 font-mono text-slate-500">id, name, budget, members</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-teal-600">backups</td>
                      <td className="p-2.5">اسنپ‌شات‌های نسخه‌ها و تاریخچه بازیابی</td>
                      <td className="p-2.5 font-mono text-slate-500">id, timestamp, data_json</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                فرمت فایل پروژه (.pingo)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                با کلیک روی «ذخیره مستقیم پروژه»، یک فایل استاندارد JSON با پسوند `.pingo` تولید می‌شود که حاوی کل ساختار سازمانی، تمام فرآیندهای BPMN، ماتریس‌های RACI، پروژه‌های ماتریسی و مشاغل است. شما می‌توانید این فایل را با همکاران خود به اشتراک بگذارید یا هر زمان از منوی داده بازیابی نمایید.
              </p>
            </div>
          </div>
        )
      },
      {
        id: 'bpmn-studio',
        titleFa: 'استودیو فرآیندنگاری SAP Signavio و استاندارد BPMN 2.0',
        titleEn: 'BPMN 2.0 Process Modeling & Signavio Integration',
        icon: GitBranch,
        category: 'modeling',
        moduleId: 'bpmn',
        summaryFa: 'طراحی استخرها و خطوط شناوری، گره‌های وظیفه، درگاه‌های تصمیم‌گیری و ورود و خروجی BPMN XML.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              استودیو BPMN 2.0 نرم‌افزار، طراحی و مصورسازی فرآیندهای کسب‌وکار را بر اساس استاندارد جهانی
              OMG BPMN 2.0 و استانداردهای طراحی Signavio SAP پیاده‌سازی می‌کند.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  رویدادها (Events)
                </div>
                <p className="text-xs text-slate-500">
                  شامل رویدادهای آغازین (Start)، میانی زمان‌دار و پیام (Intermediate)، و پایان موفق یا خطا (End Events).
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-md bg-blue-500" />
                  فعالیت‌ها و وظایف (Tasks)
                </div>
                <p className="text-xs text-slate-500">
                  وظایف کاربری (User Task)، وظایف سرویس اتوماتیک (Service Task)، و وظایف دستی (Manual Task) با قابلیت اتصال به نقش مسئول چارت.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rotate-45 bg-amber-500" />
                  درگاه‌های تصمیم‌گیری (Gateways)
                </div>
                <p className="text-xs text-slate-500">
                  درگاه انحصاری (Exclusive XOR)، درگاه موازی (Parallel AND) و درگاه جامع (Inclusive OR) برای انشعاب و ادغام جریان کار.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm border border-purple-500" />
                  استخرها و خطوط شناوری (Pools & Lanes)
                </div>
                <p className="text-xs text-slate-500">
                  تفکیک مسئولیت‌های دپارتمان‌های مختلف در فرآیندهای بین‌سازمانی با خطوط شناوری افقی.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                📥 خروجی و ورود استاندارد BPMN 2.0 XML
              </div>
              <p className="text-slate-500">
                شما می‌توانید فرآیندهای رسم شده را به صورت فایل استاندارد `.bpmn` خروجی گرفته و در نرم‌افزارهای نظیر SAP Signavio، Camunda، یا جامیتا بارگذاری نمایید و بالعکس.
              </p>
            </div>
          </div>
        )
      },
      {
        id: 'raci-matrix',
        titleFa: 'ماتریس تخصیص مسئولیت‌ها و اختیارات (RACI Matrix)',
        titleEn: 'RACI Matrix & Organizational Conflict Detection',
        icon: Shield,
        category: 'modeling',
        moduleId: 'raci',
        summaryFa: 'تعیین مسئول، پاسخگو، مشاور و مطلع در هر گام فرآیند و کشف خودکار تضادهای سازمانی.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              ماتریس RACI حلقه اتصال ساختار سازمانی به فرآیندهای کاری است. با این ماتریس مشخص می‌شود در هر فعالیت فرآیند، چه کسی چه نقشی بر عهده دارد.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
                <div className="font-black text-lg text-blue-600 mb-0.5">R</div>
                <div className="font-bold text-xs text-blue-950 dark:text-blue-200">Responsible</div>
                <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-1">مجری مستقیم کار</div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                <div className="font-black text-lg text-rose-600 mb-0.5">A</div>
                <div className="font-bold text-xs text-rose-950 dark:text-rose-200">Accountable</div>
                <div className="text-[11px] text-rose-700 dark:text-rose-300 mt-1">پاسخگوی نهایی (دقیقاً ۱ نفر)</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                <div className="font-black text-lg text-amber-600 mb-0.5">C</div>
                <div className="font-bold text-xs text-amber-950 dark:text-amber-200">Consulted</div>
                <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">مشاور پیش از تصمیم</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <div className="font-black text-lg text-emerald-600 mb-0.5">I</div>
                <div className="font-bold text-xs text-emerald-950 dark:text-emerald-200">Informed</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">مطلع‌شونده پس از اجرا</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-xs">
              <div className="font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                قواعد کلیدی ممیزی ماتریس RACI
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300">
                <li><strong>قانون پاسخگوی واحد:</strong> در هر سطر فرآیند، باید دقیقاً یک نفر پاسخگو (A) وجود داشته باشد. کمتر از یک یعنی فقدان مسئولیت؛ بیشتر از یک یعنی تداخل مسئولیت.</li>
                <li><strong>توازن بار کاری مجریان:</strong> هیچ شغلی نباید بدون نقش R باشد و هیچ فردی نباید متحمل بیش از حد نقش‌های همزمان گردد.</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'matrix-projects',
        titleFa: 'مدیریت ساختار ماتریسی و پروژه‌های بین‌دپارتمانی',
        titleEn: 'Matrix Organizations & Cross-Functional Project Teams',
        icon: FolderKanban,
        category: 'modeling',
        moduleId: 'projects',
        summaryFa: 'همپوشانی ساختار وظیفه‌ای با ساختار پروژه‌ای، درصد تخصیص اعضا و هایلایت اعضا در بوم.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              در سازمان‌های مدرن، افراد علاوه بر جایگاه سلسله‌مراتبی در دپارتمان خود، به پروژه‌های مختلف تخصیص داده می‌شوند.
              استودیو پروژه‌ها این ساختار ماتریسی را مدیریت می‌کند.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                  تخصیص درصدی اعضا (Resource Allocation %)
                </div>
                <p className="text-xs text-slate-500">
                  برای هر فرد می‌توانید مشخص کنید چند درصد از وقت کاری خود (مثلاً ۴۰٪) را در فلان پروژه صرف می‌کند. جمع درصدها بار کاری واقعی را آشکار می‌سازد.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1">
                  هایلایت لحظه‌ای در بوم چارت (Live Project Highlight)
                </div>
                <p className="text-xs text-slate-500">
                  با کلیک روی دکمه «نمایش اعضا در چارت»، تمام کارت‌های متعلق به اعضای پروژه با رنگ نئونی متمایز شده و افراد خارج از پروژه کم‌رنگ می‌شوند تا توزیع تیمی در دپارتمان‌ها فورا دیده شود.
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'what-if-sandbox',
        titleFa: 'شبیه‌ساز سناریوهای تغییر چارت و بودجه (What-If Sandbox)',
        titleEn: 'What-If Org & Budget Scenario Simulation',
        icon: GitFork,
        category: 'talent',
        moduleId: 'scenario',
        summaryFa: 'محیط آزمایشی بدون ریسک برای جابجایی دپارتمان‌ها، محاسبه تغییرات حقوق و اعمال مستقیم.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              پیش از ابلاغ هرگونه تغییر در چارت، با شبیه‌ساز What-If می‌توانید در یک محیط کاملاً ایزوله
              تغییرات را اعمال و اثرات مالی و ساختاری آن را ارزیابی فرمایید.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <div className="font-bold text-indigo-950 dark:text-indigo-200 mb-1">۱. ایزولاسیون کامل</div>
                <p className="text-indigo-700 dark:text-indigo-300">
                  هیچ تغییری در بوم اصلی ذخیره نمی‌شود تا زمانی که تصمیم بگیرید دکمه «اعمال به چارت اصلی» را بفشارید.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="font-bold text-emerald-950 dark:text-emerald-200 mb-1">۲. تحلیل آنی بودجه</div>
                <p className="text-emerald-700 dark:text-emerald-300">
                  تغییرات در هزینه حقوق ماهیانه و سالیانه سازمان با نشانگرهای سبز (کاهش هزینه) یا قرمز (افزایش هزینه) نمایش داده می‌شود.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <div className="font-bold text-purple-950 dark:text-purple-200 mb-1">۳. شاخص‌های ساختاری</div>
                <p className="text-purple-700 dark:text-purple-300">
                  اثر جابجایی بر پهنای نظارت (Span of Control) و تعداد لایه‌های سلسله‌مراتبی بلافاصله محاسبه می‌شود.
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'succession-9box',
        titleFa: 'استودیو جانشین‌پروری و ماتریس ۹گانه (9-Box Grid)',
        titleEn: 'Succession Planning & Talent 9-Box Grid Matrix',
        icon: Award,
        category: 'talent',
        moduleId: 'succession',
        summaryFa: 'ماتریس عملکرد-پتانسیل، شناسایی استعدادهای درخشان و صف جانشینی برای پست‌های کلیدی.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              ماتریس ۹گانه (9-Box Grid) ابزار استاندارد جهانی مدیران منابع انسانی برای مدیریت استعداد و ارزیابی
              همزمان دو شاخصه عملکرد (Performance) و پتانسیل رشد (Potential) است.
            </p>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                دسته‌بندی خانه‌های ۹گانه:
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400">
                <li><strong className="text-emerald-600">رهبران آینده (Future Leaders / Stars):</strong> پتانسیل بالا + عملکرد بالا. کاندیداهای اول ارتقا و پست‌های کلیدی.</li>
                <li><strong className="text-blue-600">عملکرد برتر (High Performers):</strong> عملکرد عالی با پتانسیل متوسط. ستون‌های اجرایی سازمان.</li>
                <li><strong className="text-purple-600">معماها (Enigmas):</strong> پتانسیل بسیار بالا با عملکرد پایین به دلیل عدم تناسب شغل یا تازه‌کار بودن.</li>
                <li><strong className="text-rose-600">نقطه پرخطر (Under-performers):</strong> عملکرد و پتانسیل پایین، نیازمند برنامه بهبود عملکرد (PIP) یا بازتخصیص.</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-black text-slate-900 dark:text-white text-sm">
                صف جانشینی پست‌های حیاتی (Successor Pipeline)
              </h4>
              <p className="text-slate-500">
                برای هر پست حساس، می‌توانید تا ۳ جانشین با درجه آمادگی (آماده فوری، ۱ تا ۲ سال، یا پشتیبان اضطراری) تعیین کنید.
              </p>
            </div>
          </div>
        )
      },
      {
        id: 'competency-radar',
        titleFa: 'رادار شایستگی‌ها و برنامه توسعه فردی (Competency Radar & IDP)',
        titleEn: 'Competency Radar & Individual Development Plan',
        icon: Target,
        category: 'talent',
        moduleId: 'competency',
        summaryFa: 'نمودار چندضلعی عنکبوتی شایستگی‌های رفتاری و فنی، تحلیل شکاف و اقدامات رشد فردی.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              رادار شایستگی‌ها یک بستر تحلیلی تصویری (Spider / Radar Chart) برای مقایسه سطح مهارتی فعلی پرسنل با انتظارات استاندارد شغل ایشان است.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  تحلیل شکاف مهارتی (Gap Analysis)
                </div>
                <p className="text-slate-500">
                  سیستم به صورت خودکار اختلاف امتیاز مهارت شخص با سطح مطلوب شغل را محاسبه کرده و نقاط نیازمند تقویت را برمی‌شمرد.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  برنامه اقدام توسعه فردی (IDP)
                </div>
                <p className="text-slate-500">
                  برای هر شایستگی می‌توان دوره‌های آموزشی، ماموریت‌های چالشی یا منتورینگ ثبت کرد تا در بازه‌های ارزیابی پیگیری شوند.
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'analytics-bi',
        titleFa: 'هوش سازمانی و داشبورد تحلیلی (Analytics & Metrics)',
        titleEn: 'Executive Dashboard & Workforce Analytics',
        icon: BarChart3,
        category: 'core',
        moduleId: 'analytics',
        summaryFa: 'شاخص‌های کلیدی منابع انسانی، پهنای نظارت، هرم عمق سازمانی و بار مالی دپارتمان‌ها.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              داشبورد هوش سازمانی آمارهای حیاتی ساختار و منابع انسانی را در قالب نمودارهای تحلیلی و شاخص‌های کلیدی ارائه می‌دهد.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">تعداد کل پرسنل</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Headcount</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">پهنای نظارت میانگین</div>
                <div className="text-lg font-black text-indigo-600 mt-0.5">Span of Control</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">تعداد سطوح مدیریت</div>
                <div className="text-lg font-black text-purple-600 mt-0.5">Org Depth</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400">نسبت مدیر به کارشناس</div>
                <div className="text-lg font-black text-emerald-600 mt-0.5">M-to-S Ratio</div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'workload-forecast',
        titleFa: 'ویژوالایزر پیش‌بینی بار کاری دپارتمان‌ها (Recharts)',
        titleEn: 'Department Workload & Capacity Forecast',
        icon: TrendingUp,
        category: 'core',
        moduleId: 'workload',
        summaryFa: 'تحلیل سری زمانی بار کاری با Recharts، نمودارهای ناحیه‌ای و میله‌ای، کشف کمبود نیرو و تست استرس رشد.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              ویژوالایزر بار کاری با بهره‌گیری از موتور نمودارسازی پیشرفته <strong>Recharts</strong>،
              توزیع بار کاری پروژه‌ها و عملیات جاری را با ظرفیت اسمی هر دپارتمان تطبیق داده و در افق‌های زمانی مختلف پیش‌بینی می‌کند.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                  ۱. افق‌های زمانی سه‌گانه
                </div>
                <p className="text-slate-500">
                  پیش‌بینی ماهانه (۱۲ ماه آینده)، فصلی (۴ فصل سال) و افق استراتژیک بلندمدت ۳ ساله سازمانی.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-purple-600 dark:text-purple-400 mb-1">
                  ۲. سبک‌های متنوع Recharts
                </div>
                <p className="text-slate-500">
                  امکان انتخاب بین نمودار ناحیه‌ای (Area Chart) با گرادیانت، نمودار میله‌ای (Bar Chart) و نمودار ترکیبی (Composed Chart).
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                  ۳. تحلیل شکاف نیرو (FTE Gap)
                </div>
                <p className="text-slate-500">
                  محاسبه دقیق تعداد نیروی مورد نیاز جهت جذب، یا میزان ساعت ظرفیت آزاد در هر واحد سازمانی.
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'orgdiff-audit',
        titleFa: 'ممیزی تغییرات ساختار و مقایسه نسخه‌ها (OrgDiff Engine)',
        titleEn: 'OrgDiff Audit & Version History Comparison',
        icon: ArrowLeftRight,
        category: 'core',
        moduleId: 'compare',
        summaryFa: 'مقایسه هوشمند دو نسخه چارت و تفکیک تغییرات به رنگ‌های سبز، قرمز، نارنجی و آبی.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              موتور OrgDiff به شما اجازه می‌دهد نسخه کنونی را با یک نسخه پشتیبان پیشین مقایسه کنید تا تمام تحولات ساختار سازمان ممیزی شود.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800">+</span>
                <span><strong>افراد یا پست‌های افزوده شده:</strong> استخدام‌ها یا موقعیت‌های شغلی جدید</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-800">-</span>
                <span><strong>افراد یا پست‌های حذف شده:</strong> خروج از سازمان یا حذف جایگاه</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800">⇄</span>
                <span><strong>انتقال به مدیر دیگر:</strong> تغییر رابطه سرپرستی و ساختار گزارش‌دهی</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-blue-200 dark:bg-blue-800">✎</span>
                <span><strong>ارتقا یا تغییر سمت:</strong> ویرایش عنوان شغل، حقوق یا مشخصات فردی</span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'rbac-security',
        titleFa: 'مدیریت کاربران، نشست‌ها و امنیت دسترسی (RBAC)',
        titleEn: 'User Roles, Sessions & Role-Based Access Control',
        icon: Users,
        category: 'admin',
        moduleId: 'users',
        summaryFa: 'نقش‌های مدیر ارشد، مدیر منابع انسانی، تحلیل‌گر و بیننده با کنترل سطح دسترسی.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              سامانه از معماری استاندارد RBAC پشتیبانی می‌کند تا از تغییرات غیرمجاز در چارت و فرآیندها جلوگیری شود.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">مدیر ارشد سامانه (Super Admin)</div>
                  <div className="text-slate-500">اختیار تام در ویرایش چارت، تغییرات دیتابیس، بازیابی بکاپ و مدیریت دسترسی‌ها.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">مدیر منابع انسانی (HR Admin)</div>
                  <div className="text-slate-500">ویرایش پرسنل، تغییر ساختار چارت، جانشین‌پروری و مدیریت پروژه‌ها.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">تحلیل‌گر فرآیند و سازمان (Org Analyst)</div>
                  <div className="text-slate-500">دسترسی به شبیه‌ساز What-If، استودیو فرآیند و داشبورد تحلیلی بدون تغییر در دیتای واقعی.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-1 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">بیننده (Read-Only Viewer)</div>
                  <div className="text-slate-500">صرفاً مشاهده چارت و چاپ گزارش‌ها با غیرفعال بودن تمام دکمه‌های ویرایشی.</div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'export-import',
        titleFa: 'ورود و خروجی اکسل، چاپ و گزارش‌ها',
        titleEn: 'Data Import, Excel Export, High-Res Printing',
        icon: Download,
        category: 'reference',
        moduleId: 'export',
        summaryFa: 'فرمت استاندارد فایل اکسل ورودی، خروجی‌های PDF با کیفیت برداری و کارت‌های پرسنلی.',
        contentFa: (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p>
              تبادل اطلاعات با سایر نرم‌افزارهای سازمانی (مانند ERP یا سیستم‌های حضور و غیاب) از طریق اکسل و خروجی‌های استاندارد انجام می‌پذیرد.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <div className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  ستون‌های فایل اکسل استاندارد برای ورود داده:
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <div>• <span className="font-bold text-slate-900 dark:text-slate-200">کد پرسنلی (ID):</span> شناسه یکتای کارمند</div>
                  <div>• <span className="font-bold text-slate-900 dark:text-slate-200">نام و نام خانوادگی (Name):</span> نام کامل شخص</div>
                  <div>• <span className="font-bold text-slate-900 dark:text-slate-200">عنوان شغلی (Title):</span> سمت رسمی</div>
                  <div>• <span className="font-bold text-slate-900 dark:text-slate-200">کد مدیر مافوق (ReportsTo / ParentID):</span> کد پرسنلی مدیر مستقیم شخص (برای بالاترین مدیر خالی بگذارید)</div>
                  <div>• <span className="font-bold text-slate-900 dark:text-slate-200">دپارتمان (Department):</span> واحد سازمانی</div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'keyboard-shortcuts',
        titleFa: 'کلیدهای میانبر و فرمان‌های سریع صفحه کلید',
        titleEn: 'Keyboard Shortcuts & Productivity Hotkeys',
        icon: Keyboard,
        category: 'reference',
        summaryFa: 'تسریع در اجرای عملیات با کلیدهای فوری کیبورد برای بازدهی فوق‌العاده.',
        contentFa: (
          <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <p className="text-xs text-slate-500">
              با استفاده از کلیدهای میانبر زیر می‌توانید بدون برداشتن دست از کیبورد، تمام امکانات سامانه را هدایت نمایید:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>بازگشت به گام قبل (Undo)</span>
                <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">Ctrl + Z</kbd>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>تکرار عملیات (Redo)</span>
                <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">Ctrl + Y</kbd>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>رد کردن اینترو اولیه (Skip Intro)</span>
                <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">Space / Esc</kbd>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>بستن پنجره فعال (Close Modal)</span>
                <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">Escape</kbd>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>بزرگنمایی و کوچک‌نمایی بوم</span>
                <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">چرخ ماوس (Scroll)</kbd>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span>پیمایش دو بعدی بوم چارت</span>
                <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold border border-slate-300 dark:border-slate-700">کلیک و درگ روی فضای خالی</kbd>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'faq-troubleshooting',
        titleFa: 'سوالات متداول و راهنمای رفع اشکال (FAQ)',
        titleEn: 'Frequently Asked Questions & Troubleshooting',
        icon: HelpCircle,
        category: 'reference',
        summaryFa: 'پاسخ به سوالات مرسوم درباره جابجایی کارت‌ها، خطاها و بازیابی اطلاعات.',
        contentFa: (
          <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                  پرسش: چرا یکی از کارت‌ها در بوم نمایش داده نمی‌شود؟
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  پاسخ: بررسی کنید آیا در نوار کناری (Sidebar) فیلتر دپارتمان یا جستجو فعال است یا خیر. همچنین مطمئن شوید کد سرپرست شخص (ReportsTo) به یک پرسنل موجود اشاره دارد تا زنجیره قطع نشود.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                  پرسش: چگونه چارت سازمانی را با کیفیت بالا برای چاپ یا اسناد رسمی خروجی بگیرم؟
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  پاسخ: از نوار بالا به منوی «داده و پایگاه داده» ➔ «خروجی گزارش، اکسل و چاپ» بروید. در آنجا می‌توانید رزولوشن را روی حداکثر (4K یا High Res) تنظیم کرده و فایل تصویری PNG شفاف یا PDF وکتور تهیه کنید.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                  پرسش: آیا تغییرات در بوم بلافاصله در دیتابیس لوکال ذخیره می‌شود؟
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  پاسخ: بله، تمام تغییرات در حافظه محلی کش شده و قابلیت Undo/Redo دارد. جهت اطمینان صددرصدی قبل از بستن تب، از گزینه «ذخیره مستقیم پروژه (.pingo)» یک نسخه ذخیره نمایید.
                </p>
              </div>
            </div>
          </div>
        )
      }
    ],
    []
  );

  // Filter sections by search query and category
  const filteredSections = useMemo(() => {
    return helpSections.filter((section) => {
      const matchesCategory = categoryFilter === 'all' || section.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        section.titleFa.toLowerCase().includes(q) ||
        section.titleEn.toLowerCase().includes(q) ||
        section.summaryFa.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [helpSections, searchQuery, categoryFilter]);

  const activeSection = useMemo(() => {
    return helpSections.find((s) => s.id === selectedSectionId) || helpSections[0];
  }, [helpSections, selectedSectionId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isRtl ? 'مرکز راهنمای جامع و مستندات PingoNest Enterprise' : 'PingoNest Enterprise Documentation & Guide'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {isRtl ? 'راهنمای تفصیلی گام‌به‌گام ماژول‌ها، معماری پایگاه داده، کلیدهای میانبر و سوالات متداول' : 'Comprehensive step-by-step user manual & architectural guide'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={isRtl ? 'چاپ راهنما' : 'Print Guide'}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className={`absolute top-2.5 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'جستجو در موضوعات، فرآیندها، میانبرها و فرمول‌ها...' : 'Search manual topics, shortcuts...'}
              className={`w-full py-2 text-xs bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold text-slate-600 dark:text-slate-400">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                categoryFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isRtl ? 'همه موضوعات' : 'All Topics'}
            </button>
            <button
              onClick={() => setCategoryFilter('core')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                categoryFilter === 'core'
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isRtl ? 'هسته اصلی و بوم' : 'Core & Canvas'}
            </button>
            <button
              onClick={() => setCategoryFilter('modeling')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                categoryFilter === 'modeling'
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isRtl ? 'فرآیندها و RACI' : 'BPMN & RACI'}
            </button>
            <button
              onClick={() => setCategoryFilter('talent')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                categoryFilter === 'talent'
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isRtl ? 'استعداد و سناریو' : 'Talent & Sandbox'}
            </button>
            <button
              onClick={() => setCategoryFilter('reference')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                categoryFilter === 'reference'
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isRtl ? 'میانبرها و سوالات' : 'Shortcuts & FAQ'}
            </button>
          </div>
        </div>

        {/* Body: Master / Detail Columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navigation Sidebar List */}
          <div className="w-72 sm:w-80 border-e border-slate-200 dark:border-slate-800 overflow-y-auto p-2 space-y-1 bg-slate-50/40 dark:bg-slate-900/40">
            {filteredSections.map((section) => {
              const IconComp = section.icon;
              const isSelected = section.id === activeSection.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`w-full p-2.5 rounded-2xl text-start transition-all flex items-start gap-3 group ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">
                      {isRtl ? section.titleFa : section.titleEn}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {section.summaryFa}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="self-center text-indigo-600 dark:text-indigo-400">
                      {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  )}
                </button>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                موردی مطابق با جستجوی شما یافت نشد.
              </div>
            )}
          </div>

          {/* Detail Reading Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-white dark:bg-slate-900">
            <div className="max-w-3xl space-y-6">
              {/* Active Section Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{isRtl ? activeSection.titleFa : activeSection.titleEn}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {activeSection.titleEn}
                    </p>
                  </div>

                  {/* Jump directly to module button if applicable */}
                  {activeSection.moduleId && onNavigateToModule && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToModule(activeSection.moduleId!);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800 transition-all shrink-0"
                    >
                      <span>{isRtl ? 'ورود به این ماژول' : 'Launch Module'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active Section Body */}
              <div>{activeSection.contentFa}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{isRtl ? 'نگارش سازمانی v4.0.0 — همگام با دیتابیس SQLite و استاندارد BPMN 2.0' : 'Enterprise Edition v4.0.0'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors"
          >
            {isRtl ? 'بستن راهنما' : 'Close Guide'}
          </button>
        </div>
      </div>
    </div>
  );
}

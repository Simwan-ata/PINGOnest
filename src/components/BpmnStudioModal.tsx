import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Plus,
  Play,
  Square,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  Users,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  FileCode,
  Sliders,
  Clock,
  Layers,
  HelpCircle,
  FileText,
  Zap,
  Coins,
  ShieldCheck,
  CheckSquare,
  BarChart3,
  ExternalLink,
  Building2,
  Calculator,
  TrendingUp,
  Filter,
  Sparkles,
  Edit3
} from 'lucide-react';
import {
  BpmnProcess,
  BpmnNode,
  BpmnLane,
  BpmnEdge,
  PersonNode,
  BpmnNodeType,
  BpmnSubtype
} from '../types/pingonest';
import { exportProcessToBpmn2Xml, parseBpmn2Xml } from '../services/bpmnXmlService';
import { analyzeBpmnBottlenecks } from '../services/analyticsService';

export interface RcmRiskItem {
  id: string;
  processId: string;
  riskCode: string;
  title: string;
  category: 'operational' | 'financial' | 'compliance' | 'cyber';
  likelihood: number;
  impact: number;
  controlTitle: string;
  controlType: 'preventive' | 'detective' | 'corrective';
  controlOwnerId: string;
  effectiveness: 'effective' | 'needs_improvement' | 'deficient';
}

interface BpmnStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  processes: BpmnProcess[];
  people: PersonNode[];
  onSaveProcess: (process: BpmnProcess) => void;
  onDeleteProcess: (processId: string) => void;
  isRtl: boolean;
}

export default function BpmnStudioModal({
  isOpen,
  onClose,
  processes,
  people,
  onSaveProcess,
  onDeleteProcess,
  isRtl
}: BpmnStudioModalProps) {
  if (!isOpen) return null;

  const [activeProcessId, setActiveProcessId] = useState<string>(
    processes[0]?.id || 'proc-new'
  );

  const currentProcess = useMemo(() => {
    return (
      processes.find((p) => p.id === activeProcessId) ||
      processes[0] || {
        id: 'proc-default',
        name: 'فرآیند پیش‌فرض سازمانی',
        lanes: [{ id: 'lane-1', label: 'دپارتمان فنی', department: 'فنی و مهندسی' }],
        nodes: [],
        edges: []
      }
    );
  }, [processes, activeProcessId]);

  // Working state copy
  const [procState, setProcState] = useState<BpmnProcess>(() => JSON.parse(JSON.stringify(currentProcess)));

  // Sync if activeProcessId changes
  React.useEffect(() => {
    const found = processes.find((p) => p.id === activeProcessId);
    if (found) setProcState(JSON.parse(JSON.stringify(found)));
  }, [activeProcessId, processes]);

  // Selected node / edge
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Connect Mode
  const [connectSourceNodeId, setConnectSourceNodeId] = useState<string | null>(null);

  // Active Tab: Modeler vs RACI Matrix vs Bottleneck Analysis vs Quality Lint vs Cross-Process Handshakes vs Value Chain vs Cost Simulation vs RCM
  const [activeViewTab, setActiveViewTab] = useState<'CANVAS' | 'RACI_MATRIX' | 'BOTTLENECK' | 'QUALITY_LINT' | 'HANDSHAKES' | 'VALUE_CHAIN' | 'COST_SIMULATION' | 'RISK_COMPLIANCE'>('CANVAS');

  // Cost Simulation State
  const [simMonthlyExecutions, setSimMonthlyExecutions] = useState<number>(100);

  // RCM (Risk & Control Matrix) State
  const [rcmFilterCategory, setRcmFilterCategory] = useState<string>('all');
  const [rcmFilterEffectiveness, setRcmFilterEffectiveness] = useState<string>('all');
  const [isAddRiskModalOpen, setIsAddRiskModalOpen] = useState(false);
  const [newRiskForm, setNewRiskForm] = useState({
    title: '',
    riskCode: `RSK-${Date.now().toString().slice(-4)}`,
    category: 'operational' as 'operational' | 'financial' | 'compliance' | 'cyber',
    likelihood: 3,
    impact: 3,
    controlTitle: '',
    controlType: 'preventive' as 'preventive' | 'detective' | 'corrective',
    controlOwnerId: people[0]?.id || '',
    effectiveness: 'effective' as 'effective' | 'needs_improvement' | 'deficient'
  });

  const [rcmList, setRcmList] = useState<RcmRiskItem[]>([
    {
      id: 'rcm-1',
      processId: activeProcessId,
      riskCode: 'RSK-OPS-01',
      title: 'تاخیر در بازبینی و تایید صلاحیت تامین‌کنندگان در مهلت قانونی',
      category: 'operational' as const,
      likelihood: 3,
      impact: 4,
      controlTitle: 'سامانه اعلان هوشمند و تخصیص مهلت انقضا (SLA) به کارتابل مدیر',
      controlType: 'preventive' as const,
      controlOwnerId: people[0]?.id || '',
      effectiveness: 'effective' as const
    },
    {
      id: 'rcm-2',
      processId: activeProcessId,
      riskCode: 'RSK-FIN-02',
      title: 'صدور تاییدیه مالی خرید کالا بدون تطبیق با مانده بودجه مصوب',
      category: 'financial' as const,
      likelihood: 2,
      impact: 5,
      controlTitle: 'کنترل سیستمی SoD: جداسازی دسترسی درخواست‌کننده خرید از تاییدکننده نهایی بودجه',
      controlType: 'preventive' as const,
      controlOwnerId: people[1]?.id || people[0]?.id || '',
      effectiveness: 'effective' as const
    },
    {
      id: 'rcm-3',
      processId: activeProcessId,
      riskCode: 'RSK-CMP-03',
      title: 'انجام تغییرات در رویه بدون مستندسازی و اخذ تاییدیه ممیزی داخلی',
      category: 'compliance' as const,
      likelihood: 4,
      impact: 3,
      controlTitle: 'بازرسی دوره‌ای و تطبیق فرآیند اجرایی با لاگ‌های گردش کار BPMN',
      controlType: 'detective' as const,
      controlOwnerId: people[2]?.id || people[0]?.id || '',
      effectiveness: 'needs_improvement' as const
    }
  ]);

  const handleCreateNewProcess = (category: 'core' | 'support' | 'management' = 'core') => {
    const newId = `proc-${Date.now()}`;
    const newProc: BpmnProcess = {
      id: newId,
      name:
        category === 'management'
          ? 'فرآیند طرح‌ریزی استراتژیک و مدیریت ریسک'
          : category === 'support'
          ? 'فرآیند پشتیبانی سازمانی و خدمات اداری'
          : 'فرآیند زنجیره ارزش و تحویل خدمت',
      category,
      lanes: [
        { id: `lane-${Date.now()}-1`, label: 'واحد متولی فرآیند', department: people[0]?.department || 'مدیریت عملیات' }
      ],
      nodes: [
        {
          id: `start-${Date.now()}`,
          type: 'start',
          label: 'شروع فرآیند',
          laneId: `lane-${Date.now()}-1`,
          x: 100,
          y: 70
        },
        {
          id: `task-${Date.now()}-1`,
          type: 'task',
          label: 'بررسی مستندات و ثبت اطلاعات',
          laneId: `lane-${Date.now()}-1`,
          x: 280,
          y: 60,
          estimatedDurationHours: 3
        },
        {
          id: `end-${Date.now()}`,
          type: 'end',
          label: 'تایید نهایی و پایان',
          laneId: `lane-${Date.now()}-1`,
          x: 490,
          y: 70
        }
      ],
      edges: [],
      createdAt: new Date().toISOString()
    };
    onSaveProcess(newProc);
    setActiveProcessId(newId);
  };

  const renderProcessCard = (proc: BpmnProcess) => {
    const isCurrent = proc.id === activeProcessId;
    const taskCount = proc.nodes.filter((n) => n.type === 'task').length;
    const totalHours = proc.nodes.reduce((sum, n) => sum + (n.estimatedDurationHours || 2), 0);
    const owner = people.find((p) => p.id === proc.ownerPersonId);
    const downstream = processes.find((p) => p.id === proc.nextProcessId);

    return (
      <div
        key={proc.id}
        className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
          isCurrent
            ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20'
            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:shadow-md'
        }`}
      >
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  {proc.code || proc.id.slice(0, 8)}
                </span>
                {isCurrent && (
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    فعال در ویرایشگر
                  </span>
                )}
              </div>
              <h5 className="font-black text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                {proc.name}
              </h5>
            </div>

            <select
              value={proc.category || 'core'}
              onChange={(e) => {
                const nextCategory = e.target.value as 'core' | 'support' | 'management';
                const updated = { ...proc, category: nextCategory };
                onSaveProcess(updated);
                if (proc.id === procState.id) {
                  setProcState(updated);
                }
              }}
              className="text-[10px] font-bold p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              title="تغییر رده در زنجیره ارزش"
            >
              <option value="management">مدیریتی</option>
              <option value="core">زنجیره اصلی</option>
              <option value="support">پشتیبانی</option>
            </select>
          </div>

          {proc.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {proc.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">لِین‌ها</span>
              <span className="font-black text-xs text-slate-800 dark:text-slate-200">{proc.lanes.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">فعالیت‌ها</span>
              <span className="font-black text-xs text-indigo-600 dark:text-indigo-400">{taskCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold">زمان چرخه</span>
              <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">{totalHours} س</span>
            </div>
          </div>

          {downstream && (
            <div className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5 bg-indigo-50/50 dark:bg-indigo-950/30 p-2 rounded-xl">
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="truncate">
                <b>تحویل به:</b> {downstream.name}
              </span>
            </div>
          )}

          {owner && (
            <div className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pt-1">
              <Users className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span className="truncate">
                <b>مالک:</b> {owner.name} ({owner.title})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveProcessId(proc.id);
              setActiveViewTab('CANVAS');
            }}
            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
          >
            <Edit3 className="w-3 h-3" />
            {isRtl ? 'مدل‌سازی' : 'Model'}
          </button>
          <button
            onClick={() => {
              setActiveProcessId(proc.id);
              setActiveViewTab('COST_SIMULATION');
            }}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
            title="شبیه‌سازی هزینه این فرآیند"
          >
            <Coins className="w-3.5 h-3.5" />
          </button>
          {processes.length > 1 && (
            <button
              onClick={() => {
                if (window.confirm(`آیا از حذف فرآیند «${proc.name}» اطمینان دارید؟`)) {
                  onDeleteProcess(proc.id);
                  if (proc.id === activeProcessId) {
                    const remaining = processes.filter((p) => p.id !== proc.id);
                    if (remaining[0]) setActiveProcessId(remaining[0].id);
                  }
                }
              }}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="حذف فرآیند"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Zoom
  const [zoom, setZoom] = useState(1);

  // Dragging node state
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedNode = procState.nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = procState.edges.find((e) => e.id === selectedEdgeId);

  // Bottleneck Analysis
  const bottlenecks = useMemo(() => {
    return analyzeBpmnBottlenecks(procState, people);
  }, [procState, people]);

  // Signavio-Style Process Quality & Conformance Linting Engine
  const qualityReport = useMemo(() => {
    const issues: {
      id: string;
      nodeId?: string;
      severity: 'critical' | 'warning' | 'info';
      titleFa: string;
      descFa: string;
      fixActionFa: string;
    }[] = [];

    // 1. Check Start & End Events
    const startNodes = procState.nodes.filter((n) => n.type === 'start');
    const endNodes = procState.nodes.filter((n) => n.type === 'end');

    if (startNodes.length === 0) {
      issues.push({
        id: 'no-start-event',
        severity: 'critical',
        titleFa: 'رویداد آغازین (Start Event) یافت نشد',
        descFa: 'طبق استاندارد BPMN 2.0، هر فرآیند باید دارای حداقل یک رویداد شروع مشخص باشد.',
        fixActionFa: 'افزودن رویداد شروع'
      });
    }

    if (endNodes.length === 0) {
      issues.push({
        id: 'no-end-event',
        severity: 'critical',
        titleFa: 'رویداد پایانی (End Event) یافت نشد',
        descFa: 'فرآیند بدون رویداد پایان است و خروجی یا نقطه اتمام کار برای سامانه‌ها تعریف نشده است.',
        fixActionFa: 'افزودن رویداد پایان'
      });
    }

    // 2. Scan every node for unassigned tasks, dead-ends, isolated gateways
    procState.nodes.forEach((n) => {
      const incoming = procState.edges.filter((e) => e.to === n.id);
      const outgoing = procState.edges.filter((e) => e.from === n.id);

      if (n.type === 'task') {
        const hasAssignee = Boolean(n.personId || n.raci?.responsibleId);
        if (!hasAssignee) {
          issues.push({
            id: `unassigned-${n.id}`,
            nodeId: n.id,
            severity: 'warning',
            titleFa: `فعالیت بدون متصدی: «${n.label}»`,
            descFa: 'هیچ مجری مشخصی (Responsible) در سازمان به این گام اختصاص نیافته است.',
            fixActionFa: 'انتساب شغل یا فرد'
          });
        }
      }

      if (n.type === 'gateway') {
        if (outgoing.length === 0) {
          issues.push({
            id: `dead-gateway-${n.id}`,
            nodeId: n.id,
            severity: 'critical',
            titleFa: `گیت‌وی بن‌بست: «${n.label}»`,
            descFa: 'این گیت‌وی تصمیم‌گیری هیچ مسیر خروجی ندارد و کار در آن متوقف می‌شود.',
            fixActionFa: 'اتصال مسیرهای خروجی'
          });
        } else if (outgoing.length === 1 && n.subtype === 'exclusive') {
          issues.push({
            id: `single-gateway-${n.id}`,
            nodeId: n.id,
            severity: 'info',
            titleFa: `گیت‌وی انحصاری با یک شاخه: «${n.label}»`,
            descFa: 'گیت‌وی تصمیم‌گیری معمولاً نیازمند حداقل دو مسیر مشروط است.',
            fixActionFa: 'افزودن شاخه‌های شرطی'
          });
        }
      }

      if (incoming.length === 0 && outgoing.length === 0 && procState.nodes.length > 1) {
        issues.push({
          id: `isolated-${n.id}`,
          nodeId: n.id,
          severity: 'warning',
          titleFa: `گره سرگردان و منفصل: «${n.label}»`,
          descFa: 'این گام به هیچ‌یک از مسیرهای فرآیندی متصل نیست و در جریان کار قرار نمی‌گیرد.',
          fixActionFa: 'اتصال به جریان کار'
        });
      }
    });

    const criticalCount = issues.filter((i) => i.severity === 'critical').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const score = Math.max(0, 100 - criticalCount * 25 - warningCount * 10);

    return { issues, score, criticalCount, warningCount };
  }, [procState]);

  // Helper to commit state change
  const updateProcess = (updated: BpmnProcess) => {
    setProcState(updated);
    onSaveProcess(updated);
  };

  // Token Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTokenNodeId, setSimTokenNodeId] = useState<string | null>(null);
  const simTimerRef = useRef<any>(null);

  const startSimulation = () => {
    const startNode = procState.nodes.find((n) => n.type === 'start') || procState.nodes[0];
    if (!startNode) return;
    setIsSimulating(true);
    setSimTokenNodeId(startNode.id);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setSimTokenNodeId(null);
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
  };

  React.useEffect(() => {
    if (!isSimulating || !simTokenNodeId) return;

    simTimerRef.current = setTimeout(() => {
      const outgoing = procState.edges.filter((e) => e.from === simTokenNodeId);
      if (outgoing.length > 0) {
        const nextNodeId = outgoing[0].to;
        setSimTokenNodeId(nextNodeId);
        const nextNode = procState.nodes.find((n) => n.id === nextNodeId);
        if (nextNode?.type === 'end') {
          setTimeout(() => {
            if (procState.nextProcessId) {
              const nextProc = processes.find((p) => p.id === procState.nextProcessId);
              if (nextProc) {
                setActiveProcessId(nextProc.id);
              }
            }
            stopSimulation();
          }, 1800);
        }
      } else {
        stopSimulation();
      }
    }, 1500);

    return () => {
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  }, [isSimulating, simTokenNodeId, procState, processes]);

  // Add a new node
  const handleAddNode = (type: BpmnNodeType, subtype: BpmnSubtype = 'none') => {
    const laneId = procState.lanes[0]?.id || 'lane-1';
    const newNode: BpmnNode = {
      id: `node-${Date.now()}`,
      type,
      subtype,
      label:
        type === 'start'
          ? 'رویداد شروع'
          : type === 'end'
          ? 'رویداد پایان'
          : type === 'gateway'
          ? 'تصمیم انحصاری'
          : 'فعالیت کاری جدید',
      laneId,
      x: 200 + Math.random() * 80,
      y: 60 + Math.random() * 40
    };

    const next = {
      ...procState,
      nodes: [...procState.nodes, newNode]
    };
    updateProcess(next);
    setSelectedNodeId(newNode.id);
  };

  // Add swimlane
  const handleAddLane = () => {
    const newLane: BpmnLane = {
      id: `lane-${Date.now()}`,
      label: `لِین سازمانی ${procState.lanes.length + 1}`,
      department: people[0]?.department || 'فنی و مهندسی'
    };
    const next = {
      ...procState,
      lanes: [...procState.lanes, newLane]
    };
    updateProcess(next);
  };

  // Connect flow
  const handleNodeClick = (nodeId: string) => {
    if (connectSourceNodeId) {
      if (connectSourceNodeId !== nodeId) {
        // Create new edge
        const newEdge: BpmnEdge = {
          id: `flow-${Date.now()}`,
          from: connectSourceNodeId,
          to: nodeId
        };
        const next = {
          ...procState,
          edges: [...procState.edges, newEdge]
        };
        updateProcess(next);
      }
      setConnectSourceNodeId(null);
    } else {
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
    }
  };

  // Delete selected item
  const handleDeleteSelected = () => {
    if (selectedNodeId) {
      const next = {
        ...procState,
        nodes: procState.nodes.filter((n) => n.id !== selectedNodeId),
        edges: procState.edges.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId)
      };
      setSelectedNodeId(null);
      updateProcess(next);
    } else if (selectedEdgeId) {
      const next = {
        ...procState,
        edges: procState.edges.filter((e) => e.id !== selectedEdgeId)
      };
      setSelectedEdgeId(null);
      updateProcess(next);
    }
  };

  // Export to BPMN 2.0 XML
  const handleExportXml = () => {
    const xml = exportProcessToBpmn2Xml(procState);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${procState.name || 'process'}.bpmn`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Import BPMN 2.0 XML
  const handleImportXml = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const xml = event.target?.result as string;
      const parsed = parseBpmn2Xml(xml);
      if (parsed) {
        updateProcess(parsed);
        alert(isRtl ? 'فرآیند BPMN 2.0 با موفقیت بارگذاری شد.' : 'BPMN 2.0 Process imported successfully.');
      } else {
        alert(isRtl ? 'خطا در خواندن فایل BPMN XML' : 'Failed to parse BPMN XML file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const laneHeight = 135;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="w-full max-w-7xl h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={procState.name}
                  onChange={(e) => updateProcess({ ...procState, name: e.target.value })}
                  className="font-black text-lg text-slate-900 dark:text-slate-100 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 focus:border-indigo-500 outline-none pb-0.5"
                />
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  BPMN 2.0 OMG
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isRtl
                  ? 'نگاشت فرآیندهای کسب‌وکار روی ساختار واقعی سازمان با اعتبارسنجی RACI و تحلیل گلوگاه‌ها'
                  : 'Map business processes onto real organization structure with RACI & Bottleneck analysis'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Tabs */}
            <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold overflow-x-auto max-w-2xl scrollbar-none">
              <button
                onClick={() => setActiveViewTab('CANVAS')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeViewTab === 'CANVAS'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {isRtl ? 'مدل‌ساز دیاگرام' : 'Diagram Modeler'}
              </button>
              <button
                onClick={() => setActiveViewTab('RACI_MATRIX')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeViewTab === 'RACI_MATRIX'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {isRtl ? 'ماتریس RACI' : 'RACI Matrix'}
              </button>
              <button
                onClick={() => setActiveViewTab('BOTTLENECK')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeViewTab === 'BOTTLENECK'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {bottlenecks.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
                {isRtl ? 'تحلیل گلوگاه‌ها و SoD' : 'Bottlenecks & SoD'}
              </button>
              <button
                onClick={() => setActiveViewTab('QUALITY_LINT')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeViewTab === 'QUALITY_LINT'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    qualityReport.score >= 90
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : qualityReport.score >= 70
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {qualityReport.score}%
                </span>
                {isRtl ? 'کیفیت فرآیند (Signavio)' : 'Quality Lint'}
              </button>
              <button
                onClick={() => setActiveViewTab('HANDSHAKES')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeViewTab === 'HANDSHAKES'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {isRtl ? 'اتصال فرآیندها' : 'Process Linkage'}
              </button>
              <button
                onClick={() => setActiveViewTab('VALUE_CHAIN')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeViewTab === 'VALUE_CHAIN'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {isRtl ? 'نقشه فرآیندی (Value Chain)' : 'Value Chain'}
              </button>
              <button
                onClick={() => setActiveViewTab('COST_SIMULATION')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeViewTab === 'COST_SIMULATION'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                {isRtl ? 'شبیه‌سازی هزینه فرآیند' : 'Cost Simulation'}
              </button>
              <button
                onClick={() => setActiveViewTab('RISK_COMPLIANCE')}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeViewTab === 'RISK_COMPLIANCE'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {isRtl ? 'ماتریس ریسک و کنترل (RCM)' : 'RCM & Compliance'}
              </button>
            </div>

            {/* XML Import & Export */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".bpmn,.xml"
              onChange={handleImportXml}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1.5 transition-all"
              title="Import .bpmn / .xml"
            >
              <Upload className="w-3.5 h-3.5" />
              {isRtl ? 'ورود BPMN' : 'Import XML'}
            </button>
            <button
              onClick={handleExportXml}
              className="px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
              title="Export standard BPMN 2.0 XML"
            >
              <Download className="w-3.5 h-3.5" />
              {isRtl ? 'خروجی BPMN 2.0' : 'Export XML'}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Process Chaining & Value Chain Continuity Bar */}
        <div className="px-6 py-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs flex-wrap gap-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">انتخاب فرآیند:</span>
              <select
                value={activeProcessId}
                onChange={(e) => setActiveProcessId(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-slate-100 text-xs outline-none shadow-sm"
              >
                {processes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {procState.triggerInput && (
              <span className="text-[11px] text-slate-600 dark:text-slate-400 hidden md:inline">
                <b>ورودی / شرط آغاز:</b> {procState.triggerInput}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Chained next process button */}
            {procState.nextProcessId && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                  اتصال به فرآیند بعدی:
                </span>
                <button
                  onClick={() => {
                    if (procState.nextProcessId) {
                      setActiveProcessId(procState.nextProcessId);
                    }
                  }}
                  className="px-3 py-1 rounded-xl bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-sm"
                  title="جهش مستقیم به فرآیند متصل بعدی در زنجیره ارزش"
                >
                  <span>
                    {processes.find((p) => p.id === procState.nextProcessId)?.name || 'فرآیند بعدی'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Token Simulation Trigger Button */}
            {isSimulating ? (
              <button
                onClick={stopSimulation}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all animate-pulse"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>توقف شبیه‌سازی توکن</span>
              </button>
            ) : (
              <button
                onClick={startSimulation}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                title="اجرای نمادین حرکت توکن در طول گام‌های فرآیند و تست خطوط شنا"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>شبیه‌سازی جریان توکن (Token Sim)</span>
              </button>
            )}
          </div>
        </div>

        {/* Studio Content Area */}
        {activeViewTab === 'CANVAS' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Toolbar */}
            <div className="px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Element palette buttons */}
                <button
                  onClick={() => handleAddNode('start', 'none')}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100 flex items-center gap-1 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  + {isRtl ? 'شروع' : 'Start'}
                </button>
                <button
                  onClick={() => handleAddNode('task', 'user')}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1 transition-all"
                >
                  <Square className="w-3.5 h-3.5" />
                  + {isRtl ? 'فعالیت کاربر (User Task)' : 'User Task'}
                </button>
                <button
                  onClick={() => handleAddNode('task', 'service')}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 hover:bg-sky-100 flex items-center gap-1 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  + {isRtl ? 'سرویس خودکار' : 'Service Task'}
                </button>
                <button
                  onClick={() => handleAddNode('task', 'call_activity')}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 hover:bg-teal-100 flex items-center gap-1 transition-all"
                  title={isRtl ? 'زیرفرآیند فراخوان (Call Activity) جهت اتصال به فرآیند دیگر' : 'Call Activity'}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  + {isRtl ? 'زیرفرآیند (Call Activity)' : 'Call Activity'}
                </button>
                <button
                  onClick={() => handleAddNode('gateway', 'exclusive')}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 hover:bg-amber-100 flex items-center gap-1 transition-all"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  + {isRtl ? 'دروازه تصمیم (XOR)' : 'Gateway'}
                </button>
                <button
                  onClick={() => handleAddNode('end', 'none')}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100 flex items-center gap-1 transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  + {isRtl ? 'پایان' : 'End'}
                </button>
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                <button
                  onClick={handleAddLane}
                  className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 hover:bg-purple-100 flex items-center gap-1 transition-all"
                >
                  <Layers className="w-3.5 h-3.5" />
                  + {isRtl ? 'افزودن لِین' : 'Add Lane'}
                </button>
                <button
                  onClick={() => setConnectSourceNodeId(connectSourceNodeId ? null : (selectedNodeId || ''))}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                    connectSourceNodeId
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  🔗 {connectSourceNodeId ? (isRtl ? 'روی گره مقصد کلیک کنید' : 'Click Target Node') : (isRtl ? 'اتصال گام‌ها' : 'Connect')}
                </button>
                {(selectedNodeId || selectedEdgeId) && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 hover:bg-rose-100 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isRtl ? 'حذف انتخاب' : 'Delete'}
                  </button>
                )}
              </div>

              {/* Zoom and status */}
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <button
                  onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas + Properties Split View */}
            <div className="flex-1 flex overflow-hidden">
              {/* Swimlane Diagram Area */}
              <div
                ref={canvasRef}
                className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 relative select-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.2) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              >
                <div
                  className="relative origin-top-left"
                  style={{
                    transform: `scale(${zoom})`,
                    minWidth: '1600px',
                    minHeight: `${procState.lanes.length * laneHeight + 200}px`
                  }}
                >
                  {/* Swimlanes Rendering */}
                  {procState.lanes.map((lane, idx) => (
                    <div
                      key={lane.id}
                      className="absolute left-0 right-0 border-b border-dashed border-slate-300 dark:border-slate-800 flex"
                      style={{
                        top: `${idx * laneHeight}px`,
                        height: `${laneHeight}px`
                      }}
                    >
                      {/* Lane Header Bar (Bound to Department) */}
                      <div className="w-44 flex-shrink-0 bg-slate-200/90 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-800 p-3 flex flex-col justify-center">
                        <input
                          type="text"
                          value={lane.label}
                          onChange={(e) => {
                            const lanes = [...procState.lanes];
                            lanes[idx].label = e.target.value;
                            updateProcess({ ...procState, lanes });
                          }}
                          className="font-bold text-xs text-slate-800 dark:text-slate-200 bg-transparent border-b border-slate-300 dark:border-slate-700 outline-none pb-0.5"
                        />
                        <select
                          value={lane.department || ''}
                          onChange={(e) => {
                            const lanes = [...procState.lanes];
                            lanes[idx].department = e.target.value;
                            updateProcess({ ...procState, lanes });
                          }}
                          className="mt-1.5 text-[11px] p-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
                        >
                          <option value="">{isRtl ? '— انتخاب دپارتمان —' : '— Select Dept —'}</option>
                          {Array.from(new Set(people.map((p) => p.department))).map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Lane Lane Floor */}
                      <div className="flex-1 relative" />
                    </div>
                  ))}

                  {/* SVG Edges Layer */}
                  <svg
                    className="absolute inset-0 overflow-visible pointer-events-none"
                    style={{ width: '2000px', height: '2000px' }}
                  >
                    <defs>
                      <marker
                        id="bpmn-arrow"
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366F1" />
                      </marker>
                    </defs>

                    {procState.edges.map((edge) => {
                      const fromNode = procState.nodes.find((n) => n.id === edge.from);
                      const toNode = procState.nodes.find((n) => n.id === edge.to);
                      if (!fromNode || !toNode) return null;

                      const sx = fromNode.x + (fromNode.type === 'task' ? 140 : 40);
                      const sy = fromNode.y + (fromNode.type === 'task' ? 32 : 24);
                      const tx = toNode.x;
                      const ty = toNode.y + (toNode.type === 'task' ? 32 : 24);

                      const midX = sx + (tx - sx) / 2;
                      const d = `M ${sx} ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${tx} ${ty}`;
                      const isSelected = selectedEdgeId === edge.id;

                      return (
                        <g key={edge.id} className="pointer-events-auto cursor-pointer" onClick={() => setSelectedEdgeId(edge.id)}>
                          <path
                            d={d}
                            fill="none"
                            stroke={isSelected ? '#EC4899' : '#6366F1'}
                            strokeWidth={isSelected ? 3.5 : 2.5}
                            markerEnd="url(#bpmn-arrow)"
                          />
                          {edge.label && (
                            <text
                              x={(sx + tx) / 2}
                              y={(sy + ty) / 2 - 8}
                              fill="#4F46E5"
                              fontSize="11"
                              fontWeight="bold"
                              textAnchor="middle"
                              className="bg-white"
                            >
                              {edge.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* BPMN Nodes Layer */}
                  {procState.nodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isConnectSource = connectSourceNodeId === node.id;
                    const isTokenActive = simTokenNodeId === node.id;
                    const assignedPerson = people.find((p) => p.id === (node.raci?.responsibleId || node.personId));

                    return (
                      <div
                        key={node.id}
                        onClick={() => handleNodeClick(node.id)}
                        className={`absolute rounded-2xl transition-all cursor-pointer select-none ${
                          isTokenActive
                            ? 'ring-4 ring-amber-400 shadow-2xl scale-110 z-30 bg-amber-50/80 dark:bg-amber-950/80'
                            : isSelected
                            ? 'ring-4 ring-indigo-500 shadow-xl z-20'
                            : isConnectSource
                            ? 'ring-4 ring-amber-500 shadow-xl z-20'
                            : 'shadow-md hover:shadow-lg'
                        }`}
                        style={{
                          left: `${node.x}px`,
                          top: `${node.y}px`
                        }}
                      >
                        {/* Token Indicator Badge */}
                        {isTokenActive && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] shadow-lg flex items-center gap-1 z-40 animate-bounce whitespace-nowrap">
                            <Zap className="w-3 h-3 fill-current" />
                            <span>توکن فعال در جریان</span>
                          </div>
                        )}

                        {/* Start Event */}
                        {node.type === 'start' && (
                          <div className="w-13 h-13 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-white font-bold text-xs text-center p-1">
                            <Play className="w-5 h-5 fill-current" />
                          </div>
                        )}

                        {/* End Event */}
                        {node.type === 'end' && (
                          <div
                            className={`w-13 h-13 rounded-full border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-white font-bold text-xs ${
                              node.subtype === 'error' ? 'bg-rose-600' : 'bg-rose-500'
                            }`}
                          >
                            <CheckCircle className="w-5 h-5 fill-current" />
                          </div>
                        )}

                        {/* Gateway */}
                        {node.type === 'gateway' && (
                          <div className="w-14 h-14 bg-amber-500 border-4 border-white dark:border-slate-800 shadow-md transform rotate-45 flex items-center justify-center text-white">
                            <span className="transform -rotate-45 font-black text-sm">
                              {node.subtype === 'parallel' ? '+' : node.subtype === 'inclusive' ? 'O' : 'X'}
                            </span>
                          </div>
                        )}

                        {/* Activity / Task */}
                        {node.type === 'task' && (
                          <div className={`w-44 min-h-18 p-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 shadow-md flex flex-col justify-between ${
                            node.subtype === 'call_activity'
                              ? 'border-4 border-teal-600 dark:border-teal-400 bg-teal-50/20'
                              : 'border-indigo-500/80'
                          }`}>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-[10px] font-extrabold uppercase tracking-wide ${
                                node.subtype === 'call_activity' ? 'text-teal-600 dark:text-teal-400' : 'text-indigo-600 dark:text-indigo-400'
                              }`}>
                                {node.subtype === 'service'
                                  ? 'Service Task'
                                  : node.subtype === 'call_activity'
                                  ? 'Call Activity ⊞'
                                  : node.subtype === 'rule'
                                  ? 'Business Rule'
                                  : 'User Task'}
                              </span>
                              {node.subtype === 'call_activity' && node.targetProcessId && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveProcessId(node.targetProcessId!);
                                  }}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-0.5 shadow-sm"
                                  title="جهش مستقیم به فرآیند زیرمجموعه"
                                >
                                  🔗 جهش
                                </button>
                              )}
                              {node.raci?.accountableId && (
                                <span className="px-1 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  RACI: A
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2">
                              {node.label}
                            </p>
                            {assignedPerson && (
                              <div className="mt-2 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-700 dark:text-slate-300 font-semibold truncate">
                                <Users className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                                <span className="truncate">{assignedPerson.name} ({assignedPerson.department})</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Side Properties Panel */}
              <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto flex-shrink-0">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {isRtl ? 'ویژگی‌های فعالیت (BPMN)' : 'Node Properties'}
                      </h4>
                      <span className="text-xs font-mono font-bold text-indigo-600">#{selectedNode.id}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isRtl ? 'عنوان گام' : 'Label'}
                      </label>
                      <input
                        type="text"
                        value={selectedNode.label}
                        onChange={(e) => {
                          const nodes = procState.nodes.map((n) =>
                            n.id === selectedNode.id ? { ...n, label: e.target.value } : n
                          );
                          updateProcess({ ...procState, nodes });
                        }}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                      />
                    </div>

                    {selectedNode.type === 'task' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isRtl ? 'مجری مستقیم (Responsible - R)' : 'Responsible (R)'}
                          </label>
                          <select
                            value={selectedNode.raci?.responsibleId || selectedNode.personId || ''}
                            onChange={(e) => {
                              const pId = e.target.value;
                              const nodes = procState.nodes.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      personId: pId,
                                      raci: { ...n.raci, responsibleId: pId }
                                    }
                                  : n
                              );
                              updateProcess({ ...procState, nodes });
                            }}
                            className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                          >
                            <option value="">{isRtl ? '— بدون مجری —' : '— None —'}</option>
                            {people.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.title} - {p.department})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {isRtl ? 'پاسخگوی نهایی / تصویب‌کننده (Accountable - A)' : 'Accountable (A)'}
                          </label>
                          <select
                            value={selectedNode.raci?.accountableId || ''}
                            onChange={(e) => {
                              const aId = e.target.value;
                              const nodes = procState.nodes.map((n) =>
                                n.id === selectedNode.id
                                  ? {
                                      ...n,
                                      raci: { ...n.raci, accountableId: aId }
                                    }
                                  : n
                              );
                              updateProcess({ ...procState, nodes });
                            }}
                            className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                          >
                            <option value="">{isRtl ? '— انتخاب تأییدکننده —' : '— Select Approver —'}</option>
                            {people.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.title})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Call Activity Target Process Selector */}
                        {selectedNode.subtype === 'call_activity' && (
                          <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5">
                            <label className="block text-xs font-black text-teal-800 dark:text-teal-200">
                              {isRtl ? 'فرآیند مقصد جهت پیوند (Call Activity)' : 'Target Sub-Process'}
                            </label>
                            <select
                              value={selectedNode.targetProcessId || ''}
                              onChange={(e) => {
                                const tId = e.target.value;
                                const nodes = procState.nodes.map((n) =>
                                  n.id === selectedNode.id ? { ...n, targetProcessId: tId } : n
                                );
                                updateProcess({ ...procState, nodes });
                              }}
                              className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 font-bold outline-none"
                            >
                              <option value="">{isRtl ? '— انتخاب فرآیند مقصد —' : '— Select Target Process —'}</option>
                              {processes
                                .filter((p) => p.id !== procState.id)
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-teal-700 dark:text-teal-400">
                              با کلیک روی دکمه «جهش» روی این تسک، دیاگرام فرآیند مقصد بلافاصله باز می‌شود.
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isRtl ? 'موقعیت X و Y' : 'Coordinates'}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={Math.round(selectedNode.x)}
                          onChange={(e) => {
                            const nodes = procState.nodes.map((n) =>
                              n.id === selectedNode.id ? { ...n, x: Number(e.target.value) } : n
                            );
                            updateProcess({ ...procState, nodes });
                          }}
                          className="text-xs p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
                        />
                        <input
                          type="number"
                          value={Math.round(selectedNode.y)}
                          onChange={(e) => {
                            const nodes = procState.nodes.map((n) =>
                              n.id === selectedNode.id ? { ...n, y: Number(e.target.value) } : n
                            );
                            updateProcess({ ...procState, nodes });
                          }}
                          className="text-xs p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
                        />
                      </div>
                    </div>
                  </div>
                ) : selectedEdge ? (
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-800">
                      {isRtl ? 'ویژگی‌های اتصال (Sequence Flow)' : 'Edge Properties'}
                    </h4>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isRtl ? 'برچسب شرط (مانند: تأیید شد)' : 'Condition Label'}
                      </label>
                      <input
                        type="text"
                        value={selectedEdge.label || ''}
                        onChange={(e) => {
                          const edges = procState.edges.map((ed) =>
                            ed.id === selectedEdge.id ? { ...ed, label: e.target.value } : ed
                          );
                          updateProcess({ ...procState, edges });
                        }}
                        className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        placeholder="بلی / خیر / شرط..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-600 dark:text-slate-400">
                    <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">
                      {isRtl
                        ? 'برای مشاهده و ویرایش مشخصات، روی یک گره یا خط اتصال کلیک کنید.'
                        : 'Click on any node or edge to edit properties and RACI assignments.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RACI Matrix View */}
        {activeViewTab === 'RACI_MATRIX' && (
          <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                  {isRtl ? 'ماتریس حاکمیتی RACI برای کلیه فعالیت‌های فرآیند' : 'RACI Governance Matrix'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  R: مجری کار | A: پاسخگو و تصویب‌کننده | C: مشاور تخصصی | I: مطلع‌شونده
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">گام / فعالیت فرآیندی</th>
                      <th className="p-3">نوع گام</th>
                      <th className="p-3">مجری مستقیم (R)</th>
                      <th className="p-3">تصویب‌کننده (A)</th>
                      <th className="p-3">وضعیت حاکمیتی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {procState.nodes
                      .filter((n) => n.type === 'task')
                      .map((task) => {
                        const rPerson = people.find((p) => p.id === (task.raci?.responsibleId || task.personId));
                        const aPerson = people.find((p) => p.id === task.raci?.accountableId);
                        const hasConflict = rPerson && aPerson && rPerson.id === aPerson.id;

                        return (
                          <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{task.label}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                                {task.subtype || 'task'}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                              {rPerson ? `${rPerson.name} (${rPerson.title})` : '—'}
                            </td>
                            <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                              {aPerson ? `${aPerson.name} (${aPerson.title})` : '—'}
                            </td>
                            <td className="p-3">
                              {hasConflict ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  تعارض تفکیک وظایف (R=A)
                                </span>
                              ) : rPerson && aPerson ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  منطبق با حاکمیت
                                </span>
                              ) : (
                                <span className="text-slate-600">نیازمند تکمیل</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bottleneck Analysis View */}
        {activeViewTab === 'BOTTLENECK' && (
          <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  {isRtl ? 'تحلیل هوشمند گلوگاه‌ها، تأخیرهای سازمانی و تعارض SoD' : 'Bottleneck & SoD Conflict Report'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  این موتور به صورت هوشمند فاصله گراف سازمانی بین مجریان فعالیت‌های متوالی و تعارض‌های حاکمیتی را بررسی می‌کند.
                </p>
              </div>

              {bottlenecks.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    {isRtl ? 'هیچ گلوگاه بحرانی یا تعارض تفکیک وظایف مشاهده نشد.' : 'No critical bottlenecks detected.'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    جریان داده و تخصیص نقش‌ها در این فرآیند از انطباق مطلوب سازمانی برخوردار است.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bottlenecks.map((b, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-start gap-3 ${
                        b.severity === 'critical'
                          ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900'
                          : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          b.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                            {b.fromLabel} ({b.fromPerson?.name || '—'}) → {b.toLabel} ({b.toPerson?.name || '—'})
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              b.severity === 'critical'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-600 text-white'
                            }`}
                          >
                            {b.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5">{b.reason}</p>
                        {b.orgDistance > 0 && (
                          <span className="inline-block mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            فاصله ساختاری در چارت: {b.orgDistance} گام مدیریتی
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quality Lint & Conformance View (Signavio-Grade) */}
        {activeViewTab === 'QUALITY_LINT' && (
          <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Health Score Overview Card */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ${
                      qualityReport.score >= 90
                        ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                        : qualityReport.score >= 70
                        ? 'bg-amber-500 text-white shadow-amber-500/30'
                        : 'bg-rose-500 text-white shadow-rose-500/30'
                    }`}
                  >
                    {qualityReport.score}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{isRtl ? 'سنجش کیفیت، انطباق و سلامت فرآیند' : 'Process Quality & Conformance'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        Signavio Engine
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {qualityReport.issues.length === 0
                        ? (isRtl ? 'فرآیند بدون نقص ساختاری و کاملاً منطبق با استاندارد BPMN 2.0 است.' : 'Zero quality defects found.')
                        : (isRtl ? `${qualityReport.issues.length} مورد نیازمند توجه و بهینه‌سازی شناسایی شد.` : `${qualityReport.issues.length} quality issues detected.`)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-center min-w-20">
                    <div className="font-black text-sm text-rose-600">{qualityReport.criticalCount}</div>
                    <div className="text-[10px] text-slate-400">ایراد بحرانی</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-center min-w-20">
                    <div className="font-black text-sm text-amber-600">{qualityReport.warningCount}</div>
                    <div className="text-[10px] text-slate-400">هشدار اصلاح</div>
                  </div>
                </div>
              </div>

              {/* Quality Issues List */}
              <div className="space-y-3">
                {qualityReport.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                      issue.severity === 'critical'
                        ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900'
                        : issue.severity === 'warning'
                        ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900'
                        : 'bg-blue-50/70 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          issue.severity === 'critical'
                            ? 'text-rose-600'
                            : issue.severity === 'warning'
                            ? 'text-amber-600'
                            : 'text-blue-600'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-xs text-slate-900 dark:text-slate-100">
                            {issue.titleFa}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              issue.severity === 'critical'
                                ? 'bg-rose-600 text-white'
                                : issue.severity === 'warning'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {issue.severity === 'critical' ? 'بحرانی' : issue.severity === 'warning' ? 'هشدار' : 'پیشنهاد'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{issue.descFa}</p>
                      </div>
                    </div>

                    {issue.nodeId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNodeId(issue.nodeId!);
                          setActiveViewTab('CANVAS');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950 whitespace-nowrap shadow-sm"
                      >
                        {issue.fixActionFa} ←
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cross-Process Handshakes & Value Chain Continuity */}
        {activeViewTab === 'HANDSHAKES' && (
          <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-indigo-600" />
                  {isRtl ? 'معماری اتصال فرآیندها و زنجیره ارزش (Cross-Process Handshakes)' : 'Process Continuity'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {isRtl
                    ? 'پاسخ به معضل گسستگی فرآیندها: تعریف ورودی‌های محرک، خروجی‌های تحویلی، زیرفرآیندهای فراخوان (Call Activities) و فرآیند مقصد بعدی.'
                    : 'Solve process silos by defining triggers, deliverables, call activities, and chained downstream processes.'}
                </p>
              </div>

              {/* Visual Continuity Flow Diagram */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl flex items-center justify-between gap-3 overflow-x-auto">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-44 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block mb-1">
                    ورودی محرک (Input)
                  </span>
                  <div className="font-bold text-xs truncate">{procState.triggerInput || '— تعریف نشده —'}</div>
                </div>

                <ArrowRight className="w-6 h-6 text-indigo-400 flex-shrink-0 animate-pulse" />

                <div className="p-4 rounded-2xl bg-indigo-600 border-2 border-indigo-300 min-w-56 text-center shadow-lg">
                  <span className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold block mb-1">
                    فرآیند فعال فعلی
                  </span>
                  <div className="font-black text-sm">{procState.name}</div>
                  <div className="text-[10px] text-indigo-200 mt-1">
                    {procState.nodes.filter((n) => n.subtype === 'call_activity').length} زیرفرآیند متصل
                  </div>
                </div>

                <ArrowRight className="w-6 h-6 text-indigo-400 flex-shrink-0 animate-pulse" />

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-44 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block mb-1">
                    خروجی / تحویلی (Output)
                  </span>
                  <div className="font-bold text-xs truncate">{procState.expectedOutput || '— تعریف نشده —'}</div>
                </div>

                <ArrowRight className="w-6 h-6 text-indigo-400 flex-shrink-0 animate-pulse" />

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-48 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold block mb-1">
                    فرآیند بعدی زنجیره ارزش
                  </span>
                  <div className="font-bold text-xs text-indigo-200 truncate">
                    {processes.find((p) => p.id === procState.nextProcessId)?.name || '— فرآیند بعدی تعریف نشده —'}
                  </div>
                </div>
              </div>

              {/* Settings Form */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {isRtl ? 'تنظیمات پیوندها و ورودی/خروجی‌های این فرآیند:' : 'Configure Handshake Parameters:'}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRtl ? 'سند یا رویداد محرک ورودی (Input Trigger)' : 'Input Trigger / Artifact'}
                    </label>
                    <input
                      type="text"
                      value={procState.triggerInput || ''}
                      onChange={(e) => updateProcess({ ...procState, triggerInput: e.target.value })}
                      placeholder="مثلاً: دریافت تیکت خرید کالا، فرم استخدام پرسنل"
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRtl ? 'محصول یا سند خروجی نهایی (Output Deliverable)' : 'Expected Output'}
                    </label>
                    <input
                      type="text"
                      value={procState.expectedOutput || ''}
                      onChange={(e) => updateProcess({ ...procState, expectedOutput: e.target.value })}
                      placeholder="مثلاً: صدور فاکتور رسمی، تحویل کالا به انبار"
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'فرآیند زنجیره‌ای بعدی (Downstream Chained Process)' : 'Downstream Chained Process'}
                  </label>
                  <select
                    value={procState.nextProcessId || ''}
                    onChange={(e) => updateProcess({ ...procState, nextProcessId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="">{isRtl ? '— بدون اتصال به فرآیند بعدی —' : '— None —'}</option>
                    {processes
                      .filter((p) => p.id !== procState.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Value Chain & Enterprise Architecture Tab */}
        {activeViewTab === 'VALUE_CHAIN' && (
          <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header card */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <Layers className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                        {isRtl ? 'نقشه کلان فرآیندی سازمان (Enterprise Value Chain Architecture)' : 'Enterprise Value Chain Map'}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {processes.length} {isRtl ? 'فرآیند ثبت‌شده' : 'Processes'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isRtl
                        ? 'معماری جامع سطوح سه‌گانه فرآیندی مایکل پورتر: فرآیندهای مدیریتی و حاکمیتی، زنجیره ارزش اصلی، و خدمات پشتیبانی سازمانی'
                        : 'Porter 3-tier enterprise architecture: Strategic Management, Core Value Chain, and Supporting Operations'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateNewProcess('management')}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isRtl ? '+ فرآیند مدیریتی' : '+ Management'}
                  </button>
                  <button
                    onClick={() => handleCreateNewProcess('core')}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {isRtl ? '+ فرآیند اصلی (Core)' : '+ Core Value'}
                  </button>
                  <button
                    onClick={() => handleCreateNewProcess('support')}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isRtl ? '+ فرآیند پشتیبانی' : '+ Support'}
                  </button>
                </div>
              </div>

              {/* Tier 1: فرآیندهای مدیریتی و حاکمیتی (Management & Governance) */}
              <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-200 dark:border-amber-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <h4 className="font-black text-sm text-amber-900 dark:text-amber-200">
                      {isRtl ? '۱. فرآیندهای راهبردی، مدیریتی و حاکمیت سازمانی (Strategic Management)' : '1. Strategic & Management Processes'}
                    </h4>
                  </div>
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                    {processes.filter((p) => p.category === 'management').length} {isRtl ? 'فرآیند' : 'Processes'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processes
                    .filter((p) => p.category === 'management')
                    .map((proc) => renderProcessCard(proc))}
                  {processes.filter((p) => p.category === 'management').length === 0 && (
                    <div className="col-span-full p-4 rounded-2xl border border-dashed border-amber-300 dark:border-amber-800 text-center text-xs text-amber-700 dark:text-amber-400">
                      {isRtl ? 'هنوز فرآیندی در دسته مدیریتی ثبت نشده است.' : 'No management processes defined yet.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Tier 2: فرآیندهای اصلی زنجیره ارزش (Core Operational Processes) */}
              <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-200 dark:border-indigo-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-600" />
                    <h4 className="font-black text-sm text-indigo-900 dark:text-indigo-200">
                      {isRtl ? '۲. فرآیندهای اصلی و عملیاتی زنجیره ارزش (Core Value-Adding Operations)' : '2. Core Value Chain Processes'}
                    </h4>
                  </div>
                  <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">
                    {processes.filter((p) => !p.category || p.category === 'core').length} {isRtl ? 'فرآیند' : 'Processes'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processes
                    .filter((p) => !p.category || p.category === 'core')
                    .map((proc) => renderProcessCard(proc))}
                </div>
              </div>

              {/* Tier 3: فرآیندهای پشتیبانی (Support Processes) */}
              <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-200 dark:border-emerald-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-200">
                      {isRtl ? '۳. فرآیندهای پشتیبانی و خدمات عمومی (Supporting Processes)' : '3. Support Services Processes'}
                    </h4>
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    {processes.filter((p) => p.category === 'support').length} {isRtl ? 'فرآیند' : 'Processes'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processes
                    .filter((p) => p.category === 'support')
                    .map((proc) => renderProcessCard(proc))}
                  {processes.filter((p) => p.category === 'support').length === 0 && (
                    <div className="col-span-full p-4 rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800 text-center text-xs text-emerald-700 dark:text-emerald-400">
                      {isRtl ? 'هنوز فرآیندی در دسته پشتیبانی ثبت نشده است.' : 'No support processes defined yet.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. Process Cost & Workforce Simulation Tab */}
        {activeViewTab === 'COST_SIMULATION' && (
          <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Cost Simulation Header & Parameters */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Calculator className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {isRtl ? 'شبیه‌سازی هزینه فرآیند و بهره‌وری نیروی انسانی' : 'Process Cost & Workforce Simulation'}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        Signavio Cockpit
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isRtl
                        ? `محاسبه بهای تمام‌شده بر اساس ساعات کاری و حقوق ماهانه ثبت‌شده در چارت سازمانی (مبنای ۱۶۰ ساعت/ماه) برای فرآیند «${procState.name}»`
                        : `Calculates activity cost based on employee salaries (160h/month base) for process "${procState.name}"`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                    {isRtl ? 'تعداد تکرار ماهانه فرآیند:' : 'Monthly Executions:'}
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={simMonthlyExecutions}
                    onChange={(e) => setSimMonthlyExecutions(Math.max(1, Number(e.target.value) || 1))}
                    className="w-24 text-center text-xs font-black p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-indigo-600 dark:text-indigo-400"
                  />
                  <span className="text-xs text-slate-500 font-bold pr-1">بار در ماه</span>
                </div>
              </div>

              {/* Calculation Metrics Summary */}
              {(() => {
                const taskNodes = procState.nodes.filter((n) => n.type === 'task');
                const totalCycleHours = taskNodes.reduce(
                  (sum, n) => sum + (n.estimatedDurationHours || 2),
                  0
                );

                const taskCosts = taskNodes.map((node) => {
                  const assignedPerson = people.find(
                    (p) => p.id === node.personId || p.id === node.raci?.responsibleId
                  );
                  const salary = assignedPerson?.salary || 35000000;
                  const hourlyRate = Math.round(salary / 160);
                  const hours = node.estimatedDurationHours || 2;
                  const unitCost = hours * hourlyRate;
                  const monthlyCost = unitCost * simMonthlyExecutions;
                  return { node, assignedPerson, salary, hourlyRate, hours, unitCost, monthlyCost };
                });

                const totalUnitCost = taskCosts.reduce((sum, item) => sum + item.unitCost, 0);
                const totalMonthlyCost = totalUnitCost * simMonthlyExecutions;
                const totalAnnualCost = totalMonthlyCost * 12;
                const requiredFte = ((totalCycleHours * simMonthlyExecutions) / 160).toFixed(2);

                const sortedByCost = [...taskCosts].sort((a, b) => b.unitCost - a.unitCost);
                const mostExpensiveTask = sortedByCost[0];

                return (
                  <>
                    {/* 4 Primary KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                          <span>{isRtl ? 'زمان کل چرخه فرآیند' : 'Total Cycle Time'}</span>
                          <Clock className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                          {totalCycleHours}{' '}
                          <span className="text-xs font-normal text-slate-500">ساعت کار</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {taskNodes.length} {isRtl ? 'فعالیت کاری ثبت‌شده' : 'Task Activities'}
                        </div>
                      </div>

                      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                          <span>{isRtl ? 'بهای مستقیم هر بار اجرا' : 'Cost per Execution'}</span>
                          <Coins className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {totalUnitCost.toLocaleString('fa-IR')}{' '}
                          <span className="text-xs font-normal text-slate-500">تومان</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {isRtl ? 'بر اساس دستمزد مستقیم مجریان' : 'Direct labor unit cost'}
                        </div>
                      </div>

                      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                          <span>{isRtl ? 'هزینه ماهانه اجرای فرآیند' : 'Monthly Execution Cost'}</span>
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                          {totalMonthlyCost.toLocaleString('fa-IR')}{' '}
                          <span className="text-xs font-normal text-slate-500">تومان</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {isRtl ? `سالانه: ${totalAnnualCost.toLocaleString('fa-IR')} تومان` : 'Annual projection'}
                        </div>
                      </div>

                      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
                          <span>{isRtl ? 'نیروی کار تمام‌وقت (FTE)' : 'Required FTE'}</span>
                          <Users className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                          {requiredFte}{' '}
                          <span className="text-xs font-normal text-slate-500">نفر تمام‌وقت</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {(totalCycleHours * simMonthlyExecutions).toLocaleString('fa-IR')} ساعت کاری ماهانه
                        </div>
                      </div>
                    </div>

                    {/* What-If Financial Optimization Banner */}
                    {mostExpensiveTask && (
                      <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl flex items-center justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <span className="font-black text-sm text-amber-300">
                              {isRtl ? 'تحلیل هوشمند بهینه‌سازی هزینه (Cost Optimization Insight):' : 'Optimization Opportunity:'}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-100 leading-relaxed max-w-3xl">
                            {isRtl ? (
                              <>
                                گران‌ترین گلوگاه مالی این فرآیند، فعالیت{' '}
                                <b className="text-white underline">{mostExpensiveTask.node.label}</b> با هزینه{' '}
                                <b>{mostExpensiveTask.unitCost.toLocaleString('fa-IR')} تومان</b> در هر اجرا است (سهم{' '}
                                {Math.round((mostExpensiveTask.unitCost / (totalUnitCost || 1)) * 100)}٪ از کل فرآیند). با
                                اتوماسیون یا بازطراحی این گام و کاهش ۳۰٪ از زمان آن، سالانه بیش از{' '}
                                <b className="text-emerald-400">
                                  {Math.round(mostExpensiveTask.monthlyCost * 12 * 0.3).toLocaleString('fa-IR')} تومان
                                </b>{' '}
                                صرفه‌جویی حاصل خواهد شد.
                              </>
                            ) : (
                              `Activity "${mostExpensiveTask.node.label}" represents the largest cost share.`
                            )}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setActiveViewTab('CANVAS');
                            setSelectedNodeId(mostExpensiveTask.node.id);
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          {isRtl ? 'ویرایش این فعالیت در مدل‌ساز' : 'Edit Activity'}
                        </button>
                      </div>
                    )}

                    {/* Detailed Activity Cost Breakdown Table */}
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-indigo-600" />
                          {isRtl ? 'جدول تفکیک هزینه و زمان فعالیت‌ها (Activity-Based Costing)' : 'Activity Cost Table'}
                        </h4>
                        <span className="text-xs text-slate-500 font-bold">
                          {isRtl ? 'قابلیت ویرایش زنده ساعات کارکرد و انتساب پرسنل' : 'Live editable hours & assignees'}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50">
                              <th className="p-3">{isRtl ? 'فعالیت کاری (Task)' : 'Task Label'}</th>
                              <th className="p-3">{isRtl ? 'مجری منتسب (چارت)' : 'Assignee'}</th>
                              <th className="p-3">{isRtl ? 'حقوق ماهانه' : 'Salary'}</th>
                              <th className="p-3">{isRtl ? 'نرخ هر ساعت' : 'Hourly Rate'}</th>
                              <th className="p-3">{isRtl ? 'مدت زمان (ساعت)' : 'Duration (h)'}</th>
                              <th className="p-3">{isRtl ? 'هزینه هر بار اجرا' : 'Unit Cost'}</th>
                              <th className="p-3">{isRtl ? 'هزینه ماهانه' : 'Monthly Cost'}</th>
                              <th className="p-3">{isRtl ? 'سهم از فرآیند' : '% Share'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {taskCosts.map((item) => (
                              <tr
                                key={item.node.id}
                                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                                  <div className="flex items-center gap-2">
                                    <Square className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                                    <span>{item.node.label}</span>
                                  </div>
                                </td>

                                <td className="p-3">
                                  <select
                                    value={item.assignedPerson?.id || ''}
                                    onChange={(e) => {
                                      const nextNodes = procState.nodes.map((n) =>
                                        n.id === item.node.id
                                          ? {
                                              ...n,
                                              personId: e.target.value,
                                              raci: { ...(n.raci || {}), responsibleId: e.target.value }
                                            }
                                          : n
                                      );
                                      updateProcess({ ...procState, nodes: nextNodes });
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs max-w-44 truncate"
                                  >
                                    <option value="">{isRtl ? '— انتخاب مسئول —' : '— Select —'}</option>
                                    {people.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name} ({p.title})
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                <td className="p-3 font-medium text-slate-600 dark:text-slate-400">
                                  {item.salary.toLocaleString('fa-IR')} ت
                                </td>

                                <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                                  {item.hourlyRate.toLocaleString('fa-IR')} ت/ساعت
                                </td>

                                <td className="p-3">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min="0.25"
                                      step="0.5"
                                      max="200"
                                      value={item.hours}
                                      onChange={(e) => {
                                        const newHours = Math.max(0.25, Number(e.target.value) || 1);
                                        const nextNodes = procState.nodes.map((n) =>
                                          n.id === item.node.id ? { ...n, estimatedDurationHours: newHours } : n
                                        );
                                        updateProcess({ ...procState, nodes: nextNodes });
                                      }}
                                      className="w-16 p-1.5 text-center font-black rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                    />
                                    <span className="text-[10px] text-slate-500">ساعت</span>
                                  </div>
                                </td>

                                <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">
                                  {item.unitCost.toLocaleString('fa-IR')} ت
                                </td>

                                <td className="p-3 font-black text-slate-900 dark:text-slate-100">
                                  {item.monthlyCost.toLocaleString('fa-IR')} ت
                                </td>

                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                      <div
                                        className="h-full bg-indigo-600 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            Math.round((item.unitCost / (totalUnitCost || 1)) * 100)
                                          )}%`
                                        }}
                                      />
                                    </div>
                                    <span className="font-bold text-[10px] text-slate-500">
                                      {Math.round((item.unitCost / (totalUnitCost || 1)) * 100)}٪
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* 8. Risk & Control Matrix (RCM) & Governance Tab */}
        {activeViewTab === 'RISK_COMPLIANCE' && (
          <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header card with action */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {isRtl ? 'ماتریس ریسک‌ها و کنترل‌های داخلی (Risk & Control Matrix - RCM)' : 'Risk & Control Matrix'}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        GRC & SoD Engine
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isRtl
                        ? `شناسایی، ارزیابی شدت و احتمال، و نگاشت کنترل‌های داخلی پیشگیرانه روی گام‌های فرآیند «${procState.name}»`
                        : `Governance, Risk & Compliance mapping on process steps with internal control owners`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNewRiskForm({
                        title: '',
                        riskCode: `RSK-${Date.now().toString().slice(-4)}`,
                        category: 'operational',
                        likelihood: 3,
                        impact: 3,
                        controlTitle: '',
                        controlType: 'preventive',
                        controlOwnerId: people[0]?.id || '',
                        effectiveness: 'effective'
                      });
                      setIsAddRiskModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    {isRtl ? 'ثبت ریسک و کنترل جدید' : 'Add Risk & Control'}
                  </button>
                </div>
              </div>

              {/* RCM KPI Cards */}
              {(() => {
                const totalRisks = rcmList.length;
                const criticalRisks = rcmList.filter((r) => r.likelihood * r.impact >= 12).length;
                const effectiveControls = rcmList.filter((r) => r.effectiveness === 'effective').length;
                const effectivePercentage = totalRisks > 0 ? Math.round((effectiveControls / totalRisks) * 100) : 100;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-slate-500 text-xs font-bold mb-1">
                        {isRtl ? 'تعداد کل ریسک‌های ثبتی' : 'Total Risks'}
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalRisks}</div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {isRtl ? 'در سراسر گام‌های این فرآیند' : 'Across all process steps'}
                      </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-slate-500 text-xs font-bold mb-1">
                        {isRtl ? 'ریسک‌های بحرانی و بالا' : 'High & Critical Risks'}
                      </div>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{criticalRisks}</div>
                      <div className="text-[11px] text-rose-600 font-bold mt-1">
                        {isRtl ? 'نیاز به نظارت فوری و مداوم' : 'Requires immediate mitigation'}
                      </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-slate-500 text-xs font-bold mb-1">
                        {isRtl ? 'نرخ اثربخشی کنترل‌ها' : 'Control Effectiveness'}
                      </div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {effectivePercentage}٪
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold mt-1">
                        {effectiveControls} از {totalRisks} کنترل اثربخش است
                      </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="text-slate-500 text-xs font-bold mb-1">
                        {isRtl ? 'کنترل‌های تفکیک وظایف (SoD)' : 'SoD Segregation'}
                      </div>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {bottlenecks.filter((b) => b.soDConflict).length === 0 ? 'مطلوب' : 'دارای تعارض'}
                      </div>
                      <div className="text-[11px] text-indigo-500 font-bold mt-1">
                        {bottlenecks.filter((b) => b.soDConflict).length} تعارض تایید و اجرا کشف شد
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Filters & Search */}
              <div className="flex items-center justify-between gap-4 flex-wrap bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'فیلتر دسته‌بندی:' : 'Category Filter:'}
                  </span>
                  <select
                    value={rcmFilterCategory}
                    onChange={(e) => setRcmFilterCategory(e.target.value)}
                    className="p-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="all">{isRtl ? 'همه دسته‌ها' : 'All Categories'}</option>
                    <option value="operational">{isRtl ? 'عملیاتی (Operational)' : 'Operational'}</option>
                    <option value="financial">{isRtl ? 'مالی (Financial)' : 'Financial'}</option>
                    <option value="compliance">{isRtl ? 'تطبیق و قانونی (Compliance)' : 'Compliance'}</option>
                    <option value="cyber">{isRtl ? 'سایبری و IT' : 'Cyber/IT'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'وضعیت اثربخشی:' : 'Effectiveness:'}
                  </span>
                  <select
                    value={rcmFilterEffectiveness}
                    onChange={(e) => setRcmFilterEffectiveness(e.target.value)}
                    className="p-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="all">{isRtl ? 'همه وضعیت‌ها' : 'All Statuses'}</option>
                    <option value="effective">{isRtl ? 'اثربخش' : 'Effective'}</option>
                    <option value="needs_improvement">{isRtl ? 'نیازمند بهبود' : 'Needs Improvement'}</option>
                    <option value="deficient">{isRtl ? 'ضعیف یا اجرا‌نشده' : 'Deficient'}</option>
                  </select>
                </div>
              </div>

              {/* RCM Comprehensive Table */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50">
                        <th className="p-3">{isRtl ? 'کد و شرح ریسک' : 'Risk Code & Title'}</th>
                        <th className="p-3">{isRtl ? 'دسته‌بندی' : 'Category'}</th>
                        <th className="p-3">{isRtl ? 'شدت × احتمال' : 'L × I = Score'}</th>
                        <th className="p-3">{isRtl ? 'سطح ریسک ذاتی' : 'Inherent Risk'}</th>
                        <th className="p-3">{isRtl ? 'کنترل داخلی مصوب' : 'Internal Control'}</th>
                        <th className="p-3">{isRtl ? 'نوع کنترل' : 'Type'}</th>
                        <th className="p-3">{isRtl ? 'مسئول کنترل (مالک)' : 'Control Owner'}</th>
                        <th className="p-3">{isRtl ? 'اثربخشی' : 'Effectiveness'}</th>
                        <th className="p-3 text-center">{isRtl ? 'عملیات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {rcmList
                        .filter(
                          (r) => rcmFilterCategory === 'all' || r.category === rcmFilterCategory
                        )
                        .filter(
                          (r) =>
                            rcmFilterEffectiveness === 'all' || r.effectiveness === rcmFilterEffectiveness
                        )
                        .map((risk) => {
                          const score = risk.likelihood * risk.impact;
                          const riskBadge =
                            score >= 15
                              ? { bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300', label: 'بحرانی (Critical)' }
                              : score >= 10
                              ? { bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', label: 'بالا (High)' }
                              : score >= 6
                              ? { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300', label: 'متوسط (Medium)' }
                              : { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300', label: 'پایین (Low)' };

                          const ownerPerson = people.find((p) => p.id === risk.controlOwnerId);

                          return (
                            <tr
                              key={risk.id}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="p-3 max-w-64">
                                <span className="font-mono text-[10px] font-bold text-slate-500 block mb-0.5">
                                  {risk.riskCode}
                                </span>
                                <div className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                  {risk.title}
                                </div>
                              </td>

                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {risk.category === 'operational'
                                    ? 'عملیاتی'
                                    : risk.category === 'financial'
                                    ? 'مالی'
                                    : risk.category === 'compliance'
                                    ? 'تطبیق/قانونی'
                                    : 'سایبری و IT'}
                                </span>
                              </td>

                              <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                                {risk.likelihood} × {risk.impact} = <b className="text-indigo-600">{score}</b>
                              </td>

                              <td className="p-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${riskBadge.bg}`}>
                                  {riskBadge.label}
                                </span>
                              </td>

                              <td className="p-3 max-w-64 font-medium text-slate-700 dark:text-slate-300 leading-snug">
                                {risk.controlTitle}
                              </td>

                              <td className="p-3">
                                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                                  {risk.controlType === 'preventive'
                                    ? 'پیشگیرانه'
                                    : risk.controlType === 'detective'
                                    ? 'کشف‌کننده'
                                    : 'اصلاحی'}
                                </span>
                              </td>

                              <td className="p-3">
                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                  {ownerPerson?.name || '— بدون انتساب —'}
                                </div>
                                <div className="text-[10px] text-slate-500">{ownerPerson?.title || ''}</div>
                              </td>

                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                    risk.effectiveness === 'effective'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : risk.effectiveness === 'needs_improvement'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  }`}
                                >
                                  {risk.effectiveness === 'effective'
                                    ? 'اثربخش'
                                    : risk.effectiveness === 'needs_improvement'
                                    ? 'نیازمند بهبود'
                                    : 'ضعیف'}
                                </span>
                              </td>

                              <td className="p-3 text-center">
                                <button
                                  onClick={() => setRcmList((prev) => prev.filter((r) => r.id !== risk.id))}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  title="حذف ریسک"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add New Risk & Control */}
        {isAddRiskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-right">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  {isRtl ? 'ثبت ریسک و کنترل داخلی جدید در RCM' : 'Add Risk & Internal Control'}
                </h3>
                <button
                  onClick={() => setIsAddRiskModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'عنوان و شرح ریسک فرآیندی:' : 'Risk Description:'}
                  </label>
                  <input
                    type="text"
                    value={newRiskForm.title}
                    onChange={(e) => setNewRiskForm({ ...newRiskForm, title: e.target.value })}
                    placeholder="مثلاً: صدور فاکتور بدون تاییدیه انباردار"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRtl ? 'دسته‌بندی ریسک:' : 'Category:'}
                    </label>
                    <select
                      value={newRiskForm.category}
                      onChange={(e) => setNewRiskForm({ ...newRiskForm, category: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      <option value="operational">عملیاتی (Operational)</option>
                      <option value="financial">مالی (Financial)</option>
                      <option value="compliance">تطبیق و قانونی (Compliance)</option>
                      <option value="cyber">سایبری و IT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRtl ? 'کد شناسایی ریسک:' : 'Risk Code:'}
                    </label>
                    <input
                      type="text"
                      value={newRiskForm.riskCode}
                      onChange={(e) => setNewRiskForm({ ...newRiskForm, riskCode: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRtl ? 'احتمال وقوع (۱ تا ۵):' : 'Likelihood (1-5):'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newRiskForm.likelihood}
                      onChange={(e) => setNewRiskForm({ ...newRiskForm, likelihood: Math.min(5, Math.max(1, Number(e.target.value))) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-center"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRtl ? 'شدت اثر و خسارت (۱ تا ۵):' : 'Impact (1-5):'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newRiskForm.impact}
                      onChange={(e) => setNewRiskForm({ ...newRiskForm, impact: Math.min(5, Math.max(1, Number(e.target.value))) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'عنوان کنترل داخلی پیش‌بینی‌شده:' : 'Internal Control Activity:'}
                  </label>
                  <input
                    type="text"
                    value={newRiskForm.controlTitle}
                    onChange={(e) => setNewRiskForm({ ...newRiskForm, controlTitle: e.target.value })}
                    placeholder="مثلاً: قفل شدن صدور حواله خروج تا زمان ثبت مهر انباردار"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRtl ? 'نوع کنترل:' : 'Control Type:'}
                    </label>
                    <select
                      value={newRiskForm.controlType}
                      onChange={(e) => setNewRiskForm({ ...newRiskForm, controlType: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      <option value="preventive">پیشگیرانه (Preventive)</option>
                      <option value="detective">کشف‌کننده (Detective)</option>
                      <option value="corrective">اصلاحی (Corrective)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isRtl ? 'مسئول کنترل (Control Owner):' : 'Owner:'}
                    </label>
                    <select
                      value={newRiskForm.controlOwnerId}
                      onChange={(e) => setNewRiskForm({ ...newRiskForm, controlOwnerId: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold truncate"
                    >
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.title})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'وضعیت اثربخشی کنترل:' : 'Effectiveness:'}
                  </label>
                  <select
                    value={newRiskForm.effectiveness}
                    onChange={(e) => setNewRiskForm({ ...newRiskForm, effectiveness: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="effective">اثربخش و فعال (Effective)</option>
                    <option value="needs_improvement">نیازمند بازنگری و بهبود (Needs Improvement)</option>
                    <option value="deficient">ضعیف یا پیاده‌نشده (Deficient)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsAddRiskModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  disabled={!newRiskForm.title.trim()}
                  onClick={() => {
                    const createdItem = {
                      id: `rcm-${Date.now()}`,
                      processId: activeProcessId,
                      ...newRiskForm
                    };
                    setRcmList((prev) => [createdItem, ...prev]);
                    setIsAddRiskModalOpen(false);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-md shadow-rose-600/20"
                >
                  {isRtl ? 'افزودن ریسک به ماتریس' : 'Add to Matrix'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Move,
  Link,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Briefcase,
  DollarSign,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
  Check,
  Camera,
  CornerDownRight,
  Spline,
  ShieldAlert,
  GitCommit,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Presentation,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PersonNode, ViewSettings, CustomRelationship, UserRole } from '../types/pingonest';
import { HierarchyEngine } from '../services/analyticsService';
import { HierarchyValidator, MoveValidationResult } from '../services/hierarchyValidator';
import MoveWarningModal from './MoveWarningModal';
import PersonAvatar from './PersonAvatar';

interface OrgChartCanvasProps {
  people: PersonNode[];
  viewSettings: ViewSettings;
  searchQuery: string;
  highlightProjectId?: string;
  userRole?: UserRole;
  onEditPerson: (person: PersonNode) => void;
  onAddSubordinate: (parentPerson: PersonNode) => void;
  onDeletePerson: (personId: string) => void;
  onMovePerson: (personId: string, newParentId: string, syncDepartment?: boolean) => void;
  onAddToProject: (person: PersonNode) => void;
  onSaveRelationship?: (fromPersonId: string, toPersonId: string, rel: CustomRelationship) => void;
  onDeleteRelationship?: (fromPersonId: string, toPersonId: string) => void;
  isRtl: boolean;
}

export const RELATIONSHIP_CONFIG: Record<string, { labelFa: string; labelEn: string; color: string; formal: boolean; dash: string }> = {
  functional: { labelFa: 'وظیفه‌ای', labelEn: 'Functional', color: '#0891B2', formal: true, dash: '0' },
  advisory: { labelFa: 'مشاوره‌ای', labelEn: 'Advisory', color: '#7C3AED', formal: true, dash: '6 4' },
  matrix: { labelFa: 'ماتریسی', labelEn: 'Matrix', color: '#DC2626', formal: true, dash: '4 4' },
  project: { labelFa: 'پروژه‌ای', labelEn: 'Project', color: '#059669', formal: true, dash: '8 4' },
  dependency: { labelFa: 'وابستگی', labelEn: 'Dependency', color: '#EA580C', formal: true, dash: '6 3' },
  collaboration: { labelFa: 'همکاری', labelEn: 'Collaboration', color: '#F59E0B', formal: false, dash: '5 5' },
  information: { labelFa: 'جریان اطلاعات', labelEn: 'Information Flow', color: '#0284C7', formal: false, dash: '3 3' },
  influence: { labelFa: 'نفوذ غیررسمی', labelEn: 'Informal Influence', color: '#8B5CF6', formal: false, dash: '5 3' },
  other: { labelFa: 'سایر', labelEn: 'Other', color: '#64748B', formal: false, dash: '4 4' }
};

const DEPT_COLORS: { [key: string]: string } = {
  'هیئت مدیره': '#1E40AF',
  'مالی و اداری': '#059669',
  'فنی و مهندسی': '#0284C7',
  'بازاریابی و فروش': '#DC2626',
  'منابع انسانی': '#7C3AED',
  'فناوری اطلاعات': '#0891B2',
  'حقوقی': '#EA580C',
  'Board of Directors': '#1E40AF',
  'Finance & Admin': '#059669',
  'Engineering': '#0284C7',
  'Marketing & Sales': '#DC2626',
  'Human Resources': '#7C3AED',
  'default': '#475569'
};

const LEVEL_COLORS = [
  '#1E40AF', '#0284C7', '#059669', '#DC2626', '#7C3AED',
  '#EA580C', '#0891B2', '#BE185D', '#0F766E', '#B45309'
];

interface LayoutNode {
  data: PersonNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
}

export default function OrgChartCanvas({
  people,
  viewSettings,
  searchQuery,
  highlightProjectId,
  userRole = 'super_admin',
  onEditPerson,
  onAddSubordinate,
  onDeletePerson,
  onMovePerson,
  onAddToProject,
  onSaveRelationship,
  onDeleteRelationship,
  isRtl
}: OrgChartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const canEdit = userRole !== 'employee_viewer';

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Collapse set for branch folding
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Line rendering and styling mode
  const [lineMode, setLineMode] = useState<'orthogonal' | 'bezier'>('orthogonal');
  const [lineThickness, setLineThickness] = useState<number>(() => viewSettings.linkThickness || 3.5);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Drag and drop & Move Validation state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [dragOverValid, setDragOverValid] = useState<boolean>(true);
  const [dragOverValidation, setDragOverValidation] = useState<MoveValidationResult | null>(null);
  const [pendingMoveValidation, setPendingMoveValidation] = useState<MoveValidationResult | null>(null);

  // MiniMap & Executive Presentation Mode
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [presentationIndex, setPresentationIndex] = useState<number>(0);

  // Interactive Relationship Drawing State
  const [isDrawingRel, setIsDrawingRel] = useState<boolean>(false);
  const [relSourceId, setRelSourceId] = useState<string | null>(null);
  const [relModalTarget, setRelModalTarget] = useState<{ sourceId: string; targetId: string } | null>(null);
  const [newRelType, setNewRelType] = useState<CustomRelationship['typeId']>('matrix');
  const [newRelDir, setNewRelDir] = useState<'oneway' | 'twoway'>('oneway');
  const [newRelNote, setNewRelNote] = useState<string>('');
  const [showRelationLines, setShowRelationLines] = useState<boolean>(true);

  // Context Menu & Quick Photo Upload State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; person: PersonNode } | null>(null);
  const [targetPhotoPerson, setTargetPhotoPerson] = useState<PersonNode | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleCloseCtx = () => setContextMenu(null);
    window.addEventListener('click', handleCloseCtx);
    return () => window.removeEventListener('click', handleCloseCtx);
  }, []);

  const cardWidth = 320;
  const cardHeight = 165;
  const hGap = 40;
  const vGap = viewSettings.levelSpacing || 110;

  // Build hierarchical layout tree
  const layoutTree = useMemo(() => {
    if (people.length === 0) return null;

    const childrenMap = new Map<string, PersonNode[]>();
    people.forEach((p) => {
      const arr = childrenMap.get(p.parentId) || [];
      arr.push(p);
      childrenMap.set(p.parentId, arr);
    });

    const rootNodes = people.filter((p) => !p.parentId);
    if (rootNodes.length === 0 && people.length > 0) {
      rootNodes.push(people[0]);
    }

    function buildNode(p: PersonNode): LayoutNode {
      const isCollapsed = collapsedIds.has(p.id);
      const kids = isCollapsed ? [] : (childrenMap.get(p.id) || []);
      return {
        data: p,
        x: 0,
        y: 0,
        width: cardWidth,
        height: cardHeight,
        children: kids.map(buildNode)
      };
    }

    const roots = rootNodes.map(buildNode);

    // Compute sub-tree widths
    function computeWidths(node: LayoutNode): number {
      if (node.children.length === 0) {
        return node.width;
      }
      const childrenTotalWidth = node.children.reduce((acc, c) => acc + computeWidths(c), 0) + (node.children.length - 1) * hGap;
      return Math.max(node.width, childrenTotalWidth);
    }

    // Position nodes
    function assignPositions(node: LayoutNode, left: number, top: number) {
      const subTreeWidth = computeWidths(node);
      node.y = top;
      node.x = left + subTreeWidth / 2 - node.width / 2;

      let currentLeft = left;
      for (const child of node.children) {
        const childWidth = computeWidths(child);
        assignPositions(child, currentLeft, top + node.height + vGap);
        currentLeft += childWidth + hGap;
      }
    }

    let globalLeft = 0;
    roots.forEach((root) => {
      const w = computeWidths(root);
      assignPositions(root, globalLeft, 60);
      globalLeft += w + hGap * 2;
    });

    return roots;
  }, [people, collapsedIds, vGap]);

  // Flatten positioned nodes for rendering
  const positionedNodes = useMemo(() => {
    const list: LayoutNode[] = [];
    function collect(node: LayoutNode) {
      list.push(node);
      node.children.forEach(collect);
    }
    if (layoutTree) layoutTree.forEach(collect);
    return list;
  }, [layoutTree]);

  // Tree bounding box calculation for MiniMap
  const treeBounds = useMemo(() => {
    if (positionedNodes.length === 0) return { minX: 0, maxX: 1200, minY: 0, maxY: 800, width: 1200, height: 800 };
    const minX = Math.min(...positionedNodes.map((n) => n.x)) - 100;
    const maxX = Math.max(...positionedNodes.map((n) => n.x + n.width)) + 100;
    const minY = Math.min(...positionedNodes.map((n) => n.y)) - 60;
    const maxY = Math.max(...positionedNodes.map((n) => n.y + n.height)) + 100;
    return {
      minX,
      maxX,
      minY,
      maxY,
      width: Math.max(maxX - minX, 100),
      height: Math.max(maxY - minY, 100)
    };
  }, [positionedNodes]);

  const focusOnNode = useCallback((node: LayoutNode) => {
    if (!containerRef.current) return;
    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;
    const targetZoom = 1;
    setZoom(targetZoom);
    setPan({
      x: containerW / 2 - (node.x + node.width / 2) * targetZoom,
      y: containerH / 2 - (node.y + node.height / 2) * targetZoom
    });
  }, []);

  // Executive Presentation Mode Controller
  useEffect(() => {
    if (!isPresentationMode || positionedNodes.length === 0) return;
    const targetNode = positionedNodes[presentationIndex % positionedNodes.length];
    if (targetNode) focusOnNode(targetNode);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPresentationMode(false);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setPresentationIndex((i) => (i + 1) % positionedNodes.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setPresentationIndex((i) => (i - 1 + positionedNodes.length) % positionedNodes.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPresentationMode, presentationIndex, positionedNodes, focusOnNode]);

  // Calculate perimeter edge connection ports so relationship lines connect borders rather than behind cards
  const computeEdgeConnectionPorts = (
    source: { x: number; y: number; width: number; height: number },
    target: { x: number; y: number; width: number; height: number }
  ) => {
    const sCenterX = source.x + source.width / 2;
    const sCenterY = source.y + source.height / 2;
    const tCenterX = target.x + target.width / 2;
    const tCenterY = target.y + target.height / 2;

    const dx = tCenterX - sCenterX;
    const dy = tCenterY - sCenterY;

    let sx: number, sy: number, tx: number, ty: number;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal dominant
      if (dx > 0) {
        // Target is to the right
        sx = source.x + source.width;
        sy = sCenterY;
        tx = target.x;
        ty = tCenterY;
      } else {
        // Target is to the left
        sx = source.x;
        sy = sCenterY;
        tx = target.x + target.width;
        ty = tCenterY;
      }
    } else {
      // Vertical dominant
      if (dy > 0) {
        // Target is below
        sx = sCenterX;
        sy = source.y + source.height;
        tx = tCenterX;
        ty = target.y;
      } else {
        // Target is above
        sx = sCenterX;
        sy = source.y;
        tx = tCenterX;
        ty = target.y + target.height;
      }
    }

    return { sx, sy, tx, ty };
  };

  // Hierarchical Links (Direct managerial hierarchy lines)
  const links = useMemo(() => {
    const lines: { id: string; sourceId: string; targetId: string; sx: number; sy: number; tx: number; ty: number }[] = [];
    positionedNodes.forEach((parent) => {
      parent.children.forEach((child) => {
        lines.push({
          id: `${parent.data.id}-${child.data.id}`,
          sourceId: parent.data.id,
          targetId: child.data.id,
          sx: parent.x + parent.width / 2,
          sy: parent.y + parent.height,
          tx: child.x + child.width / 2,
          ty: child.y
        });
      });
    });
    return lines;
  }, [positionedNodes]);

  // Custom & Matrix & Functional Relationships (Edge-to-Edge)
  const customLinks = useMemo(() => {
    const lines: {
      id: string;
      fromId: string;
      toId: string;
      sx: number;
      sy: number;
      tx: number;
      ty: number;
      typeId: string;
      direction: 'oneway' | 'twoway';
      color: string;
      labelFa: string;
      note?: string;
      dash: string;
    }[] = [];

    const map = new Map(positionedNodes.map((n) => [n.data.id, n]));

    people.forEach((p) => {
      const sourceNode = map.get(p.id);
      if (!sourceNode) return;

      // Legacy dottedLineParentId
      if (p.dottedLineParentId && map.has(p.dottedLineParentId)) {
        const targetNode = map.get(p.dottedLineParentId)!;
        const ports = computeEdgeConnectionPorts(sourceNode, targetNode);
        lines.push({
          id: `dotted-${p.id}-${p.dottedLineParentId}`,
          fromId: p.id,
          toId: p.dottedLineParentId,
          sx: ports.sx,
          sy: ports.sy,
          tx: ports.tx,
          ty: ports.ty,
          typeId: 'matrix',
          direction: 'oneway',
          color: RELATIONSHIP_CONFIG.matrix.color,
          labelFa: RELATIONSHIP_CONFIG.matrix.labelFa,
          note: 'مدیر ماتریسی',
          dash: RELATIONSHIP_CONFIG.matrix.dash
        });
      }

      // Explicit customRels list
      p.customRels?.forEach((rel) => {
        if (map.has(rel.toId)) {
          const targetNode = map.get(rel.toId)!;
          const config = RELATIONSHIP_CONFIG[rel.typeId] || RELATIONSHIP_CONFIG.other;
          const ports = computeEdgeConnectionPorts(sourceNode, targetNode);
          lines.push({
            id: `rel-${p.id}-${rel.toId}-${rel.typeId}`,
            fromId: p.id,
            toId: rel.toId,
            sx: ports.sx,
            sy: ports.sy,
            tx: ports.tx,
            ty: ports.ty,
            typeId: rel.typeId,
            direction: rel.direction || 'oneway',
            color: config.color,
            labelFa: config.labelFa,
            note: rel.note,
            dash: config.dash
          });
        }
      });
    });

    return lines;
  }, [positionedNodes, people]);

  // Auto-center canvas on load
  const fitView = useCallback(() => {
    if (!containerRef.current || positionedNodes.length === 0) return;
    const minX = Math.min(...positionedNodes.map((n) => n.x));
    const maxX = Math.max(...positionedNodes.map((n) => n.x + n.width));
    const minY = Math.min(...positionedNodes.map((n) => n.y));
    const maxY = Math.max(...positionedNodes.map((n) => n.y + n.height));

    const contentW = maxX - minX + 240;
    const contentH = maxY - minY + 240;
    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;

    const scale = Math.min(Math.max(0.35, Math.min(containerW / contentW, containerH / contentH)), 1.15);
    const offsetX = (containerW - (maxX + minX) * scale) / 2;
    const offsetY = Math.max(50, (containerH - (maxY + minY) * scale) / 2);

    setZoom(scale);
    setPan({ x: offsetX, y: offsetY });
  }, [positionedNodes]);

  useEffect(() => {
    fitView();
  }, [people.length]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-card') || (e.target as HTMLElement).closest('.rel-badge')) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(0.2, zoom * zoomFactor), 2.2);
    setZoom(newZoom);
  };

  // Drag and Drop re-parenting
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!canEdit) return;
    e.dataTransfer.setData('text/plain', id);
    setDraggedNodeId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!canEdit || !draggedNodeId || draggedNodeId === targetId) return;

    const validation = HierarchyValidator.validateMove(people, draggedNodeId, targetId);
    setDragOverNodeId(targetId);
    setDragOverValidation(validation);
    setDragOverValid(validation ? validation.canProceed : true);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!canEdit) return;
    const sourceId = e.dataTransfer.getData('text/plain') || draggedNodeId;
    if (sourceId && sourceId !== targetId) {
      const validation = HierarchyValidator.validateMove(people, sourceId, targetId);
      if (validation) {
        if (!validation.canProceed || validation.hasWarnings) {
          // Trigger the rich warning modal with explanation and choices!
          setPendingMoveValidation(validation);
        } else {
          // Safe move
          onMovePerson(sourceId, targetId);
        }
      }
    }
    setDraggedNodeId(null);
    setDragOverNodeId(null);
    setDragOverValidation(null);
  };

  const handleConfirmMoveFromModal = (syncDepartment: boolean) => {
    if (!pendingMoveValidation) return;
    onMovePerson(
      pendingMoveValidation.sourcePerson.id,
      pendingMoveValidation.targetPerson.id,
      syncDepartment
    );
    setPendingMoveValidation(null);
  };

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getNodeColor = (person: PersonNode) => {
    if (viewSettings.colorBy === 'level') {
      return LEVEL_COLORS[(person.level - 1) % LEVEL_COLORS.length];
    }
    return DEPT_COLORS[person.department] || DEPT_COLORS.default;
  };

  // Handle clicking on card: If drawing relation, connect them. Otherwise, OPEN 360 PROFILE!
  const handleCardClick = (personId: string) => {
    if (isDrawingRel) {
      if (!relSourceId) {
        setRelSourceId(personId);
      } else if (relSourceId === personId) {
        // Clicked same node -> cancel source
        setRelSourceId(null);
      } else {
        // Clicked target node -> open relationship setup modal
        setRelModalTarget({ sourceId: relSourceId, targetId: personId });
        setRelSourceId(null);
        setIsDrawingRel(false);
      }
      return;
    }

    // Default mode: Clicking anywhere on the card opens comprehensive 360-degree drawer!
    const target = people.find((p) => p.id === personId);
    if (target) {
      onEditPerson(target);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, person: PersonNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, person });
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetPhotoPerson) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onEditPerson({ ...targetPhotoPerson, photo: base64 });
      setTargetPhotoPerson(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleConfirmAddRelationship = () => {
    if (!relModalTarget || !onSaveRelationship) return;
    onSaveRelationship(relModalTarget.sourceId, relModalTarget.targetId, {
      toId: relModalTarget.targetId,
      typeId: newRelType,
      direction: newRelDir,
      strength: 3,
      confidence: 'confirmed',
      note: newRelNote
    });
    setRelModalTarget(null);
    setNewRelNote('');
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden select-none bg-slate-50 dark:bg-slate-950 cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.18) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* Zoom / Pan & Relationship Toolbar Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
        {/* Zoom controls */}
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-black transition-all"
          title="بزرگ‌نمایی (Zoom In)"
        >
          +
        </button>
        <span className="px-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 min-w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.2))}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-black transition-all"
          title="کوچک‌نمایی (Zoom Out)"
        >
          −
        </button>
        <button
          onClick={fitView}
          className="px-2.5 py-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-all"
        >
          {isRtl ? 'نمای کامل' : 'Fit'}
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Line Style Selector: Orthogonal vs Bezier */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
          <button
            onClick={() => setLineMode('orthogonal')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              lineMode === 'orthogonal'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={isRtl ? 'خطوط شکسته و قائمه سازمانی (Orthogonal)' : 'Orthogonal Lines'}
          >
            <CornerDownRight className="w-3 h-3" />
            <span className="hidden sm:inline">{isRtl ? 'شکسته' : 'Step'}</span>
          </button>
          <button
            onClick={() => setLineMode('bezier')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              lineMode === 'bezier'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={isRtl ? 'خطوط منحنی نرم سازمانی (Bezier)' : 'Smooth Curves'}
          >
            <Spline className="w-3 h-3" />
            <span className="hidden sm:inline">{isRtl ? 'منحنی' : 'Curve'}</span>
          </button>
        </div>

        {/* Line Thickness Toggle */}
        <button
          onClick={() => setLineThickness((t) => (t === 2.5 ? 4 : t === 4 ? 6 : 2.5))}
          className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300"
          title={isRtl ? 'تغییر ضخامت خطوط ارتباطی' : 'Toggle line thickness'}
        >
          {lineThickness}px
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Draw Relationship Toggle Button */}
        {canEdit && (
          <button
            onClick={() => {
              setIsDrawingRel(!isDrawingRel);
              setRelSourceId(null);
            }}
            className={`px-2.5 py-1 text-[11px] rounded-xl flex items-center gap-1.5 transition-all ${
              isDrawingRel
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse'
                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100'
            }`}
            title={isRtl ? 'ترسیم رابطه مستقیم، ماتریسی، وظیفه‌ای یا مشاوره‌ای بین دو فرد' : 'Draw Relationship'}
          >
            <Link className="w-3.5 h-3.5" />
            <span>{isDrawingRel ? (isRtl ? 'لغو' : 'Cancel') : (isRtl ? 'ترسیم رابطه' : 'Link')}</span>
          </button>
        )}

        {/* Toggle Relation Lines Visibility */}
        <button
          onClick={() => setShowRelationLines(!showRelationLines)}
          className={`px-2.5 py-1 text-[11px] rounded-xl flex items-center gap-1.5 transition-all ${
            showRelationLines
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'
          }`}
          title={isRtl ? 'نمایش یا مخفی‌سازی کلیه خطوط روابط بین‌واحدی' : 'Toggle Relation Lines'}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: showRelationLines ? '#7C3AED' : '#94A3B8' }} />
          <span>{isRtl ? `روابط (${customLinks.length})` : `(${customLinks.length})`}</span>
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Executive Presentation Mode */}
        <button
          onClick={() => {
            setIsPresentationMode(!isPresentationMode);
            setPresentationIndex(0);
          }}
          className={`px-2.5 py-1 text-[11px] rounded-xl flex items-center gap-1.5 transition-all ${
            isPresentationMode
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
          title={isRtl ? 'حالت ارائه سازمانی در جلسات هیئت‌مدیره (Presentation Mode)' : 'Executive Presentation Mode'}
        >
          <Presentation className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isRtl ? 'ارائه' : 'Present'}</span>
        </button>

        {/* MiniMap Toggle Button */}
        <button
          onClick={() => setShowMiniMap(!showMiniMap)}
          className={`p-1.5 text-[11px] rounded-xl transition-all ${
            showMiniMap
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          title={isRtl ? 'نقشه راداری ناوبری چارت (Mini-Map)' : 'Toggle Mini-Map'}
        >
          <MapIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Guide Banner when Drawing Relationship */}
      {isDrawingRel && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 bg-purple-900/90 text-white text-xs font-bold rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border border-purple-400/40 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>
            {!relSourceId
              ? (isRtl ? '۱. روی شخص مبدأ در چارت کلیک کنید' : '1. Click on the Source person')
              : (isRtl ? '۲. اکنون روی شخص مقصد کلیک کنید تا نوع رابطه را تعیین کنید' : '2. Now click on the Target person')}
          </span>
          <button
            onClick={() => {
              setIsDrawingRel(false);
              setRelSourceId(null);
            }}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Scalable Canvas */}
      <div
        className="absolute top-0 left-0 transition-transform duration-75 origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        {/* SVG CSS Styles for flowing lines */}
        <style>{`
          @keyframes pingonest-dash {
            to {
              stroke-dashoffset: -24;
            }
          }
          .animate-flowing-line {
            animation: pingonest-dash 1.2s linear infinite;
          }
        `}</style>

        {/* SVG Connectors Layer */}
        <svg
          className="absolute inset-0 overflow-visible pointer-events-none"
          style={{ width: '6000px', height: '6000px' }}
        >
          <defs>
            {/* Dynamic Arrow Markers for Each Relationship Type */}
            {Object.entries(RELATIONSHIP_CONFIG).map(([typeId, cfg]) => (
              <marker
                key={typeId}
                id={`arrow-${typeId}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill={cfg.color} />
              </marker>
            ))}
            <marker id="arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#64748B" />
            </marker>
          </defs>

          {/* 1. Direct Manager Hierarchy Lines (High contrast, crisp orthogonal/bezier) */}
          {links.map((link) => {
            const isHovered = hoveredNodeId && (link.sourceId === hoveredNodeId || link.targetId === hoveredNodeId);
            const midY = link.sy + (link.ty - link.sy) / 2;
            const pathData = lineMode === 'orthogonal'
              ? `M ${link.sx} ${link.sy} V ${midY} H ${link.tx} V ${link.ty}`
              : `M ${link.sx} ${link.sy} C ${link.sx} ${midY}, ${link.tx} ${midY}, ${link.tx} ${link.ty}`;

            return (
              <g key={link.id} className="transition-all">
                {/* Background high-contrast halo */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={viewSettings.theme === 'dark' ? '#090D16' : '#FFFFFF'}
                  strokeWidth={lineThickness + 3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-90"
                />
                {/* Main hierarchy stroke */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHovered ? '#2563EB' : (viewSettings.theme === 'dark' ? '#94A3B8' : '#334155')}
                  strokeWidth={isHovered ? lineThickness + 1.5 : lineThickness}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-colors duration-200"
                />
                {/* Parent bottom anchor joint pin */}
                <circle
                  cx={link.sx}
                  cy={link.sy}
                  r={isHovered ? 5 : 4}
                  fill={isHovered ? '#2563EB' : '#334155'}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  className="transition-all"
                />
                {/* Child top anchor joint pin */}
                <circle
                  cx={link.tx}
                  cy={link.ty}
                  r={isHovered ? 5 : 4}
                  fill={isHovered ? '#2563EB' : '#334155'}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  className="transition-all"
                />
              </g>
            );
          })}

          {/* 2. Custom & Matrix & Functional Relationships with Edge-to-Edge Curved Arcs */}
          {showRelationLines && customLinks.map((link) => {
            const isHovered = hoveredNodeId && (link.fromId === hoveredNodeId || link.toId === hoveredNodeId);
            const dx = link.tx - link.sx;
            const dy = link.ty - link.sy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const curveOffset = Math.min(Math.max(60, dist * 0.28), 160);
            const midX = (link.sx + link.tx) / 2 - (dy / dist) * curveOffset;
            const midY = (link.sy + link.ty) / 2 + (dx / dist) * curveOffset;
            const pathData = `M ${link.sx} ${link.sy} Q ${midX} ${midY}, ${link.tx} ${link.ty}`;

            return (
              <g key={link.id} className="group pointer-events-auto">
                {/* Glow/Hover Path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={link.color}
                  strokeWidth={10}
                  className="opacity-0 group-hover:opacity-35 transition-opacity cursor-pointer"
                />
                {/* Connection Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={link.color}
                  strokeWidth={isHovered ? 4.5 : 3.2}
                  strokeDasharray={link.dash}
                  markerEnd={`url(#arrow-${link.typeId})`}
                  className="animate-flowing-line opacity-95 group-hover:opacity-100 transition-all"
                />
                {/* Anchor connection pins at card edges */}
                <circle cx={link.sx} cy={link.sy} r={4} fill={link.color} stroke="#FFFFFF" strokeWidth={1.5} />
                <circle cx={link.tx} cy={link.ty} r={4} fill={link.color} stroke="#FFFFFF" strokeWidth={1.5} />
              </g>
            );
          })}
        </svg>

        {/* Midpoint Badges for Custom Relationships */}
        {showRelationLines && customLinks.map((link) => {
          const dx = link.tx - link.sx;
          const dy = link.ty - link.sy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const curveOffset = Math.min(Math.max(60, dist * 0.28), 160);
          const badgeX = (link.sx + link.tx) / 2 - (dy / dist) * (curveOffset * 0.5);
          const badgeY = (link.sy + link.ty) / 2 + (dx / dist) * (curveOffset * 0.5);

          return (
            <div
              key={`badge-${link.id}`}
              className="rel-badge absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full shadow-md text-[10px] font-black border transition-transform hover:scale-110 cursor-pointer select-none bg-white dark:bg-slate-900"
              style={{
                left: `${badgeX}px`,
                top: `${badgeY}px`,
                color: link.color,
                borderColor: `${link.color}60`
              }}
              title={`${link.labelFa} ${link.note ? `— ${link.note}` : ''}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: link.color }} />
              <span>{link.labelFa}</span>
              <span className="opacity-70 font-mono text-[9px]">{link.direction === 'twoway' ? '⇄' : '→'}</span>
              {canEdit && onDeleteRelationship && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`حذف رابطه ${link.labelFa}؟`)) {
                      onDeleteRelationship(link.fromId, link.toId);
                    }
                  }}
                  className="ml-1 p-0.5 text-slate-400 hover:text-rose-600 rounded"
                  title="حذف رابطه"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* Nodes Layer */}
        {positionedNodes.map((node) => {
          const person = node.data;
          const color = getNodeColor(person);
          const hasChildren = people.some((p) => p.parentId === person.id);
          const isCollapsed = collapsedIds.has(person.id);

          const matchesSearch =
            searchQuery.trim() !== '' &&
            (person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              person.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              person.department.toLowerCase().includes(searchQuery.toLowerCase()));

          const matchesProject =
            highlightProjectId &&
            person.projectRoles?.some((pr) => pr.project === highlightProjectId);

          const isOverThis = dragOverNodeId === person.id;
          const isBeingDragged = draggedNodeId === person.id;
          const isSelectedAsSource = relSourceId === person.id;

          return (
            <div
              key={person.id}
              onClick={() => handleCardClick(person.id)}
              onContextMenu={(e) => handleContextMenu(e, person)}
              onMouseEnter={() => setHoveredNodeId(person.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`node-card group absolute rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-200 shadow-sm hover:shadow-xl cursor-pointer ${
                isBeingDragged ? 'opacity-40 scale-95' : 'opacity-100'
              } ${
                isSelectedAsSource ? 'ring-4 ring-purple-600 border-purple-600 shadow-2xl scale-105' : ''
              } ${
                isDrawingRel && !isSelectedAsSource ? 'hover:ring-4 hover:ring-purple-400' : ''
              } ${
                isOverThis
                  ? dragOverValidation && !dragOverValidation.canProceed
                    ? 'ring-4 ring-rose-500 border-rose-500 bg-rose-50/60 dark:bg-rose-950/40'
                    : dragOverValidation && dragOverValidation.hasWarnings
                    ? 'ring-4 ring-amber-500 border-amber-500 bg-amber-50/60 dark:bg-amber-950/40'
                    : 'ring-4 ring-emerald-500 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40'
                  : ''
              } ${
                matchesSearch || matchesProject
                  ? 'ring-4 ring-amber-400 border-amber-400 scale-[1.03] shadow-amber-500/20 shadow-lg'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                height: `${node.height}px`
              }}
              onDragOver={(e) => handleDragOver(e, person.id)}
              onDrop={(e) => handleDrop(e, person.id)}
            >
              {/* Dynamic Drag-Over Status Badge */}
              {isOverThis && (
                <div
                  className={`absolute -top-7 left-1/2 -translate-x-1/2 z-40 px-3 py-1 rounded-full text-[10px] font-black shadow-xl flex items-center gap-1.5 whitespace-nowrap animate-bounce border ${
                    dragOverValidation && !dragOverValidation.canProceed
                      ? 'bg-rose-600 border-rose-400 text-white shadow-rose-600/40'
                      : dragOverValidation && dragOverValidation.hasWarnings
                      ? 'bg-amber-500 border-amber-300 text-white shadow-amber-500/40'
                      : 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-600/40'
                  }`}
                >
                  {dragOverValidation && !dragOverValidation.canProceed ? (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>{isRtl ? 'مسدود: ایجاد حلقه باطل' : 'Blocked: Cyclic Loop'}</span>
                    </>
                  ) : dragOverValidation && dragOverValidation.hasWarnings ? (
                    <>
                      <ShieldAlert className="w-3 h-3" />
                      <span>{isRtl ? '⚠️ اخطار جابجایی رده/دپارتمان' : 'Warning: Anomaly'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>{isRtl ? 'انتساب به عنوان مدیر مستقیم' : 'Valid New Manager'}</span>
                    </>
                  )}
                </div>
              )}
              {/* Header Accent Bar with Drag Handle */}
              <div
                draggable={canEdit}
                onDragStart={(e) => handleDragStart(e, person.id)}
                className={`h-3 w-full rounded-t-xl flex items-center justify-center ${
                  canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                }`}
                style={{ backgroundColor: color }}
                title={canEdit ? (isRtl ? 'برای جابه‌جایی در چارت، بکشید و روی مدیر جدید رها کنید' : 'Drag to reassign manager') : ''}
              >
                <div className="w-8 h-1 bg-white/40 rounded-full group-hover:bg-white/80 transition-colors" />
              </div>

              {/* Quick Action Overlay on Card Hover */}
              {canEdit && (
                <div className="absolute top-1.5 left-2 z-10 flex items-center gap-0.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-lg p-0.5 shadow border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditPerson(person);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
                    title={isRtl ? 'مشاهده و ویرایش شناسنامه ۳۶۰ درجه' : 'Profile & Edit'}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetPhotoPerson(person);
                      photoInputRef.current?.click();
                    }}
                    className="p-1 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                    title={isRtl ? 'بارگذاری تصویر پرسنلی' : 'Upload photo'}
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDrawingRel(true);
                      setRelSourceId(person.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60"
                    title={isRtl ? 'ترسیم رابطه با باکس دیگر' : 'Connect relation'}
                  >
                    <Link className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSubordinate(person);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                    title={isRtl ? 'افزودن زیرمجموعه مستقیم' : 'Add subordinate'}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Card Body */}
              <div className="p-3.5 flex flex-col justify-between h-[calc(100%-12px)]">
                <div className="flex items-start gap-3">
                  {/* Avatar / Photo or Male/Female Professional Character with Photo Upload Overlay */}
                  {viewSettings.showPhoto && (
                    <div
                      className="relative group/avatar flex-shrink-0 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetPhotoPerson(person);
                        photoInputRef.current?.click();
                      }}
                      title={isRtl ? 'کلیک برای بارگذاری یا تغییر عکس پرسنلی' : 'Click to change photo'}
                    >
                      <PersonAvatar
                        photo={person.photo}
                        gender={person.gender}
                        name={person.name}
                        color={color}
                        size={52}
                        status={person.status}
                      />
                      {canEdit && (
                        <div className="absolute inset-0 rounded-full bg-slate-900/60 text-white opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity shadow-md">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Name and Title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className="font-black text-sm text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                        onClick={() => onEditPerson(person)}
                        title={person.name}
                      >
                        {person.name}
                      </h4>
                      {viewSettings.showId && (
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                          #{person.employeeCode || person.id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5" title={person.title}>
                      {person.title || '—'}
                    </p>

                    {/* Department and Level Badges */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {viewSettings.showDept && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-extrabold truncate max-w-[130px]"
                          style={{
                            backgroundColor: `${color}18`,
                            color: color
                          }}
                        >
                          {person.department}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {isRtl ? `سطح ${person.level}` : `L${person.level}`}
                      </span>

                      {/* Contract Type / Job Grade Badge */}
                      {person.contractType && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          {person.contractType === 'official' ? 'رسمی' : person.contractType === 'contractual' ? 'پیمانی' : 'پروژه‌ای'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  {/* Salary & Subordinates Count */}
                  <div className="flex items-center gap-2">
                    {viewSettings.showSalary && (
                      <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        {userRole === 'employee_viewer'
                          ? '***'
                          : person.salary
                          ? `${(person.salary / 1000000).toLocaleString('fa-IR')} م.ت`
                          : '—'}
                      </span>
                    )}

                    {viewSettings.showSubCount && person.subCount > 0 && (
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-500" />
                        {person.subCount} نفر
                      </span>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddSubordinate(person);
                          }}
                          className="p-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-400 hover:text-emerald-600 transition-colors"
                          title={isRtl ? 'افزودن زیرمجموعه مستقیم' : 'Add subordinate'}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToProject(person);
                          }}
                          className="p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-400 hover:text-indigo-600 transition-colors"
                          title={isRtl ? 'تخصیص به پروژه ماتریسی' : 'Assign to project'}
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPerson(person);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                      title={isRtl ? 'مشاهده و ویرایش مشخصات پرسنلی' : 'Edit profile'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Branch Collapse/Expand Toggle Button */}
              {hasChildren && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(person.id);
                  }}
                  className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-500 shadow-md flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform z-10 font-black text-xs"
                  title={isCollapsed ? (isRtl ? 'باز کردن شاخه' : 'Expand') : (isRtl ? 'بستن شاخه' : 'Collapse')}
                >
                  {isCollapsed ? '+' : '−'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Relationship Setup Dialog (when user clicks Person A then Person B) */}
      {relModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-purple-600">
                <Link className="w-5 h-5" />
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  {isRtl ? 'ایجاد رابطه سازمانی جدید' : 'Create New Relationship'}
                </h3>
              </div>
              <button
                onClick={() => setRelModalTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  {people.find((p) => p.id === relModalTarget.sourceId)?.name}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {people.find((p) => p.id === relModalTarget.targetId)?.name}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'نوع رابطه' : 'Relationship Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(RELATIONSHIP_CONFIG).map(([typeId, cfg]) => (
                    <button
                      key={typeId}
                      type="button"
                      onClick={() => setNewRelType(typeId as CustomRelationship['typeId'])}
                      className={`p-2.5 rounded-xl border text-right font-bold transition-all flex items-center gap-2 ${
                        newRelType === typeId
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                      <span>{cfg.labelFa}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'جهت رابطه' : 'Direction'}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRelDir('oneway')}
                    className={`flex-1 py-2 rounded-xl text-center font-bold border transition-all ${
                      newRelDir === 'oneway'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    {isRtl ? 'یک‌طرفه (از مبدأ به مقصد)' : 'One-way'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRelDir('twoway')}
                    className={`flex-1 py-2 rounded-xl text-center font-bold border transition-all ${
                      newRelDir === 'twoway'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    {isRtl ? 'دوطرفه (همکاری متقابل)' : 'Two-way'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'توضیحات و یادداشت (اختیاری)' : 'Notes (optional)'}
                </label>
                <input
                  type="text"
                  value={newRelNote}
                  onChange={(e) => setNewRelNote(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: هماهنگی هفتگی فنی، مدیر ماتریسی اسپرینت' : 'e.g. Weekly sprint sync'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRelModalTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmAddRelationship}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/30"
              >
                {isRtl ? 'ثبت و اتصال رابطه' : 'Save Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Relations Legend & Summary Widget on Canvas */}
      {showRelationLines && customLinks.length > 0 && (
        <div className="absolute bottom-4 right-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 max-w-xs text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-black text-slate-800 dark:text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span>{isRtl ? `روابط سازمانی (${customLinks.length} خط فعال)` : `Active Relations (${customLinks.length})`}</span>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setIsDrawingRel(true);
                  setRelSourceId(null);
                }}
                className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px] hover:bg-purple-100"
              >
                {isRtl ? '+ ترسیم رابطه' : '+ Add'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {Object.entries(RELATIONSHIP_CONFIG).slice(0, 6).map(([typeId, cfg]) => {
              const count = customLinks.filter((l) => l.typeId === typeId).length;
              if (count === 0) return null;
              return (
                <div key={typeId} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                  <span className="font-semibold truncate">{cfg.labelFa}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden Photo File Input for instant upload */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1.5 w-56 text-xs text-right animate-in fade-in-50 zoom-in-95"
          style={{
            left: `${Math.min(contextMenu.x, window.innerWidth - 240)}px`,
            top: `${Math.min(contextMenu.y, window.innerHeight - 300)}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-black text-slate-900 dark:text-slate-100 truncate">{contextMenu.person.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">#{contextMenu.person.employeeCode || contextMenu.person.id}</span>
          </div>
          <div className="py-1 space-y-0.5">
            <button
              onClick={() => {
                onEditPerson(contextMenu.person);
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 flex items-center gap-2 font-bold transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isRtl ? 'شناسنامه و ویرایش جامع' : 'Edit profile'}</span>
            </button>
            <button
              onClick={() => {
                setTargetPhotoPerson(contextMenu.person);
                photoInputRef.current?.click();
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 flex items-center gap-2 font-bold transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isRtl ? 'بارگذاری / تغییر عکس' : 'Upload photo'}</span>
            </button>
            <button
              onClick={() => {
                setIsDrawingRel(true);
                setRelSourceId(contextMenu.person.id);
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-600 flex items-center gap-2 font-bold transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
              <span>{isRtl ? 'ترسیم رابطه با باکس دیگر' : 'Add relation'}</span>
            </button>
            <button
              onClick={() => {
                onAddSubordinate(contextMenu.person);
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 flex items-center gap-2 font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRtl ? 'افزودن زیرمجموعه مستقیم' : 'Add subordinate'}</span>
            </button>
            <button
              onClick={() => {
                onAddToProject(contextMenu.person);
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/60 hover:text-amber-600 flex items-center gap-2 font-bold transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{isRtl ? 'افزودن به پروژه ماتریسی' : 'Add to project'}</span>
            </button>
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            <button
              onClick={() => {
                if (confirm(isRtl ? `آیا از حذف «${contextMenu.person.name}» از چارت اطمینان دارید؟` : 'Delete person?')) {
                  onDeletePerson(contextMenu.person.id);
                }
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center gap-2 font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isRtl ? 'حذف از چارت' : 'Delete'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Executive Presentation Controller Dock */}
      {isPresentationMode && positionedNodes.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/90 text-white backdrop-blur-xl shadow-2xl border border-slate-700 text-xs font-bold animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 border-e border-slate-700 pe-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] text-slate-300 font-mono">
              {presentationIndex + 1} / {positionedNodes.length}
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-[140px] max-w-[240px]">
            <span className="truncate text-slate-100 font-bold">
              {positionedNodes[presentationIndex % positionedNodes.length]?.data.name}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/30 text-indigo-300 truncate">
              {positionedNodes[presentationIndex % positionedNodes.length]?.data.title}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPresentationIndex((i) => (i - 1 + positionedNodes.length) % positionedNodes.length)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="قبلی (Arrow Up / Left)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPresentationIndex((i) => (i + 1) % positionedNodes.length)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="بعدی (Arrow Down / Right)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsPresentationMode(false)}
            className="ms-2 px-2.5 py-1 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-[11px] text-white flex items-center gap-1 transition-colors"
            title="خروج از حالت ارائه (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>{isRtl ? 'خروج' : 'Exit'}</span>
          </button>
        </div>
      )}

      {/* Floating Interactive Mini-Map */}
      {showMiniMap && positionedNodes.length > 0 && (
        <div className="absolute bottom-6 end-6 z-30 w-56 h-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col animate-in fade-in zoom-in-95 select-none">
          <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <MapIcon className="w-3 h-3 text-indigo-500" />
              <span>{isRtl ? 'نقشه ناوبری (Mini-Map)' : 'Mini-Map'}</span>
            </span>
            <button
              onClick={() => setShowMiniMap(false)}
              className="p-0.5 hover:text-rose-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 relative mt-1 bg-slate-100/60 dark:bg-slate-950/60 rounded-xl overflow-hidden cursor-crosshair">
            <svg
              className="w-full h-full"
              viewBox={`0 0 200 120`}
              preserveAspectRatio="xMidYMid meet"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                const targetWorldX = treeBounds.minX + (clickX / rect.width) * treeBounds.width;
                const targetWorldY = treeBounds.minY + (clickY / rect.height) * treeBounds.height;
                if (!containerRef.current) return;
                const containerW = containerRef.current.clientWidth;
                const containerH = containerRef.current.clientHeight;
                setPan({
                  x: containerW / 2 - targetWorldX * zoom,
                  y: containerH / 2 - targetWorldY * zoom
                });
              }}
            >
              {positionedNodes.map((n) => {
                const nx = ((n.x - treeBounds.minX) / treeBounds.width) * 190 + 5;
                const ny = ((n.y - treeBounds.minY) / treeBounds.height) * 110 + 5;
                return (
                  <rect
                    key={n.data.id}
                    x={nx}
                    y={ny}
                    width={10}
                    height={5}
                    rx={1.5}
                    fill={getNodeColor(n.data)}
                    opacity={0.85}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Movement & Illogical Position Warning Modal */}
      <MoveWarningModal
        isOpen={!!pendingMoveValidation}
        validationResult={pendingMoveValidation}
        onClose={() => setPendingMoveValidation(null)}
        onConfirmMove={handleConfirmMoveFromModal}
        isRtl={isRtl}
      />
    </div>
  );
}

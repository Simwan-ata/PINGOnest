/**
 * Organizational Intelligence, Hierarchy Engine, and Analytics Service
 */
import {
  PersonNode,
  BpmnProcess,
  BottleneckAlert,
  OrgDiffRow,
  OrgDiffResult,
  OrgDiffChangeType,
  NetworkCentrality
} from '../types/pingonest';

export class HierarchyEngine {
  /**
   * Detects if moving movingId under newParentId would create a cyclical reporting loop
   */
  static wouldCreateCycle(people: PersonNode[], movingId: string, newParentId: string): boolean {
    if (!newParentId) return false;
    if (movingId === newParentId) return true;

    const map = new Map(people.map((p) => [p.id, p]));
    const visited = new Set<string>();
    let curr = map.get(newParentId);

    while (curr) {
      if (curr.id === movingId) return true;
      if (visited.has(curr.id)) return false;
      visited.add(curr.id);
      curr = curr.parentId ? map.get(curr.parentId) : undefined;
    }

    return false;
  }

  /**
   * Recalculates levels, subCounts, and removes broken cycles
   */
  static recompute(people: PersonNode[]): PersonNode[] {
    const list = people.map((p) => ({ ...p }));
    const map = new Map(list.map((p) => [p.id, p]));

    // Break any accidental cycles
    list.forEach((p) => {
      if (!p.parentId || !map.has(p.parentId)) {
        p.parentId = '';
        return;
      }
      const seen = new Set<string>([p.id]);
      let curr = p;
      while (curr && curr.parentId && map.has(curr.parentId)) {
        if (seen.has(curr.parentId)) {
          curr.parentId = '';
          break;
        }
        seen.add(curr.parentId);
        curr = map.get(curr.parentId)!;
      }
    });

    // Compute Levels
    const levelMemo = new Map<string, number>();
    const calcLevel = (id: string, stk: Set<string>): number => {
      if (levelMemo.has(id)) return levelMemo.get(id)!;
      if (stk.has(id)) return 1;
      stk.add(id);

      const node = map.get(id);
      let lvl = 1;
      if (node && node.parentId && map.has(node.parentId)) {
        lvl = calcLevel(node.parentId, stk) + 1;
      }

      stk.delete(id);
      levelMemo.set(id, lvl);
      return lvl;
    };

    list.forEach((p) => {
      p.level = calcLevel(p.id, new Set());
    });

    // Compute Subordinate Counts (recursive DFS)
    const childrenMap = new Map<string, PersonNode[]>();
    list.forEach((p) => {
      const arr = childrenMap.get(p.parentId) || [];
      arr.push(p);
      childrenMap.set(p.parentId, arr);
    });

    const subMemo = new Map<string, number>();
    const calcSub = (id: string): number => {
      if (subMemo.has(id)) return subMemo.get(id)!;
      const kids = childrenMap.get(id) || [];
      let total = 0;
      for (const k of kids) {
        total += 1 + calcSub(k.id);
      }
      subMemo.set(id, total);
      return total;
    };

    list.forEach((p) => {
      p.subCount = calcSub(p.id);
    });

    return list;
  }

  /**
   * Calculates organizational graph distance (steps up and down the tree)
   */
  static getOrgDistance(idA: string, idB: string, people: PersonNode[]): number {
    if (!idA || !idB) return -1;
    if (idA === idB) return 0;

    const map = new Map(people.map((p) => [p.id, p]));

    const getChain = (id: string): string[] => {
      const chain: string[] = [];
      let curr = map.get(id);
      while (curr) {
        chain.push(curr.id);
        curr = curr.parentId ? map.get(curr.parentId) : undefined;
      }
      return chain;
    };

    const chainA = getChain(idA);
    const chainB = getChain(idB);

    // Find Lowest Common Ancestor (LCA)
    for (let i = 0; i < chainA.length; i++) {
      const ancestor = chainA[i];
      const idxB = chainB.indexOf(ancestor);
      if (idxB !== -1) {
        return i + idxB;
      }
    }

    return 99; // Disconnected trees
  }
}

export interface OrgKpis {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  managerCount: number;
  managerRatio: number; // e.g. 25%
  departmentCount: number;
  maxLevel: number;
  avgSpanOfControl: number;
  medianSpanOfControl: number;
  maxSpanOfControl: number;
  totalPayroll: number;
  avgSalary: number;
  spofRisks: { person: PersonNode; cascadePercentage: number; directReports: number }[];
  singleReportChains: { manager: PersonNode; subordinate: PersonNode }[];
  deptStats: { dept: string; count: number; managerCount: number; avgSpan: number; totalSalary: number }[];
}

export function computeOrgKpis(people: PersonNode[]): OrgKpis {
  const totalCount = people.length;
  if (totalCount === 0) {
    return {
      totalCount: 0,
      activeCount: 0,
      inactiveCount: 0,
      managerCount: 0,
      managerRatio: 0,
      departmentCount: 0,
      maxLevel: 0,
      avgSpanOfControl: 0,
      medianSpanOfControl: 0,
      maxSpanOfControl: 0,
      totalPayroll: 0,
      avgSalary: 0,
      spofRisks: [],
      singleReportChains: [],
      deptStats: []
    };
  }

  const activeCount = people.filter((p) => p.status === 'فعال' || p.status === 'Active').length;
  const inactiveCount = totalCount - activeCount;

  // Direct reports map
  const directMap = new Map<string, PersonNode[]>();
  people.forEach((p) => {
    if (p.parentId) {
      const arr = directMap.get(p.parentId) || [];
      arr.push(p);
      directMap.set(p.parentId, arr);
    }
  });

  const managers = people.filter((p) => (directMap.get(p.id) || []).length > 0);
  const managerCount = managers.length;
  const managerRatio = Math.round((managerCount / totalCount) * 100);

  const spans = managers.map((m) => (directMap.get(m.id) || []).length).sort((a, b) => a - b);
  const avgSpanOfControl = spans.length ? parseFloat((spans.reduce((a, b) => a + b, 0) / spans.length).toFixed(1)) : 0;
  const medianSpanOfControl = spans.length ? spans[Math.floor(spans.length / 2)] : 0;
  const maxSpanOfControl = spans.length ? spans[spans.length - 1] : 0;

  const maxLevel = Math.max(...people.map((p) => p.level || 1), 1);

  // Salaries
  const salaries = people.map((p) => p.salary || 0).filter((s) => s > 0);
  const totalPayroll = salaries.reduce((a, b) => a + b, 0);
  const avgSalary = salaries.length ? Math.round(totalPayroll / salaries.length) : 0;

  // Single Point of Failure (SPOF) - departure cascades to > 20% of org
  const spofRisks = people
    .filter((p) => p.subCount > 0)
    .map((p) => ({
      person: p,
      cascadePercentage: Math.round((p.subCount / totalCount) * 100),
      directReports: (directMap.get(p.id) || []).length
    }))
    .filter((x) => x.cascadePercentage >= 20)
    .sort((a, b) => b.cascadePercentage - a.cascadePercentage);

  // Single-report chains (manager has exactly 1 direct subordinate)
  const singleReportChains: { manager: PersonNode; subordinate: PersonNode }[] = [];
  managers.forEach((m) => {
    const directs = directMap.get(m.id) || [];
    if (directs.length === 1) {
      singleReportChains.push({ manager: m, subordinate: directs[0] });
    }
  });

  // Department Stats
  const deptMap = new Map<string, PersonNode[]>();
  people.forEach((p) => {
    const arr = deptMap.get(p.department) || [];
    arr.push(p);
    deptMap.set(p.department, arr);
  });

  const deptStats = Array.from(deptMap.entries())
    .map(([dept, members]) => {
      const deptManagers = members.filter((m) => (directMap.get(m.id) || []).length > 0);
      const deptSpans = deptManagers.map((m) => (directMap.get(m.id) || []).length);
      const avgSpan = deptSpans.length ? parseFloat((deptSpans.reduce((a, b) => a + b, 0) / deptSpans.length).toFixed(1)) : 0;
      const deptSalary = members.reduce((acc, curr) => acc + (curr.salary || 0), 0);

      return {
        dept,
        count: members.length,
        managerCount: deptManagers.length,
        avgSpan,
        totalSalary: deptSalary
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    totalCount,
    activeCount,
    inactiveCount,
    managerCount,
    managerRatio,
    departmentCount: deptMap.size,
    maxLevel,
    avgSpanOfControl,
    medianSpanOfControl,
    maxSpanOfControl,
    totalPayroll,
    avgSalary,
    spofRisks,
    singleReportChains,
    deptStats
  };
}

/**
 * Intelligent BPMN Bottleneck & Separation of Duties (SoD) Conflict Analyzer
 */
export function analyzeBpmnBottlenecks(process: BpmnProcess, people: PersonNode[]): BottleneckAlert[] {
  const alerts: BottleneckAlert[] = [];
  const map = new Map(people.map((p) => [p.id, p]));

  process.edges.forEach((edge) => {
    const fromNode = process.nodes.find((n) => n.id === edge.from);
    const toNode = process.nodes.find((n) => n.id === edge.to);
    if (!fromNode || !toNode) return;

    const fromPersonId = fromNode.raci?.responsibleId || fromNode.personId;
    const toPersonId = toNode.raci?.responsibleId || toNode.personId;

    if (!fromPersonId || !toPersonId) return;

    const fromPerson = map.get(fromPersonId);
    const toPerson = map.get(toPersonId);

    // 1. Separation of Duties (SoD) Conflict
    // If the same person creates/submits a task and also approves it in the downstream task
    const isApproverInNext = toNode.raci?.accountableId === fromPersonId;
    const isSamePerson = fromPersonId === toPersonId;

    if (isSamePerson && toNode.subtype === 'user' && fromNode.subtype === 'user') {
      alerts.push({
        fromNodeId: fromNode.id,
        toNodeId: toNode.id,
        fromPerson,
        toPerson,
        fromLabel: fromNode.label,
        toLabel: toNode.label,
        orgDistance: 0,
        severity: 'critical',
        reason: `تعارض تفکیک وظایف (SoD): ${fromPerson?.name || 'این فرد'} هم ایجادکننده و هم تأییدکننده این دو گام پیاپی است.`,
        soDConflict: true
      });
    }

    // 2. High Organizational Distance Handoff Delay
    const dist = HierarchyEngine.getOrgDistance(fromPersonId, toPersonId, people);
    if (dist >= 4) {
      alerts.push({
        fromNodeId: fromNode.id,
        toNodeId: toNode.id,
        fromPerson,
        toPerson,
        fromLabel: fromNode.label,
        toLabel: toNode.label,
        orgDistance: dist,
        severity: dist >= 6 ? 'critical' : 'high',
        reason: `گلوگاه سازمانی: فاصله چارت بین مجریان این دو فعالیت متصل (${dist} لایه) بالاست و احتمال تأخیر در تبادل داده وجود دارد.`,
        soDConflict: false
      });
    }
  });

  return alerts.sort((a, b) => {
    const sevOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return sevOrder[b.severity] - sevOrder[a.severity];
  });
}


/* ==================== ORGDIFF ENGINE (from PingoNest v14) ==================== */

const FIELD_LABELS_FA: Record<string, string> = {
  name: 'نام',
  title: 'عنوان شغلی',
  department: 'دپارتمان',
  status: 'وضعیت',
  salary: 'حقوق و دستمزد',
  customRels: 'روابط سازمانی',
  projectRoles: 'پروژه‌ها'
};

export class OrgDiffEngine {
  static translateField(f: string): string {
    return FIELD_LABELS_FA[f] || f;
  }

  static runComparison(nodesA: PersonNode[], nodesB: PersonNode[]): OrgDiffResult {
    const mapA = new Map<string, PersonNode>((nodesA || []).map((n) => [String(n.id), n]));
    const mapB = new Map<string, PersonNode>((nodesB || []).map((n) => [String(n.id), n]));

    const idsA = new Set(mapA.keys());
    const idsB = new Set(mapB.keys());

    const addedIds = [...idsB].filter((id) => !idsA.has(id));
    const removedIds = [...idsA].filter((id) => !idsB.has(id));
    const commonIds = [...idsA].filter((id) => idsB.has(id));

    const totalA = nodesA.length;
    const totalB = nodesB.length;

    const rows: OrgDiffRow[] = [];

    // Added
    addedIds.forEach((id) => {
      const nb = mapB.get(id)!;
      const parent = nb.parentId ? mapB.get(String(nb.parentId)) : null;
      const risk = 10;
      const impact = `به سازمان اضافه شد${parent ? `؛ گزارش‌دهی به «${parent.name}»` : ''}`;
      rows.push({
        id,
        name: nb.name,
        department: nb.department || '',
        titleA: '',
        titleB: nb.title || '',
        status: nb.status || '',
        changeType: 'added',
        changedFields: [],
        risk,
        impact,
        before: null,
        after: nb
      });
    });

    // Removed
    removedIds.forEach((id) => {
      const na = mapA.get(id)!;
      const subRatio = totalA > 0 ? (na.subCount || 0) / totalA : 0;
      const risk = Math.min(100, Math.round(40 + subRatio * 60));
      const impact = `از سازمان حذف شد${na.subCount ? `؛ ${na.subCount} نفر زیرمجموعه به بالادست منتقل شدند` : ''}`;
      rows.push({
        id,
        name: na.name,
        department: na.department || '',
        titleA: na.title || '',
        titleB: '',
        status: na.status || '',
        changeType: 'removed',
        changedFields: [],
        risk,
        impact,
        before: na,
        after: null
      });
    });

    // Common (Modified / Moved / Promoted / Demoted)
    commonIds.forEach((id) => {
      const na = mapA.get(id)!;
      const nb = mapB.get(id)!;

      const diffFields: string[] = [];
      if (na.name !== nb.name) diffFields.push('name');
      if (na.title !== nb.title) diffFields.push('title');
      if (na.department !== nb.department) diffFields.push('department');
      if (na.status !== nb.status) diffFields.push('status');
      if (na.salary !== nb.salary) diffFields.push('salary');

      const levelA = na.level || 1;
      const levelB = nb.level || 1;
      const deptChanged = (na.department || '') !== (nb.department || '');
      const parentChanged = (na.parentId || '') !== (nb.parentId || '');

      let changeType: OrgDiffChangeType = 'unchanged';
      if (levelB < levelA) changeType = 'promoted';
      else if (levelB > levelA) changeType = 'demoted';
      else if (deptChanged || parentChanged) changeType = 'moved';
      else if (diffFields.length > 0) changeType = 'changed';

      if (changeType === 'unchanged') return;

      const subRatioB = totalB > 0 ? (nb.subCount || 0) / totalB : 0;
      let risk = 5;
      let impact = 'اطلاعات پرسنلی به‌روزرسانی شد';

      if (changeType === 'promoted') {
        risk = Math.min(100, Math.round(20 + subRatioB * 50));
        impact = `ارتقا یافت؛ سطح سازمانی از ${levelA} به ${levelB} رسید`;
      } else if (changeType === 'demoted') {
        risk = Math.min(100, Math.round(30 + subRatioB * 50));
        impact = `تنزل یافت؛ سطح سازمانی از ${levelA} به ${levelB} تغییر کرد`;
      } else if (changeType === 'moved') {
        risk = Math.min(100, Math.round(15 + subRatioB * 40 + (deptChanged ? 15 : 0)));
        impact = deptChanged
          ? `دپارتمان از «${na.department || '—'}» به «${nb.department || '—'}» تغییر یافت`
          : 'زیرمجموعه مدیر جدید شد';
      } else if (changeType === 'changed') {
        risk = 10;
        impact = `تغییر در ${diffFields.map((f) => OrgDiffEngine.translateField(f)).join('، ')}`;
      }

      rows.push({
        id,
        name: nb.name,
        department: nb.department || '',
        titleA: na.title || '',
        titleB: nb.title || '',
        status: nb.status || '',
        changeType,
        changedFields: diffFields,
        risk,
        impact,
        before: na,
        after: nb
      });
    });

    const highRiskCount = rows.filter((r) => r.risk >= 60).length;
    const healthScore = rows.length > 0 ? Math.max(0, Math.round(100 - (highRiskCount / rows.length) * 100)) : 100;

    return {
      rows,
      meta: {
        totalA,
        totalB,
        addedCount: rows.filter((r) => r.changeType === 'added').length,
        removedCount: rows.filter((r) => r.changeType === 'removed').length,
        movedCount: rows.filter((r) => r.changeType === 'moved').length,
        promotedCount: rows.filter((r) => r.changeType === 'promoted').length,
        demotedCount: rows.filter((r) => r.changeType === 'demoted').length,
        changedCount: rows.filter((r) => r.changeType === 'changed').length,
        highRiskCount,
        healthScore,
        dupA: [],
        dupB: [],
        orphansA: [],
        orphansB: []
      }
    };
  }
}

/* ==================== NETWORK CENTRALITY (Brandes Betweenness Algorithm) ==================== */

export function computeNetworkCentrality(people: PersonNode[]): NetworkCentrality {
  const map = new Map<string, PersonNode>(people.map((p) => [p.id, p]));
  const ids = Array.from(map.keys());

  const adj: Record<string, Set<string>> = {};
  ids.forEach((id) => (adj[id] = new Set<string>()));

  let totalRelationships = 0;
  let formalCount = 0;
  let informalCount = 0;

  const formalTypes = new Set(['functional', 'advisory', 'matrix', 'project', 'dependency']);

  people.forEach((p) => {
    (p.customRels || []).forEach((r) => {
      totalRelationships++;
      if (formalTypes.has(r.typeId)) formalCount++;
      else informalCount++;

      if (ids.includes(r.toId) && r.toId !== p.id) {
        adj[p.id].add(r.toId);
        adj[r.toId].add(p.id); // undirected collaboration network
      }
    });
  });

  // 1. Degree Centrality
  const degreeRanking = ids
    .map((id) => ({
      person: map.get(id)!,
      connections: adj[id].size
    }))
    .filter((x) => x.connections > 0)
    .sort((a, b) => b.connections - a.connections);

  // 2. Betweenness Centrality (Brandes Algorithm)
  const CB: Record<string, number> = {};
  ids.forEach((id) => (CB[id] = 0));

  ids.forEach((s) => {
    const S: string[] = [];
    const P: Record<string, string[]> = {};
    const sigma: Record<string, number> = {};
    const dist: Record<string, number> = {};

    ids.forEach((w) => {
      P[w] = [];
      sigma[w] = 0;
      dist[w] = -1;
    });

    sigma[s] = 1;
    dist[s] = 0;

    const Q: string[] = [s];
    let qi = 0;
    while (qi < Q.length) {
      const v = Q[qi++];
      S.push(v);
      adj[v].forEach((w) => {
        if (dist[w] < 0) {
          dist[w] = dist[v] + 1;
          Q.push(w);
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          P[w].push(v);
        }
      });
    }

    const delta: Record<string, number> = {};
    ids.forEach((w) => (delta[w] = 0));

    for (let i = S.length - 1; i >= 0; i--) {
      const w = S[i];
      P[w].forEach((v) => {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      });
      if (w !== s) {
        CB[w] += delta[w];
      }
    }
  });

  // Normalize for undirected graph
  ids.forEach((id) => (CB[id] /= 2));

  const betweennessRanking = ids
    .map((id) => ({
      person: map.get(id)!,
      bridgeScore: Math.round(CB[id] * 10) / 10
    }))
    .filter((x) => x.bridgeScore > 0)
    .sort((a, b) => b.bridgeScore - a.bridgeScore);

  return {
    degreeRanking,
    betweennessRanking,
    totalRelationships,
    formalCount,
    informalCount
  };
}

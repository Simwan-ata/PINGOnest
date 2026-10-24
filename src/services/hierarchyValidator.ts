/**
 * PingoNest Pro - Hierarchy Movement & Structural Integrity Validator
 * Validates position reassignments, detects cyclic dependencies,
 * checks for executive hierarchy inversion, cross-department anomalies,
 * and span-of-control disruption.
 */

import { PersonNode } from '../types/pingonest';
import { HierarchyEngine } from './analyticsService';

export type WarningSeverity = 'critical' | 'high' | 'medium' | 'info';

export interface ValidationIssue {
  id: string;
  severity: WarningSeverity;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  blocking: boolean;
}

export interface MoveValidationResult {
  canProceed: boolean;
  hasWarnings: boolean;
  sourcePerson: PersonNode;
  targetPerson: PersonNode;
  issues: ValidationIssue[];
}

export class HierarchyValidator {
  /**
   * Validate moving a person to a new parent in the organizational hierarchy
   */
  static validateMove(
    people: PersonNode[],
    sourceId: string,
    targetId: string
  ): MoveValidationResult | null {
    const source = people.find((p) => p.id === sourceId);
    const target = people.find((p) => p.id === targetId);

    if (!source || !target) return null;

    // Moving to the same parent already?
    if (source.parentId === targetId) {
      return {
        canProceed: false,
        hasWarnings: false,
        sourcePerson: source,
        targetPerson: target,
        issues: []
      };
    }

    const issues: ValidationIssue[] = [];

    // 1. CRITICAL: Cyclic Dependency Check (Node cannot become child of its own descendant)
    const isCycle = HierarchyEngine.wouldCreateCycle(people, sourceId, targetId);
    if (isCycle) {
      issues.push({
        id: 'cyclic_dependency',
        severity: 'critical',
        titleFa: 'ایجاد حلقه باطل و بن‌بست مدیریتی (Cycle Violation)',
        titleEn: 'Cyclic Dependency Detected',
        descriptionFa: `شما قصد دارید «${source.name}» (${source.title}) را به عنوان زیرمجموعه «${target.name}» تعریف کنید؛ در حالی که فرد مقصد در حال حاضر در شاخه زیردستان خود این شخص قرار دارد! این کار ساختار درختی سازمان را نابود و حلقه بی‌پایان ایجاد می‌کند.`,
        descriptionEn: `Assigning ${source.name} under ${target.name} creates an impossible circular loop, because the target is currently a subordinate of the source.`,
        blocking: true
      });
    }

    // 2. HIGH: Hierarchy Inversion (Executive assigned under junior staff)
    if (source.level < target.level) {
      const levelDiff = target.level - source.level;
      issues.push({
        id: 'hierarchy_inversion',
        severity: levelDiff >= 2 ? 'high' : 'medium',
        titleFa: 'وارونگی نامتعارف رده سازمانی (Hierarchy Inversion)',
        titleEn: 'Hierarchy Level Inversion',
        descriptionFa: `سطح سازمانی «${source.name}» رده ${source.level} (${source.title}) است، اما مدیر جدید پیشنهادی «${target.name}» در رده پایین‌تر ${target.level} (${target.title}) قرار دارد. در ساختارهای سازمانی استاندارد، مقام ارشد نمی‌تواند گزارش‌دهنده به کارشناس رده پایین‌تر باشد.`,
        descriptionEn: `${source.name} (Level ${source.level}) is being placed under a lower-ranked position: ${target.name} (Level ${target.level}).`,
        blocking: false
      });
    }

    // 3. MEDIUM: Cross-Department Mismatch
    if (source.department !== target.department) {
      issues.push({
        id: 'department_mismatch',
        severity: 'medium',
        titleFa: 'مغایرت دپارتمان سازمانی (Cross-Department)',
        titleEn: 'Department Mismatch',
        descriptionFa: `دپارتمان کنونی «${source.name}» برابر با «${source.department}» است، اما مدیر پیشنهادی در دپارتمان «${target.department}» فعالیت می‌کند. آیا این انتقال بین‌واحدی مدنظر است؟`,
        descriptionEn: `${source.name} belongs to '${source.department}', but the new manager belongs to '${target.department}'.`,
        blocking: false
      });
    }

    // 4. MEDIUM: Mass Team Relocation (Span of control)
    const subordinatesCount = people.filter((p) => p.parentId === sourceId).length;
    if (subordinatesCount >= 3) {
      issues.push({
        id: 'team_relocation',
        severity: 'medium',
        titleFa: 'جابجایی همزمان کل تیم زیرمجموعه',
        titleEn: 'Whole Team Relocation',
        descriptionFa: `«${source.name}» در حال حاضر سرپرست ${subordinatesCount} نفر پرسنل مستقیم است. با تغییر مدیر وی، تمام این زیردستان و شاخه‌های پایین‌دستی نیز جابجا خواهند شد.`,
        descriptionEn: `${source.name} currently supervises ${subordinatesCount} direct subordinates who will all be relocated.`,
        blocking: false
      });
    }

    const hasBlocking = issues.some((i) => i.blocking);

    return {
      canProceed: !hasBlocking,
      hasWarnings: issues.length > 0,
      sourcePerson: source,
      targetPerson: target,
      issues
    };
  }
}

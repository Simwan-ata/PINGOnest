/**
 * CLI Validation Runner for PingoNest ST1
 * Can be executed via: npx tsx scripts/validate.ts
 */
import { runFullTestSuite } from '../src/validation/testSuite';
import { validateBundle } from '../src/validation/validator';
import { VALID_BASELINE_BUNDLE } from '../src/domain/sampleData';

console.log('=====================================================');
console.log(' PingoNest ST1 — Greenfield Architecture Test Runner');
console.log('=====================================================\n');

console.log('[1/2] Executing Baseline Bundle Schema & Invariant Check...');
const baselineReport = validateBundle(VALID_BASELINE_BUNDLE);
console.log(`- Schema Valid: ${baselineReport.schemaValid}`);
console.log(`- Overall Valid: ${baselineReport.isValid}`);
console.log(`- Total Errors: ${baselineReport.totalErrors}`);
console.log(`- Total Warnings: ${baselineReport.totalWarnings}`);
console.log(`- Entities Inspected: ${JSON.stringify(baselineReport.metrics, null, 2)}\n`);

console.log('[2/2] Running Full Test Suite & Red-Team Scenarios...');
const testResults = runFullTestSuite();

let passed = 0;
let failed = 0;

for (const t of testResults) {
  const icon = t.status === 'PASSED' ? '✓' : '✗';
  console.log(`${icon} [${t.id}] ${t.category} :: ${t.name} (${t.durationMs}ms)`);
  if (t.status === 'FAILED') {
    console.error(`   Expected: ${t.expected}`);
    console.error(`   Actual:   ${t.actual}`);
    if (t.errorDetails) console.error(`   Details:  ${t.errorDetails}`);
    failed++;
  } else {
    passed++;
  }
}

console.log('\n=====================================================');
console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED | TOTAL: ${testResults.length}`);
console.log('=====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All PingoNest ST1 Architectural Invariants Passed Successfully!');
  process.exit(0);
}

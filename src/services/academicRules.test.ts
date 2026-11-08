import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFinalGrade,
  validatePrerequisites,
  validateGroupQuota,
  calculateWeightedGPA,
  hasScheduleConflict,
} from './academicRules.ts';

test('calculateFinalGrade computes 30/30/40 weighted formula accurately', () => {
  // C1: 4.0 (1.2) + C2: 3.5 (1.05) + C3: 4.5 (1.8) = 4.05 -> APROBADO
  const res1 = calculateFinalGrade(4.0, 3.5, 4.5);
  assert.equal(res1.definitiva, 4.05);
  assert.equal(res1.estado, 'APROBADO');

  // Failing grade: 2.0 (0.6) + 2.5 (0.75) + 2.0 (0.8) = 2.15 -> REPROBADO
  const res2 = calculateFinalGrade(2.0, 2.5, 2.0);
  assert.equal(res2.definitiva, 2.15);
  assert.equal(res2.estado, 'REPROBADO');

  // Exact approval boundary (3.0)
  const res3 = calculateFinalGrade(3.0, 3.0, 3.0);
  assert.equal(res3.definitiva, 3.0);
  assert.equal(res3.estado, 'APROBADO');
});

test('validatePrerequisites checks approved courses against prerequisites', () => {
  const approved = ['MAT101', 'FIS101', 'PRG101'];

  // All satisfied
  const check1 = validatePrerequisites(approved, ['MAT101', 'PRG101']);
  assert.equal(check1.eligible, true);
  assert.deepEqual(check1.missingPrereqs, []);

  // Missing FIS102
  const check2 = validatePrerequisites(approved, ['MAT101', 'FIS102']);
  assert.equal(check2.eligible, false);
  assert.deepEqual(check2.missingPrereqs, ['FIS102']);

  // No prerequisites required
  const check3 = validatePrerequisites(approved, []);
  assert.equal(check3.eligible, true);
});

test('validateGroupQuota correctly determines slot availability', () => {
  // Available slots
  const res1 = validateGroupQuota(30, 25);
  assert.equal(res1.hasQuota, true);
  assert.equal(res1.availableSlots, 5);

  // Exactly full
  const res2 = validateGroupQuota(30, 30);
  assert.equal(res2.hasQuota, false);
  assert.equal(res2.availableSlots, 0);

  // Over capacity edge case
  const res3 = validateGroupQuota(20, 22);
  assert.equal(res3.hasQuota, false);
  assert.equal(res3.availableSlots, 0);
});

test('calculateWeightedGPA computes credit-weighted average', () => {
  // Math (3 credits, 4.0) = 12, Physics (4 credits, 3.0) = 12, English (2 credits, 5.0) = 10
  // Total points = 34, Total credits = 9 -> 34/9 = 3.78
  const records = [
    { grade: 4.0, credits: 3 },
    { grade: 3.0, credits: 4 },
    { grade: 5.0, credits: 2 },
  ];
  const gpa = calculateWeightedGPA(records);
  assert.equal(gpa, 3.78);

  assert.equal(calculateWeightedGPA([]), 0.0);
});

test('hasScheduleConflict detects time and day overlaps', () => {
  // Same day overlapping hours: Lunes 08:00 - 10:00 vs Lunes 09:00 - 11:00 -> CONFLICT
  const conflict1 = hasScheduleConflict(
    'Lunes y Miércoles 08:00 - 10:00',
    'Lunes 09:00 - 11:00'
  );
  assert.equal(conflict1, true);

  // Same day non-overlapping: Lunes 08:00 - 10:00 vs Lunes 10:00 - 12:00 -> NO CONFLICT
  const conflict2 = hasScheduleConflict(
    'Lunes 08:00 - 10:00',
    'Lunes 10:00 - 12:00'
  );
  assert.equal(conflict2, false);

  // Different days: Lunes vs Martes -> NO CONFLICT
  const conflict3 = hasScheduleConflict(
    'Lunes 08:00 - 10:00',
    'Martes 08:00 - 10:00'
  );
  assert.equal(conflict3, false);
});

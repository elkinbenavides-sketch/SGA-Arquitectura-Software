/**
 * Academic Business Logic Rules & Computations
 * Standard University Evaluation Scale (0.0 to 5.0, Passing >= 3.0)
 * Weighted cortes: Corte 1 (30%), Corte 2 (30%), Corte 3 (40%)
 */

export interface GradeComponents {
  corte1: number;
  corte2: number;
  corte3: number;
}

export interface EvaluationResult {
  definitiva: number;
  estado: 'APROBADO' | 'REPROBADO';
  porcentajeCompletado: number;
}

/**
 * Calculates weighted final grade and approval status
 */
export function calculateFinalGrade(c1: number, c2: number, c3: number): EvaluationResult {
  // Clamp between 0.0 and 5.0
  const clamp = (val: number) => Math.max(0, Math.min(5.0, val));
  const v1 = clamp(c1);
  const v2 = clamp(c2);
  const v3 = clamp(c3);

  const definitiva = Number((v1 * 0.3 + v2 * 0.3 + v3 * 0.4).toFixed(2));
  const estado: 'APROBADO' | 'REPROBADO' = definitiva >= 3.0 ? 'APROBADO' : 'REPROBADO';

  return {
    definitiva,
    estado,
    porcentajeCompletado: 100,
  };
}

/**
 * Checks prerequisite eligibility
 */
export function validatePrerequisites(
  approvedCourseCodes: string[],
  prerequisites: string[]
): { eligible: boolean; missingPrereqs: string[] } {
  if (!prerequisites || prerequisites.length === 0) {
    return { eligible: true, missingPrereqs: [] };
  }

  const approvedSet = new Set(approvedCourseCodes.map((c) => c.trim().toUpperCase()));
  const missing = prerequisites.filter((p) => !approvedSet.has(p.trim().toUpperCase()));

  return {
    eligible: missing.length === 0,
    missingPrereqs: missing,
  };
}

/**
 * Validates group quota limits
 */
export function validateGroupQuota(
  cupoMaximo: number,
  cuposInscritos: number
): { hasQuota: boolean; availableSlots: number } {
  const max = Math.max(0, cupoMaximo);
  const enrolled = Math.max(0, cuposInscritos);
  const available = max - enrolled;

  return {
    hasQuota: available > 0,
    availableSlots: Math.max(0, available),
  };
}

/**
 * Calculates weighted GPA (Promedio ponderado por créditos)
 */
export function calculateWeightedGPA(
  records: Array<{ grade: number; credits: number }>
): number {
  if (!records || records.length === 0) return 0.0;

  let totalPoints = 0;
  let totalCredits = 0;

  for (const item of records) {
    if (item.credits > 0 && !isNaN(item.grade)) {
      totalPoints += item.grade * item.credits;
      totalCredits += item.credits;
    }
  }

  if (totalCredits === 0) return 0.0;
  return Number((totalPoints / totalCredits).toFixed(2));
}

/**
 * Schedule Conflict Detector
 * Example format: "Lunes y Miércoles 08:00 - 10:00"
 */
export function hasScheduleConflict(
  scheduleA: string,
  scheduleB: string
): boolean {
  if (!scheduleA || !scheduleB) return false;
  if (scheduleA === scheduleB) return true;

  // Day extraction
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const daysInA = days.filter((d) => scheduleA.includes(d));
  const daysInB = days.filter((d) => scheduleB.includes(d));

  const commonDays = daysInA.filter((d) => daysInB.includes(d));
  if (commonDays.length === 0) return false;

  // Extract hours: regex for HH:MM - HH:MM
  const timeRegex = /(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/;
  const matchA = scheduleA.match(timeRegex);
  const matchB = scheduleB.match(timeRegex);

  if (!matchA || !matchB) return false;

  const startA = parseInt(matchA[1], 10) * 60 + parseInt(matchA[2], 10);
  const endA = parseInt(matchA[3], 10) * 60 + parseInt(matchA[4], 10);

  const startB = parseInt(matchB[1], 10) * 60 + parseInt(matchB[2], 10);
  const endB = parseInt(matchB[3], 10) * 60 + parseInt(matchB[4], 10);

  // Overlap condition: startA < endB && startB < endA
  return startA < endB && startB < endA;
}

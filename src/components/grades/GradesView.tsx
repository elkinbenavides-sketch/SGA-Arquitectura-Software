import React, { useState, useMemo } from 'react';
import {
  Award,
  Save,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CourseGroup, Grade, Enrollment, Subject, StudentProfile, User } from '../../types/academic';
import { AcademicStorage } from '../../services/academicStorage';
import { calculateFinalGrade, calculateWeightedGPA } from '../../services/academicRules';
import { Modal } from '../common/Modal';

interface GradesViewProps {
  initialGroupId?: string;
}

export const GradesView: React.FC<GradesViewProps> = ({ initialGroupId }) => {
  const { role, user, teacher, student } = useAuth();

  const groups = AcademicStorage.getGroups();
  const subjects = AcademicStorage.getSubjects();
  const teachers = AcademicStorage.getTeachers();
  const students = AcademicStorage.getStudents();
  const users = AcademicStorage.getUsers();
  const [grades, setGrades] = useState<Grade[]>(() => AcademicStorage.getGrades());
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => AcademicStorage.getEnrollments());

  const isStudent = role === 'ESTUDIANTE';
  const isTeacher = role === 'DOCENTE';

  // Teacher specific: select from teacher's groups
  const teacherProfile =
    teacher || teachers.find((t) => t.id_usuario === user?.id_usuario) || teachers[0];
  const teacherGroups = isTeacher
    ? groups.filter((g) => g.id_docente === teacherProfile.id_docente)
    : groups;

  const [selectedGroupId, setSelectedGroupId] = useState(
    initialGroupId || teacherGroups[0]?.id_grupo || groups[0]?.id_grupo || ''
  );

  // Local draft state for grade edits before saving
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, { c1: number; c2: number; c3: number; obs: string }>>({});
  const [saveFeedback, setSaveFeedback] = useState('');
  const [showActaModal, setShowActaModal] = useState(false);

  const selectedGroup = groups.find((g) => g.id_grupo === selectedGroupId);
  const selectedSubject = subjects.find((s) => s.id_asignatura === selectedGroup?.id_asignatura);

  // Group enrollments
  const groupEnrollments = useMemo(() => {
    return enrollments.filter(
      (e) => e.id_grupo === selectedGroupId && e.estado !== 'CANCELADA'
    );
  }, [enrollments, selectedGroupId]);

  // Combine student, enrollment and grade
  const groupRosterWithGrades = useMemo(() => {
    return groupEnrollments.map((enr) => {
      const s = students.find((std) => std.id_estudiante === enr.id_estudiante);
      const u = users.find((usr) => usr.id_usuario === s?.id_usuario);
      const existingGrade = grades.find((gr) => gr.id_matricula === enr.id_matricula);

      const draft = gradeDrafts[enr.id_matricula] || {
        c1: existingGrade?.corte1 ?? 0,
        c2: existingGrade?.corte2 ?? 0,
        c3: existingGrade?.corte3 ?? 0,
        obs: existingGrade?.observacion ?? '',
      };

      const calc = calculateFinalGrade(draft.c1, draft.c2, draft.c3);

      return {
        enrollment: enr,
        student: s,
        user: u,
        existingGrade,
        corte1: draft.c1,
        corte2: draft.c2,
        corte3: draft.c3,
        observacion: draft.obs,
        definitiva: calc.definitiva,
        estado: calc.estado,
      };
    });
  }, [groupEnrollments, students, users, grades, gradeDrafts]);

  const handleGradeChange = (
    idMatricula: string,
    corte: 'c1' | 'c2' | 'c3' | 'obs',
    value: string | number
  ) => {
    setGradeDrafts((prev) => {
      const current = prev[idMatricula] || {
        c1: 0,
        c2: 0,
        c3: 0,
        obs: '',
      };

      if (corte === 'obs') {
        return {
          ...prev,
          [idMatricula]: { ...current, obs: String(value) },
        };
      }

      // Clamp between 0.0 and 5.0
      const numVal = Math.max(0, Math.min(5.0, Number(value) || 0));
      return {
        ...prev,
        [idMatricula]: { ...current, [corte]: numVal },
      };
    });
  };

  const handleSaveAllGrades = () => {
    const modifier = user ? `${user.nombre} ${user.apellido} (${role})` : 'Docente Titular';

    groupRosterWithGrades.forEach((item) => {
      const gradeRecord: Grade = {
        id_calificacion: item.existingGrade?.id_calificacion || `CAL-${Date.now().toString().slice(-6)}`,
        id_matricula: item.enrollment.id_matricula,
        corte1: item.corte1,
        corte2: item.corte2,
        corte3: item.corte3,
        definitiva: item.definitiva,
        estado: item.estado,
        observacion: item.observacion,
        fecha_modificacion: new Date().toISOString(),
        modificado_por: modifier,
      };
      AcademicStorage.saveGrade(gradeRecord, modifier);
    });

    setGrades(AcademicStorage.getGrades());
    setSaveFeedback('¡Calificaciones guardadas exitosamente y registradas en auditoría!');
    setTimeout(() => setSaveFeedback(''), 3500);
  };

  // Student Sabana de Notas calculation
  const currentStudentId =
    student?.id_estudiante ||
    students.find((s) => s.id_usuario === user?.id_usuario)?.id_estudiante ||
    students[0]?.id_estudiante;

  const studentEnrollments = enrollments.filter(
    (e) => e.id_estudiante === currentStudentId && e.estado !== 'CANCELADA'
  );

  const studentCourses = studentEnrollments.map((enr) => {
    const g = groups.find((grp) => grp.id_grupo === enr.id_grupo);
    const sub = subjects.find((s) => s.id_asignatura === g?.id_asignatura);
    const gr = grades.find((gra) => gra.id_matricula === enr.id_matricula);
    return {
      enrollment: enr,
      group: g,
      subject: sub,
      grade: gr,
    };
  });

  const studentGPA = calculateWeightedGPA(
    studentCourses.map((c) => ({
      grade: c.grade?.definitiva ?? 0,
      credits: c.subject?.creditos ?? 3,
    }))
  );

  // If role is ESTUDIANTE, render official Sabana de Notas
  if (isStudent) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sábana Oficial de Notas & Historial Académico
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Certificado de notas consolidado con ponderación oficial (Corte 1 30%, Corte 2 30%,
              Corte 3 40%).
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-xs no-print transition-all self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Sábana (PDF)</span>
          </button>
        </div>

        {/* GPA Summary Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider block">
                Promedio Ponderado Semestral (2026-1)
              </span>
              <div className="text-3xl font-black">{studentGPA.toFixed(2)} / 5.00</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] block">Materias Matriculadas:</span>
              <strong className="text-white text-sm">{studentCourses.length}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Créditos en Curso:</span>
              <strong className="text-white text-sm">
                {studentCourses.reduce((acc, c) => acc + (c.subject?.creditos || 0), 0)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Estado Académico:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                REGULAR AL DÍA
              </span>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900">
              Detalle de Calificaciones por Asignatura
            </h3>
            <p className="text-xs text-slate-500">
              Calificación mínima de aprobación institucional: 3.00 sobre 5.00
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Asignatura</th>
                  <th className="py-3 px-4 text-center">Créditos</th>
                  <th className="py-3 px-4 text-center">Corte 1 (30%)</th>
                  <th className="py-3 px-4 text-center">Corte 2 (30%)</th>
                  <th className="py-3 px-4 text-center">Corte 3 (40%)</th>
                  <th className="py-3 px-4 text-center font-bold text-slate-900">Definitiva</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4">Observaciones Docente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentCourses.map((c) => (
                  <tr key={c.enrollment.id_matricula} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                      {c.subject?.codigo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {c.subject?.nombre}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {c.subject?.creditos}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {c.grade?.corte1 ? c.grade.corte1.toFixed(1) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {c.grade?.corte2 ? c.grade.corte2.toFixed(1) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {c.grade?.corte3 ? c.grade.corte3.toFixed(1) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-blue-900 text-sm">
                      {c.grade?.definitiva ? c.grade.definitiva.toFixed(2) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.grade?.estado === 'APROBADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.grade?.estado === 'REPROBADO'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.grade?.estado || 'EN CURSO'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {c.grade?.observacion || 'Sin observaciones registradas.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Teacher / Coordinator / Admin View (Evaluation Spreadsheet)
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Registro & Modificación de Calificaciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Libro de calificaciones académico con cálculo automático de definitivas ponderadas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowActaModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Generar Acta en PDF</span>
          </button>
          <button
            onClick={handleSaveAllGrades}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-xs shadow-blue-950/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Calificaciones</span>
          </button>
        </div>
      </div>

      {saveFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* Course Selector Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-700" />
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase">
              Seleccionar Curso / Grupo:
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="mt-0.5 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:outline-hidden"
            >
              {teacherGroups.map((g) => {
                const sub = subjects.find((s) => s.id_asignatura === g.id_asignatura);
                return (
                  <option key={g.id_grupo} value={g.id_grupo}>
                    {sub?.codigo} - {sub?.nombre} ({g.nombre_grupo})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {selectedGroup && (
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 text-[10px] block">Horario:</span>
              <strong className="text-slate-800">{selectedGroup.horario}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Aula:</span>
              <strong className="text-slate-800">{selectedGroup.aula}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Estudiantes en lista:</span>
              <strong className="text-slate-800">{groupRosterWithGrades.length}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Gradebook Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Planilla de Evaluación Parcial y Definitiva
            </h3>
            <p className="text-xs text-slate-500">
              Escala de notas: 0.0 a 5.0 (Aprobación institucional &ge; 3.0)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">Corte 1: 30%</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">Corte 2: 30%</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800">Corte 3: 40%</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Estudiante</th>
                <th className="py-3 px-3 text-center w-24">Corte 1 (30%)</th>
                <th className="py-3 px-3 text-center w-24">Corte 2 (30%)</th>
                <th className="py-3 px-3 text-center w-24">Corte 3 (40%)</th>
                <th className="py-3 px-3 text-center w-24 font-bold text-slate-900">Definitiva</th>
                <th className="py-3 px-3 text-center w-28">Estado</th>
                <th className="py-3 px-3">Observación Evaluativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupRosterWithGrades.length > 0 ? (
                groupRosterWithGrades.map((item) => (
                  <tr key={item.enrollment.id_matricula} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {item.student?.codigo_estudiante}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">
                        {item.user?.nombre} {item.user?.apellido}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.user?.correo}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={item.corte1}
                        onChange={(e) =>
                          handleGradeChange(item.enrollment.id_matricula, 'c1', e.target.value)
                        }
                        className="w-16 px-2 py-1 text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-hidden focus:border-blue-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={item.corte2}
                        onChange={(e) =>
                          handleGradeChange(item.enrollment.id_matricula, 'c2', e.target.value)
                        }
                        className="w-16 px-2 py-1 text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-hidden focus:border-blue-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={item.corte3}
                        onChange={(e) =>
                          handleGradeChange(item.enrollment.id_matricula, 'c3', e.target.value)
                        }
                        className="w-16 px-2 py-1 text-center font-mono font-bold bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-hidden focus:border-blue-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-blue-900 text-sm">
                      {item.definitiva.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.estado === 'APROBADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.estado}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={item.observacion}
                        onChange={(e) =>
                          handleGradeChange(item.enrollment.id_matricula, 'obs', e.target.value)
                        }
                        placeholder="Observación cualitativa..."
                        className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-hidden"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No hay estudiantes inscritos en este grupo para calificar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Acta Modal */}
      <Modal
        isOpen={showActaModal}
        onClose={() => setShowActaModal(false)}
        title="Acta Oficial de Calificaciones Finales"
        subtitle="Documento legal universitario de cierre de periodo académico 2026-1."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="p-6 rounded-xl border border-slate-300 bg-white space-y-4 font-sans text-slate-900 text-xs">
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <h2 className="text-sm font-black uppercase tracking-tight">UNIVERSIDAD DEL VALLE</h2>
              <p className="text-[11px] text-slate-600">SECRETARÍA GENERAL &bull; REGISTRO ACADÉMICO</p>
              <h3 className="text-xs font-bold mt-2 uppercase">
                ACTA DE CALIFICACIONES FINALES - PERIODO 2026-1
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <strong>Asignatura:</strong> {selectedSubject?.codigo} - {selectedSubject?.nombre}
              </div>
              <div>
                <strong>Grupo:</strong> {selectedGroup?.nombre_grupo}
              </div>
              <div>
                <strong>Docente Titular:</strong> {user?.nombre} {user?.apellido}
              </div>
              <div>
                <strong>Fecha de Consolidación:</strong> {new Date().toLocaleDateString('es-CO')}
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
              <thead className="bg-slate-100">
                <tr className="border-b border-slate-300 font-bold">
                  <th className="p-1.5 border-r border-slate-300">Cód. Estudiante</th>
                  <th className="p-1.5 border-r border-slate-300">Nombres y Apellidos</th>
                  <th className="p-1.5 text-center border-r border-slate-300">C1 (30%)</th>
                  <th className="p-1.5 text-center border-r border-slate-300">C2 (30%)</th>
                  <th className="p-1.5 text-center border-r border-slate-300">C3 (40%)</th>
                  <th className="p-1.5 text-center border-r border-slate-300 font-black">Definitiva</th>
                  <th className="p-1.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {groupRosterWithGrades.map((r) => (
                  <tr key={r.enrollment.id_matricula} className="border-b border-slate-200">
                    <td className="p-1.5 font-mono border-r border-slate-200">
                      {r.student?.codigo_estudiante}
                    </td>
                    <td className="p-1.5 font-medium border-r border-slate-200">
                      {r.user?.nombre} {r.user?.apellido}
                    </td>
                    <td className="p-1.5 text-center border-r border-slate-200">{r.corte1.toFixed(1)}</td>
                    <td className="p-1.5 text-center border-r border-slate-200">{r.corte2.toFixed(1)}</td>
                    <td className="p-1.5 text-center border-r border-slate-200">{r.corte3.toFixed(1)}</td>
                    <td className="p-1.5 text-center font-bold border-r border-slate-200">
                      {r.definitiva.toFixed(2)}
                    </td>
                    <td className="p-1.5 text-center font-bold">{r.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Area */}
            <div className="pt-8 flex items-center justify-around text-center text-[10px]">
              <div>
                <div className="w-44 border-b border-slate-400 mb-1" />
                <span>Firma Docente Titular</span>
              </div>
              <div>
                <div className="w-44 border-b border-slate-400 mb-1" />
                <span>Director / Coordinador de Programa</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 no-print">
            <button
              onClick={() => setShowActaModal(false)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cerrar
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-800"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Acta Oficial (PDF)</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

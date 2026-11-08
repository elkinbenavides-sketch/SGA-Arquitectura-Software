import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  CalendarDays,
  FileCheck2,
  Clock,
  MapPin,
  Download,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AcademicStorage } from '../../services/academicStorage';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user, student } = useAuth();

  const students = AcademicStorage.getStudents();
  const programs = AcademicStorage.getPrograms();
  const subjects = AcademicStorage.getSubjects();
  const groups = AcademicStorage.getGroups();
  const enrollments = AcademicStorage.getEnrollments();
  const grades = AcademicStorage.getGrades();

  // Student profile
  const studentProfile =
    student ||
    students.find((s) => s.id_usuario === user?.id_usuario) ||
    students[0];

  const program = programs.find((p) => p.id_programa === studentProfile.id_programa);

  // Active enrollments for this student
  const myEnrollments = enrollments.filter(
    (e) => e.id_estudiante === studentProfile.id_estudiante && e.estado !== 'CANCELADA'
  );

  // Associated groups and subjects
  const enrolledCourses = myEnrollments.map((enr) => {
    const group = groups.find((g) => g.id_grupo === enr.id_grupo);
    const subject = subjects.find((s) => s.id_asignatura === group?.id_asignatura);
    const grade = grades.find((gr) => gr.id_matricula === enr.id_matricula);
    return {
      enrollment: enr,
      group,
      subject,
      grade,
    };
  });

  const totalCreditsEnrolled = enrolledCourses.reduce(
    (acc, c) => acc + (c.subject?.creditos || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>Portal de Autoservicio Estudiantil &bull; 2026-1</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Hola, {user?.nombre} {user?.apellido}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Código: <strong className="text-white font-mono">{studentProfile.codigo_estudiante}</strong> &bull;{' '}
              {program?.nombre} &bull; Semestre {studentProfile.semestre}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('matriculas')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Adicionar Materias</span>
            </button>
            <button
              onClick={() => onNavigate('calificaciones')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Sábana de Notas</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Materias Inscritas</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{myEnrollments.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Horario confirmado</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Créditos Inscritos</span>
            <CalendarDays className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalCreditsEnrolled}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Carga semestral 2026-1</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Promedio Acumulado</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {studentProfile.promedio_acumulado.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Sobresaliente / Acreditado
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Créditos Aprobados</span>
            <FileCheck2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {studentProfile.creditos_aprobados}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            De {program?.creditos_totales || 160} créditos del plan
          </div>
        </div>
      </div>

      {/* Enrolled courses table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Mis Asignaturas Matriculadas (Semestre 2026-1)
            </h3>
            <p className="text-xs text-slate-500">
              Seguimiento de cortes evaluativos (30% - 30% - 40%)
            </p>
          </div>
          <button
            onClick={() => onNavigate('calificaciones')}
            className="text-xs font-bold text-blue-700 hover:underline"
          >
            Ver Detalle de Notas &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Asignatura</th>
                <th className="py-2.5 px-3">Créditos</th>
                <th className="py-2.5 px-3">Horario & Aula</th>
                <th className="py-2.5 px-3 text-center">Corte 1 (30%)</th>
                <th className="py-2.5 px-3 text-center">Corte 2 (30%)</th>
                <th className="py-2.5 px-3 text-center">Corte 3 (40%)</th>
                <th className="py-2.5 px-3 text-center">Definitiva</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrolledCourses.map((c) => (
                <tr key={c.enrollment.id_matricula} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-mono font-bold text-blue-900">
                    {c.subject?.codigo}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{c.subject?.nombre}</td>
                  <td className="py-3 px-3 font-bold text-slate-600">{c.subject?.creditos}</td>
                  <td className="py-3 px-3 text-slate-600">
                    <div>{c.group?.horario}</div>
                    <div className="text-[11px] text-slate-400">{c.group?.aula}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold">
                    {c.grade?.corte1 ? c.grade.corte1.toFixed(1) : '-'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold">
                    {c.grade?.corte2 ? c.grade.corte2.toFixed(1) : '-'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold">
                    {c.grade?.corte3 ? c.grade.corte3.toFixed(1) : '-'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-extrabold text-blue-900">
                    {c.grade?.definitiva ? c.grade.definitiva.toFixed(2) : '-'}
                  </td>
                  <td className="py-3 px-3 text-center">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

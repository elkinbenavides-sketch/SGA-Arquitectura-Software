import React from 'react';
import {
  CalendarDays,
  Award,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AcademicStorage } from '../../services/academicStorage';

interface TeacherDashboardProps {
  onNavigate: (view: string, initialGroupId?: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { user, teacher } = useAuth();

  const groups = AcademicStorage.getGroups();
  const subjects = AcademicStorage.getSubjects();
  const teachers = AcademicStorage.getTeachers();

  // Find this teacher profile
  const teacherProfile =
    teacher ||
    teachers.find((t) => t.id_usuario === user?.id_usuario) ||
    teachers[0];

  // Assigned groups
  const myGroups = groups.filter((g) => g.id_docente === teacherProfile.id_docente);
  const totalStudents = myGroups.reduce((acc, g) => acc + g.cupos_inscritos, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold mb-2">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Portal Docente Universitario &bull; Periodo 2026-1</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Bienvenido, {user?.nombre} {user?.apellido}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {teacherProfile.titulo} &bull; {teacherProfile.especialidad}
            </p>
          </div>

          <button
            onClick={() => onNavigate('calificaciones')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Ingresar Calificaciones</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cursos Asignados</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{myGroups.length}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Periodo 2026-1</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Estudiantes Asignados</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalStudents}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Asistencia en lista
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dedicación Semanal</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {teacherProfile.horas_semanales} Horas
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Escalafón {teacherProfile.escalafon}
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Mis Cursos y Grupos Activos (2026-1)
          </h3>
          <span className="text-xs text-slate-500">
            {myGroups.length} asignaturas a su cargo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myGroups.map((group) => {
            const subject = subjects.find((s) => s.id_asignatura === group.id_asignatura);
            return (
              <div
                key={group.id_grupo}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {subject?.codigo} &bull; {subject?.creditos} Créditos
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {group.nombre_grupo}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {subject?.nombre}
                  </h4>

                  <div className="mt-3.5 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{group.horario}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{group.aula}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-800">{group.cupos_inscritos}</strong> de{' '}
                        {group.cupo_maximo} estudiantes inscritos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cortes 1 & 2 al día
                  </span>
                  <button
                    onClick={() => onNavigate('calificaciones', group.id_grupo)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <span>Calificar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

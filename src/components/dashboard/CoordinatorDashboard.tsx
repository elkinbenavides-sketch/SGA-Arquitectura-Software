import React, { useMemo } from 'react';
import {
  School,
  BookOpen,
  CalendarDays,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AcademicStorage } from '../../services/academicStorage';

interface CoordinatorDashboardProps {
  onNavigate: (view: string) => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({ onNavigate }) => {
  const programs = AcademicStorage.getPrograms();
  const subjects = AcademicStorage.getSubjects();
  const groups = AcademicStorage.getGroups();
  const teachers = AcademicStorage.getTeachers();
  const enrollments = AcademicStorage.getEnrollments();

  // Metrics
  const totalPrograms = programs.length;
  const totalSubjects = subjects.length;
  const totalGroups = groups.length;
  const totalTeachers = teachers.length;

  const totalCapacity = groups.reduce((acc, g) => acc + g.cupo_maximo, 0);
  const totalEnrolled = groups.reduce((acc, g) => acc + g.cupos_inscritos, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  // Chart: Group occupancy
  const groupOccupancyData = useMemo(() => {
    return groups.map((g) => {
      const subject = subjects.find((s) => s.id_asignatura === g.id_asignatura);
      return {
        name: subject?.codigo || g.id_grupo,
        asignatura: subject?.nombre || 'Curso',
        inscritos: g.cupos_inscritos,
        disponibles: Math.max(0, g.cupo_maximo - g.cupos_inscritos),
        cupoMax: g.cupo_maximo,
      };
    });
  }, [groups, subjects]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold mb-2">
              <School className="w-3.5 h-3.5 text-blue-400" />
              <span>Coordinación Académica & Curricular</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Panel de Coordinación y Oferta Académica
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Supervisión de asignaturas, distribución de docentes, planeación de horarios y
              control de cupos para el periodo 2026-1.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('grupos')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear Grupo</span>
            </button>
            <button
              onClick={() => onNavigate('asignaturas')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Pensum</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('programas')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Programas</span>
            <School className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalPrograms}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Facultades coordinadas</div>
        </div>

        <div
          onClick={() => onNavigate('asignaturas')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Asignaturas</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalSubjects}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Malla curricular activa</div>
        </div>

        <div
          onClick={() => onNavigate('grupos')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Grupos Ofertados</span>
            <CalendarDays className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalGroups}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Con docente asignado</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Ocupación de Cupos</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{occupancyRate}%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {totalEnrolled} de {totalCapacity} cupos
          </div>
        </div>
      </div>

      {/* Chart: Occupancy per Group */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ocupación de Cupos por Asignatura / Grupo (Periodo 2026-1)
            </h3>
            <p className="text-xs text-slate-500">
              Comparativa entre estudiantes matriculados y cupos disponibles
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Capacidad Óptima
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupOccupancyData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="inscritos" name="Inscritos" stackId="a" fill="#1e40af" radius={[0, 0, 0, 0]} />
              <Bar dataKey="disponibles" name="Cupos Libres" stackId="a" fill="#93c5fd" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

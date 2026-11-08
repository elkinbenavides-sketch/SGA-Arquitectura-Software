import React, { useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  FileCheck2,
  School,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  PlusCircle,
  Activity,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AcademicStorage } from '../../services/academicStorage';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

const COLORS = ['#1e40af', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const users = AcademicStorage.getUsers();
  const students = AcademicStorage.getStudents();
  const teachers = AcademicStorage.getTeachers();
  const enrollments = AcademicStorage.getEnrollments();
  const programs = AcademicStorage.getPrograms();
  const groups = AcademicStorage.getGroups();
  const auditLogs = AcademicStorage.getAuditLogs();

  // Metrics calculation
  const totalUsers = users.length;
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalEnrollments = enrollments.length;
  const activePrograms = programs.filter((p) => p.estado === 'ACTIVO').length;

  // Chart 1: Students per program
  const studentsByProgram = useMemo(() => {
    return programs.map((prog) => {
      const count = students.filter((s) => s.id_programa === prog.id_programa).length;
      return {
        name: prog.codigo,
        nombreCompleto: prog.nombre,
        estudiantes: count,
      };
    });
  }, [programs, students]);

  // Chart 2: Enrollment status distribution
  const enrollmentStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    enrollments.forEach((e) => {
      counts[e.estado] = (counts[e.estado] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [enrollments]);

  // Recent 5 audit events
  const recentActivity = auditLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold mb-2">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Centro de Control Administrativo &bull; Periodo 2026-1</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Panel de Control del Administrador
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Monitoreo en tiempo real de la infraestructura académica: programas, matrícula
              universitaria, gestión docente y trazabilidad de seguridad.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigate('usuarios')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
            <button
              onClick={() => onNavigate('programas')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <School className="w-4 h-4" />
              <span>Ver Programas</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Users */}
        <div
          onClick={() => onNavigate('usuarios')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Usuarios</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalUsers}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>100% Cuentas activas</span>
          </div>
        </div>

        {/* Total Students */}
        <div
          onClick={() => onNavigate('usuarios')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Estudiantes</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalStudents}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Matriculados pregrado</div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => onNavigate('usuarios')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cuerpo Docente</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalTeachers}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Planta & Catedráticos</div>
        </div>

        {/* Total Enrollments */}
        <div
          onClick={() => onNavigate('matriculas')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Matrículas</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalEnrollments}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Registradas 2026-1</div>
        </div>

        {/* Active Programs */}
        <div
          onClick={() => onNavigate('programas')}
          className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-400 transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Programas</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{activePrograms}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Registro SNIES activo</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Students per Program */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Distribución de Estudiantes por Programa
              </h3>
              <p className="text-xs text-slate-500">Población estudiantil por carrera académica</p>
            </div>
            <button
              onClick={() => onNavigate('programas')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsByProgram} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="estudiantes" name="Estudiantes Inscritos" fill="#1e40af" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Enrollment Status Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Estado General de Matrículas
              </h3>
              <p className="text-xs text-slate-500">Distribución de estados en el ciclo 2026-1</p>
            </div>
            <button
              onClick={() => onNavigate('matriculas')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Detalles</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={enrollmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {enrollmentStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent System Activity & Quick Auditing */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Actividad Reciente del Sistema</h3>
              <p className="text-xs text-slate-500">Últimos eventos registrados en la bitácora de auditoría</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('auditoria')}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            Ver Bitácora Completa
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.map((log) => (
            <div key={log.id_auditoria} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.usuario_nombre}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      {log.modulo}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.detalles}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.fecha).toLocaleDateString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{log.ip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

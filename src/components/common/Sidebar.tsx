import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  FileCheck2,
  Award,
  BarChart3,
  ShieldAlert,
  Layers,
  Sparkles,
  School,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types/academic';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { role, user } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'],
    },
    {
      id: 'usuarios',
      label: 'Gestión de Usuarios',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      id: 'programas',
      label: 'Programas Académicos',
      icon: School,
      roles: ['ADMIN', 'COORDINADOR'],
    },
    {
      id: 'asignaturas',
      label: 'Asignaturas & Pensum',
      icon: BookOpen,
      roles: ['ADMIN', 'COORDINADOR'],
    },
    {
      id: 'grupos',
      label: role === 'DOCENTE' ? 'Mis Cursos & Horarios' : 'Grupos & Cupos',
      icon: CalendarDays,
      roles: ['ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'],
    },
    {
      id: 'matriculas',
      label: role === 'ESTUDIANTE' ? 'Matrícula en Línea' : 'Gestión de Matrículas',
      icon: FileCheck2,
      roles: ['ADMIN', 'COORDINADOR', 'ESTUDIANTE'],
      badge: role === 'ESTUDIANTE' ? '2026-1' : undefined,
    },
    {
      id: 'calificaciones',
      label: role === 'DOCENTE' ? 'Registro de Notas' : role === 'ESTUDIANTE' ? 'Sábana de Notas' : 'Calificaciones',
      icon: Award,
      roles: ['ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'],
    },
    {
      id: 'reportes',
      label: 'Reportes & Estadísticas',
      icon: BarChart3,
      roles: ['ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'],
    },
    {
      id: 'auditoria',
      label: 'Auditoría & Trazabilidad',
      icon: ShieldAlert,
      roles: ['ADMIN'],
    },
    {
      id: 'arquitectura',
      label: 'Arquitectura & Sustentación',
      icon: Layers,
      roles: ['ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'],
      badge: 'C4 / ERD',
    },
  ];

  const filteredItems = navItems.filter((item) => role && item.roles.includes(role));

  const handleItemClick = (id: string) => {
    onSelectView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-10 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
              <GraduationCap className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-sm">SGA Univalle</span>
              <span className="block text-[10px] text-slate-400 font-medium">Campus Digital</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Cerrar navegación"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.nombre.charAt(0)}
              {user?.apellido.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-[11px] text-blue-300 font-mono truncate">{user?.correo}</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Rol Activo:</span>
            <span className="font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              {role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navegación del Sistema
          </div>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-md font-bold ${
                      isActive
                        ? 'bg-blue-800 text-blue-100'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Spring Boot 3 + React 19</span>
            <span>JWT Security</span>
          </div>
        </div>
      </aside>
    </>
  );
};

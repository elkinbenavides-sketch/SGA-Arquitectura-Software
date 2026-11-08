import React from 'react';
import {
  GraduationCap,
  Shield,
  Layers,
  LogOut,
  Calendar,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types/academic';

interface HeaderProps {
  onOpenArchitecture: () => void;
  onToggleSidebar?: () => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenArchitecture,
  onToggleSidebar,
}) => {
  const { user, role, quickLoginAsRole, logout } = useAuth();

  const getRoleBadgeStyle = (r?: Role | null) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COORDINADOR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DOCENTE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ESTUDIANTE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Menu */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-center shadow-md shadow-blue-950/20">
              <GraduationCap className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
                  SGA
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  Institución Universitaria
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Sistema Integral de Gestión Académica &bull; Versión Empresarial
              </p>
            </div>
          </div>
        </div>

        {/* Center: Period Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Periodo Activo: <strong className="text-slate-900">2026-1</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
          <span className="text-emerald-700 font-semibold text-[11px]">En Curso</span>
        </div>

        {/* Right: Quick Role Switcher, Architecture Modal & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher for Sustentación / Demo Evaluation */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="hidden md:inline-block text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Rol Demo:
            </span>
            {(['ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => quickLoginAsRole(r)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  role === r
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
                title={`Cambiar a vista de ${r}`}
              >
                {r.slice(0, 4)}
              </button>
            ))}
          </div>

          {/* Architecture & Tech Spec button */}
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            title="Ver Arquitectura Técnica, Modelo Relacional y APIs Spring Boot"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Arquitectura</span>
          </button>

          {/* User profile info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-100 shadow-xs">
              {user?.nombre.charAt(0)}
              {user?.apellido.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user?.nombre} {user?.apellido}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(
                    role
                  )}`}
                >
                  {role}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              title="Cerrar Sesión"
              aria-label="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

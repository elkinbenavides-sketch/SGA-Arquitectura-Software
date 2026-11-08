import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  BookCheck,
  Users2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types/academic';
import { Modal } from '../common/Modal';

export const LoginView: React.FC = () => {
  const { login, quickLoginAsRole } = useAuth();

  const [correo, setCorreo] = useState('admin@sga.edu.co');
  const [contrasena, setContrasena] = useState('Admin123*');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!correo || !contrasena) {
      setErrorMsg('Por favor ingrese su correo institucional y contraseña.');
      return;
    }

    setIsLoading(true);
    // Simulated realistic API auth delay
    setTimeout(async () => {
      const res = await login(correo, contrasena);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const fillCredentials = (email: string, pass: string) => {
    setCorreo(email);
    setContrasena(pass);
    setErrorMsg('');
  };

  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoverySuccess(true);
    setTimeout(() => {
      setShowRecoveryModal(false);
      setRecoverySuccess(false);
      setRecoveryEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Left Column: University Presentation & Branding Showcase */}
      <div className="relative w-full lg:w-7/12 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Subtle background glow & geometric pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">SGA</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                v2026.1 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Sistema Integral de Gestión Académica Universitaria
            </p>
          </div>
        </div>

        {/* Center Feature Highlights */}
        <div className="relative z-10 my-12 lg:my-0 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Plataforma de Alto Rendimiento para Educación Superior</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Gestión académica moderna, segura y orientada a la excelencia institucional.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Diseñado para cumplir con estándares de acreditación de alta calidad. Centraliza la
            administración de programas académicos, asignaturas, cupos, matrículas financieras y
            académicas, registro de calificaciones y auditoría con trazabilidad total.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Seguridad Spring Security & JWT</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Control de acceso estricto RBAC por roles.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <BookCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Matrículas & Prerrequisitos</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Validación de cupos y cruces de horario.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Persistencia PostgreSQL</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Modelo relacional normalizado de 8 entidades.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
              <Users2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Multi-Rol Universitario</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Admin, Coordinador, Docente y Estudiante.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>&copy; 2026 Universidad del Valle / Sistema de Información Universitaria</div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Sustentación Académica</span>
            <span>&bull;</span>
            <span>Arquitectura en Capas</span>
          </div>
        </div>
      </div>

      {/* Right Column: Corporate Login Form */}
      <div className="w-full lg:w-5/12 bg-white flex flex-col justify-center px-6 sm:px-12 py-10 lg:py-16">
        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Iniciar Sesión
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ingrese con sus credenciales institucionales para acceder al campus.
            </p>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mb-6 p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Cuentas Demo de Prueba:
              </span>
              <span className="text-[10px] text-blue-600 font-medium">Click para auto-completar</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => fillCredentials('admin@sga.edu.co', 'Admin123*')}
                className="px-2.5 py-1.5 text-left text-xs rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-100/50 transition-colors"
              >
                <div className="font-bold text-slate-900">Administrador</div>
                <div className="text-[10px] text-slate-500 font-mono">admin@sga.edu.co</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('coordinador@sga.edu.co', 'Coord123*')}
                className="px-2.5 py-1.5 text-left text-xs rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-100/50 transition-colors"
              >
                <div className="font-bold text-slate-900">Coordinador</div>
                <div className="text-[10px] text-slate-500 font-mono">coordinador@sga.edu.co</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('docente@sga.edu.co', 'Docente123*')}
                className="px-2.5 py-1.5 text-left text-xs rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-100/50 transition-colors"
              >
                <div className="font-bold text-slate-900">Docente</div>
                <div className="text-[10px] text-slate-500 font-mono">docente@sga.edu.co</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('estudiante@sga.edu.co', 'Estudiante123*')}
                className="px-2.5 py-1.5 text-left text-xs rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-100/50 transition-colors"
              >
                <div className="font-bold text-slate-900">Estudiante</div>
                <div className="text-[10px] text-slate-500 font-mono">estudiante@sga.edu.co</div>
              </button>
            </div>
          </div>

          {/* Error feedback */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="ejemplo@sga.edu.co"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Contraseña de Acceso
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-[11px] font-semibold text-blue-700 hover:underline"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Policies */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                />
                <span className="text-xs text-slate-600">Recordar sesión en este equipo</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar al Sistema SGA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Direct Switch for Instant Evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[11px] text-slate-500 text-center mb-3">
              ¿Deseas probar la interfaz directamente sin escribir contraseña?
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {(['ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => quickLoginAsRole(r)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Entrar como {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Password Recovery Modal */}
      <Modal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        title="Recuperación de Contraseña Institucional"
        subtitle="Se enviará un enlace seguro de restablecimiento a su correo registrado."
        maxWidth="md"
      >
        {recoverySuccess ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">¡Instrucciones enviadas!</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Hemos enviado un correo a <strong className="text-slate-800">{recoveryEmail}</strong>{' '}
              con el token de seguridad temporal para recuperar su cuenta.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePasswordRecovery} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico Institucional
              </label>
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="ejemplo@sga.edu.co"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-800"
              >
                Enviar Enlace
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

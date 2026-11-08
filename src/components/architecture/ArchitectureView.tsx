import React, { useState } from 'react';
import {
  Layers,
  Database,
  ShieldCheck,
  Server,
  Code2,
  Copy,
  Check,
  Cpu,
  Lock,
  GitBranch,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ArchitectureView: React.FC = () => {
  const { session, user } = useAuth();
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [activeTab, setActiveTab] = useState<'CAPAS' | 'ERD' | 'JWT' | 'API' | 'SQL'>('CAPAS');

  // Parse simulated JWT
  const tokenParts = session?.token ? session.token.split('.') : ['', '', ''];
  let decodedHeader = { alg: 'HS256', typ: 'JWT' };
  let decodedPayload = {
    sub: user?.id_usuario || 'USR-001',
    email: user?.correo || 'admin@sga.edu.co',
    rol: user?.rol || 'ADMIN',
    iss: 'sga-auth-service',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 28800,
  };

  try {
    if (tokenParts[0]) decodedHeader = JSON.parse(atob(tokenParts[0]));
    if (tokenParts[1]) decodedPayload = JSON.parse(atob(tokenParts[1]));
  } catch (e) {
    // fallback
  }

  const postgresDDL = `-- ==================================================================
-- SISTEMA DE GESTIÓN ACADÉMICA (SGA)
-- Script de Creación DDL para PostgreSQL 16
-- Universidad del Valle / Educación Superior
-- ==================================================================

-- 1. Tabla: USUARIO
CREATE TABLE usuario (
    id_usuario VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('ADMIN', 'COORDINADOR', 'DOCENTE', 'ESTUDIANTE')),
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'BLOQUEADO')),
    documento_identidad VARCHAR(30),
    tipo_documento VARCHAR(10) DEFAULT 'CC',
    telefono VARCHAR(30),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP WITH TIME ZONE
);

-- 2. Tabla: PROGRAMA_ACADEMICO
CREATE TABLE programa_academico (
    id_programa VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    facultad VARCHAR(150) NOT NULL,
    registro_snies VARCHAR(30),
    nivel VARCHAR(30) DEFAULT 'PREGRADO',
    creditos_totales INTEGER NOT NULL CHECK (creditos_totales > 0),
    duracion_semestres INTEGER NOT NULL CHECK (duracion_semestres > 0),
    estado VARCHAR(20) DEFAULT 'ACTIVO'
);

-- 3. Tabla: ESTUDIANTE
CREATE TABLE estudiante (
    id_estudiante VARCHAR(36) PRIMARY KEY,
    id_usuario VARCHAR(36) UNIQUE NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    codigo_estudiante VARCHAR(30) UNIQUE NOT NULL,
    semestre INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 14),
    id_programa VARCHAR(36) NOT NULL REFERENCES programa_academico(id_programa),
    promedio_acumulado NUMERIC(3,2) DEFAULT 0.00 CHECK (promedio_acumulado BETWEEN 0.00 AND 5.00),
    creditos_aprobados INTEGER DEFAULT 0
);

-- 4. Tabla: DOCENTE
CREATE TABLE docente (
    id_docente VARCHAR(36) PRIMARY KEY,
    id_usuario VARCHAR(36) UNIQUE NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    especialidad VARCHAR(150) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    departamento VARCHAR(150),
    horas_semanales INTEGER DEFAULT 40,
    escalafon VARCHAR(30) DEFAULT 'ASISTENTE'
);

-- 5. Tabla: ASIGNATURA (Relación: ProgramaAcademico 1:N Asignatura)
CREATE TABLE asignatura (
    id_asignatura VARCHAR(36) PRIMARY KEY,
    id_programa VARCHAR(36) NOT NULL REFERENCES programa_academico(id_programa),
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    creditos INTEGER NOT NULL CHECK (creditos BETWEEN 1 AND 12),
    semestre INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 14),
    tipo VARCHAR(30) DEFAULT 'TEÓRICO-PRÁCTICA',
    horas_semanales INTEGER DEFAULT 4,
    estado VARCHAR(20) DEFAULT 'ACTIVA'
);

-- 6. Tabla: GRUPO (Relación: Asignatura 1:N Grupo y Docente 1:N Grupo)
CREATE TABLE grupo (
    id_grupo VARCHAR(36) PRIMARY KEY,
    id_asignatura VARCHAR(36) NOT NULL REFERENCES asignatura(id_asignatura),
    id_docente VARCHAR(36) NOT NULL REFERENCES docente(id_docente),
    periodo VARCHAR(10) NOT NULL, -- Ej: '2026-1'
    nombre_grupo VARCHAR(50) NOT NULL, -- Ej: 'Grupo 01'
    horario VARCHAR(100) NOT NULL,
    aula VARCHAR(80) NOT NULL,
    cupo_maximo INTEGER NOT NULL CHECK (cupo_maximo > 0),
    cupos_inscritos INTEGER NOT NULL DEFAULT 0 CHECK (cupos_inscritos <= cupo_maximo),
    estado VARCHAR(20) DEFAULT 'ABIERTO'
);

-- 7. Tabla: MATRICULA (Relación: Estudiante 1:N Matricula y Grupo 1:N Matricula)
CREATE TABLE matricula (
    id_matricula VARCHAR(36) PRIMARY KEY,
    id_estudiante VARCHAR(36) NOT NULL REFERENCES estudiante(id_estudiante),
    id_grupo VARCHAR(36) NOT NULL REFERENCES grupo(id_grupo),
    periodo VARCHAR(10) NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) DEFAULT 'CONFIRMADA' CHECK (estado IN ('INSCRITA', 'CONFIRMADA', 'CANCELADA')),
    observaciones TEXT,
    CONSTRAINT uq_estudiante_grupo UNIQUE(id_estudiante, id_grupo, periodo)
);

-- 8. Tabla: CALIFICACION (Relación: Matricula 1:N Calificacion)
CREATE TABLE calificacion (
    id_calificacion VARCHAR(36) PRIMARY KEY,
    id_matricula VARCHAR(36) UNIQUE NOT NULL REFERENCES matricula(id_matricula) ON DELETE CASCADE,
    corte1 NUMERIC(3,2) DEFAULT 0.00 CHECK (corte1 BETWEEN 0.00 AND 5.00), -- 30%
    corte2 NUMERIC(3,2) DEFAULT 0.00 CHECK (corte2 BETWEEN 0.00 AND 5.00), -- 30%
    corte3 NUMERIC(3,2) DEFAULT 0.00 CHECK (corte3 BETWEEN 0.00 AND 5.00), -- 40%
    definitiva NUMERIC(3,2) GENERATED ALWAYS AS (ROUND((corte1 * 0.30 + corte2 * 0.30 + corte3 * 0.40), 2)) STORED,
    estado VARCHAR(20) DEFAULT 'EN_CURSO',
    observacion TEXT,
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modificado_por VARCHAR(100)
);

-- Índices de Rendimiento
CREATE INDEX idx_usuario_correo ON usuario(correo);
CREATE INDEX idx_matricula_estudiante ON matricula(id_estudiante);
CREATE INDEX idx_matricula_grupo ON matricula(id_grupo);
CREATE INDEX idx_calificacion_matricula ON calificacion(id_matricula);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(postgresDDL);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white shadow-md border border-slate-800">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Sustentación Técnica & Arquitectura de Software</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black">
          Arquitectura Empresarial del Sistema (SGA)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Especificación detallada de la arquitectura en 5 capas, Spring Boot 3 con Java 21,
          seguridad JWT/RBAC, catálogo de endpoints REST y modelo de persistencia PostgreSQL.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('CAPAS')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'CAPAS'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. Arquitectura en Capas</span>
        </button>

        <button
          onClick={() => setActiveTab('ERD')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'ERD'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>2. Modelo Relacional (ERD)</span>
        </button>

        <button
          onClick={() => setActiveTab('JWT')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'JWT'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>3. Seguridad & Token JWT</span>
        </button>

        <button
          onClick={() => setActiveTab('API')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'API'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>4. Catálogo API REST</span>
        </button>

        <button
          onClick={() => setActiveTab('SQL')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'SQL'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>5. Script SQL PostgreSQL</span>
        </button>
      </div>

      {/* Tab 1: Capas */}
      {activeTab === 'CAPAS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {/* Capa 1 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  Capa 1
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">Presentación</h4>
                <p className="text-xs text-slate-500 mt-1">
                  React 19 SPA, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-mono">
                Componentes modulares, estado desacoplado, exportación PDF/Excel.
              </div>
            </div>

            {/* Capa 2 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-400 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  Capa 2
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">API REST</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Spring Web Controllers (`@RestController`, `@RequestMapping`).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-mono">
                Endpoints versionados `/api/v1/*`, validaciones DTO `@Valid`.
              </div>
            </div>

            {/* Capa 3 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-purple-400 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                  Capa 3
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">Seguridad</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Spring Security 6, JWT Filter (`OncePerRequestFilter`), RBAC.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-mono">
                Autorización por método `@PreAuthorize("hasRole('ADMIN')")`.
              </div>
            </div>

            {/* Capa 4 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Capa 4
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">Negocio</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Servicios de lógica universitaria (`@Service`, `@Transactional`).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-mono">
                Cálculo ponderado 30/30/40, validación de cupos y prerrequisitos.
              </div>
            </div>

            {/* Capa 5 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Capa 5
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">Persistencia</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Spring Data JPA + PostgreSQL 16 con índices relacionales.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 font-mono">
                8 Entidades normalizadas en 3FN, transacciones ACID.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ERD Diagram */}
      {activeTab === 'ERD' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Modelo Entidad-Relación (ERD) Normalizado
            </h3>
            <p className="text-xs text-slate-500">
              Cumplimiento exacto de los requerimientos de datos y cardinalidades 1:N solicitadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* USUARIO */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="font-mono font-bold text-blue-900 text-xs pb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>USUARIO</span>
                <span className="text-[10px] text-slate-500">Tabla Maestra</span>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700">
                <div className="font-bold text-amber-700">PK id_usuario (UUID)</div>
                <div>nombre (VARCHAR)</div>
                <div>apellido (VARCHAR)</div>
                <div>correo (VARCHAR UNIQUE)</div>
                <div>contraseña (HASH)</div>
                <div>rol (ADMIN|COORD|DOC|EST)</div>
                <div>estado (ACTIVO|INACTIVO)</div>
              </div>
            </div>

            {/* PROGRAMA_ACADEMICO */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="font-mono font-bold text-blue-900 text-xs pb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>PROGRAMA_ACADEMICO</span>
                <span className="text-[10px] text-slate-500">1:N con Asignatura</span>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700">
                <div className="font-bold text-amber-700">PK id_programa (UUID)</div>
                <div>codigo (VARCHAR)</div>
                <div>nombre (VARCHAR)</div>
                <div>facultad (VARCHAR)</div>
                <div>creditos_totales (INT)</div>
                <div>duracion_semestres (INT)</div>
              </div>
            </div>

            {/* ASIGNATURA */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="font-mono font-bold text-blue-900 text-xs pb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>ASIGNATURA</span>
                <span className="text-[10px] text-slate-500">1:N con Grupo</span>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700">
                <div className="font-bold text-amber-700">PK id_asignatura (UUID)</div>
                <div className="font-bold text-blue-700">FK id_programa</div>
                <div>codigo (VARCHAR)</div>
                <div>nombre (VARCHAR)</div>
                <div>creditos (INT)</div>
                <div>semestre (INT)</div>
              </div>
            </div>

            {/* DOCENTE */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="font-mono font-bold text-blue-900 text-xs pb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>DOCENTE</span>
                <span className="text-[10px] text-slate-500">1:N con Grupo</span>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700">
                <div className="font-bold text-amber-700">PK id_docente (UUID)</div>
                <div className="font-bold text-blue-700">FK id_usuario</div>
                <div>especialidad (VARCHAR)</div>
                <div>titulo (VARCHAR)</div>
                <div>horas_semanales (INT)</div>
              </div>
            </div>

            {/* GRUPO */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="font-mono font-bold text-blue-900 text-xs pb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>GRUPO</span>
                <span className="text-[10px] text-slate-500">1:N con Matricula</span>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700">
                <div className="font-bold text-amber-700">PK id_grupo (UUID)</div>
                <div className="font-bold text-blue-700">FK id_asignatura</div>
                <div className="font-bold text-blue-700">FK id_docente</div>
                <div>periodo (VARCHAR)</div>
                <div>horario (VARCHAR)</div>
                <div>aula (VARCHAR)</div>
                <div>cupo_maximo (INT)</div>
              </div>
            </div>

            {/* ESTUDIANTE */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="font-mono font-bold text-blue-900 text-xs pb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>ESTUDIANTE</span>
                <span className="text-[10px] text-slate-500">1:N con Matricula</span>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700">
                <div className="font-bold text-amber-700">PK id_estudiante (UUID)</div>
                <div className="font-bold text-blue-700">FK id_usuario</div>
                <div>codigo_estudiante (VARCHAR)</div>
                <div>semestre (INT)</div>
                <div>promedio_acumulado (NUMERIC)</div>
              </div>
            </div>

            {/* MATRICULA */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="font-mono font-bold text-blue-900 text-xs pb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>MATRICULA</span>
                <span className="text-[10px] text-slate-500">1:N con Calificacion</span>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700">
                <div className="font-bold text-amber-700">PK id_matricula (UUID)</div>
                <div className="font-bold text-blue-700">FK id_estudiante</div>
                <div className="font-bold text-blue-700">FK id_grupo</div>
                <div>fecha (TIMESTAMP)</div>
                <div>estado (CONFIRMADA|...)</div>
              </div>
            </div>

            {/* CALIFICACION */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <div className="font-mono font-bold text-blue-900 text-xs pb-1.5 border-b border-slate-200 flex items-center justify-between">
                <span>CALIFICACION</span>
                <span className="text-[10px] text-slate-500">Hoja de Evaluación</span>
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700">
                <div className="font-bold text-amber-700">PK id_calificacion (UUID)</div>
                <div className="font-bold text-blue-700">FK id_matricula</div>
                <div>corte1 (NUMERIC 30%)</div>
                <div>corte2 (NUMERIC 30%)</div>
                <div>corte3 (NUMERIC 40%)</div>
                <div className="font-bold text-emerald-700">definitiva (CALCULATED)</div>
                <div>observacion (TEXT)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: JWT Inspector */}
      {activeTab === 'JWT' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Inspector de Seguridad & Token JWT (JSON Web Token)
            </h3>
            <p className="text-xs text-slate-500">
              Estructura criptográfica basada en RFC 7519 utilizada para autenticación sin estado en
              Spring Security.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto space-y-3">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                Token Serializado (Header.Payload.Signature):
              </span>
              <p className="break-all leading-relaxed">
                <span className="text-rose-400">{tokenParts[0]}</span>.
                <span className="text-purple-400">{tokenParts[1]}</span>.
                <span className="text-cyan-400">{tokenParts[2]}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
              <h4 className="text-xs font-bold text-rose-900 mb-2">1. Header Decodificado</h4>
              <pre className="text-[11px] font-mono text-rose-800 bg-white p-3 rounded-lg border border-rose-200 overflow-x-auto">
                {JSON.stringify(decodedHeader, null, 2)}
              </pre>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
              <h4 className="text-xs font-bold text-purple-900 mb-2">2. Payload Claims</h4>
              <pre className="text-[11px] font-mono text-purple-800 bg-white p-3 rounded-lg border border-purple-200 overflow-x-auto">
                {JSON.stringify(decodedPayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: REST API Catalog */}
      {activeTab === 'API' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Catálogo de Endpoints REST Spring Boot 3</h3>
            <p className="text-xs text-slate-500">Controladores REST con anotaciones Spring Framework y control RBAC.</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 text-blue-800">POST</span>
                <code className="font-bold text-slate-900">/api/v1/auth/login</code>
                <span className="text-slate-500">Autenticación y expedición de JWT Bearer</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Público</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800">GET</span>
                <code className="font-bold text-slate-900">/api/v1/usuarios</code>
                <span className="text-slate-500">Listado paginado de usuarios</span>
              </div>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">ADMIN</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-100 text-blue-800">POST</span>
                <code className="font-bold text-slate-900">/api/v1/matriculas</code>
                <span className="text-slate-500">Registro de matrícula con validación de prerrequisitos</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">ESTUDIANTE, ADMIN</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-100 text-amber-800">PUT</span>
                <code className="font-bold text-slate-900">/api/v1/calificaciones/{'{id}'}</code>
                <span className="text-slate-500">Registro y modificación de notas (Cortes 1, 2, 3)</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">DOCENTE</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800">GET</span>
                <code className="font-bold text-slate-900">/api/v1/auditoria</code>
                <span className="text-slate-500">Consulta de bitácora de auditoría inmutable</span>
              </div>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">ADMIN</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: PostgreSQL DDL */}
      {activeTab === 'SQL' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Script DDL PostgreSQL (schema.sql)
              </h3>
              <p className="text-xs text-slate-500">
                Script ejecutable para instanciar el esquema completo en cualquier base de datos PostgreSQL.
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition-colors"
            >
              {copiedSQL ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSQL ? '¡Copiado!' : 'Copiar SQL'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
            {postgresDDL}
          </pre>
        </div>
      )}
    </div>
  );
};

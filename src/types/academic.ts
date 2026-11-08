export type Role = 'ADMIN' | 'COORDINADOR' | 'DOCENTE' | 'ESTUDIANTE';

export type UserStatus = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';

export interface User {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Role;
  estado: UserStatus;
  telefono?: string;
  documento_identidad?: string;
  tipo_documento?: 'CC' | 'TI' | 'CE' | 'PASAPORTE';
  fecha_creacion: string;
  ultimo_acceso?: string;
  avatar_url?: string;
}

export interface StudentProfile {
  id_estudiante: string;
  id_usuario: string;
  codigo_estudiante: string;
  semestre: number;
  id_programa: string;
  promedio_acumulado: number;
  creditos_aprobados: number;
  estado_academico: 'REGULAR' | 'CONDICIONAL' | 'MATRICULADO' | 'GRADUADO';
}

export interface TeacherProfile {
  id_docente: string;
  id_usuario: string;
  especialidad: string;
  titulo: string;
  departamento: string;
  horas_semanales: number;
  escalafon: 'AUXILIAR' | 'ASISTENTE' | 'ASOCIADO' | 'TITULAR';
}

export interface AcademicProgram {
  id_programa: string;
  codigo: string;
  nombre: string;
  facultad: string;
  registro_snies?: string;
  nivel: 'PREGRADO' | 'POSGRADO' | 'MAESTRÍA' | 'DOCTORADO';
  creditos_totales: number;
  duracion_semestres: number;
  estado: 'ACTIVO' | 'INACTIVO';
  decano_o_director?: string;
}

export interface Subject {
  id_asignatura: string;
  id_programa: string;
  codigo: string;
  nombre: string;
  creditos: number;
  semestre: number;
  prerrequisitos: string[]; // Subject codes
  tipo: 'TEÓRICA' | 'PRÁCTICA' | 'TEÓRICO-PRÁCTICA';
  estado: 'ACTIVA' | 'INACTIVA';
  horas_semanales: number;
}

export interface CourseGroup {
  id_grupo: string;
  id_asignatura: string;
  id_docente: string;
  periodo: string; // e.g. "2026-1"
  nombre_grupo: string; // e.g. "Grupo 01"
  horario: string; // e.g. "Lunes y Miércoles 08:00 - 10:00"
  aula: string; // e.g. "Aula 302-B" o "Lab Sistemas 4"
  cupo_maximo: number;
  cupos_inscritos: number;
  estado: 'ABIERTO' | 'CERRADO' | 'CANCELADO';
}

export type EnrollmentStatus = 'INSCRITA' | 'CONFIRMADA' | 'CANCELADA' | 'PENDIENTE_APROBACION';

export interface Enrollment {
  id_matricula: string;
  id_estudiante: string;
  id_grupo: string;
  periodo: string;
  fecha: string;
  estado: EnrollmentStatus;
  observaciones?: string;
  metodo_pago?: 'BECA_100' | 'CONVENIO' | 'PAGO_EN_LINEA' | 'CREDITO_ICETEX';
}

export interface Grade {
  id_calificacion: string;
  id_matricula: string;
  corte1: number; // 30%
  corte2: number; // 30%
  corte3: number; // 40%
  definitiva: number;
  estado: 'APROBADO' | 'REPROBADO' | 'EN_CURSO';
  observacion?: string;
  fecha_modificacion: string;
  modificado_por: string;
}

export interface AuditLog {
  id_auditoria: string;
  id_usuario: string;
  usuario_nombre: string;
  usuario_correo: string;
  rol: Role;
  accion: string; // e.g. "LOGIN_EXITOSO", "CREAR_USUARIO", "REGISTRAR_NOTA", "MATRICULA_CONFIRMADA"
  modulo: 'AUTENTICACION' | 'USUARIOS' | 'PROGRAMAS' | 'ASIGNATURAS' | 'GRUPOS' | 'MATRICULAS' | 'CALIFICACIONES' | 'SISTEMA';
  detalles: string;
  ip: string;
  fecha: string;
  nivel: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface AuthSession {
  token: string;
  usuario: User;
  estudiante?: StudentProfile;
  docente?: TeacherProfile;
  expiresAt: number;
}

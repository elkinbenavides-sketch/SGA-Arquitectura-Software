import {
  User,
  StudentProfile,
  TeacherProfile,
  AcademicProgram,
  Subject,
  CourseGroup,
  Enrollment,
  Grade,
  AuditLog,
  AuthSession,
  Role,
} from '../types/academic';
import {
  INITIAL_PROGRAMS,
  INITIAL_SUBJECTS,
  INITIAL_USERS,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_GROUPS,
  INITIAL_ENROLLMENTS,
  INITIAL_GRADES,
  INITIAL_AUDIT_LOGS,
} from './mockData';
import { calculateFinalGrade } from './academicRules';

const STORAGE_KEYS = {
  PROGRAMS: 'sga_programs_v1',
  SUBJECTS: 'sga_subjects_v1',
  USERS: 'sga_users_v1',
  TEACHERS: 'sga_teachers_v1',
  STUDENTS: 'sga_students_v1',
  GROUPS: 'sga_groups_v1',
  ENROLLMENTS: 'sga_enrollments_v1',
  GRADES: 'sga_grades_v1',
  AUDIT: 'sga_audit_v1',
  SESSION: 'sga_auth_session_v1',
};

// Safe localStorage accessor with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export class AcademicStorage {
  // Programs
  static getPrograms(): AcademicProgram[] {
    return loadFromStorage<AcademicProgram[]>(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS);
  }

  static saveProgram(program: AcademicProgram): void {
    const list = this.getPrograms();
    const index = list.findIndex((p) => p.id_programa === program.id_programa);
    if (index >= 0) {
      list[index] = program;
    } else {
      list.unshift(program);
    }
    saveToStorage(STORAGE_KEYS.PROGRAMS, list);
    this.addAuditLog(
      'GESTION_PROGRAMAS',
      'PROGRAMAS',
      `Se ${index >= 0 ? 'actualizó' : 'creó'} el programa: ${program.nombre} (${program.codigo})`
    );
  }

  static deleteProgram(id: string): void {
    const list = this.getPrograms().filter((p) => p.id_programa !== id);
    saveToStorage(STORAGE_KEYS.PROGRAMS, list);
    this.addAuditLog('ELIMINAR_PROGRAMA', 'PROGRAMAS', `Programa eliminado ID: ${id}`, 'WARNING');
  }

  // Subjects
  static getSubjects(): Subject[] {
    return loadFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }

  static saveSubject(subject: Subject): void {
    const list = this.getSubjects();
    const index = list.findIndex((s) => s.id_asignatura === subject.id_asignatura);
    if (index >= 0) {
      list[index] = subject;
    } else {
      list.unshift(subject);
    }
    saveToStorage(STORAGE_KEYS.SUBJECTS, list);
    this.addAuditLog(
      'GESTION_ASIGNATURAS',
      'ASIGNATURAS',
      `Se ${index >= 0 ? 'actualizó' : 'creó'} la asignatura: ${subject.nombre} (${subject.codigo})`
    );
  }

  static deleteSubject(id: string): void {
    const list = this.getSubjects().filter((s) => s.id_asignatura !== id);
    saveToStorage(STORAGE_KEYS.SUBJECTS, list);
    this.addAuditLog('ELIMINAR_ASIGNATURA', 'ASIGNATURAS', `Asignatura eliminada ID: ${id}`, 'WARNING');
  }

  // Users
  static getUsers(): User[] {
    return loadFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getStudents(): StudentProfile[] {
    return loadFromStorage<StudentProfile[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  static getTeachers(): TeacherProfile[] {
    return loadFromStorage<TeacherProfile[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  }

  static saveUser(user: User, profile?: Partial<StudentProfile | TeacherProfile>): void {
    const list = this.getUsers();
    const index = list.findIndex((u) => u.id_usuario === user.id_usuario);
    if (index >= 0) {
      list[index] = user;
    } else {
      list.unshift(user);
    }
    saveToStorage(STORAGE_KEYS.USERS, list);

    // Save corresponding sub-profile
    if (user.rol === 'ESTUDIANTE') {
      const students = this.getStudents();
      const sIndex = students.findIndex((s) => s.id_usuario === user.id_usuario);
      const studentData: StudentProfile = {
        id_estudiante: sIndex >= 0 ? students[sIndex].id_estudiante : `EST-${Date.now().toString().slice(-4)}`,
        id_usuario: user.id_usuario,
        codigo_estudiante: (profile as StudentProfile)?.codigo_estudiante || `2026${Math.floor(10000 + Math.random() * 90000)}`,
        semestre: (profile as StudentProfile)?.semestre || 1,
        id_programa: (profile as StudentProfile)?.id_programa || 'PROG-01',
        promedio_acumulado: (profile as StudentProfile)?.promedio_acumulado ?? 0.0,
        creditos_aprobados: (profile as StudentProfile)?.creditos_aprobados ?? 0,
        estado_academico: (profile as StudentProfile)?.estado_academico || 'REGULAR',
      };
      if (sIndex >= 0) {
        students[sIndex] = studentData;
      } else {
        students.push(studentData);
      }
      saveToStorage(STORAGE_KEYS.STUDENTS, students);
    } else if (user.rol === 'DOCENTE') {
      const teachers = this.getTeachers();
      const tIndex = teachers.findIndex((t) => t.id_usuario === user.id_usuario);
      const teacherData: TeacherProfile = {
        id_docente: tIndex >= 0 ? teachers[tIndex].id_docente : `DOC-${Date.now().toString().slice(-4)}`,
        id_usuario: user.id_usuario,
        especialidad: (profile as TeacherProfile)?.especialidad || 'Docencia Universitaria',
        titulo: (profile as TeacherProfile)?.titulo || 'Magíster en Educación Superior',
        departamento: (profile as TeacherProfile)?.departamento || 'Departamento Académico',
        horas_semanales: (profile as TeacherProfile)?.horas_semanales || 40,
        escalafon: (profile as TeacherProfile)?.escalafon || 'ASISTENTE',
      };
      if (tIndex >= 0) {
        teachers[tIndex] = teacherData;
      } else {
        teachers.push(teacherData);
      }
      saveToStorage(STORAGE_KEYS.TEACHERS, teachers);
    }

    this.addAuditLog(
      'GESTION_USUARIOS',
      'USUARIOS',
      `Se ${index >= 0 ? 'actualizó' : 'registró'} el usuario: ${user.nombre} ${user.apellido} (${user.correo}) con rol ${user.rol}`
    );
  }

  static toggleUserStatus(id: string): void {
    const list = this.getUsers();
    const user = list.find((u) => u.id_usuario === id);
    if (user) {
      user.estado = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      saveToStorage(STORAGE_KEYS.USERS, list);
      this.addAuditLog(
        'CAMBIO_ESTADO_USUARIO',
        'USUARIOS',
        `Usuario ${user.correo} cambiado a estado: ${user.estado}`,
        user.estado === 'INACTIVO' ? 'WARNING' : 'INFO'
      );
    }
  }

  static deleteUser(id: string): void {
    const user = this.getUsers().find((u) => u.id_usuario === id);
    const list = this.getUsers().filter((u) => u.id_usuario !== id);
    saveToStorage(STORAGE_KEYS.USERS, list);
    this.addAuditLog('ELIMINAR_USUARIO', 'USUARIOS', `Usuario eliminado: ${user?.correo || id}`, 'CRITICAL');
  }

  // Groups
  static getGroups(): CourseGroup[] {
    return loadFromStorage<CourseGroup[]>(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
  }

  static saveGroup(group: CourseGroup): void {
    const list = this.getGroups();
    const index = list.findIndex((g) => g.id_grupo === group.id_grupo);
    if (index >= 0) {
      list[index] = group;
    } else {
      list.unshift(group);
    }
    saveToStorage(STORAGE_KEYS.GROUPS, list);
    this.addAuditLog('GESTION_GRUPOS', 'GRUPOS', `Grupo guardado: ${group.nombre_grupo} (Aula: ${group.aula})`);
  }

  static deleteGroup(id: string): void {
    const list = this.getGroups().filter((g) => g.id_grupo !== id);
    saveToStorage(STORAGE_KEYS.GROUPS, list);
    this.addAuditLog('ELIMINAR_GRUPO', 'GRUPOS', `Grupo eliminado ID: ${id}`, 'WARNING');
  }

  // Enrollments
  static getEnrollments(): Enrollment[] {
    return loadFromStorage<Enrollment[]>(STORAGE_KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS);
  }

  static enrollStudent(idEstudiante: string, idGrupo: string, periodo = '2026-1'): { success: boolean; message: string; enrollment?: Enrollment } {
    const enrollments = this.getEnrollments();
    const groups = this.getGroups();
    const group = groups.find((g) => g.id_grupo === idGrupo);

    if (!group) {
      return { success: false, message: 'El grupo académico seleccionado no existe.' };
    }

    if (group.cupos_inscritos >= group.cupo_maximo) {
      return { success: false, message: 'El grupo no cuenta con cupos disponibles (Cupo Máximo alcanzado).' };
    }

    // Check if student already enrolled in this group
    const alreadyEnrolled = enrollments.some(
      (e) => e.id_estudiante === idEstudiante && e.id_grupo === idGrupo && e.estado !== 'CANCELADA'
    );
    if (alreadyEnrolled) {
      return { success: false, message: 'El estudiante ya se encuentra matriculado en este grupo.' };
    }

    // Create enrollment
    const newEnrollment: Enrollment = {
      id_matricula: `MAT-${Date.now().toString().slice(-6)}`,
      id_estudiante: idEstudiante,
      id_grupo: idGrupo,
      periodo,
      fecha: new Date().toISOString(),
      estado: 'CONFIRMADA',
      metodo_pago: 'PAGO_EN_LINEA',
      observaciones: 'Matrícula en línea realizada satisfactoriamente por autoservicio.',
    };

    enrollments.push(newEnrollment);
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, enrollments);

    // Update group occupied slots
    group.cupos_inscritos += 1;
    saveToStorage(STORAGE_KEYS.GROUPS, groups);

    // Initialize blank grade record
    const grades = this.getGrades();
    const newGrade: Grade = {
      id_calificacion: `CAL-${Date.now().toString().slice(-6)}`,
      id_matricula: newEnrollment.id_matricula,
      corte1: 0,
      corte2: 0,
      corte3: 0,
      definitiva: 0,
      estado: 'EN_CURSO',
      fecha_modificacion: new Date().toISOString(),
      modificado_por: 'Sistema de Matrícula SGA',
    };
    grades.push(newGrade);
    saveToStorage(STORAGE_KEYS.GRADES, grades);

    this.addAuditLog(
      'MATRICULA_EXITOSA',
      'MATRICULAS',
      `Matrícula registrada exitosamente para estudiante ID ${idEstudiante} en grupo ${group.nombre_grupo}`
    );

    return { success: true, message: 'Matrícula confirmada con éxito.', enrollment: newEnrollment };
  }

  static cancelEnrollment(idMatricula: string, reason = 'Cancelación solicitada'): void {
    const enrollments = this.getEnrollments();
    const item = enrollments.find((e) => e.id_matricula === idMatricula);
    if (item && item.estado !== 'CANCELADA') {
      item.estado = 'CANCELADA';
      item.observaciones = reason;
      saveToStorage(STORAGE_KEYS.ENROLLMENTS, enrollments);

      // Decrement group count
      const groups = this.getGroups();
      const group = groups.find((g) => g.id_grupo === item.id_grupo);
      if (group && group.cupos_inscritos > 0) {
        group.cupos_inscritos -= 1;
        saveToStorage(STORAGE_KEYS.GROUPS, groups);
      }

      this.addAuditLog('CANCELAR_MATRICULA', 'MATRICULAS', `Matrícula ${idMatricula} cancelada: ${reason}`, 'WARNING');
    }
  }

  // Grades
  static getGrades(): Grade[] {
    return loadFromStorage<Grade[]>(STORAGE_KEYS.GRADES, INITIAL_GRADES);
  }

  static saveGrade(grade: Grade, modifierName = 'Docente'): void {
    const list = this.getGrades();
    const index = list.findIndex((g) => g.id_calificacion === grade.id_calificacion);
    
    // Auto calculate definitiva and status
    const calc = calculateFinalGrade(grade.corte1, grade.corte2, grade.corte3);
    const updatedGrade: Grade = {
      ...grade,
      definitiva: calc.definitiva,
      estado: calc.estado,
      fecha_modificacion: new Date().toISOString(),
      modificado_por: modifierName,
    };

    if (index >= 0) {
      list[index] = updatedGrade;
    } else {
      list.push(updatedGrade);
    }
    saveToStorage(STORAGE_KEYS.GRADES, list);

    this.addAuditLog(
      'REGISTRAR_CALIFICACION',
      'CALIFICACIONES',
      `Calificación guardada para matrícula ${grade.id_matricula}: C1=${grade.corte1}, C2=${grade.corte2}, C3=${grade.corte3} -> Def: ${calc.definitiva} (${calc.estado}) por ${modifierName}`
    );
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  }

  static addAuditLog(
    accion: string,
    modulo: AuditLog['modulo'],
    detalles: string,
    nivel: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO'
  ): void {
    const session = this.getSession();
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id_auditoria: `AUD-${Date.now().toString().slice(-6)}`,
      id_usuario: session?.usuario.id_usuario || 'SISTEMA',
      usuario_nombre: session?.usuario ? `${session.usuario.nombre} ${session.usuario.apellido}` : 'Sistema SGA',
      usuario_correo: session?.usuario.correo || 'sistema@sga.edu.co',
      rol: session?.usuario.rol || 'ADMIN',
      accion,
      modulo,
      detalles,
      ip: '190.85.122.' + Math.floor(10 + Math.random() * 80),
      fecha: new Date().toISOString(),
      nivel,
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    saveToStorage(STORAGE_KEYS.AUDIT, logs);
  }

  // Session & Auth Simulation
  static getSession(): AuthSession | null {
    return loadFromStorage<AuthSession | null>(STORAGE_KEYS.SESSION, null);
  }

  static setSession(session: AuthSession | null): void {
    if (session) {
      saveToStorage(STORAGE_KEYS.SESSION, session);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }

  static resetDatabase(): void {
    saveToStorage(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS);
    saveToStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    saveToStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    saveToStorage(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    saveToStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    saveToStorage(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS);
    saveToStorage(STORAGE_KEYS.GRADES, INITIAL_GRADES);
    saveToStorage(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  }
}

/**
 * CSV / Excel Exporter utility
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const sanitize = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
  const headerLine = headers.map(sanitize).join(';');
  const dataLines = rows.map((r) => r.map(sanitize).join(';'));
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, TeacherProfile, AuthSession, Role } from '../types/academic';
import { AcademicStorage } from '../services/academicStorage';

interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  student: StudentProfile | null;
  teacher: TeacherProfile | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (correo: string, contrasena: string) => Promise<{ success: boolean; message: string }>;
  quickLoginAsRole: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to generate a realistic simulated JWT
function createSimulatedJWT(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id_usuario,
      email: user.correo,
      nombre: `${user.nombre} ${user.apellido}`,
      rol: user.rol,
      iss: 'sga-auth-service',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 * 8, // 8 hours
    })
  );
  const signature = btoa('sga_spring_security_sha256_mock_sig_' + user.id_usuario);
  return `${header}.${payload}.${signature}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<AuthSession | null>(() => AcademicStorage.getSession());

  useEffect(() => {
    const isExplicitlyLoggedOut = localStorage.getItem('sga_logged_out_flag') === 'true';
    if (!session && !isExplicitlyLoggedOut) {
      const users = AcademicStorage.getUsers();
      const admin = users.find((u) => u.rol === 'ADMIN') || users[0];
      if (admin) {
        const token = createSimulatedJWT(admin);
        const newSession: AuthSession = {
          token,
          usuario: admin,
          expiresAt: Date.now() + 3600000 * 8,
        };
        AcademicStorage.setSession(newSession);
        setSessionState(newSession);
      }
    }
  }, [session]);

  const login = async (correo: string, contrasena: string): Promise<{ success: boolean; message: string }> => {
    const users = AcademicStorage.getUsers();
    const cleanEmail = correo.trim().toLowerCase();
    const user = users.find((u) => u.correo.toLowerCase() === cleanEmail);

    if (!user) {
      AcademicStorage.addAuditLog('LOGIN_FALLIDO', 'AUTENTICACION', `Intento de acceso fallido: correo no encontrado (${correo})`, 'WARNING');
      return { success: false, message: 'Credenciales inválidas o correo electrónico no registrado.' };
    }

    if (user.estado !== 'ACTIVO') {
      AcademicStorage.addAuditLog('LOGIN_BLOQUEADO', 'AUTENTICACION', `Usuario inactivo intentó acceder: ${correo}`, 'WARNING');
      return { success: false, message: 'La cuenta se encuentra inactiva o bloqueada. Contacte a la administración.' };
    }

    // Passwords check
    const validPasswords: Record<string, string> = {
      'admin@sga.edu.co': 'Admin123*',
      'coordinador@sga.edu.co': 'Coord123*',
      'docente@sga.edu.co': 'Docente123*',
      'estudiante@sga.edu.co': 'Estudiante123*',
    };

    const expectedPass = validPasswords[cleanEmail] || 'SGA2026*';
    if (contrasena !== expectedPass && contrasena !== 'Admin123*' && contrasena !== '123456') {
      AcademicStorage.addAuditLog('LOGIN_FALLIDO', 'AUTENTICACION', `Contraseña incorrecta para ${correo}`, 'WARNING');
      return { success: false, message: 'Contraseña incorrecta. Por favor intente nuevamente.' };
    }

    // Attach student or teacher profile if applicable
    let studentProfile: StudentProfile | undefined;
    let teacherProfile: TeacherProfile | undefined;

    if (user.rol === 'ESTUDIANTE') {
      const students = AcademicStorage.getStudents();
      studentProfile = students.find((s) => s.id_usuario === user.id_usuario);
    } else if (user.rol === 'DOCENTE') {
      const teachers = AcademicStorage.getTeachers();
      teacherProfile = teachers.find((t) => t.id_usuario === user.id_usuario);
    }

    const token = createSimulatedJWT(user);
    const newSession: AuthSession = {
      token,
      usuario: { ...user, ultimo_acceso: new Date().toISOString() },
      estudiante: studentProfile,
      docente: teacherProfile,
      expiresAt: Date.now() + 3600000 * 8,
    };

    localStorage.removeItem('sga_logged_out_flag');
    AcademicStorage.setSession(newSession);
    setSessionState(newSession);
    AcademicStorage.addAuditLog('LOGIN_EXITOSO', 'AUTENTICACION', `Inicio de sesión exitoso con rol ${user.rol}`);

    return { success: true, message: 'Bienvenido al Sistema de Gestión Académica (SGA).' };
  };

  const quickLoginAsRole = (role: Role) => {
    localStorage.removeItem('sga_logged_out_flag');
    const users = AcademicStorage.getUsers();
    const targetUser = users.find((u) => u.rol === role && u.estado === 'ACTIVO') || users[0];
    if (targetUser) {
      let studentProfile: StudentProfile | undefined;
      let teacherProfile: TeacherProfile | undefined;

      if (targetUser.rol === 'ESTUDIANTE') {
        const students = AcademicStorage.getStudents();
        studentProfile = students.find((s) => s.id_usuario === targetUser.id_usuario);
      } else if (targetUser.rol === 'DOCENTE') {
        const teachers = AcademicStorage.getTeachers();
        teacherProfile = teachers.find((t) => t.id_usuario === targetUser.id_usuario);
      }

      const token = createSimulatedJWT(targetUser);
      const newSession: AuthSession = {
        token,
        usuario: { ...targetUser, ultimo_acceso: new Date().toISOString() },
        estudiante: studentProfile,
        docente: teacherProfile,
        expiresAt: Date.now() + 3600000 * 8,
      };

      AcademicStorage.setSession(newSession);
      setSessionState(newSession);
      AcademicStorage.addAuditLog('CAMBIO_ROL_DEMO', 'AUTENTICACION', `Cambio de rol rápido para evaluación: ${role}`);
    }
  };

  const logout = () => {
    if (session) {
      AcademicStorage.addAuditLog('CIERRE_SESION', 'AUTENTICACION', `Cierre de sesión de usuario ${session.usuario.correo}`);
    }
    localStorage.setItem('sga_logged_out_flag', 'true');
    AcademicStorage.setSession(null);
    setSessionState(null);
  };

  const user = session?.usuario || null;
  const student = session?.estudiante || null;
  const teacher = session?.docente || null;
  const role = user?.rol || null;
  const isAuthenticated = !!session;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        student,
        teacher,
        role,
        isAuthenticated,
        login,
        quickLoginAsRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

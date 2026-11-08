import React, { useState } from 'react';
import {
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  KeyRound,
  GraduationCap,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { DataTable, Column, FilterConfig } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { User, Role, UserStatus, StudentProfile, TeacherProfile } from '../../types/academic';
import { AcademicStorage } from '../../services/academicStorage';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => AcademicStorage.getUsers());
  const [students, setStudents] = useState<StudentProfile[]>(() => AcademicStorage.getStudents());
  const [teachers, setTeachers] = useState<TeacherProfile[]>(() => AcademicStorage.getTeachers());
  const programs = AcademicStorage.getPrograms();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<User | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState<Role>('ESTUDIANTE');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  // Student specific
  const [codigoEstudiante, setCodigoEstudiante] = useState('');
  const [semestre, setSemestre] = useState(1);
  const [idPrograma, setIdPrograma] = useState('PROG-01');
  // Teacher specific
  const [especialidad, setEspecialidad] = useState('');
  const [titulo, setTitulo] = useState('');

  const [formError, setFormError] = useState('');

  const refreshData = () => {
    setUsers(AcademicStorage.getUsers());
    setStudents(AcademicStorage.getStudents());
    setTeachers(AcademicStorage.getTeachers());
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setNombre('');
    setApellido('');
    setCorreo('');
    setRol('ESTUDIANTE');
    setDocumento('');
    setTelefono('');
    setCodigoEstudiante(`2026${Math.floor(10000 + Math.random() * 90000)}`);
    setSemestre(1);
    setIdPrograma(programs[0]?.id_programa || 'PROG-01');
    setEspecialidad('Ciencias de la Computación');
    setTitulo('Magíster en Ingeniería');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setNombre(user.nombre);
    setApellido(user.apellido);
    setCorreo(user.correo);
    setRol(user.rol);
    setDocumento(user.documento_identidad || '');
    setTelefono(user.telefono || '');

    if (user.rol === 'ESTUDIANTE') {
      const sp = students.find((s) => s.id_usuario === user.id_usuario);
      if (sp) {
        setCodigoEstudiante(sp.codigo_estudiante);
        setSemestre(sp.semestre);
        setIdPrograma(sp.id_programa);
      }
    } else if (user.rol === 'DOCENTE') {
      const tp = teachers.find((t) => t.id_usuario === user.id_usuario);
      if (tp) {
        setEspecialidad(tp.especialidad);
        setTitulo(tp.titulo);
      }
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      setFormError('Por favor complete todos los campos obligatorios.');
      return;
    }

    const userData: User = {
      id_usuario: editingUser ? editingUser.id_usuario : `USR-${Date.now().toString().slice(-4)}`,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      correo: correo.trim().toLowerCase(),
      rol,
      estado: editingUser ? editingUser.estado : 'ACTIVO',
      documento_identidad: documento.trim(),
      tipo_documento: 'CC',
      telefono: telefono.trim(),
      fecha_creacion: editingUser ? editingUser.fecha_creacion : new Date().toISOString(),
    };

    let profileData: any = undefined;
    if (rol === 'ESTUDIANTE') {
      profileData = {
        codigo_estudiante: codigoEstudiante,
        semestre: Number(semestre),
        id_programa: idPrograma,
      };
    } else if (rol === 'DOCENTE') {
      profileData = {
        especialidad,
        titulo,
      };
    }

    AcademicStorage.saveUser(userData, profileData);
    refreshData();
    setIsModalOpen(false);
  };

  const handleToggleStatus = (u: User) => {
    AcademicStorage.toggleUserStatus(u.id_usuario);
    refreshData();
  };

  const confirmDelete = () => {
    if (deleteCandidate) {
      AcademicStorage.deleteUser(deleteCandidate.id_usuario);
      refreshData();
      setDeleteCandidate(null);
    }
  };

  // Table columns definition
  const columns: Column<User>[] = [
    {
      key: 'nombre',
      header: 'Usuario / Correo',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {u.nombre.charAt(0)}
            {u.apellido.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900">
              {u.nombre} {u.apellido}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">{u.correo}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'rol',
      header: 'Rol en Sistema',
      render: (u) => {
        const styles: Record<Role, string> = {
          ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
          COORDINADOR: 'bg-blue-100 text-blue-800 border-blue-200',
          DOCENTE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          ESTUDIANTE: 'bg-amber-100 text-amber-800 border-amber-200',
        };
        return (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[u.rol]}`}
          >
            {u.rol}
          </span>
        );
      },
    },
    {
      key: 'documento_identidad',
      header: 'Identificación',
      render: (u) => (
        <span className="font-mono text-slate-700">
          {u.tipo_documento} {u.documento_identidad || 'N/A'}
        </span>
      ),
    },
    {
      key: 'telefono',
      header: 'Contacto',
      render: (u) => <span className="text-slate-600">{u.telefono || 'Sin registrar'}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (u) => (
        <button
          onClick={() => handleToggleStatus(u)}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
            u.estado === 'ACTIVO'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          }`}
          title="Click para alternar estado Activo/Inactivo"
        >
          {u.estado === 'ACTIVO' ? (
            <>
              <CheckCircle className="w-3 h-3" />
              <span>ACTIVO</span>
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" />
              <span>INACTIVO</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      sortable: false,
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEdit(u)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Editar usuario"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteCandidate(u)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Eliminar usuario"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      key: 'rol',
      label: 'Rol',
      options: [
        { label: 'ADMIN', value: 'ADMIN' },
        { label: 'COORDINADOR', value: 'COORDINADOR' },
        { label: 'DOCENTE', value: 'DOCENTE' },
        { label: 'ESTUDIANTE', value: 'ESTUDIANTE' },
      ],
    },
    {
      key: 'estado',
      label: 'Estado',
      options: [
        { label: 'ACTIVO', value: 'ACTIVO' },
        { label: 'INACTIVO', value: 'INACTIVO' },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestión Centralizada de Usuarios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Administración de cuentas, asignación de roles (RBAC) y control de acceso al campus.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        title="Directorio Institucional de Usuarios"
        subtitle="Listado con soporte de ordenamiento, filtros en vivo y exportación."
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id_usuario}
        filters={filterConfigs}
        searchPlaceholder="Buscar por nombre, correo o documento..."
        searchFields={['nombre', 'apellido', 'correo', 'documento_identidad']}
        exportFilename="usuarios-sga-universidad"
        primaryAction={{
          label: 'Crear Usuario',
          icon: UserPlus,
          onClick: handleOpenCreate,
        }}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Modificar Usuario Institucional' : 'Registrar Nuevo Usuario'}
        subtitle="Complete los datos del formulario respetando la política institucional de seguridad."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Carlos"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Apellidos *</label>
              <input
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej. Perez Gomez"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Institucional *
              </label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="nombre.apellido@sga.edu.co"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rol en Sistema *</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as Role)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="ADMIN">ADMINISTRADOR</option>
                <option value="COORDINADOR">COORDINADOR ACADÉMICO</option>
                <option value="DOCENTE">DOCENTE</option>
                <option value="ESTUDIANTE">ESTUDIANTE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Documento de Identidad
              </label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="1098452109"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+57 310 123 4567"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Dynamic role attributes */}
          {rol === 'ESTUDIANTE' && (
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-3">
              <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Datos Específicos del Estudiante</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Código Estudiantil
                  </label>
                  <input
                    type="text"
                    value={codigoEstudiante}
                    onChange={(e) => setCodigoEstudiante(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Semestre Actual
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={semestre}
                    onChange={(e) => setSemestre(Number(e.target.value))}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Programa</label>
                  <select
                    value={idPrograma}
                    onChange={(e) => setIdPrograma(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    {programs.map((p) => (
                      <option key={p.id_programa} value={p.id_programa}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {rol === 'DOCENTE' && (
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Datos Específicos del Docente</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Especialidad / Área
                  </label>
                  <input
                    type="text"
                    value={especialidad}
                    onChange={(e) => setEspecialidad(e.target.value)}
                    placeholder="Ej. Ciberseguridad y Redes"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Título Académico
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. Ph.D. en Ciencias de la Computación"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-800 shadow-xs"
            >
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        title="Confirmar Eliminación de Usuario"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            ¿Está seguro de eliminar al usuario{' '}
            <strong className="text-slate-900">
              {deleteCandidate?.nombre} {deleteCandidate?.apellido}
            </strong>{' '}
            ({deleteCandidate?.correo})? Esta acción se registrará en la bitácora de auditoría.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setDeleteCandidate(null)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

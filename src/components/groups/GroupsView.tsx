import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Clock,
  UserCheck,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react';
import { DataTable, Column, FilterConfig } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { CourseGroup, Subject, TeacherProfile, User } from '../../types/academic';
import { AcademicStorage } from '../../services/academicStorage';

export const GroupsView: React.FC = () => {
  const [groups, setGroups] = useState<CourseGroup[]>(() => AcademicStorage.getGroups());
  const subjects = AcademicStorage.getSubjects();
  const teachers = AcademicStorage.getTeachers();
  const users = AcademicStorage.getUsers();
  const enrollments = AcademicStorage.getEnrollments();
  const students = AcademicStorage.getStudents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CourseGroup | null>(null);
  const [rosterGroup, setRosterGroup] = useState<CourseGroup | null>(null);

  // Form states
  const [idAsignatura, setIdAsignatura] = useState(subjects[0]?.id_asignatura || 'ASIG-01');
  const [idDocente, setIdDocente] = useState(teachers[0]?.id_docente || 'DOC-01');
  const [nombreGrupo, setNombreGrupo] = useState('Grupo 01 (Diurno)');
  const [horario, setHorario] = useState('Lunes y Miércoles 08:00 - 10:00');
  const [aula, setAula] = useState('Aula 302-B');
  const [cupoMaximo, setCupoMaximo] = useState(30);

  const refreshData = () => {
    setGroups(AcademicStorage.getGroups());
  };

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setIdAsignatura(subjects[0]?.id_asignatura || 'ASIG-01');
    setIdDocente(teachers[0]?.id_docente || 'DOC-01');
    setNombreGrupo(`Grupo 0${groups.length + 1}`);
    setHorario('Lunes y Miércoles 10:00 - 12:00');
    setAula('Aula Inteligente 201-A');
    setCupoMaximo(30);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: CourseGroup) => {
    setEditingGroup(g);
    setIdAsignatura(g.id_asignatura);
    setIdDocente(g.id_docente);
    setNombreGrupo(g.nombre_grupo);
    setHorario(g.horario);
    setAula(g.aula);
    setCupoMaximo(g.cupo_maximo);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreGrupo.trim() || !horario.trim() || !aula.trim()) return;

    const groupData: CourseGroup = {
      id_grupo: editingGroup ? editingGroup.id_grupo : `GRP-${Date.now().toString().slice(-4)}`,
      id_asignatura: idAsignatura,
      id_docente: idDocente,
      periodo: '2026-1',
      nombre_grupo: nombreGrupo.trim(),
      horario: horario.trim(),
      aula: aula.trim(),
      cupo_maximo: Number(cupoMaximo),
      cupos_inscritos: editingGroup ? editingGroup.cupos_inscritos : 0,
      estado: 'ABIERTO',
    };

    AcademicStorage.saveGroup(groupData);
    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Desea eliminar este grupo académico ofertado?')) {
      AcademicStorage.deleteGroup(id);
      refreshData();
    }
  };

  // Helper to get teacher name
  const getTeacherName = (idDocente: string) => {
    const t = teachers.find((doc) => doc.id_docente === idDocente);
    if (!t) return 'Docente por asignar';
    const u = users.find((usr) => usr.id_usuario === t.id_usuario);
    return u ? `Prof. ${u.nombre} ${u.apellido}` : 'Docente';
  };

  // Enrolled students in roster
  const enrolledStudentsInRoster = rosterGroup
    ? enrollments
        .filter((e) => e.id_grupo === rosterGroup.id_grupo && e.estado !== 'CANCELADA')
        .map((e) => {
          const s = students.find((std) => std.id_estudiante === e.id_estudiante);
          const u = users.find((usr) => usr.id_usuario === s?.id_usuario);
          return {
            enrollment: e,
            student: s,
            user: u,
          };
        })
    : [];

  const columns: Column<CourseGroup>[] = [
    {
      key: 'asignatura',
      header: 'Asignatura / Grupo',
      render: (g) => {
        const sub = subjects.find((s) => s.id_asignatura === g.id_asignatura);
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-900 text-xs">{sub?.codigo}</span>
              <span className="font-bold text-slate-900">{sub?.nombre}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">{g.nombre_grupo} &bull; Periodo {g.periodo}</div>
          </div>
        );
      },
    },
    {
      key: 'docente',
      header: 'Docente Asignado',
      render: (g) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{getTeacherName(g.id_docente)}</span>
        </div>
      ),
    },
    {
      key: 'horario',
      header: 'Horario & Espacio',
      render: (g) => (
        <div className="text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{g.horario}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{g.aula}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'cupo_maximo',
      header: 'Ocupación de Cupos',
      width: '200px',
      render: (g) => {
        const pct = Math.min(100, Math.round((g.cupos_inscritos / g.cupo_maximo) * 100));
        const isFull = g.cupos_inscritos >= g.cupo_maximo;
        return (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-800">
                {g.cupos_inscritos} / {g.cupo_maximo}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  isFull ? 'text-red-600' : pct >= 80 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {pct}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isFull ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      sortable: false,
      render: (g) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setRosterGroup(g)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Ver lista de estudiantes inscritos"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </button>
          <button
            onClick={() => handleOpenEdit(g)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Editar grupo"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(g.id_grupo)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Eliminar grupo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Oferta de Grupos & Control de Cupos
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Asignación docente, programación de aulas físicas/virtuales y administración de aforos.
        </p>
      </div>

      <DataTable
        title="Grupos Académicos - Periodo 2026-1"
        subtitle="Monitoreo de capacidad en tiempo real y asignaciones horarias."
        columns={columns}
        data={groups}
        keyExtractor={(g) => g.id_grupo}
        searchPlaceholder="Buscar por materia, grupo o aula..."
        searchFields={['nombre_grupo', 'horario', 'aula']}
        exportFilename="grupos-academicos-sga"
        primaryAction={{
          label: 'Crear Grupo',
          icon: Plus,
          onClick: handleOpenCreate,
        }}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGroup ? 'Modificar Grupo Académico' : 'Crear Nuevo Grupo Ofertado'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Asignatura a Ofertar *
              </label>
              <select
                value={idAsignatura}
                onChange={(e) => setIdAsignatura(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden"
              >
                {subjects.map((s) => (
                  <option key={s.id_asignatura} value={s.id_asignatura}>
                    {s.codigo} - {s.nombre} ({s.creditos} Créditos)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Docente Titular Asignado *
              </label>
              <select
                value={idDocente}
                onChange={(e) => setIdDocente(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-hidden"
              >
                {teachers.map((t) => (
                  <option key={t.id_docente} value={t.id_docente}>
                    {getTeacherName(t.id_docente)} - {t.especialidad}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Identificador de Grupo *
              </label>
              <input
                type="text"
                required
                value={nombreGrupo}
                onChange={(e) => setNombreGrupo(e.target.value)}
                placeholder="Grupo 01 (Diurno)"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cupo Máximo *</label>
              <input
                type="number"
                min="5"
                max="80"
                value={cupoMaximo}
                onChange={(e) => setCupoMaximo(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Horario Semanal *</label>
              <input
                type="text"
                required
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                placeholder="Lunes y Miércoles 08:00 - 10:00"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Aula o Laboratorio *
              </label>
              <input
                type="text"
                required
                value={aula}
                onChange={(e) => setAula(e.target.value)}
                placeholder="Laboratorio Computación 3"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

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
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-800"
            >
              {editingGroup ? 'Guardar Cambios' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Roster / Students in Group Modal */}
      <Modal
        isOpen={!!rosterGroup}
        onClose={() => setRosterGroup(null)}
        title={`Estudiantes Inscritos: ${rosterGroup?.nombre_grupo}`}
        subtitle={`Cupos ocupados: ${rosterGroup?.cupos_inscritos} de ${rosterGroup?.cupo_maximo}`}
        maxWidth="xl"
      >
        <div className="space-y-4">
          {enrolledStudentsInRoster.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {enrolledStudentsInRoster.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                      {item.user?.nombre.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {item.user?.nombre} {item.user?.apellido}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Código: {item.student?.codigo_estudiante} &bull; {item.user?.correo}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Matrícula Confirmada
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">
              Aún no hay estudiantes matriculados en este grupo.
            </p>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setRosterGroup(null)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Layers,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { DataTable, Column, FilterConfig } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { Subject, AcademicProgram } from '../../types/academic';
import { AcademicStorage } from '../../services/academicStorage';

export const SubjectsView: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>(() => AcademicStorage.getSubjects());
  const programs = AcademicStorage.getPrograms();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [idPrograma, setIdPrograma] = useState(programs[0]?.id_programa || 'PROG-01');
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [creditos, setCreditos] = useState(3);
  const [semestre, setSemestre] = useState(1);
  const [tipo, setTipo] = useState<Subject['tipo']>('TEÓRICO-PRÁCTICA');
  const [horasSemanales, setHorasSemanales] = useState(4);
  const [prereqInput, setPrereqInput] = useState('');
  const [estado, setEstado] = useState<'ACTIVA' | 'INACTIVA'>('ACTIVA');

  const refreshData = () => {
    setSubjects(AcademicStorage.getSubjects());
  };

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setIdPrograma(programs[0]?.id_programa || 'PROG-01');
    setCodigo(`SIS-${Math.floor(100 + Math.random() * 899)}`);
    setNombre('');
    setCreditos(3);
    setSemestre(1);
    setTipo('TEÓRICO-PRÁCTICA');
    setHorasSemanales(4);
    setPrereqInput('');
    setEstado('ACTIVA');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setEditingSubject(s);
    setIdPrograma(s.id_programa);
    setCodigo(s.codigo);
    setNombre(s.nombre);
    setCreditos(s.creditos);
    setSemestre(s.semestre);
    setTipo(s.tipo);
    setHorasSemanales(s.horas_semanales);
    setPrereqInput(s.prerrequisitos.join(', '));
    setEstado(s.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim()) return;

    const prereqs = prereqInput
      .split(',')
      .map((p) => p.trim().toUpperCase())
      .filter((p) => p.length > 0);

    const subjectData: Subject = {
      id_asignatura: editingSubject
        ? editingSubject.id_asignatura
        : `ASIG-${Date.now().toString().slice(-4)}`,
      id_programa: idPrograma,
      codigo: codigo.trim().toUpperCase(),
      nombre: nombre.trim(),
      creditos: Number(creditos),
      semestre: Number(semestre),
      prerrequisitos: prereqs,
      tipo,
      horas_semanales: Number(horasSemanales),
      estado,
    };

    AcademicStorage.saveSubject(subjectData);
    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Desea eliminar esta asignatura del pensum?')) {
      AcademicStorage.deleteSubject(id);
      refreshData();
    }
  };

  const columns: Column<Subject>[] = [
    {
      key: 'codigo',
      header: 'Código / Semestre',
      render: (s) => (
        <div>
          <span className="font-bold font-mono text-blue-900">{s.codigo}</span>
          <div className="text-[11px] text-slate-500 font-medium">Semestre {s.semestre}</div>
        </div>
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre de la Asignatura',
      render: (s) => {
        const prog = programs.find((p) => p.id_programa === s.id_programa);
        return (
          <div>
            <div className="font-bold text-slate-900">{s.nombre}</div>
            <div className="text-[11px] text-slate-500">{prog?.nombre || 'Programa General'}</div>
          </div>
        );
      },
    },
    {
      key: 'creditos',
      header: 'Créditos / Tipo',
      render: (s) => (
        <div>
          <span className="font-bold text-slate-800">{s.creditos} Créditos</span>
          <div className="text-[10px] text-slate-500">{s.tipo} &bull; {s.horas_semanales}h/sem</div>
        </div>
      ),
    },
    {
      key: 'prerrequisitos',
      header: 'Prerrequisitos',
      render: (s) => (
        <div>
          {s.prerrequisitos.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              {s.prerrequisitos.map((pre) => (
                <span
                  key={pre}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200"
                >
                  {pre}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">Sin prerrequisitos</span>
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (s) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            s.estado === 'ACTIVA'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {s.estado}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      sortable: false,
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEdit(s)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Editar asignatura"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(s.id_asignatura)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Eliminar asignatura"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      key: 'id_programa',
      label: 'Programa',
      options: programs.map((p) => ({ label: p.codigo, value: p.id_programa })),
    },
    {
      key: 'semestre',
      label: 'Semestre',
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => ({
        label: `Semestre ${sem}`,
        value: String(sem),
      })),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Gestión de Asignaturas & Mallas Curriculares
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configuración de materias, créditos académicos, tipología y cadena de prerrequisitos.
        </p>
      </div>

      <DataTable
        title="Catálogo de Asignaturas Universitarias"
        subtitle="Estructura curricular por semestres con control de correlatividades."
        columns={columns}
        data={subjects}
        keyExtractor={(s) => s.id_asignatura}
        filters={filterConfigs}
        searchPlaceholder="Buscar por código o nombre de materia..."
        searchFields={['codigo', 'nombre']}
        exportFilename="asignaturas-pensum-sga"
        primaryAction={{
          label: 'Nueva Asignatura',
          icon: Plus,
          onClick: handleOpenCreate,
        }}
      />

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Modificar Asignatura' : 'Registrar Nueva Asignatura'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Programa Académico *
              </label>
              <select
                value={idPrograma}
                onChange={(e) => setIdPrograma(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden"
              >
                {programs.map((p) => (
                  <option key={p.id_programa} value={p.id_programa}>
                    {p.codigo} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código Oficial *</label>
              <input
                type="text"
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="SIS-201"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold uppercase focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Asignatura *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Estructuras de Datos y Algoritmos"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Créditos Académicos *</label>
              <input
                type="number"
                min="1"
                max="10"
                value={creditos}
                onChange={(e) => setCreditos(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nivel / Semestre *</label>
              <input
                type="number"
                min="1"
                max="12"
                value={semestre}
                onChange={(e) => setSemestre(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Curso</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as Subject['tipo'])}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-hidden"
              >
                <option value="TEÓRICA">TEÓRICA</option>
                <option value="PRÁCTICA">PRÁCTICA</option>
                <option value="TEÓRICO-PRÁCTICA">TEÓRICO-PRÁCTICA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Horas Semanales</label>
              <input
                type="number"
                min="1"
                max="15"
                value={horasSemanales}
                onChange={(e) => setHorasSemanales(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prerrequisitos (Códigos separados por coma)
              </label>
              <input
                type="text"
                value={prereqInput}
                onChange={(e) => setPrereqInput(e.target.value)}
                placeholder="Ej. SIS-102, MAT-101"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                El sistema validará estos códigos al momento de matricular estudiantes.
              </p>
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
              {editingSubject ? 'Guardar Cambios' : 'Registrar Asignatura'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

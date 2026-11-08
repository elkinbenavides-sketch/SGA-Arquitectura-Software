import React, { useState } from 'react';
import {
  School,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Award,
  Layers,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { DataTable, Column } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { AcademicProgram, Subject } from '../../types/academic';
import { AcademicStorage } from '../../services/academicStorage';

export const ProgramsView: React.FC = () => {
  const [programs, setPrograms] = useState<AcademicProgram[]>(() => AcademicStorage.getPrograms());
  const subjects = AcademicStorage.getSubjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);
  const [pensumProgram, setPensumProgram] = useState<AcademicProgram | null>(null);

  // Form states
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [facultad, setFacultad] = useState('');
  const [registroSnies, setRegistroSnies] = useState('');
  const [creditos, setCreditos] = useState(160);
  const [semestres, setSemestres] = useState(10);
  const [director, setDirector] = useState('');
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');

  const refreshData = () => {
    setPrograms(AcademicStorage.getPrograms());
  };

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setCodigo(`PROG-${Math.floor(10 + Math.random() * 89)}`);
    setNombre('');
    setFacultad('Facultad de Ingeniería y Ciencias Básicas');
    setRegistroSnies('10' + Math.floor(1000 + Math.random() * 9000));
    setCreditos(160);
    setSemestres(10);
    setDirector('');
    setEstado('ACTIVO');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: AcademicProgram) => {
    setEditingProgram(p);
    setCodigo(p.codigo);
    setNombre(p.nombre);
    setFacultad(p.facultad);
    setRegistroSnies(p.registro_snies || '');
    setCreditos(p.creditos_totales);
    setSemestres(p.duracion_semestres);
    setDirector(p.decano_o_director || '');
    setEstado(p.estado);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !codigo.trim()) return;

    const programData: AcademicProgram = {
      id_programa: editingProgram ? editingProgram.id_programa : `PROG-${Date.now().toString().slice(-4)}`,
      codigo: codigo.trim().toUpperCase(),
      nombre: nombre.trim(),
      facultad: facultad.trim(),
      registro_snies: registroSnies.trim(),
      nivel: 'PREGRADO',
      creditos_totales: Number(creditos),
      duracion_semestres: Number(semestres),
      estado,
      decano_o_director: director.trim(),
    };

    AcademicStorage.saveProgram(programData);
    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este programa académico?')) {
      AcademicStorage.deleteProgram(id);
      refreshData();
    }
  };

  // Associated subjects for pensum viewer
  const programSubjects = pensumProgram
    ? subjects.filter((s) => s.id_programa === pensumProgram.id_programa)
    : [];

  const columns: Column<AcademicProgram>[] = [
    {
      key: 'codigo',
      header: 'Código / SNIES',
      render: (p) => (
        <div>
          <span className="font-bold font-mono text-blue-900">{p.codigo}</span>
          <div className="text-[10px] text-slate-400 font-mono">SNIES: {p.registro_snies || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'nombre',
      header: 'Programa Académico',
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900">{p.nombre}</div>
          <div className="text-[11px] text-slate-500">{p.facultad}</div>
        </div>
      ),
    },
    {
      key: 'creditos_totales',
      header: 'Créditos / Duración',
      render: (p) => (
        <span className="text-slate-700 font-medium">
          <strong>{p.creditos_totales}</strong> créditos &bull; {p.duracion_semestres} Semestres
        </span>
      ),
    },
    {
      key: 'decano_o_director',
      header: 'Dirección / Decanatura',
      render: (p) => <span className="text-slate-600 text-[11px]">{p.decano_o_director || 'Por asignar'}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (p) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            p.estado === 'ACTIVO'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {p.estado}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      sortable: false,
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setPensumProgram(p)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Ver Malla Curricular / Pensum"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          </button>
          <button
            onClick={() => handleOpenEdit(p)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Editar programa"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(p.id_programa)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Eliminar programa"
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
          Oferta de Programas Académicos
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Catálogo universitario de pregrados y posgrados avalados por el Ministerio de Educación.
        </p>
      </div>

      <DataTable
        title="Programas Institucionales Registrados"
        subtitle="Registro oficial calificado y estructura curricular universitaria."
        columns={columns}
        data={programs}
        keyExtractor={(p) => p.id_programa}
        searchPlaceholder="Buscar por código, nombre o facultad..."
        searchFields={['codigo', 'nombre', 'facultad']}
        exportFilename="programas-academicos-sga"
        primaryAction={{
          label: 'Nuevo Programa',
          icon: Plus,
          onClick: handleOpenCreate,
        }}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProgram ? 'Modificar Programa Académico' : 'Registrar Nuevo Programa'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código del Programa *</label>
              <input
                type="text"
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="ING-SIS"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold uppercase focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registro SNIES</label>
              <input
                type="text"
                value={registroSnies}
                onChange={(e) => setRegistroSnies(e.target.value)}
                placeholder="102948"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Oficial del Programa *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingeniería de Sistemas"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Facultad Adscrita *</label>
              <input
                type="text"
                required
                value={facultad}
                onChange={(e) => setFacultad(e.target.value)}
                placeholder="Facultad de Ingeniería y Ciencias Básicas"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Créditos Totales *</label>
              <input
                type="number"
                required
                min="40"
                max="300"
                value={creditos}
                onChange={(e) => setCreditos(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duración (Semestres) *</label>
              <input
                type="number"
                required
                min="1"
                max="14"
                value={semestres}
                onChange={(e) => setSemestres(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Director o Decano</label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Dr. Carlos Mendoza, Ph.D."
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
              {editingProgram ? 'Guardar Cambios' : 'Registrar Programa'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Pensum / Curriculum Viewer Modal */}
      <Modal
        isOpen={!!pensumProgram}
        onClose={() => setPensumProgram(null)}
        title={`Malla Curricular: ${pensumProgram?.nombre}`}
        subtitle={`Código: ${pensumProgram?.codigo} | Total Asignaturas vinculadas: ${programSubjects.length}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {programSubjects.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {programSubjects.map((s) => (
                <div key={s.id_asignatura} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-blue-900">{s.codigo}</span>
                      <span className="font-semibold text-slate-800">{s.nombre}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Semestre {s.semestre} &bull; {s.creditos} Créditos &bull; {s.tipo} &bull; Horas/semana: {s.horas_semanales}
                    </div>
                  </div>
                  {s.prerrequisitos.length > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400 block">Prerrequisitos:</span>
                      <span className="text-[11px] font-mono font-bold text-amber-700">
                        {s.prerrequisitos.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">
              Este programa aún no tiene asignaturas asociadas en el sistema.
            </p>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setPensumProgram(null)}
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

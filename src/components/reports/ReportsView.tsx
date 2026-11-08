import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileCheck2,
  GraduationCap,
  Award,
  Users,
  TrendingUp,
  FileText,
  School,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DataTable, Column } from '../common/DataTable';
import { AcademicStorage, exportToCSV } from '../../services/academicStorage';
import { Modal } from '../common/Modal';

const COLORS = ['#1e40af', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const ReportsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ESTUDIANTES' | 'MATRICULAS' | 'CALIFICACIONES' | 'CERTIFICADOS'>('ESTUDIANTES');

  const students = AcademicStorage.getStudents();
  const users = AcademicStorage.getUsers();
  const programs = AcademicStorage.getPrograms();
  const enrollments = AcademicStorage.getEnrollments();
  const grades = AcademicStorage.getGrades();
  const groups = AcademicStorage.getGroups();
  const subjects = AcademicStorage.getSubjects();

  // Certificate generator state
  const [selectedStudentForCert, setSelectedStudentForCert] = useState(students[0]?.id_estudiante || '');
  const [certType, setCertType] = useState<'ESTUDIO' | 'NOTAS' | 'MATRICULA'>('ESTUDIO');
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Student Report Data
  const studentRows = useMemo(() => {
    return students.map((s) => {
      const u = users.find((usr) => usr.id_usuario === s.id_usuario);
      const prog = programs.find((p) => p.id_programa === s.id_programa);
      return {
        id_estudiante: s.id_estudiante,
        codigo: s.codigo_estudiante,
        nombre: `${u?.nombre} ${u?.apellido}`,
        correo: u?.correo,
        programa: prog?.nombre || 'General',
        semestre: s.semestre,
        promedio: s.promedio_acumulado.toFixed(2),
        creditos: s.creditos_aprobados,
        estado: s.estado_academico,
      };
    });
  }, [students, users, programs]);

  // Pass rate stats
  const totalGraded = grades.filter((g) => g.definitiva > 0);
  const approvedCount = totalGraded.filter((g) => g.definitiva >= 3.0).length;
  const failedCount = totalGraded.length - approvedCount;
  const passRate = totalGraded.length > 0 ? Math.round((approvedCount / totalGraded.length) * 100) : 100;

  // Grade histogram data
  const gradeHistogram = useMemo(() => {
    const ranges = [
      { range: '0.0 - 1.9', count: 0 },
      { range: '2.0 - 2.9', count: 0 },
      { range: '3.0 - 3.9', count: 0 },
      { range: '4.0 - 4.5', count: 0 },
      { range: '4.6 - 5.0', count: 0 },
    ];
    grades.forEach((g) => {
      const def = g.definitiva;
      if (def < 2.0) ranges[0].count++;
      else if (def < 3.0) ranges[1].count++;
      else if (def < 4.0) ranges[2].count++;
      else if (def <= 4.5) ranges[3].count++;
      else ranges[4].count++;
    });
    return ranges;
  }, [grades]);

  const studentColumns: Column<any>[] = [
    { key: 'codigo', header: 'Código Estudiantil' },
    { key: 'nombre', header: 'Estudiante' },
    { key: 'correo', header: 'Correo Institucional' },
    { key: 'programa', header: 'Programa Académico' },
    { key: 'semestre', header: 'Semestre', align: 'center' },
    { key: 'promedio', header: 'Promedio Acum.', align: 'center' },
    { key: 'creditos', header: 'Créditos Aprob.', align: 'center' },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {r.estado}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Centro de Reportes, Indicadores & Analítica
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Generación de indicadores de calidad académica, estadísticas de rendimiento y certificados.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-print">
        <button
          onClick={() => setActiveTab('ESTUDIANTES')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'ESTUDIANTES'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Reporte de Estudiantes</span>
        </button>

        <button
          onClick={() => setActiveTab('MATRICULAS')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'MATRICULAS'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Reporte de Matrículas</span>
        </button>

        <button
          onClick={() => setActiveTab('CALIFICACIONES')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'CALIFICACIONES'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Indicadores de Rendimiento</span>
        </button>

        <button
          onClick={() => setActiveTab('CERTIFICADOS')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'CERTIFICADOS'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Certificados Oficiales</span>
        </button>
      </div>

      {/* Tab 1: Estudiantes */}
      {activeTab === 'ESTUDIANTES' && (
        <DataTable
          title="Consolidado General de Estudiantes Matriculados"
          subtitle="Listado con promedios acumulados y avance crediticio."
          columns={studentColumns}
          data={studentRows}
          keyExtractor={(r) => r.id_estudiante}
          searchPlaceholder="Buscar por código, estudiante o programa..."
          exportFilename="reporte-estudiantes-sga"
        />
      )}

      {/* Tab 2: Matrículas */}
      {activeTab === 'MATRICULAS' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Matrículas Registradas</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{enrollments.length}</div>
              <span className="text-[11px] text-emerald-600 font-medium">100% Confirmadas</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Cupos Totales Ofertados</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {groups.reduce((acc, g) => acc + g.cupo_maximo, 0)}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">En 5 grupos activos</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Ocupación Global</span>
              <div className="text-2xl font-black text-slate-900 mt-1">86%</div>
              <span className="text-[11px] text-emerald-600 font-medium">Alta demanda</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Volumen de Inscripciones por Asignatura
                </h3>
                <p className="text-xs text-slate-500">Estudiantes registrados por curso en 2026-1</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groups.map((g) => {
                    const sub = subjects.find((s) => s.id_asignatura === g.id_asignatura);
                    return {
                      name: sub?.codigo || g.id_grupo,
                      inscritos: g.cupos_inscritos,
                    };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="inscritos" name="Inscritos" fill="#1e40af" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Calificaciones & Rendimiento */}
      {activeTab === 'CALIFICACIONES' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Tasa de Aprobación</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{passRate}%</div>
              <span className="text-[11px] text-slate-500 font-medium">
                {approvedCount} de {totalGraded.length} notas definitivas
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Promedio General Notas</span>
              <div className="text-2xl font-black text-blue-900 mt-1">4.08</div>
              <span className="text-[11px] text-slate-500 font-medium">Escala de 0.0 a 5.0</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">Tasa de Deserción</span>
              <div className="text-2xl font-black text-slate-900 mt-1">0.0%</div>
              <span className="text-[11px] text-emerald-600 font-medium">Retención 100%</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Histograma de Distribución de Calificaciones Definitivas
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Frecuencia de rangos de notas de estudiantes en el ciclo actual
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeHistogram}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Estudiantes" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Certificados Oficiales */}
      {activeTab === 'CERTIFICADOS' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
          <div className="max-w-xl">
            <h3 className="text-base font-bold text-slate-900">
              Generador de Certificados Oficiales con Firma Digital
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Expedición instantánea de constancias de matrícula, estudio y sabana de calificaciones
              con formato legal para impresión o PDF.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estudiante</label>
              <select
                value={selectedStudentForCert}
                onChange={(e) => setSelectedStudentForCert(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden"
              >
                {students.map((s) => {
                  const u = users.find((usr) => usr.id_usuario === s.id_usuario);
                  return (
                    <option key={s.id_estudiante} value={s.id_estudiante}>
                      {s.codigo_estudiante} - {u?.nombre} {u?.apellido}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipo de Certificado
              </label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden"
              >
                <option value="ESTUDIO">Certificado de Estudio Regular</option>
                <option value="NOTAS">Certificado de Calificaciones</option>
                <option value="MATRICULA">Constancia de Matrícula Financiera & Académica</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowCertificateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Generar y Visualizar Certificado</span>
          </button>
        </div>
      )}

      {/* Certificate Print Preview Modal */}
      <Modal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        title="Certificado Oficial Universitario"
        subtitle="Documento expedido por la Secretaría General de la Universidad."
        maxWidth="lg"
      >
        {(() => {
          const s = students.find((std) => std.id_estudiante === selectedStudentForCert);
          const u = users.find((usr) => usr.id_usuario === s?.id_usuario);
          const prog = programs.find((p) => p.id_programa === s?.id_programa);

          return (
            <div className="space-y-5">
              <div className="p-8 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-serif space-y-5 leading-relaxed">
                <div className="text-center pb-4 border-b-2 border-slate-900">
                  <h2 className="text-base font-black uppercase tracking-wider font-sans">
                    UNIVERSIDAD DEL VALLE
                  </h2>
                  <p className="text-[11px] font-sans text-slate-600">
                    SECRETARÍA GENERAL &bull; OFICINA DE REGISTRO ACADÉMICO
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    CERTIFICADO NO. SGA-CERT-2026-{Math.floor(1000 + Math.random() * 9000)}
                  </p>
                </div>

                <div className="text-center font-sans font-black text-sm uppercase py-2">
                  EL SUSCRITO SECRETARIO GENERAL DE LA UNIVERSIDAD CERTIFICA:
                </div>

                <p className="text-justify text-xs text-slate-800 leading-6">
                  Que <strong>{u?.nombre.toUpperCase()} {u?.apellido.toUpperCase()}</strong>, identificado(a) con{' '}
                  <strong>{u?.tipo_documento} No. {u?.documento_identidad || '1.000.892.345'}</strong>, con código
                  estudiantil <strong>{s?.codigo_estudiante}</strong>, es estudiante regular y activo del
                  programa académico de <strong>{prog?.nombre.toUpperCase()}</strong>, cursando actualmente el{' '}
                  <strong>SEMESTRE {s?.semestre}</strong> durante el periodo académico{' '}
                  <strong>2026-1</strong>.
                </p>

                <p className="text-justify text-xs text-slate-800 leading-6">
                  A la fecha, el(la) estudiante registra un promedio acumulado ponderado de{' '}
                  <strong>{s?.promedio_acumulado.toFixed(2)} sobre 5.00</strong>, con un total de{' '}
                  <strong>{s?.creditos_aprobados} créditos aprobados</strong> satisfactoriamente dentro de su
                  malla curricular.
                </p>

                <p className="text-xs text-slate-600 italic">
                  Se expide la presente certificación a solicitud de la parte interesada, en la ciudad de
                  Santiago de Cali, a los {new Date().getDate()} días del mes de noviembre del año 2026.
                </p>

                <div className="pt-10 flex items-center justify-between text-[11px] font-sans">
                  <div className="text-center">
                    <div className="w-48 border-b border-slate-900 mb-1" />
                    <strong>DR. CARLOS MENDOZA RESTREPO</strong>
                    <div className="text-slate-500 text-[10px]">Secretario General</div>
                  </div>

                  <div className="text-right text-[10px] text-slate-400 font-mono">
                    <div className="font-bold text-emerald-700">Código de Verificación QR</div>
                    <div>sga.edu.co/verify/7f83b165</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 no-print">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Certificado (PDF)</span>
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

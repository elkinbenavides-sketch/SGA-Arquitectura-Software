import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Printer,
  Calendar,
  Lock,
  Clock,
  Sparkles,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { DataTable, Column, FilterConfig } from '../common/DataTable';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { Enrollment, CourseGroup, Subject, User, StudentProfile } from '../../types/academic';
import { AcademicStorage } from '../../services/academicStorage';
import { validatePrerequisites, validateGroupQuota, hasScheduleConflict } from '../../services/academicRules';

export const EnrollmentView: React.FC = () => {
  const { role, user, student } = useAuth();

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => AcademicStorage.getEnrollments());
  const groups = AcademicStorage.getGroups();
  const subjects = AcademicStorage.getSubjects();
  const students = AcademicStorage.getStudents();
  const users = AcademicStorage.getUsers();
  const teachers = AcademicStorage.getTeachers();

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id_grupo || '');
  const [selectedStudentId, setSelectedStudentId] = useState(
    student?.id_estudiante || students[0]?.id_estudiante || ''
  );
  const [enrollmentError, setEnrollmentError] = useState('');
  const [enrollmentSuccess, setEnrollmentSuccess] = useState('');
  const [voucherEnrollment, setVoucherEnrollment] = useState<Enrollment | null>(null);

  const refreshData = () => {
    setEnrollments(AcademicStorage.getEnrollments());
  };

  // If user is ESTUDIANTE, lock target student to their own profile
  const isStudent = role === 'ESTUDIANTE';
  const currentStudentId = isStudent
    ? student?.id_estudiante || students.find((s) => s.id_usuario === user?.id_usuario)?.id_estudiante || ''
    : selectedStudentId;

  // Find enrolled courses for conflict & prereq checking
  const activeStudentEnrollments = enrollments.filter(
    (e) => e.id_estudiante === currentStudentId && e.estado !== 'CANCELADA'
  );

  const handleOpenEnrollWizard = () => {
    setSelectedGroupId(groups[0]?.id_grupo || '');
    if (!isStudent && students.length > 0) {
      setSelectedStudentId(students[0].id_estudiante);
    }
    setEnrollmentError('');
    setEnrollmentSuccess('');
    setIsEnrollModalOpen(true);
  };

  const handleConfirmEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollmentError('');
    setEnrollmentSuccess('');

    const targetGroup = groups.find((g) => g.id_grupo === selectedGroupId);
    if (!targetGroup) {
      setEnrollmentError('El grupo seleccionado no existe.');
      return;
    }

    const targetSubject = subjects.find((s) => s.id_asignatura === targetGroup.id_asignatura);
    if (!targetSubject) {
      setEnrollmentError('No se encontró la asignatura vinculada.');
      return;
    }

    // 1. Quota Check
    const quotaCheck = validateGroupQuota(targetGroup.cupo_maximo, targetGroup.cupos_inscritos);
    if (!quotaCheck.hasQuota) {
      setEnrollmentError(
        `El grupo ${targetGroup.nombre_grupo} no tiene cupos disponibles (${targetGroup.cupos_inscritos}/${targetGroup.cupo_maximo}).`
      );
      return;
    }

    // 2. Prerequisite Check (Simulate checking completed approved subjects)
    // For demo purposes, student 1 has approved SIS-102 and SIS-201
    const approvedCodes = ['SIS-101', 'SIS-102', 'SIS-201', 'MAT-101'];
    const prereqCheck = validatePrerequisites(approvedCodes, targetSubject.prerrequisitos);
    if (!prereqCheck.eligible) {
      setEnrollmentError(
        `No cumple los prerrequisitos obligatorios: Falta aprobar [${prereqCheck.missingPrereqs.join(
          ', '
        )}]`
      );
      return;
    }

    // 3. Schedule Conflict Check with already enrolled groups
    const studentExistingSchedules = activeStudentEnrollments
      .map((enr) => {
        const g = groups.find((grp) => grp.id_grupo === enr.id_grupo);
        return g?.horario || '';
      })
      .filter(Boolean);

    for (const existingSched of studentExistingSchedules) {
      if (hasScheduleConflict(existingSched, targetGroup.horario)) {
        setEnrollmentError(
          `Cruce de horario detectado con otra materia ya inscrita en el horario: ${existingSched}`
        );
        return;
      }
    }

    // Process enrollment
    const result = AcademicStorage.enrollStudent(currentStudentId, targetGroup.id_grupo, '2026-1');
    if (result.success) {
      refreshData();
      setEnrollmentSuccess('¡Matrícula registrada y confirmada exitosamente!');
      if (result.enrollment) {
        setVoucherEnrollment(result.enrollment);
      }
      setTimeout(() => {
        setIsEnrollModalOpen(false);
      }, 1200);
    } else {
      setEnrollmentError(result.message);
    }
  };

  const handleCancelEnrollment = (idMatricula: string) => {
    if (confirm('¿Está seguro de cancelar esta matrícula académica?')) {
      AcademicStorage.cancelEnrollment(idMatricula, 'Cancelada por el usuario en plataforma');
      refreshData();
    }
  };

  // Filter list by role
  const displayEnrollments = isStudent
    ? enrollments.filter((e) => e.id_estudiante === currentStudentId)
    : enrollments;

  const columns: Column<Enrollment>[] = [
    {
      key: 'id_matricula',
      header: 'No. Matrícula / Periodo',
      render: (e) => (
        <div>
          <span className="font-mono font-bold text-blue-900">{e.id_matricula}</span>
          <div className="text-[11px] text-slate-500 font-medium">Ciclo {e.periodo}</div>
        </div>
      ),
    },
    {
      key: 'estudiante',
      header: 'Estudiante',
      render: (e) => {
        const s = students.find((std) => std.id_estudiante === e.id_estudiante);
        const u = users.find((usr) => usr.id_usuario === s?.id_usuario);
        return (
          <div>
            <div className="font-bold text-slate-900">
              {u?.nombre} {u?.apellido}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Cód. {s?.codigo_estudiante} &bull; {u?.correo}
            </div>
          </div>
        );
      },
    },
    {
      key: 'asignatura',
      header: 'Asignatura & Grupo',
      render: (e) => {
        const g = groups.find((grp) => grp.id_grupo === e.id_grupo);
        const sub = subjects.find((s) => s.id_asignatura === g?.id_asignatura);
        return (
          <div>
            <div className="font-bold text-slate-800">
              {sub?.codigo} - {sub?.nombre}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {g?.nombre_grupo} &bull; {sub?.creditos} Créditos
            </div>
          </div>
        );
      },
    },
    {
      key: 'horario',
      header: 'Horario & Espacio',
      render: (e) => {
        const g = groups.find((grp) => grp.id_grupo === e.id_grupo);
        return (
          <div className="text-xs text-slate-700">
            <div>{g?.horario}</div>
            <div className="text-[11px] text-slate-500">{g?.aula}</div>
          </div>
        );
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (e) => {
        const styles: Record<string, string> = {
          CONFIRMADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          INSCRITA: 'bg-blue-50 text-blue-700 border-blue-200',
          CANCELADA: 'bg-red-50 text-red-700 border-red-200',
          PENDIENTE_APROBACION: 'bg-amber-50 text-amber-700 border-amber-200',
        };
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              styles[e.estado] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {e.estado}
          </span>
        );
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      sortable: false,
      render: (e) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setVoucherEnrollment(e)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Ver / Imprimir Comprobante de Matrícula"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
          </button>
          {e.estado !== 'CANCELADA' && (
            <button
              onClick={() => handleCancelEnrollment(e.id_matricula)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Cancelar Matrícula"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isStudent ? 'Mi Matrícula en Línea (Periodo 2026-1)' : 'Gestión y Control de Matrículas'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Inscripción de asignaturas con validación algorítmica de prerrequisitos, aforos y cruces
            horarios.
          </p>
        </div>

        <button
          onClick={handleOpenEnrollWizard}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-xs shadow-blue-950/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isStudent ? 'Matricular Asignatura' : 'Registrar Matrícula'}</span>
        </button>
      </div>

      <DataTable
        title={isStudent ? 'Asignaturas Inscritas para el Periodo Activo' : 'Registro General de Matrículas'}
        subtitle="Listado oficial de inscripciones académicas universitarias."
        columns={columns}
        data={displayEnrollments}
        keyExtractor={(e) => e.id_matricula}
        searchPlaceholder="Buscar por No. matrícula, estudiante o asignatura..."
        exportFilename="matriculas-academicas-sga"
      />

      {/* Online Enrollment Wizard Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Inscripción de Asignatura Académica"
        subtitle="El sistema ejecutará las validaciones de prerrequisitos y disponibilidad de cupo."
        maxWidth="lg"
      >
        <form onSubmit={handleConfirmEnroll} className="space-y-4">
          {enrollmentError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{enrollmentError}</span>
            </div>
          )}

          {enrollmentSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{enrollmentSuccess}</span>
            </div>
          )}

          {!isStudent && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Seleccionar Estudiante *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-hidden"
              >
                {students.map((std) => {
                  const u = users.find((usr) => usr.id_usuario === std.id_usuario);
                  return (
                    <option key={std.id_estudiante} value={std.id_estudiante}>
                      {std.codigo_estudiante} - {u?.nombre} {u?.apellido}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Seleccionar Asignatura y Grupo Ofertado *
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {groups.map((g) => {
                const sub = subjects.find((s) => s.id_asignatura === g.id_asignatura);
                const isSelected = selectedGroupId === g.id_grupo;
                const isFull = g.cupos_inscritos >= g.cupo_maximo;
                return (
                  <div
                    key={g.id_grupo}
                    onClick={() => !isFull && setSelectedGroupId(g.id_grupo)}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : isFull
                        ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-900">{sub?.codigo}</span>
                        <span className="font-bold text-slate-900">{sub?.nombre}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-600">
                          {sub?.creditos} Créditos
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {g.nombre_grupo} &bull; {g.horario} &bull; {g.aula}
                      </div>
                      {sub?.prerrequisitos.length! > 0 && (
                        <div className="text-[10px] text-amber-700 font-medium mt-1">
                          Prerrequisitos: {sub?.prerrequisitos.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFull
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isFull ? 'Cupo Lleno' : `${g.cupo_maximo - g.cupos_inscritos} Cupos Libres`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-800 shadow-xs"
            >
              Confirmar e Inscribir
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Tuition Voucher Modal */}
      <Modal
        isOpen={!!voucherEnrollment}
        onClose={() => setVoucherEnrollment(null)}
        title="Comprobante Oficial de Matrícula Universitaria"
        subtitle="Documento académico con validez institucional para el periodo 2026-1."
        maxWidth="lg"
      >
        {voucherEnrollment && (() => {
          const s = students.find((std) => std.id_estudiante === voucherEnrollment.id_estudiante);
          const u = users.find((usr) => usr.id_usuario === s?.id_usuario);
          const g = groups.find((grp) => grp.id_grupo === voucherEnrollment.id_grupo);
          const sub = subjects.find((subj) => subj.id_asignatura === g?.id_asignatura);

          return (
            <div className="space-y-5">
              {/* Printable Document Box */}
              <div className="p-6 rounded-xl border border-slate-300 bg-white shadow-xs space-y-4 font-sans text-slate-900">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
                  <div>
                    <h2 className="text-base font-black tracking-tight uppercase">
                      Universidad del Valle
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      Dirección de Admisiones, Registro y Control Académico
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      NIT: 890.399.010-6 &bull; Personería Jurídica Res. 1024 MEN
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded block">
                      NO. {voucherEnrollment.id_matricula}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      Fecha: {new Date(voucherEnrollment.fecha).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                </div>

                {/* Student Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Nombre del Estudiante:</span>
                    <strong className="text-slate-900">
                      {u?.nombre} {u?.apellido}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Código Estudiantil:</span>
                    <strong className="text-slate-900 font-mono">{s?.codigo_estudiante}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Documento de Identidad:</span>
                    <strong className="text-slate-900 font-mono">
                      {u?.tipo_documento} {u?.documento_identidad || 'N/A'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Periodo Académico:</span>
                    <strong className="text-slate-900">2026-1 (Semestre Regular)</strong>
                  </div>
                </div>

                {/* Course Details */}
                <div className="text-xs space-y-2">
                  <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                    Asignatura Matriculada
                  </h4>
                  <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">
                        {sub?.codigo} - {sub?.nombre}
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        {g?.nombre_grupo} &bull; Horario: {g?.horario} &bull; Aula: {g?.aula}
                      </div>
                    </div>
                    <span className="font-bold font-mono text-slate-800">
                      {sub?.creditos} Créditos
                    </span>
                  </div>
                </div>

                {/* Security Stamp & Signature Line */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">Firma Digital Verificada</span>
                      <span>SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b border-slate-400 mb-1" />
                    <span>Secretaría Académica</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 no-print">
                <button
                  type="button"
                  onClick={() => setVoucherEnrollment(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-900 text-white hover:bg-blue-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Comprobante (PDF)</span>
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Clock,
  Terminal,
  Activity,
} from 'lucide-react';
import { DataTable, Column, FilterConfig } from '../common/DataTable';
import { AuditLog } from '../../types/academic';
import { AcademicStorage } from '../../services/academicStorage';
import { Modal } from '../common/Modal';

export const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(() => AcademicStorage.getAuditLogs());
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const refreshData = () => {
    setLogs(AcademicStorage.getAuditLogs());
  };

  const handleResetDatabase = () => {
    AcademicStorage.resetDatabase();
    refreshData();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setShowResetModal(false);
    }, 1800);
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'fecha',
      header: 'Timestamp / IP',
      render: (l) => (
        <div>
          <span className="font-mono text-slate-800 text-[11px] font-semibold">
            {new Date(l.fecha).toLocaleString('es-CO')}
          </span>
          <div className="text-[10px] text-slate-400 font-mono">IP: {l.ip}</div>
        </div>
      ),
    },
    {
      key: 'usuario_nombre',
      header: 'Usuario Responsable',
      render: (l) => (
        <div>
          <div className="font-bold text-slate-900">{l.usuario_nombre}</div>
          <div className="text-[10px] text-slate-500 font-mono">
            {l.usuario_correo} &bull; <strong className="text-slate-700">{l.rol}</strong>
          </div>
        </div>
      ),
    },
    {
      key: 'modulo',
      header: 'Módulo',
      render: (l) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {l.modulo}
        </span>
      ),
    },
    {
      key: 'accion',
      header: 'Acción Ejecutada',
      render: (l) => <span className="font-mono font-bold text-blue-900 text-[11px]">{l.accion}</span>,
    },
    {
      key: 'detalles',
      header: 'Trazabilidad del Evento / Payload',
      render: (l) => <span className="text-slate-600 text-[11px] leading-tight block">{l.detalles}</span>,
    },
    {
      key: 'nivel',
      header: 'Severidad',
      align: 'center',
      render: (l) => {
        const styles: Record<string, string> = {
          INFO: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          WARNING: 'bg-amber-50 text-amber-800 border-amber-200',
          CRITICAL: 'bg-red-50 text-red-800 border-red-200',
        };
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              styles[l.nivel] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {l.nivel}
          </span>
        );
      },
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      key: 'nivel',
      label: 'Severidad',
      options: [
        { label: 'INFO', value: 'INFO' },
        { label: 'WARNING', value: 'WARNING' },
        { label: 'CRITICAL', value: 'CRITICAL' },
      ],
    },
    {
      key: 'modulo',
      label: 'Módulo',
      options: [
        { label: 'AUTENTICACION', value: 'AUTENTICACION' },
        { label: 'USUARIOS', value: 'USUARIOS' },
        { label: 'PROGRAMAS', value: 'PROGRAMAS' },
        { label: 'ASIGNATURAS', value: 'ASIGNATURAS' },
        { label: 'GRUPOS', value: 'GRUPOS' },
        { label: 'MATRICULAS', value: 'MATRICULAS' },
        { label: 'CALIFICACIONES', value: 'CALIFICACIONES' },
        { label: 'SISTEMA', value: 'SISTEMA' },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bitácora de Auditoría & Trazabilidad de Seguridad
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Registro inmutable de actividades administrativas, inicios de sesión y modificaciones de notas.
          </p>
        </div>

        <button
          onClick={() => setShowResetModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Restablecer Datos Demo</span>
        </button>
      </div>

      <DataTable
        title="Eventos de Auditoría Registrados (Log Append-Only)"
        subtitle="Monitoreo conforme a normas ISO/IEC 27001 para sistemas universitarios."
        columns={columns}
        data={logs}
        keyExtractor={(l) => l.id_auditoria}
        filters={filterConfigs}
        searchPlaceholder="Buscar por acción, usuario o detalles..."
        searchFields={['accion', 'usuario_nombre', 'usuario_correo', 'detalles']}
        exportFilename="bitacora-auditoria-sga"
      />

      {/* Reset Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Restablecer Datos Iniciales de Demostración"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {resetSuccess ? (
            <div className="py-4 text-center text-xs font-bold text-emerald-700">
              ¡Base de datos restablecida con éxito a su estado original!
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600">
                Esta acción restaurará los programas, materias, grupos, usuarios demo, notas y
                matrículas a su estado de fábrica.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResetDatabase}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Sí, Restablecer Todo
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

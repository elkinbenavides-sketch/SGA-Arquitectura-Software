/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Modal } from './components/common/Modal';
import { LoginView } from './components/auth/LoginView';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { CoordinatorDashboard } from './components/dashboard/CoordinatorDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { UsersView } from './components/users/UsersView';
import { ProgramsView } from './components/programs/ProgramsView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { GroupsView } from './components/groups/GroupsView';
import { EnrollmentView } from './components/enrollment/EnrollmentView';
import { GradesView } from './components/grades/GradesView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditView } from './components/audit/AuditView';
import { ArchitectureView } from './components/architecture/ArchitectureView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [selectedGroupIdForGrades, setSelectedGroupIdForGrades] = useState<string | undefined>(undefined);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleNavigateToGrades = (view: string, groupId?: string) => {
    setSelectedGroupIdForGrades(groupId);
    setActiveView(view);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        if (role === 'ADMIN') {
          return <AdminDashboard onNavigate={setActiveView} />;
        }
        if (role === 'COORDINADOR') {
          return <CoordinatorDashboard onNavigate={setActiveView} />;
        }
        if (role === 'DOCENTE') {
          return <TeacherDashboard onNavigate={handleNavigateToGrades} />;
        }
        if (role === 'ESTUDIANTE') {
          return <StudentDashboard onNavigate={setActiveView} />;
        }
        return <AdminDashboard onNavigate={setActiveView} />;

      case 'usuarios':
        return <UsersView />;

      case 'programas':
        return <ProgramsView />;

      case 'asignaturas':
        return <SubjectsView />;

      case 'grupos':
        return <GroupsView />;

      case 'matriculas':
        return <EnrollmentView />;

      case 'calificaciones':
        return <GradesView initialGroupId={selectedGroupIdForGrades} />;

      case 'reportes':
        return <ReportsView />;

      case 'auditoria':
        return <AuditView />;

      case 'arquitectura':
        return <ArchitectureView />;

      default:
        return <AdminDashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Enterprise Top Header */}
      <Header
        activeView={activeView}
        onOpenArchitecture={() => setIsArchModalOpen(true)}
        onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
      />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={setActiveView}
          isOpenMobile={isSidebarMobileOpen}
          onCloseMobile={() => setIsSidebarMobileOpen(false)}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Architecture & Defense Modal */}
      <Modal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
        title="Arquitectura Técnica & Modelo de Sustentación"
        subtitle="Especificación empresarial: 5 Capas, Spring Boot 3, Java 21, Spring Security, JWT y PostgreSQL."
        maxWidth="5xl"
      >
        <ArchitectureView />
      </Modal>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

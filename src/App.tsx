import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { AuthModal } from './components/auth/AuthModal';

import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { ClassManagement } from './components/academic/ClassManagement';
import { StudentManagement } from './components/academic/StudentManagement';
import { SubjectManagement } from './components/academic/SubjectManagement';
import { ScheduleManagement } from './components/academic/ScheduleManagement';

import { AttendanceSessionView } from './components/attendance/AttendanceSessionView';
import { StudentQRView } from './components/attendance/StudentQRView';
import { AttendanceRecapView } from './components/attendance/AttendanceRecapView';

import { TeachingJournalView } from './components/learning/TeachingJournalView';
import { AssessmentAndGradesView } from './components/learning/AssessmentAndGradesView';

import { HomeroomView } from './components/homeroom/HomeroomView';
import { SupervisionView } from './components/supervision/SupervisionView';
import { DocumentEngineView } from './components/documents/DocumentEngineView';
import { UserManagementView } from './components/admin/UserManagementView';
import { SettingsCenter } from './components/settings/SettingsCenter';
import { ClassLedgerAndReportCardView } from './components/reporting/ClassLedgerAndReportCardView';
import { DataImportExportHub } from './components/integration/DataImportExportHub';
import { AcademicAnalyticsAndEarlyWarning } from './components/analytics/AcademicAnalyticsAndEarlyWarning';
import { CloudSyncAndSecurityCenter } from './components/admin/CloudSyncAndSecurityCenter';
import { SystemIntegrationAndReadinessHub } from './components/integration/SystemIntegrationAndReadinessHub';
import { CommandPaletteModal } from './components/layout/CommandPaletteModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import {
  LayoutDashboard,
  Users,
  Award,
  BookOpen,
  Calendar,
  ClipboardCheck,
  QrCode,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  FileText,
  Settings,
  UserCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  School,
  GraduationCap,
  HelpCircle,
  Eye,
  TrendingUp,
  Upload,
  Cloud,
  CloudAlert,
  RefreshCw,
  Activity,
  Database,
  Search,
  Workflow,
  Sparkles,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, logout, isSupervisorMode, setSupervisorMode, allUsers, switchAccount } = useAuth();
  const { institutionSettings, terminology, activeAcademicYear, activeSemester, isOnline, syncStatus, offlineQueue } = useData();

  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const isAdmin = currentUser?.roles.includes('admin');
  const isSupervisor = currentUser?.roles.includes('supervisor');
  const isHomeroom = currentUser?.roles.includes('homeroom_teacher') || isAdmin;

  const handleNavigate = (mod: string) => {
    setActiveModule(mod);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
      {/* Supervisor Mode Floating Indicator */}
      {isSupervisorMode && (
        <div className="bg-indigo-900 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm z-50 print:hidden">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-300 animate-pulse" />
            <span>Mode Supervisi Pengawas Aktif (Read-Only) — Anda sedang mengamati data administratif guru.</span>
          </div>
          <button
            onClick={() => setSupervisorMode(false)}
            className="px-2.5 py-1 rounded-md bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-bold transition-colors"
          >
            Keluar Mode Supervisi
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand and Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center shadow-xs">
                D
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1.5">
                  <span>DADU</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase">
                    v2.5
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  Digitalisasi Data dari Guru
                </div>
              </div>
            </div>
          </div>

          {/* Center Info: Academic Year Badge & Cloud Sync Status */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            {/* Quick Command Palette Search Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer"
              title="Pencarian Cepat Menu & Data (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs">Cari cepat...</span>
              <kbd className="px-1.5 py-0.2 bg-white rounded border border-slate-300 font-mono text-[9px] font-bold text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 border border-slate-200">
              <School className="w-3.5 h-3.5 text-emerald-700" />
              <span className="truncate max-w-[180px]">{institutionSettings.institutionName}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              TP {activeAcademicYear?.name} • {activeSemester?.name}
            </div>

            {/* Cloud Sync Status Indicator */}
            <button
              onClick={() => handleNavigate('cloud_security')}
              className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                !isOnline || syncStatus === 'offline'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : syncStatus === 'syncing'
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Klik untuk membuka Pusat Sinkronisasi Cloud Firestore & Keamanan Data"
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              ) : !isOnline ? (
                <CloudAlert className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>
                {syncStatus === 'syncing'
                  ? 'Menyelaraskan...'
                  : !isOnline
                  ? `Offline (${offlineQueue.length})`
                  : 'Cloud Aktif'}
              </span>
            </button>
          </div>

          {/* User Profile & Account Switcher */}
          <div className="flex items-center gap-2">
            <div
              onClick={() => setIsAccountSwitcherOpen(true)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
              title="Ganti Peran / Akun"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                {currentUser?.fullName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-xs text-slate-900">{currentUser?.fullName}</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 capitalize">
                  <span>{currentUser?.roles[0]?.replace('_', ' ')}</span>
                  <span className="text-[9px] text-emerald-700 font-semibold">• Ganti</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex gap-6">
        {/* Left Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:z-auto lg:rounded-2xl lg:border lg:shadow-xs lg:h-fit p-4 shrink-0 flex flex-col justify-between print:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            {/* Mobile header close */}
            <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">Menu Navigasi DADU</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Group 1: Utama */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Menu Utama
              </div>
              <nav className="space-y-1 text-xs">
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'dashboard'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dashboard</span>
                </button>
              </nav>
            </div>

            {/* Menu Group 2: Master Akademik */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Data Master Akademik
              </div>
              <nav className="space-y-1 text-xs">
                <button
                  onClick={() => handleNavigate('classes')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'classes'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Rombel & Kelas</span>
                </button>

                <button
                  onClick={() => handleNavigate('students')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'students'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>Data Induk {terminology.student}</span>
                </button>

                <button
                  onClick={() => handleNavigate('subjects')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'subjects'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <span>{terminology.subject}</span>
                </button>

                <button
                  onClick={() => handleNavigate('schedule')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'schedule'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Jadwal Pelajaran</span>
                </button>

                <button
                  onClick={() => handleNavigate('data_hub')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'data_hub'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="flex items-center gap-1.5">
                    <span>Impor & Ekspor Data</span>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">Excel</span>
                  </span>
                </button>
              </nav>
            </div>

            {/* Menu Group 3: Presensi */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Presensi & QR Code
              </div>
              <nav className="space-y-1 text-xs">
                <button
                  onClick={() => handleNavigate('attendance_session')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'attendance_session'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 shrink-0" />
                  <span>Sesi Presensi Harian</span>
                </button>

                <button
                  onClick={() => handleNavigate('student_qr')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'student_qr'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>Kartu QR {terminology.student}</span>
                </button>

                <button
                  onClick={() => handleNavigate('attendance_recap')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'attendance_recap'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  <span>Rekap Kehadiran</span>
                </button>
              </nav>
            </div>

            {/* Menu Group 4: Pembelajaran & Penilaian */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Pembelajaran & Asesmen
              </div>
              <nav className="space-y-1 text-xs">
                <button
                  onClick={() => handleNavigate('journal')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'journal'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Jurnal Mengajar</span>
                </button>

                <button
                  onClick={() => handleNavigate('assessment')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'assessment'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Penilaian & Nilai</span>
                </button>

                <button
                  onClick={() => handleNavigate('ledger_reports')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'ledger_reports'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0 text-amber-600" />
                  <span className="flex items-center gap-1.5">
                    <span>Leger & Rapor Siswa</span>
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">Rapor</span>
                  </span>
                </button>

                <button
                  onClick={() => handleNavigate('homeroom')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'homeroom'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>Buku {terminology.homeroomTeacher}</span>
                </button>
              </nav>
            </div>

            {/* Menu Group 5: Supervisi & Dokumen Cetak */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Supervisi & Dokumen
              </div>
              <nav className="space-y-1 text-xs">
                <button
                  onClick={() => handleNavigate('analytics')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'analytics'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="flex items-center gap-1.5">
                    <span>Analitik & Deteksi Dini</span>
                    <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full">Radar</span>
                  </span>
                </button>

                <button
                  onClick={() => handleNavigate('supervision')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'supervision'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Supervisi Akademik</span>
                </button>

                <button
                  onClick={() => handleNavigate('document_engine')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'document_engine'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="flex items-center gap-1.5">
                    <span>Document Engine</span>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">Phase 4</span>
                  </span>
                </button>

                <button
                  onClick={() => handleNavigate('system_integration')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                    activeModule === 'system_integration'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Workflow className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="flex items-center gap-1.5">
                    <span>Integrasi Sistem</span>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">Phase 5</span>
                  </span>
                </button>
              </nav>
            </div>

            {/* Menu Group 6: Pengaturan & Hak Akses */}
            {isAdmin && (
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  Administrator
                </div>
                <nav className="space-y-1 text-xs">
                  <button
                    onClick={() => handleNavigate('users')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                      activeModule === 'users'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>Manajemen Pengguna</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('cloud_security')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                      activeModule === 'cloud_security'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span className="flex items-center gap-1.5">
                      <span>Cloud & Keamanan</span>
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">Phase 3</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleNavigate('settings')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                      activeModule === 'settings'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Pengaturan Sistem</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </aside>

        {/* Main View Area */}
        <main className="flex-1 min-w-0">
          <ErrorBoundary>
            {activeModule === 'dashboard' && <TeacherDashboard onNavigate={handleNavigate} />}
            {activeModule === 'classes' && <ClassManagement />}
            {activeModule === 'students' && <StudentManagement onOpenQRCard={() => handleNavigate('student_qr')} />}
            {activeModule === 'subjects' && <SubjectManagement />}
            {activeModule === 'schedule' && <ScheduleManagement />}
            {activeModule === 'data_hub' && <DataImportExportHub />}
            {activeModule === 'attendance_session' && <AttendanceSessionView />}
            {activeModule === 'student_qr' && <StudentQRView />}
            {activeModule === 'attendance_recap' && <AttendanceRecapView />}
            {activeModule === 'journal' && <TeachingJournalView />}
            {activeModule === 'assessment' && <AssessmentAndGradesView />}
            {activeModule === 'ledger_reports' && <ClassLedgerAndReportCardView />}
            {activeModule === 'homeroom' && <HomeroomView />}
            {activeModule === 'analytics' && <AcademicAnalyticsAndEarlyWarning />}
            {activeModule === 'supervision' && <SupervisionView />}
            {activeModule === 'document_engine' && <DocumentEngineView />}
            {activeModule === 'system_integration' && <SystemIntegrationAndReadinessHub onNavigate={handleNavigate} />}
            {activeModule === 'users' && <UserManagementView />}
            {activeModule === 'cloud_security' && <CloudSyncAndSecurityCenter />}
            {activeModule === 'settings' && <SettingsCenter />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Role / Account Switcher Modal */}
      {isAccountSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Ganti Akun / Peran Pengguna</h3>
              <button onClick={() => setIsAccountSwitcherOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Pilih akun pengguna simulasi untuk menguji hak akses RBAC (Admin, Guru, Wali Kelas, Supervisor):
            </p>

            <div className="space-y-2">
              {allUsers.map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    switchAccount(u.id);
                    setIsAccountSwitcherOpen(false);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    currentUser?.id === u.id
                      ? 'border-emerald-600 bg-emerald-50/60'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{u.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map(r => (
                      <span
                        key={r}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize"
                      >
                        {r.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </AuthProvider>
  );
}

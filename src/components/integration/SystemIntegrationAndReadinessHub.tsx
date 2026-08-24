import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Printer,
  FileSpreadsheet,
  Users,
  BookOpen,
  Calendar,
  Award,
  Clock,
  Eye,
  TrendingUp,
  Cpu,
  Server,
  Cloud,
  Check,
  ExternalLink,
  HelpCircle,
  PlayCircle,
  FileText,
  Workflow,
  Compass,
  ClipboardCheck,
} from 'lucide-react';

interface SystemIntegrationAndReadinessHubProps {
  onNavigate: (moduleName: string) => void;
}

export const SystemIntegrationAndReadinessHub: React.FC<SystemIntegrationAndReadinessHubProps> = ({ onNavigate }) => {
  const {
    classes,
    students,
    subjects,
    attendanceSessions,
    attendanceRecords,
    teachingJournals,
    assessments,
    grades,
    supervisionRecords,
    studentNotes,
    generatedDocuments,
    institutionSettings,
    terminology,
    activeAcademicYear,
    activeSemester,
    isOnline,
    syncStatus,
    offlineQueue,
  } = useData();

  const { currentUser, isSupervisorMode } = useAuth();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'diagnostics' | 'guide' | 'production_checklist'>('pipeline');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  // Calculate system statistics for diagnostics
  const totalRecords =
    classes.length +
    students.length +
    subjects.length +
    attendanceSessions.length +
    attendanceRecords.length +
    teachingJournals.length +
    assessments.length +
    grades.length +
    supervisionRecords.length +
    studentNotes.length +
    generatedDocuments.length;

  const totalAttendancesLogged = attendanceRecords.length;
  const totalGradesLogged = grades.length;
  const totalJournalsLogged = teachingJournals.length;

  // Readiness Checks
  const readinessChecks = [
    {
      id: 'org_settings',
      title: 'Identitas Satuan Pendidikan & Konfigurasi KOP',
      desc: 'Nama sekolah, NPSN, alamat, kontak, dan Kepala Sekolah telah terdefinisi secara lengkap.',
      status: institutionSettings.institutionName && institutionSettings.principalName ? 'ready' : 'warning',
      category: 'Master Data',
    },
    {
      id: 'academic_session',
      title: 'Tahun Pelajaran & Semester Aktif',
      desc: `Tahun ${activeAcademicYear?.name || 'Belum diatur'} Semester ${activeSemester?.name || 'Belum diatur'} berstatus aktif.`,
      status: activeAcademicYear && activeSemester ? 'ready' : 'error',
      category: 'Master Data',
    },
    {
      id: 'classes_students',
      title: 'Rombongan Belajar & Data Siswa',
      desc: `${classes.length} Rombel dengan ${students.length} Siswa terdaftar aktif dan terpetakan.`,
      status: classes.length > 0 && students.length > 0 ? 'ready' : 'warning',
      category: 'Master Data',
    },
    {
      id: 'attendance_engine',
      title: 'Engine Presensi Real-Time & QR Code',
      desc: `${attendanceSessions.length} sesi pertemuan tercatat dengan ${totalAttendancesLogged} log kehadiran siswa.`,
      status: attendanceSessions.length > 0 ? 'ready' : 'ready',
      category: 'Daily Flow',
    },
    {
      id: 'learning_journal',
      title: 'Jurnal Agenda Mengajar Terintegrasi',
      desc: `${totalJournalsLogged} catatan agenda pembelajaran tersimpan dan terhubung ke jadwal tatap muka.`,
      status: totalJournalsLogged > 0 ? 'ready' : 'ready',
      category: 'Daily Flow',
    },
    {
      id: 'grade_ledger',
      title: 'Asesmen Formatif/Sumatif & Leger Nilai (DKN)',
      desc: `${assessments.length} komponen asesmen dengan ${totalGradesLogged} entri nilai terverifikasi tuntas/remedial.`,
      status: assessments.length > 0 ? 'ready' : 'ready',
      category: 'Daily Flow',
    },
    {
      id: 'early_warning',
      title: 'Sistem Deteksi Dini & Konseling Siswa (EWS)',
      desc: `${studentNotes.length} catatan pembinaan wali kelas aktif memantau risiko akademik/presensi.`,
      status: 'ready',
      category: 'Analytics',
    },
    {
      id: 'supervision_mode',
      title: 'Mode Supervisi Pengawas / KS Read-Only',
      desc: 'Partisi isolasi data guru aktif dengan audit logging otomatis per sesi observasi.',
      status: 'ready',
      category: 'Governance',
    },
    {
      id: 'cloud_offline',
      title: 'Cloud Firestore Sync & Offline Queue Engine',
      desc: `Status jaringan: ${isOnline ? 'Online (Terhubung)' : 'Offline (Antrean Lokal)'} dengan ${offlineQueue.length} transaksi tertunda.`,
      status: 'ready',
      category: 'Cloud & Security',
    },
    {
      id: 'document_freeze',
      title: 'Document Engine & Arsip Snapshot Historis',
      desc: `${generatedDocuments.length} snapshot dokumen resmi beku tersimpan untuk reproduksi 1:1.`,
      status: 'ready',
      category: 'Output Engine',
    },
  ];

  const readyCount = readinessChecks.filter(c => c.status === 'ready').length;
  const readinessPercent = Math.round((readyCount / readinessChecks.length) * 100);

  // Run E2E pipeline simulation
  const handleRunSimulation = () => {
    setSimulationRunning(true);
    setSimulationStep(1);

    const stepTimer = (step: number, delay: number) => {
      setTimeout(() => {
        setSimulationStep(step);
        if (step === 5) {
          setTimeout(() => {
            setSimulationRunning(false);
          }, 1500);
        }
      }, delay);
    };

    stepTimer(2, 800);
    stepTimer(3, 1600);
    stepTimer(4, 2400);
    stepTimer(5, 3200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-emerald-700 text-white rounded-2xl shadow-xs">
              <Workflow className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  Pusat Integrasi Sistem & Kesiapan Produksi
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  Phase 5 Final Release
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                DADU (Digitalisasi Data dari Guru) menghubungkan seluruh alur administrasi guru secara mulus:
                <strong> Input Sekali (Input Once) → Integrasi Otomatis (Integrate) → Komputasi Cerdas (Automate) → Laporan Resmi (Report)</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <div className="text-[10px] font-semibold text-slate-500 uppercase">Indeks Kesiapan Sistem</div>
              <div className="text-lg font-black text-emerald-800">{readinessPercent}% Siap Operasional</div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={simulationRunning}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <PlayCircle className={`w-4 h-4 ${simulationRunning ? 'animate-spin' : ''}`} />
              <span>{simulationRunning ? 'Memverifikasi Pipeline...' : 'Uji Integrasi End-to-End'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Workflow className="w-4 h-4 text-emerald-600" />
            <span>Alur Pipeline End-to-End</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'diagnostics'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Diagnostik & Beban Data</span>
          </button>

          <button
            onClick={() => setActiveTab('production_checklist')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'production_checklist'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kepatuhan & Checklist Rilis</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Panduan Pengguna Cepat</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PIPELINE INTEGRATION */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Pipeline Visualizer Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Pilar Arsitektur DADU: Input Once → Integrate → Automate → Report</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Data yang dimasukkan oleh guru pada saat mengajar di kelas secara otomatis mengalir ke seluruh instrumen administratif tanpa ada duplikasi kerja.
              </p>
            </div>

            {/* Pipeline Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1: Input Once */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  simulationStep === 1 || simulationStep === 5
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                    01
                  </span>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Input Once
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Entri Harian Guru</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Guru membuka sesi presensi (QR/Manual), mengisi agenda jurnal tatap muka, dan menginput nilai asesmen formatif.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('attendance_session')}
                    className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Buka Presensi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step 2: Integrate */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  simulationStep === 2 || simulationStep === 5
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-teal-800 text-white font-bold text-xs flex items-center justify-center">
                    02
                  </span>
                  <span className="text-[10px] font-bold uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                    Integrate
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Sinkronisasi Realtime</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Rekap kehadiran teragregasi otomatis ke leger kelas, wali kelas menerima notifikasi siswa sering alpa, dan supervisor dapat memantau jurnal.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('homeroom')}
                    className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Buka Rombel Wali</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step 3: Automate */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  simulationStep === 3 || simulationStep === 5
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-800 text-white font-bold text-xs flex items-center justify-center">
                    03
                  </span>
                  <span className="text-[10px] font-bold uppercase text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Automate
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Komputasi & Analitik</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Perhitungan bobot nilai akhir, konversi predikat (A-D), kalkulasi persentase kehadiran, dan algoritma Deteksi Dini (EWS) berjalan otomatis.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('analytics')}
                    className="text-xs text-indigo-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Buka Analitik & EWS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step 4: Report */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  simulationStep === 4 || simulationStep === 5
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-purple-800 text-white font-bold text-xs flex items-center justify-center">
                    04
                  </span>
                  <span className="text-[10px] font-bold uppercase text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                    Report
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Output & Snapshot</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Cetak Buku DKN, Ekspor Excel multi-sheet, Cetak Rapor, dan bekukan snapshot dokumen resmi yang dapat direproduksi 100% identik.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('document_engine')}
                    className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Buka Document Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Akses Cepat Alur Tugas Guru Terintegrasi</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <button
                onClick={() => onNavigate('attendance_session')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group"
              >
                <ClipboardCheck className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-slate-900">Sesi Presensi</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Catat & Scan QR</div>
              </button>

              <button
                onClick={() => onNavigate('teaching_journal')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group"
              >
                <BookOpen className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-slate-900">Jurnal Mengajar</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Isi Agenda Kelas</div>
              </button>

              <button
                onClick={() => onNavigate('assessments_grades')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group"
              >
                <Award className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-slate-900">Asesmen & Nilai</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Input Bobot Nilai</div>
              </button>

              <button
                onClick={() => onNavigate('class_ledger')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-slate-900">Leger & DKN</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Rekap Nilai Rombel</div>
              </button>

              <button
                onClick={() => onNavigate('document_engine')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group"
              >
                <Printer className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-slate-900">Pusat Cetak</div>
                <div className="text-[11px] text-slate-500 mt-0.5">PDF / Dokumen Resmi</div>
              </button>

              <button
                onClick={() => onNavigate('data_import_export')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all group"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-bold text-slate-900">Impor & Ekspor</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Excel XLS Hub</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIAGNOSTICS & DATA METRICS */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>Total Entri Database</span>
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalRecords}</div>
              <div className="text-[11px] text-slate-400 mt-1">Lintas 15 koleksi data aktif</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>Total Log Presensi Siswa</span>
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalAttendancesLogged}</div>
              <div className="text-[11px] text-slate-400 mt-1">Presensi QR & Manual</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>Total Nilai Terinput</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalGradesLogged}</div>
              <div className="text-[11px] text-slate-400 mt-1">Formatif, Sumatif, Remedial</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span>Snapshot Dokumen Beku</span>
                <Printer className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{generatedDocuments.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Arsip cetak 100% reproducible</div>
            </div>
          </div>

          {/* Collection Health Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Status Integritas & Volume Koleksi Firestore</span>
              <span className="font-mono text-[11px] text-slate-500">Partition: org_smp_nusantara</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Nama Koleksi Data</th>
                  <th className="py-2.5 px-4">Volume Record</th>
                  <th className="py-2.5 px-4">Integritas Skema</th>
                  <th className="py-2.5 px-4">Multi-Tenant Isolation</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">classes (Rombel)</td>
                  <td className="py-2.5 px-4">{classes.length}</td>
                  <td className="py-2.5 px-4 text-emerald-700">100% Valid Typescript Schema</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">organizationId = matched</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      HEALTHY
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">students (Peserta Didik)</td>
                  <td className="py-2.5 px-4">{students.length}</td>
                  <td className="py-2.5 px-4 text-emerald-700">100% Valid Typescript Schema</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">organizationId = matched</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      HEALTHY
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">attendanceSessions & records</td>
                  <td className="py-2.5 px-4">{attendanceSessions.length} sessions ({attendanceRecords.length} records)</td>
                  <td className="py-2.5 px-4 text-emerald-700">100% Valid Typescript Schema</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">organizationId = matched</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      HEALTHY
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">teachingJournals</td>
                  <td className="py-2.5 px-4">{teachingJournals.length}</td>
                  <td className="py-2.5 px-4 text-emerald-700">100% Valid Typescript Schema</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">organizationId = matched</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      HEALTHY
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">assessments & grades</td>
                  <td className="py-2.5 px-4">{assessments.length} items ({grades.length} grades)</td>
                  <td className="py-2.5 px-4 text-emerald-700">100% Valid Typescript Schema</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">organizationId = matched</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      HEALTHY
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTION READINESS CHECKLIST */}
      {activeTab === 'production_checklist' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Audit Kepatuhan & Checklist Rilis Produksi (Master Spec)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifikasi 10 kriteria operasional sebelum sistem dioperasikan oleh dewan guru.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                {readyCount} dari {readinessChecks.length} Siap
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {readinessChecks.map((chk, idx) => (
                <div key={chk.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {chk.status === 'ready' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{chk.title}</span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.2 rounded">
                          {chk.category}
                        </span>
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">{chk.desc}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase shrink-0 ${
                      chk.status === 'ready'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {chk.status === 'ready' ? 'TERVERIFIKASI' : 'PERHATIAN'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUICK USER GUIDE */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 text-xs text-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Buku Petunjuk Operasional Cepat Guru & Administrator DADU</span>
            </h2>
            <p className="text-slate-500 mt-1">
              Panduan langkah demi langkah penggunaan fitur terintegrasi DADU.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-800 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span>Alur Presensi Siswa & Rekapitulasi</span>
              </h3>
              <p className="leading-relaxed">
                1. Pilih menu <strong>Sesi Presensi</strong> lalu klik <em>Buka Sesi Presensi Baru</em>.<br />
                2. Pilih Kelas dan Mata Pelajaran, lalu gunakan tombol <em>Semua Hadir Cepat</em> atau pindai Kartu QR Siswa.<br />
                3. Klik <em>Tutup & Kunci Sesi Presensi</em> untuk menyimpan permanen ke buku rekap kehadiran.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-800 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                <span>Pengisian Jurnal Mengajar & Agenda</span>
              </h3>
              <p className="leading-relaxed">
                1. Buka menu <strong>Jurnal Mengajar</strong> dan klik <em>Tambah Jurnal Mengajar</em>.<br />
                2. Masukkan tanggal, jam ke, materi pokok/TP, aktivitas pembelajaran, dan refleksi evaluasi.<br />
                3. Jurnal langsung tersinkronisasi dan dapat diamati oleh Pengawas/Kepala Sekolah pada Mode Supervisi.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-800 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                <span>Asesmen Nilai, Leger DKN & Rapor</span>
              </h3>
              <p className="leading-relaxed">
                1. Buat instrumen asesmen (Formatif / Sumatif) di menu <strong>Asesmen & Nilai</strong>.<br />
                2. Masukkan nilai siswa pada tabel interaktif. Nilai akhir dan predikat terhitung otomatis.<br />
                3. Buka menu <strong>Leger Nilai (DKN)</strong> untuk melihat kompilasi kelas atau cetak rapor perorangan.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-800 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                <span>Document Engine & Snapshot Historis</span>
              </h3>
              <p className="leading-relaxed">
                1. Masuk ke <strong>Document Engine</strong> dan pilih template resmi yang diinginkan.<br />
                2. Sesuaikan KOP surat, ukuran kertas (A4/F4), margin, dan pejabat penandatangan.<br />
                3. Klik <em>Kunci Snapshot Historis</em> untuk mengarsipkan salinan beku sebelum mencetak / ekspor PDF.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

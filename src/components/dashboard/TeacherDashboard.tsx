import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Calendar,
  Users,
  BookOpen,
  ClipboardCheck,
  Award,
  Clock,
  PlusCircle,
  QrCode,
  FileText,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { formatDateIndonesian } from '../../lib/utils';

interface TeacherDashboardProps {
  onNavigate: (module: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const {
    institutionSettings,
    terminology,
    activeAcademicYear,
    activeSemester,
    classes,
    students,
    subjects,
    schedules,
    attendanceSessions,
    teachingJournals,
    assessments,
  } = useData();

  const todayName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date());
  const todayDateStr = formatDateIndonesian(new Date().toISOString());

  // Filter schedules for today or current teacher
  const todaySchedules = schedules.filter(s => 
    s.teacherId === currentUser?.id || currentUser?.roles.includes('admin')
  );

  // Stats calculation
  const totalClassesCount = classes.length;
  const totalStudentsCount = students.length;
  const totalSubjectsCount = subjects.length;
  const journalsCount = teachingJournals.filter(j => j.teacherId === currentUser?.id || currentUser?.roles.includes('admin')).length;
  const attendanceSessionsCount = attendanceSessions.filter(a => a.teacherId === currentUser?.id || currentUser?.roles.includes('admin')).length;

  return (
    <div className="space-y-6">
      {/* Hero / Greeting Bar */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {institutionSettings.institutionName} • TP {activeAcademicYear?.name} ({activeSemester?.name})
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Selamat Datang, {currentUser?.displayName || currentUser?.fullName}!
            </h1>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-xl">
              {todayName}, {todayDateStr}. Pantau seluruh administrasi pembelajaran, presensi, jurnal, dan penilaian dalam satu ekosistem terpadu.
            </p>
          </div>

          {/* Quick Action Grid */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('attendance_session')}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 font-semibold text-xs hover:bg-emerald-50 transition-all shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Presensi</span>
            </button>
            <button
              onClick={() => onNavigate('journal')}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs transition-all border border-emerald-500/30 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-200" />
              <span>+ Jurnal</span>
            </button>
            <button
              onClick={() => onNavigate('assessment')}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold text-xs transition-all border border-emerald-500/30 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-emerald-200" />
              <span>+ Penilaian</span>
            </button>
            <button
              onClick={() => onNavigate('student_qr')}
              className="px-3.5 py-2 rounded-xl bg-teal-900/60 hover:bg-teal-900 text-emerald-100 font-semibold text-xs transition-all border border-teal-500/30 flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-teal-300" />
              <span>QR {terminology.student}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('classes')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kelas</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{totalClassesCount}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Rombel aktif semester ini</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total {terminology.student}</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{totalStudentsCount}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-teal-600 font-medium">100% Memiliki QR ID</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('attendance_session')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sesi Presensi</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{attendanceSessionsCount}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Manual & QR Presensi</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('journal')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jurnal Mengajar</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{journalsCount}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-amber-700 font-medium">Terekam & Terintegrasi</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Schedules & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's / Weekly Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h2 className="font-bold text-slate-800 text-sm">Jadwal Mengajar & Aktivitas Terdekat</h2>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Lihat Semua Jadwal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {todaySchedules.length > 0 ? (
              todaySchedules.map(sch => {
                const cls = classes.find(c => c.id === sch.classId);
                const subj = subjects.find(s => s.id === sch.subjectId);
                return (
                  <div key={sch.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold text-xs flex flex-col items-center justify-center shrink-0">
                        <span>{sch.dayOfWeek.slice(0, 3)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                          <span>{subj?.name || 'Mata Pelajaran'}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-600">
                            {cls?.name || 'Kelas'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="font-medium text-emerald-700">{sch.startTime} - {sch.endTime} WIB</span>
                          <span>•</span>
                          <span>{sch.room || 'Ruang Kelas'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('attendance_session')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-medium transition-colors"
                        title="Buka Presensi"
                      >
                        Presensi
                      </button>
                      <button
                        onClick={() => onNavigate('journal')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium transition-colors"
                        title="Isi Jurnal"
                      >
                        Jurnal
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada jadwal mengajar yang terdaftar. Tambahkan di menu Akademik &gt; Jadwal.
              </div>
            )}
          </div>
        </div>

        {/* System & Workflow Highlights */}
        <div className="space-y-4">
          <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 border border-slate-700/60 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Filosofi DADU</span>
            </div>
            <h3 className="font-bold text-sm text-white">Input Once → Integrate → Automate → Report</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Setiap presensi dan jurnal yang Anda catat langsung mengalir otomatis ke rekapitulasi nilai, profil siswa, catatan wali kelas, dan siap dicetak/PDF sewaktu-waktu.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Status Sinkronisasi</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Realtime Aktif
              </span>
            </div>
          </div>

          {/* Document Engine Quick Link */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Pusat Laporan & Cetak</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Cetak rekap presensi, rekap nilai, jurnal agenda mengajar dengan format resmi KOP sekolah & tanda tangan ganda.
            </p>
            <button
              onClick={() => onNavigate('document_engine')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Buka Document Engine</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Phase 5 Integration Hub Quick Link */}
          <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Pusat Integrasi & Kesiapan</span>
              </div>
              <span className="text-[9px] font-bold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full uppercase">
                Phase 5
              </span>
            </div>
            <p className="text-xs text-emerald-800/80 mb-3 leading-relaxed">
              Pantau alur data end-to-end (Input Once → Integrate → Automate → Report), diagnostik beban data, dan checklist kepatuhan produksi.
            </p>
            <button
              onClick={() => onNavigate('system_integration')}
              className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Buka Pusat Integrasi</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

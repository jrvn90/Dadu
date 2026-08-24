import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardCheck,
  QrCode,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  CheckSquare,
  Sparkles,
  Save,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Camera,
  Search,
} from 'lucide-react';
import { AttendanceMode, AttendanceStatus, AttendanceSession } from '../../types';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { CameraQrScannerModal } from './CameraQrScannerModal';

const AttendanceSessionViewContent: React.FC = () => {
  const {
    classes,
    subjects,
    schedules,
    students,
    attendanceSessions,
    attendanceRecords,
    createAttendanceSession,
    recordStudentAttendance,
    batchMarkAttendance,
    closeAttendanceSession,
    terminology,
  } = useData();

  const { currentUser } = useAuth();

  // Active or new session selection states
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedMode, setSelectedMode] = useState<AttendanceMode>('manual');
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(() => {
    return attendanceSessions.find(s => s.status === 'open') || null;
  });

  // Camera QR Scanner Modal State
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // QR Simulator / Manual input
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  // Students in selected class
  const targetClassId = activeSession ? activeSession.classId : selectedClassId;
  const currentClassStudents = useMemo(() => {
    return students.filter(s => s.classId === targetClassId);
  }, [students, targetClassId]);

  // Current session attendance map
  const sessionRecords = useMemo(() => {
    if (!activeSession) return {};
    const map: Record<string, { status: AttendanceStatus; method: string; note?: string }> = {};
    attendanceRecords
      .filter(r => r.sessionId === activeSession.id)
      .forEach(r => {
        map[r.studentId] = { status: r.status, method: r.method, note: r.note };
      });
    return map;
  }, [attendanceRecords, activeSession]);

  const handleStartSession = () => {
    if (!selectedClassId || !selectedSubjectId) {
      alert('Pilih kelas dan mata pelajaran terlebih dahulu.');
      return;
    }
    const session = createAttendanceSession({
      classId: selectedClassId,
      subjectId: selectedSubjectId,
      mode: selectedMode,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    });
    setActiveSession(session);
    setScanFeedback(null);

    // If QR mode, offer to open camera immediately
    if (selectedMode === 'qr' || selectedMode === 'hybrid') {
      setIsCameraScannerOpen(true);
    }
  };

  const handleMarkStatus = (studentId: string, status: AttendanceStatus) => {
    if (!activeSession) return;
    recordStudentAttendance(activeSession.id, studentId, status, 'manual');
  };

  const handleMarkAllHadir = () => {
    if (!activeSession) return;
    const records = currentClassStudents.map(st => ({
      studentId: st.id,
      status: 'Hadir' as AttendanceStatus,
    }));
    batchMarkAttendance(activeSession.id, records);
  };

  const processQrToken = (token: string) => {
    if (!activeSession) return;
    const trimmed = token.trim();
    if (!trimmed) return;

    // Validate QR Token against class students
    const matchedStudent = currentClassStudents.find(
      s =>
        s.qrToken?.toLowerCase() === trimmed.toLowerCase() ||
        s.nis === trimmed ||
        `DADU_${s.nis}`.toLowerCase() === trimmed.toLowerCase()
    );

    if (!matchedStudent) {
      setScanFeedback({
        status: 'error',
        message: `QR Token "${trimmed}" tidak valid atau ${terminology.student} tidak terdaftar di kelas ini.`,
      });
      return;
    }

    recordStudentAttendance(activeSession.id, matchedStudent.id, 'Hadir', 'qr_scan');
    setScanFeedback({
      status: 'success',
      message: `Presensi Berhasil: ${matchedStudent.fullName} (${matchedStudent.nis}) tercatat HADIR via QR Scanner.`,
    });
    setQrTokenInput('');
  };

  const handleScanQRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQrToken(qrTokenInput);
  };

  const handleCloseSession = () => {
    if (!activeSession) return;
    if (window.confirm('Simpan dan tutup sesi presensi ini? Rekap kehadiran akan difinalisasi.')) {
      closeAttendanceSession(activeSession.id);
      setActiveSession(null);
      setIsCameraScannerOpen(false);
    }
  };

  const recordValues = Object.values(sessionRecords) as { status: AttendanceStatus; method: string; note?: string }[];
  const presentCount = recordValues.filter(r => r.status === 'Hadir').length;
  const sickCount = recordValues.filter(r => r.status === 'Sakit').length;
  const permissionCount = recordValues.filter(r => r.status === 'Izin').length;
  const alphaCount = recordValues.filter(r => r.status === 'Alpa').length;
  const dispCount = recordValues.filter(r => r.status === 'Dispensasi').length;

  const currentClassName = classes.find(c => c.id === (activeSession?.classId || selectedClassId))?.name || 'Kelas';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sesi Presensi {terminology.student}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Mode Presensi Fleksibel: Manual Spreadsheet, Scan Kamera Langsung, atau Kartu QR Siswa.
          </p>
        </div>
        {activeSession && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Sesi Sedang Berlangsung ({activeSession.mode.toUpperCase()})
            </span>
          </div>
        )}
      </div>

      {/* Start Session Setup Card (if no active session) */}
      {!activeSession ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Mulai Sesi Presensi Baru</h2>
              <p className="text-xs text-slate-500">Tentukan kelas, mata pelajaran, dan metode presensi hari ini.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kelas</label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({students.filter(s => s.classId === c.id).length} Siswa)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{terminology.subject}</label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mode selection buttons */}
            <div>
              <label className="block font-semibold text-slate-700 mb-2">Metode Presensi</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMode('manual')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedMode === 'manual'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                    <span>Manual</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Klik langsung status kehadiran tiap siswa</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode('qr')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedMode === 'qr'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>Scan QR</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Kamera web / kartu QR token</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode('hybrid')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedMode === 'hybrid'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Hybrid</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Kombinasi QR scan + penyesuaian manual</div>
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleStartSession}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Buka Sesi Presensi Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Session Workspace */
        <div className="space-y-6">
          {/* Top Session Stats Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">
                Kelas: <span className="font-bold text-slate-800">{classes.find(c => c.id === activeSession.classId)?.name}</span> •{' '}
                Mapel: <span className="font-bold text-slate-800">{subjects.find(s => s.id === activeSession.subjectId)?.name}</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                Tanggal: {activeSession.date} • Pukul: {activeSession.startTime} WIB
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                Hadir: {presentCount}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
                Sakit: {sickCount}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200">
                Izin: {permissionCount}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-bold border border-rose-200">
                Alpa: {alphaCount}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-bold border border-purple-200">
                Dispensasi: {dispCount}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllHadir}
                className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Semua Hadir</span>
              </button>
              <button
                type="button"
                onClick={handleCloseSession}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan & Selesai</span>
              </button>
            </div>
          </div>

          {/* QR Scanner / Live Camera Controller (if QR or Hybrid mode) */}
          {(activeSession.mode === 'qr' || activeSession.mode === 'hybrid') && (
            <div className="bg-linear-to-br from-teal-900 to-emerald-950 text-white rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-700/60">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-teal-300" />
                  <h3 className="font-bold text-sm">Pemindai QR Presensi ({terminology.student})</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraScannerOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Buka Kamera Langsung</span>
                  </button>
                </div>
              </div>

              {scanFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                    scanFeedback.status === 'success'
                      ? 'bg-emerald-800/90 text-emerald-100 border border-emerald-500/40'
                      : 'bg-rose-900/90 text-rose-100 border border-rose-500/40'
                  }`}
                >
                  {scanFeedback.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                  )}
                  <span className="font-medium">{scanFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleScanQRSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={qrTokenInput}
                  onChange={e => setQrTokenInput(e.target.value)}
                  placeholder="Ketik NIS siswa atau gunakan pemindai barcode USB..."
                  className="grow px-3.5 py-2.5 rounded-xl bg-teal-950/80 text-white placeholder-teal-300/50 border border-teal-600/50 text-xs focus:ring-2 focus:ring-teal-400 focus:outline-hidden font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Scan
                </button>
              </form>
            </div>
          )}

          {/* Student Attendance List Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">No</th>
                    <th className="py-3.5 px-4">NIS</th>
                    <th className="py-3.5 px-4">Nama Lengkap {terminology.student}</th>
                    <th className="py-3.5 px-4">Metode</th>
                    <th className="py-3.5 px-4 text-center">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {currentClassStudents.map((st, idx) => {
                    const rec = sessionRecords[st.id];
                    const currentStatus = rec?.status;
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{st.nis}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{st.fullName}</td>
                        <td className="py-3 px-4">
                          {rec?.method === 'qr_scan' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                              <QrCode className="w-2.5 h-2.5" />
                              QR Scan
                            </span>
                          ) : currentStatus ? (
                            <span className="text-[10px] text-slate-500 font-medium">Manual</span>
                          ) : (
                            <span className="text-[10px] text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
                            {(['Hadir', 'Sakit', 'Izin', 'Alpa', 'Dispensasi'] as AttendanceStatus[]).map(status => {
                              const isSelected = currentStatus === status;
                              let activeClass = 'bg-slate-200 text-slate-800';
                              if (isSelected) {
                                if (status === 'Hadir') activeClass = 'bg-emerald-600 text-white font-bold shadow-xs';
                                if (status === 'Sakit') activeClass = 'bg-blue-600 text-white font-bold shadow-xs';
                                if (status === 'Izin') activeClass = 'bg-amber-600 text-white font-bold shadow-xs';
                                if (status === 'Alpa') activeClass = 'bg-rose-600 text-white font-bold shadow-xs';
                                if (status === 'Dispensasi') activeClass = 'bg-purple-600 text-white font-bold shadow-xs';
                              }

                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleMarkStatus(st.id, status)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                                    isSelected
                                      ? activeClass
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                                  }`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Scanner Modal */}
      <CameraQrScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={processQrToken}
        targetClassName={currentClassName}
      />
    </div>
  );
};

export const AttendanceSessionView: React.FC = () => {
  return (
    <ErrorBoundary
      fallbackTitle="Kendala Memuat Sesi Presensi"
      fallbackMessage="Terjadi kendala saat memuat data sesi presensi atau perangkat pemindai. Data tetap tersimpan."
    >
      <AttendanceSessionViewContent />
    </ErrorBoundary>
  );
};

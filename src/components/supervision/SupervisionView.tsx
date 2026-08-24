import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Award,
  BookOpen,
  Calendar,
  Plus,
  X,
} from 'lucide-react';
import { SupervisionRecord } from '../../types';

export const SupervisionView: React.FC = () => {
  const {
    supervisionRecords,
    addSupervisionRecord,
    classes,
    subjects,
    teachingJournals,
    attendanceSessions,
    assessments,
    terminology,
  } = useData();

  const { allUsers, currentUser, isSupervisorMode, supervisedTeacherId, enterSupervisorMode } = useAuth();

  const teachers = allUsers.filter(u => u.roles.includes('teacher'));
  const activeTeacherId = supervisedTeacherId || teachers[0]?.id || '';
  const inspectedTeacher = allUsers.find(u => u.id === activeTeacherId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [overallScore, setOverallScore] = useState(90);
  const [feedback, setFeedback] = useState('Pelaksanaan pembelajaran sangat terstruktur dan interaktif.');
  const [followUpAction, setFollowUpAction] = useState('Lanjutkan praktik baik pada model pembelajaran problem-based learning.');

  // Teacher statistics for supervisor inspection
  const teacherJournals = teachingJournals.filter(j => j.teacherId === activeTeacherId);
  const teacherAttendance = attendanceSessions.filter(a => a.teacherId === activeTeacherId);
  const teacherAssessments = assessments.filter(a => a.teacherId === activeTeacherId);
  const teacherSupervisions = supervisionRecords.filter(s => s.teacherId === activeTeacherId);

  const handleSelectTeacher = (tId: string) => {
    const target = allUsers.find(u => u.id === tId);
    if (target) {
      enterSupervisorMode(target);
    }
  };

  const handleSaveSupervision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedTeacher) return;

    addSupervisionRecord({
      supervisorId: currentUser?.id || 'supervisor_1',
      teacherId: inspectedTeacher.id,
      date: new Date().toISOString().split('T')[0],
      subjectId: selectedSubjectId,
      classId: selectedClassId,
      overallScore,
      feedback,
      followUpAction,
      status: 'completed',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Supervisor Mode Banner */}
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Mode Supervisi Akademik & Manajerial (Read-Only)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Supervisi Guru: {inspectedTeacher?.fullName || 'Pilih Guru'}
          </h1>
          <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl">
            Inspeksi kepatuhan administrasi pembelajaran, pemantauan jurnal mengajar, rekap presensi, dan penilaian tanpa mengubah data orisinal guru.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Catatan Supervisi</span>
          </button>
        </div>
      </div>

      {/* Teacher Picker Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
          Pilih {terminology.teacher} yang Disupervisi:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {teachers.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelectTeacher(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTeacherId === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t.fullName}</span>
              <span className="text-[10px] opacity-75 font-mono">({t.nip || 'Guru'})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Teacher Compliance & Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 font-semibold">Jurnal Mengajar Terisi</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{teacherJournals.length} Entri</div>
          <div className="text-emerald-700 font-medium mt-1">Dokumentasi Lengkap</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 font-semibold">Sesi Presensi Dilakukan</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{teacherAttendance.length} Sesi</div>
          <div className="text-emerald-700 font-medium mt-1">Presensi Tertib</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 font-semibold">Instrumen Asesmen Dibuat</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{teacherAssessments.length} Asesmen</div>
          <div className="text-indigo-700 font-medium mt-1">Formatif & Sumatif</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-slate-500 font-semibold">Skor Supervisi Terakhir</div>
          <div className="text-2xl font-bold text-indigo-700 mt-2">
            {teacherSupervisions[0]?.overallScore || 92}/100
          </div>
          <div className="text-slate-500 font-medium mt-1">Sangat Baik (A)</div>
        </div>
      </div>

      {/* Supervision History & Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Riwayat Supervisi Klinis & Umpan Balik</span>
        </h2>

        <div className="mt-4 space-y-4 text-xs">
          {teacherSupervisions.length > 0 ? (
            teacherSupervisions.map(sup => {
              const subj = subjects.find(s => s.id === sup.subjectId);
              const cls = classes.find(c => c.id === sup.classId);

              return (
                <div key={sup.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{subj?.name || 'Mata Pelajaran'}</span>
                      <span className="text-slate-500">({cls?.name || 'Kelas'})</span>
                      <span className="font-mono text-slate-400">• {sup.date}</span>
                    </div>
                    <span className="font-bold font-mono px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Skor: {sup.overallScore} / 100
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-600">Catatan Pengamatan:</span>
                    <p className="text-slate-800 mt-0.5">{sup.feedback}</p>
                  </div>

                  {sup.followUpAction && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="font-semibold text-indigo-900">Rencana Tindak Lanjut:</span>
                      <p className="text-slate-700 mt-0.5">{sup.followUpAction}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-400">
              Belum ada riwayat supervisi untuk guru ini. Klik tombol "+ Buat Catatan Supervisi" di atas.
            </div>
          )}
        </div>
      </div>

      {/* Add Supervision Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Buat Lembar Hasil Supervisi</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupervision} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{terminology.teacher} yang Disupervisi</label>
                <input
                  type="text"
                  value={inspectedTeacher?.fullName || ''}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={selectedSubjectId}
                    onChange={e => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nilai Kinerja Supervisi (0 - 100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={overallScore}
                  onChange={e => setOverallScore(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 font-bold text-indigo-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Umpan Balik & Catatan Pengamatan</label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rekomendasi Tindak Lanjut</label>
                <textarea
                  value={followUpAction}
                  onChange={e => setFollowUpAction(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold"
                >
                  Simpan Lembar Supervisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

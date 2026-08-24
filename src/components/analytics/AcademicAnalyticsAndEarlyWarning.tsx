import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Student, Subject, ClassRoom } from '../../types';

export const AcademicAnalyticsAndEarlyWarning: React.FC = () => {
  const {
    classes,
    students,
    subjects,
    assessments,
    grades,
    attendanceSessions,
    attendanceRecords,
    studentNotes,
    addStudentNote,
    terminology,
    activeAcademicYear,
    activeSemester,
  } = useData();

  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [activeInterventionModal, setActiveInterventionModal] = useState<{
    student: Student;
    reason: string;
  } | null>(null);
  const [interventionNote, setInterventionNote] = useState('');
  const [interventionAction, setInterventionAction] = useState('Konseling Wali Kelas');

  const filteredStudents = selectedClassId === 'ALL'
    ? students
    : students.filter(s => s.classId === selectedClassId);

  // Helper to compute average grade for student
  const getStudentAverageScore = (studentId: string): { avg: number; underKkmCount: number } => {
    let totalScore = 0;
    let count = 0;
    let underKkm = 0;

    subjects.forEach(subj => {
      const subjAssessments = assessments.filter(a => a.subjectId === subj.id);
      const studentGrades: number[] = [];

      subjAssessments.forEach(a => {
        const g = grades.find(gr => gr.assessmentId === a.id && gr.studentId === studentId);
        if (g && g.score !== undefined) {
          studentGrades.push(g.score);
        }
      });

      if (studentGrades.length > 0) {
        const avgSubj = Math.round(studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length);
        totalScore += avgSubj;
        count++;
        if (avgSubj < (subj.defaultPassingScore || 75)) {
          underKkm++;
        }
      }
    });

    return {
      avg: count > 0 ? Math.round(totalScore / count) : 0,
      underKkmCount: underKkm,
    };
  };

  // Helper to compute student attendance rate
  const getStudentAttendanceStats = (studentId: string) => {
    const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);
    const hadir = studentRecords.filter(r => r.status === 'Hadir' || r.status === 'Dispensasi').length;
    const sakit = studentRecords.filter(r => r.status === 'Sakit').length;
    const izin = studentRecords.filter(r => r.status === 'Izin').length;
    const alpa = studentRecords.filter(r => r.status === 'Alpa').length;
    const total = studentRecords.length || 1;
    const rate = Math.round((hadir / total) * 100);

    return { hadir, sakit, izin, alpa, total, rate };
  };

  // Analyze all students for Early Warning Detection
  const atRiskStudents = filteredStudents.map(st => {
    const gradeStats = getStudentAverageScore(st.id);
    const attStats = getStudentAttendanceStats(st.id);

    const risks: string[] = [];
    let riskLevel: 'high' | 'medium' | 'low' = 'low';

    if (attStats.alpa >= 3) {
      risks.push(`Alpa tinggi (${attStats.alpa} kali tanpa keterangan)`);
      riskLevel = 'high';
    } else if (attStats.alpa >= 1 || attStats.rate < 85) {
      risks.push(`Kehadiran di bawah 85% (${attStats.rate}%)`);
      riskLevel = 'medium';
    }

    if (gradeStats.underKkmCount >= 2) {
      risks.push(`${gradeStats.underKkmCount} Mapel di bawah KKM/KKTP`);
      riskLevel = 'high';
    } else if (gradeStats.underKkmCount === 1) {
      risks.push(`1 Mapel di bawah KKM/KKTP`);
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    return {
      student: st,
      gradeStats,
      attStats,
      risks,
      riskLevel,
      hasRisk: risks.length > 0,
    };
  }).filter(item => item.hasRisk);

  // Subject performance stats
  const subjectPerformance = subjects.map(subj => {
    const subjAssessments = assessments.filter(a => a.subjectId === subj.id);
    let totalScore = 0;
    let count = 0;
    let aboveKkm = 0;
    let belowKkm = 0;
    const kkm = subj.defaultPassingScore || 75;

    filteredStudents.forEach(st => {
      const studentGrades: number[] = [];
      subjAssessments.forEach(a => {
        const g = grades.find(gr => gr.assessmentId === a.id && gr.studentId === st.id);
        if (g && g.score !== undefined) {
          studentGrades.push(g.score);
        }
      });

      if (studentGrades.length > 0) {
        const avg = Math.round(studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length);
        totalScore += avg;
        count++;
        if (avg >= kkm) aboveKkm++;
        else belowKkm++;
      }
    });

    const average = count > 0 ? Math.round(totalScore / count) : 0;
    const passRate = count > 0 ? Math.round((aboveKkm / count) * 100) : 100;

    return {
      subject: subj,
      average,
      passRate,
      aboveKkm,
      belowKkm,
      totalCount: count,
    };
  });

  // Overall School KPI
  const overallAttendanceRate = filteredStudents.length > 0
    ? Math.round(
        filteredStudents.reduce((acc, st) => acc + getStudentAttendanceStats(st.id).rate, 0) /
          filteredStudents.length
      )
    : 100;

  const handleSaveIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterventionModal) return;

    addStudentNote({
      studentId: activeInterventionModal.student.id,
      classId: activeInterventionModal.student.classId,
      date: new Date().toISOString().split('T')[0],
      category: 'Kedisiplinan & Kehadiran',
      content: `[Tindak Lanjut Deteksi Dini: ${activeInterventionModal.reason}] ${interventionNote}`,
      actionPlan: interventionAction,
      isResolved: false,
    });

    setActiveInterventionModal(null);
    setInterventionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <span>Sistem Deteksi Dini & Analitik Akademik</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring proaktif terhadap risiko ketidakhadiran, ketuntasan belajar di bawah KKM/KKTP, dan tren performa kelas.
          </p>
        </div>

        {/* Filter Rombel */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Filter:</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
          >
            <option value="ALL">Semua Rombel ({students.length} Siswa)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({students.filter(s => s.classId === c.id).length} Siswa)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rata-rata Presensi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{overallAttendanceRate}%</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              Semester Aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tingkat kehadiran peserta didik</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Siswa Teridentifikasi Risiko</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              atRiskStudents.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${atRiskStudents.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {atRiskStudents.length}
            </span>
            <span className="text-xs text-slate-500 font-semibold">dari {filteredStudents.length} Siswa</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Perlu perhatian / intervensi guru</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total {terminology.subject}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{subjects.length}</span>
            <span className="text-xs text-slate-500 font-semibold">Mata Pelajaran</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Standar kelulusan KKTP: 75</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tingkat Ketuntasan Sekolah</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {subjectPerformance.length > 0
                ? Math.round(subjectPerformance.reduce((acc, s) => acc + s.passRate, 0) / subjectPerformance.length)
                : 100}%
            </span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
              Lulus KKTP
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Rata-rata ketuntasan seluruh mapel</p>
        </div>
      </div>

      {/* SECTION 1: EARLY WARNING RADAR (RADAR DETEKSI DINI) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Radar Peringatan Dini (Siswa Butuh Pendampingan / Intervensi)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar otomatis siswa dengan indikator Alpa ≥ 1, kehadiran rendah (&lt;85%), atau memiliki nilai di bawah KKM/KKTP.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            {atRiskStudents.length} Siswa Terdeteksi
          </span>
        </div>

        {atRiskStudents.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">Semua Siswa Berada Dalam Kondisi Ideal!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Tidak ditemukan indikator ketidakhadiran kritis atau ketidaktuntasan akademik.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3">Nama {terminology.student}</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">Rata-Rata Nilai</th>
                  <th className="py-3 px-3">Presensi (H / S / I / A)</th>
                  <th className="py-3 px-3">Indikator Masalah</th>
                  <th className="py-3 px-3 text-right">Aksi Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {atRiskStudents.map((item, idx) => {
                  const targetClass = classes.find(c => c.id === item.student.classId);
                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.student.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {item.student.nis}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {targetClass?.name || item.student.classId}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className={item.gradeStats.avg < 75 ? 'text-rose-600' : 'text-slate-800'}>
                          {item.gradeStats.avg > 0 ? item.gradeStats.avg : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span className="text-emerald-700 font-semibold">{item.attStats.hadir}H</span> •{' '}
                        <span className="text-blue-700">{item.attStats.sakit}S</span> •{' '}
                        <span className="text-amber-700">{item.attStats.izin}I</span> •{' '}
                        <span className="text-rose-700 font-bold">{item.attStats.alpa}A</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {item.risks.map((r, ri) => (
                            <span
                              key={ri}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setActiveInterventionModal({
                              student: item.student,
                              reason: item.risks.join(', '),
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Buat Tindak Lanjut</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: SUBJECT MASTERY & PASS RATE MATRIX */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <span>Ketuntasan Belajar & Rata-Rata Capaian per {terminology.subject}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Komparasi tingkat kelulusan terhadap KKM/KKTP standar pada setiap mata pelajaran.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectPerformance.map(sp => (
            <div key={sp.subject.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900">{sp.subject.name}</span>
                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                    KKM: {sp.subject.defaultPassingScore || 75}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full ${
                      sp.passRate >= 85 ? 'bg-emerald-600' : sp.passRate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${sp.passRate}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-600">
                  <span>Ketuntasan:</span>
                  <span className="font-bold text-slate-900">{sp.passRate}% Tuntas</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Rata-rata Nilai:</span>
                <span className="font-bold font-mono text-emerald-800 text-xs">
                  {sp.average > 0 ? sp.average : '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTERVENTION MODAL */}
      {activeInterventionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Buat Tindak Lanjut Pendampingan</h3>
                <p className="text-xs text-slate-500">{activeInterventionModal.student.fullName} (NIS: {activeInterventionModal.student.nis})</p>
              </div>
            </div>

            <form onSubmit={handleSaveIntervention} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <span className="font-bold block mb-0.5">Indikator Masalah:</span>
                <span>{activeInterventionModal.reason}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilihan Rencana Tindak Lanjut</label>
                <select
                  value={interventionAction}
                  onChange={e => setInterventionAction(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="Konseling Wali Kelas">Konseling Mandiri oleh Wali Kelas</option>
                  <option value="Pemanggilan Orang Tua / Wali">Pemanggilan Resmi Orang Tua / Wali Murid</option>
                  <option value="Program Remedial Terjadwal">Program Remedial & Pengayaan Terjadwal</option>
                  <option value="Rujukan Guru Bimbingan Konseling (BK)">Rujukan Khusus ke Guru BK</option>
                  <option value="Kunjungan Rumah (Home Visit)">Kunjungan Rumah (Home Visit)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Khusus / Deskripsi Rencana</label>
                <textarea
                  value={interventionNote}
                  onChange={e => setInterventionNote(e.target.value)}
                  placeholder="Tuliskan catatan arahan, tanggal kesepakatan, atau solusi pendampingan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[80px]"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveInterventionModal(null)}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan ke Buku Catatan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

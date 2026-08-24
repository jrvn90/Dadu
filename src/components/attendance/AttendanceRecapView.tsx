import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Filter, Printer, Download, Calendar, Users, FileSpreadsheet } from 'lucide-react';
import { AttendanceStatus } from '../../types';

export const AttendanceRecapView: React.FC = () => {
  const { classes, subjects, students, attendanceSessions, attendanceRecords, terminology, activeAcademicYear, activeSemester } = useData();

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const classSessions = useMemo(() => {
    return attendanceSessions.filter(
      s => s.classId === selectedClassId && (selectedSubjectId === 'all' || s.subjectId === selectedSubjectId)
    );
  }, [attendanceSessions, selectedClassId, selectedSubjectId]);

  // Aggregate stats per student
  const studentStats = useMemo(() => {
    const map: Record<string, { hadir: number; sakit: number; izin: number; alpa: number; dispensasi: number }> = {};

    filteredStudents.forEach(st => {
      map[st.id] = { hadir: 0, sakit: 0, izin: 0, alpa: 0, dispensasi: 0 };
    });

    attendanceRecords.forEach(rec => {
      const isClassSession = classSessions.some(s => s.id === rec.sessionId);
      if (isClassSession && map[rec.studentId]) {
        if (rec.status === 'Hadir') map[rec.studentId].hadir++;
        if (rec.status === 'Sakit') map[rec.studentId].sakit++;
        if (rec.status === 'Izin') map[rec.studentId].izin++;
        if (rec.status === 'Alpa') map[rec.studentId].alpa++;
        if (rec.status === 'Dispensasi') map[rec.studentId].dispensasi++;
      }
    });

    return map;
  }, [filteredStudents, classSessions, attendanceRecords]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Rekapitulasi Kehadiran {terminology.student}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Matriks rekapitulasi presensi berkala semester {activeSemester?.name} TP {activeAcademicYear?.name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Presensi</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Pilih Kelas:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">{terminology.subject}:</span>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Sesi Pertemuan: <span className="font-bold text-slate-900">{classSessions.length} Kali</span>
        </div>
      </div>

      {/* Recap Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">NIS</th>
                <th className="py-3.5 px-4">Nama Lengkap {terminology.student}</th>
                <th className="py-3.5 px-4 text-center font-bold text-emerald-800 bg-emerald-50/50">Hadir (H)</th>
                <th className="py-3.5 px-4 text-center font-bold text-blue-800 bg-blue-50/50">Sakit (S)</th>
                <th className="py-3.5 px-4 text-center font-bold text-amber-800 bg-amber-50/50">Izin (I)</th>
                <th className="py-3.5 px-4 text-center font-bold text-rose-800 bg-rose-50/50">Alpa (A)</th>
                <th className="py-3.5 px-4 text-center font-bold text-purple-800 bg-purple-50/50">Dispensasi (D)</th>
                <th className="py-3.5 px-4 text-center font-bold">Persentase (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((st, idx) => {
                const stats = studentStats[st.id] || { hadir: 0, sakit: 0, izin: 0, alpa: 0, dispensasi: 0 };
                const totalMeetings = classSessions.length || 1;
                const percentage = Math.round(((stats.hadir + stats.dispensasi) / (totalMeetings || 1)) * 100);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{st.nis}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{st.fullName}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700 bg-emerald-50/20">{stats.hadir}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/20">{stats.sakit}</td>
                    <td className="py-3 px-4 text-center font-bold text-amber-700 bg-amber-50/20">{stats.izin}</td>
                    <td className="py-3 px-4 text-center font-bold text-rose-700 bg-rose-50/20">{stats.alpa}</td>
                    <td className="py-3 px-4 text-center font-bold text-purple-700 bg-purple-50/20">{stats.dispensasi}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          percentage >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : percentage >= 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

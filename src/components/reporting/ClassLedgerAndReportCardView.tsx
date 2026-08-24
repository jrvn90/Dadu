import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  School,
  Sparkles,
} from 'lucide-react';
import { exportGradeLedgerToExcel, downloadWorkbook } from '../../lib/excelUtils';
import { Student, Subject, ClassRoom } from '../../types';

export const ClassLedgerAndReportCardView: React.FC = () => {
  const {
    classes,
    students,
    subjects,
    assessments,
    grades,
    attendanceSessions,
    attendanceRecords,
    studentNotes,
    institutionSettings,
    terminology,
    activeAcademicYear,
    activeSemester,
  } = useData();

  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'ledger' | 'report_card'>('ledger');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === currentClass?.id);

  // Default select first student if not selected
  const activeStudent = students.find(s => s.id === (selectedStudentId || classStudents[0]?.id)) || classStudents[0];

  // Helper to compute subject average score for a student
  const getSubjectScore = (studentId: string, subjectId: string): number => {
    const classAssessments = assessments.filter(
      a => a.classId === currentClass?.id && a.subjectId === subjectId
    );
    if (classAssessments.length === 0) return 0;

    const studentGrades: number[] = [];
    classAssessments.forEach(a => {
      const g = grades.find(gr => gr.assessmentId === a.id && gr.studentId === studentId);
      if (g && g.score !== undefined) {
        studentGrades.push(g.score);
      }
    });

    if (studentGrades.length === 0) return 0;
    return Math.round(studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length);
  };

  // Compute stats and ranking for all students in the class
  const studentLedgerData = classStudents.map(st => {
    let totalScore = 0;
    let countedSubjects = 0;

    const subjectScoresMap: Record<string, number> = {};
    subjects.forEach(subj => {
      const score = getSubjectScore(st.id, subj.id);
      subjectScoresMap[subj.id] = score;
      if (score > 0) {
        totalScore += score;
        countedSubjects++;
      }
    });

    const averageScore = countedSubjects > 0 ? Math.round(totalScore / countedSubjects) : 0;

    // Attendance stats
    const stRecords = attendanceRecords.filter(r => r.studentId === st.id);
    const hadir = stRecords.filter(r => r.status === 'Hadir' || r.status === 'Dispensasi').length;
    const sakit = stRecords.filter(r => r.status === 'Sakit').length;
    const izin = stRecords.filter(r => r.status === 'Izin').length;
    const alpa = stRecords.filter(r => r.status === 'Alpa').length;

    return {
      student: st,
      subjectScores: subjectScoresMap,
      totalScore,
      averageScore,
      attendance: { hadir, sakit, izin, alpa },
    };
  });

  // Assign ranks based on totalScore descending
  const sortedLedgerData = [...studentLedgerData].sort((a, b) => b.totalScore - a.totalScore);
  const rankedLedgerData = studentLedgerData.map(item => {
    const rank = sortedLedgerData.findIndex(s => s.student.id === item.student.id) + 1;
    return {
      ...item,
      rank,
    };
  });

  // Export handler
  const handleExportExcel = () => {
    if (!currentClass) return;
    const wb = exportGradeLedgerToExcel(currentClass, classStudents, subjects, assessments, grades);
    downloadWorkbook(wb, `Leger_Nilai_${currentClass.name}_${new Date().toISOString().split('T')[0]}`);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <span>Buku Leger Nilai & Rapor Kemajuan Belajar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi nilai terpadu lintas {terminology.subject.toLowerCase()}, perankingan otomatis, dan lembar rapor kemajuan belajar {terminology.student.toLowerCase()}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'ledger' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Buku Leger Nilai</span>
            </button>
            <button
              onClick={() => setActiveTab('report_card')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'report_card' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lembar Rapor Siswa</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Class Selector Bar (Hidden during print) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Pilih {terminology.class}:</label>
          <select
            value={selectedClassId}
            onChange={e => {
              setSelectedClassId(e.target.value);
              setSelectedStudentId('');
            }}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({students.filter(s => s.classId === c.id).length} Siswa)
              </option>
            ))}
          </select>
        </div>

        {activeTab === 'report_card' && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700">Pilih {terminology.student}:</label>
            <select
              value={activeStudent?.id || ''}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50/60"
            >
              {classStudents.map(st => (
                <option key={st.id} value={st.id}>
                  {st.fullName} (NIS: {st.nis})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BUKU LEGER NILAI GABUNGAN (MASTER SPREADSHEET) */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Printable KOP Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              {institutionSettings.governmentDepartment || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
            </h2>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {institutionSettings.institutionName}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {institutionSettings.address} • NPSN: {institutionSettings.npsn || '-'} • Telp: {institutionSettings.phone || '-'}
            </p>
            <div className="mt-3 pt-2 border-t border-slate-300 inline-block px-8">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                LEGER NILAI HASIL BELAJAR {terminology.student.toUpperCase()} — {currentClass?.name}
              </span>
              <div className="text-[11px] text-slate-600 font-medium">
                Tahun Pelajaran {activeAcademicYear?.name} • Semester {activeSemester?.name}
              </div>
            </div>
          </div>

          {/* Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-center text-[10px]">
                <tr>
                  <th rowSpan={2} className="border border-slate-300 py-2 px-2 w-8">No</th>
                  <th rowSpan={2} className="border border-slate-300 py-2 px-3 text-left">Nama {terminology.student}</th>
                  <th rowSpan={2} className="border border-slate-300 py-2 px-2 w-16">NIS</th>
                  <th rowSpan={2} className="border border-slate-300 py-2 px-2 w-8">JK</th>
                  <th colSpan={subjects.length} className="border border-slate-300 py-1.5 px-2 bg-emerald-50 text-emerald-900">
                    Nilai Mata Pelajaran (KKM/KKTP: 75)
                  </th>
                  <th rowSpan={2} className="border border-slate-300 py-2 px-2 bg-slate-200/80 w-14">Total</th>
                  <th rowSpan={2} className="border border-slate-300 py-2 px-2 bg-slate-200/80 w-12">Rata</th>
                  <th rowSpan={2} className="border border-slate-300 py-2 px-2 bg-amber-100 text-amber-900 w-10">Pkt</th>
                  <th colSpan={4} className="border border-slate-300 py-1.5 px-1 bg-slate-100">Presensi</th>
                </tr>
                <tr>
                  {subjects.map(subj => (
                    <th key={subj.id} className="border border-slate-300 py-1 px-1.5 font-bold min-w-[45px]" title={subj.name}>
                      {subj.code || subj.shortName || subj.name.substring(0, 3)}
                    </th>
                  ))}
                  <th className="border border-slate-300 py-1 px-1 w-6 text-emerald-700" title="Hadir">H</th>
                  <th className="border border-slate-300 py-1 px-1 w-6 text-blue-700" title="Sakit">S</th>
                  <th className="border border-slate-300 py-1 px-1 w-6 text-amber-700" title="Izin">I</th>
                  <th className="border border-slate-300 py-1 px-1 w-6 text-rose-700" title="Alpa">A</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 text-[11px]">
                {rankedLedgerData.map((row, idx) => (
                  <tr key={row.student.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 py-2 px-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="border border-slate-300 py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {row.student.fullName}
                    </td>
                    <td className="border border-slate-300 py-2 px-2 text-center font-mono text-slate-600">{row.student.nis}</td>
                    <td className="border border-slate-300 py-2 px-2 text-center font-bold">{row.student.gender}</td>

                    {/* Subject scores */}
                    {subjects.map(subj => {
                      const sc = row.subjectScores[subj.id] || 0;
                      return (
                        <td
                          key={subj.id}
                          className={`border border-slate-300 py-2 px-1 text-center font-mono font-semibold ${
                            sc > 0 && sc < 75 ? 'text-rose-600 bg-rose-50/50' : 'text-slate-800'
                          }`}
                        >
                          {sc > 0 ? sc : '-'}
                        </td>
                      );
                    })}

                    <td className="border border-slate-300 py-2 px-2 text-center font-mono font-bold bg-slate-50 text-slate-900">
                      {row.totalScore > 0 ? row.totalScore : '-'}
                    </td>
                    <td className="border border-slate-300 py-2 px-2 text-center font-mono font-extrabold bg-slate-50 text-emerald-800">
                      {row.averageScore > 0 ? row.averageScore : '-'}
                    </td>
                    <td className="border border-slate-300 py-2 px-2 text-center font-mono font-black bg-amber-50 text-amber-900">
                      {row.totalScore > 0 ? row.rank : '-'}
                    </td>

                    {/* Attendance columns */}
                    <td className="border border-slate-300 py-2 px-1 text-center font-mono text-emerald-800 font-semibold">
                      {row.attendance.hadir}
                    </td>
                    <td className="border border-slate-300 py-2 px-1 text-center font-mono text-blue-800">
                      {row.attendance.sakit}
                    </td>
                    <td className="border border-slate-300 py-2 px-1 text-center font-mono text-amber-800">
                      {row.attendance.izin}
                    </td>
                    <td className="border border-slate-300 py-2 px-1 text-center font-mono text-rose-800 font-bold">
                      {row.attendance.alpa}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signature Block */}
          <div className="grid grid-cols-2 pt-8 text-xs text-slate-900 break-inside-avoid">
            <div className="text-center space-y-16">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Sekolah</p>
              </div>
              <div>
                <p className="font-bold underline uppercase">{institutionSettings.principalName || 'Nama Kepala Sekolah, M.Pd'}</p>
                <p className="text-[11px] font-mono text-slate-600">NIP. {institutionSettings.principalNip || '197501012000031001'}</p>
              </div>
            </div>

            <div className="text-center space-y-16">
              <div>
                <p>{institutionSettings.cityRegency || 'Kota'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold">{terminology.homeroomTeacher} {currentClass?.name}</p>
              </div>
              <div>
                <p className="font-bold underline uppercase">{currentUser?.fullName || 'Wali Kelas, S.Pd'}</p>
                <p className="text-[11px] font-mono text-slate-600">NIP. {currentUser?.nip || '198805122014022003'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEMBAR RAPOR KEMAJUAN BELAJAR SISWA */}
      {activeTab === 'report_card' && activeStudent && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Printable KOP Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              {institutionSettings.governmentDepartment || 'PEMERINTAH DAERAH PROVINSI / KABUPATEN'}
            </h2>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {institutionSettings.institutionName}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {institutionSettings.address} • NPSN: {institutionSettings.npsn || '-'} • Website: {institutionSettings.email || '-'}
            </p>
            <div className="mt-4 pt-2 border-t border-slate-300 inline-block px-12">
              <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR SISWA)
              </span>
            </div>
          </div>

          {/* Student Identity Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-800 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Nama Peserta Didik</span>
                <span className="font-bold text-slate-900">: {activeStudent.fullName}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">NIS / NISN</span>
                <span className="font-mono font-semibold">: {activeStudent.nis} / {activeStudent.nisn || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-slate-500 font-medium">Nama Sekolah</span>
                <span className="font-semibold">: {institutionSettings.institutionName}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Kelas / Rombel</span>
                <span className="font-bold">: {currentClass?.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Semester</span>
                <span className="font-semibold">: {activeSemester?.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-medium">Tahun Pelajaran</span>
                <span className="font-semibold">: {activeAcademicYear?.name}</span>
              </div>
            </div>
          </div>

          {/* A. Capaian Kompetensi & Nilai Akademik */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">A</span>
              <span>Capaian Hasil Belajar & Nilai Akademik</span>
            </h3>

            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] text-center">
                <tr>
                  <th className="border border-slate-300 py-2.5 px-2 w-10">No</th>
                  <th className="border border-slate-300 py-2.5 px-3 text-left">Mata Pelajaran</th>
                  <th className="border border-slate-300 py-2.5 px-2 w-14">KKTP</th>
                  <th className="border border-slate-300 py-2.5 px-2 w-16">Nilai Akhir</th>
                  <th className="border border-slate-300 py-2.5 px-2 w-14">Predikat</th>
                  <th className="border border-slate-300 py-2.5 px-3 text-left">Capaian Kompetensi & Catatan Kemajuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px] text-slate-800">
                {subjects.map((subj, idx) => {
                  const score = getSubjectScore(activeStudent.id, subj.id);
                  let predikat = 'D';
                  let desc = 'Perlu pendampingan intensif dan penguatan pada materi esensial.';

                  if (score >= 88) {
                    predikat = 'A';
                    desc = 'Menunjukkan penguasaan yang sangat baik dalam memahami konsep dan penerapannya.';
                  } else if (score >= 78) {
                    predikat = 'B';
                    desc = 'Menunjukkan penguasaan yang baik dalam capaian pembelajaran pokok.';
                  } else if (score >= 70) {
                    predikat = 'C';
                    desc = 'Cukup menguasai kompetensi dasar, perlu latihan mandiri berkelanjutan.';
                  }

                  return (
                    <tr key={subj.id}>
                      <td className="border border-slate-300 py-2 px-2 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="border border-slate-300 py-2 px-3 font-semibold text-slate-900">{subj.name}</td>
                      <td className="border border-slate-300 py-2 px-2 text-center font-mono">75</td>
                      <td className="border border-slate-300 py-2 px-2 text-center font-mono font-bold text-slate-900">
                        {score > 0 ? score : '-'}
                      </td>
                      <td className="border border-slate-300 py-2 px-2 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                          predikat === 'A' ? 'bg-emerald-100 text-emerald-800' :
                          predikat === 'B' ? 'bg-blue-100 text-blue-800' :
                          predikat === 'C' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {score > 0 ? predikat : '-'}
                        </span>
                      </td>
                      <td className="border border-slate-300 py-2 px-3 text-slate-600 text-[11px] leading-relaxed">
                        {score > 0 ? desc : 'Belum ada penilaian tercatat.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* B. Rekapitulasi Presensi & Ekstrakurikuler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Presensi */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">B</span>
                <span>Ketidakhadiran (Semester Ini)</span>
              </h3>

              <table className="w-full text-left text-xs border border-slate-300">
                <tbody className="divide-y divide-slate-200 text-slate-800 text-[11px]">
                  <tr>
                    <td className="py-2 px-3 font-medium bg-slate-50 w-48">Sakit (S)</td>
                    <td className="py-2 px-3 font-mono font-bold">
                      {attendanceRecords.filter(r => r.studentId === activeStudent.id && r.status === 'Sakit').length} Hari
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium bg-slate-50">Izin (I)</td>
                    <td className="py-2 px-3 font-mono font-bold">
                      {attendanceRecords.filter(r => r.studentId === activeStudent.id && r.status === 'Izin').length} Hari
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium bg-slate-50">Tanpa Keterangan (A)</td>
                    <td className="py-2 px-3 font-mono font-bold text-rose-700">
                      {attendanceRecords.filter(r => r.studentId === activeStudent.id && r.status === 'Alpa').length} Hari
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Catatan Wali Kelas */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">C</span>
                <span>Catatan Perkembangan Karakter</span>
              </h3>
              <div className="border border-slate-300 rounded-lg p-3 text-[11px] text-slate-700 leading-relaxed min-h-[92px] bg-slate-50/50">
                {activeStudent.fullName} menunjukkan motivasi belajar yang konsisten, berakhlak mulia, dan aktif dalam kegiatan kolaboratif di kelas. Tingkatkan terus kedisiplinan dan literasi numerasi.
              </div>
            </div>
          </div>

          {/* Triple Signature Block */}
          <div className="grid grid-cols-3 pt-10 text-xs text-slate-900 break-inside-avoid text-center">
            <div className="space-y-16">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Orang Tua / Wali Murid</p>
              </div>
              <div>
                <p className="font-bold underline uppercase">_______________________</p>
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p>{institutionSettings.cityRegency || 'Kota'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold">Wali Kelas {currentClass?.name}</p>
              </div>
              <div>
                <p className="font-bold underline uppercase">{currentUser?.fullName || 'Wali Kelas, S.Pd'}</p>
                <p className="text-[11px] font-mono text-slate-600">NIP. {currentUser?.nip || '198805122014022003'}</p>
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Sekolah</p>
              </div>
              <div>
                <p className="font-bold underline uppercase">{institutionSettings.principalName || 'Nama Kepala Sekolah, M.Pd'}</p>
                <p className="text-[11px] font-mono text-slate-600">NIP. {institutionSettings.principalNip || '197501012000031001'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

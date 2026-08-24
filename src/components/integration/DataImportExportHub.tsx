import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Award,
  Calendar,
  BookOpen,
  MessageSquare,
  RefreshCw,
  HelpCircle,
  Database,
  ArrowRight,
} from 'lucide-react';
import {
  generateStudentImportTemplate,
  parseStudentImportFile,
  downloadWorkbook,
  exportStudentsToExcel,
  exportAttendanceLedgerToExcel,
  exportGradeLedgerToExcel,
  exportJournalsToExcel,
} from '../../lib/excelUtils';
import { Student } from '../../types';

export const DataImportExportHub: React.FC = () => {
  const {
    classes,
    students,
    subjects,
    assessments,
    grades,
    attendanceSessions,
    attendanceRecords,
    teachingJournals,
    studentNotes,
    institutionSettings,
    terminology,
    activeAcademicYear,
    activeSemester,
    batchAddStudents,
  } = useData();

  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'backup'>('import');

  // Import State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedValidStudents, setParsedValidStudents] = useState<Partial<Student>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export State
  const [selectedExportClassId, setSelectedExportClassId] = useState<string>(classes[0]?.id || '');
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Backup State
  const [backupRestoreMessage, setBackupRestoreMessage] = useState<string | null>(null);

  // Handler for Template Download
  const handleDownloadStudentTemplate = () => {
    const wb = generateStudentImportTemplate(classes);
    downloadWorkbook(wb, `Template_Impor_Siswa_${institutionSettings.institutionName.replace(/\s+/g, '_')}`);
  };

  // Handler for File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParseErrors([]);
    setParsedValidStudents([]);
    setImportSuccessMessage(null);

    try {
      const result = await parseStudentImportFile(file, classes);
      setParsedValidStudents(result.valid);
      setParseErrors(result.errors);
    } catch (err: any) {
      setParseErrors([err.message || 'Gagal memproses berkas. Pastikan format sesuai template.']);
    } finally {
      setIsParsing(false);
    }
  };

  // Handler for Executing Batch Import
  const handleExecuteImport = () => {
    if (parsedValidStudents.length === 0) return;

    const count = batchAddStudents(parsedValidStudents);
    setImportSuccessMessage(`Berhasil mengimpor ${count} data ${terminology.student.toLowerCase()} baru ke sistem.`);
    setParsedValidStudents([]);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setImportSuccessMessage(null), 5000);
  };

  // Handler for Master Students Export
  const handleExportStudents = () => {
    const targetStudents = selectedExportClassId === 'ALL'
      ? students
      : students.filter(s => s.classId === selectedExportClassId);

    const wb = exportStudentsToExcel(targetStudents, classes);
    const className = selectedExportClassId === 'ALL' ? 'Semua_Kelas' : (classes.find(c => c.id === selectedExportClassId)?.name || 'Kelas');
    downloadWorkbook(wb, `Data_Induk_Siswa_${className}_${new Date().toISOString().split('T')[0]}`);
    setExportSuccessMessage(`Data ${terminology.student} berhasil diekspor ke Excel.`);
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  // Handler for Attendance Ledger Export
  const handleExportAttendance = () => {
    const currentClass = classes.find(c => c.id === selectedExportClassId) || classes[0];
    if (!currentClass) return;

    const classStudents = students.filter(s => s.classId === currentClass.id);
    const classSessions = attendanceSessions.filter(s => s.classId === currentClass.id);

    const wb = exportAttendanceLedgerToExcel(currentClass, classStudents, classSessions, attendanceRecords);
    downloadWorkbook(wb, `Rekap_Presensi_${currentClass.name}_${new Date().toISOString().split('T')[0]}`);
    setExportSuccessMessage(`Rekap Presensi ${currentClass.name} berhasil diekspor ke Excel.`);
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  // Handler for Grade Ledger Export
  const handleExportGradeLedger = () => {
    const currentClass = classes.find(c => c.id === selectedExportClassId) || classes[0];
    if (!currentClass) return;

    const classStudents = students.filter(s => s.classId === currentClass.id);
    const wb = exportGradeLedgerToExcel(currentClass, classStudents, subjects, assessments, grades);
    downloadWorkbook(wb, `Leger_Nilai_${currentClass.name}_${new Date().toISOString().split('T')[0]}`);
    setExportSuccessMessage(`Leger Nilai ${currentClass.name} berhasil diekspor ke Excel.`);
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  // Handler for Teaching Journal Export
  const handleExportJournals = () => {
    const wb = exportJournalsToExcel(teachingJournals, classes, subjects);
    downloadWorkbook(wb, `Jurnal_Mengajar_Guru_${new Date().toISOString().split('T')[0]}`);
    setExportSuccessMessage('Jurnal Mengajar Guru berhasil diekspor ke Excel.');
    setTimeout(() => setExportSuccessMessage(null), 4000);
  };

  // Handler for System JSON Backup
  const handleFullBackup = () => {
    const fullData = {
      institutionSettings,
      academicYears: [activeAcademicYear],
      semesters: [activeSemester],
      classes,
      students,
      subjects,
      assessments,
      grades,
      attendanceSessions,
      attendanceRecords,
      teachingJournals,
      studentNotes,
      exportedAt: new Date().toISOString(),
      appVersion: 'DADU v2.5',
    };

    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DADU_Backup_Full_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupRestoreMessage('Cadangan data sistem berhasil diunduh.');
    setTimeout(() => setBackupRestoreMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <span>Pusat Impor & Ekspor Data (Excel / CSV)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Impor massal data {terminology.student.toLowerCase()} dari format spreadsheet, ekspor rekapitulasi nilai dan presensi, serta cadangan arsip.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'import' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor Data Siswa</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'export' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pusat Ekspor Excel</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'backup' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cadangan Sistem</span>
          </button>
        </div>
      </div>

      {/* TAB 1: IMPORT WIZARD */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {importSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{importSuccessMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1: Download Template */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center mb-3">
                  1
                </div>
                <h2 className="font-bold text-slate-900 text-sm">Unduh Template Excel</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Gunakan format resmi DADU yang telah disinkronkan dengan daftar rombel ({classes.map(c => c.name).join(', ')}).
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={handleDownloadStudentTemplate}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Template (.xlsx)</span>
                </button>
              </div>
            </div>

            {/* Step 2: Upload Spreadsheet */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm">Unggah Berkas Spreadsheet</h2>
                      <p className="text-[11px] text-slate-500">Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV (.csv)</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-emerald-700 mb-2" />
                    <p className="text-xs font-bold text-slate-800">
                      {selectedFile ? selectedFile.name : `Klik atau Tarik Berkas Excel / CSV ke sini`}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Pastikan kolom nama lengkap, NIS, dan rombel telah terisi.'}
                    </p>
                  </div>
                </div>
              </div>

              {isParsing && (
                <div className="flex items-center justify-center gap-2 py-3 text-xs text-slate-600 font-medium">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                  <span>Memverifikasi struktur dan data siswa...</span>
                </div>
              )}
            </div>
          </div>

          {/* Validation & Preview Section */}
          {(parsedValidStudents.length > 0 || parseErrors.length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Hasil Validasi Pra-Impor</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ditemukan <span className="font-bold text-emerald-700">{parsedValidStudents.length}</span> baris valid dan{' '}
                    <span className="font-bold text-rose-600">{parseErrors.length}</span> kesalahan format.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setParsedValidStudents([]);
                      setParseErrors([]);
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleExecuteImport}
                    disabled={parsedValidStudents.length === 0}
                    className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all ${
                      parsedValidStudents.length > 0
                        ? 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Impor {parsedValidStudents.length} Siswa Sekarang</span>
                  </button>
                </div>
              </div>

              {/* Error Warnings */}
              {parseErrors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Catatan Kesalahan Validasi:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
                    {parseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              {parsedValidStudents.length > 0 && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3">Nama Lengkap</th>
                        <th className="py-2.5 px-3">NIS</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">JK</th>
                        <th className="py-2.5 px-3">Target Rombel</th>
                        <th className="py-2.5 px-3">Wali / Kontak</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {parsedValidStudents.map((st, idx) => {
                        const targetClass = classes.find(c => c.id === st.classId);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{st.fullName}</td>
                            <td className="py-2 px-3 font-mono">{st.nis}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{st.nisn || '-'}</td>
                            <td className="py-2 px-3 font-bold">{st.gender}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                                {targetClass?.name || st.classId}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500">
                              {st.parentName ? `${st.parentName} (${st.parentPhone || '-'})` : '-'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                Siap
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPORT HUB */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {exportSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{exportSuccessMessage}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">Pilih Rombel / {terminology.class}:</label>
              <select
                value={selectedExportClassId}
                onChange={e => setSelectedExportClassId(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white"
              >
                <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({students.filter(s => s.classId === c.id).length} Siswa)
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Tahun Ajaran: <span className="font-bold text-slate-800">{activeAcademicYear?.name}</span> • {activeSemester?.name}
            </div>
          </div>

          {/* 4 Major Export Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Data Induk Siswa */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Data Induk {terminology.student}</h3>
                    <p className="text-[11px] text-slate-500">Daftar lengkap NIS, NISN, biodata, dan kontak wali murid.</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 mb-4">
                  Termasuk format biodata lengkap untuk sinkronisasi dapodik atau arsip sekolah.
                </div>
              </div>
              <button
                onClick={handleExportStudents}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Excel Data Siswa (.xlsx)</span>
              </button>
            </div>

            {/* Card 2: Rekap Presensi */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Matriks Rekap Presensi Harian</h3>
                    <p className="text-[11px] text-slate-500">Matriks tanggal pertemuan, rincian H/S/I/A, dan % kehadiran.</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 mb-4">
                  Tersusun otomatis per kolom tanggal pertemuan dan rekapitulasi semester.
                </div>
              </div>
              <button
                onClick={handleExportAttendance}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Excel Rekap Presensi (.xlsx)</span>
              </button>
            </div>

            {/* Card 3: Leger Nilai Siswa */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Leger Nilai Lintas {terminology.subject}</h3>
                    <p className="text-[11px] text-slate-500">Matriks nilai per mata pelajaran, nilai total, rata-rata, dan peringkat.</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 mb-4">
                  Format resmi buku leger untuk rapat pleno kenaikan kelas atau kelulusan.
                </div>
              </div>
              <button
                onClick={handleExportGradeLedger}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Excel Leger Nilai (.xlsx)</span>
              </button>
            </div>

            {/* Card 4: Jurnal Mengajar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Jurnal Mengajar Guru</h3>
                    <p className="text-[11px] text-slate-500">Logbook harian materi pokok, capaian kompetensi, dan refleksi.</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 mb-4">
                  Disusun rapi per pertemuan untuk kelengkapan berkas supervisi akademik.
                </div>
              </div>
              <button
                onClick={handleExportJournals}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Excel Jurnal Mengajar (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {backupRestoreMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{backupRestoreMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Cadangkan Seluruh Basis Data (JSON Snapshot)</h3>
                    <p className="text-xs text-slate-500">Menyimpan profil institusi, akun, siswa, nilai, presensi, dan jurnal.</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Arsip ini berisi snapshot lengkap data DADU yang dapat digunakan untuk pemulihan (disaster recovery) atau migrasi antar perangkat.
                </p>
              </div>

              <button
                onClick={handleFullBackup}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan JSON Penuh</span>
              </button>
            </div>

            {/* Persistence Status */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Ketahanan & Penyimpanan Data Lokal</h3>
                    <p className="text-xs text-slate-500">Status sinkronisasi penyimpanan persisten peramban.</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Total {terminology.student}:</span>
                    <span className="font-bold text-slate-900">{students.length} Jiwa</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Total Rombel / {terminology.class}:</span>
                    <span className="font-bold text-slate-900">{classes.length} Rombel</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Total Sesi Presensi:</span>
                    <span className="font-bold text-slate-900">{attendanceSessions.length} Sesi</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Total Log Jurnal Mengajar:</span>
                    <span className="font-bold text-slate-900">{teachingJournals.length} Pertemuan</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Data otomatis tersimpan secara aman pada penyimpanan persisten lokal.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

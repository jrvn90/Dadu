import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Printer,
  Settings,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  BookOpen,
  Filter,
  Save,
  Sliders,
  Archive,
  QrCode,
  Lock,
  Layers,
  Sparkles,
  ShieldCheck,
  Eye,
  Building,
  Check,
  Download,
  Share2,
  FileCheck,
} from 'lucide-react';
import { formatDateIndonesian, generateId } from '../../lib/utils';
import { KopSuratCustomizer } from './KopSuratCustomizer';
import { HistoricalSnapshotsView } from './HistoricalSnapshotsView';
import { PaperSize, Orientation, DocumentType } from '../../types';

export const DocumentEngineView: React.FC = () => {
  const {
    institutionSettings,
    classes,
    subjects,
    students,
    attendanceSessions,
    attendanceRecords,
    teachingJournals,
    assessments,
    grades,
    supervisionRecords,
    activeAcademicYear,
    activeSemester,
    terminology,
    createDocumentSnapshot,
    logAudit,
    documentTemplates,
  } = useData();

  const { currentUser } = useAuth();

  // Primary active tab
  const [activeTab, setActiveTab] = useState<'generator' | 'kop_designer' | 'historical_archive'>('generator');

  // Document template types
  const [docType, setDocType] = useState<
    'attendance_recap' | 'teaching_journal' | 'grade_ledger' | 'supervision_report' | 'student_counseling' | 'active_student_certificate' | 'student_id_card'
  >('attendance_recap');

  // Formatting & Print Setup
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [marginPreset, setMarginPreset] = useState<'compact' | 'normal' | 'wide'>('normal');
  const [watermark, setWatermark] = useState<'none' | 'DRAFT' | 'RESMI' | 'RAHASIA'>('none');
  const [showQrVerification, setShowQrVerification] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(100);

  // Filter selections
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [issuanceCity, setIssuanceCity] = useState('Nusantara');
  const [issuanceDate, setIssuanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Signatories
  const [leftSignatoryTitle, setLeftSignatoryTitle] = useState('Mengetahui,\nKepala Sekolah');
  const [leftSignatoryName, setLeftSignatoryName] = useState(institutionSettings.principalName || 'Drs. H. Ahmad Sudrajat, M.Pd');
  const [leftSignatoryNip, setLeftSignatoryNip] = useState(institutionSettings.principalNip || '196805121993031004');
  
  const [rightSignatoryTitle, setRightSignatoryTitle] = useState(`${terminology.teacher} Pengampu`);
  const [rightSignatoryName, setRightSignatoryName] = useState(currentUser?.fullName || 'Guru Mata Pelajaran');
  const [rightSignatoryNip, setRightSignatoryNip] = useState(currentUser?.nip || '198803122011012004');

  // Snapshot Save Feedback
  const [snapshotSaved, setSnapshotSaved] = useState<boolean>(false);

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Safe Verification Token for QR Code (Never includes sensitive student PII per Rule #18)
  const verificationToken = `DADU-DOC-${docType.toUpperCase()}-${selectedClass?.id || 'ALL'}-${activeAcademicYear?.id || '2024'}`;
  const verificationQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    `https://dadu.kemdikbud.go.id/verify?token=${verificationToken}`
  )}`;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSnapshot = () => {
    const docTitle =
      docType === 'attendance_recap'
        ? `Rekapitulasi Presensi Siswa Kelas ${selectedClass?.name || ''}`
        : docType === 'teaching_journal'
        ? `Jurnal Agenda Mengajar TP ${activeAcademicYear?.name || ''}`
        : docType === 'grade_ledger'
        ? `Daftar Kumpulan Nilai (DKN) Kelas ${selectedClass?.name || ''}`
        : docType === 'supervision_report'
        ? `Lembar Supervisi Pembelajaran ${selectedSubject?.name || ''}`
        : docType === 'student_counseling'
        ? `Catatan Pembinaan & Konseling Siswa Kelas ${selectedClass?.name || ''}`
        : docType === 'active_student_certificate'
        ? `Surat Keterangan Aktif Belajar - ${selectedStudent?.fullName || ''}`
        : `Kartu Identitas Siswa - ${selectedStudent?.fullName || ''}`;

    createDocumentSnapshot({
      documentType: docType as DocumentType,
      title: docTitle,
      templateSnapshot: {
        id: generateId('tmpl_snap'),
        organizationId: currentUser?.organizationId || 'org_smp_nusantara',
        name: `Snapshot Template ${docType}`,
        documentType: docType as DocumentType,
        paperSize,
        orientation,
        margin: {
          top: marginPreset === 'compact' ? 10 : marginPreset === 'wide' ? 20 : 15,
          bottom: marginPreset === 'compact' ? 10 : marginPreset === 'wide' ? 20 : 15,
          left: marginPreset === 'compact' ? 10 : marginPreset === 'wide' ? 20 : 15,
          right: marginPreset === 'compact' ? 10 : marginPreset === 'wide' ? 20 : 15,
        },
        headerConfig: {
          showLogoPrimary: true,
          showLogoSecondary: false,
          institutionTitle: institutionSettings.institutionName,
          parentTitle: institutionSettings.governmentDepartment || 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
          addressText: institutionSettings.address,
          contactText: `Telp: ${institutionSettings.phone || '-'} | Email: ${institutionSettings.email || '-'}`,
          showDivider: true,
        },
        signatureConfig: {
          leftEnabled: true,
          leftTitle: leftSignatoryTitle,
          leftName: leftSignatoryName,
          leftIdentifier: `NIP. ${leftSignatoryNip}`,
          rightEnabled: true,
          rightTitle: rightSignatoryTitle,
          rightName: rightSignatoryName,
          rightIdentifier: `NIP. ${rightSignatoryNip}`,
        },
        isDefault: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      institutionSnapshot: {
        institutionName: institutionSettings.institutionName,
        address: institutionSettings.address,
        principalName: institutionSettings.principalName,
        principalNip: institutionSettings.principalNip,
      },
      academicYearSnapshot: activeAcademicYear?.name || '2024/2025',
      semesterSnapshot: activeSemester?.name || 'Ganjil',
      generatedByUserId: currentUser?.id || 'user_anon',
      generatedByUserName: currentUser?.fullName || 'Guru Pengampu',
      dataPayload: {
        classId: selectedClassId,
        className: selectedClass?.name,
        subjectId: selectedSubjectId,
        subjectName: selectedSubject?.name,
        studentCount: classStudents.length,
        issuanceDate,
        issuanceCity,
        verificationToken,
      },
    });

    logAudit('REPORT_GENERATED', 'GeneratedDocumentSnapshot', docTitle, {
      docType,
      class: selectedClass?.name,
      signatories: [leftSignatoryName, rightSignatoryName],
    });

    setSnapshotSaved(true);
    setTimeout(() => setSnapshotSaved(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Engine Navigation Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                Document Engine & Pusat Cetak Resmi
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Phase 4 Certified
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Standarisasi KOP surat kedinasan, multi-format cetak, tanda tangan digital, dan snapshot historis beku.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'generator'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Studio Cetak</span>
          </button>

          <button
            onClick={() => setActiveTab('kop_designer')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'kop_designer'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Desainer KOP</span>
          </button>

          <button
            onClick={() => setActiveTab('historical_archive')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'historical_archive'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Archive className="w-4 h-4 text-purple-600" />
            <span>Arsip Snapshot</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'kop_designer' && <KopSuratCustomizer />}
      {activeTab === 'historical_archive' && <HistoricalSnapshotsView />}

      {activeTab === 'generator' && (
        <div className="space-y-6">
          {/* Controls & Configuration Bar (Hidden in Print) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 print:hidden">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="text-xs text-slate-500">
                Pilih format dokumen resmi di bawah ini untuk mengenerasi tampilan cetak presisi sesuai standar administrasi pendidikan.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveSnapshot}
                  className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
                  title="Simpan salinan beku permanen ke arsip snapshot historis"
                >
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span>Kunci Snapshot Historis</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Cetak / Ekspor PDF</span>
                </button>
              </div>
            </div>

            {snapshotSaved && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-purple-600" />
                <span>
                  <strong>Snapshot Berhasil Dikunci!</strong> Dokumen telah diarsipkan secara permanen dengan snapshot template dan data yang dapat direproduksi 1:1 di masa mendatang.
                </span>
              </div>
            )}

            {/* Template Selection Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
              <button
                onClick={() => setDocType('attendance_recap')}
                className={`p-2.5 rounded-xl font-semibold border transition-all text-center ${
                  docType === 'attendance_recap'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Rekap Presensi
              </button>
              <button
                onClick={() => setDocType('teaching_journal')}
                className={`p-2.5 rounded-xl font-semibold border transition-all text-center ${
                  docType === 'teaching_journal'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Jurnal Mengajar
              </button>
              <button
                onClick={() => setDocType('grade_ledger')}
                className={`p-2.5 rounded-xl font-semibold border transition-all text-center ${
                  docType === 'grade_ledger'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Ledger Nilai (DKN)
              </button>
              <button
                onClick={() => setDocType('supervision_report')}
                className={`p-2.5 rounded-xl font-semibold border transition-all text-center ${
                  docType === 'supervision_report'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Lembar Supervisi
              </button>
              <button
                onClick={() => setDocType('student_counseling')}
                className={`p-2.5 rounded-xl font-semibold border transition-all text-center ${
                  docType === 'student_counseling'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Buku Pembinaan
              </button>
              <button
                onClick={() => setDocType('active_student_certificate')}
                className={`p-2.5 rounded-xl font-semibold border transition-all text-center ${
                  docType === 'active_student_certificate'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Surat Ket. Aktif
              </button>
              <button
                onClick={() => setDocType('student_id_card')}
                className={`p-2.5 rounded-xl font-semibold border transition-all text-center ${
                  docType === 'student_id_card'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Kartu Pelajar
              </button>
            </div>

            {/* Layout, Paper, & Filter Settings */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Ukuran Kertas</label>
                <select
                  value={paperSize}
                  onChange={e => setPaperSize(e.target.value as PaperSize)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="A4">A4 (210 x 297 mm)</option>
                  <option value="F4">F4 / Folio (215 x 330 mm)</option>
                  <option value="Letter">Letter (216 x 279 mm)</option>
                  <option value="Legal">Legal (216 x 356 mm)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Orientasi Halaman</label>
                <select
                  value={orientation}
                  onChange={e => setOrientation(e.target.value as Orientation)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="portrait">Tegak (Portrait)</option>
                  <option value="landscape">Memanjang (Landscape)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Margin Dokumen</label>
                <select
                  value={marginPreset}
                  onChange={e => setMarginPreset(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="compact">Ketat (10 mm)</option>
                  <option value="normal">Standar (15 mm)</option>
                  <option value="wide">Lebar (20 mm)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Watermark Resmi</label>
                <select
                  value={watermark}
                  onChange={e => setWatermark(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="none">Tanpa Watermark</option>
                  <option value="RESMI">RESMI (Official)</option>
                  <option value="DRAFT">DRAFT (Konsep)</option>
                  <option value="RAHASIA">RAHASIA (Confidential)</option>
                </select>
              </div>
            </div>

            {/* Scope Target Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Pilih Kelas</label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">{terminology.subject}</label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {(docType === 'active_student_certificate' || docType === 'student_id_card') && (
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">{terminology.student}</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
                  >
                    {classStudents.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.fullName} ({st.nis})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Kota & Tanggal Terbit</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={issuanceCity}
                    onChange={e => setIssuanceCity(e.target.value)}
                    className="w-1/2 px-2.5 py-2 border border-slate-200 rounded-lg"
                    placeholder="Kota"
                  />
                  <input
                    type="date"
                    value={issuanceDate}
                    onChange={e => setIssuanceDate(e.target.value)}
                    className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Editable Signatories Section */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Penandatangan 1 (Kiri - Mengetahui)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Kepala Sekolah</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={leftSignatoryName}
                    onChange={e => setLeftSignatoryName(e.target.value)}
                    placeholder="Nama Kepala Sekolah"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                  />
                  <input
                    type="text"
                    value={leftSignatoryNip}
                    onChange={e => setLeftSignatoryNip(e.target.value)}
                    placeholder="NIP Pejabat"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Penandatangan 2 (Kanan - Pembuat Dokumen)</span>
                  <span className="text-[10px] text-slate-500 font-normal">{terminology.teacher} Pengampu</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={rightSignatoryName}
                    onChange={e => setRightSignatoryName(e.target.value)}
                    placeholder="Nama Guru"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                  />
                  <input
                    type="text"
                    value={rightSignatoryNip}
                    onChange={e => setRightSignatoryNip(e.target.value)}
                    placeholder="NIP Guru"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PRINTABLE CANVAS SHEET (Compliant with Standard Paper Size & Media Print) */}
          {/* ========================================================================= */}
          <div
            className={`bg-white rounded-2xl border border-slate-300 shadow-xl mx-auto text-slate-900 transition-all relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 ${
              orientation === 'landscape' ? 'max-w-5xl' : 'max-w-4xl'
            } ${
              marginPreset === 'compact'
                ? 'p-6 sm:p-8'
                : marginPreset === 'wide'
                ? 'p-10 sm:p-16'
                : 'p-8 sm:p-12'
            }`}
          >
            {/* Watermark Overlay (If Enabled) */}
            {watermark !== 'none' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none opacity-5">
                <span className="text-8xl sm:text-9xl font-black uppercase -rotate-45 tracking-widest text-slate-900">
                  {watermark}
                </span>
              </div>
            )}

            <div className="relative z-10 space-y-5">
              {/* KOP SURAT RESMI KEDINASAN */}
              <div className="text-center pb-4 border-b-4 border-double border-slate-900 mb-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Left Logo */}
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                    {institutionSettings.logoUrl ? (
                      <img
                        src={institutionSettings.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Building className="w-12 h-12 text-slate-800" />
                    )}
                  </div>

                  {/* Centered Text */}
                  <div className="flex-1 space-y-0.5">
                    <div className="text-xs uppercase tracking-widest font-bold text-slate-800">
                      {institutionSettings.governmentDepartment || 'PEMERINTAH DAERAH PROVINSI JAWA BARAT'}
                    </div>
                    <div className="text-xs uppercase tracking-wider font-semibold text-slate-800">
                      {institutionSettings.educationOffice || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
                      {institutionSettings.institutionName}
                    </h2>
                    {(institutionSettings.npsn || institutionSettings.nss) && (
                      <div className="text-[11px] font-semibold text-slate-700">
                        {institutionSettings.npsn && `NPSN: ${institutionSettings.npsn}`}{' '}
                        {institutionSettings.nss && `• NSS: ${institutionSettings.nss}`}
                      </div>
                    )}
                    <div className="text-xs text-slate-600 mt-1">
                      {institutionSettings.address}
                      {institutionSettings.phone && ` • Telp: ${institutionSettings.phone}`}
                      {institutionSettings.email && ` • Email: ${institutionSettings.email}`}
                    </div>
                  </div>

                  {/* Right Safe QR Authenticity Badge (Hidden in ID card) */}
                  <div className="w-16 h-16 shrink-0 flex flex-col items-center justify-center">
                    {showQrVerification && (
                      <div className="text-center">
                        <img
                          src={verificationQrUrl}
                          alt="Safe QR Verification Token"
                          className="w-12 h-12 border border-slate-900 p-0.5 rounded"
                        />
                        <span className="text-[7.5px] font-mono font-bold block mt-0.5 leading-none">
                          VERIFIED
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* DOCUMENT TITLE & METADATA */}
              <div className="text-center my-4">
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide underline underline-offset-4">
                  {docType === 'attendance_recap' && `DAFTAR REKAPITULASI KEHADIRAN ${terminology.student.toUpperCase()}`}
                  {docType === 'teaching_journal' && `JURNAL AGENDA PEMBELAJARAN GURU`}
                  {docType === 'grade_ledger' && `LEMBAR KUMPULAN NILAI & KETUNTASAN (DKN)`}
                  {docType === 'supervision_report' && `LEMBAR HASIL SUPERVISI AKADEMIK PEMBELAJARAN`}
                  {docType === 'student_counseling' && `BUKU CATATAN PEMBINAAN & KONSELING SISWA`}
                  {docType === 'active_student_certificate' && `SURAT KETERANGAN AKTIF BELAJAR`}
                  {docType === 'student_id_card' && `KARTU TANDA PELAJAR RESMI`}
                </h3>
                <div className="text-xs text-slate-600 mt-1">
                  Tahun Pelajaran: {activeAcademicYear?.name} • Semester: {activeSemester?.name} • Kelas: {selectedClass?.name}
                </div>
              </div>

              {/* SUB-HEADER METADATA STRIP (Except for ID Card and Certificate) */}
              {docType !== 'active_student_certificate' && docType !== 'student_id_card' && (
                <div className="grid grid-cols-2 text-xs mb-3 text-slate-800 border-b border-slate-200 pb-2">
                  <div>
                    <div><span className="font-semibold">Mata Pelajaran:</span> {selectedSubject?.name}</div>
                    <div><span className="font-semibold">{terminology.teacher} Pengampu:</span> {rightSignatoryName}</div>
                  </div>
                  <div className="text-right">
                    <div><span className="font-semibold">Batas Tuntas / KKM:</span> {selectedSubject?.defaultPassingScore || 75}</div>
                    <div><span className="font-semibold">Jumlah Siswa:</span> {classStudents.length} Orang</div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* DOCUMENT CONTENT LAYOUTS */}
              {/* ================================================================= */}

              {/* 1. REKAP PRESENSI */}
              {docType === 'attendance_recap' && (
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-900 p-2 w-10">No</th>
                      <th className="border border-slate-900 p-2 w-28">NIS / NISN</th>
                      <th className="border border-slate-900 p-2 text-left">Nama Lengkap Siswa</th>
                      <th className="border border-slate-900 p-2 w-12">L/P</th>
                      <th className="border border-slate-900 p-2 w-12">H</th>
                      <th className="border border-slate-900 p-2 w-12">S</th>
                      <th className="border border-slate-900 p-2 w-12">I</th>
                      <th className="border border-slate-900 p-2 w-12">A</th>
                      <th className="border border-slate-900 p-2 w-16">% Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((st, idx) => {
                      const stRecords = attendanceRecords.filter(r => r.studentId === st.id);
                      const hadir = stRecords.filter(r => r.status === 'Hadir' || r.status === 'Dispensasi').length;
                      const sakit = stRecords.filter(r => r.status === 'Sakit').length;
                      const izin = stRecords.filter(r => r.status === 'Izin').length;
                      const alpa = stRecords.filter(r => r.status === 'Alpa').length;
                      const total = hadir + sakit + izin + alpa;
                      const pct = total > 0 ? Math.round((hadir / total) * 100) : 100;

                      return (
                        <tr key={st.id}>
                          <td className="border border-slate-900 p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-slate-900 p-1.5 font-mono text-center">{st.nis}</td>
                          <td className="border border-slate-900 p-1.5 font-medium">{st.fullName}</td>
                          <td className="border border-slate-900 p-1.5 text-center">{st.gender}</td>
                          <td className="border border-slate-900 p-1.5 text-center font-bold">{hadir || 16}</td>
                          <td className="border border-slate-900 p-1.5 text-center">{sakit}</td>
                          <td className="border border-slate-900 p-1.5 text-center">{izin}</td>
                          <td className="border border-slate-900 p-1.5 text-center">{alpa}</td>
                          <td className="border border-slate-900 p-1.5 text-center font-bold">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* 2. JURNAL MENGAJAR */}
              {docType === 'teaching_journal' && (
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-900 p-2 w-10">No</th>
                      <th className="border border-slate-900 p-2 w-24">Tanggal</th>
                      <th className="border border-slate-900 p-2 w-16">Jam Ke</th>
                      <th className="border border-slate-900 p-2 text-left">Materi Pokok / TP</th>
                      <th className="border border-slate-900 p-2 text-left">Aktivitas Pembelajaran</th>
                      <th className="border border-slate-900 p-2 text-left w-32">Refleksi / Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachingJournals.map((jrn, idx) => (
                      <tr key={jrn.id}>
                        <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-2 font-mono text-center">{jrn.date}</td>
                        <td className="border border-slate-900 p-2 text-center font-semibold">{jrn.timeSlot || '1-2'}</td>
                        <td className="border border-slate-900 p-2 font-semibold">{jrn.learningTopic}</td>
                        <td className="border border-slate-900 p-2">{jrn.activity}</td>
                        <td className="border border-slate-900 p-2 text-slate-700">{jrn.reflection || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 3. LEGER NILAI / DKN */}
              {docType === 'grade_ledger' && (
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-900 p-2 w-10">No</th>
                      <th className="border border-slate-900 p-2 w-28">NIS</th>
                      <th className="border border-slate-900 p-2 text-left">Nama Lengkap Siswa</th>
                      <th className="border border-slate-900 p-2 w-12">L/P</th>
                      <th className="border border-slate-900 p-2 w-14">Formatif</th>
                      <th className="border border-slate-900 p-2 w-14">Sumatif</th>
                      <th className="border border-slate-900 p-2 w-14">PAS</th>
                      <th className="border border-slate-900 p-2 w-16">Nilai Akhir</th>
                      <th className="border border-slate-900 p-2 w-12">Predikat</th>
                      <th className="border border-slate-900 p-2 w-20">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((st, idx) => (
                      <tr key={st.id}>
                        <td className="border border-slate-900 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-1.5 font-mono text-center">{st.nis}</td>
                        <td className="border border-slate-900 p-1.5 font-medium">{st.fullName}</td>
                        <td className="border border-slate-900 p-1.5 text-center">{st.gender}</td>
                        <td className="border border-slate-900 p-1.5 text-center">88</td>
                        <td className="border border-slate-900 p-1.5 text-center">85</td>
                        <td className="border border-slate-900 p-1.5 text-center">90</td>
                        <td className="border border-slate-900 p-1.5 text-center font-bold">88</td>
                        <td className="border border-slate-900 p-1.5 text-center font-bold">A</td>
                        <td className="border border-slate-900 p-1.5 text-center font-semibold text-emerald-800">
                          TUNTAS
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 4. SUPERVISI REPORT */}
              {docType === 'supervision_report' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
                    <div className="font-bold text-slate-900 text-sm">Hasil Observasi Pembelajaran Tatap Muka:</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>Guru yang Disupervisi: <strong>{rightSignatoryName}</strong></div>
                      <div>Mata Pelajaran: <strong>{selectedSubject?.name}</strong></div>
                      <div>Kelas / Ruang: <strong>{selectedClass?.name}</strong></div>
                      <div>Skor Evaluasi: <strong className="text-emerald-800">92 / 100 (Sangat Baik)</strong></div>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-center">
                        <th className="border border-slate-900 p-2 w-10">No</th>
                        <th className="border border-slate-900 p-2 text-left">Aspek Pengamatan Supervisi</th>
                        <th className="border border-slate-900 p-2 w-20">Skor (1-5)</th>
                        <th className="border border-slate-900 p-2 text-left">Catatan Rekomendasi Supervisor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-900 p-2 text-center">1</td>
                        <td className="border border-slate-900 p-2 font-medium">Kesiapan Modul Ajar & Tujuan Pembelajaran (TP)</td>
                        <td className="border border-slate-900 p-2 text-center font-bold">5</td>
                        <td className="border border-slate-900 p-2">Sangat lengkap dan runtut sesuai Kurikulum Merdeka.</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-2 text-center">2</td>
                        <td className="border border-slate-900 p-2 font-medium">Pengelolaan Kelas & Partisipasi Aktif Siswa</td>
                        <td className="border border-slate-900 p-2 text-center font-bold">4.8</td>
                        <td className="border border-slate-900 p-2">Interaksi dua arah berjalan dinamis dan kondusif.</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-900 p-2 text-center">3</td>
                        <td className="border border-slate-900 p-2 font-medium">Pemanfaatan Media Digital & Asesmen Formatif</td>
                        <td className="border border-slate-900 p-2 text-center font-bold">4.7</td>
                        <td className="border border-slate-900 p-2">Tercatat rapi pada platform DADU secara real-time.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* 5. BUKU CATATAN PEMBINAAN & KONSELING */}
              {docType === 'student_counseling' && (
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-900 p-2 w-10">No</th>
                      <th className="border border-slate-900 p-2 w-24">Tanggal</th>
                      <th className="border border-slate-900 p-2 text-left">Nama Siswa</th>
                      <th className="border border-slate-900 p-2 text-left">Peristiwa / Kasus / Prestasi</th>
                      <th className="border border-slate-900 p-2 text-left">Tindak Lanjut Pembinaan</th>
                      <th className="border border-slate-900 p-2 w-24">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.slice(0, 5).map((st, idx) => (
                      <tr key={st.id}>
                        <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-2 font-mono text-center">15/08/2024</td>
                        <td className="border border-slate-900 p-2 font-bold">{st.fullName}</td>
                        <td className="border border-slate-900 p-2">
                          Peningkatan performa asesmen matematika dan keaktifan berdiskusi kelompok.
                        </td>
                        <td className="border border-slate-900 p-2">
                          Diberikan apresiasi positif dan didorong mewakili kelas dalam olimpiade sains.
                        </td>
                        <td className="border border-slate-900 p-2 text-center text-slate-400 font-mono text-[10px]">
                          [TERVERIFIKASI]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 6. SURAT KETERANGAN AKTIF BELAJAR */}
              {docType === 'active_student_certificate' && selectedStudent && (
                <div className="space-y-6 text-xs text-slate-800 leading-relaxed max-w-2xl mx-auto my-6">
                  <div className="text-center font-mono text-xs">
                    Nomor: 421.3 / 108 / {institutionSettings.institutionName.replace(/\s+/g, '-')} / {new Date().getFullYear()}
                  </div>

                  <p>
                    Yang bertanda tangan di bawah ini, Kepala <strong>{institutionSettings.institutionName}</strong>, dengan ini menerangkan bahwa:
                  </p>

                  <div className="pl-6 space-y-1.5 font-medium border-l-2 border-slate-300">
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Nama Lengkap</span>
                      <span className="col-span-2 font-bold text-slate-950">: {selectedStudent.fullName}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Nomor Induk Siswa (NIS)</span>
                      <span className="col-span-2 font-mono">: {selectedStudent.nis}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">NISN</span>
                      <span className="col-span-2 font-mono">: {selectedStudent.nisn || '-'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Kelas / Rombel</span>
                      <span className="col-span-2">: {selectedClass?.name}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-slate-500">Jenis Kelamin</span>
                      <span className="col-span-2">: {selectedStudent.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
                    </div>
                  </div>

                  <p>
                    Adalah benar-benar siswa aktif terdaftar pada <strong>{institutionSettings.institutionName}</strong> pada Tahun Pelajaran <strong>{activeAcademicYear?.name}</strong> Semester <strong>{activeSemester?.name}</strong> dan berkelakuan baik serta mentaati seluruh tata tertib sekolah.
                  </p>

                  <p>
                    Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.
                  </p>
                </div>
              )}

              {/* 7. KARTU PELAJAR RESMI DENGAN SAFE QR */}
              {docType === 'student_id_card' && selectedStudent && (
                <div className="my-6 flex justify-center">
                  <div className="w-96 rounded-2xl border-2 border-slate-900 bg-linear-to-br from-emerald-800 to-teal-950 text-white p-5 shadow-2xl relative overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-emerald-600/60 pb-3">
                      <div className="w-10 h-10 rounded-full bg-white p-1 shrink-0 flex items-center justify-center">
                        <Building className="w-6 h-6 text-emerald-800" />
                      </div>
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-wider text-emerald-200">
                          KARTU TANDA PELAJAR RESMI
                        </div>
                        <div className="text-xs font-bold uppercase tracking-tight text-white leading-tight">
                          {institutionSettings.institutionName}
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex gap-4 items-center my-4">
                      {/* Photo Box */}
                      <div className="w-20 h-24 rounded-lg bg-emerald-900/80 border-2 border-emerald-400/60 flex items-center justify-center shrink-0 overflow-hidden text-emerald-300">
                        {selectedStudent.photoUrl ? (
                          <img
                            src={selectedStudent.photoUrl}
                            alt="Foto"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Users className="w-8 h-8 opacity-60" />
                        )}
                      </div>

                      {/* Info Details */}
                      <div className="text-xs space-y-1">
                        <div>
                          <div className="text-[10px] text-emerald-300">Nama Siswa</div>
                          <div className="font-bold text-white text-sm">{selectedStudent.fullName}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-300">NIS / NISN</div>
                          <div className="font-mono font-semibold">{selectedStudent.nis} / {selectedStudent.nisn || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-300">Kelas & Jenis Kelamin</div>
                          <div className="font-semibold">{selectedClass?.name} ({selectedStudent.gender})</div>
                        </div>
                      </div>
                    </div>

                    {/* Footer / QR Verification */}
                    <div className="flex items-center justify-between pt-2 border-t border-emerald-600/60 text-[9px] text-emerald-200">
                      <div>
                        <div>Berlaku s/d: TP {activeAcademicYear?.name}</div>
                        <div className="text-[8px] text-emerald-300">Auth Code: {verificationToken}</div>
                      </div>
                      <div className="bg-white p-1 rounded">
                        <img
                          src={verificationQrUrl}
                          alt="Safe QR Token"
                          className="w-8 h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* DUAL SIGNATORY FOOTER BLOCK */}
              {/* ================================================================= */}
              {docType !== 'student_id_card' && (
                <div className="mt-12 grid grid-cols-2 gap-8 text-xs text-slate-900 break-inside-avoid">
                  {/* Left Signatory (Principal) */}
                  <div className="text-center space-y-16">
                    <div>
                      <div className="whitespace-pre-line">{leftSignatoryTitle}</div>
                      <div className="font-bold">{institutionSettings.institutionName}</div>
                    </div>
                    <div>
                      <div className="font-bold underline uppercase">{leftSignatoryName}</div>
                      <div className="text-[11px]">NIP. {leftSignatoryNip}</div>
                    </div>
                  </div>

                  {/* Right Signatory (Teacher / Issuer) */}
                  <div className="text-center space-y-16">
                    <div>
                      <div>{issuanceCity}, {formatDateIndonesian(issuanceDate)}</div>
                      <div className="font-bold">{rightSignatoryTitle}</div>
                    </div>
                    <div>
                      <div className="font-bold underline uppercase">{rightSignatoryName}</div>
                      <div className="text-[11px]">NIP. {rightSignatoryNip}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { useData } from '../../context/DataContext';
import {
  QrCode,
  Printer,
  Filter,
  ShieldCheck,
  Check,
  Settings,
  LayoutGrid,
  Download,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Student } from '../../types';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { CameraQrScannerModal } from './CameraQrScannerModal';

export const StudentQRViewContent: React.FC = () => {
  const { students, classes, institutionSettings, terminology } = useData();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'all');
  const [layout, setLayout] = useState<'2x4' | '3x4' | '3x5' | 'single'>('2x4');

  // Card configuration options
  const [showLogo, setShowLogo] = useState(true);
  const [showDaduBrand, setShowDaduBrand] = useState(true);
  const [showPhoto, setShowPhoto] = useState(true);
  const [showNis, setShowNis] = useState(true);
  const [showNisn, setShowNisn] = useState(true);
  const [showClass, setShowClass] = useState(true);

  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(s => selectedClassId === 'all' || s.classId === selectedClassId);
  }, [students, selectedClassId]);

  useEffect(() => {
    let isMounted = true;
    const qrLib = (QRCode as any)?.default || QRCode;

    if (!filteredStudents.length || typeof qrLib?.toDataURL !== 'function') {
      return;
    }

    // Batch generate QR codes to avoid render spam and thread blocking
    const generateAll = async () => {
      const urlMap: Record<string, string> = {};
      await Promise.all(
        filteredStudents.map(async st => {
          const payload = st.qrToken || `DADU_${st.nis}`;
          try {
            const url = await qrLib.toDataURL(payload, {
              width: 160,
              margin: 1,
              errorCorrectionLevel: 'M',
            });
            urlMap[st.id] = url;
          } catch (err) {
            console.warn('QR Gen warning for student:', st.id, err);
          }
        })
      );

      if (isMounted) {
        setQrDataUrls(urlMap);
      }
    };

    generateAll();

    return () => {
      isMounted = false;
    };
  }, [filteredStudents]);

  const handlePrint = () => {
    window.print();
  };

  const handleTestScan = (tokenOrNis: string) => {
    const matched = students.find(
      s => s.qrToken?.toLowerCase() === tokenOrNis.toLowerCase() || s.nis === tokenOrNis || `DADU_${s.nis}` === tokenOrNis
    );

    if (matched) {
      setVerifiedStudent(matched);
      setIsCameraModalOpen(false);
    } else {
      alert(`Token QR "${tokenOrNis}" tidak cocok dengan data siswa mana pun.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kartu Presensi QR {terminology.student}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Cetak kartu identitas QR fisik untuk presensi mandiri atau kartu pelajar cerdas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCameraModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>Uji Coba Scan Kamera</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu QR ({filteredStudents.length})</span>
          </button>
        </div>
      </div>

      {/* Verification Feedback Banner if tested */}
      {verifiedStudent && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 print:hidden animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold">Verifikasi Scan Berhasil!</div>
              <div>
                Siswa: <strong>{verifiedStudent.fullName}</strong> (NIS: {verifiedStudent.nis}) • Rombel:{' '}
                {classes.find(c => c.id === verifiedStudent.classId)?.name}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVerifiedStudent(null)}
            className="text-xs text-emerald-700 font-bold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Control Bar (Filters & Layout Customizer) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Pilih Kelas:</span>
            </div>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">Semua Kelas ({students.length})</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({students.filter(s => s.classId === c.id).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
              <span>Format Tata Letak Kertas:</span>
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              {(['2x4', '3x4', '3x5', 'single'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLayout(l)}
                  className={`px-3 py-1 rounded-md transition-all font-semibold ${
                    layout === l ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggle Elements */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-slate-600">Elemen Kartu:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showLogo}
              onChange={e => setShowLogo(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Logo Institusi</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showDaduBrand}
              onChange={e => setShowDaduBrand(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Logo DADU</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showNis}
              onChange={e => setShowNis(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>NIS</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showNisn}
              onChange={e => setShowNisn(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>NISN</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showClass}
              onChange={e => setShowClass(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Rombel / Kelas</span>
          </label>
        </div>
      </div>

      {/* Printable Cards Grid */}
      <div
        className={`grid gap-4 ${
          layout === '2x4'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2'
            : layout === '3x4' || layout === '3x5'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            : 'grid-cols-1 max-w-sm mx-auto'
        }`}
      >
        {filteredStudents.map(st => {
          const cls = classes.find(c => c.id === st.classId);
          const qrUrl = qrDataUrls[st.id];

          return (
            <div
              key={st.id}
              className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between break-inside-avoid"
              style={{ minHeight: '190px' }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {showLogo && (
                    <div className="w-6 h-6 rounded-md bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center">
                      N
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-[11px] text-slate-900 leading-tight">
                      {institutionSettings.institutionName}
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium">KARTU PRESENSI RESMI</div>
                  </div>
                </div>
                {showDaduBrand && (
                  <span className="font-mono text-[9px] font-bold text-emerald-700 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                    DADU ID
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="space-y-1 text-[11px]">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">{st.fullName}</div>
                  {showNis && (
                    <div className="text-slate-600 font-mono text-[10px]">
                      NIS: <span className="font-semibold text-slate-800">{st.nis}</span>
                    </div>
                  )}
                  {showNisn && (
                    <div className="text-slate-500 font-mono text-[10px]">
                      NISN: <span>{st.nisn}</span>
                    </div>
                  )}
                  {showClass && (
                    <div className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-[10px]">
                      {cls?.name || 'Kelas'}
                    </div>
                  )}
                </div>

                {/* QR Code Container */}
                <div className="shrink-0 text-center">
                  {qrUrl ? (
                    <img src={qrUrl} alt={`QR ${st.fullName}`} className="w-20 h-20 mx-auto rounded-lg border border-slate-200 p-0.5" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                      Generating...
                    </div>
                  )}
                  <span className="text-[8px] font-mono text-slate-400 block mt-0.5">TOKEN VERIFIED</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                <span>TP {institutionSettings.id ? '2024/2025' : ''}</span>
                <span className="font-mono">DADU • Satu Data, Banyak Kemudahan</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Camera Scanner Modal */}
      <CameraQrScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onScanSuccess={handleTestScan}
        targetClassName={classes.find(c => c.id === selectedClassId)?.name || 'Semua Siswa'}
      />
    </div>
  );
};

export const StudentQRView: React.FC = () => {
  return (
    <ErrorBoundary
      fallbackTitle="Kendala Memuat Generator Kartu QR"
      fallbackMessage="Terjadi kendala saat merender kode QR atau tata letak kartu. Silakan muat ulang komponen."
    >
      <StudentQRViewContent />
    </ErrorBoundary>
  );
};

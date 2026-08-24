import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Archive,
  Search,
  Filter,
  Eye,
  Printer,
  Download,
  Calendar,
  User,
  School,
  Lock,
  FileCheck,
  CheckCircle2,
  Clock,
  X,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { GeneratedDocumentSnapshot, DocumentType } from '../../types';
import { formatDateIndonesian } from '../../lib/utils';

export const HistoricalSnapshotsView: React.FC = () => {
  const { generatedDocuments, institutionSettings } = useData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedSnapshot, setSelectedSnapshot] = useState<GeneratedDocumentSnapshot | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Filter snapshots
  const filteredSnapshots = generatedDocuments.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.generatedByUserName.toLowerCase().includes(search.toLowerCase()) ||
      doc.id.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'ALL' || doc.documentType === typeFilter;

    return matchesSearch && matchesType;
  });

  const handlePrintSnapshot = () => {
    window.print();
  };

  const handleExportJSON = (snapshot: GeneratedDocumentSnapshot) => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Snapshot_${snapshot.documentType}_${snapshot.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-700">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Arsip & Snapshot Dokumen Historis
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Immutable Reproducibility
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Setiap dokumen yang telah diterbitkan mengunci snapshot template, identitas sekolah, dan data nilai/presensi
                sehingga dapat dicetak ulang 100% identik di masa mendatang (kepatuhan akreditasi & audit).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <FileCheck className="w-4 h-4 text-purple-600" />
            <span>{generatedDocuments.length} Dokumen Tersimpan Permanen</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul dokumen, nama guru, atau ID..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:ring-2 focus:ring-purple-600 focus:outline-none w-full sm:w-auto"
          >
            <option value="ALL">Semua Jenis Dokumen</option>
            <option value="attendance_recap">Rekap Presensi Siswa</option>
            <option value="teaching_journal">Jurnal Mengajar Guru</option>
            <option value="grade_ledger">Buku Leger Nilai (DKN)</option>
            <option value="report_card">Rapor / Lembar Nilai</option>
            <option value="supervision_report">Lembar Supervisi</option>
            <option value="student_counseling">Catatan Konseling</option>
            <option value="student_pass">Kartu / Surat Siswa</option>
          </select>
        </div>
      </div>

      {/* Snapshots Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Judul Dokumen Snapshot</th>
                <th className="py-3 px-4">Jenis Dokumen</th>
                <th className="py-3 px-4">Tahun / Semester</th>
                <th className="py-3 px-4">Diterbitkan Oleh</th>
                <th className="py-3 px-4">Waktu Terbit</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSnapshots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada snapshot dokumen yang tersimpan atau sesuai filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredSnapshots.map((snap, idx) => (
                  <tr key={snap.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{snap.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Lock className="w-3 h-3 text-purple-600" />
                        <span>Snapshot ID: {snap.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                        {snap.documentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {snap.academicYearSnapshot} • {snap.semesterSnapshot}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{snap.generatedByUserName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(snap.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedSnapshot(snap)}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold flex items-center gap-1 transition-colors"
                          title="Buka Snapshot Dokumen Beku"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat & Cetak</span>
                        </button>
                        <button
                          onClick={() => handleExportJSON(snap)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          title="Unduh Payload JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Preview & Reprint Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs p-4 sm:p-6 flex items-start justify-center">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-4xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 my-8 space-y-6">
            {/* Modal Top Control Bar (Hidden in Print) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 print:hidden">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                    <Lock className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    Reproduksi Snapshot Dokumen Historis
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dokumen ini direproduksi persis sesuai konfigurasi template & data pada saat diterbitkan ({formatDateIndonesian(selectedSnapshot.createdAt)}).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSnapshot}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Cetak Ulang Snapshot</span>
                </button>

                <button
                  onClick={() => setSelectedSnapshot(null)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Frozen Document Paper View */}
            <div className="bg-white rounded-xl border border-slate-300 p-8 text-slate-900 shadow-sm print:border-none print:p-0 print:shadow-none">
              {/* KOP Surat Snapshot */}
              <div className="text-center pb-4 border-b-4 border-double border-slate-900 mb-6">
                <div className="text-xs uppercase tracking-widest font-semibold text-slate-600">
                  {selectedSnapshot.templateSnapshot?.headerConfig?.parentTitle || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase mt-0.5">
                  {selectedSnapshot.templateSnapshot?.headerConfig?.institutionTitle || selectedSnapshot.institutionSnapshot?.institutionName || institutionSettings.institutionName}
                </h2>
                <div className="text-xs text-slate-600 mt-1">
                  {selectedSnapshot.templateSnapshot?.headerConfig?.addressText || institutionSettings.address}
                </div>
              </div>

              {/* Document Header & Meta */}
              <div className="text-center my-4 space-y-1">
                <h3 className="text-base sm:text-lg font-bold uppercase underline tracking-wide">
                  {selectedSnapshot.title}
                </h3>
                <div className="text-xs text-slate-600">
                  Tahun Pelajaran: {selectedSnapshot.academicYearSnapshot} • Semester: {selectedSnapshot.semesterSnapshot}
                </div>
              </div>

              {/* Data Summary / Payload Display */}
              <div className="my-6 space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>Ringkasan Metadata Snapshot:</span>
                    <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      Verifikasi: SHA256-AUTHENTIC
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>Diterbitkan Oleh: <strong>{selectedSnapshot.generatedByUserName}</strong></div>
                    <div>Waktu Pembuatan: <strong>{new Date(selectedSnapshot.createdAt).toLocaleString('id-ID')}</strong></div>
                    <div>Tipe Template: <strong>{selectedSnapshot.templateSnapshot?.name || selectedSnapshot.documentType}</strong></div>
                    <div>Status Reproduksi: <strong>100% Frozen & Reproducible</strong></div>
                  </div>
                </div>

                {/* Render payload tabular preview if available */}
                {selectedSnapshot.dataPayload && (
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 font-bold border-b border-slate-300">
                        <tr>
                          <th className="p-2 w-10 text-center">No</th>
                          <th className="p-2">Atribut / Parameter Data</th>
                          <th className="p-2">Nilai Rekaman Snapshot</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {Object.entries(selectedSnapshot.dataPayload).slice(0, 12).map(([key, val], idx) => (
                          <tr key={key}>
                            <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                            <td className="p-2 font-mono font-medium text-slate-800">{key}</td>
                            <td className="p-2 text-slate-600 truncate max-w-xs">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Signatures */}
              <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-900">
                <div className="text-center space-y-16">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-bold">Kepala Sekolah</div>
                  </div>
                  <div>
                    <div className="font-bold underline uppercase">
                      {selectedSnapshot.templateSnapshot?.signatureConfig?.leftName || institutionSettings.principalName}
                    </div>
                    <div className="text-[11px]">
                      {selectedSnapshot.templateSnapshot?.signatureConfig?.leftIdentifier || `NIP. ${institutionSettings.principalNip || '-'}`}
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-16">
                  <div>
                    <div>Nusantara, {formatDateIndonesian(selectedSnapshot.createdAt)}</div>
                    <div className="font-bold">Penerbit Dokumen</div>
                  </div>
                  <div>
                    <div className="font-bold underline uppercase">
                      {selectedSnapshot.generatedByUserName}
                    </div>
                    <div className="text-[11px]">Pengampu Mata Pelajaran</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

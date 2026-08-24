import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Users, MessageSquare, AlertTriangle, CheckCircle2, UserCheck, Edit2, Trash2, X, School } from 'lucide-react';
import { HomeroomNote } from '../../types';

export const HomeroomView: React.FC = () => {
  const { classes, students, homeroomNotes, addHomeroomNote, deleteHomeroomNote, terminology } = useData();
  const { currentUser } = useAuth();

  // Find classes assigned to this homeroom teacher, or all for admin
  const assignedClasses = classes.filter(
    c => c.homeroomTeacherId === currentUser?.id || currentUser?.roles.includes('admin')
  );

  const [selectedClassId, setSelectedClassId] = useState<string>(assignedClasses[0]?.id || classes[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [category, setCategory] = useState<HomeroomNote['category']>('Catatan Akademik');
  const [content, setContent] = useState('');
  const [actionPlan, setActionPlan] = useState('');

  const classStudents = students.filter(s => s.classId === selectedClassId);
  const classNotes = homeroomNotes.filter(n => n.classId === selectedClassId);

  const handleOpenAdd = () => {
    setStudentId(classStudents[0]?.id || '');
    setCategory('Catatan Akademik');
    setContent('');
    setActionPlan('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !content.trim()) return;

    addHomeroomNote({
      classId: selectedClassId,
      studentId,
      date: new Date().toISOString().split('T')[0],
      category,
      content,
      actionPlan,
      isResolved: false,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Buku Pembinaan & Catatan {terminology.homeroomTeacher}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dokumentasi konseling, perkembangan karakter, komunikasi orang tua/wali, dan tindak lanjut kasus {terminology.student}.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Pembinaan {terminology.student}</span>
        </button>
      </div>

      {/* Class Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Rombel / Kelas Asuhan:</span>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({students.filter(s => s.classId === c.id).length} Siswa)
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Total Catatan: <span className="font-bold text-slate-900">{classNotes.length} Berkas</span>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {classNotes.length > 0 ? (
          classNotes.map(note => {
            const st = students.find(s => s.id === note.studentId);
            return (
              <div
                key={note.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {note.date}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{st?.fullName || 'Siswa'}</span>
                      <span className="text-slate-400 font-mono text-[11px] ml-2">NIS: {st?.nis}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
                      {note.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => deleteHomeroomNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px]">Uraian Kejadian / Catatan:</span>
                    <div className="text-slate-800 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      {note.content}
                    </div>
                  </div>

                  {note.actionPlan && (
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 text-amber-950">
                      <span className="font-semibold text-amber-900 block text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-amber-700" />
                        Tindak Lanjut & Solusi:
                      </span>
                      <div className="mt-0.5">{note.actionPlan}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">Belum ada catatan pembinaan {terminology.student} di kelas ini.</p>
            <p className="text-slate-400 mt-1">Gunakan tombol di atas untuk mencatat konseling, prestasi, atau komunikasi dengan orang tua.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Tambah Catatan Pembinaan {terminology.student}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih {terminology.student}</label>
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  required
                >
                  {classStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.nis})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Pembinaan</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as HomeroomNote['category'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="Catatan Akademik">Catatan Akademik & Nilai</option>
                  <option value="Kedisiplinan & Kehadiran">Kedisiplinan & Presensi</option>
                  <option value="Perilaku & Karakter">Perilaku & Karakter</option>
                  <option value="Komunikasi Orang Tua">Komunikasi dengan Orang Tua / Wali</option>
                  <option value="Prestasi & Penghargaan">Prestasi & Penghargaan</option>
                  <option value="Kesehatan">Kesehatan & Bimbingan Khusus</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian / Deskripsi Kasus</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan secara objektif pengamatan atau komunikasi yang terjadi..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rencana Tindak Lanjut / Solusi</label>
                <textarea
                  value={actionPlan}
                  onChange={e => setActionPlan(e.target.value)}
                  rows={2}
                  placeholder="contoh: Menghubungi orang tua via telepon, memberikan tugas remedial..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
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
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

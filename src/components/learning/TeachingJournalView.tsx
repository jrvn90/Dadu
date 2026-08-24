import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, BookOpen, Calendar, Edit2, Trash2, X, CheckCircle2, MessageSquare } from 'lucide-react';
import { TeachingJournal } from '../../types';

export const TeachingJournalView: React.FC = () => {
  const { teachingJournals, classes, subjects, schedules, createTeachingJournal, updateTeachingJournal, deleteTeachingJournal, terminology } = useData();
  const { currentUser } = useAuth();
  const isSupervisor = currentUser?.roles.includes('supervisor');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<TeachingJournal | null>(null);

  // Form states
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [learningTopic, setLearningTopic] = useState('');
  const [learningObjective, setLearningObjective] = useState('');
  const [activity, setActivity] = useState('');
  const [reflection, setReflection] = useState('');
  const [method, setMethod] = useState('Problem-Based Learning / Diskusi Interaktif');

  const handleOpenAdd = () => {
    setEditingJournal(null);
    setClassId(classes[0]?.id || '');
    setSubjectId(subjects[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setLearningTopic('');
    setLearningObjective('');
    setActivity('');
    setReflection('');
    setMethod('Problem-Based Learning / Diskusi Interaktif');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (jrn: TeachingJournal) => {
    setEditingJournal(jrn);
    setClassId(jrn.classId);
    setSubjectId(jrn.subjectId);
    setDate(jrn.date);
    setLearningTopic(jrn.learningTopic);
    setLearningObjective(jrn.learningObjective);
    setActivity(jrn.activity);
    setReflection(jrn.reflection || '');
    setMethod(jrn.method || 'Problem-Based Learning');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningTopic.trim() || !activity.trim()) return;

    if (editingJournal) {
      updateTeachingJournal(editingJournal.id, {
        classId,
        subjectId,
        date,
        learningTopic,
        learningObjective,
        activity,
        reflection,
        method,
      });
    } else {
      createTeachingJournal({
        classId,
        subjectId,
        date,
        learningTopic,
        learningObjective,
        activity,
        reflection,
        method,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus entri jurnal mengajar ini?')) {
      deleteTeachingJournal(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Jurnal Agenda Pembelajaran ({terminology.teacher})</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan materi pokok, tujuan pembelajaran, sintaks kegiatan belajar, dan refleksi pedagogik.
          </p>
        </div>
        {!isSupervisor && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Jurnal Mengajar</span>
          </button>
        )}
      </div>

      {/* Journals List */}
      <div className="space-y-4">
        {teachingJournals.length > 0 ? (
          teachingJournals.map(jrn => {
            const cls = classes.find(c => c.id === jrn.classId);
            const subj = subjects.find(s => s.id === jrn.subjectId);

            return (
              <div
                key={jrn.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      {jrn.date}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">{subj?.name || 'Mata Pelajaran'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700 text-[11px]">
                      {cls?.name || 'Kelas'}
                    </span>
                  </div>

                  {!isSupervisor && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(jrn)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(jrn.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Journal Details */}
                <div className="mt-3 space-y-2.5">
                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px]">Topik / Materi Pokok:</span>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{jrn.learningTopic}</div>
                  </div>

                  {jrn.learningObjective && (
                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px]">Tujuan Pembelajaran:</span>
                      <div className="text-slate-700 mt-0.5 leading-relaxed">{jrn.learningObjective}</div>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-slate-500 block text-[11px]">Kegiatan / Sintaks Pembelajaran:</span>
                    <div className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      {jrn.activity}
                    </div>
                  </div>

                  {jrn.reflection && (
                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/60 text-emerald-950">
                      <span className="font-semibold text-emerald-800 block text-[11px] flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-emerald-700" />
                        Refleksi & Tindak Lanjut:
                      </span>
                      <div className="mt-0.5">{jrn.reflection}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">Belum ada jurnal mengajar yang dibuat.</p>
            <p className="text-slate-400 mt-1">Klik tombol "+ Buat Jurnal Mengajar" untuk mendokumentasikan kegiatan pembelajaran hari ini.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingJournal ? 'Edit Jurnal Mengajar' : 'Buat Jurnal Agenda Pembelajaran'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{terminology.subject}</label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Topik / Materi Pokok</label>
                <input
                  type="text"
                  value={learningTopic}
                  onChange={e => setLearningTopic(e.target.value)}
                  placeholder="contoh: Persamaan Linier Satu Variabel (PLSV)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tujuan Pembelajaran</label>
                <textarea
                  value={learningObjective}
                  onChange={e => setLearningObjective(e.target.value)}
                  rows={2}
                  placeholder="Peserta didik mampu mengidentifikasi dan menyelesaikan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kegiatan / Sintaks Pembelajaran</label>
                <textarea
                  value={activity}
                  onChange={e => setActivity(e.target.value)}
                  rows={3}
                  placeholder="1. Pendahuluan: apersepsi & tujuan\n2. Kegiatan Inti: diskusi kelompok & presentasi\n3. Penutup: simpulan & refleksi..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Refleksi & Catatan Guru (Opsional)</label>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  rows={2}
                  placeholder="Sebagian besar siswa memahami materi dengan baik, 3 siswa memerlukan bimbingan tambahan..."
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
                  Simpan Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

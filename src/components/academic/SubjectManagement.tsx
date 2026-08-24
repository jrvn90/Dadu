import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, BookOpen, Edit2, Trash2, X, Check } from 'lucide-react';
import { Subject } from '../../types';

export const SubjectManagement: React.FC = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, terminology } = useData();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes('admin');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubj, setEditingSubj] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [shortName, setShortName] = useState('');
  const [category, setCategory] = useState<Subject['category']>('Umum');
  const [defaultPassingScore, setDefaultPassingScore] = useState(75);

  const handleOpenAdd = () => {
    setEditingSubj(null);
    setName('');
    setCode(`MAPEL-0${subjects.length + 1}`);
    setShortName('');
    setCategory('Umum');
    setDefaultPassingScore(75);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (subj: Subject) => {
    setEditingSubj(subj);
    setName(subj.name);
    setCode(subj.code);
    setShortName(subj.shortName);
    setCategory(subj.category);
    setDefaultPassingScore(subj.defaultPassingScore);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingSubj) {
      updateSubject(editingSubj.id, {
        name,
        code,
        shortName: shortName || name.slice(0, 4).toUpperCase(),
        category,
        defaultPassingScore,
      });
    } else {
      addSubject({
        name,
        code,
        shortName: shortName || name.slice(0, 4).toUpperCase(),
        category,
        defaultPassingScore,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, subjName: string) => {
    if (window.confirm(`Hapus ${terminology.subject} "${subjName}"?`)) {
      deleteSubject(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kurikulum & {terminology.subject}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar master {terminology.subject}, kode standar, kelompok kategori, dan KKM/KKTP ketuntasan.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah {terminology.subject}</span>
          </button>
        )}
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map(s => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-100">
                    {s.shortName || 'MP'}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">{s.name}</h2>
                    <div className="text-xs text-slate-500 font-mono">{s.code}</div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Kelompok / Kategori:</span>
                  <span className="font-medium text-slate-800">{s.category}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">KKM / Batas Tuntas:</span>
                  <span className="font-bold text-emerald-700">{s.defaultPassingScore}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                <Check className="w-3 h-3" />
                Aktif
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingSubj ? `Edit ${terminology.subject}` : `Tambah ${terminology.subject} Baru`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama {terminology.subject}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="contoh: Matematika"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode {terminology.subject}</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="contoh: MAT-01"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Singkatan / Akronim</label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={e => setShortName(e.target.value)}
                    placeholder="contoh: MTK"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori / Kelompok</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as Subject['category'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Kejuruan">Kejuruan</option>
                    <option value="Keagamaan">Keagamaan</option>
                    <option value="Mulok">Muatan Lokal</option>
                    <option value="Peminatan">Peminatan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KKM / Kriteria Tuntas</label>
                  <input
                    type="number"
                    value={defaultPassingScore}
                    onChange={e => setDefaultPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 font-bold text-emerald-800"
                    min={0}
                    max={100}
                    required
                  />
                </div>
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
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

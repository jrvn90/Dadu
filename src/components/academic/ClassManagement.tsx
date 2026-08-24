import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Users, Edit2, Trash2, Check, X, School } from 'lucide-react';
import { ClassRoom } from '../../types';

export const ClassManagement: React.FC = () => {
  const { classes, addClassRoom, updateClassRoom, deleteClassRoom, terminology, activeAcademicYear } = useData();
  const { allUsers, currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes('admin');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('7');
  const [group, setGroup] = useState('A');
  const [capacity, setCapacity] = useState(32);
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');

  const teachersList = allUsers.filter(u => u.roles.includes('teacher') || u.roles.includes('homeroom_teacher'));

  const handleOpenAdd = () => {
    setEditingClass(null);
    setName('Kelas VII-C');
    setLevel('7');
    setGroup('C');
    setCapacity(32);
    setHomeroomTeacherId(teachersList[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setName(cls.name);
    setLevel(cls.level);
    setGroup(cls.group || 'A');
    setCapacity(cls.capacity);
    setHomeroomTeacherId(cls.homeroomTeacherId || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingClass) {
      updateClassRoom(editingClass.id, {
        name,
        level,
        group,
        capacity,
        homeroomTeacherId,
      });
    } else {
      addClassRoom({
        name,
        level,
        group,
        capacity,
        homeroomTeacherId,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, className: string) => {
    if (window.confirm(`Hapus rombel ${className}? Data siswa dan jadwal terkait perlu disesuaikan.`)) {
      deleteClassRoom(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Rombongan Belajar (Kelas)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data kelas, tingkat jenjang, kapasitas, dan penetapan {terminology.homeroomTeacher} di {activeAcademicYear?.name}.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas Baru</span>
          </button>
        )}
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map(cls => {
          const homeroom = allUsers.find(u => u.id === cls.homeroomTeacherId);
          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 font-black text-sm flex items-center justify-center border border-emerald-100">
                      {cls.level}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">{cls.name}</h2>
                      <div className="text-xs text-slate-500">Tingkat {cls.level} (Kelompok {cls.group || '-'})</div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="Edit Kelas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id, cls.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">{terminology.homeroomTeacher}:</span>
                    <span className="font-semibold text-slate-800">{homeroom?.fullName || 'Belum Ditetapkan'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Kapasitas Maksimal:</span>
                    <span className="font-medium text-slate-700">{cls.capacity} Siswa</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Tahun Pelajaran:</span>
                    <span className="font-medium text-slate-700">{activeAcademicYear?.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  <Check className="w-3 h-3" />
                  Status Aktif
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingClass ? 'Edit Rombel Kelas' : 'Tambah Rombel Kelas Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="contoh: Kelas VII-A"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat / Jenjang</label>
                  <input
                    type="text"
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    placeholder="contoh: 7 / 8 / 9"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelompok / Abjad</label>
                  <input
                    type="text"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    placeholder="contoh: A / B / IPA 1"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kapasitas Maksimal Siswa</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={e => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  min={1}
                  max={60}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Penetapan {terminology.homeroomTeacher}</label>
                <select
                  value={homeroomTeacherId}
                  onChange={e => setHomeroomTeacherId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="">-- Pilih {terminology.teacher} --</option>
                  {teachersList.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.nip || 'Guru'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  Simpan Data Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

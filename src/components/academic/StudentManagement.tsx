import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, QrCode, Filter, Edit2, Trash2, X, Download, UserCheck, ShieldCheck, FileSpreadsheet, Upload } from 'lucide-react';
import { exportStudentsToExcel, downloadWorkbook } from '../../lib/excelUtils';
import { Student } from '../../types';

interface StudentManagementProps {
  onOpenQRCard?: (student: Student) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ onOpenQRCard }) => {
  const { students, classes, addStudent, updateStudent, deleteStudent, terminology } = useData();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes('admin');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('2011-01-01');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery) ||
        s.nisn.includes(searchQuery);
      const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
      return matchSearch && matchClass;
    });
  }, [students, searchQuery, selectedClassId]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFullName('');
    setNis(`242507${String(students.length + 1).padStart(3, '0')}`);
    setNisn(`00891234${String(students.length + 10).padStart(2, '0')}`);
    setGender('L');
    setBirthPlace('Bandung');
    setBirthDate('2011-05-15');
    setClassId(classes[0]?.id || '');
    setAddress('Jl. Pendidikan No. 10');
    setPhone('08123456789');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setFullName(st.fullName);
    setNis(st.nis);
    setNisn(st.nisn);
    setGender(st.gender);
    setBirthPlace(st.birthPlace);
    setBirthDate(st.birthDate);
    setClassId(st.classId);
    setAddress(st.address);
    setPhone(st.phone || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !nis.trim()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        fullName,
        nis,
        nisn,
        gender,
        birthPlace,
        birthDate,
        classId,
        address,
        phone,
      });
    } else {
      addStudent({
        fullName,
        nis,
        nisn,
        gender,
        birthPlace,
        birthDate,
        classId,
        address,
        phone,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus data ${terminology.student} "${name}"?`)) {
      deleteStudent(id);
    }
  };

  const handleExportToExcel = () => {
    const wb = exportStudentsToExcel(filteredStudents, classes);
    downloadWorkbook(wb, `Data_Siswa_${selectedClassId === 'all' ? 'Semua' : selectedClassId}_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Data Induk {terminology.student}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Basis data master tunggal identitas, NIS, NISN, rombel, dan secure token QR Presensi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportToExcel}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah {terminology.student}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Cari nama, NIS, atau NISN...`}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Kelas:</span>
          </div>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Semua Kelas ({students.length})</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({students.filter(s => s.classId === c.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Students */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">NIS / NISN</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">L/P</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Tempat, Tgl Lahir</th>
                <th className="py-3.5 px-4">QR Token</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st, idx) => {
                  const cls = classes.find(c => c.id === st.classId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        <div>{st.nis}</div>
                        <div className="text-[10px] text-slate-400">{st.nisn}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {st.fullName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            st.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                          }`}
                        >
                          {st.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {cls?.name || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {st.birthPlace}, {st.birthDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {st.qrToken?.substring(0, 15)}...
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onOpenQRCard && (
                            <button
                              onClick={() => onOpenQRCard(st)}
                              className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50"
                              title="Lihat Kartu QR"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(st)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Edit Siswa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(st.id, st.fullName)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Hapus Siswa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    Tidak ada data {terminology.student} yang sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStudent ? `Edit Data ${terminology.student}` : `Tambah ${terminology.student} Baru`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="contoh: Muhammad Rizky Pratama"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS (Nomor Induk Siswa)</label>
                  <input
                    type="text"
                    value={nis}
                    onChange={e => setNis(e.target.value)}
                    placeholder="contoh: 242507001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN (Nasional)</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={e => setNisn(e.target.value)}
                    placeholder="contoh: 0089123451"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas / Rombel</label>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={e => setBirthPlace(e.target.value)}
                    placeholder="contoh: Bandung"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Alamat domisili siswa..."
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

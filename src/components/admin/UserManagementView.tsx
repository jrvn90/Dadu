import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Plus, Users, Shield, UserCheck, Edit2, Trash2, X, Lock, Check } from 'lucide-react';
import { User, UserRole } from '../../types';

export const UserManagementView: React.FC = () => {
  const { allUsers, currentUser, registerNewUser } = useAuth();
  const { terminology, logAudit } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [nip, setNip] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(['teacher']);

  const handleOpenAdd = () => {
    setFullName('');
    setEmail('');
    setNip('');
    setSelectedRoles(['teacher']);
    setIsModalOpen(true);
  };

  const handleToggleRole = (r: UserRole) => {
    if (selectedRoles.includes(r)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter(role => role !== r));
      }
    } else {
      setSelectedRoles([...selectedRoles, r]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    registerNewUser({
      fullName,
      email,
      nip,
      roles: selectedRoles,
      organizationId: currentUser?.organizationId || 'org_smp_nusantara',
      status: 'active',
    });
    logAudit('USER_CREATED', 'UserProfile', email, { fullName, roles: selectedRoles });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Akun Pengguna & Hak Akses (RBAC)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan peran Administrator, {terminology.teacher}, {terminology.homeroomTeacher}, dan {terminology.supervisor}.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Akun Pengguna</span>
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">NIP</th>
                <th className="py-3.5 px-4">Peran (Role RBAC)</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {allUsers.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {u.fullName}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Anda
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">{u.email}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">{u.nip || '-'}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map(r => (
                        <span
                          key={r}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r === 'admin'
                              ? 'bg-rose-100 text-rose-800'
                              : r === 'supervisor'
                              ? 'bg-indigo-100 text-indigo-800'
                              : r === 'homeroom_teacher'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {r.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <Check className="w-3 h-3" />
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Tambah Akun Pengguna</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="contoh: Rahmat Hidayat, S.Pd"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rahmat@sekolah.sch.id"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP (Nomor Induk Pegawai)</label>
                <input
                  type="text"
                  value={nip}
                  onChange={e => setNip(e.target.value)}
                  placeholder="198708152012011002"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">Pilih Peran Akses (Multi-Role)</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['teacher', 'homeroom_teacher', 'supervisor', 'admin'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleToggleRole(role)}
                      className={`p-2 rounded-lg border text-left font-semibold transition-all ${
                        selectedRoles.includes(role)
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {role === 'teacher' && `Guru`}
                      {role === 'homeroom_teacher' && `Wali Kelas`}
                      {role === 'supervisor' && `Supervisor`}
                      {role === 'admin' && `Administrator`}
                    </button>
                  ))}
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
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Lock, Mail, User, School, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, allUsers, allOrganizations } = useAuth();
  const { terminology } = useData();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState(allOrganizations[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        if (!fullName || !email || !password) {
          setErrorMsg('Mohon lengkapi semua kolom.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Konfirmasi password tidak cocok.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password minimal 6 karakter.');
          setIsSubmitting(false);
          return;
        }
        const ok = await register(fullName, email, password, selectedOrgId);
        if (ok) {
          setSuccessMsg('Pendaftaran berhasil! Akun Anda berstatus PENDING dan menunggu persetujuan Administrator.');
          setIsRegisterMode(false);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        if (!email || !password) {
          setErrorMsg('Email dan password wajib diisi.');
          setIsSubmitting(false);
          return;
        }
        const ok = await login(email, password);
        if (ok) {
          onClose();
        } else {
          setErrorMsg('Email atau kata sandi tidak ditemukan atau akun dinonaktifkan.');
        }
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan autentikasi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setErrorMsg('');
    setIsSubmitting(true);
    await login(userEmail, 'demo123');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-800 to-teal-700 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md mb-3 border border-white/20">
            <School className="w-6 h-6 text-emerald-200" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">DADU</h2>
          <p className="text-emerald-100 text-xs mt-1 font-medium">Digitalisasi Data dari Guru — Satu Data, Banyak Kemudahan</p>
          <div className="mt-3 text-xs bg-emerald-950/40 text-emerald-200 py-1 px-3 rounded-full inline-block border border-emerald-500/30">
            {isRegisterMode ? 'Pendaftaran Akun Pengajar Baru' : 'Autentikasi Firebase Email / Password'}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="contoh: Hj. Nurul Hidayah, S.Pd."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih {terminology.institution}</label>
                  <select
                    value={selectedOrgId}
                    onChange={e => setSelectedOrgId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {allOrganizations.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.code})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@sekolah.sch.id"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Akun baru otomatis didaftarkan sebagai {terminology.teacher} dan memerlukan verifikasi Administrator sebelum aktif.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-sm transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : isRegisterMode ? (
                <>
                  <span>Ajukan Pendaftaran</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Masuk ke DADU</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{isRegisterMode ? 'Sudah memiliki akun?' : 'Belum terdaftar di DADU?'}</span>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-emerald-700 font-semibold hover:underline"
            >
              {isRegisterMode ? 'Masuk di sini' : 'Daftar Akun Baru'}
            </button>
          </div>

          {/* Quick Demo Switcher for Evaluation */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Akun Demonstrasi Cepat (Multi-Role):
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {allUsers.filter(u => u.status === 'active').slice(0, 4).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.email)}
                  className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-xs group"
                >
                  <div className="font-medium text-slate-800 truncate group-hover:text-emerald-800">{u.displayName}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="capitalize">{u.roles[0]}</span>
                    {u.isPrimaryAdmin && <span className="text-[9px] px-1 bg-amber-100 text-amber-800 rounded font-semibold">Primary</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

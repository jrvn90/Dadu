import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Lock,
  Mail,
  User,
  School,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  KeyRound,
  Layers,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

interface AuthScreenProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ isModal = false, onClose }) => {
  const { login, register, allUsers, allOrganizations, switchAccount } = useAuth();
  const { terminology, institutionSettings } = useData();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nip, setNip] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState(allOrganizations[0]?.id || 'org_smp_nusantara');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        if (!fullName.trim() || !email.trim() || !password) {
          setErrorMsg('Nama lengkap, email, dan kata sandi wajib diisi.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Konfirmasi kata sandi tidak cocok.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Kata sandi minimal 6 karakter.');
          setIsSubmitting(false);
          return;
        }

        const ok = await register(fullName.trim(), email.trim(), password, selectedOrgId);
        if (ok) {
          setSuccessMsg(
            'Pendaftaran berhasil! Akun Anda telah dibuat. Jika ini akun pertama, Anda dapat langsung masuk, atau menunggu persetujuan Administrator.'
          );
          setIsRegisterMode(false);
          setPassword('');
          setConfirmPassword('');
        } else {
          setErrorMsg('Gagal mendaftarkan akun. Silakan periksa kembali data Anda.');
        }
      } else {
        if (!email.trim() || !password) {
          setErrorMsg('Alamat email dan kata sandi wajib diisi.');
          setIsSubmitting(false);
          return;
        }

        const ok = await login(email.trim(), password);
        if (ok) {
          if (onClose) onClose();
        } else {
          setErrorMsg('Email atau kata sandi salah, atau akun Anda belum disetujui Administrator.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Terjadi kendala saat menghubungkan ke layanan autentikasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (userEmail: string) => {
    setErrorMsg('');
    setIsSubmitting(true);
    await login(userEmail, 'demo123');
    setIsSubmitting(false);
    if (onClose) onClose();
  };

  const content = (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950 p-7 text-white text-center relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md mb-3.5 border border-white/20 shadow-inner">
          <School className="w-7 h-7 text-emerald-300" />
        </div>
        <h1 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
          <span>DADU</span>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-400/20 text-emerald-200 rounded-full border border-emerald-400/30">
            PRODUKSI
          </span>
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium max-w-md mx-auto">
          Digitalisasi Data dari Guru — Satu Data, Banyak Kemudahan
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs">
          <span className="bg-emerald-950/60 text-emerald-200 py-1 px-3.5 rounded-full border border-emerald-600/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{institutionSettings.institutionName || 'Sistem Administrasi Guru'}</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5">
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(false);
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            !isRegisterMode
              ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4 text-emerald-700" />
          <span>Masuk (Login)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(true);
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            isRegisterMode
              ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          <span>Daftar Akun Baru</span>
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="contoh: Drs. H. Bambang Irawan, M.Pd."
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  NIP / NUPTK <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={e => setNip(e.target.value)}
                  placeholder="198501012010011001"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih {terminology.institution} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <School className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <select
                    value={selectedOrgId}
                    onChange={e => setSelectedOrgId(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-slate-50/50"
                  >
                    {allOrganizations.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Alamat Email Resmi <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id atau email pribadi"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kata Sandi (Password) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
                required
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Pendaftaran baru secara aman akan dikonfigurasi sebagai <strong>{terminology.teacher}</strong> dan diverifikasi oleh Administrator sekolah.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Menghubungkan ke Firebase...</span>
              </span>
            ) : isRegisterMode ? (
              <>
                <span>Daftarkan Akun Pengajar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard DADU</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Switcher (Collapsible for Evaluators/Testing) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDemoSelector(!showDemoSelector)}
            className="w-full py-2 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Akses Cepat Pengujian Peran (Demo Roles)</span>
            </span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showDemoSelector ? 'rotate-90' : ''}`} />
          </button>

          {showDemoSelector && (
            <div className="mt-3 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {allUsers
                .filter(u => u.status === 'active')
                .slice(0, 4)
                .map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u.email)}
                    className="text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all text-xs group cursor-pointer shadow-2xs"
                  >
                    <div className="font-bold text-slate-900 truncate group-hover:text-emerald-800">
                      {u.displayName || u.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="capitalize font-semibold text-emerald-700">{u.roles[0]?.replace('_', ' ')}</span>
                      {u.isPrimaryAdmin && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full font-bold">
                          Admin
                        </span>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="relative w-full max-w-xl">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
            >
              ✕
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      {content}
      <div className="mt-6 text-center text-xs text-slate-500">
        DADU v2.5 • Terintegrasi dengan Cloud Firestore Firebase & Keamanan Multi-Tenant
      </div>
    </div>
  );
};

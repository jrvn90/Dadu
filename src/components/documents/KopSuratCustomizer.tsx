import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Sliders,
  Check,
  Save,
  RotateCcw,
  Eye,
  Building,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { InstitutionSettings } from '../../types';

export const KopSuratCustomizer: React.FC = () => {
  const { institutionSettings, updateInstitutionSettings, logAudit } = useData();
  const { currentUser } = useAuth();

  const [settings, setSettings] = useState<InstitutionSettings>({ ...institutionSettings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [borderStyle, setBorderStyle] = useState<'double' | 'solid' | 'minimal'>('double');
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('DOKUMEN RESMI');
  const [showSecondaryLogo, setShowSecondaryLogo] = useState(false);
  const [logoSecondaryUrl, setLogoSecondaryUrl] = useState('');

  const handleChange = (field: keyof InstitutionSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateInstitutionSettings(settings);
    logAudit('CONFIGURATION_CHANGED', 'InstitutionSettings', settings.id, {
      updatedFields: Object.keys(settings),
      updatedBy: currentUser?.fullName,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings({ ...institutionSettings });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Desainer & Penyesuai KOP Surat Resmi Institusi
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Standardized Layout
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Sesuaikan struktur kepala surat kedinasan, logo ganda (Tut Wuri Handayani / Kemenag / Pemda),
                garis pembatas ganda, dan identitas penanggung jawab yang berlaku pada seluruh modul cetak.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset Perubahan</span>
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Konfigurasi KOP</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Konfigurasi KOP Surat berhasil diperbarui dan diterapkan ke seluruh dokumen resmi!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Identitas Instansi Bagian Atas */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-emerald-700" />
              <span>1. Teks Hirarki Kepala Surat (Header Text)</span>
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pemerintah Daerah / Lembaga Pembina (Baris 1)
              </label>
              <input
                type="text"
                value={settings.governmentDepartment || ''}
                onChange={e => handleChange('governmentDepartment', e.target.value)}
                placeholder="Contoh: PEMERINTAH DAERAH PROVINSI JAWA BARAT"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dinas / Kementerian Terkait (Baris 2)
              </label>
              <input
                type="text"
                value={settings.educationOffice || ''}
                onChange={e => handleChange('educationOffice', e.target.value)}
                placeholder="Contoh: DINAS PENDIDIKAN DAN KEBUDAYAAN"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Resmi Satuan Pendidikan (Baris Utama)
              </label>
              <input
                type="text"
                value={settings.institutionName}
                onChange={e => handleChange('institutionName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
                <input
                  type="text"
                  value={settings.npsn || ''}
                  onChange={e => handleChange('npsn', e.target.value)}
                  placeholder="20212345"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NSS / NDS</label>
                <input
                  type="text"
                  value={settings.nss || ''}
                  onChange={e => handleChange('nss', e.target.value)}
                  placeholder="201026001001"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / Fax</label>
                <input
                  type="text"
                  value={settings.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="(022) 7891234"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="info@sekolah.sch.id"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Situs Web Resmi</label>
              <input
                type="text"
                value={settings.website || ''}
                onChange={e => handleChange('website', e.target.value)}
                placeholder="https://smpn1nusantara.sch.id"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Logo & Border Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm border-b border-slate-100 pb-3">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>2. Pengaturan Logo & Garis Pembatas (Borders)</span>
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL Logo Utama (Kiri)</label>
              <input
                type="text"
                value={settings.logoUrl || ''}
                onChange={e => handleChange('logoUrl', e.target.value)}
                placeholder="https://.../logo-sekolah.png"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSecondaryLogo}
                  onChange={e => setShowSecondaryLogo(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-700">Tampilkan Logo Sekunder (Kanan - Tut Wuri / Pemda)</span>
              </label>

              {showSecondaryLogo && (
                <div className="mt-2 pl-6">
                  <input
                    type="text"
                    value={logoSecondaryUrl}
                    onChange={e => setLogoSecondaryUrl(e.target.value)}
                    placeholder="URL logo sekunder (kanan)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="block font-semibold text-slate-700 mb-1.5">Gaya Garis Pembatas KOP</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBorderStyle('double')}
                  className={`p-2 rounded-lg border text-center font-medium transition-all ${
                    borderStyle === 'double'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Double Ganda (Baku)
                </button>
                <button
                  type="button"
                  onClick={() => setBorderStyle('solid')}
                  className={`p-2 rounded-lg border text-center font-medium transition-all ${
                    borderStyle === 'solid'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Solid Tebal 2px
                </button>
                <button
                  type="button"
                  onClick={() => setBorderStyle('minimal')}
                  className={`p-2 rounded-lg border text-center font-medium transition-all ${
                    borderStyle === 'minimal'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Minimalis 1px
                </button>
              </div>
            </div>
          </div>

          {/* Penandatangan Utama (Kepala Sekolah) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm border-b border-slate-100 pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>3. Pejabat Penandatangan Utama (Default Signatory)</span>
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah / Pimpinan</label>
              <input
                type="text"
                value={settings.principalName}
                onChange={e => handleChange('principalName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={settings.principalNip || ''}
                onChange={e => handleChange('principalNip', e.target.value)}
                placeholder="197508151999031002"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Live Visual Preview Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>Pratinjau KOP Surat Realtime (Skala Cetak 1:1)</span>
              </span>
              <span className="text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
                Standar KOP Dinas Indonesia
              </span>
            </div>

            {/* Simulated Paper Canvas */}
            <div className="bg-white rounded-xl border border-slate-300 shadow-md p-8 min-h-[520px] relative text-slate-900 flex flex-col justify-between">
              {/* Header Box */}
              <div>
                <div className="flex items-center justify-between gap-4 pb-3">
                  {/* Primary Logo (Left) */}
                  <div className="w-18 h-18 shrink-0 flex items-center justify-center border border-dashed border-slate-300 rounded-lg bg-slate-50 text-slate-400 overflow-hidden">
                    {settings.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt="Logo Sekolah"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-[10px] text-center font-bold p-1 leading-tight text-slate-500">
                        LOGO UTAMA
                      </div>
                    )}
                  </div>

                  {/* Centered Typography */}
                  <div className="text-center flex-1 space-y-0.5">
                    {settings.governmentDepartment && (
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800 leading-tight">
                        {settings.governmentDepartment}
                      </div>
                    )}
                    {settings.educationOffice && (
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800 leading-tight">
                        {settings.educationOffice}
                      </div>
                    )}
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-950 leading-tight">
                      {settings.institutionName}
                    </h2>
                    {(settings.npsn || settings.nss) && (
                      <div className="text-[10px] font-semibold text-slate-700 tracking-wide">
                        {settings.npsn && `NPSN: ${settings.npsn}`} {settings.nss && `• NSS: ${settings.nss}`}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-600 leading-tight">
                      {settings.address}
                    </div>
                    <div className="text-[9.5px] text-slate-600 leading-tight">
                      {settings.phone && `Telp: ${settings.phone}`}
                      {settings.email && ` • Email: ${settings.email}`}
                      {settings.website && ` • Web: ${settings.website}`}
                    </div>
                  </div>

                  {/* Secondary Logo (Right - Optional) */}
                  {showSecondaryLogo ? (
                    <div className="w-18 h-18 shrink-0 flex items-center justify-center border border-dashed border-slate-300 rounded-lg bg-slate-50 text-slate-400 overflow-hidden">
                      {logoSecondaryUrl ? (
                        <img
                          src={logoSecondaryUrl}
                          alt="Logo Sekunder"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-[10px] text-center font-bold p-1 leading-tight text-slate-500">
                          LOGO 2
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-18 shrink-0 hidden sm:block" />
                  )}
                </div>

                {/* Decorative Divider Line */}
                <div
                  className={`w-full mb-6 ${
                    borderStyle === 'double'
                      ? 'border-b-4 border-double border-slate-950'
                      : borderStyle === 'solid'
                      ? 'border-b-2 border-slate-950'
                      : 'border-b border-slate-400'
                  }`}
                />

                {/* Sample Document Body Placeholder */}
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="text-center my-4 space-y-1">
                    <h3 className="text-sm font-bold uppercase underline tracking-wider">
                      SURAT KETERANGAN RESMI ADMINISTRASI GURU
                    </h3>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Nomor: 421.3 / 048 / DADU / 2024
                    </div>
                  </div>

                  <p className="leading-relaxed text-justify">
                    Yang bertanda tangan di bawah ini Kepala <strong>{settings.institutionName}</strong> menerangkan dengan sebenarnya bahwa dokumen ini digenerasi secara resmi melalui sistem manajemen pembelajaran DADU (Digitalisasi Data dari Guru) dengan konfigurasi KOP yang telah tervalidasi.
                  </p>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono">
                    <div className="font-bold text-slate-800 mb-1">// Snapshot Metadata KOP</div>
                    <div>Nama Institusi : {settings.institutionName}</div>
                    <div>Status Akreditasi : A (Unggul)</div>
                    <div>Verifikasi : Signed & Digitally Archived</div>
                  </div>
                </div>
              </div>

              {/* Sample Signatory Footer */}
              <div className="mt-8 pt-4 grid grid-cols-2 text-xs text-slate-900 border-t border-slate-100">
                <div className="space-y-12">
                  <div>
                    <div className="text-slate-500">Mengetahui,</div>
                    <div className="font-bold">Ketua Komite Sekolah</div>
                  </div>
                  <div>
                    <div className="font-bold underline uppercase">H. Bambang Irawan, S.E.</div>
                    <div className="text-[10px] text-slate-500">Ketua Komite</div>
                  </div>
                </div>

                <div className="text-right space-y-12">
                  <div>
                    <div className="text-slate-500">Nusantara, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div className="font-bold">Kepala Sekolah</div>
                  </div>
                  <div>
                    <div className="font-bold underline uppercase">{settings.principalName}</div>
                    <div className="text-[10px] text-slate-500">NIP. {settings.principalNip || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

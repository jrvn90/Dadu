import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Building2, Sliders, Save, CheckCircle2, Download, RotateCcw, ShieldCheck, School } from 'lucide-react';
import { TerminologySettings, InstitutionSettings } from '../../types';

export const SettingsCenter: React.FC = () => {
  const {
    institutionSettings,
    updateInstitutionSettings,
    terminology,
    updateTerminology,
    activeAcademicYear,
    activeSemester,
    academicYears,
    semesters,
    setActiveAcademicYear,
    setActiveSemester,
  } = useData();

  const { currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes('admin');

  // Institution profile form state
  const [instName, setInstName] = useState(institutionSettings.institutionName);
  const [govDept, setGovDept] = useState(institutionSettings.governmentDepartment || '');
  const [npsn, setNpsn] = useState(institutionSettings.npsn || '');
  const [address, setAddress] = useState(institutionSettings.address);
  const [principalName, setPrincipalName] = useState(institutionSettings.principalName || '');
  const [principalNip, setPrincipalNip] = useState(institutionSettings.principalNip || '');
  const [phone, setPhone] = useState(institutionSettings.phone || '');
  const [email, setEmail] = useState(institutionSettings.email || '');

  // Terminology form state
  const [termStudent, setTermStudent] = useState(terminology.student);
  const [termTeacher, setTermTeacher] = useState(terminology.teacher);
  const [termClass, setTermClass] = useState(terminology.class);
  const [termSubject, setTermSubject] = useState(terminology.subject);
  const [termHomeroom, setTermHomeroom] = useState(terminology.homeroomTeacher);
  const [termSupervisor, setTermSupervisor] = useState(terminology.supervisor);

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSaveInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstitutionSettings({
      institutionName: instName,
      governmentDepartment: govDept,
      npsn,
      address,
      principalName,
      principalNip,
      phone,
      email,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleSaveTerminology = (e: React.FormEvent) => {
    e.preventDefault();
    updateTerminology({
      student: termStudent,
      teacher: termTeacher,
      class: termClass,
      subject: termSubject,
      homeroomTeacher: termHomeroom,
      supervisor: termSupervisor,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleApplyPreset = (preset: 'sekolah' | 'madrasah' | 'pesantren') => {
    if (preset === 'sekolah') {
      setTermStudent('Siswa');
      setTermTeacher('Guru');
      setTermClass('Kelas');
      setTermSubject('Mata Pelajaran');
      setTermHomeroom('Wali Kelas');
      setTermSupervisor('Pengawas / Kepala Sekolah');
    } else if (preset === 'madrasah') {
      setTermStudent('Peserta Didik');
      setTermTeacher('Pendidik / Guru');
      setTermClass('Rombel');
      setTermSubject('Mata Pelajaran');
      setTermHomeroom('Wali Kelas');
      setTermSupervisor('Pengawas Madrasah');
    } else if (preset === 'pesantren') {
      setTermStudent('Santri');
      setTermTeacher('Ustadz / Ustadzah');
      setTermClass('Halaqah');
      setTermSubject('Kajian / Dars');
      setTermHomeroom('Musyrif / Wali Asrama');
      setTermSupervisor('Mudir / Pimpinan Pesantren');
    }
  };

  const handleExportData = () => {
    const rawData = {
      institutionSettings,
      terminology,
      exportTimestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(rawData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DADU_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pusat Pengaturan & Konfigurasi Sistem</h1>
        <p className="text-xs text-slate-500 mt-1">
          Pengaturan identitas sekolah, penyesuaian istilah dinamis (Terminology Engine), semester aktif, dan backup data.
        </p>
      </div>

      {savedFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan berhasil disimpan dan langsung diterapkan ke seluruh aplikasi.</span>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Terminology Engine */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <h2 className="font-bold text-slate-900 text-sm">Terminology Engine (Istilah Dinamis)</h2>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">Preset Cepat:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('sekolah')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Sekolah Umum
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('madrasah')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Madrasah
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('pesantren')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Pesantren
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveTerminology} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Istilah Siswa</label>
                  <input
                    type="text"
                    value={termStudent}
                    onChange={e => setTermStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Istilah Guru</label>
                  <input
                    type="text"
                    value={termTeacher}
                    onChange={e => setTermTeacher(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Istilah Kelas</label>
                  <input
                    type="text"
                    value={termClass}
                    onChange={e => setTermClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Istilah Mata Pelajaran</label>
                  <input
                    type="text"
                    value={termSubject}
                    onChange={e => setTermSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Istilah Wali Kelas</label>
                  <input
                    type="text"
                    value={termHomeroom}
                    onChange={e => setTermHomeroom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Istilah Supervisor</label>
                  <input
                    type="text"
                    value={termSupervisor}
                    onChange={e => setTermSupervisor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Istilah Dinamis</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Institution Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <h2 className="font-bold text-slate-900 text-sm">Profil Institusi & KOP Cetak</h2>
              </div>
            </div>

            <form onSubmit={handleSaveInstitution} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Resmi Sekolah / Institusi</label>
                <input
                  type="text"
                  value={instName}
                  onChange={e => setInstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instansi Pembina / Dinas</label>
                  <input
                    type="text"
                    value={govDept}
                    onChange={e => setGovDept(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
                  <input
                    type="text"
                    value={npsn}
                    onChange={e => setNpsn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={principalName}
                    onChange={e => setPrincipalName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={principalNip}
                    onChange={e => setPrincipalNip(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Profil Institusi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Backup & System Integrity */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Cadangkan Data (Snapshot JSON)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Unduh seluruh konfigurasi master data dan relasi kelas untuk arsip offline.
          </p>
        </div>
        <button
          onClick={handleExportData}
          className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-2 border border-emerald-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Backup JSON</span>
        </button>
      </div>
    </div>
  );
};

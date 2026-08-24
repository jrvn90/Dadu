import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import {
  Search,
  Users,
  School,
  BookOpen,
  ClipboardCheck,
  Award,
  FileSpreadsheet,
  Printer,
  Settings,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  X,
  Command,
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (moduleName: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { classes, students, subjects, terminology } = useData();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lowerQuery = query.toLowerCase().trim();

  // Navigation Items
  const navigationItems = [
    { id: 'dashboard', title: 'Dashboard Utama Guru', icon: School, category: 'Menu Navigasi' },
    { id: 'attendance_session', title: 'Sesi Presensi Siswa (QR / Manual)', icon: ClipboardCheck, category: 'Menu Navigasi' },
    { id: 'student_qr', title: 'Kartu QR Presensi Peserta Didik', icon: Users, category: 'Menu Navigasi' },
    { id: 'attendance_recap', title: 'Rekapitulasi Kehadiran Kelas', icon: FileSpreadsheet, category: 'Menu Navigasi' },
    { id: 'teaching_journal', title: 'Buku Jurnal & Agenda Mengajar', icon: BookOpen, category: 'Menu Navigasi' },
    { id: 'assessments_grades', title: 'Asesmen Formatif, Sumatif & Input Nilai', icon: Award, category: 'Menu Navigasi' },
    { id: 'class_ledger', title: 'Leger Nilai (DKN) & Cetak Rapor', icon: FileSpreadsheet, category: 'Menu Navigasi' },
    { id: 'homeroom', title: 'Buku Rombel & Konseling Wali Kelas', icon: Users, category: 'Menu Navigasi' },
    { id: 'analytics', title: 'Analitik Akademik & Deteksi Dini (EWS)', icon: TrendingUp, category: 'Menu Navigasi' },
    { id: 'supervision', title: 'Instrumen Supervisi Akademik', icon: ShieldCheck, category: 'Menu Navigasi' },
    { id: 'document_engine', title: 'Document Engine & Arsip Snapshot', icon: Printer, category: 'Menu Navigasi' },
    { id: 'data_import_export', title: 'Pusat Impor & Ekspor Data Excel', icon: FileSpreadsheet, category: 'Menu Navigasi' },
    { id: 'cloud_security', title: 'Pusat Cloud Sync & Keamanan Data', icon: ShieldCheck, category: 'Menu Navigasi' },
    { id: 'system_integration', title: 'Pusat Integrasi Sistem & Kesiapan Produksi', icon: Activity, category: 'Menu Navigasi' },
    { id: 'classes', title: 'Manajemen Data Rombongan Belajar', icon: School, category: 'Master Data' },
    { id: 'students', title: `Manajemen Data ${terminology.student}`, icon: Users, category: 'Master Data' },
    { id: 'subjects', title: `Manajemen Data ${terminology.subject}`, icon: BookOpen, category: 'Master Data' },
    { id: 'settings', title: 'Pengaturan Satuan Pendidikan & Istilah', icon: Settings, category: 'Konfigurasi' },
  ];

  const filteredMenus = navigationItems.filter(
    item => item.title.toLowerCase().includes(lowerQuery) || item.category.toLowerCase().includes(lowerQuery)
  );

  const filteredStudents = students
    .filter(
      s =>
        s.fullName.toLowerCase().includes(lowerQuery) ||
        s.nis.toLowerCase().includes(lowerQuery) ||
        (s.nisn && s.nisn.toLowerCase().includes(lowerQuery))
    )
    .slice(0, 5);

  const filteredClasses = classes
    .filter(c => c.name.toLowerCase().includes(lowerQuery))
    .slice(0, 4);

  const handleSelect = (moduleId: string) => {
    onNavigate(moduleId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center p-4 sm:pt-20">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik untuk mencari menu, siswa, kelas, atau fitur (Ctrl+K)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm font-medium text-slate-900 placeholder-slate-400 bg-transparent border-none outline-none focus:ring-0"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[420px] overflow-y-auto p-2 divide-y divide-slate-100 text-xs">
          {/* Navigation Menus */}
          {filteredMenus.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Menu & Modul Aplikasi
              </div>
              <div className="space-y-1 mt-1">
                {filteredMenus.map(menu => {
                  const Icon = menu.icon;
                  return (
                    <button
                      key={menu.id}
                      onClick={() => handleSelect(menu.id)}
                      className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left hover:bg-emerald-50 hover:text-emerald-900 group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
                        <span className="font-semibold text-slate-800 group-hover:text-emerald-900">
                          {menu.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-emerald-700 flex items-center gap-1 font-medium">
                        <span>Buka</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Students Search Results */}
          {lowerQuery && filteredStudents.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pencarian {terminology.student} ({filteredStudents.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredStudents.map(student => {
                  const studentClass = classes.find(c => c.id === student.classId);
                  return (
                    <button
                      key={student.id}
                      onClick={() => handleSelect('homeroom')}
                      className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 group transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-900">
                          {student.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          NIS: {student.nis} {student.nisn ? `• NISN: ${student.nisn}` : ''} • Rombel: {studentClass?.name || '-'}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 group-hover:bg-emerald-100 px-2 py-0.5 rounded">
                        Lihat Profil
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Classes Search Results */}
          {lowerQuery && filteredClasses.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pencarian {terminology.classRoom} ({filteredClasses.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredClasses.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => handleSelect('attendance_recap')}
                    className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-left hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 group transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-emerald-900">
                        {cls.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tingkat: {cls.gradeLevel} • Kapasitas: {cls.studentCount || 0} Siswa
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 group-hover:bg-emerald-100 px-2 py-0.5 rounded">
                      Buka Rekap
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredMenus.length === 0 && filteredStudents.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-medium">Tidak ada hasil ditemukan untuk "{query}"</p>
              <p className="text-[11px] mt-1">Coba gunakan kata kunci seperti presensi, nilai, leger, nama siswa, atau rombel.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] font-bold shadow-2xs">
              ESC
            </span>
            <span>untuk menutup</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <span>DADU Command Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
};

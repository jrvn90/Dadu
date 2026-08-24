import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Award, Filter, Save, CheckCircle2, TrendingUp, Sparkles, X, Edit2, Trash2 } from 'lucide-react';
import { Assessment, AssessmentType } from '../../types';

export const AssessmentAndGradesView: React.FC = () => {
  const {
    assessments,
    grades,
    classes,
    subjects,
    students,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    recordGrade,
    batchRecordGrades,
    terminology,
  } = useData();

  const { currentUser } = useAuth();
  const isSupervisor = currentUser?.roles.includes('supervisor');

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  // New assessment form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AssessmentType>('Formatif');
  const [maxScore, setMaxScore] = useState(100);
  const [weight, setWeight] = useState(1);
  const [passingScore, setPassingScore] = useState(75);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter assessments for class & subject
  const currentAssessments = useMemo(() => {
    return assessments.filter(
      a => a.classId === selectedClassId && a.subjectId === selectedSubjectId
    );
  }, [assessments, selectedClassId, selectedSubjectId]);

  // Set default selected assessment if none or invalid
  const activeAssessment = useMemo(() => {
    return currentAssessments.find(a => a.id === selectedAssessmentId) || currentAssessments[0] || null;
  }, [currentAssessments, selectedAssessmentId]);

  // Students in class
  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Local grade inputs state for fast spreadsheet typing
  const [localGrades, setLocalGrades] = useState<Record<string, number>>({});

  // Sync localGrades when active assessment changes
  React.useEffect(() => {
    if (activeAssessment) {
      const map: Record<string, number> = {};
      grades
        .filter(g => g.assessmentId === activeAssessment.id)
        .forEach(g => {
          map[g.studentId] = g.score;
        });
      setLocalGrades(map);
    } else {
      setLocalGrades({});
    }
  }, [activeAssessment, grades]);

  const handleOpenAddAssessment = () => {
    setEditingAssessment(null);
    setTitle('Penilaian Harian 1 (PLSV)');
    setType('Formatif');
    setMaxScore(100);
    setWeight(1);
    setPassingScore(75);
    setDate(new Date().toISOString().split('T')[0]);
    setIsAssessmentModalOpen(true);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingAssessment) {
      updateAssessment(editingAssessment.id, {
        title,
        type,
        maxScore,
        weight,
        passingScore,
        date,
      });
    } else {
      const created = createAssessment({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        title,
        type,
        maxScore,
        weight,
        passingScore,
        date,
      });
      setSelectedAssessmentId(created.id);
    }
    setIsAssessmentModalOpen(false);
  };

  const handleScoreChange = (studentId: string, val: string) => {
    const num = val === '' ? 0 : Number(val);
    setLocalGrades(prev => ({ ...prev, [studentId]: num }));
  };

  const handleSaveAllGrades = () => {
    if (!activeAssessment) return;
    const batch = Object.entries(localGrades).map(([studentId, score]) => ({
      studentId,
      score,
      feedback: score >= activeAssessment.passingScore ? 'Tuntas' : 'Perlu Remedial',
    }));
    batchRecordGrades(activeAssessment.id, batch);
    alert('Nilai berhasil disimpan dan disinkronkan ke rekapitulasi penilaian.');
  };

  // Stats calculation
  const scoresArray = (Object.values(localGrades) as number[]).filter(s => s > 0);
  const avgScore = scoresArray.length > 0 ? Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length) : 0;
  const highestScore = scoresArray.length > 0 ? Math.max(...scoresArray) : 0;
  const lowestScore = scoresArray.length > 0 ? Math.min(...scoresArray) : 0;
  const passedCount = scoresArray.filter(s => s >= (activeAssessment?.passingScore || 75)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Penilaian & Asesmen {terminology.student}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Input nilai formatif/sumatif secara cepat, hitung KKM otomatis, dan pantau ketuntasan capaian belajar.
          </p>
        </div>
        {!isSupervisor && (
          <button
            onClick={handleOpenAddAssessment}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Asesmen Baru</span>
          </button>
        )}
      </div>

      {/* Class & Subject Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Pilih Kelas:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">{terminology.subject}:</span>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assessment selector pills */}
        {currentAssessments.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs text-slate-500 font-semibold">Daftar Asesmen:</span>
            {currentAssessments.map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAssessmentId(a.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  (activeAssessment?.id === a.id)
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {a.title} ({a.type})
              </button>
            ))}
          </div>
        )}
      </div>

      {activeAssessment ? (
        <div className="space-y-6">
          {/* Assessment Summary Card & Analytics */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    {activeAssessment.type}
                  </span>
                  <h2 className="font-bold text-slate-900 text-base">{activeAssessment.title}</h2>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Tanggal: {activeAssessment.date} • Bobot: {activeAssessment.weight}x • KKM/Batas Tuntas: {activeAssessment.passingScore}
                </div>
              </div>

              {!isSupervisor && (
                <button
                  type="button"
                  onClick={handleSaveAllGrades}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Simpan Perubahan Nilai</span>
                </button>
              )}
            </div>

            {/* Quick Analytics Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500 font-medium">Rata-rata Kelas</span>
                <div className="text-xl font-bold text-slate-900 mt-1">{avgScore}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500 font-medium">Nilai Tertinggi</span>
                <div className="text-xl font-bold text-emerald-700 mt-1">{highestScore}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500 font-medium">Nilai Terendah</span>
                <div className="text-xl font-bold text-rose-600 mt-1">{lowestScore}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-slate-500 font-medium">Tingkat Ketuntasan</span>
                <div className="text-xl font-bold text-indigo-700 mt-1">
                  {Math.round((passedCount / (classStudents.length || 1)) * 100)}% ({passedCount}/{classStudents.length})
                </div>
              </div>
            </div>
          </div>

          {/* Grades Spreadsheet Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">NIS</th>
                    <th className="py-3.5 px-4">Nama Lengkap {terminology.student}</th>
                    <th className="py-3.5 px-4 w-36 text-center">Nilai (0 - {activeAssessment.maxScore})</th>
                    <th className="py-3.5 px-4 text-center">Predikat</th>
                    <th className="py-3.5 px-4 text-center">Status Ketuntasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {classStudents.map((st, idx) => {
                    const currentScore = localGrades[st.id] ?? 0;
                    const isPassed = currentScore >= activeAssessment.passingScore;

                    let predicate = 'D';
                    if (currentScore >= 90) predicate = 'A';
                    else if (currentScore >= 80) predicate = 'B';
                    else if (currentScore >= 70) predicate = 'C';

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{st.nis}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{st.fullName}</td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={0}
                            max={activeAssessment.maxScore}
                            value={localGrades[st.id] !== undefined ? localGrades[st.id] : ''}
                            onChange={e => handleScoreChange(st.id, e.target.value)}
                            disabled={isSupervisor}
                            className="w-24 text-center py-1.5 px-2 font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold font-mono text-xs">{predicate}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              isPassed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPassed ? 'Tuntas' : 'Belum Tuntas'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
          <Award className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-slate-600">Belum ada asesmen untuk kelas dan mata pelajaran terpilih.</p>
          <p className="text-slate-400 mt-1">Klik "+ Buat Asesmen Baru" di pojok kanan atas untuk menambahkan penugasan atau ulangan.</p>
        </div>
      )}

      {/* Create / Edit Assessment Modal */}
      {isAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingAssessment ? 'Edit Asesmen' : 'Buat Asesmen Penilaian Baru'}
              </h3>
              <button onClick={() => setIsAssessmentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul / Nama Asesmen</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="contoh: Penilaian Harian Bab 1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Asesmen</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as AssessmentType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Formatif">Formatif / Harian</option>
                    <option value="Sumatif">Sumatif Lingkup Materi</option>
                    <option value="Tugas">Tugas / PR</option>
                    <option value="PTS">PTS (Tengah Semester)</option>
                    <option value="PAS">PAS (Akhir Semester)</option>
                    <option value="Keterampilan">Unjuk Kerja / Praktik</option>
                    <option value="Sikap">Observasi Sikap</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Skor Maksimal</label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={e => setMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bobot</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={e => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                    min={1}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KKM / Tuntas</label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={e => setPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 font-bold text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssessmentModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                >
                  Simpan Asesmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

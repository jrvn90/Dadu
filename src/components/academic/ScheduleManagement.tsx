import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Clock, Calendar, Edit2, Trash2, X, Check, BookOpen } from 'lucide-react';
import { Schedule, DayOfWeek } from '../../types';

const DAYS: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const ScheduleManagement: React.FC = () => {
  const { schedules, classes, subjects, addSchedule, updateSchedule, deleteSchedule, terminology, activeAcademicYear, activeSemester } = useData();
  const { allUsers, currentUser } = useAuth();
  const isAdmin = currentUser?.roles.includes('admin');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSch, setEditingSch] = useState<Schedule | null>(null);

  const [teacherId, setTeacherId] = useState(currentUser?.id || '');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Senin');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:00');
  const [room, setRoom] = useState('Ruang Kelas');

  const teachersList = allUsers.filter(u => u.roles.includes('teacher'));

  const handleOpenAdd = () => {
    setEditingSch(null);
    setTeacherId(currentUser?.id || teachersList[0]?.id || '');
    setSubjectId(subjects[0]?.id || '');
    setClassId(classes[0]?.id || '');
    setDayOfWeek('Senin');
    setStartTime('07:30');
    setEndTime('09:00');
    setRoom('Ruang Kelas');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sch: Schedule) => {
    setEditingSch(sch);
    setTeacherId(sch.teacherId);
    setSubjectId(sch.subjectId);
    setClassId(sch.classId);
    setDayOfWeek(sch.dayOfWeek);
    setStartTime(sch.startTime);
    setEndTime(sch.endTime);
    setRoom(sch.room || 'Ruang Kelas');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !subjectId || !classId) return;

    if (editingSch) {
      updateSchedule(editingSch.id, {
        teacherId,
        subjectId,
        classId,
        dayOfWeek,
        startTime,
        endTime,
        room,
      });
    } else {
      addSchedule({
        teacherId,
        subjectId,
        classId,
        dayOfWeek,
        startTime,
        endTime,
        room,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus entri jadwal pelajaran ini?')) {
      deleteSchedule(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Jadwal Pembelajaran Mingguan</h1>
          <p className="text-xs text-slate-500 mt-1">
            Matriks alokasi waktu mengajar, rombel, guru pengampu, dan ruang kelas semester {activeSemester?.name} ({activeAcademicYear?.name}).
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Mengajar</span>
          </button>
        )}
      </div>

      {/* Days Tabs / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DAYS.map(day => {
          const daySchedules = schedules.filter(s => s.dayOfWeek === day);
          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <h2 className="font-bold text-slate-900 text-sm">{day}</h2>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-600">
                    {daySchedules.length} Sesi
                  </span>
                </div>

                <div className="mt-3 space-y-3">
                  {daySchedules.length > 0 ? (
                    daySchedules.map(sch => {
                      const teacher = allUsers.find(u => u.id === sch.teacherId);
                      const subj = subjects.find(s => s.id === sch.subjectId);
                      const cls = classes.find(c => c.id === sch.classId);

                      return (
                        <div
                          key={sch.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-emerald-500 transition-all text-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div className="font-semibold text-slate-900">{subj?.name || 'Mata Pelajaran'}</div>
                            <span className="font-bold text-emerald-700 font-mono text-[11px]">
                              {sch.startTime} - {sch.endTime}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center justify-between text-slate-600 text-[11px]">
                            <span className="font-medium text-slate-800">{cls?.name || 'Kelas'}</span>
                            <span>{sch.room || 'Ruang Kelas'}</span>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                            <span className="text-slate-500 truncate max-w-[150px]">{teacher?.fullName || 'Guru'}</span>
                            {isAdmin && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEdit(sch)}
                                  className="p-1 text-slate-400 hover:text-emerald-700"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(sch.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs italic">
                      Tidak ada jam pelajaran.
                    </div>
                  )}
                </div>
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
                {editingSch ? 'Edit Jadwal Mengajar' : 'Tambah Jadwal Mengajar Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{terminology.teacher} Pengampu</label>
                <select
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  required
                >
                  {teachersList.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.nip || 'Guru'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{terminology.subject}</label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                    required
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                    required
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hari</label>
                  <select
                    value={dayOfWeek}
                    onChange={e => setDayOfWeek(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ruang Kelas / Laboratorium</label>
                <input
                  type="text"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  placeholder="contoh: R. 7A / Lab Komputer"
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

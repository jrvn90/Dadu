import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DynamicTerminology } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix = 'id'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomStr}`;
}

export function formatDateIndonesian(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTimeIndonesian(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export const DEFAULT_TERMINOLOGY: DynamicTerminology = {
  institution: 'Sekolah',
  principal: 'Kepala Sekolah',
  teacher: 'Guru',
  student: 'Siswa',
  subject: 'Mata Pelajaran',
  homeroomTeacher: 'Wali Kelas',
  academicYear: 'Tahun Pelajaran',
  class: 'Kelas',
  classRoom: 'Kelas',
  supervisor: 'Supervisor / Pengawas',
};

export const MADRASAH_TERMINOLOGY: DynamicTerminology = {
  institution: 'Madrasah',
  principal: 'Kepala Madrasah',
  teacher: 'Ustadz / Ustadzah',
  student: 'Santri / Siswa',
  subject: 'Mata Pelajaran',
  homeroomTeacher: 'Wali Kelas',
  academicYear: 'Tahun Ajaran',
  class: 'Kelas / Halaqah',
  classRoom: 'Kelas / Halaqah',
  supervisor: 'Pengawas Madrasah',
};

import * as XLSX from 'xlsx';
import { Student, ClassRoom, Subject, Assessment, Grade, AttendanceRecord, AttendanceSession, TeachingJournal, HomeroomNote } from '../types';

/**
 * Downloads a workbook as an .xlsx file in the browser
 */
export function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Generates an Excel Template for importing students
 */
export function generateStudentImportTemplate(classes: ClassRoom[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Instructions Sheet
  const instructions = [
    ['PANDUAN PENGISIAN TEMPLATE IMPOR DATA SISWA DADU'],
    ['1. Kolom bertanda (*) WAJIB diisi.'],
    ['2. Format jenis kelamin: L (Laki-laki) atau P (Perempuan).'],
    ['3. Kolom "Nama Kelas" harus sesuai persis dengan daftar rombel yang tersedia di sekolah.'],
    ['4. NIS dan NISN diisi angka tanpa spasi atau tanda baca.'],
    ['5. Jangan mengubah atau menghapus baris judul (Header).'],
    [''],
    ['DAFTAR ROMBEL / KELAS YANG TERDAFTAR SAAT INI:'],
    ['ID Kelas', 'Nama Kelas', 'Tingkat'],
    ...classes.map(c => [c.id, c.name, `Kelas ${c.level || ''}`]),
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Petunjuk & Rombel');

  // Data Template Sheet
  const sampleData = [
    {
      'Nama Lengkap*': 'Ahmad Fauzi Pratama',
      'NIS*': '2024001',
      'NISN*': '0081234567',
      'Jenis Kelamin (L/P)*': 'L',
      'Nama Kelas*': classes[0]?.name || 'VII-A',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir (YYYY-MM-DD)': '2011-05-14',
      'Nama Orang Tua / Wali': 'Budi Pratama',
      'No HP Orang Tua': '081234567890',
      'Alamat': 'Jl. Kenanga No. 12',
    },
    {
      'Nama Lengkap*': 'Siti Nur Aisyah',
      'NIS*': '2024002',
      'NISN*': '0087654321',
      'Jenis Kelamin (L/P)*': 'P',
      'Nama Kelas*': classes[0]?.name || 'VII-A',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir (YYYY-MM-DD)': '2011-08-20',
      'Nama Orang Tua / Wali': 'Hendra Aisyah',
      'No HP Orang Tua': '081398765432',
      'Alamat': 'Jl. Melati No. 45',
    },
  ];
  const wsData = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(wb, wsData, 'Template Siswa');

  return wb;
}

/**
 * Parses an uploaded Excel or CSV file for students
 */
export async function parseStudentImportFile(
  file: File,
  classes: ClassRoom[]
): Promise<{ valid: Partial<Student>[]; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Find the template sheet or use first sheet
        const sheetName = workbook.SheetNames.find(n => n.includes('Template Siswa') || n.includes('Data') || n.includes('Sheet1')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const valid: Partial<Student>[] = [];
        const errors: string[] = [];

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // account for header
          const fullName = row['Nama Lengkap*'] || row['Nama Lengkap'] || row['Nama'] || row['nama'];
          const nis = String(row['NIS*'] || row['NIS'] || row['nis'] || '').trim();
          const nisn = String(row['NISN*'] || row['NISN'] || row['nisn'] || '').trim();
          const rawGender = String(row['Jenis Kelamin (L/P)*'] || row['Jenis Kelamin'] || row['JK'] || 'L').trim().toUpperCase();
          const className = String(row['Nama Kelas*'] || row['Nama Kelas'] || row['Kelas'] || '').trim();

          if (!fullName) {
            errors.push(`Baris ${rowNum}: Nama Lengkap wajib diisi.`);
            return;
          }

          if (!nis) {
            errors.push(`Baris ${rowNum} (${fullName}): NIS wajib diisi.`);
            return;
          }

          const matchedClass = classes.find(
            c => c.name.toLowerCase() === className.toLowerCase() || c.id === className
          );

          if (!matchedClass && className) {
            errors.push(`Baris ${rowNum} (${fullName}): Kelas "${className}" tidak ditemukan dalam daftar Rombel.`);
            return;
          }

          const gender: 'L' | 'P' = rawGender.startsWith('P') ? 'P' : 'L';

          valid.push({
            fullName: String(fullName).trim(),
            nis,
            nisn: nisn || undefined,
            gender,
            classId: matchedClass ? matchedClass.id : classes[0]?.id || 'class_7a',
            parentName: row['Nama Orang Tua / Wali'] || row['Nama Orang Tua'] || undefined,
            parentPhone: row['No HP Orang Tua'] || row['Telepon'] || undefined,
            address: row['Alamat'] || undefined,
            birthPlace: row['Tempat Lahir'] || undefined,
            birthDate: row['Tanggal Lahir (YYYY-MM-DD)'] || undefined,
            status: 'active',
          });
        });

        resolve({ valid, errors });
      } catch (err: any) {
        reject(new Error(`Gagal membaca berkas: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Gagal mengunggah berkas'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export full Master Students to Excel
 */
export function exportStudentsToExcel(students: Student[], classes: ClassRoom[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const classMap = new Map(classes.map(c => [c.id, c.name]));

  const rows = students.map((s, idx) => ({
    'No': idx + 1,
    'Nama Lengkap': s.fullName,
    'NIS': s.nis,
    'NISN': s.nisn || '-',
    'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)',
    'Kelas': classMap.get(s.classId) || s.classId,
    'Tempat Lahir': s.birthPlace || '-',
    'Tanggal Lahir': s.birthDate || '-',
    'Nama Orang Tua / Wali': s.parentName || '-',
    'No HP Orang Tua': s.parentPhone || '-',
    'Alamat': s.address || '-',
    'Status': s.status === 'active' ? 'Aktif' : 'Non-Aktif',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Data Induk Siswa');
  return wb;
}

/**
 * Export Class Attendance Ledger to Excel
 */
export function exportAttendanceLedgerToExcel(
  classRoom: ClassRoom,
  students: Student[],
  sessions: AttendanceSession[],
  records: AttendanceRecord[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Create session map
  const sessionDates = sessions.map(s => ({
    id: s.id,
    date: s.date,
    mode: s.mode,
  }));

  const rows = students.map((st, idx) => {
    const studentRecords = records.filter(r => r.studentId === st.id);
    let hadir = 0, sakit = 0, izin = 0, alpa = 0, disp = 0;

    const rowObj: Record<string, any> = {
      'No': idx + 1,
      'Nama Siswa': st.fullName,
      'NIS': st.nis,
      'JK': st.gender,
    };

    // Columns per session
    sessionDates.forEach(sess => {
      const rec = studentRecords.find(r => r.sessionId === sess.id);
      const status = rec ? rec.status : '-';
      rowObj[`${sess.date} (${sess.mode})`] = status;

      if (status === 'Hadir') hadir++;
      else if (status === 'Sakit') sakit++;
      else if (status === 'Izin') izin++;
      else if (status === 'Alpa') alpa++;
      else if (status === 'Dispensasi') disp++;
    });

    const totalSessions = sessionDates.length || 1;
    const persentase = Math.round(((hadir + disp) / totalSessions) * 100);

    rowObj['Total Hadir (H)'] = hadir;
    rowObj['Total Sakit (S)'] = sakit;
    rowObj['Total Izin (I)'] = izin;
    rowObj['Total Alpa (A)'] = alpa;
    rowObj['Total Dispensasi (D)'] = disp;
    rowObj['Persentase Kehadiran (%)'] = `${persentase}%`;

    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, `Presensi ${classRoom.name}`);
  return wb;
}

/**
 * Export Class Grade Ledger (Leger Nilai) to Excel
 */
export function exportGradeLedgerToExcel(
  classRoom: ClassRoom,
  students: Student[],
  subjects: Subject[],
  assessments: Assessment[],
  grades: Grade[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Compute student summary
  const studentRows = students.map((st, idx) => {
    const rowObj: Record<string, any> = {
      'No': idx + 1,
      'Nama Siswa': st.fullName,
      'NIS': st.nis,
      'NISN': st.nisn || '-',
      'JK': st.gender,
    };

    let totalScore = 0;
    let subjectCount = 0;

    subjects.forEach(subj => {
      const subjAssessments = assessments.filter(a => a.subjectId === subj.id && a.classId === classRoom.id);
      if (subjAssessments.length > 0) {
        const subjScores: number[] = [];
        subjAssessments.forEach(a => {
          const g = grades.find(gr => gr.assessmentId === a.id && gr.studentId === st.id);
          if (g && g.score !== undefined) {
            subjScores.push(g.score);
          }
        });

        const avgSubj = subjScores.length > 0 ? Math.round(subjScores.reduce((a, b) => a + b, 0) / subjScores.length) : 0;
        rowObj[`${subj.code || subj.name}`] = avgSubj;
        totalScore += avgSubj;
        subjectCount++;
      } else {
        rowObj[`${subj.code || subj.name}`] = '-';
      }
    });

    const finalAvg = subjectCount > 0 ? Math.round(totalScore / subjectCount) : 0;
    rowObj['Total Nilai'] = totalScore;
    rowObj['Rata-Rata'] = finalAvg;

    return {
      rowObj,
      totalScore,
      finalAvg,
    };
  });

  // Calculate ranking
  studentRows.sort((a, b) => b.totalScore - a.totalScore);
  const rankedRows = studentRows.map((item, rankIdx) => {
    return {
      ...item.rowObj,
      'Peringkat': rankIdx + 1,
    };
  });

  // Sort back by original sequence or rank
  const ws = XLSX.utils.json_to_sheet(rankedRows);
  XLSX.utils.book_append_sheet(wb, ws, `Leger Nilai ${classRoom.name}`);
  return wb;
}

/**
 * Export Teaching Journals to Excel
 */
export function exportJournalsToExcel(
  journals: TeachingJournal[],
  classes: ClassRoom[],
  subjects: Subject[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const classMap = new Map(classes.map(c => [c.id, c.name]));
  const subjMap = new Map(subjects.map(s => [s.id, s.name]));

  const rows = journals.map((j, idx) => ({
    'No': idx + 1,
    'Tanggal': j.date,
    'Mata Pelajaran': subjMap.get(j.subjectId) || j.subjectId,
    'Kelas': classMap.get(j.classId) || j.classId,
    'Materi Pokok / Topik': j.learningTopic,
    'Tujuan Pembelajaran': j.learningObjective || '-',
    'Aktivitas Pembelajaran': j.activity || '-',
    'Catatan / Refleksi': j.reflection || '-',
    'Kehadiran Siswa': j.attendanceSummary
      ? `Hadir: ${j.attendanceSummary.hadir}, Sakit: ${j.attendanceSummary.sakit}, Izin: ${j.attendanceSummary.izin}, Alpa: ${j.attendanceSummary.alpa}`
      : 'Sesuai Presensi Sesi',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Jurnal Mengajar');
  return wb;
}

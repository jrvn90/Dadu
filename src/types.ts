/**
 * DADU — Digitalisasi Data dari Guru
 * Master TypeScript Domain Types & Schemas
 * Core Principle: INPUT ONCE -> INTEGRATE -> AUTOMATE -> REPORT
 */

// ==========================================
// 1. ROLES & AUTHENTICATION
// ==========================================

export type UserRole = 'admin' | 'teacher' | 'homeroom_teacher' | 'supervisor';

export type UserStatus = 'pending' | 'active' | 'disabled' | 'archived' | 'deleted';

export interface UserProfile {
  id: string; // Firebase Auth UID
  organizationId: string;
  email: string;
  fullName: string;
  displayName?: string;
  roles: UserRole[];
  status: UserStatus;
  isPrimaryAdmin?: boolean;
  avatarType?: 'male_formal' | 'female_hijab' | 'custom_upload';
  photoUrl?: string;
  phoneNumber?: string;
  nip?: string;
  nuptk?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// ==========================================
// 2. ORGANIZATION & INSTITUTION SETTINGS
// ==========================================

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'school' | 'madrasah' | 'institute' | 'pesantren' | 'other';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface DynamicTerminology {
  institution: string;       // e.g. "Sekolah", "Madrasah"
  principal: string;         // e.g. "Kepala Sekolah", "Kepala Madrasah"
  teacher: string;           // e.g. "Guru", "Ustadz / Ustadzah"
  student: string;           // e.g. "Siswa", "Santri", "Peserta Didik"
  subject: string;           // e.g. "Mata Pelajaran", "Mata Kuliah"
  homeroomTeacher: string;   // e.g. "Wali Kelas", "Wali Asuh"
  academicYear: string;      // e.g. "Tahun Pelajaran", "Tahun Ajaran"
  class?: string;
  classRoom?: string;
  supervisor?: string;
}

export interface InstitutionSettings {
  id: string;
  organizationId: string;
  institutionName: string;
  institutionType: 'SD/MI' | 'SMP/MTs' | 'SMA/MA/SMK' | 'Madrasah' | 'Lainnya';
  parentOrganizationName: string; // e.g. "Kementerian Pendidikan / Kementerian Agama / Yayasan"
  address: string;
  village: string;
  district: string;
  cityRegency: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  logoPrimaryUrl?: string;
  logoSecondaryUrl?: string;
  logoUrl?: string;
  governmentDepartment?: string;
  educationOffice?: string;
  npsn?: string;
  nss?: string;
  
  // Leadership / Head
  headName: string;
  headTitle: string; // e.g. "Kepala Sekolah", "Kepala Madrasah"
  headIdentifier: string; // e.g. "NIP. 19780101..."
  headSignatureImageUrl?: string;
  principalName?: string;
  principalNip?: string;

  // Dynamic Terminology
  terminology: DynamicTerminology;
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. ACADEMIC MASTER DATA
// ==========================================

export interface AcademicYear {
  id: string;
  organizationId: string;
  name: string; // e.g. "2024/2025"
  startDate: string;
  endDate: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  id: string;
  organizationId: string;
  academicYearId: string;
  name: 'Ganjil' | 'Genap' | 'Semester 1' | 'Semester 2';
  startDate: string;
  endDate: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ClassRoom {
  id: string;
  organizationId: string;
  name: string; // e.g. "X-IPA 1", "VII-A"
  level: string; // e.g. "10", "7"
  gradeLevel?: string;
  studentCount?: number;
  group?: string;
  academicYearId: string;
  homeroomTeacherId?: string;
  capacity: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  organizationId: string;
  nis: string;
  nisn: string;
  fullName: string;
  nickname?: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  religion?: string;
  address: string;
  phone?: string;
  email?: string;
  parentName?: string;
  parentPhone?: string;
  photoUrl?: string;
  classId: string;
  academicYearId: string;
  status: 'active' | 'graduated' | 'transferred' | 'inactive';
  notes?: string;
  qrToken?: string; // Secure token used for QR Attendance
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  organizationId: string;
  code: string; // e.g. "MAT-01"
  name: string; // e.g. "Matematika"
  shortName: string; // e.g. "MTK"
  category: 'Umum' | 'Kejuruan' | 'Keagamaan' | 'Mulok' | 'Peminatan';
  defaultPassingScore: number; // KKM / KKTP (e.g. 75)
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAssignment {
  id: string;
  organizationId: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  academicYearId: string;
  semesterId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface Schedule {
  id: string;
  organizationId: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  academicYearId: string;
  semesterId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "07:30"
  endTime: string;   // "09:00"
  room?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. ATTENDANCE (MANUAL, QR, HYBRID)
// ==========================================

export type AttendanceMode = 'manual' | 'qr' | 'hybrid';
export type AttendanceSessionStatus = 'open' | 'closed' | 'expired';
export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Dispensasi';

export interface AttendanceSession {
  id: string;
  organizationId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  scheduleId?: string;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  mode: AttendanceMode;
  status: AttendanceSessionStatus;
  expiresAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  organizationId: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  recordedAt: string;
  recordedBy: string; // Teacher UID
  method: 'manual' | 'qr_scan';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. TEACHING JOURNAL
// ==========================================

export interface TeachingJournal {
  id: string;
  organizationId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  scheduleId?: string;
  date: string; // "YYYY-MM-DD"
  timeSlot?: string;
  learningTopic: string;
  learningObjective: string;
  activity: string;
  method?: string;
  attendanceSummary?: {
    totalStudents: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    dispensasi: number;
  };
  reflection?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. ASSESSMENT & GRADES
// ==========================================

export type AssessmentType = 'Formatif' | 'Sumatif Lingkup Materi' | 'Sumatif Akhir Semester' | 'Tugas' | 'Kuis' | 'Praktik' | 'Proyek' | 'PTS' | 'PAS' | 'UH' | 'Lainnya';

export interface Assessment {
  id: string;
  organizationId: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  name: string; // e.g. "Ulangan Harian 1 - Aljabar"
  title?: string;
  type: AssessmentType;
  date: string;
  weight: number; // e.g. 20 (percent) or weight factor
  maxScore: number; // e.g. 100
  passingScore?: number;
  academicYearId: string;
  semesterId: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  organizationId: string;
  studentId: string;
  assessmentId: string;
  teacherId: string;
  score: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 7. HOMEROOM (WALI KELAS)
// ==========================================

export interface HomeroomAssignment {
  id: string;
  organizationId: string;
  teacherId: string;
  classId: string;
  academicYearId: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface StudentNote {
  id: string;
  organizationId: string;
  studentId: string;
  authorId: string; // Teacher or Homeroom UID
  classId: string;
  type?: 'achievement' | 'discipline' | 'guidance' | 'general';
  category?: string;
  title?: string;
  content: string;
  actionPlan?: string;
  isResolved?: boolean;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 8. SUPERVISOR / SUPERVISION MODE
// ==========================================

export interface SupervisorAssignment {
  id: string;
  organizationId: string;
  supervisorId: string; // User UID with role 'supervisor'
  teacherId: string;    // Supervised teacher UID
  scope: 'all' | 'specific_subjects' | 'specific_classes';
  status: 'active' | 'inactive';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 9. DOCUMENT ENGINE & TEMPLATES
// ==========================================

export type DocumentType = 
  | 'attendance_recap'
  | 'grade_recap'
  | 'grade_list'
  | 'teaching_journal'
  | 'homeroom_report'
  | 'student_profile'
  | 'qr_student_cards';

export type PaperSize = 'A4' | 'F4';
export type Orientation = 'portrait' | 'landscape';

export interface DocumentSignatureConfig {
  leftEnabled: boolean;
  leftTitle: string; // e.g. "Mengetahui,\nKepala Sekolah"
  leftName: string;
  leftIdentifier: string; // NIP
  leftSignatureImageUrl?: string;
  
  rightEnabled: boolean;
  rightTitle: string; // e.g. "Guru Mata Pelajaran"
  rightName: string;
  rightIdentifier: string; // NIP
  rightSignatureImageUrl?: string;
}

export interface DocumentTemplate {
  id: string;
  organizationId: string;
  name: string;
  documentType: DocumentType;
  paperSize: PaperSize;
  orientation: Orientation;
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerConfig: {
    showLogoPrimary: boolean;
    showLogoSecondary: boolean;
    institutionTitle: string;
    parentTitle: string;
    addressText: string;
    contactText: string;
    showDivider: boolean;
  };
  footerConfig?: {
    showPageNumber: boolean;
    customText?: string;
  };
  signatureConfig: DocumentSignatureConfig;
  isDefault: boolean;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedDocumentSnapshot {
  id: string;
  organizationId: string;
  documentType: DocumentType;
  title: string;
  templateSnapshot: DocumentTemplate;
  institutionSnapshot: Partial<InstitutionSettings>;
  academicYearSnapshot: string;
  semesterSnapshot: string;
  generatedByUserId: string;
  generatedByUserName: string;
  dataPayload: Record<string, any>;
  createdAt: string;
}

// ==========================================
// 11. OFFLINE SYNC & SECURITY VALIDATION
// ==========================================

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error' | 'pending';

export interface OfflineMutation {
  id: string;
  timestamp: string;
  collection: string;
  action: 'create' | 'update' | 'delete';
  entityId: string;
  payload?: any;
  status: 'queued' | 'synced' | 'failed';
  retryCount: number;
}

export interface SecurityRuleTestResult {
  id: string;
  title: string;
  description: string;
  targetPath: string;
  actorRole: UserRole | 'unauthenticated' | 'other_org_teacher';
  expectedOutcome: 'ALLOW' | 'DENY';
  actualOutcome: 'ALLOW' | 'DENY';
  status: 'passed' | 'failed';
  policyPillar: string;
  details: string;
}


export type AuditAction = 
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_ROLE_CHANGED'
  | 'USER_DISABLED'
  | 'USER_ARCHIVED'
  | 'USER_RESTORED'
  | 'USER_DELETED'
  | 'ATTENDANCE_CREATED'
  | 'ATTENDANCE_CLOSED'
  | 'GRADE_CREATED'
  | 'GRADE_UPDATED'
  | 'CONFIGURATION_CHANGED'
  | 'REPORT_GENERATED'
  | 'SUPERVISION_VIEW';

export interface AuditLog {
  id: string;
  organizationId: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AppSettings {
  id: string;
  organizationId: string;
  defaultAttendanceMode: AttendanceMode;
  qrTokenExpirationMinutes: number;
  allowManualCorrection: boolean;
  allowDuplicateScans: boolean;
  lateScanGraceMinutes: number;
  updatedAt: string;
}

export type User = UserProfile;

export interface HomeroomNote {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  category: 'Catatan Akademik' | 'Kedisiplinan & Kehadiran' | 'Perilaku & Karakter' | 'Komunikasi Orang Tua' | 'Prestasi & Penghargaan' | 'Kesehatan';
  content: string;
  actionPlan?: string;
  isResolved: boolean;
}

export interface SupervisionRecord {
  id: string;
  supervisorId: string;
  teacherId: string;
  date: string;
  subjectId: string;
  classId: string;
  overallScore: number;
  feedback: string;
  followUpAction?: string;
  status: 'completed' | 'in_progress';
}

export interface TerminologySettings {
  student: string;
  teacher: string;
  class: string;
  subject: string;
  homeroomTeacher: string;
  supervisor?: string;
  academicYear?: string;
}

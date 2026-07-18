export interface Student {
  id: string;
  name: string;
  class: string;
  gender: 'L' | 'P';
  status: 'active' | 'monitored' | 'resolved';
  tags: string[];
  notes?: string;
}

export interface SessionLog {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  date: string;
  category: 'Akademik' | 'Perilaku' | 'Sosial' | 'Keluarga' | 'Emosional' | 'Lainnya';
  type: 'Individu' | 'Kelompok' | 'Klasikal' | 'Home Visit';
  summary: string;
  actionPlan: string;
  status: 'Selesai' | 'Tindak Lanjut' | 'Dirujuk';
}

export interface CounselingRequest {
  id: string;
  name: string; // "Anonim" or student name
  class: string;
  date: string;
  message: string;
  contactMethod: string; // e.g., "Temui saya langsung", "Hubungi lewat wali kelas", "Sembunyikan saya"
  status: 'Menunggu' | 'Dihubungi' | 'Selesai';
}

export interface EmotionalCheckIn {
  id: string;
  date: string;
  emotion: 'Senang' | 'Biasa Saja' | 'Sedih' | 'Marah' | 'Cemas' | 'Sepi';
  class: string;
  note?: string;
}

export interface CounselorSettings {
  passcode: string;
  isLocked: boolean;
}

import { Student, SessionLog, CounselingRequest, EmotionalCheckIn } from "./types";

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-1",
    name: "Aditya Pratama",
    class: "VIII-A",
    gender: "L",
    status: "active",
    tags: ["Prestasi Turun", "Kurang Fokus"],
    notes: "Anak menunjukkan penurunan konsentrasi setelah jam istirahat. Perlu pendekatan persuasif."
  },
  {
    id: "std-2",
    name: "Siti Rahmawati",
    class: "IX-B",
    gender: "P",
    status: "monitored",
    tags: ["Kecemasan", "Kelanjutan Sekolah"],
    notes: "Cemas menghadapi Asesmen Nasional dan pemilihan SMA/SMK penerus."
  },
  {
    id: "std-3",
    name: "Budi Setiawan",
    class: "VII-C",
    gender: "L",
    status: "resolved",
    tags: ["Adaptasi", "Pemalu"],
    notes: "Sempat mengalami kesulitan bersosialisasi di awal masuk kelas VII, sekarang sudah memiliki kelompok bermain tetap."
  },
  {
    id: "std-4",
    name: "Fitri Handayani",
    class: "VIII-B",
    gender: "P",
    status: "active",
    tags: ["Masalah Teman sebaya"],
    notes: "Sedang dimediasi terkait kesalahpahaman kelompok belajar di kelas."
  }
];

export const INITIAL_SESSIONS: SessionLog[] = [
  {
    id: "sess-1",
    studentId: "std-1",
    studentName: "Aditya Pratama",
    studentClass: "VIII-A",
    date: "2026-07-15",
    category: "Akademik",
    type: "Individu",
    summary: "Aditya bercerita sering bergadang bermain game online hingga pukul 2 pagi, menyebabkan mengantuk di kelas Matematika dan IPA. Ia merasa kesulitan mengikuti materi perkalian pecahan aljabar.",
    actionPlan: "1. Membuat jadwal tidur bersama Aditya (target maksimal pukul 10 malam).\n2. Meminta Aditya mengumpulkan jurnal tidur harian.\n3. Kerja sama dengan guru Matematika untuk bimbingan tambahan.",
    status: "Tindak Lanjut"
  },
  {
    id: "sess-2",
    studentId: "std-2",
    studentName: "Siti Rahmawati",
    studentClass: "IX-B",
    date: "2026-07-12",
    category: "Emosional",
    type: "Individu",
    summary: "Siti merasa tertekan oleh ekspektasi orang tua yang menginginkannya masuk ke SMA favorit di kota. Siti sendiri lebih berminat masuk SMK Jurusan Tata Busana karena hobi mendesain pakaian.",
    actionPlan: "1. Membantu Siti memetakan bakat dan minatnya menggunakan instrumen non-tes.\n2. Merencanakan sesi mediasi bersama orang tua Siti minggu depan untuk berdiskusi secara kekeluargaan.",
    status: "Tindak Lanjut"
  },
  {
    id: "sess-3",
    studentId: "std-3",
    studentName: "Budi Setiawan",
    studentClass: "VII-C",
    date: "2026-07-10",
    category: "Sosial",
    type: "Individu",
    summary: "Konseling terkait penyesuaian diri di lingkungan SMPN 2 Ayah yang baru. Budi awalnya merasa asing karena teman-teman SD-nya kebanyakan masuk ke sekolah lain.",
    actionPlan: "1. Mengajak Budi berpartisipasi dalam ekstrakurikuler Pramuka.\n2. Memperkenalkan Budi dengan pengurus OSIS kelas VII agar dibantu berbaur.",
    status: "Selesai"
  }
];

export const INITIAL_REQUESTS: CounselingRequest[] = [
  {
    id: "req-1",
    name: "Anonim (Siswa Kelas VIII)",
    class: "VIII-A",
    date: "2026-07-16",
    message: "Ibu, saya sering dijauhi sama beberapa teman di kelas kalau kerja kelompok. Saya merasa sedih dan tidak tahu harus bercerita ke siapa. Boleh saya curhat langsung besok pulang sekolah?",
    contactMethod: "Temui saya langsung di Perpustakaan saat istirahat kedua",
    status: "Menunggu"
  },
  {
    id: "req-2",
    name: "Rian Hendra",
    class: "IX-A",
    date: "2026-07-15",
    message: "Pak BK, saya mau tanya-tanya tentang pendaftaran SMK di Kebumen. Saya bingung jalur prestasinya seperti apa.",
    contactMethod: "Hubungi lewat wali kelas IX-A (Bu Retno)",
    status: "Dihubungi"
  }
];

export const INITIAL_EMOTIONS: EmotionalCheckIn[] = [
  { id: "e-1", date: "2026-07-16", emotion: "Senang", class: "VIII-A" },
  { id: "e-2", date: "2026-07-16", emotion: "Cemas", class: "IX-B", note: "Besok ulangan Fisika" },
  { id: "e-3", date: "2026-07-16", emotion: "Sedih", class: "VII-C" },
  { id: "e-4", date: "2026-07-17", emotion: "Senang", class: "VII-C" },
  { id: "e-5", date: "2026-07-17", emotion: "Biasa Saja", class: "VIII-A" },
  { id: "e-6", date: "2026-07-17", emotion: "Sepi", class: "VIII-B" },
  { id: "e-7", date: "2026-07-17", emotion: "Cemas", class: "IX-A" },
  { id: "e-8", date: "2026-07-17", emotion: "Senang", class: "IX-B" }
];

export const CLASSES_LIST = [
  "VII-A", "VII-B", "VII-C", "VII-D",
  "VIII-A", "VIII-B", "VIII-C", "VIII-D",
  "IX-A", "IX-B", "IX-C", "IX-D"
];

export const EMOTION_AFFIRMATIONS: Record<string, string[]> = {
  "Senang": [
    "Luar biasa! Pertahankan semangatmu hari ini di SMPN 2 Ayah!",
    "Kegembiraanmu menular. Bagikan senyummu kepada teman kelas hari ini ya!",
    "Bersyukurlah atas hari yang indah ini, semoga belajarmu menyenangkan!"
  ],
  "Biasa Saja": [
    "Hari yang tenang adalah berkah. Jalani kelas demi kelas dengan santai.",
    "Kamu melakukan pekerjaan yang baik hanya dengan hadir dan berusaha.",
    "Luangkan waktu untuk menarik napas dalam-dalam di sela pelajaran."
  ],
  "Sedih": [
    "Tidak apa-apa merasa sedih. Awan mendung pasti berlalu dari langit pikiranmu.",
    "Ingat, kamu tidak sendirian di SMPN 2 Ayah. Ruang BK selalu terbuka untukmu.",
    "Ambil waktu istirahat yang cukup. Menangis atau diam sejenak adalah hal yang manusiawi."
  ],
  "Marah": [
    "Ambil napas dalam... Hembuskan perlahan. Kemarahan bagaikan api, jangan biarkan ia membakar dirimu.",
    "Hitung sampai 10 sebelum merespons sesuatu yang membuatmu kesal.",
    "Bila terasa sesak, kamu bisa menuliskan kekesalanmu di secarik kertas lalu meremasnya."
  ],
  "Cemas": [
    "Fokuslah pada saat ini. Satu langkah kecil pada satu waktu.",
    "Kamu lebih kuat dan lebih siap daripada yang kamu pikirkan.",
    "Kecemasanmu tidak mendefinisikan masa depanmu. Kamu pasti bisa melaluinya!"
  ],
  "Sepi": [
    "Ada kalanya kita merasa sendiri, namun selalu ada orang yang peduli kepadamu di sini.",
    "Cobalah menyapa satu teman sebangkumu hari ini, obrolan kecil bisa mencairkan suasana.",
    "Buku di perpustakaan sekolah atau guru BK siap menemanimu kapan saja."
  ]
};

import React, { useState, useEffect } from "react";
import { 
  Smile, Meh, Frown, Flame, ShieldAlert, Compass, Send, CheckCircle2, 
  Wind, BookOpen, Sparkles, RefreshCw, Feather, Trash2, HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EmotionalCheckIn, CounselingRequest } from "../types";
import { CLASSES_LIST, EMOTION_AFFIRMATIONS } from "../initialData";

interface StudentPortalProps {
  onAddEmotionalLog: (log: Omit<EmotionalCheckIn, "id" | "date">) => void;
  onAddCounselingRequest: (req: Omit<CounselingRequest, "id" | "date" | "status">) => void;
}

export default function StudentPortal({ onAddEmotionalLog, onAddCounselingRequest }: StudentPortalProps) {
  // Navigation sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"checkin" | "curhat" | "rileks">("checkin");

  // --- EMOTIONAL CHECK-IN STATE ---
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [studentClass, setStudentClass] = useState("");
  const [reflectionNote, setReflectionNote] = useState("");
  const [showAffirmation, setShowAffirmation] = useState<string | null>(null);

  // --- KOTAK CURHAT STATE ---
  const [curhatName, setCurhatName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [curhatClass, setCurhatClass] = useState("");
  const [curhatMessage, setCurhatMessage] = useState("");
  const [curhatContact, setCurhatContact] = useState("Temui saya langsung");
  const [isCurhatSubmitted, setIsCurhatSubmitted] = useState(false);

  // --- LATIHAN NAPAS STATE ---
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [breathingCycles, setBreathingCycles] = useState(0);

  // --- WRITING THERAPY STATE ---
  const [therapyText, setTherapyText] = useState("");
  const [isDissolving, setIsDissolving] = useState(false);
  const [showReleaseSuccess, setShowReleaseSuccess] = useState(false);

  // Breathing pattern effect (4s inhale, 7s hold, 8s exhale)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            // Transition phases
            if (breathingPhase === "idle" || breathingPhase === "exhale") {
              setBreathingPhase("inhale");
              return 4; // 4 seconds inhale
            } else if (breathingPhase === "inhale") {
              setBreathingPhase("hold");
              return 7; // 7 seconds hold
            } else if (breathingPhase === "hold") {
              setBreathingPhase("exhale");
              return 8; // 8 seconds exhale
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingPhase("idle");
      setBreathingTimer(0);
    }
    return () => clearInterval(interval);
  }, [isBreathing, breathingPhase]);

  // Handle cycle updates
  useEffect(() => {
    if (isBreathing && breathingTimer === 1 && breathingPhase === "exhale") {
      setBreathingCycles((prev) => prev + 1);
    }
  }, [breathingTimer, breathingPhase, isBreathing]);

  // Triggering breathing restart/stop
  const handleToggleBreathing = () => {
    if (isBreathing) {
      setIsBreathing(false);
      setBreathingPhase("idle");
      setBreathingCycles(0);
    } else {
      setIsBreathing(true);
      setBreathingPhase("inhale");
      setBreathingTimer(4);
      setBreathingCycles(0);
    }
  };

  // Submit emotional log
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmotion || !studentClass) return;

    onAddEmotionalLog({
      emotion: selectedEmotion as any,
      class: studentClass,
      note: reflectionNote.trim() || undefined
    });

    // Pick a random affirmation for this emotion
    const list = EMOTION_AFFIRMATIONS[selectedEmotion] || [
      "Terima kasih telah berbagi perasaanmu hari ini di Ruang Teduh."
    ];
    const randomAffirmation = list[Math.floor(Math.random() * list.length)];
    setShowAffirmation(randomAffirmation);

    // Reset form states
    setReflectionNote("");
  };

  // Submit curhat
  const handleCurhatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curhatClass || !curhatMessage) return;

    onAddCounselingRequest({
      name: isAnonymous ? "Anonim" : (curhatName.trim() || "Anonim"),
      class: curhatClass,
      message: curhatMessage,
      contactMethod: curhatContact
    });

    setIsCurhatSubmitted(true);
    setTimeout(() => {
      // Clear fields
      setCurhatName("");
      setCurhatClass("");
      setCurhatMessage("");
      setCurhatContact("Temui saya langsung");
      setIsCurhatSubmitted(false);
    }, 4500);
  };

  // Dissolve writing therapy text
  const handleReleaseTherapy = () => {
    if (!therapyText.trim()) return;
    setIsDissolving(true);
    setTimeout(() => {
      setTherapyText("");
      setIsDissolving(false);
      setShowReleaseSuccess(true);
      setTimeout(() => setShowReleaseSuccess(false), 4000);
    }, 2500);
  };

  // Emotion selectors helper
  const emotionsList = [
    { name: "Senang", icon: Smile, color: "text-green-600 bg-green-50 border-green-200 hover:bg-green-100" },
    { name: "Biasa Saja", icon: Meh, color: "text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100" },
    { name: "Sedih", icon: Frown, color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100" },
    { name: "Cemas", icon: Compass, color: "text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100" },
    { name: "Marah", icon: Flame, color: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100" },
    { name: "Sepi", icon: ShieldAlert, color: "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100" }
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="student-portal-wrapper">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-8 text-white relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Wind size={200} />
        </div>
        <span className="text-emerald-200 text-xs font-mono tracking-widest uppercase bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
          Safe Space Siswa SMPN 2 Ayah
        </span>
        <h2 className="text-3xl font-display font-bold mt-3 text-white">Ruang Teduh Interaktif</h2>
        <p className="text-emerald-100/90 text-sm mt-2 max-w-2xl font-sans">
          Ini adalah ruang amanmu. Di sini kamu bisa mengecek suasana hatimu, menitipkan pesan curhat rahasia ke Guru BK, atau sekadar menenangkan pikiran dengan latihan napas.
        </p>

        {/* Tab Controls */}
        <div className="flex gap-2 mt-8 border-b border-emerald-600/50 pb-0">
          <button
            id="tab-student-checkin"
            onClick={() => { setActiveSubTab("checkin"); setShowAffirmation(null); }}
            className={`px-5 py-3 text-sm font-medium rounded-t-xl transition-all duration-300 flex items-center gap-2 -mb-[1px] ${
              activeSubTab === "checkin"
                ? "bg-white text-emerald-950 shadow-sm border-t border-x border-slate-200"
                : "text-emerald-100 hover:text-white hover:bg-emerald-700/30"
            }`}
          >
            <Smile size={18} />
            Kabar Hatiku Hari Ini
          </button>
          <button
            id="tab-student-curhat"
            onClick={() => { setActiveSubTab("curhat"); }}
            className={`px-5 py-3 text-sm font-medium rounded-t-xl transition-all duration-300 flex items-center gap-2 -mb-[1px] ${
              activeSubTab === "curhat"
                ? "bg-white text-emerald-950 shadow-sm border-t border-x border-slate-200"
                : "text-emerald-100 hover:text-white hover:bg-emerald-700/30"
            }`}
          >
            <Feather size={18} />
            Kotak Curhat BK
          </button>
          <button
            id="tab-student-rileks"
            onClick={() => { setActiveSubTab("rileks"); }}
            className={`px-5 py-3 text-sm font-medium rounded-t-xl transition-all duration-300 flex items-center gap-2 -mb-[1px] ${
              activeSubTab === "rileks"
                ? "bg-white text-emerald-950 shadow-sm border-t border-x border-slate-200"
                : "text-emerald-100 hover:text-white hover:bg-emerald-700/30"
            }`}
          >
            <Wind size={18} />
            Rileksasi Mandiri
          </button>
        </div>
      </div>

      {/* Main Container Content */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          
          {/* 1. EMOTIONAL CHECK-IN */}
          {activeSubTab === "checkin" && (
            <motion.div
              key="tab-checkin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {!showAffirmation ? (
                <form onSubmit={handleCheckInSubmit} className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-lg font-display font-semibold text-emerald-950 flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-500" />
                      Bagaimana perasaanmu sekarang?
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Pilih emosi yang paling menggambarkan keadaan hatimu saat ini. Data ini dianalisis secara anonim untuk membantu guru BK memahami suasana psikologis sekolah secara umum.
                    </p>

                    {/* Emojis grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                      {emotionsList.map((item) => {
                        const Icon = item.icon;
                        const isSelected = selectedEmotion === item.name;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setSelectedEmotion(item.name)}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all duration-300 cursor-pointer ${item.color} ${
                              isSelected 
                                ? "ring-2 ring-emerald-600 scale-105 shadow-md font-semibold border-transparent" 
                                : "opacity-80 border-slate-200"
                            }`}
                          >
                            <Icon size={32} className="stroke-[1.8]" />
                            <span className="text-xs font-medium">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Class Selection */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <label className="block text-sm font-display font-semibold text-emerald-950">
                        Pilih Kelasmu:
                      </label>
                      <select
                        required
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {CLASSES_LIST.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Pilihan kelas diperlukan agar kami bisa memetakan dinamika emosi tiap jenjang kelas secara kolektif tanpa mengungkap identitas pribadimu.
                      </span>
                    </div>

                    {/* Reflection Note */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <label className="block text-sm font-display font-semibold text-emerald-950 flex justify-between items-center">
                        <span>Catatan Refleksi Pribadi (Opsional):</span>
                        <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded">Sangat Rahasia</span>
                      </label>
                      <textarea
                        value={reflectionNote}
                        onChange={(e) => setReflectionNote(e.target.value)}
                        placeholder="Ada hal yang ingin kamu tuliskan? Tulisanmu di sini tidak dapat diakses orang lain, murni untuk latihan pelepasan..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={!selectedEmotion || !studentClass}
                      className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <CheckCircle2 size={18} />
                      Simpan Kabar Emosiku
                    </button>
                  </div>
                </form>
              ) : (
                /* Success Affirmation Card */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-emerald-100 rounded-2xl p-8 shadow-md text-center max-w-xl mx-auto space-y-6"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <Sparkles size={36} className="animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold text-emerald-950">Terima kasih sudah jujur dengan dirimu sendiri</h3>
                    <p className="text-slate-600 text-sm leading-relaxed px-4">
                      "{showAffirmation}"
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-5 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAffirmation(null)}
                      className="px-6 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      Log Lagi
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveSubTab("curhat"); setShowAffirmation(null); }}
                      className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Feather size={14} />
                      Lanjut Curhat ke BK
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* 2. KOTAK CURHAT */}
          {activeSubTab === "curhat" && (
            <motion.div
              key="tab-curhat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Info text left */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-100/50 space-y-4">
                  <h4 className="font-display font-bold text-emerald-950 flex items-center gap-1.5">
                    <BookOpen size={18} className="text-emerald-700" />
                    Asas Kerahasiaan BK
                  </h4>
                  <p className="text-xs text-emerald-900/80 leading-relaxed">
                    Di SMPN 2 Ayah, setiap cerita yang kamu kirimkan ke Guru BK dijamin kerahasiaannya berdasarkan Kode Etik Bimbingan Konseling Indonesia.
                  </p>
                  <ul className="text-xs text-emerald-900/80 space-y-2 list-disc list-inside">
                    <li>Kamu boleh menyembunyikan namamu (<strong className="text-emerald-950">Kirim sebagai Anonim</strong>).</li>
                    <li>Wali kelas maupun teman sekelas <strong className="text-emerald-950">tidak akan pernah</strong> tahu tentang curhatan ini.</li>
                    <li>Guru BK akan membaca dan siap menemuimu sesuai metode kontak pilihanmu.</li>
                  </ul>
                  <div className="border-t border-emerald-200/40 pt-4 text-[11px] text-emerald-700 flex items-center gap-1.5">
                    <Feather size={12} />
                    <span>"Setiap beban terasa lebih ringan saat dibagi."</span>
                  </div>
                </div>
              </div>

              {/* Form right */}
              <div className="lg:col-span-8">
                {!isCurhatSubmitted ? (
                  <form onSubmit={handleCurhatSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <h3 className="text-lg font-display font-bold text-emerald-950">Tuliskan Ceritamu di Sini</h3>
                    
                    {/* Anonim Toggle */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-sm font-semibold text-emerald-950 block">Ingin menyembunyikan namamu?</span>
                        <span className="text-xs text-slate-500 block">Kirim secara rahasia sebagai Anonim</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isAnonymous ? 'bg-emerald-600' : 'bg-slate-300'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${isAnonymous ? 'translate-x-6' : ''}`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name field (disabled if anonymous) */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-emerald-950">Nama Lengkap:</label>
                        <input
                          type="text"
                          disabled={isAnonymous}
                          value={isAnonymous ? "Anonim (Disembunyikan)" : curhatName}
                          onChange={(e) => setCurhatName(e.target.value)}
                          placeholder="Masukkan namamu..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
                        />
                      </div>

                      {/* Class Selection */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-emerald-950">Kelas:</label>
                        <select
                          required
                          value={curhatClass}
                          onChange={(e) => setCurhatClass(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="">-- Pilih Kelas --</option>
                          {CLASSES_LIST.map((cls) => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Chat Content */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-emerald-950">Apa yang ingin kamu ceritakan atau tanyakan?</label>
                      <textarea
                        required
                        rows={5}
                        value={curhatMessage}
                        onChange={(e) => setCurhatMessage(e.target.value)}
                        placeholder="Tulis keluh kesahmu, kesulitan belajarmu, masalah pertemanan, atau hal lain yang mengganggu pikiranmu..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400"
                      />
                    </div>

                    {/* How to Contact Back */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-emerald-950">Bagaimana Guru BK harus merespons curhatan ini?</label>
                      <select
                        value={curhatContact}
                        onChange={(e) => setCurhatContact(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="Temui saya langsung di ruang BK">Temui saya langsung di ruang BK (Privat)</option>
                        <option value="Temui saya langsung di Perpustakaan saat istirahat kedua">Temui saya langsung di Perpustakaan saat istirahat kedua</option>
                        <option value="Titip surat balasan rahasia lewat Wali Kelas saya">Titip surat balasan rahasia lewat Wali Kelas saya</option>
                        <option value="Saya hanya ingin bercerita saja, tidak perlu ditindaklanjuti">Cukup dibaca saja (Saya hanya ingin meluapkan perasaan)</option>
                      </select>
                    </div>

                    {/* Button */}
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                      <Send size={14} />
                      Kirim Pesan Secara Aman
                    </button>
                  </form>
                ) : (
                  /* Form Submission Success Card */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 shadow-sm text-center space-y-4"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-display font-bold text-emerald-950">Curhatanmu Berhasil Terkirim!</h3>
                      <p className="text-emerald-900/80 text-xs leading-relaxed max-w-md mx-auto">
                        Terima kasih sudah berani bersuara dan menitipkan ceritamu. Guru BK SMPN 2 Ayah akan membaca pesanmu secara saksama dan membantumu sesuai metode kontak pilihanmu. Tetap semangat, kamu hebat!
                      </p>
                    </div>
                    <p className="text-[10px] text-emerald-700 italic animate-pulse">
                      Halaman akan kembali otomatis dalam beberapa detik...
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* 3. RILEKSASI MANDIRI */}
          {activeSubTab === "rileks" && (
            <motion.div
              key="tab-rileks"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              
              {/* Relaxation section 1: Guided Breathing */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6">
                <div className="w-full text-left">
                  <span className="text-emerald-700 font-mono text-[10px] font-semibold bg-emerald-50 px-2 py-1 rounded">Latihan 1</span>
                  <h3 className="text-lg font-display font-bold text-emerald-950 mt-1">Latihan Napas Teduh (Metode 4-7-8)</h3>
                  <p className="text-slate-500 text-xs">
                    Metode pernapasan dalam yang terbukti secara klinis mengurangi rasa cemas, panik, dan stres dalam waktu singkat.
                  </p>
                </div>

                {/* Animated breathing circle */}
                <div className="h-64 flex items-center justify-center relative w-full">
                  <div className={`absolute w-32 h-32 rounded-full border border-emerald-100 bg-emerald-50/50 flex flex-col items-center justify-center transition-all duration-[4000ms] ${
                    isBreathing && breathingPhase === "inhale" ? "scale-[1.6] bg-emerald-100" : ""
                  } ${
                    isBreathing && breathingPhase === "hold" ? "scale-[1.6] bg-amber-50 border-amber-100" : ""
                  } ${
                    isBreathing && breathingPhase === "exhale" ? "scale-95 bg-teal-50" : ""
                  }`}>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-800 font-bold mb-1">
                      {breathingPhase === "idle" && "Klik Mulai"}
                      {breathingPhase === "inhale" && "Tarik Napas"}
                      {breathingPhase === "hold" && "Tahan"}
                      {breathingPhase === "exhale" && "Hembuskan"}
                    </span>
                    <span className="text-3xl font-display font-extrabold text-emerald-950">
                      {breathingPhase === "idle" ? "0" : breathingTimer}
                    </span>
                    <span className="text-[9px] text-slate-500 mt-1 font-mono">
                      Detik
                    </span>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  {isBreathing ? (
                    <div className="space-y-2">
                      <p className="text-xs text-emerald-800 font-medium">
                        Siklus Selesai: <span className="font-mono text-sm bg-emerald-100 px-2 py-0.5 rounded">{breathingCycles}</span>
                      </p>
                      <button
                        type="button"
                        onClick={handleToggleBreathing}
                        className="px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Hentikan Latihan
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleToggleBreathing}
                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 mx-auto cursor-pointer"
                    >
                      <Wind size={14} />
                      Mulai Latihan Napas
                    </button>
                  )}

                  <div className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Petunjuk: Tarik napas lewat hidung (4 detik), tahan napas (7 detik), lalu hembuskan lewat mulut secara santai (8 detik). Ulangi sebanyak 4 siklus.
                  </div>
                </div>
              </div>

              {/* Relaxation section 2: Writing Therapy */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-emerald-700 font-mono text-[10px] font-semibold bg-emerald-50 px-2 py-1 rounded">Latihan 2</span>
                  <h3 className="text-lg font-display font-bold text-emerald-950 mt-1">Tulis & Lepaskan Beban Pikiran</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Tuliskan semua kecemasan, rasa kesal, atau hal buruk yang mengganjal di hatimu di kotak di bawah ini. Setelah selesai, kita akan menghapusnya secara visual sebagai lambang melepaskannya dari hati.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    rows={6}
                    disabled={isDissolving}
                    value={therapyText}
                    onChange={(e) => setTherapyText(e.target.value)}
                    placeholder="Tuliskan di sini bebas tanpa batas..."
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all duration-[2000ms] ${
                      isDissolving ? "opacity-0 scale-95 blur-md" : ""
                    }`}
                  />
                  {isDissolving && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-xl">
                      <div className="flex flex-col items-center gap-2 text-emerald-800 animate-pulse">
                        <Feather size={24} className="animate-spin" />
                        <span className="text-xs font-mono font-bold tracking-widest">Melepaskan beban...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={!therapyText.trim() || isDissolving}
                    onClick={handleReleaseTherapy}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-medium text-xs rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Lepaskan & Biarkan Menguap
                  </button>

                  {showReleaseSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-center text-[10px] leading-relaxed"
                    >
                      Bagus sekali. Kamu telah memvisualisasikan pelepasan tersebut. Biarkan beban pikiran itu menguap dan fokuslah pada keindahan hari ini.
                    </motion.div>
                  ) : (
                    <p className="text-[10px] text-slate-400 text-center">
                      Catatan: Tulisan ini murni lokal di browser-mu. Menekan tombol akan melenyapkannya dari memori selamanya.
                    </p>
                  )}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

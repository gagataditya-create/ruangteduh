import React, { useState } from "react";
import { 
  Lock, Unlock, ShieldCheck, Users, ClipboardList, MessageSquare, 
  Search, Plus, Filter, Calendar, BookOpen, Brain, Settings, Download, 
  Upload, Trash2, Tag, ChevronRight, CheckCircle, RefreshCcw, Copy, 
  HelpCircle, AlertCircle, Sparkles, CheckSquare, Eye, Award, Info
} from "lucide-react";
import { Student, SessionLog, CounselingRequest, EmotionalCheckIn, CounselorSettings } from "../types";
import { CLASSES_LIST } from "../initialData";

interface CounselorDashboardProps {
  students: Student[];
  sessions: SessionLog[];
  requests: CounselingRequest[];
  emotions: EmotionalCheckIn[];
  onAddStudent: (std: Omit<Student, "id">) => void;
  onEditStudent: (std: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddSession: (sess: Omit<SessionLog, "id">) => void;
  onUpdateSessionStatus: (id: string, status: SessionLog["status"]) => void;
  onUpdateRequestStatus: (id: string, status: CounselingRequest["status"]) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onResetData: () => void;
}

export default function CounselorDashboard({
  students,
  sessions,
  requests,
  emotions,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onAddSession,
  onUpdateSessionStatus,
  onUpdateRequestStatus,
  onExportData,
  onImportData,
  onResetData
}: CounselorDashboardProps) {
  // Passcode authentication state
  const [passcode, setPasscode] = useState("");
  const [savedPasscode, setSavedPasscode] = useState(() => localStorage.getItem("ruang_teduh_passcode") || "1234");
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("ruang_teduh_auth") === "true");
  const [authError, setAuthError] = useState("");

  // Counselor inner navigation
  const [counselorTab, setCounselorTab] = useState<"overview" | "students" | "sessions" | "requests" | "ai" | "settings">("overview");

  // --- COMPONENT LOCAL UI STATES ---
  // Search & Filters
  const [studentSearch, setStudentSearch] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("");

  const [sessionCategoryFilter, setSessionCategoryFilter] = useState("");
  const [sessionClassFilter, setSessionClassFilter] = useState("");

  // Form toggles / Inputs
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", class: "", gender: "L" as "L" | "P", tags: "", notes: "" });

  const [selectedStudentForSession, setSelectedStudentForSession] = useState<Student | null>(null);
  const [showAddSessionForm, setShowAddSessionForm] = useState(false);
  const [newSession, setNewSession] = useState({
    studentId: "",
    date: new Date().toISOString().split("T")[0],
    category: "Akademik" as SessionLog["category"],
    type: "Individu" as SessionLog["type"],
    summary: "",
    actionPlan: "",
    status: "Tindak Lanjut" as SessionLog["status"]
  });

  // AI assistant consultation form
  const [aiForm, setAiForm] = useState({
    sessionSummary: "",
    category: "Akademik",
    studentGrade: "VIII",
    customQuery: ""
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    analysis: string;
    recommendations: string[];
    actionPlanDraft: string;
    isMock?: boolean;
  } | null>(null);
  const [aiError, setAiError] = useState("");

  // Settings inputs
  const [newPasscodeVal, setNewPasscodeVal] = useState("");
  const [passcodeChangeSuccess, setPasscodeChangeSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Expanded student view
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Authentication validation
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === savedPasscode) {
      setIsAuthenticated(true);
      sessionStorage.setItem("ruang_teduh_auth", "true");
      setAuthError("");
      setPasscode("");
    } else {
      setAuthError("Kode sandi salah. Silakan coba lagi.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("ruang_teduh_auth");
  };

  // Change Passcode
  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscodeVal.trim().length >= 4) {
      setSavedPasscode(newPasscodeVal);
      localStorage.setItem("ruang_teduh_passcode", newPasscodeVal.trim());
      setNewPasscodeVal("");
      setPasscodeChangeSuccess(true);
      setTimeout(() => setPasscodeChangeSuccess(false), 3000);
    }
  };

  // Create Student
  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.class) return;

    onAddStudent({
      name: newStudent.name.trim(),
      class: newStudent.class,
      gender: newStudent.gender,
      status: "active",
      tags: newStudent.tags ? newStudent.tags.split(",").map(t => t.trim()).filter(t => t.length > 0) : [],
      notes: newStudent.notes.trim() || undefined
    });

    setNewStudent({ name: "", class: "", gender: "L", tags: "", notes: "" });
    setShowAddStudentForm(false);
  };

  // Create Session
  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudentId = newSession.studentId || (selectedStudentForSession ? selectedStudentForSession.id : "");
    const studentObj = students.find(s => s.id === targetStudentId);
    if (!studentObj) return;

    onAddSession({
      studentId: studentObj.id,
      studentName: studentObj.name,
      studentClass: studentObj.class,
      date: newSession.date,
      category: newSession.category,
      type: newSession.type,
      summary: newSession.summary.trim(),
      actionPlan: newSession.actionPlan.trim(),
      status: newSession.status
    });

    setNewSession({
      studentId: "",
      date: new Date().toISOString().split("T")[0],
      category: "Akademik",
      type: "Individu",
      summary: "",
      actionPlan: "",
      status: "Tindak Lanjut"
    });
    setSelectedStudentForSession(null);
    setShowAddSessionForm(false);
  };

  // Query Gemini consultation
  const handleConsultAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiForm.sessionSummary.trim()) return;

    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    try {
      const response = await fetch("/api/guidance/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiForm)
      });

      if (!response.ok) {
        throw new Error("Gagal terhubung dengan layanan konsultasi AI.");
      }

      const data = await response.json();
      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setAiLoading(false);
    }
  };

  // Open AI directly from a session summary
  const triggerAiFromSession = (session: SessionLog) => {
    // Extract Grade from class string (e.g. "VIII-A" -> "VIII")
    const match = session.studentClass.match(/^(VII|VIII|IX)/);
    const grade = match ? match[0] : "Umum";

    setAiForm({
      sessionSummary: session.summary,
      category: session.category,
      studentGrade: grade,
      customQuery: "Berikan draf rencana tindakan bimbingan konseling yang konkrit dan berbasis psikologi positif."
    });
    setAiResult(null);
    setCounselorTab("ai");
  };

  // Import file handle
  const handleFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onImportData(files[0]);
    }
  };

  // --- FILTERED ARRAYS ---
  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                        s.tags.some(t => t.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchClass = studentClassFilter === "" || s.class === studentClassFilter;
    const matchStatus = studentStatusFilter === "" || s.status === studentStatusFilter;
    return matchSearch && matchClass && matchStatus;
  });

  const filteredSessions = sessions.filter(s => {
    const matchCategory = sessionCategoryFilter === "" || s.category === sessionCategoryFilter;
    const matchClass = sessionClassFilter === "" || s.studentClass === sessionClassFilter;
    return matchCategory && matchClass;
  });

  // --- ANALYTICS CALCULATIONS ---
  const activeCasesCount = students.filter(s => s.status === "active").length;
  const monitoredCasesCount = students.filter(s => s.status === "monitored").length;
  const pendingRequestsCount = requests.filter(r => r.status === "Menunggu").length;

  // Emotional stats
  const totalEmotionsCount = emotions.length || 1;
  const emotionStatsMap = emotions.reduce((acc, curr) => {
    acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const emotionsColorMap: Record<string, { bg: string, text: string }> = {
    "Senang": { bg: "bg-green-500", text: "text-green-700" },
    "Biasa Saja": { bg: "bg-slate-400", text: "text-slate-600" },
    "Sedih": { bg: "bg-blue-500", text: "text-blue-700" },
    "Cemas": { bg: "bg-indigo-500", text: "text-indigo-700" },
    "Marah": { bg: "bg-red-500", text: "text-red-700" },
    "Sepi": { bg: "bg-purple-500", text: "text-purple-700" }
  };

  // --- RENDER PASSCODE LOCK IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className="w-full flex items-center justify-center py-20" id="counselor-login-container">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm w-full max-w-md space-y-8 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-800 border border-slate-200">
            <Lock size={28} />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-display font-bold text-slate-900">Autentikasi Konselor BK</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Akses area ini terbatas untuk Guru Bimbingan Konseling SMPN 2 Ayah demi melindungi privasi siswa.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-700">Masukkan Kode Sandi:</label>
              <input
                required
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
              {authError && (
                <span className="text-red-600 text-[11px] block text-center mt-1 font-medium">
                  {authError}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Buka Kunci Database BK
            </button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            Catatan: Kode sandi bawaan adalah <strong className="font-mono text-slate-600">1234</strong>. Anda dapat mengubahnya di tab Pengaturan setelah berhasil login.
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER FULL COUNSELOR SYSTEM ---
  return (
    <div className="w-full space-y-8" id="counselor-system-wrapper">
      
      {/* Top Banner & Inner Navigation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-100 shadow-xs">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-slate-900">Portal Konselor BK</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">SMPN 2 Ayah</span>
            </div>
            <p className="text-xs text-slate-500 font-sans">Koneksi Terkunci & Konfidensial</p>
          </div>
        </div>

        {/* Buttons and Tab selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lock size={13} />
            Kunci Portal
          </button>
        </div>
      </div>

      {/* Primary Inner Counselor Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-0 overflow-x-auto">
        <button
          onClick={() => setCounselorTab("overview")}
          className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-all duration-300 flex items-center gap-1.5 -mb-[1px] cursor-pointer ${
            counselorTab === "overview"
              ? "bg-white text-emerald-700 border-t border-x border-slate-200 font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <BookOpen size={14} />
          Ikhtisar
        </button>
        <button
          onClick={() => setCounselorTab("students")}
          className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-all duration-300 flex items-center gap-1.5 -mb-[1px] cursor-pointer ${
            counselorTab === "students"
              ? "bg-white text-emerald-700 border-t border-x border-slate-200 font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Users size={14} />
          Database Siswa
          {activeCasesCount > 0 && (
            <span className="ml-1 bg-emerald-600 text-white rounded-full px-1.5 py-0.5 text-[10px]">{activeCasesCount}</span>
          )}
        </button>
        <button
          onClick={() => setCounselorTab("sessions")}
          className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-all duration-300 flex items-center gap-1.5 -mb-[1px] cursor-pointer ${
            counselorTab === "sessions"
              ? "bg-white text-emerald-700 border-t border-x border-slate-200 font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <ClipboardList size={14} />
          Jurnal Sesi
        </button>
        <button
          onClick={() => setCounselorTab("requests")}
          className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-all duration-300 flex items-center gap-1.5 -mb-[1px] cursor-pointer ${
            counselorTab === "requests"
              ? "bg-white text-emerald-700 border-t border-x border-slate-200 font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <MessageSquare size={14} />
          Kotak Curhat Siswa
          {pendingRequestsCount > 0 && (
            <span className="ml-1 bg-amber-600 text-white rounded-full px-1.5 py-0.5 text-[10px] animate-pulse">{pendingRequestsCount}</span>
          )}
        </button>
        <button
          onClick={() => setCounselorTab("ai")}
          className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-all duration-300 flex items-center gap-1.5 -mb-[1px] cursor-pointer ${
            counselorTab === "ai"
              ? "bg-white text-emerald-700 border-t border-x border-slate-200 font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Brain size={14} className="text-purple-600" />
          Asisten Konseling AI
        </button>
        <button
          onClick={() => setCounselorTab("settings")}
          className={`px-5 py-3 text-xs font-semibold rounded-t-xl transition-all duration-300 flex items-center gap-1.5 -mb-[1px] cursor-pointer ${
            counselorTab === "settings"
              ? "bg-white text-emerald-700 border-t border-x border-slate-200 font-bold"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          <Settings size={14} />
          Pengaturan & Backup
        </button>
      </div>

      {/* --- RENDER TAB CONTENT --- */}
      <div className="min-h-[400px]">
        
        {/* TAB 1: OVERVIEW */}
        {counselorTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3.5 bg-rose-50 rounded-xl text-rose-700">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Kasus Aktif</span>
                  <span className="text-2xl font-display font-extrabold text-slate-900">{activeCasesCount}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3.5 bg-blue-50 rounded-xl text-blue-700">
                  <Users size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Siswa Dipantau</span>
                  <span className="text-2xl font-display font-extrabold text-slate-900">{monitoredCasesCount}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3.5 bg-purple-50 rounded-xl text-purple-700">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Total Jurnal Sesi</span>
                  <span className="text-2xl font-display font-extrabold text-slate-900">{sessions.length}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3.5 bg-amber-50 rounded-xl text-amber-700">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Curhat Menunggu</span>
                  <span className="text-2xl font-display font-extrabold text-slate-900">{pendingRequestsCount}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Climate Dashboard Left */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-1">
                  <span className="text-emerald-700 text-[10px] font-mono font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">Pantauan Suasana</span>
                  <h3 className="text-lg font-display font-bold text-slate-900 mt-1">Iklim Emosional Sekolah</h3>
                  <p className="text-slate-500 text-xs">
                    Statistik perasaan siswa SMPN 2 Ayah yang dikumpulkan secara anonim melalui portal siswa. Digunakan untuk merancang intervensi BK klasikal yang tepat sasaran.
                  </p>
                </div>

                {/* Pure React horizontal analytics bars */}
                <div className="space-y-4 pt-2">
                  {Object.keys(emotionsColorMap).map((emotionName) => {
                    const count = emotionStatsMap[emotionName] || 0;
                    const percentage = Math.round((count / totalEmotionsCount) * 100);
                    const design = emotionsColorMap[emotionName];
                    return (
                      <div key={emotionName} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs text-slate-600">
                          <span className="font-semibold flex items-center gap-1">{emotionName} <span className="text-[10px] font-normal text-slate-400">({count} log)</span></span>
                          <span className="font-mono text-slate-500 font-bold">{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`${design.bg} h-full transition-all duration-1000`} 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center gap-2 text-[10px] text-slate-400">
                  <AlertCircle size={14} className="text-slate-400" />
                  <span>Suhu emosional diperbarui secara real-time setiap kali siswa mengisi log di beranda.</span>
                </div>
              </div>

              {/* Quick actions right */}
              <div className="lg:col-span-5 bg-slate-900 p-6 rounded-2xl text-white shadow-sm space-y-5 relative overflow-hidden border border-slate-800">
                <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
                  <Brain size={150} className="text-slate-400" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Asisten Digital</span>
                  <h3 className="text-xl font-display font-bold text-white">Layanan Pendamping AI</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Kesulitan menangani kasus tertentu? Asisten AI di tab pendamping siap menganalisis catatan sesi Anda dan menawarkan strategi intervensi berdasarkan kurikulum psikologi remaja Indonesia.
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      setAiForm({
                        sessionSummary: "Siswa malas mengantuk, tidak mengumpulkan tugas 3 kali berturut-turut di kelas IPA kelas VIII.",
                        category: "Akademik",
                        studentGrade: "VIII",
                        customQuery: "Apa langkah persuasif pertama untuk memanggil anak tanpa menyakiti harga dirinya?"
                      });
                      setAiResult(null);
                      setCounselorTab("ai");
                    }}
                    className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition-all shadow-xs border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    Coba Demo Konsultasi AI
                  </button>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2 font-semibold">Tugas Konselor Hari Ini</span>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                      <CheckSquare size={14} className="text-emerald-400" />
                      <span>Selesaikan 2 curhat tertunda kelas VIII</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                      <CheckSquare size={14} className="text-emerald-400" />
                      <span>Buka data iklim emosi untuk rapat wali kelas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS */}
        {counselorTab === "students" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header, Search bar, and Filter row */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                  <Users size={18} />
                  Database Siswa Terdaftar
                </h3>
                <button
                  onClick={() => setShowAddStudentForm(!showAddStudentForm)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  Tambah Siswa Baru
                </button>
              </div>

              {/* Inputs row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-6 relative">
                  <Search className="absolute left-3.5 top-3 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Cari siswa berdasarkan nama atau tag..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 placeholder:text-slate-400"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={studentClassFilter}
                    onChange={(e) => setStudentClassFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  >
                    <option value="">Semua Kelas</option>
                    {CLASSES_LIST.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  >
                    <option value="">Semua Status</option>
                    <option value="active">Aktif (Konseling)</option>
                    <option value="monitored">Pemantauan</option>
                    <option value="resolved">Selesai (Resolved)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Expandable Form: Add Student */}
            {showAddStudentForm && (
              <form onSubmit={handleCreateStudentSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                <h4 className="font-display font-bold text-slate-900 text-sm">Form Pendaftaran Siswa Baru</h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Nama Lengkap:</label>
                    <input
                      required
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="Nama lengkap siswa..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Kelas:</label>
                    <select
                      required
                      value={newStudent.class}
                      onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {CLASSES_LIST.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Jenis Kelamin:</label>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-1.5 text-xs">
                        <input
                          type="radio"
                          name="newGender"
                          checked={newStudent.gender === "L"}
                          onChange={() => setNewStudent({ ...newStudent, gender: "L" })}
                          className="accent-emerald-600"
                        />
                        Laki-laki
                      </label>
                      <label className="flex items-center gap-1.5 text-xs">
                        <input
                          type="radio"
                          name="newGender"
                          checked={newStudent.gender === "P"}
                          onChange={() => setNewStudent({ ...newStudent, gender: "P" })}
                          className="accent-emerald-600"
                        />
                        Perempuan
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Tag Penanda (Pisahkan dengan koma):</label>
                    <input
                      type="text"
                      value={newStudent.tags}
                      onChange={(e) => setNewStudent({ ...newStudent, tags: e.target.value })}
                      placeholder="e.g. Prestasi, Kurang Fokus"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Catatan Ringkas / Latar Belakang:</label>
                  <textarea
                    rows={2}
                    value={newStudent.notes}
                    onChange={(e) => setNewStudent({ ...newStudent, notes: e.target.value })}
                    placeholder="Tuliskan gambaran ringkas permasalahan awal anak..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentForm(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Simpan Profil Siswa
                  </button>
                </div>
              </form>
            )}

            {/* Students list */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-700">
                  <thead className="bg-slate-50 text-xs font-display text-slate-900 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold">Nama Siswa</th>
                      <th className="px-6 py-4 font-bold">Kelas</th>
                      <th className="px-6 py-4 font-bold">L/P</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Label Kasus</th>
                      <th className="px-6 py-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs font-sans">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((std) => {
                        const isExpanded = expandedStudentId === std.id;
                        const studentSessLogs = sessions.filter(s => s.studentId === std.id);
                        return (
                          <React.Fragment key={std.id}>
                            <tr className={`hover:bg-slate-50/70 transition-colors ${isExpanded ? 'bg-slate-50' : ''}`}>
                              <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setExpandedStudentId(isExpanded ? null : std.id)}
                                  className="p-1 hover:bg-slate-200/60 rounded text-slate-400 focus:outline-none"
                                >
                                  <ChevronRight size={14} className={`transform duration-200 ${isExpanded ? 'rotate-90 text-emerald-600' : ''}`} />
                                </button>
                                <span>{std.name}</span>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-600">{std.class}</td>
                              <td className="px-6 py-4 text-slate-500">{std.gender}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  std.status === "active" ? "bg-red-50 text-red-700 border border-red-100" :
                                  std.status === "monitored" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                  "bg-green-50 text-green-700 border border-green-100"
                                }`}>
                                  {std.status === "active" ? "Konseling" :
                                   std.status === "monitored" ? "Pemantauan" :
                                   "Selesai"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {std.tags.map(tag => (
                                    <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] flex items-center gap-0.5 font-medium border border-slate-200/50">
                                      <Tag size={8} />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {/* Quick add session button */}
                                  <button
                                    onClick={() => {
                                      setSelectedStudentForSession(std);
                                      setNewSession({
                                        ...newSession,
                                        studentId: std.id
                                      });
                                      setShowAddSessionForm(true);
                                    }}
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors cursor-pointer"
                                    title="Tambah Jurnal Sesi"
                                  >
                                    + Sesi
                                  </button>
                                  <button
                                    onClick={() => {
                                      const nextStatus = std.status === "active" ? "monitored" : std.status === "monitored" ? "resolved" : "active";
                                      onEditStudent({ ...std, status: nextStatus as any });
                                    }}
                                    className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                    title="Siklus Status"
                                  >
                                    Ubah Status
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Apakah Anda yakin ingin menghapus profil siswa ${std.name}? Semua riwayat log sesi tidak terhapus tapi tidak akan terkait siswa.`)) {
                                        onDeleteStudent(std.id);
                                      }
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus Siswa"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                                                 {/* Expanded Student History Timeline */}
                            {isExpanded && (
                              <tr className="bg-slate-50/40">
                                <td colSpan={6} className="px-8 py-5 border-l-4 border-emerald-600">
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                                      <h5 className="font-display font-bold text-slate-900 text-xs">Catatan Profil & Riwayat Sesi</h5>
                                      <span className="text-[10px] text-slate-500 font-medium">Total Sesi: {studentSessLogs.length}</span>
                                    </div>
 
                                    {/* Brief note */}
                                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                                      <strong className="block text-slate-900 font-semibold mb-1">Catatan Latar Belakang:</strong>
                                      {std.notes || "Tidak ada catatan latar belakang tambahan untuk siswa ini."}
                                    </div>
 
                                    {/* History list */}
                                    <div className="space-y-3">
                                      <h6 className="font-semibold text-slate-700 text-[11px]">Riwayat Linimasa Konseling:</h6>
                                      {studentSessLogs.length > 0 ? (
                                        <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-4">
                                          {studentSessLogs.map((sess) => (
                                            <div key={sess.id} className="relative text-xs">
                                              {/* Dot */}
                                              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white" />
                                              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
                                                <div className="flex justify-between items-center">
                                                  <span className="font-mono text-[10px] text-slate-400">{sess.date} — Layanan {sess.type}</span>
                                                  <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold">{sess.category}</span>
                                                </div>
                                                <p className="text-slate-700 leading-relaxed font-sans">{sess.summary}</p>
                                                <div className="bg-slate-50 p-2.5 rounded text-[11px] border border-dashed border-slate-200">
                                                  <strong className="text-emerald-950 block">Rencana Aksi:</strong>
                                                  <p className="text-slate-600 whitespace-pre-line">{sess.actionPlan}</p>
                                                </div>
                                                <div className="flex justify-between items-center pt-1.5">
                                                  <span className="text-[10px] text-slate-400">Status Sesi: <strong className="text-slate-600">{sess.status}</strong></span>
                                                  <button
                                                    onClick={() => triggerAiFromSession(sess)}
                                                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] rounded flex items-center gap-1 cursor-pointer font-bold"
                                                  >
                                                    <Brain size={11} />
                                                    Konsultasi AI BK
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-slate-400 italic">Belum ada sesi konseling yang dicatat untuk siswa ini.</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">
                          Tidak ditemukan profil siswa yang cocok dengan kriteria pencarian atau filter Anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EXPANDABLE FORM: CREATE SESSION LOG */}
            {showAddSessionForm && (
              <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleCreateSessionSubmit} className="bg-white p-6 rounded-3xl border border-amber-100 shadow-2xl w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-display font-bold text-emerald-950 text-base">Buat Jurnal Sesi Konseling Baru</h3>
                    {selectedStudentForSession && (
                      <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded">Siswa: {selectedStudentForSession.name}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Student Selection if none pre-selected */}
                    {!selectedStudentForSession && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Pilih Siswa:</label>
                        <select
                          required
                          value={newSession.studentId}
                          onChange={(e) => setNewSession({ ...newSession, studentId: e.target.value })}
                          className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="">-- Pilih Siswa --</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Tanggal Konseling:</label>
                      <input
                        required
                        type="date"
                        value={newSession.date}
                        onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Kategori Layanan:</label>
                      <select
                        value={newSession.category}
                        onChange={(e) => setNewSession({ ...newSession, category: e.target.value as any })}
                        className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="Akademik">Akademik</option>
                        <option value="Perilaku">Perilaku</option>
                        <option value="Sosial">Sosial</option>
                        <option value="Keluarga">Keluarga</option>
                        <option value="Emosional">Emosional</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Format Layanan:</label>
                      <select
                        value={newSession.type}
                        onChange={(e) => setNewSession({ ...newSession, type: e.target.value as any })}
                        className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="Individu">Individu (Pribadi)</option>
                        <option value="Kelompok">Bimbingan Kelompok</option>
                        <option value="Klasikal">Klasikal (Satu Kelas)</option>
                        <option value="Home Visit">Home Visit (Kunjungan Rumah)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Kronologi & Ringkasan Sesi (Sangat Konfidensial):</label>
                    <textarea
                      required
                      rows={4}
                      value={newSession.summary}
                      onChange={(e) => setNewSession({ ...newSession, summary: e.target.value })}
                      placeholder="Tuliskan keluhan utama anak, kronologi, perasaan anak, dan respons verbal selama konseling..."
                      className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Rencana Aksi BK (Action Plan / Penanganan):</label>
                    <textarea
                      required
                      rows={3}
                      value={newSession.actionPlan}
                      onChange={(e) => setNewSession({ ...newSession, actionPlan: e.target.value })}
                      placeholder="e.g. 1. Pantau jurnal harian anak selama seminggu.\n2. Jadwalkan mediasi dengan wali kelas.\n3. Pertemuan orang tua."
                      className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Status Kasus Setelah Sesi:</label>
                    <select
                      value={newSession.status}
                      onChange={(e) => setNewSession({ ...newSession, status: e.target.value as any })}
                      className="w-full bg-[#FAF9F5] border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Selesai">Selesai (Resolved)</option>
                      <option value="Tindak Lanjut">Perlu Tindak Lanjut</option>
                      <option value="Dirujuk">Dirujuk (Rujukan Profesional/Lainnya)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setSelectedStudentForSession(null); setShowAddSessionForm(false); }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Simpan Log Jurnal
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: SESSIONS */}
        {counselorTab === "sessions" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter sessions row */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList size={18} />
                Jurnal Riwayat Sesi Konseling
              </h3>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <select
                  value={sessionCategoryFilter}
                  onChange={(e) => setSessionCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                >
                  <option value="">Semua Kategori</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Perilaku">Perilaku</option>
                  <option value="Sosial">Sosial</option>
                  <option value="Keluarga">Keluarga</option>
                  <option value="Emosional">Emosional</option>
                  <option value="Lainnya">Lainnya</option>
                </select>

                <select
                  value={sessionClassFilter}
                  onChange={(e) => setSessionClassFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                >
                  <option value="">Semua Kelas</option>
                  {CLASSES_LIST.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Session logs card stack */}
            <div className="space-y-4">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((sess) => (
                  <div key={sess.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-2">
                      <div className="space-y-1">
                        <span className="font-display font-bold text-slate-900 text-sm hover:underline cursor-pointer" onClick={() => { setStudentSearch(sess.studentName); setCounselorTab("students"); }}>
                          {sess.studentName}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                          <Calendar size={12} />
                          <span>{sess.date} — Kelas {sess.studentClass} ({sess.type})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold">
                          Kategori: {sess.category}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          sess.status === "Selesai" ? "bg-green-50 text-green-700 border border-green-100" :
                          sess.status === "Tindak Lanjut" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-purple-50 text-purple-700 border border-purple-100"
                        }`}>
                          {sess.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs leading-relaxed">
                      <div className="md:col-span-8 space-y-2">
                        <strong className="text-slate-900 font-semibold block font-display">Ringkasan Sesi & Keluhan:</strong>
                        <p className="text-slate-600 font-sans whitespace-pre-line">{sess.summary}</p>
                      </div>

                      <div className="md:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <strong className="text-slate-900 font-semibold block font-display text-[11px]">Rencana Aksi (Action Plan):</strong>
                        <p className="text-slate-600 font-sans whitespace-pre-line text-[11px]">{sess.actionPlan}</p>
                      </div>
                    </div>

                    {/* Bottom actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const nextStat = sess.status === "Tindak Lanjut" ? "Selesai" : sess.status === "Selesai" ? "Dirujuk" : "Tindak Lanjut";
                            onUpdateSessionStatus(sess.id, nextStat);
                          }}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Siklus Status
                        </button>
                      </div>

                      <button
                        onClick={() => triggerAiFromSession(sess)}
                        className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Brain size={13} />
                        Pendampingan AI BK
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-10 text-center text-slate-400 italic rounded-2xl border border-slate-100 shadow-sm">
                  Tidak ada catatan sesi konseling yang sesuai dengan filter Anda.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: REQUESTS (KOTAK CURHAT) */}
        {counselorTab === "requests" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={18} />
                Kotak Masuk Curhat & Pengajuan Konseling Siswa
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Siswa dapat menitipkan keluh kesah secara langsung atau sebagai Anonim dari portal depan. Layani secepat mungkin secara rahasia.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {requests.length > 0 ? (
                requests.map((req) => (
                  <div key={req.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3 gap-2">
                      <div className="space-y-0.5">
                        <span className={`text-sm font-display font-bold ${req.name.includes("Anonim") ? "text-purple-700 italic" : "text-slate-900"}`}>
                          {req.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>Kelas: {req.class}</span>
                          <span>•</span>
                          <span>{req.date}</span>
                        </div>
                      </div>

                      <div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          req.status === "Menunggu" ? "bg-red-50 text-red-700 border border-red-100 animate-pulse" :
                          req.status === "Dihubungi" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-green-50 text-green-700 border border-green-100"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed italic">
                      "{req.message}"
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-800 flex justify-between items-center">
                      <span>Metode Tindak Lanjut Pilihan Siswa: <strong className="font-semibold">{req.contactMethod}</strong></span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onUpdateRequestStatus(req.id, "Dihubungi")}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Hubungi
                        </button>
                        <button
                          onClick={() => onUpdateRequestStatus(req.id, "Selesai")}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Selesaikan
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-10 text-center text-slate-400 italic rounded-xl border border-slate-200 shadow-xs">
                  Kotak masuk curhat kosong. Belum ada pengajuan curhat masuk dari siswa.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: AI CONFLICT GUIDANCE (BRAIN GEMINI) */}
        {counselorTab === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Input Form left */}
            <form onSubmit={handleConsultAi} className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
              <div className="space-y-1">
                <span className="text-purple-700 text-[10px] font-mono font-bold bg-purple-50 px-2.5 py-1 rounded">Model: Gemini 3.5</span>
                <h3 className="text-base font-display font-bold text-slate-900 mt-1">Konsultasi Pendampingan AI</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Masukkan deskripsi masalah siswa (anonymized) di bawah ini untuk berkonsultasi secara mendalam dengan AI Psikolog Remaja.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Kategori Permasalahan:</label>
                <select
                  value={aiForm.category}
                  onChange={(e) => setAiForm({ ...aiForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                >
                  <option value="Akademik">Akademik</option>
                  <option value="Perilaku">Perilaku (Disiplin / Bullying)</option>
                  <option value="Sosial">Sosial (Pertemanan / Penyesuaian diri)</option>
                  <option value="Keluarga">Masalah Keluarga / Broken Home</option>
                  <option value="Emosional">Kecemasan / Stres / Trauma Emosi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Jenjang Kelas Siswa:</label>
                <select
                  value={aiForm.studentGrade}
                  onChange={(e) => setAiForm({ ...aiForm, studentGrade: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                >
                  <option value="VII">Kelas VII (Fase Transisi/Adaptasi)</option>
                  <option value="VIII">Kelas VIII (Dinamika Peer Pressure/Emosi)</option>
                  <option value="IX">Kelas IX (Anxiety Kelulusan/Karir)</option>
                  <option value="Umum">Umum / Semua Tingkat</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Catatan Kronologi / Gejala Siswa:</label>
                <textarea
                  required
                  rows={5}
                  value={aiForm.sessionSummary}
                  onChange={(e) => setAiForm({ ...aiForm, sessionSummary: e.target.value })}
                  placeholder="e.g. Siswa bersangkutan terlihat murung setelah jam istirahat kedua. Sering melamun di kelas Matematika. Nilai kuis menurun drastis dari 80 ke 35..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 placeholder:text-slate-400 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Kueri Khusus / Pertanyaan Spesifik (Opsional):</label>
                <input
                  type="text"
                  value={aiForm.customQuery}
                  onChange={(e) => setAiForm({ ...aiForm, customQuery: e.target.value })}
                  placeholder="e.g. Bagaimana langkah memediasi dengan orang tuanya?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={aiLoading || !aiForm.sessionSummary.trim()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {aiLoading ? (
                  <>
                    <RefreshCcw className="animate-spin" size={14} />
                    Menganalisis Kasus...
                  </>
                ) : (
                  <>
                    <Brain size={14} />
                    Analisis dengan Gemini AI
                  </>
                )}
              </button>
            </form>

            {/* Response Area Right */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col justify-between">
              
              {aiLoading && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20 animate-pulse">
                  <div className="p-4 bg-purple-50 rounded-full text-purple-600 border border-purple-100">
                    <Brain size={48} className="animate-spin duration-3000" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-display font-bold text-slate-900 text-sm">Menghubungkan ke Psikolog AI Gemini</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Menganalisis kronologi kasus, mengidentifikasi akar masalah berdasarkan teori psikologi remaja, dan merumuskan rencana aksi terbaik...
                    </p>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <AlertCircle size={36} className="text-red-600" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-900 text-sm">Gagal Melakukan Analisis AI</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs">{aiError}</p>
                  </div>
                </div>
              )}

              {!aiLoading && !aiError && !aiResult && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4 py-20">
                  <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                    <Sparkles size={40} />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h4 className="font-display font-bold text-slate-700 text-sm">Hasil Rekomendasi Konseling</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Lakukan pengisian formulir di sebelah kiri lalu klik tombol analisis untuk menghasilkan diagnosis psikologis remaja dan rencana aksi BK Kurikulum Merdeka yang presisi.
                    </p>
                  </div>
                </div>
              )}

              {!aiLoading && !aiError && aiResult && (
                <div className="flex-1 space-y-6">
                  {/* Result Header */}
                  <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-slate-900 text-base">Hasil Diagnosis & Pendampingan Kasus</h4>
                        {aiResult.isMock && (
                          <span className="bg-slate-100 text-slate-800 text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-slate-200">Mode Simulasi</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">Dirumuskan oleh AI Psikologi Remaja SMP</p>
                    </div>

                    <button
                      onClick={() => {
                        const copyText = `ANALISIS KASUS:\n${aiResult.analysis}\n\nREKOMENDASI:\n${aiResult.recommendations.join("\n")}\n\nACTION PLAN:\n${aiResult.actionPlanDraft}`;
                        navigator.clipboard.writeText(copyText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }}
                      className={`p-2 border rounded-lg flex items-center gap-1.5 text-xs cursor-pointer font-bold transition-all ${
                        copied ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                      title="Salin Hasil"
                    >
                      <Copy size={13} />
                      {copied ? "Berhasil Disalin!" : "Salin Hasil"}
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-5 h-[400px] overflow-y-auto pr-2">
                    {/* Analysis Section */}
                    <div className="space-y-1.5 text-xs">
                      <strong className="text-slate-900 font-bold block font-display">1. Analisis Psikologis & Gejala Remaja:</strong>
                      <p className="text-slate-600 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200">{aiResult.analysis}</p>
                    </div>

                    {/* Recommendations List */}
                    <div className="space-y-1.5 text-xs">
                      <strong className="text-slate-900 font-bold block font-display">2. Rekomendasi Tindakan (Guidance Protocol):</strong>
                      <ul className="space-y-2">
                        {aiResult.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-600 leading-relaxed">
                            <span className="w-5 h-5 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold border border-emerald-100 mt-0.5">{i+1}</span>
                            <span className="pt-0.5">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Plan Draft */}
                    <div className="space-y-1.5 text-xs">
                      <strong className="text-slate-900 font-bold block font-display">3. Draf Kolaborasi & Rencana Tindak Lanjut:</strong>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 leading-relaxed whitespace-pre-line font-sans text-[11px]">{aiResult.actionPlanDraft}</div>
                    </div>
                  </div>

                  {/* Guide text */}
                  <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 leading-relaxed flex items-center gap-1.5 bg-slate-50/50 p-2.5 rounded-xl">
                    <Info size={14} className="text-purple-600 flex-shrink-0" />
                    <span>Hasil analisis di atas bersifat pendukung profesional. Keputusan akhir penanganan anak tetap berada pada wewenang penuh Guru BK selaku konselor berwenang.</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & BACKUP */}
        {counselorTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
            {/* Password section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-display font-bold text-slate-900">Ubah Kode Sandi Portal</h3>
                <p className="text-slate-500 text-xs">
                  Ubah kode sandi masuk untuk mengamankan database BK dari akses yang tidak diinginkan.
                </p>
              </div>

              <form onSubmit={handleChangePasscode} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Kode Sandi Baru (Minimal 4 Karakter):</label>
                  <input
                    required
                    type="password"
                    value={newPasscodeVal}
                    onChange={(e) => setNewPasscodeVal(e.target.value)}
                    placeholder="Masukkan sandi baru..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-mono tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Ubah Kode Sandi
                </button>

                {passcodeChangeSuccess && (
                  <span className="text-green-600 text-xs font-semibold block mt-1">
                    Kode sandi portal berhasil diperbarui! Gunakan kode sandi baru saat login kembali.
                  </span>
                )}
              </form>
            </div>

            {/* Backup / Export section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-display font-bold text-slate-900">Ekspor & Impor Database Jurnal BK</h3>
                <p className="text-slate-500 text-xs">
                  Sangat direkomendasikan untuk melakukan backup berkala ke komputer Anda. Hal ini mencegah hilangnya catatan siswa apabila browser Anda terhapus cache-nya.
                </p>
              </div>

              <div className="space-y-3">
                {/* Export */}
                <button
                  onClick={onExportData}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  Ekspor/Backup Semua Data (.json)
                </button>

                {/* Import */}
                <div className="border border-dashed border-slate-200 rounded-xl p-4 space-y-2 text-center bg-slate-50">
                  <span className="text-xs font-semibold text-slate-600 block">Restorasi / Impor Backup:</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImportChange}
                    className="hidden"
                    id="import-file-uploader"
                  />
                  <label
                    htmlFor="import-file-uploader"
                    className="mx-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 max-w-xs"
                  >
                    <Upload size={13} />
                    Pilih File Backup JSON
                  </label>
                  <span className="text-[10px] text-slate-400 block">Restorasi akan menggabungkan/mengganti database lokal yang ada saat ini.</span>
                </div>

                {/* Reset */}
                <div className="border-t border-slate-200 pt-4 flex justify-between items-center gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-red-700 block">Kembalikan ke Seed Awal</span>
                    <span className="text-[10px] text-slate-400">Kembalikan ke data demonstrasi SMPN 2 Ayah.</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Apakah Anda yakin ingin mengatur ulang semua database kembali ke demonstrasi awal? Semua input data Anda yang belum dibackup akan lenyap.")) {
                        onResetData();
                      }
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs border border-red-100 transition-all cursor-pointer"
                  >
                    Atur Ulang Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

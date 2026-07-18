import React, { useState, useEffect } from "react";
import { 
  Heart, Shield, User, HelpCircle, FileText, ClipboardList, 
  Settings, BookOpen, LogOut, CheckCircle2, CloudLightning, Activity, Bell
} from "lucide-react";
import { Student, SessionLog, CounselingRequest, EmotionalCheckIn } from "./types";
import { 
  INITIAL_STUDENTS, INITIAL_SESSIONS, INITIAL_REQUESTS, INITIAL_EMOTIONS 
} from "./initialData";
import StudentPortal from "./components/StudentPortal";
import CounselorDashboard from "./components/CounselorDashboard";
import InformationSection from "./components/InformationSection";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType, testConnection } from "./lib/firebase";

export default function App() {
  // Navigation role tabs
  const [activeTab, setActiveTab] = useState<"siswa" | "konselor" | "info">("siswa");

  // Core reactive database states
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [emotions, setEmotions] = useState<EmotionalCheckIn[]>([]);

  // Simple browser notifications for counselor
  const [notification, setNotification] = useState<string | null>(null);

  // Synchronize with Firebase Firestore
  useEffect(() => {
    testConnection();

    // 1. Core listener for Students
    const unsubscribeStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Student);
      });
      
      // Auto-seed if empty
      if (snapshot.empty && list.length === 0) {
        INITIAL_STUDENTS.forEach(async (std) => {
          try {
            await setDoc(doc(db, "students", std.id), std);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `students/${std.id}`);
          }
        });
      } else {
        setStudents(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "students");
    });

    // 2. Core listener for Sessions
    const unsubscribeSessions = onSnapshot(collection(db, "sessions"), (snapshot) => {
      const list: SessionLog[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as SessionLog);
      });
      
      // Auto-seed if empty
      if (snapshot.empty && list.length === 0) {
        INITIAL_SESSIONS.forEach(async (sess) => {
          try {
            await setDoc(doc(db, "sessions", sess.id), sess);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `sessions/${sess.id}`);
          }
        });
      } else {
        // Sort sessions by date descending
        list.sort((a, b) => b.date.localeCompare(a.date));
        setSessions(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "sessions");
    });

    // 3. Core listener for Requests
    const unsubscribeRequests = onSnapshot(collection(db, "requests"), (snapshot) => {
      const list: CounselingRequest[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as CounselingRequest);
      });
      
      // Auto-seed if empty
      if (snapshot.empty && list.length === 0) {
        INITIAL_REQUESTS.forEach(async (req) => {
          try {
            await setDoc(doc(db, "requests", req.id), req);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `requests/${req.id}`);
          }
        });
      } else {
        // Sort requests by date descending
        list.sort((a, b) => b.date.localeCompare(a.date));
        setRequests(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "requests");
    });

    // 4. Core listener for Emotions
    const unsubscribeEmotions = onSnapshot(collection(db, "emotions"), (snapshot) => {
      const list: EmotionalCheckIn[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as EmotionalCheckIn);
      });
      
      // Auto-seed if empty
      if (snapshot.empty && list.length === 0) {
        INITIAL_EMOTIONS.forEach(async (emo) => {
          try {
            await setDoc(doc(db, "emotions", emo.id), emo);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `emotions/${emo.id}`);
          }
        });
      } else {
        // Sort emotions by date descending/id descending
        list.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
        setEmotions(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "emotions");
    });

    return () => {
      unsubscribeStudents();
      unsubscribeSessions();
      unsubscribeRequests();
      unsubscribeEmotions();
    };
  }, []);

  // --- ACTIONS & MUTATIONS ---

  // Add emotional check-in from student
  const handleAddEmotionalLog = async (newLog: Omit<EmotionalCheckIn, "id" | "date">) => {
    const id = `e-${Date.now()}`;
    const logObj: EmotionalCheckIn = {
      ...newLog,
      id,
      date: new Date().toISOString().split("T")[0]
    };
    try {
      await setDoc(doc(db, "emotions", id), logObj);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `emotions/${id}`);
    }
  };

  // Add counseling curhat request from student
  const handleAddCounselingRequest = async (newReq: Omit<CounselingRequest, "id" | "date" | "status">) => {
    const id = `req-${Date.now()}`;
    const reqObj: CounselingRequest = {
      ...newReq,
      id,
      date: new Date().toISOString().split("T")[0],
      status: "Menunggu"
    };
    try {
      await setDoc(doc(db, "requests", id), reqObj);
      // Trigger local desktop-like app notification for counselor
      setNotification(`Curhat Masuk Baru dari siswa Kelas ${newReq.class}!`);
      setTimeout(() => setNotification(null), 5000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `requests/${id}`);
    }
  };

  // Add student profile
  const handleAddStudent = async (std: Omit<Student, "id">) => {
    const id = `std-${Date.now()}`;
    const stdObj: Student = {
      ...std,
      id
    };
    try {
      await setDoc(doc(db, "students", id), stdObj);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `students/${id}`);
    }
  };

  // Edit student profile
  const handleEditStudent = async (updatedStudent: Student) => {
    try {
      await setDoc(doc(db, "students", updatedStudent.id), updatedStudent);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `students/${updatedStudent.id}`);
    }
  };

  // Delete student
  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, "students", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `students/${id}`);
    }
  };

  // Add counseling session log
  const handleAddSession = async (sess: Omit<SessionLog, "id">) => {
    const id = `sess-${Date.now()}`;
    const sessObj: SessionLog = {
      ...sess,
      id
    };
    try {
      await setDoc(doc(db, "sessions", id), sessObj);
      
      // Also update student status to match the session outcome status if desired
      const targetStudent = students.find(s => s.id === sess.studentId);
      if (targetStudent) {
        let nextStatus = targetStudent.status;
        if (sess.status === "Selesai") nextStatus = "resolved";
        else if (sess.status === "Tindak Lanjut") nextStatus = "active";
        else if (sess.status === "Dirujuk") nextStatus = "monitored";

        await handleEditStudent({ ...targetStudent, status: nextStatus });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `sessions/${id}`);
    }
  };

  // Update counseling session status directly
  const handleUpdateSessionStatus = async (id: string, status: SessionLog["status"]) => {
    const targetSession = sessions.find(s => s.id === id);
    if (targetSession) {
      try {
        await setDoc(doc(db, "sessions", id), { ...targetSession, status });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `sessions/${id}`);
      }
    }
  };

  // Update student curhat request status
  const handleUpdateRequestStatus = async (id: string, status: CounselingRequest["status"]) => {
    const targetRequest = requests.find(r => r.id === id);
    if (targetRequest) {
      try {
        await setDoc(doc(db, "requests", id), { ...targetRequest, status });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `requests/${id}`);
      }
    }
  };

  // Backup export
  const handleExportData = () => {
    const dataStr = JSON.stringify({ students, sessions, requests, emotions }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_ruang_teduh_smpn2ayah_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Backup import
  const handleImportData = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.students && imported.sessions && imported.requests && imported.emotions) {
          if (!window.confirm("Restorasi backup akan menimpa seluruh data di database cloud. Lanjutkan?")) {
            return;
          }

          // Clear current collections first
          const collectionsToClear = ["students", "sessions", "requests", "emotions"];
          for (const colName of collectionsToClear) {
            const querySnapshot = await getDocs(collection(db, colName));
            for (const document of querySnapshot.docs) {
              await deleteDoc(doc(db, colName, document.id));
            }
          }

          // Write imported data
          for (const std of imported.students) {
            await setDoc(doc(db, "students", std.id), std);
          }
          for (const sess of imported.sessions) {
            await setDoc(doc(db, "sessions", sess.id), sess);
          }
          for (const req of imported.requests) {
            await setDoc(doc(db, "requests", req.id), req);
          }
          for (const emo of imported.emotions) {
            await setDoc(doc(db, "emotions", emo.id), emo);
          }

          alert("Database berhasil direstorasi secara utuh ke Firestore!");
        } else {
          alert("Format file backup tidak valid.");
        }
      } catch (err) {
        alert("Gagal membaca file backup JSON atau menyimpannya ke Firestore.");
      }
    };
    reader.readAsText(file);
  };

  // Factory reset to initial seed data
  const handleResetData = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menyetel ulang database kembali ke data awal SMPN 2 Ayah? Semua data yang Anda tambahkan di database cloud akan dihapus.")) {
      return;
    }
    
    try {
      // Clear current collections first
      const collectionsToClear = ["students", "sessions", "requests", "emotions"];
      for (const colName of collectionsToClear) {
        const querySnapshot = await getDocs(collection(db, colName));
        for (const document of querySnapshot.docs) {
          await deleteDoc(doc(db, colName, document.id));
        }
      }

      // Write initial seeds
      for (const std of INITIAL_STUDENTS) {
        await setDoc(doc(db, "students", std.id), std);
      }
      for (const sess of INITIAL_SESSIONS) {
        await setDoc(doc(db, "sessions", sess.id), sess);
      }
      for (const req of INITIAL_REQUESTS) {
        await setDoc(doc(db, "requests", req.id), req);
      }
      for (const emo of INITIAL_EMOTIONS) {
        await setDoc(doc(db, "emotions", emo.id), emo);
      }

      alert("Database telah diatur ulang kembali ke data demonstrasi di Firestore!");
    } catch (e) {
      console.error("Failed to reset data:", e);
      alert("Gagal mengatur ulang data: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-950" id="main-app-container">
      
      {/* Dynamic Floating Toast Notification for new Curhats */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-xl flex items-center gap-3 z-50 animate-bounce cursor-pointer max-w-sm" onClick={() => setActiveTab("konselor")}>
          <div className="w-8 h-8 bg-emerald-900 rounded-lg flex items-center justify-center text-emerald-400">
            <Bell size={16} className="animate-pulse" />
          </div>
          <div className="text-xs">
            <strong className="block font-semibold text-emerald-400">Ada Pesan Curhat Baru!</strong>
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Main layout wrapper */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-1">
        
        {/* Top Header Navigation Panel */}
        <header className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-4 z-40">
          
          {/* Brand Logo Group */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm transform hover:rotate-3 transition-transform cursor-pointer">
              <Heart size={20} className="fill-white/10 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">RUANG TEDUH</h1>
                <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wider font-mono">v1.1</span>
              </div>
              <p className="text-[10px] font-sans text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span>Bimbingan Konseling</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600">SMPN 2 Ayah</span>
              </p>
            </div>
          </div>

          {/* Primary Navigation tabs */}
          <nav className="flex bg-slate-50 p-1 rounded-xl border border-slate-200" id="main-nav-tabs">
            <button
              id="tab-btn-siswa"
              onClick={() => setActiveTab("siswa")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "siswa"
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <User size={13} />
              Portal Siswa
            </button>
            <button
              id="tab-btn-konselor"
              onClick={() => setActiveTab("konselor")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "konselor"
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Shield size={13} />
              Portal Konselor BK
              {requests.filter(r => r.status === "Menunggu").length > 0 && (
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse block" />
              )}
            </button>
            <button
              id="tab-btn-info"
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "info"
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <HelpCircle size={13} />
              Mengenal BK
            </button>
          </nav>

        </header>

        {/* Dynamic Area Container */}
        <main className="min-h-[500px] w-full" id="dynamic-content-pane">
          {activeTab === "siswa" && (
            <StudentPortal
              onAddEmotionalLog={handleAddEmotionalLog}
              onAddCounselingRequest={handleAddCounselingRequest}
            />
          )}

          {activeTab === "konselor" && (
            <CounselorDashboard
              students={students}
              sessions={sessions}
              requests={requests}
              emotions={emotions}
              onAddStudent={handleAddStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddSession={handleAddSession}
              onUpdateSessionStatus={handleUpdateSessionStatus}
              onUpdateRequestStatus={handleUpdateRequestStatus}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetData={handleResetData}
            />
          )}

          {activeTab === "info" && (
            <InformationSection />
          )}
        </main>

      </div>

      {/* Footer Details */}
      <footer className="w-full bg-white border-t border-slate-200 py-10 mt-12" id="global-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-slate-800 tracking-wider">RUANG TEDUH BK</span>
            <p className="text-[11px] text-slate-400">
              © 2026 SMPN 2 Ayah. Kebumen, Jawa Tengah, Indonesia. Hak Cipta Dilindungi.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[11px] text-slate-500 font-semibold font-mono">
            <span>Uptime: 100% (Local)</span>
            <span className="text-slate-300">|</span>
            <span>Asas Kerahasiaan Terjamin</span>
            <span className="text-slate-300">|</span>
            <span>Kurikulum Merdeka</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization helper for Google GenAI
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment variables.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API endpoint for AI Guidance Consultation
  app.post("/api/guidance/consult", async (req, res) => {
    try {
      const { sessionSummary, category, studentGrade, customQuery } = req.body;

      if (!sessionSummary) {
        return res.status(400).json({ error: "Session summary is required." });
      }

      let client;
      try {
        client = getAiClient();
      } catch (keyError: any) {
        // Return a mock fallback if API key is not yet set up, to ensure high quality UX in all states
        console.warn("AI Client initialization failed:", keyError.message);
        return res.json({
          recommendations: [
            "Lakukan pendekatan personal (Active Listening) untuk membangun rasa aman.",
            "Jadwalkan pertemuan lanjutan berdurasi 15-30 menit secara privat.",
            "Gunakan teknik mediasi atau pemecahan masalah (Problem Solving) bersama siswa.",
            "Rekomendasi Tambahan: Hubungkan dengan wali kelas untuk pemantauan harian."
          ],
          analysis: "Saran BK ini adalah respons contoh (Simulasi) karena Kunci API Gemini belum dikonfigurasi di Pengaturan > Secrets. Silakan tambahkan GEMINI_API_KEY untuk analisis psikologi yang mendalam.",
          actionPlanDraft: "1. Hubungi siswa bersangkutan secara hangat.\n2. Lakukan asesmen emosional sederhana.\n3. Kerja sama dengan guru mata pelajaran.",
          isMock: true
        });
      }

      const systemPrompt = `Anda adalah konselor Bimbingan Konseling (BK) ahli psikologi remaja di SMP (sekolah menengah pertama, umur 12-15 tahun) di Indonesia, yang berdedikasi tinggi di bawah pedoman Kurikulum Merdeka.
Anda melayani SMPN 2 Ayah, Kebumen, Jawa Tengah.
Tugas Anda adalah memberikan saran profesional, rencana aksi psikologis, serta analisis yang peka gender, ramah anak, dan menjaga kerahasiaan siswa secara absolut.

PENTING: Selalu merespons dalam Bahasa Indonesia yang profesional, hangat, suportif, dan penuh empati.
Jangan menyertakan nama siswa demi kerahasiaan, sebut saja sebagai 'Siswa yang bersangkutan' atau 'Siswa'.`;

      const prompt = `Saya ingin berkonsultasi mengenai kasus konseling siswa SMP kelas ${studentGrade || "Umum"}.
Kategori Kasus: ${category || "Umum / Emosional / Akademik"}
Catatan Sesi / Kronologi:
"${sessionSummary}"

${customQuery ? `Pertanyaan Spesifik Konselor:\n"${customQuery}"` : "Mohon berikan analisis kasus, draf rencana aksi BK (Action Plan), serta rekomendasi penanganan."}

Kembalikan jawaban dalam format JSON yang bersih dengan struktur berikut:
{
  "recommendations": ["Rekomendasi 1", "Rekomendasi 2", "Rekomendasi 3", ...],
  "analysis": "Penjelasan analisis psikologis dan akar masalah secara mendalam namun praktis...",
  "actionPlanDraft": "Langkah 1, Langkah 2, Rencana kolaborasi dengan orang tua/wali kelas..."
}

Pastikan respons Anda berupa objek JSON valid dan tidak ada teks markdown penutup di luar blok JSON tersebut, atau kembalikan JSON murni.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "";
      try {
        const parsedData = JSON.parse(text.trim());
        res.json({ ...parsedData, isMock: false });
      } catch (parseError) {
        console.error("Failed to parse AI JSON response. Raw text:", text);
        res.json({
          recommendations: [
            "Lakukan konseling individu secara berkelanjutan.",
            "Berikan ruang aman bagi siswa untuk mengekspresikan perasaannya.",
            "Koordinasi dengan orang tua siswa untuk dukungan di rumah."
          ],
          analysis: text || "Respons tidak dapat diurai sebagai JSON, berikut adalah respons mentah: " + text,
          actionPlanDraft: "Tindak lanjuti kondisi siswa dalam 3 hari ke depan.",
          isMock: false
        });
      }
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Internal server error during consultation." });
    }
  });

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ruang Teduh Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Ruang Teduh server:", err);
});

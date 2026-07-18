import React from "react";
import { Info, Heart, Users, HelpCircle, Shield, Award } from "lucide-react";

export default function InformationSection() {
  const bkServices = [
    {
      title: "Layanan Pribadi",
      desc: "Membantu memahami kekuatan diri, minat bakat, mengatasi rasa cemas, stres belajar, atau kesedihan mendalam secara rahasia dan nyaman.",
      icon: Heart,
      color: "bg-rose-50 text-rose-700 border-rose-100"
    },
    {
      title: "Layanan Sosial",
      desc: "Membantu menyelesaikan salah paham dengan teman kelas, menjalin persahabatan yang sehat, beradaptasi dengan lingkungan baru SMPN 2 Ayah.",
      icon: Users,
      color: "bg-blue-50 text-blue-700 border-blue-100"
    },
    {
      title: "Layanan Belajar & Karir",
      desc: "Menyusun strategi belajar efektif, mengatasi rasa malas/mengantuk di kelas, bimbingan pemilihan kelanjutan sekolah (SMA/SMK/MA).",
      icon: Award,
      color: "bg-amber-50 text-amber-700 border-amber-100"
    }
  ];

  const mythsAndFacts = [
    {
      myth: "BK hanya untuk menghukum anak yang melanggar aturan atau 'nakal'.",
      fact: "BK adalah sahabat siswa. Tugas BK bukan menghukum (itu tugas kesiswaan/tatib), melainkan merangkul, mendengarkan, mendampingi, dan mencari solusi bersama dari masalahmu."
    },
    {
      myth: "Masuk ke ruang BK itu memalukan dan dicap bermasalah.",
      fact: "Konseling adalah tanda kekuatan diri dan kedewasaan emosi untuk bertumbuh. Banyak siswa berprestasi berkunjung ke BK untuk konsultasi karir, masa depan, dan bakat."
    },
    {
      myth: "Cerita saya di ruang BK bisa terbongkar ke guru lain atau teman kelas.",
      fact: "BK memegang teguh Asas Kerahasiaan. Semua pembicaraan bersifat sangat rahasia dan aman antara kamu dan Guru BK saja."
    }
  ];

  return (
    <div className="space-y-12" id="information-section-wrapper">
      
      {/* Intro section */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-emerald-700 text-xs font-mono font-bold uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Mengenal BK Lebih Dekat
          </span>
          <h2 className="text-3xl font-display font-bold text-slate-900">BK Sahabat Siswa SMPN 2 Ayah</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-sans">
            Bimbingan dan Konseling (BK) di SMPN 2 Ayah hadir sebagai penyejuk dan peneduh bagi seluruh siswa. Kami percaya bahwa setiap anak memiliki keunikan, potensi emas, dan tantangan pertumbuhannya masing-masing. Ruang BK bukanlah tempat pengadilan, melainkan oase hangat tempatmu berteduh dan bertumbuh dengan aman.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50/50 px-3 py-2 rounded-xl">
              <Shield size={16} />
              <span>100% Rahasia</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-teal-800 font-semibold bg-teal-50/50 px-3 py-2 rounded-xl">
              <Heart size={16} />
              <span>Penuh Empati</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 flex justify-center">
          <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200 text-center space-y-3 max-w-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-700 font-display font-bold text-lg">
              2
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider block text-slate-500">SMPN 2 Ayah</span>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              Terletak di Kec. Ayah, Kab. Kebumen, Jawa Tengah. Kami berkomitmen mewujudkan iklim sekolah yang aman, sehat mental, dan bebas perundungan (bullying).
            </p>
          </div>
        </div>
      </div>

      {/* Services grid */}
      <div className="space-y-6">
        <div className="text-center max-w-md mx-auto">
          <h3 className="text-xl font-display font-bold text-slate-900">Layanan Bimbingan Konseling</h3>
          <p className="text-slate-500 text-xs mt-1">
            Empat pilar layanan BK untuk mendukung perkembangan fisik dan psikismu selama menuntut ilmu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bkServices.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${service.color}`}>
                  <Icon size={20} />
                </div>
                <h4 className="font-display font-bold text-slate-900 text-sm">{service.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  {service.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Myths vs Facts */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 relative overflow-hidden shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Edukasi BK
          </span>
          <h3 className="text-2xl font-display font-bold text-white">Mitos & Fakta Tentang Bimbingan Konseling</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mythsAndFacts.map((item, idx) => (
            <div key={idx} className="bg-slate-800 p-5 rounded-xl border border-slate-700 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900/40">
                  Mitos ❌
                </span>
                <p className="text-xs text-slate-300 italic">
                  "{item.myth}"
                </p>
              </div>
              <div className="border-t border-slate-700 pt-4 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                  Fakta ✔️
                </span>
                <p className="text-xs text-slate-100 leading-relaxed font-sans">
                  {item.fact}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

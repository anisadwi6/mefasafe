import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Sparkles,
  Users,
  Heart,
  Stethoscope,
  Hospital,
  TicketPercent,
  Megaphone,
  MessageSquare,
  Bot,
  CalendarDays,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Gift,
  Star,
} from "lucide-react";
import logo from "../../../assets/logo.png";

const FEATURES = [
  { icon: ShieldCheck, title: "Polis & Asuransi", desc: "Beli paket, kelola polis aktif, dan pantau saldo perlindungan secara real-time.", color: "from-blue-500 to-cyan-500" },
  { icon: Heart, title: "Klaim Digital", desc: "Ajukan klaim dengan upload dokumen dan lacak status persetujuan admin.", color: "from-rose-500 to-pink-500" },
  { icon: Stethoscope, title: "Konsultasi Dokter", desc: "Chat atau video call dengan dokter, bayar via transfer atau saldo asuransi.", color: "from-violet-500 to-purple-500" },
  { icon: Hospital, title: "Rumah Sakit Mitra", desc: "Daftar RS mitra di peta interaktif dan registrasi kunjungan online.", color: "from-emerald-500 to-teal-500" },
  { icon: Sparkles, title: "Layanan Kesehatan", desc: "MCU, lab, vaksin, home care — pilih jadwal dan dapatkan nomor antrian.", color: "from-amber-500 to-orange-500" },
  { icon: CalendarDays, title: "Pengingat Kesehatan", desc: "Atur jadwal kontrol, minum obat, dan vaksin dengan notifikasi otomatis.", color: "from-indigo-500 to-blue-500" },
  { icon: BarChart3, title: "Monitor Polis", desc: "Grafik penggunaan saldo, riwayat klaim, dan ringkasan perlindungan Anda.", color: "from-cyan-500 to-sky-500" },
  { icon: Bot, title: "MefaBot AI", desc: "Asisten virtual berbasis AI untuk tanya jawab seputar asuransi & kesehatan.", color: "from-slate-600 to-slate-800" },
  { icon: Gift, title: "Program Referral", desc: "Ajak teman bergabung dan dapatkan kode diskon setelah target undangan terpenuhi.", color: "from-pink-500 to-rose-500" },
  { icon: TicketPercent, title: "Kode Promo", desc: "Gunakan kode diskon saat pembayaran asuransi, konsultasi, atau layanan kesehatan.", color: "from-fuchsia-500 to-purple-500" },
  { icon: Megaphone, title: "Promo & Informasi", desc: "Banner promo dan pengumuman terbaru langsung di dashboard pengguna.", color: "from-teal-500 to-emerald-500" },
  { icon: Star, title: "Testimoni Pengguna", desc: "Ulasan pengguna terpilih ditampilkan setelah disetujui admin.", color: "from-yellow-500 to-amber-500" },
];

const TEAM = [
  { name: "Anisa Dwi Ariyanti", role: "Activity Diagram, User Persona, User Flow, Wireframe, Diagram Navigasi" },
  { name: "Latisha Syifa Pratiwi", role: "Identifikasi User, Normalisasi Database, Relasi Tabel, User Journey Map" },
  { name: "Nasywa Putri Rachmita", role: "Use Case Diagram, Skenario, Sitemap, Wireframe Low Fidelity" },
];

const VALUES = [
  "Transparansi proses klaim dan pembayaran",
  "Keamanan data pengguna terjaga",
  "Akses layanan kesehatan dalam satu platform",
  "Dukungan AI & admin yang responsif",
];

export default function TentangKami() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 animate-fadeIn">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] right-[-60px] h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-40px] h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 md:px-8 md:py-14 space-y-10">
        {/* Hero */}
        <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/95 shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-8 py-12 md:px-12 md:py-14 text-white">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">Tentang Kami</p>
                <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                  MefaSafe
                </h1>
                <p className="mt-2 text-xl font-semibold text-blue-100">
                  Platform Asuransi Kesehatan Digital
                </p>
                <p className="mt-5 text-base leading-relaxed text-white/90">
                  MefaSafe menghadirkan pengalaman terpadu untuk mengelola polis asuransi, mengajukan klaim,
                  berkonsultasi dengan dokter, mendaftar layanan kesehatan, dan memantau perlindungan Anda —
                  semuanya dalam satu aplikasi web yang aman, modern, dan mudah digunakan.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/health-service")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-lg hover:bg-blue-50 transition"
                >
                  Mulai Sekarang
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex shrink-0 justify-center md:justify-end">
                <div className="rounded-3xl bg-white/15 p-6 backdrop-blur-sm border border-white/20">
                  <img src={logo} alt="MefaSafe" className="h-28 w-28 md:h-36 md:w-36 object-contain drop-shadow-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 border-b border-slate-100 bg-slate-50/80">
            {[
              { label: "Layanan Terintegrasi", value: "12+" },
              { label: "Mitra RS", value: "Database" },
              { label: "Konsultasi Dokter", value: "Real-time" },
              { label: "Dukungan AI", value: "MefaBot" },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-5 text-center">
                <p className="text-2xl font-black text-indigo-600">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Misi & Nilai */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-2xl font-black text-slate-900">Visi & Misi</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Menjadi platform asuransi kesehatan digital yang membantu keluarga Indonesia mengakses layanan
              kesehatan dengan lebih mudah, cepat, dan transparan — tanpa harus berpindah-pindah aplikasi.
            </p>
            <ul className="mt-5 space-y-2">
              {VALUES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-sm">
            <Users className="h-8 w-8 text-blue-200 mb-4" />
            <h3 className="text-lg font-bold">Tim Pengembang</h3>
            <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
              Kelompok 4 Kelas T2D<br />
              D3 Teknologi Informasi<br />
              Fakultas Vokasi UB<br />
              Tahun 2025/2026
            </p>
          </div>
        </section>

        {/* Fitur */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900">Apa Saja yang Bisa Anda Lakukan?</h2>
            <p className="mt-2 text-slate-500">
              Fitur lengkap untuk kebutuhan asuransi dan kesehatan Anda sehari-hari.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 hover:shadow-md hover:border-slate-200 transition"
                >
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tim & Teknologi */}
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">Struktur Tim</h2>
            <p className="mt-2 text-sm text-slate-500 mb-6">
              Proyek ini dikembangkan sebagai bagian dari tugas akhir program studi.
            </p>
            <div className="space-y-3">
              {TEAM.map((member) => (
                <div key={member.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-bold text-slate-900">{member.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <MessageSquare className="h-7 w-7 text-blue-600 mb-3" />
              <h3 className="text-lg font-bold text-slate-900">Feedback Pengguna</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Sampaikan masukan Anda melalui menu Feedback. Ulasan terbaik dapat ditampilkan di beranda
                setelah disetujui admin.
              </p>
              <button
                type="button"
                onClick={() => navigate("/feedback")}
                className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Kirim Feedback →
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-bold text-slate-900">Teknologi</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Laravel", "React", "Vite", "Tailwind CSS", "MySQL", "Sanctum", "Gemini AI", "Leaflet"].map((tech) => (
                  <span key={tech} className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="rounded-3xl bg-slate-950 px-8 py-10 text-white text-center md:text-left md:flex md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Bergabung dengan MefaSafe</p>
            <h3 className="mt-2 text-2xl font-black">Lindungi kesehatan Anda hari ini.</h3>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              Daftar akun, pilih paket asuransi, dan nikmati kemudahan layanan kesehatan digital dalam genggaman.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/asuransi")}
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100"
            >
              Lihat Paket Asuransi
            </button>
            <button
              type="button"
              onClick={() => navigate("/promo")}
              className="rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              Program Promo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

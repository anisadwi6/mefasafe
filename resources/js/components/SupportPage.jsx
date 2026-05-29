import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const pages = {
  "pusat-bantuan": {
    title: "Pusat Bantuan",
    intro: "Selamat datang di Pusat Bantuan MefaSafe. Di sini Anda dapat menemukan jawaban cepat atas pertanyaan umum, cara menggunakan fitur, dan panduan jika mengalami kendala saat menggunakan aplikasi.",
    sections: [
      {
        heading: "Layanan yang Tersedia",
        body: "MefaSafe menyediakan dukungan untuk bantuan pendaftaran polis, pengajuan klaim, jadwal konsultasi, penggunaan fitur pengingat kesehatan, serta solusi masalah akses akun dan verifikasi data.",
      },
      {
        heading: "Panduan Cepat",
        body: "Untuk memulai, buka menu Dashboard lalu pilih layanan yang diinginkan. Jika Anda ingin mengajukan klaim, gunakan menu Klaim dan upload dokumen pendukung. Untuk konsultasi dokter, pilih menu Konsultasi dan ikuti langkah pendaftaran jadwal.",
      },
      {
        heading: "Tingkat Prioritas",
        body: "Jika Anda mengalami gangguan layanan atau kesalahan sistem, kirim laporan ke email bantuan@mefasafe.com dengan judul yang jelas dan deskripsi ringkas. Tim kami akan memproses keluhan dalam waktu kerja.",
      },
    ],
  },
  "syarat-dan-ketentuan": {
    title: "Syarat & Ketentuan",
    intro: "Syarat dan Ketentuan ini mengatur penggunaan aplikasi MefaSafe oleh semua pengguna. Dengan menggunakan aplikasi ini, Anda menyetujui ketentuan yang dijelaskan di bawah.",
    sections: [
      {
        heading: "Akses dan Akun Pengguna",
        body: "Setiap pengguna wajib melakukan pendaftaran dengan data yang valid. Akun bersifat pribadi dan tidak boleh dipinjamkan. Pengguna bertanggung jawab atas segala aktivitas yang terjadi pada akun masing-masing.",
      },
      {
        heading: "Penggunaan Layanan",
        body: "Layanan MefaSafe meliputi manajemen polis, klaim, konsultasi dokter, pengingat kesehatan, dan informasi rumah sakit mitra. Pengguna harus menggunakan fitur dengan tujuan yang sah dan tidak melakukan tindakan yang merugikan pihak lain.",
      },
      {
        heading: "Pembatalan dan Perubahan",
        body: "MefaSafe dapat memperbarui syarat dan ketentuan sewaktu-waktu. Perubahan akan diinformasikan melalui aplikasi atau email. Jika pengguna terus menggunakan aplikasi setelah perubahan berlaku, dianggap menyetujui ketentuan terbaru.",
      },
    ],
  },
  "kebijakan-privasi": {
    title: "Kebijakan Privasi",
    intro: "Kebijakan Privasi MefaSafe menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda selama menggunakan layanan kami.",
    sections: [
      {
        heading: "Data yang Dikumpulkan",
        body: "Kami mengumpulkan informasi dasar seperti nama, alamat, email, nomor telepon, data polis, dan dokumen pendukung yang diperlukan untuk verifikasi serta proses klaim. Data kesehatan yang Anda berikan untuk konsultasi dokter juga disimpan secara aman.",
      },
      {
        heading: "Tujuan Penggunaan Data",
        body: "Data digunakan untuk memproses pendaftaran polis, meninjau klaim, menyediakan konsultasi, mengirim notifikasi, dan meningkatkan pengalaman pengguna. Data tidak disebarluaskan ke pihak ketiga tanpa izin kecuali diwajibkan oleh hukum.",
      },
      {
        heading: "Keamanan Data",
        body: "MefaSafe menjaga data Anda dengan praktik keamanan standar seperti enkripsi saat transmisi dan pembatasan akses berdasarkan peran. Namun, pengguna juga disarankan menjaga kerahasiaan password dan data pribadi mereka.",
      },
      {
        heading: "Hak Pengguna",
        body: "Anda berhak meminta akses, perbaikan, atau penghapusan data pribadi sesuai ketentuan yang berlaku. Untuk pertanyaan privasi, silakan hubungi bantuan@mefasafe.com.",
      },
    ],
  },
  faq: {
    title: "FAQ (Pertanyaan yang Sering Diajukan)",
    intro: "Berikut adalah jawaban atas pertanyaan yang sering ditanyakan oleh pengguna MefaSafe. Jika Anda tidak menemukan jawaban yang dicari, silakan hubungi tim dukungan kami.",
    faqs: [
      {
        question: "Bagaimana cara daftar akun MefaSafe?",
        answer: "Klik tombol Register, lengkapi data diri, unggah KTP dan tanda tangan digital jika diminta, lalu selesaikan proses verifikasi. Setelah berhasil, Anda dapat login dan menggunakan aplikasi.",
      },
      {
        question: "Bagaimana cara mengajukan klaim asuransi?",
        answer: "Buka menu Klaim, pilih jenis klaim, isi formulir dengan benar, dan unggah dokumen pendukung seperti kuitansi atau foto bukti layanan kesehatan.",
      },
      {
        question: "Apa saja fitur konsultasi dokter?",
        answer: "MefaSafe menyediakan konsultasi dokter yang dapat dipesan melalui menu Konsultasi. Pengguna dapat memilih dokter mitra dan mengatur jadwal konsultasi online.",
      },
      {
        question: "Bagaimana cara menggunakan pengingat kesehatan?",
        answer: "Gunakan menu Kalender Pengingat untuk membuat notifikasi kontrol dokter, jadwal minum obat, atau vaksinasi. Anda juga dapat menandai pengingat sebagai selesai.",
      },
      {
        question: "Bagaimana jika saya lupa password?",
        answer: "Gunakan fitur lupa password jika tersedia, atau hubungi tim dukungan melalui email bantuan@mefasafe.com untuk mendapatkan instruksi pemulihan akun.",
      },
    ],
  },
  "peta-situs": {
    title: "Peta Situs",
    intro: "Peta situs membantu Anda menemukan semua halaman dan fitur utama di MefaSafe dengan cepat. Klik menu di bawah untuk langsung menuju ke halaman yang diinginkan.",
    sitemap: [
      {
        group: "Utama",
        links: [
          { label: "Beranda / Dashboard", path: "/home" },
          { label: "Profil Saya", path: "/Profil" },
          { label: "Notifikasi", path: "/notifikasi" },
          { label: "Tentang Kami", path: "/tentang" },
        ],
      },
      {
        group: "Asuransi & Klaim",
        links: [
          { label: "Paket & Polis Asuransi", path: "/asuransi" },
          { label: "Beli Polis (Health Service)", path: "/health-service" },
          { label: "Ajukan Klaim", path: "/klaim" },
          { label: "Monitor Saldo Polis", path: "/monitor" },
        ],
      },
      {
        group: "Layanan Kesehatan",
        links: [
          { label: "Daftar Rumah Sakit", path: "/daftarRS" },
          { label: "Pendaftaran Layanan", path: "/pendaftaran-layanan" },
          { label: "Konsultasi Dokter", path: "/konsul" },
          { label: "Kalender Pengingat", path: "/kalender" },
        ],
      },
      {
        group: "Promo & Lainnya",
        links: [
          { label: "Program Promo & Referral", path: "/promo" },
          { label: "Riwayat Aktivitas", path: "/riwayat" },
          { label: "Feedback", path: "/feedback" },
          { label: "ChatBot MefaBot", path: "/chatbot" },
        ],
      },
      {
        group: "Dukungan & Kebijakan",
        links: [
          { label: "Pusat Bantuan", path: "/dukungan/pusat-bantuan" },
          { label: "FAQ", path: "/dukungan/faq" },
          { label: "Syarat & Ketentuan", path: "/dukungan/syarat-dan-ketentuan" },
          { label: "Kebijakan Privasi", path: "/dukungan/kebijakan-privasi" },
          { label: "Kebijakan Cookie", path: "/dukungan/kebijakan-cookie" },
        ],
      },
    ],
  },
  "kebijakan-cookie": {
    title: "Kebijakan Cookie",
    intro: "MefaSafe menggunakan cookie dan penyimpanan lokal (local storage) untuk meningkatkan pengalaman Anda, menjaga sesi login, dan menyimpan preferensi seperti pengaturan aksesibilitas.",
    sections: [
      {
        heading: "Apa itu Cookie?",
        body: "Cookie adalah file kecil yang disimpan di browser Anda saat mengunjungi situs web. Cookie membantu situs mengingat informasi seperti status login dan preferensi tampilan.",
      },
      {
        heading: "Cookie yang Kami Gunakan",
        body: "Cookie esensial untuk autentikasi (token login), cookie preferensi (pengaturan aksesibilitas), serta data sesi sementara agar navigasi antar halaman berjalan lancar.",
      },
      {
        heading: "Penyimpanan Lokal (Local Storage)",
        body: "Selain cookie, MefaSafe menyimpan beberapa data di local storage perangkat Anda, seperti token autentikasi, pengaturan aksesibilitas, dan preferensi tampilan. Data ini tidak dibagikan ke pihak ketiga.",
      },
      {
        heading: "Mengelola Cookie",
        body: "Anda dapat menghapus cookie melalui pengaturan browser. Namun, menghapus cookie esensial dapat membuat Anda harus login ulang dan preferensi tampilan kembali ke default.",
      },
      {
        heading: "Persetujuan",
        body: "Dengan terus menggunakan MefaSafe, Anda menyetujui penggunaan cookie sesuai kebijakan ini. Jika ada pertanyaan, hubungi bantuan@mefasafe.com.",
      },
    ],
  },
};

export default function SupportPage() {
  const { page } = useParams();
  const navigate = useNavigate();
  const content = pages[page] || pages["pusat-bantuan"];

  const allPages = [
    { label: "Pusat Bantuan", slug: "pusat-bantuan" },
    { label: "Syarat & Ketentuan", slug: "syarat-dan-ketentuan" },
    { label: "Kebijakan Privasi", slug: "kebijakan-privasi" },
    { label: "Kebijakan Cookie", slug: "kebijakan-cookie" },
    { label: "Peta Situs", slug: "peta-situs" },
    { label: "FAQ", slug: "faq" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/70 to-indigo-50 relative overflow-hidden animate-fadeIn">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-120px] right-[-80px] h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[-60px] h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 md:px-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_0.55fr]">
          <div className="space-y-8">
            <div className="rounded-[32px] border border-white/80 bg-white/95 p-8 shadow-xl">
              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Dukungan</p>
                <h1 className="mt-3 text-4xl font-bold text-slate-900">{content.title}</h1>
              </div>
              <p className="text-slate-600 leading-8">{content.intro}</p>
            </div>

            {content.sections?.map((section) => (
              <div key={section.heading} className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900">{section.heading}</h2>
                <p className="mt-3 text-slate-600 leading-7">{section.body}</p>
              </div>
            ))}

            {content.faqs && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="text-2xl font-semibold text-slate-900">Pertanyaan Umum</h2>
                <div className="mt-6 space-y-4">
                  {content.faqs.map((item) => (
                    <div key={item.question} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                      <p className="font-semibold text-slate-900">{item.question}</p>
                      <p className="mt-2 text-slate-600 leading-7">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.sitemap && (
              <div className="space-y-4">
                {content.sitemap.map((group) => (
                  <div key={group.group} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">{group.group}</h2>
                    <ul className="mt-4 space-y-2">
                      {group.links.map((link) => (
                        <li key={link.path}>
                          <button
                            type="button"
                            onClick={() => navigate(link.path)}
                            className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                          >
                            {link.label}
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Menu Dukungan</h3>
              <div className="mt-5 space-y-3">
                {allPages.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/dukungan/${item.slug}`}
                    className={`block rounded-2xl border px-4 py-3 transition-all duration-200 ${item.slug === page ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Kontak Dukungan</h3>
              <p className="mt-4 text-sm text-slate-600 leading-7">
                Hubungi kami jika Anda membutuhkan bantuan langsung atau ingin melaporkan masalah teknis.
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <div>
                  <p className="font-semibold">Email</p>
                  <p>bantuan@mefasafe.com</p>
                </div>
                <div>
                  <p className="font-semibold">Telepon</p>
                  <p>021-1234-5678</p>
                </div>
                <div>
                  <p className="font-semibold">Jam Operasional</p>
                  <p>Senin - Jumat, 09.00 - 17.00 WIB</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Send, Smile, Star, MessageSquare, Sparkles } from "lucide-react";

export default function Feedback({ user }) {
  const navigate = useNavigate();
  const [category, setCategory] = useState("layanan");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!content.trim()) {
      setError("Mohon tuliskan feedback atau saran Anda.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("mefasafe_token");
      const payload = {
        user_id: user?.id,
        category,
        rating,
        content,
      };

      await axios.post("/api/v1/feedbacks", payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });

      setMessage("Terima kasih! Masukan Anda telah dikirim. Admin akan meninjau sebelum ditampilkan di beranda.");
      setContent("");
      setCategory("layanan");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mengirim feedback. Silakan coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 selection:bg-emerald-500 selection:text-white">

      <div className="rounded-[32px] border border-slate-200 bg-white/90 shadow-xl p-8 md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-sm mb-4">
              <Sparkles className="w-4 h-4" />
              Feedback & Saran
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Bagikan pengalaman Anda untuk membuat MefaSafe lebih baik.
            </h1>
            <p className="mt-4 text-slate-600 leading-relaxed text-sm md:text-base">
              Masukan Anda membantu kami meningkatkan kualitas layanan, kecepatan klaim, dan kemudahan akses. Pilih kategori yang paling tepat, berikan rating pengalaman Anda, jelaskan apa yang Anda sukai, serta beri saran perbaikan secara jelas dan singkat.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950/95 p-6 md:p-8 text-white shadow-2xl border border-white/10 max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-200">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-emerald-300 uppercase tracking-[0.2em]">Tip Singkat</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-100">
                  Sampaikan masukan dengan jujur, fokus pada pengalaman Anda, dan beri contoh konkret bila memungkinkan.
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-300" /> Pilih kategori yang sesuai</p>
              <p className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-300" /> Berikan rating untuk pengalaman Anda</p>
              <p className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-cyan-300" /> Jelaskan apa yang paling penting bagi Anda</p>
              <p className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-fuchsia-300" /> Masukan Anda akan digunakan untuk perbaikan</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="layanan">Layanan</option>
              <option value="kecepatan_klaim">Kecepatan Klaim</option>
              <option value="kemudahan_akses">Kemudahan Akses</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`inline-flex items-center justify-center w-11 h-11 rounded-3xl border text-sm font-semibold transition ${rating >= value ? 'border-emerald-500 bg-emerald-600 text-white shadow-lg' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  <Star className="w-4 h-4 mr-1" />
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">Isi Feedback & Saran</label>
              <span className="text-xs text-slate-400">Maks. 5000 karakter</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Ceritakan pengalaman Anda: apa yang berjalan baik, apa yang perlu kami tingkatkan, dan saran apa yang Anda harapkan..."
              className="w-full min-h-[240px] rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none resize-none shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {error && <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}
          {message && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">{message}</div>}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">Catatan:</span> Feedback Anda akan dibaca tim MefaSafe dan digunakan untuk meningkatkan kualitas layanan.
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Masukan"}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

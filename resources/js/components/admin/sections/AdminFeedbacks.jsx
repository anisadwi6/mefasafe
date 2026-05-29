import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Loader2, Star } from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

const CAT_LABEL = {
    layanan:           "Layanan",
    kecepatan_klaim:   "Kecepatan Klaim",
    kemudahan_akses:   "Kemudahan Akses",
};

export default function AdminFeedbacks() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [meta, setMeta]           = useState({});
    const [loading, setLoading]     = useState(true);
    const [category, setCategory]   = useState("");
    const [featuredFilter, setFeaturedFilter] = useState("");
    const [page, setPage]           = useState(1);
    const [busyId, setBusyId]       = useState(null);
    const [toast, setToast]         = useState("");

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/feedbacks`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: {
                    category,
                    is_featured: featuredFilter === "" ? undefined : featuredFilter,
                    page,
                    per_page: 12,
                },
            });
            setFeedbacks(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchFeedbacks(); }, [category, featuredFilter, page]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    };

    const toggleFeatured = async (feedback) => {
        setBusyId(feedback.id);
        try {
            const res = await axios.put(
                `${API}/feedbacks/${feedback.id}/featured`,
                { is_featured: !feedback.is_featured },
                { headers: { Authorization: `Bearer ${token()}` } }
            );
            setFeedbacks((items) =>
                items.map((item) => (item.id === feedback.id ? { ...item, is_featured: !item.is_featured } : item))
            );
            showToast(res.data.message);
        } catch (e) {
            showToast(e.response?.data?.message || "Gagal mengubah status tampil.");
        } finally {
            setBusyId(null);
        }
    };

    const Stars = ({ rating }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            {toast && <div className="fixed right-4 top-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-xl">{toast}</div>}

            <div className="rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm text-pink-800">
                Aktifkan feedback yang ingin ditampilkan di beranda pengguna (bagian &ldquo;Kata Mereka tentang MefaSafe&rdquo;). Hanya yang diizinkan admin yang akan muncul.
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
                <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Semua Kategori</option>
                    <option value="layanan">Layanan</option>
                    <option value="kecepatan_klaim">Kecepatan Klaim</option>
                    <option value="kemudahan_akses">Kemudahan Akses</option>
                </select>
                <select value={featuredFilter} onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Semua Status Tampil</option>
                    <option value="1">Tampil di Beranda</option>
                    <option value="0">Disembunyikan</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : feedbacks.length === 0 ? (
                <div className="text-center py-16 text-slate-400">Belum ada feedback.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {feedbacks.map((f) => (
                        <div key={f.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${f.is_featured ? "border-pink-300 ring-1 ring-pink-200" : "border-slate-200"}`}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <p className="font-bold text-sm text-slate-900">{f.user?.name || "Anonim"}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                        {CAT_LABEL[f.category] || f.category}
                                    </span>
                                </div>
                                <Stars rating={f.rating || 5} />
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{f.content}</p>
                            <p className="text-xs text-slate-400 mt-3">
                                {new Date(f.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>

                            <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                <span className={`text-xs font-bold ${f.is_featured ? "text-pink-600" : "text-slate-400"}`}>
                                    {f.is_featured ? "Tampil di beranda" : "Belum ditampilkan"}
                                </span>
                                <button
                                    onClick={() => toggleFeatured(f)}
                                    disabled={busyId === f.id}
                                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                        f.is_featured
                                            ? "bg-pink-100 text-pink-700 hover:bg-pink-200"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    } disabled:opacity-50`}
                                >
                                    {busyId === f.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : f.is_featured ? (
                                        <><EyeOff className="h-3.5 w-3.5" /> Sembunyikan</>
                                    ) : (
                                        <><Eye className="h-3.5 w-3.5" /> Tampilkan</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {meta.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} feedback)</span>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 bg-white">← Prev</button>
                        <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 bg-white">Next →</button>
                    </div>
                </div>
            )}
        </div>
    );
}

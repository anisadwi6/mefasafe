import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Loader2, CheckCircle2, XCircle, AlertCircle, FileText, Eye } from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");
const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const STATUS_CFG = {
    pending:  { label: "Pending",   color: "bg-amber-100 text-amber-700",   icon: AlertCircle },
    approved: { label: "Disetujui", color: "bg-green-100 text-green-700",   icon: CheckCircle2 },
    rejected: { label: "Ditolak",   color: "bg-red-100 text-red-700",       icon: XCircle },
    partial:  { label: "Sebagian",  color: "bg-blue-100 text-blue-700",     icon: AlertCircle },
};

export default function AdminClaims() {
    const [claims, setClaims]   = useState([]);
    const [meta, setMeta]       = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState("");
    const [status, setStatus]   = useState("");
    const [page, setPage]       = useState(1);
    const [updating, setUpdating] = useState(null);
    const [toast, setToast]     = useState("");
    const [detail, setDetail]   = useState(null);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/claims`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, status, page, per_page: 12 },
            });
            setClaims(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchClaims(); }, [search, status, page]);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    const handleUpdate = async (id, newStatus) => {
        setUpdating(id + newStatus);
        try {
            await axios.put(`${API}/claims/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token()}` } });
            showToast(`Klaim ${newStatus === "approved" ? "disetujui" : "ditolak"}.`);
            fetchClaims();
        } catch (e) { showToast("Gagal memperbarui klaim."); }
        finally { setUpdating(null); }
    };

    return (
        <div className="space-y-4">
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl text-sm">{toast}</div>
            )}

            {/* Detail Modal */}
            {detail && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-500" /> Detail Klaim #{detail.id}
                        </h3>
                        <div className="space-y-2 text-sm">
                            <Row label="Pengguna"    value={detail.user?.name} />
                            <Row label="Polis"       value={detail.insurance_policy?.policy_number} />
                            <Row label="Jumlah"      value={fmt(detail.claim_amount)} />
                            <Row label="Status"      value={detail.status} />
                            <Row label="Deskripsi"   value={detail.description} />
                            <Row label="Tanggal"     value={new Date(detail.created_at).toLocaleString("id-ID")} />
                            {detail.document_path && (
                                <div>
                                    <span className="text-slate-500">Dokumen: </span>
                                    <a href={`/${detail.document_path}`} target="_blank" rel="noreferrer"
                                        className="text-blue-600 underline">Lihat Dokumen</a>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setDetail(null)} className="mt-5 w-full py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200">
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari nama pengguna..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                    <option value="partial">Sebagian</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Pengguna</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Jumlah Klaim</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Tanggal</th>
                                <th className="text-right px-4 py-3 font-semibold text-slate-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                                </td></tr>
                            ) : claims.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-slate-400">Tidak ada klaim.</td></tr>
                            ) : claims.map((c) => {
                                const cfg = STATUS_CFG[c.status] || STATUS_CFG.pending;
                                const Icon = cfg.icon;
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800">{c.user?.name || "-"}</td>
                                        <td className="px-4 py-3 font-bold text-slate-900">{fmt(c.claim_amount)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                <Icon className="w-3 h-3" />{cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">
                                            {new Date(c.created_at).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setDetail(c)}
                                                    className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {c.status === "pending" && (
                                                    <>
                                                        <button onClick={() => handleUpdate(c.id, "approved")}
                                                            disabled={!!updating}
                                                            className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 disabled:opacity-50">
                                                            {updating === c.id + "approved" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Setujui"}
                                                        </button>
                                                        <button onClick={() => handleUpdate(c.id, "rejected")}
                                                            disabled={!!updating}
                                                            className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 disabled:opacity-50">
                                                            {updating === c.id + "rejected" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Tolak"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={meta} page={page} setPage={setPage} label="klaim" />
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex gap-2">
            <span className="text-slate-500 w-24 flex-shrink-0">{label}:</span>
            <span className="text-slate-800 font-medium">{value || "-"}</span>
        </div>
    );
}

function Pagination({ meta, page, setPage, label }) {
    if (!meta.last_page || meta.last_page <= 1) return null;
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
            <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} {label})</span>
            <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">← Prev</button>
                <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next →</button>
            </div>
        </div>
    );
}

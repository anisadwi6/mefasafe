import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Loader2, TrendingUp, TrendingDown, CheckCircle2, XCircle, Clock } from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");
const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const STATUS_CFG = {
    success: { label: "Sukses",  color: "bg-green-100 text-green-700",  icon: CheckCircle2 },
    failed:  { label: "Gagal",   color: "bg-red-100 text-red-700",      icon: XCircle },
    pending: { label: "Pending", color: "bg-amber-100 text-amber-700",  icon: Clock },
};

export default function AdminTransactions() {
    const [txns, setTxns]       = useState([]);
    const [meta, setMeta]       = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState("");
    const [type, setType]       = useState("");
    const [status, setStatus]   = useState("");
    const [page, setPage]       = useState(1);

    const fetchTxns = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/transactions`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, type, status, page, per_page: 15 },
            });
            setTxns(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTxns(); }, [search, type, status, page]);

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari nama pengguna..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Semua Tipe</option>
                    <option value="premi_masuk">Premi Masuk</option>
                    <option value="klaim_keluar">Klaim Keluar</option>
                </select>
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Semua Status</option>
                    <option value="success">Sukses</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Gagal</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Pengguna</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Tipe</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Jumlah</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                                </td></tr>
                            ) : txns.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-slate-400">Tidak ada transaksi.</td></tr>
                            ) : txns.map((t) => {
                                const cfg = STATUS_CFG[t.status] || STATUS_CFG.pending;
                                const Icon = cfg.icon;
                                const isIn = t.transaction_type === "premi_masuk";
                                return (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800">{t.user?.name || "-"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                                                ${isIn ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {isIn ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {isIn ? "Premi Masuk" : "Klaim Keluar"}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 font-bold ${isIn ? "text-green-700" : "text-red-600"}`}>
                                            {isIn ? "+" : "-"}{fmt(t.amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                <Icon className="w-3 h-3" />{cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">
                                            {new Date(t.transaction_date).toLocaleString("id-ID")}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
                        <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} transaksi)</span>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">← Prev</button>
                            <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

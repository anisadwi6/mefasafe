import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Loader2, Calendar, Activity } from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

const STATUS_COLOR = {
    registered: "bg-blue-100 text-blue-700",
    completed:  "bg-green-100 text-green-700",
    canceled:   "bg-red-100 text-red-700",
};

export default function AdminRegistrations() {
    const [tab, setTab]         = useState("hospital");
    const [items, setItems]     = useState([]);
    const [meta, setMeta]       = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState("");
    const [status, setStatus]   = useState("");
    const [page, setPage]       = useState(1);

    const fetchItems = async () => {
        setLoading(true);
        const endpoint = tab === "hospital" ? "hospital-registrations" : "service-registrations";
        try {
            const res = await axios.get(`${API}/${endpoint}`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, status, page, per_page: 12 },
            });
            setItems(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, [tab, search, status, page]);

    const switchTab = (t) => { setTab(t); setPage(1); setSearch(""); setStatus(""); };

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2">
                <button onClick={() => switchTab("hospital")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                        ${tab === "hospital" ? "bg-blue-600 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                    <Calendar className="w-4 h-4" /> Kunjungan RS
                </button>
                <button onClick={() => switchTab("service")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                        ${tab === "service" ? "bg-blue-600 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                    <Activity className="w-4 h-4" /> Layanan Kesehatan
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari nama pengguna atau RS..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Semua Status</option>
                    <option value="registered">Terdaftar</option>
                    <option value="completed">Selesai</option>
                    <option value="canceled">Dibatalkan</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Pengguna</th>
                                {tab === "hospital" ? (
                                    <>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Rumah Sakit</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Dokter</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">No. Antrian</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Layanan</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Jadwal</th>
                                        <th className="text-left px-4 py-3 font-semibold text-slate-600">No. Antrian</th>
                                    </>
                                )}
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                                </td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Tidak ada data.</td></tr>
                            ) : items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-800">{item.user?.name || "-"}</td>
                                    {tab === "hospital" ? (
                                        <>
                                            <td className="px-4 py-3 text-slate-600">{item.hospital_name || item.hospital?.name || "-"}</td>
                                            <td className="px-4 py-3 text-slate-500">{item.doctor_name || "-"}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.queue_number}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 text-slate-600">{item.service_name || "-"}</td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">{item.schedule_date} {item.schedule_time}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.queue_number}</td>
                                        </>
                                    )}
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[item.status] || "bg-slate-100 text-slate-600"}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">
                                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
                        <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} data)</span>
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

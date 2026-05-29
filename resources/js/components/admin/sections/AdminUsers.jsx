import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Loader2, Trash2, User } from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/users`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, role: "pengguna", page, per_page: 12 },
            });
            setUsers(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, page]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Hapus pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        try {
            await axios.delete(`${API}/users/${id}`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            showToast("Pengguna dihapus.");
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || "Gagal menghapus.");
        }
    };

    return (
        <div className="space-y-4">
            {toast && (
                <div className="fixed top-4 right-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-xl">
                    {toast}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari nama atau email pengguna..."
                        className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Pengguna</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Role</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Bergabung</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-500" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400">
                                        Tidak ada pengguna.
                                    </td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="transition-colors hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-800">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                            <User className="h-3 w-3" />
                                            pengguna
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400">
                                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(u.id, u.name)}
                                                className="rounded-lg bg-red-100 p-1.5 text-red-500 hover:bg-red-200"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                        <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} pengguna)</span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50 disabled:opacity-40"
                            >
                                ← Prev
                            </button>
                            <button
                                type="button"
                                disabled={page >= meta.last_page}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50 disabled:opacity-40"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

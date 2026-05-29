import { useEffect, useState } from "react";
import axios from "axios";
import {
    Shield, Search, Loader2, Trash2, Edit2, Plus, X, Check, Eye, EyeOff,
} from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

function AdminModal({ admin, onClose, onSaved }) {
    const isEdit = Boolean(admin?.id);
    const [form, setForm] = useState(() => ({
        name: admin?.name || "",
        email: admin?.email || "",
        password: "",
        password_confirmation: "",
    }));
    const [showPw, setShowPw] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
            };

            if (!isEdit || form.password) {
                payload.password = form.password;
                payload.password_confirmation = form.password_confirmation;
            }

            if (isEdit) {
                await axios.put(`${API}/admins/${admin.id}`, payload, {
                    headers: { Authorization: `Bearer ${token()}` },
                });
            } else {
                await axios.post(`${API}/admins`, payload, {
                    headers: { Authorization: `Bearer ${token()}` },
                });
            }

            onSaved();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message
                || Object.values(err.response?.data?.errors || {}).flat().join(", ")
                || "Gagal menyimpan data admin.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-purple-600">Kelola Admin</p>
                        <h3 className="text-lg font-bold text-slate-900">
                            {isEdit ? "Edit Admin" : "Tambah Admin"}
                        </h3>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4 p-5">
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Nama</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            placeholder="Nama admin"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
                        <input
                            required
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            placeholder="admin@mefasafe.com"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Password {isEdit && <span className="font-normal text-slate-400">(kosongkan jika tidak diubah)</span>}
                        </label>
                        <div className="relative">
                            <input
                                required={!isEdit}
                                type={showPw ? "text" : "password"}
                                value={form.password}
                                onChange={(e) => set("password", e.target.value)}
                                minLength={8}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                placeholder="Minimal 8 karakter"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                            >
                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {(!isEdit || form.password) && (
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Konfirmasi Password</label>
                            <input
                                required={!isEdit || Boolean(form.password)}
                                type={showPw ? "text" : "password"}
                                value={form.password_confirmation}
                                onChange={(e) => set("password_confirmation", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminAdmins({ currentAdminId }) {
    const [admins, setAdmins] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState("");
    const [modal, setModal] = useState(null);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/admins`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, page, per_page: 12 },
            });
            setAdmins(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [search, page]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const handleDelete = async (admin) => {
        if (!confirm(`Hapus admin "${admin.name}"?`)) return;

        try {
            await axios.delete(`${API}/admins/${admin.id}`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            showToast("Admin berhasil dihapus.");
            fetchAdmins();
        } catch (err) {
            showToast(err.response?.data?.message || "Gagal menghapus admin.");
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
                        placeholder="Cari nama atau email admin..."
                        className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setModal({ mode: "create" })}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Admin
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Admin</th>
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
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-purple-500" />
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400">
                                        Belum ada akun admin.
                                    </td>
                                </tr>
                            ) : admins.map((admin) => {
                                const isSelf = Number(currentAdminId) === Number(admin.id);

                                return (
                                    <tr key={admin.id} className="transition-colors hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-xs font-bold text-white">
                                                    {admin.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{admin.name}</p>
                                                    {isSelf && (
                                                        <p className="text-xs text-purple-600">Anda</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{admin.email}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                                                <Shield className="h-3 w-3" />
                                                admin
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-400">
                                            {new Date(admin.created_at).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setModal({ mode: "edit", admin })}
                                                    className="rounded-lg bg-blue-100 p-1.5 text-blue-600 hover:bg-blue-200"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(admin)}
                                                    disabled={isSelf}
                                                    title={isSelf ? "Tidak dapat menghapus akun sendiri" : "Hapus admin"}
                                                    className="rounded-lg bg-red-100 p-1.5 text-red-500 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                        <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} admin)</span>
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

            {modal && (
                <AdminModal
                    admin={modal.mode === "edit" ? modal.admin : null}
                    onClose={() => setModal(null)}
                    onSaved={() => {
                        showToast(modal.mode === "edit" ? "Admin diperbarui." : "Admin ditambahkan.");
                        fetchAdmins();
                    }}
                />
            )}
        </div>
    );
}

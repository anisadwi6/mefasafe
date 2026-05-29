import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Bell, Edit2, ImagePlus, Info, Loader2, Plus, Power, Search, Trash2, X } from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

const EMPTY_FORM = {
    badge: "Informasi",
    title: "",
    description: "",
    button_label: "",
    button_url: "",
    is_active: true,
    sort_order: 1,
};

function toForm(item) {
    return {
        badge: item?.badge || "Informasi",
        title: item?.title || "",
        description: item?.description || "",
        button_label: item?.button_label || "",
        button_url: item?.button_url || "",
        is_active: Boolean(item?.is_active ?? true),
        sort_order: item?.sort_order ?? 1,
    };
}

function imageSrc(item) {
    return item?.image_url || (item?.image ? `/${item.image.replace(/^\//, "")}` : null);
}

function AnnouncementModal({ item, onClose, onSaved }) {
    const [form, setForm] = useState(() => item ? toForm(item) : EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(() => imageSrc(item));
    const [removeImage, setRemoveImage] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const isEdit = Boolean(item?.id);
    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setRemoveImage(false);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImageFile(null);
        setRemoveImage(true);
        setImagePreview(null);
    };

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = new FormData();
            payload.append("badge", form.badge);
            payload.append("title", form.title);
            payload.append("description", form.description);
            payload.append("button_label", form.button_label || "");
            payload.append("button_url", form.button_url || "");
            payload.append("sort_order", String(form.sort_order || 0));
            payload.append("is_active", form.is_active ? "1" : "0");

            if (imageFile) payload.append("image_file", imageFile);
            else if (removeImage) payload.append("remove_image", "1");

            const headers = {
                Authorization: `Bearer ${token()}`,
                "Content-Type": "multipart/form-data",
            };

            if (isEdit) {
                await axios.put(`${API}/announcements/${item.id}`, payload, { headers });
            } else {
                await axios.post(`${API}/announcements`, payload, { headers });
            }
            onSaved();
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors).flat()[0] : null;
            setError(firstError || err.response?.data?.message || "Gagal menyimpan informasi.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Informasi Pengguna</p>
                        <h3 className="text-lg font-bold text-slate-900">{isEdit ? "Edit Informasi" : "Tambah Informasi"}</h3>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="max-h-[78vh] overflow-y-auto p-5">
                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <AlertCircle className="h-4 w-4" /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Label / Badge</span>
                            <input required value={form.badge} onChange={(e) => set("badge", e.target.value)}
                                placeholder="Contoh: Informasi, Penting, Pengumuman"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Urutan</span>
                            <input type="number" min="0" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                        </label>
                        <label className="md:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Judul</span>
                            <input required value={form.title} onChange={(e) => set("title", e.target.value)}
                                placeholder="Contoh: Jam operasional layanan konsultasi diperbarui"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                        </label>
                        <label className="md:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Isi Informasi</span>
                            <textarea required rows={4} value={form.description} onChange={(e) => set("description", e.target.value)}
                                placeholder="Tulis detail informasi yang ingin disampaikan ke pengguna..."
                                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Label Tombol (opsional)</span>
                            <input value={form.button_label} onChange={(e) => set("button_label", e.target.value)}
                                placeholder="Contoh: Pelajari Lebih Lanjut"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">URL Tombol (opsional)</span>
                            <input value={form.button_url} onChange={(e) => set("button_url", e.target.value)}
                                placeholder="Contoh: /asuransi"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                        </label>
                        <div className="md:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Gambar (opsional)</span>
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                                {imagePreview && (
                                    <div className="mb-3 flex items-center gap-4">
                                        <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-xl object-cover border border-slate-200" />
                                        <button type="button" onClick={clearImage}
                                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
                                            Hapus gambar
                                        </button>
                                    </div>
                                )}
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-600 shadow-sm border border-emerald-100 hover:bg-emerald-50">
                                    <ImagePlus className="h-4 w-4" />
                                    Pilih Gambar
                                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                            Aktif tampil ke pengguna
                        </label>
                    </div>

                    <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminAnnouncements() {
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [modalItem, setModalItem] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [toast, setToast] = useState("");

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/announcements`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, page, per_page: 12 },
            });
            setItems(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [search, page]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    };

    const toggleActive = async (item) => {
        setBusyId(item.id);
        try {
            await axios.put(`${API}/announcements/${item.id}`, { is_active: !item.is_active }, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            setItems((list) => list.map((row) => row.id === item.id ? { ...row, is_active: !row.is_active } : row));
            showToast(item.is_active ? "Informasi dinonaktifkan." : "Informasi diaktifkan.");
        } catch (e) {
            showToast("Gagal mengubah status.");
        } finally {
            setBusyId(null);
        }
    };

    const deleteItem = async (item) => {
        if (!window.confirm(`Hapus informasi "${item.title}"?`)) return;
        setBusyId(item.id);
        try {
            await axios.delete(`${API}/announcements/${item.id}`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            showToast("Informasi dihapus.");
            fetchItems();
        } catch (e) {
            showToast(e.response?.data?.message || "Gagal menghapus.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-4">
            {toast && <div className="fixed right-4 top-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-xl">{toast}</div>}

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Informasi aktif digabung dengan Promo di banner iklan dashboard (carousel seperti iklan), bukan tampil terpisah lagi.
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari judul atau badge..."
                        className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                    <Plus className="h-4 w-4" />
                    Tambah Informasi
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-400">Belum ada informasi.</div>
            ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {items.map((item) => (
                        <div key={item.id} className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${item.is_active ? "" : "opacity-70"}`}>
                            <div className="border-b border-slate-100 bg-slate-50 p-5">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                        <Info className="h-3.5 w-3.5" /> {item.badge}
                                    </span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                        {item.is_active ? "Aktif" : "Nonaktif"}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.description}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 p-4">
                                <span className="mr-auto text-xs font-semibold text-slate-500">
                                    {item.button_label ? `${item.button_label} -> ${item.button_url || "-"}` : "Tanpa tombol"}
                                </span>
                                <button onClick={() => toggleActive(item)} disabled={busyId === item.id}
                                    className={`rounded-xl p-2 ${item.is_active ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"} disabled:opacity-50`}>
                                    <Power className="h-4 w-4" />
                                </button>
                                <button onClick={() => setModalItem(item)} className="rounded-xl bg-blue-50 p-2 text-blue-600">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => deleteItem(item)} disabled={busyId === item.id}
                                    className="rounded-xl bg-red-50 p-2 text-red-600 disabled:opacity-50">
                                    {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {meta.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Halaman {meta.current_page} dari {meta.last_page}</span>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Prev</button>
                        <button disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Next</button>
                    </div>
                </div>
            )}

            {(showCreate || modalItem) && (
                <AnnouncementModal
                    item={modalItem}
                    onClose={() => { setShowCreate(false); setModalItem(null); }}
                    onSaved={() => { setShowCreate(false); setModalItem(null); showToast("Informasi tersimpan."); fetchItems(); }}
                />
            )}
        </div>
    );
}

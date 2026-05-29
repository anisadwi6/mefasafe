import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Edit2, Loader2, Plus, Power, Search, Tag, Trash2, X } from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

const FEATURES = [
    { key: "insurance", label: "Polis Asuransi" },
    { key: "consultation", label: "Konsultasi Dokter" },
    { key: "hospital_registration", label: "Registrasi RS" },
    { key: "service_registration", label: "Registrasi Layanan" },
];

const EMPTY_FORM = {
    code: "",
    title: "",
    discount_percent: 10,
    applicable_features: ["insurance", "consultation"],
    usage_limit: "",
    per_user_limit: 1,
    starts_at: "",
    ends_at: "",
    is_active: true,
};

function toForm(item) {
    return {
        code: item?.code || "",
        title: item?.title || "",
        discount_percent: item?.discount_percent ?? 10,
        applicable_features: item?.applicable_features || ["insurance"],
        usage_limit: item?.usage_limit ?? "",
        per_user_limit: item?.per_user_limit ?? 1,
        starts_at: item?.starts_at ? item.starts_at.slice(0, 16) : "",
        ends_at: item?.ends_at ? item.ends_at.slice(0, 16) : "",
        is_active: Boolean(item?.is_active ?? true),
    };
}

function PromoCodeModal({ item, onClose, onSaved }) {
    const [form, setForm] = useState(() => item ? toForm(item) : EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const isEdit = Boolean(item?.id);
    const set = (key, value) => setForm((c) => ({ ...c, [key]: value }));

    const toggleFeature = (key) => {
        setForm((c) => {
            const exists = c.applicable_features.includes(key);
            const next = exists
                ? c.applicable_features.filter((f) => f !== key)
                : [...c.applicable_features, key];
            return { ...c, applicable_features: next };
        });
    };

    const submit = async (event) => {
        event.preventDefault();
        if (form.applicable_features.length === 0) {
            setError("Pilih minimal satu fitur.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload = {
                ...form,
                code: form.code.toUpperCase(),
                usage_limit: form.usage_limit === "" ? null : Number(form.usage_limit),
                per_user_limit: Number(form.per_user_limit || 1),
                starts_at: form.starts_at || null,
                ends_at: form.ends_at || null,
            };

            const headers = { Authorization: `Bearer ${token()}` };
            if (isEdit) {
                await axios.put(`${API}/promo-codes/${item.id}`, payload, { headers });
            } else {
                await axios.post(`${API}/promo-codes`, payload, { headers });
            }
            onSaved();
        } catch (err) {
            const errors = err.response?.data?.errors;
            setError(errors ? Object.values(errors).flat()[0] : err.response?.data?.message || "Gagal menyimpan.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h3 className="text-lg font-bold">{isEdit ? "Edit Kode Promo" : "Tambah Kode Promo"}</h3>
                    <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={submit} className="max-h-[80vh] overflow-y-auto p-5 space-y-4">
                    {error && (
                        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Kode Promo</span>
                            <input required value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())}
                                placeholder="MEFA10" className="w-full rounded-xl border px-3 py-2 text-sm uppercase font-bold" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Diskon (%)</span>
                            <input type="number" min="1" max="100" required value={form.discount_percent}
                                onChange={(e) => set("discount_percent", e.target.value)}
                                className="w-full rounded-xl border px-3 py-2 text-sm" />
                        </label>
                        <label className="md:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Judul / Keterangan</span>
                            <input required value={form.title} onChange={(e) => set("title", e.target.value)}
                                placeholder="Diskon pembukaan MefaSafe" className="w-full rounded-xl border px-3 py-2 text-sm" />
                        </label>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-semibold text-slate-600">Berlaku untuk fitur</p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {FEATURES.map((f) => (
                                <label key={f.key} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                                    <input type="checkbox" checked={form.applicable_features.includes(f.key)} onChange={() => toggleFeature(f.key)} />
                                    {f.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Kuota Total (kosong = unlimited)</span>
                            <input type="number" min="1" value={form.usage_limit} onChange={(e) => set("usage_limit", e.target.value)}
                                className="w-full rounded-xl border px-3 py-2 text-sm" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Maks. per User</span>
                            <input type="number" min="1" value={form.per_user_limit} onChange={(e) => set("per_user_limit", e.target.value)}
                                className="w-full rounded-xl border px-3 py-2 text-sm" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Mulai Berlaku</span>
                            <input type="datetime-local" value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)}
                                className="w-full rounded-xl border px-3 py-2 text-sm" />
                        </label>
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Berakhir</span>
                            <input type="datetime-local" value={form.ends_at} onChange={(e) => set("ends_at", e.target.value)}
                                className="w-full rounded-xl border px-3 py-2 text-sm" />
                        </label>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm font-semibold">
                        <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
                        Aktif
                    </label>

                    <div className="flex justify-end gap-2 border-t pt-4">
                        <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2 text-sm font-semibold">Batal</button>
                        <button type="submit" disabled={saving} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                            {saving && <Loader2 className="inline h-4 w-4 animate-spin mr-1" />} Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminPromoCodes() {
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
            const res = await axios.get(`${API}/promo-codes`, {
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

    useEffect(() => { fetchItems(); }, [search, page]);

    const featureLabels = (keys) => (keys || []).map((k) => FEATURES.find((f) => f.key === k)?.label || k).join(", ");

    return (
        <div className="space-y-4">
            {toast && <div className="fixed right-4 top-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">{toast}</div>}

            <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">
                Kelola kode diskon pembayaran. Pilih fitur mana saja yang bisa memakai kode ini (asuransi, konsultasi, dll).
            </div>

            <div className="flex flex-wrap gap-3 rounded-2xl border bg-white p-4">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari kode atau judul..." className="w-full rounded-xl border py-2 pl-9 pr-4 text-sm" />
                </div>
                <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white">
                    <Plus className="h-4 w-4" /> Tambah Kode Promo
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl border border-dashed py-12 text-center text-sm text-slate-400">Belum ada kode promo.</div>
            ) : (
                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Kode</th>
                                <th className="px-4 py-3">Diskon</th>
                                <th className="px-4 py-3">Fitur</th>
                                <th className="px-4 py-3">Pemakaian</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.map((item) => (
                                <tr key={item.id} className={item.is_active ? "" : "opacity-60"}>
                                    <td className="px-4 py-3">
                                        <p className="font-black tracking-wider text-violet-700">{item.code}</p>
                                        <p className="text-xs text-slate-500">{item.title}</p>
                                    </td>
                                    <td className="px-4 py-3 font-bold">{item.discount_percent}%</td>
                                    <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">{featureLabels(item.applicable_features)}</td>
                                    <td className="px-4 py-3 text-xs">
                                        {item.used_count}{item.usage_limit ? ` / ${item.usage_limit}` : " / ∞"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                            {item.is_active ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={async () => {
                                                setBusyId(item.id);
                                                await axios.put(`${API}/promo-codes/${item.id}`, { is_active: !item.is_active }, { headers: { Authorization: `Bearer ${token()}` } });
                                                fetchItems();
                                                setBusyId(null);
                                            }} className="rounded-lg p-2 hover:bg-slate-100"><Power className="h-4 w-4" /></button>
                                            <button onClick={() => setModalItem(item)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></button>
                                            <button onClick={async () => {
                                                if (!confirm(`Hapus kode ${item.code}?`)) return;
                                                await axios.delete(`${API}/promo-codes/${item.id}`, { headers: { Authorization: `Bearer ${token()}` } });
                                                setToast("Kode dihapus.");
                                                fetchItems();
                                            }} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {(showCreate || modalItem) && (
                <PromoCodeModal
                    item={modalItem}
                    onClose={() => { setShowCreate(false); setModalItem(null); }}
                    onSaved={() => { setShowCreate(false); setModalItem(null); setToast("Kode promo tersimpan."); fetchItems(); }}
                />
            )}
        </div>
    );
}

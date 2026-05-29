import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Edit2, Loader2, Plus, Power, Shield, Trash2, X } from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");
const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const EMPTY_FORM = {
    type: "kesehatan",
    label: "",
    description: "",
    coverage_limit: "",
    premium_amount: "",
    benefits: [""],
    is_active: true,
};

const TYPE_COLOR = {
    jiwa: "bg-purple-100 text-purple-700",
    kesehatan: "bg-blue-100 text-blue-700",
    kendaraan: "bg-amber-100 text-amber-700",
};

const examples = {
    jiwa: {
        label: "Asuransi Jiwa Proteksi",
        description: "Perlindungan jiwa untuk keluarga jika terjadi risiko meninggal dunia atau cacat tetap.",
        coverage_limit: "500000000",
        premium_amount: "750000",
        benefits: ["Santunan meninggal dunia hingga Rp 500 juta", "Bebas premi jika cacat tetap total"],
    },
    kesehatan: {
        label: "Asuransi Kesehatan Plus",
        description: "Rawat inap, rawat jalan, obat, dan konsultasi dokter untuk kebutuhan kesehatan keluarga.",
        coverage_limit: "100000000",
        premium_amount: "500000",
        benefits: ["Rawat inap hingga Rp 100 juta/tahun", "Rawat jalan 80% ditanggung"],
    },
    kendaraan: {
        label: "Asuransi Kendaraan Aman",
        description: "Perlindungan kendaraan dari risiko kecelakaan, kehilangan, dan tanggung jawab pihak ketiga.",
        coverage_limit: "200000000",
        premium_amount: "300000",
        benefits: ["Ganti rugi kecelakaan hingga Rp 200 juta", "Layanan derek 24 jam"],
    },
};

function packageBenefits(pkg) {
    if (Array.isArray(pkg.benefits)) return pkg.benefits;
    try {
        return JSON.parse(pkg.benefits || "[]");
    } catch {
        return [];
    }
}

function toForm(pkg) {
    return {
        type: pkg?.type || "kesehatan",
        label: pkg?.label || "",
        description: pkg?.description || "",
        coverage_limit: pkg?.coverage_limit || "",
        premium_amount: pkg?.premium_amount || "",
        benefits: packageBenefits(pkg).length ? packageBenefits(pkg) : [""],
        is_active: Boolean(pkg?.is_active ?? true),
    };
}

function PackageModal({ pkg, onClose, onSaved }) {
    const [form, setForm] = useState(() => pkg ? toForm(pkg) : EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const isEdit = Boolean(pkg?.id);
    const sample = examples[form.type] || examples.kesehatan;

    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const setBenefit = (index, value) => {
        setForm((current) => ({
            ...current,
            benefits: current.benefits.map((item, i) => i === index ? value : item),
        }));
    };
    const addBenefit = () => setForm((current) => ({ ...current, benefits: [...current.benefits, ""] }));
    const removeBenefit = (index) => setForm((current) => ({
        ...current,
        benefits: current.benefits.length === 1 ? [""] : current.benefits.filter((_, i) => i !== index),
    }));

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                ...form,
                coverage_limit: Number(form.coverage_limit),
                premium_amount: Number(form.premium_amount),
                benefits: form.benefits.map((item) => item.trim()).filter(Boolean),
                is_active: Boolean(form.is_active),
            };

            if (isEdit) {
                await axios.put(`${API}/packages/${pkg.id}`, payload, {
                    headers: { Authorization: `Bearer ${token()}` },
                });
            } else {
                await axios.post(`${API}/packages`, payload, {
                    headers: { Authorization: `Bearer ${token()}` },
                });
            }

            onSaved();
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors).flat()[0] : null;
            setError(firstError || err.response?.data?.message || "Gagal menyimpan paket.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Paket Asuransi</p>
                        <h3 className="text-lg font-bold text-slate-900">{isEdit ? "Edit Paket" : "Tambah Paket"}</h3>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="max-h-[78vh] overflow-y-auto p-5">
                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Tipe</span>
                            <select value={form.type} onChange={(e) => set("type", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <option value="jiwa">Jiwa</option>
                                <option value="kesehatan">Kesehatan</option>
                                <option value="kendaraan">Kendaraan</option>
                            </select>
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Nama Paket</span>
                            <input required value={form.label} onChange={(e) => set("label", e.target.value)}
                                placeholder={`Contoh: ${sample.label}`}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </label>

                        <label className="md:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Deskripsi</span>
                            <textarea required rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
                                placeholder={`Contoh: ${sample.description}`}
                                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Limit Klaim</span>
                            <input required type="number" min="0" value={form.coverage_limit} onChange={(e) => set("coverage_limit", e.target.value)}
                                placeholder={`Contoh: ${sample.coverage_limit}`}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <span className="mt-1 block text-[11px] text-slate-400">Masukkan angka saja, tanpa Rp atau titik.</span>
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Premi / Bulan</span>
                            <input required type="number" min="0" value={form.premium_amount} onChange={(e) => set("premium_amount", e.target.value)}
                                placeholder={`Contoh: ${sample.premium_amount}`}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <span className="mt-1 block text-[11px] text-slate-400">Contoh 500000 akan tampil sebagai Rp 500.000.</span>
                        </label>
                    </div>

                    <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600">Manfaat Paket</span>
                            <button type="button" onClick={addBenefit}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100">
                                <Plus className="h-3.5 w-3.5" />
                                Tambah Manfaat
                            </button>
                        </div>
                        <div className="space-y-2">
                            {form.benefits.map((benefit, index) => (
                                <div key={index} className="flex gap-2">
                                    <input required value={benefit} onChange={(e) => setBenefit(index, e.target.value)}
                                        placeholder={`Contoh: ${sample.benefits[index] || sample.benefits[0]}`}
                                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                    <button type="button" onClick={() => removeBenefit(index)}
                                        className="rounded-xl bg-red-50 px-3 text-red-600 hover:bg-red-100">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                            Aktif untuk pengguna
                        </label>
                    </div>

                    <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                        <button type="submit" disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminPackages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalPackage, setModalPackage] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [toast, setToast] = useState("");

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/packages`, { headers: { Authorization: `Bearer ${token()}` } });
            setPackages(res.data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const closeModal = () => {
        setShowCreate(false);
        setModalPackage(null);
    };

    const handleSaved = () => {
        closeModal();
        showToast("Paket asuransi tersimpan.");
        fetchPackages();
    };

    const deletePackage = async (pkg) => {
        if (!window.confirm(`Hapus ${pkg.label}?`)) return;

        setBusyId(pkg.id);
        try {
            await axios.delete(`${API}/packages/${pkg.id}`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            showToast("Paket asuransi dihapus.");
            fetchPackages();
        } catch (e) {
            console.error(e);
            showToast(e.response?.data?.message || "Gagal menghapus paket.");
        } finally {
            setBusyId(null);
        }
    };

    const toggleActive = async (pkg) => {
        setBusyId(pkg.id);
        try {
            await axios.put(`${API}/packages/${pkg.id}`, { is_active: !pkg.is_active }, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            setPackages((items) => items.map((item) => item.id === pkg.id ? { ...item, is_active: !item.is_active } : item));
            showToast(pkg.is_active ? "Paket dinonaktifkan." : "Paket diaktifkan.");
        } catch (e) {
            console.error(e);
            showToast("Gagal mengubah status paket.");
        } finally {
            setBusyId(null);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
    );

    return (
        <div className="space-y-4">
            {toast && (
                <div className="fixed right-4 top-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-xl">{toast}</div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <p className="flex-1 text-sm text-slate-500">Kelola paket asuransi yang tersedia untuk pengguna.</p>
                <button onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Tambah Paket
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {packages.map((pkg) => (
                    <div key={pkg.id} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${pkg.is_active ? "" : "opacity-70"}`}>
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <div className="mb-2 flex flex-wrap gap-2">
                                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLOR[pkg.type] || "bg-slate-100 text-slate-600"}`}>
                                        {pkg.type}
                                    </span>
                                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${pkg.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                        {pkg.is_active ? "Aktif" : "Nonaktif"}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900">{pkg.label}</h3>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => toggleActive(pkg)} disabled={busyId === pkg.id}
                                    title={pkg.is_active ? "Nonaktifkan" : "Aktifkan"}
                                    className={`rounded-lg p-1.5 ${pkg.is_active ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "bg-green-100 text-green-600 hover:bg-green-200"} disabled:opacity-50`}>
                                    <Power className="h-4 w-4" />
                                </button>
                                <button onClick={() => setModalPackage(pkg)}
                                    className="rounded-lg bg-blue-100 p-1.5 text-blue-600 hover:bg-blue-200">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => deletePackage(pkg)} disabled={busyId === pkg.id}
                                    className="rounded-lg bg-red-100 p-1.5 text-red-600 hover:bg-red-200 disabled:opacity-50">
                                    {busyId === pkg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <p className="mb-4 text-sm leading-relaxed text-slate-500">{pkg.description}</p>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Limit Klaim</span>
                                <span className="text-sm font-bold text-slate-900">{fmt(pkg.coverage_limit)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Premi / Bulan</span>
                                <span className="text-sm font-bold text-blue-600">{fmt(pkg.premium_amount)}</span>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <p className="mb-2 text-xs font-semibold text-slate-500">Manfaat:</p>
                            <ul className="space-y-1">
                                {packageBenefits(pkg).map((benefit, index) => (
                                    <li key={index} className="flex items-center gap-2 text-xs text-slate-600">
                                        <Shield className="h-3 w-3 flex-shrink-0 text-blue-500" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {packages.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-400">
                    Belum ada paket asuransi.
                </div>
            )}

            {(showCreate || modalPackage) && (
                <PackageModal pkg={modalPackage} onClose={closeModal} onSaved={handleSaved} />
            )}
        </div>
    );
}

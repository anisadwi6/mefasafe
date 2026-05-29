import { useEffect, useState } from "react";
import axios from "axios";
import {
    AlertCircle,
    Edit2,
    Hospital,
    Loader2,
    MapPin,
    Phone,
    Plus,
    Power,
    Search,
    Stethoscope,
    Trash2,
    X,
} from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

const EMPTY_FORM = {
    name: "",
    address: "",
    city: "",
    province: "",
    phone: "",
    email: "",
    latitude: "",
    longitude: "",
    type: "umum",
    facilities: "",
    is_partner: true,
    is_active: true,
};

const TYPE_LABEL = { umum: "Umum", swasta: "Swasta", khusus: "Khusus", puskesmas: "Puskesmas" };
const TYPE_COLOR = {
    umum: "bg-blue-100 text-blue-700",
    swasta: "bg-purple-100 text-purple-700",
    khusus: "bg-amber-100 text-amber-700",
    puskesmas: "bg-green-100 text-green-700",
};

function toForm(hospital) {
    return {
        name: hospital?.name ?? "",
        address: hospital?.address ?? "",
        city: hospital?.city ?? "",
        province: hospital?.province ?? "",
        phone: hospital?.phone ?? "",
        email: hospital?.email ?? "",
        latitude: hospital?.latitude ?? "",
        longitude: hospital?.longitude ?? "",
        type: hospital?.type ?? "umum",
        facilities: hospital?.facilities ?? "",
        is_partner: Boolean(hospital?.is_partner ?? true),
        is_active: Boolean(hospital?.is_active ?? true),
    };
}

function HospitalModal({ hospital, onClose, onSaved }) {
    const [form, setForm] = useState(() => hospital ? toForm(hospital) : EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const isEdit = Boolean(hospital?.id);

    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setSaving(true);

        try {
            const payload = {
                ...form,
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                is_partner: Boolean(form.is_partner),
                is_active: Boolean(form.is_active),
            };

            if (isEdit) {
                await axios.put(`${API}/hospitals/${hospital.id}`, payload, {
                    headers: { Authorization: `Bearer ${token()}` },
                });
            } else {
                await axios.post(`${API}/hospitals`, payload, {
                    headers: { Authorization: `Bearer ${token()}` },
                });
            }

            onSaved();
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors).flat()[0] : null;
            setError(firstError || err.response?.data?.message || "Gagal menyimpan rumah sakit.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Rumah Sakit</p>
                        <h3 className="text-lg font-bold text-slate-900">{isEdit ? "Edit Rumah Sakit" : "Tambah Rumah Sakit"}</h3>
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
                        <label className="md:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Nama RS</span>
                            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                                placeholder="Contoh: RS Hermina Malang"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </label>

                        <label className="md:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Alamat</span>
                            <textarea required rows={2} value={form.address} onChange={(e) => set("address", e.target.value)}
                                placeholder="Contoh: Jl. Tangkuban Perahu No. 31-33, Kauman"
                                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Kota</span>
                            <input required value={form.city} onChange={(e) => set("city", e.target.value)}
                                placeholder="Contoh: Malang"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Provinsi</span>
                            <input value={form.province} onChange={(e) => set("province", e.target.value)}
                                placeholder="Contoh: Jawa Timur"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Telepon</span>
                            <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                                placeholder="Contoh: 0341-350833"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Email</span>
                            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                                placeholder="Contoh: info@herminahospitals.com"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Latitude</span>
                            <input required type="number" step="any" value={form.latitude} onChange={(e) => set("latitude", e.target.value)}
                                placeholder="Contoh: -7.966620"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <span className="mt-1 block text-[11px] text-slate-400">Gunakan angka dari Google Maps.</span>
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Longitude</span>
                            <input required type="number" step="any" value={form.longitude} onChange={(e) => set("longitude", e.target.value)}
                                placeholder="Contoh: 112.632629"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <span className="mt-1 block text-[11px] text-slate-400">Contoh format: 112.632629, tanpa koma ribuan.</span>
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Tipe</span>
                            <select value={form.type} onChange={(e) => set("type", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <option value="umum">Umum</option>
                                <option value="swasta">Swasta</option>
                                <option value="khusus">Khusus</option>
                                <option value="puskesmas">Puskesmas</option>
                            </select>
                        </label>

                        <label className="md:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Fasilitas</span>
                            <textarea rows={2} value={form.facilities} onChange={(e) => set("facilities", e.target.value)}
                                placeholder="Contoh: IGD 24 jam, rawat inap, laboratorium, radiologi, farmasi"
                                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <span className="mt-1 block text-[11px] text-slate-400">Pisahkan fasilitas dengan koma agar mudah dibaca.</span>
                        </label>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                            Aktif
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                            <input type="checkbox" checked={form.is_partner} onChange={(e) => set("is_partner", e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                            Mitra
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

export default function AdminHospitals() {
    const [hospitals, setHospitals] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [modalHospital, setModalHospital] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const fetchHospitals = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/hospitals`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, page, per_page: 12 },
            });
            setHospitals(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, [search, page]);

    const closeModal = () => {
        setShowCreate(false);
        setModalHospital(null);
    };

    const handleSaved = () => {
        closeModal();
        fetchHospitals();
    };

    const toggleActive = async (hospital) => {
        setBusyId(hospital.id);
        try {
            await axios.put(`${API}/hospitals/${hospital.id}`, { is_active: !hospital.is_active }, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            setHospitals((items) => items.map((item) => item.id === hospital.id ? { ...item, is_active: !item.is_active } : item));
        } catch (e) {
            console.error(e);
            alert("Gagal mengubah status rumah sakit.");
        } finally {
            setBusyId(null);
        }
    };

    const deleteHospital = async (hospital) => {
        if (!window.confirm(`Hapus ${hospital.name}? Data dokter terkait juga bisa ikut terhapus.`)) return;

        setBusyId(hospital.id);
        try {
            await axios.delete(`${API}/hospitals/${hospital.id}`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            fetchHospitals();
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || "Gagal menghapus rumah sakit.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari nama atau kota..."
                        className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Tambah RS
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
            ) : hospitals.length === 0 ? (
                <div className="py-16 text-center text-slate-400">Tidak ada rumah sakit.</div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {hospitals.map((h) => (
                        <div key={h.id} className={`rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${h.is_active ? "border-slate-200" : "border-slate-200 opacity-70"}`}>
                            <div className="mb-3 flex items-start gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                                    <Hospital className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold leading-tight text-slate-900">{h.name}</p>
                                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLOR[h.type] || "bg-slate-100 text-slate-600"}`}>
                                        {TYPE_LABEL[h.type] || h.type}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-500">
                                <div className="flex items-start gap-2">
                                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                                    <span>{h.address}, {h.city}</span>
                                </div>
                                {h.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                                        <span>{h.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                                    <span>{h.doctors_count || 0} dokter terdaftar</span>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${h.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                    {h.is_active ? "Aktif" : "Nonaktif"}
                                </span>
                                {h.is_partner && (
                                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">Mitra</span>
                                )}
                            </div>

                            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-3">
                                <button onClick={() => toggleActive(h)} disabled={busyId === h.id}
                                    title={h.is_active ? "Nonaktifkan" : "Aktifkan"}
                                    className={`flex items-center justify-center rounded-xl p-2 text-sm font-semibold ${h.is_active ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"} disabled:opacity-50`}>
                                    <Power className="h-4 w-4" />
                                </button>
                                <button onClick={() => setModalHospital(h)}
                                    title="Edit"
                                    className="flex items-center justify-center rounded-xl bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => deleteHospital(h)} disabled={busyId === h.id}
                                    title="Hapus"
                                    className="flex items-center justify-center rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <span className="flex items-center justify-center text-xs font-semibold text-slate-400">
                                    #{h.id}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {meta.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} RS)</span>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50 disabled:opacity-40">Prev</button>
                        <button disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50 disabled:opacity-40">Next</button>
                    </div>
                </div>
            )}

            {(showCreate || modalHospital) && (
                <HospitalModal hospital={modalHospital} onClose={closeModal} onSaved={handleSaved} />
            )}
        </div>
    );
}

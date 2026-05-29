import { useEffect, useState } from "react";
import axios from "axios";
import {
    AlertCircle,
    Edit2,
    Loader2,
    Plus,
    Power,
    Search,
    Stethoscope,
    Trash2,
    UserRound,
    X,
} from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

const EMPTY_FORM = {
    hospital_id: "",
    name: "",
    specialist: "",
    photo: "",
    availability: "available",
};

function toForm(doctor) {
    return {
        hospital_id: doctor?.hospital_id || "",
        name: doctor?.name || "",
        specialist: doctor?.specialist || "",
        photo: doctor?.photo || "",
        availability: doctor?.availability || "available",
    };
}

function DoctorModal({ doctor, hospitals, onClose, onSaved }) {
    const [form, setForm] = useState(() => doctor ? toForm(doctor) : EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const isEdit = Boolean(doctor?.id);

    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                ...form,
                hospital_id: Number(form.hospital_id),
                photo: form.photo || null,
            };

            if (isEdit) {
                await axios.put(`${API}/doctors/${doctor.id}`, payload, {
                    headers: { Authorization: `Bearer ${token()}` },
                });
            } else {
                await axios.post(`${API}/doctors`, payload, {
                    headers: { Authorization: `Bearer ${token()}` },
                });
            }

            onSaved();
        } catch (err) {
            const errors = err.response?.data?.errors;
            const firstError = errors ? Object.values(errors).flat()[0] : null;
            setError(firstError || err.response?.data?.message || "Gagal menyimpan dokter.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Dokter</p>
                        <h3 className="text-lg font-bold text-slate-900">{isEdit ? "Edit Dokter" : "Tambah Dokter"}</h3>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-5">
                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="md:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Rumah Sakit</span>
                            <select required value={form.hospital_id} onChange={(e) => set("hospital_id", e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                                <option value="">Pilih rumah sakit</option>
                                {hospitals.map((hospital) => (
                                    <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Nama Dokter</span>
                            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                                placeholder="Contoh: Dr. Siti Rahayu, Sp.A"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </label>

                        <label>
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Spesialis</span>
                            <input required value={form.specialist} onChange={(e) => set("specialist", e.target.value)}
                                placeholder="Contoh: Anak"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </label>

                        <label className="md:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-slate-600">Foto / URL Foto</span>
                            <input value={form.photo} onChange={(e) => set("photo", e.target.value)}
                                placeholder="Contoh: doctors/dr-siti.jpg atau https://..."
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <span className="mt-1 block text-[11px] text-slate-400">Opsional. Boleh dikosongkan jika belum ada foto.</span>
                        </label>
                    </div>

                    <div className="mt-4">
                        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.availability === "available"}
                                onChange={(e) => set("availability", e.target.checked ? "available" : "unavailable")}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600"
                            />
                            Aktif / tersedia untuk pengguna
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

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [availability, setAvailability] = useState("");
    const [hospitalId, setHospitalId] = useState("");
    const [page, setPage] = useState(1);
    const [modalDoctor, setModalDoctor] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [toast, setToast] = useState("");

    const fetchHospitals = async () => {
        const res = await axios.get(`${API}/hospitals`, {
            headers: { Authorization: `Bearer ${token()}` },
            params: { per_page: 300 },
        });
        setHospitals(res.data.data.data || []);
    };

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/doctors`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, availability, hospital_id: hospitalId, page, per_page: 12 },
            });
            setDoctors(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals().catch(console.error);
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [search, availability, hospitalId, page]);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    };

    const closeModal = () => {
        setShowCreate(false);
        setModalDoctor(null);
    };

    const handleSaved = () => {
        closeModal();
        showToast("Data dokter tersimpan.");
        fetchDoctors();
    };

    const toggleActive = async (doctor) => {
        const nextAvailability = doctor.availability === "available" ? "unavailable" : "available";
        setBusyId(doctor.id);
        try {
            await axios.put(`${API}/doctors/${doctor.id}`, { availability: nextAvailability }, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            setDoctors((items) => items.map((item) => item.id === doctor.id ? { ...item, availability: nextAvailability } : item));
            showToast(nextAvailability === "available" ? "Dokter diaktifkan." : "Dokter dinonaktifkan.");
        } catch (e) {
            console.error(e);
            showToast("Gagal mengubah status dokter.");
        } finally {
            setBusyId(null);
        }
    };

    const deleteDoctor = async (doctor) => {
        if (!window.confirm(`Hapus ${doctor.name}?`)) return;

        setBusyId(doctor.id);
        try {
            await axios.delete(`${API}/doctors/${doctor.id}`, {
                headers: { Authorization: `Bearer ${token()}` },
            });
            showToast("Dokter dihapus.");
            fetchDoctors();
        } catch (e) {
            console.error(e);
            showToast(e.response?.data?.message || "Gagal menghapus dokter.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-4">
            {toast && (
                <div className="fixed right-4 top-4 z-50 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-xl">{toast}</div>
            )}

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative min-w-48 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari dokter, spesialis, atau rumah sakit..."
                        className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <select value={hospitalId} onChange={(e) => { setHospitalId(e.target.value); setPage(1); }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Semua RS</option>
                    {hospitals.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                    ))}
                </select>
                <select value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1); }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Semua Status</option>
                    <option value="available">Aktif</option>
                    <option value="unavailable">Nonaktif</option>
                </select>
                <button onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Tambah Dokter
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
            ) : doctors.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-400">
                    Tidak ada dokter.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {doctors.map((doctor) => {
                        const isActive = doctor.availability === "available";
                        return (
                            <div key={doctor.id} className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${isActive ? "" : "opacity-70"}`}>
                                <div className="mb-4 flex items-start gap-3">
                                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                        <UserRound className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-base font-black text-slate-900">{doctor.name}</p>
                                        <p className="truncate text-sm text-slate-500">{doctor.specialist}</p>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                        {isActive ? "Aktif" : "Nonaktif"}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-slate-500">
                                    <div className="flex items-start gap-2">
                                        <Stethoscope className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                                        <span>{doctor.hospital?.name || "-"}</span>
                                    </div>
                                    {doctor.photo && (
                                        <p className="truncate text-xs text-slate-400">Foto: {doctor.photo}</p>
                                    )}
                                </div>

                                <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-3">
                                    <button onClick={() => toggleActive(doctor)} disabled={busyId === doctor.id}
                                        title={isActive ? "Nonaktifkan" : "Aktifkan"}
                                        className={`flex items-center justify-center rounded-xl p-2 ${isActive ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"} disabled:opacity-50`}>
                                        <Power className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setModalDoctor(doctor)}
                                        className="flex items-center justify-center rounded-xl bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => deleteDoctor(doctor)} disabled={busyId === doctor.id}
                                        className="flex items-center justify-center rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50">
                                        {busyId === doctor.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </button>
                                    <span className="flex items-center justify-center text-xs font-semibold text-slate-400">#{doctor.id}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {meta.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} dokter)</span>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50 disabled:opacity-40">Prev</button>
                        <button disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 hover:bg-slate-50 disabled:opacity-40">Next</button>
                    </div>
                </div>
            )}

            {(showCreate || modalDoctor) && (
                <DoctorModal doctor={modalDoctor} hospitals={hospitals} onClose={closeModal} onSaved={handleSaved} />
            )}
        </div>
    );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building2, MapPin, Phone, Calendar,
  Stethoscope, CheckCircle2, Loader2,
  AlertCircle, ChevronRight, BadgeCheck, ArrowLeft,
} from "lucide-react";

function generateQueueNumber() {
  const prefix = ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${prefix}${String(num).padStart(3, "0")}`;
}

function generateBarcode(hospitalId, queueNumber) {
  return `MFS-${hospitalId}-${queueNumber}-${Date.now().toString(36).toUpperCase()}`;
}

export default function PendaftaranRS({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("mefasafe_token");

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingHospital, setLoadingHospital] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [useInsurance, setUseInsurance] = useState(false);
  const [userPolicy, setUserPolicy] = useState(null);
  const [form, setForm] = useState({
    doctor_name: "",
    specialist: "",
    schedule_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  });

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    axios.get(`/api/v1/hospitals/${id}`, { headers })
      .then((r) => { if (r.data.success) setHospital(r.data.data); })
      .catch(() => setError("Rumah sakit tidak ditemukan."))
      .finally(() => setLoadingHospital(false));

    axios.get(`/api/v1/hospitals/${id}/doctors`, { headers })
      .then((r) => { if (r.data.success) setDoctors(r.data.data); })
      .catch(() => setDoctors([]))
      .finally(() => setLoadingDoctors(false));

    axios.get(`/api/v1/my-policies?user_id=${user?.id}`, { headers })
      .then((r) => {
        const active = (r.data.data || []).find((p) => p.status === "active");
        setUserPolicy(active || null);
      })
      .catch(() => {});
  }, [id]);

  const handleSelectDoctor = (doc) =>
    setForm((p) => ({ ...p, doctor_name: doc.name, specialist: doc.specialist }));

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.doctor_name) { setError("Pilih dokter terlebih dahulu."); return; }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    const queueNumber = generateQueueNumber();
    const barcodeData = generateBarcode(id, queueNumber);
    try {
      const res = await axios.post(
        "/api/v1/hospital-registrations",
        {
          user_id: user?.id,
          hospital_id: parseInt(id),
          insurance_policy_id: useInsurance && userPolicy ? userPolicy.id : null,
          hospital_name: hospital.name,
          doctor_name: form.doctor_name,
          schedule_date: form.schedule_date,
          queue_number: queueNumber,
          barcode_data: barcodeData,
          status: "registered",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessData({ ...res.data.data, queue_number: queueNumber, barcode_data: barcodeData });
      setStep(3);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
        "Terjadi kesalahan. Silakan coba lagi.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingHospital) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  );

  if (!hospital) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="text-slate-600 font-semibold">Rumah sakit tidak ditemukan</p>
      <button onClick={() => navigate("/daftarRS")} className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold">Kembali</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/70 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => step > 1 && step < 3 ? setStep(step - 1) : navigate("/daftarRS")}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900">Pendaftaran Pelayanan RS</h1>
            <p className="text-xs text-slate-500">{hospital.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">
        {/* Info RS */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-lg">{hospital.name}</p>
              {hospital.is_partner && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">✓ Mitra MefaSafe</span>}
            </div>
            <p className="text-sm opacity-90 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{hospital.address}, {hospital.city}</p>
            {hospital.phone && <p className="text-sm opacity-90 mt-0.5 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{hospital.phone}</p>}
          </div>
        </div>

        {/* Error global */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-5">
            {/* Pilih Dokter */}
            <div className="rounded-2xl bg-white/90 border border-slate-200/60 p-5 shadow-sm">
              <h2 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-500" />
                Pilih Dokter Spesialis
              </h2>
              {loadingDoctors ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Belum ada dokter terdaftar di RS ini
                </div>
              ) : (
                <div className="space-y-2">
                  {doctors.map((doc) => (
                    <button key={doc.id} type="button" onClick={() => handleSelectDoctor(doc)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        form.doctor_name === doc.name
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50"
                      }`}>
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.specialist}</p>
                      </div>
                      {form.doctor_name === doc.name && <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pilih Tanggal */}
            <div className="rounded-2xl bg-white/90 border border-slate-200/60 p-5 shadow-sm">
              <h2 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />Pilih Jadwal
              </h2>
              <input type="date" value={form.schedule_date}
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                onChange={(e) => setForm((p) => ({ ...p, schedule_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
            </div>

            {/* Asuransi */}
            <div className="rounded-2xl bg-white/90 border border-slate-200/60 p-5 shadow-sm">
              <h2 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-blue-500" />Gunakan Asuransi MefaSafe?
              </h2>
              {userPolicy ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-blue-800">{userPolicy.policy_number}</p>
                      <p className="text-xs text-blue-600">{userPolicy.insurance_type} — {userPolicy.insured_name}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">AKTIF</span>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setUseInsurance(!useInsurance)}
                      className={`w-11 h-6 rounded-full transition-all duration-300 relative ${useInsurance ? "bg-blue-500" : "bg-slate-300"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${useInsurance ? "left-6" : "left-1"}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {useInsurance ? "Menggunakan asuransi" : "Tidak menggunakan asuransi"}
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Belum ada polis aktif.
                  <button type="button" onClick={() => navigate("/health-service")} className="underline font-semibold">Beli polis</button>
                </div>
              )}
            </div>

            <button type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              Lanjut ke Konfirmasi <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ── STEP 2: Konfirmasi ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-white/90 border border-slate-200/60 p-5 shadow-sm">
              <h2 className="font-black text-slate-900 mb-4">Konfirmasi Pendaftaran</h2>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 divide-y divide-slate-100">
                {[
                  { label: "Rumah Sakit", value: hospital.name },
                  { label: "Dokter", value: form.doctor_name },
                  { label: "Spesialis", value: form.specialist },
                  { label: "Tanggal", value: new Date(form.schedule_date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
                  { label: "Asuransi", value: useInsurance && userPolicy ? userPolicy.policy_number : "Tidak menggunakan asuransi" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start px-4 py-3 gap-4">
                    <span className="text-sm text-slate-500 shrink-0">{label}</span>
                    <span className="text-sm font-bold text-slate-900 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <><CheckCircle2 className="w-4 h-4" /> Konfirmasi Pendaftaran</>}
            </button>
          </div>
        )}

        {/* ── STEP 3: Sukses ── */}
        {step === 3 && successData && (
          <div className="rounded-2xl bg-white/90 border border-slate-200/60 p-6 shadow-sm text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Pendaftaran Berhasil!</h2>
              <p className="text-slate-500 text-sm mt-1">Simpan nomor antrian Anda</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
              <p className="text-xs font-semibold opacity-80 uppercase tracking-wider mb-2">Nomor Antrian</p>
              <p className="text-5xl font-black tracking-widest">{successData.queue_number}</p>
              <p className="text-sm opacity-90 mt-3">{hospital.name}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(form.schedule_date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 divide-y divide-slate-100 text-left">
              {[
                { label: "Dokter", value: form.doctor_name },
                { label: "Spesialis", value: form.specialist },
                { label: "Barcode", value: successData.barcode_data },
                { label: "Status", value: "Terdaftar ✓" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-4 py-3 gap-4">
                  <span className="text-xs text-slate-500 shrink-0">{label}</span>
                  <span className="text-xs font-bold text-slate-900 text-right break-all">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/home")} className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all">
                Ke Beranda
              </button>
              <button onClick={() => navigate("/daftarRS")} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm hover:shadow-lg transition-all">
                Daftar RS Lain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

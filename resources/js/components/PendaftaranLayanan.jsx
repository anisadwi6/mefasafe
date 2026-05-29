import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Activity, Heart, Syringe, Shield, Home, Calendar, Clock,
  MapPin, CheckCircle2, Loader2, AlertCircle, ChevronRight,
  BadgeCheck, ArrowLeft, FileText, Sparkles, Phone, Building2
} from "lucide-react";
import PromoCodeInput from "./PromoCodeInput";

// Meta konfigurasi tampilan kategori (ikon & gradient)
const CATEGORY_META = {
  mcu: {
    description: "Evaluasi kesehatan menyeluruh untuk mendeteksi dini penyakit.",
    icon: Activity,
    gradient: "from-blue-500 to-cyan-500",
  },
  lab: {
    description: "Pemeriksaan sampel darah, urine, dan cairan tubuh untuk diagnosis akurat.",
    icon: Heart,
    gradient: "from-rose-500 to-pink-500",
  },
  vaksin: {
    description: "Pemberian vaksin untuk meningkatkan imun tubuh terhadap infeksi.",
    icon: Syringe,
    gradient: "from-emerald-500 to-teal-500",
  },
  terapi: {
    description: "Terapi fisik untuk memulihkan gerak, fungsi sendi, dan otot tubuh.",
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-500",
  },
  homecare: {
    description: "Layanan medis dan keperawatan profesional yang diberikan di rumah Anda.",
    icon: Home,
    gradient: "from-amber-500 to-orange-500",
  }
};

const TIME_SLOTS = [
  "08:00 - 10:00 WIB",
  "10:00 - 12:00 WIB",
  "13:00 - 15:00 WIB",
  "15:00 - 17:00 WIB"
];

function generateQueueNumber(category) {
  const prefix = category.toUpperCase().substring(0, 2);
  const num = Math.floor(Math.random() * 89) + 10; // 10-99
  return `${prefix}-${num}`;
}

function generateBarcode(serviceName, queueNumber) {
  const cleanName = serviceName.replace(/[^A-Z0-9]/ig, "").toUpperCase().substring(0, 4);
  return `MFS-SRV-${cleanName}-${queueNumber}-${Date.now().toString(36).toUpperCase()}`;
}

export default function PendaftaranLayanan({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("mefasafe_token");

  // State wizard
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pilihan form
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0] // Besok
  );
  const [scheduleTime, setScheduleTime] = useState("");
  const [notes, setNotes] = useState("");
  const [useInsurance, setUseInsurance] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Data master
  const [categories, setCategories] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [userPolicy, setUserPolicy] = useState(null);
  const [policyBalance, setPolicyBalance] = useState(null); // sisa saldo polis
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [successData, setSuccessData] = useState(null);

  // Fetch data dari database
  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch Layanan Kesehatan Dinamis
    axios.get("/api/v1/health-services", { headers })
      .then((res) => {
        if (res.data.success) {
          const rawServices = res.data.data;
          
          // Group by category
          const grouped = {};
          rawServices.forEach(s => {
            if (!grouped[s.category]) {
              const meta = CATEGORY_META[s.category] || {
                description: "Layanan pemeriksaan kesehatan.",
                icon: Activity,
                gradient: "from-slate-500 to-slate-600"
              };
              grouped[s.category] = {
                id: s.category,
                name: s.category_label,
                description: meta.description,
                icon: meta.icon,
                gradient: meta.gradient,
                services: []
              };
            }
            grouped[s.category].services.push({
              id: s.id, // ID database
              name: s.name,
              price: parseFloat(s.price),
              description: s.description
            });
          });
          
          setCategories(Object.values(grouped));
        }
      })
      .catch(() => setError("Gagal mengambil data layanan kesehatan dari database."))
      .finally(() => setLoadingServices(false));

    // Fetch Rumah Sakit Mitra
    axios.get("/api/v1/hospitals", { headers })
      .then((res) => {
        if (res.data.success) {
          setHospitals(res.data.data.filter(h => h.is_active));
        }
      })
      .catch(() => setError("Gagal mengambil data rumah sakit mitra."))
      .finally(() => setLoadingHospitals(false));

    // Fetch Polis Asuransi Aktif + Saldo
    if (user?.id) {
      axios.get(`/api/v1/my-policies?user_id=${user.id}`, { headers })
        .then((res) => {
          const active = (res.data.data || []).find((p) => p.status === "active");
          setUserPolicy(active || null);

          // Fetch saldo dari monitor
          if (active) {
            axios.get(`/api/v1/monitor/saldo-summary?user_id=${user.id}`, { headers })
              .then((r) => {
                if (r.data.success) {
                  // Cari saldo berdasarkan tipe polis yang aktif
                  const summary = r.data.data?.summary || [];
                  const match = summary.find(s => s.type === active.insurance_type);
                  setPolicyBalance(match ? match.remaining_balance : null);
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, [user?.id, token]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedService(null);
    setStep(2);
  };

  const handleSelectService = (srv) => {
    setSelectedService(srv);
    setStep(3);
  };

  const handleSelectHospital = (hosp) => {
    setSelectedHospital(hosp);
    setStep(4);
  };

  const handleSelectSchedule = (e) => {
    e.preventDefault();
    if (!scheduleTime) {
      setError("Pilih jam kunjungan terlebih dahulu.");
      return;
    }
    setError("");
    setStep(5);
  };

  const payAmount = appliedPromo?.final_amount ?? selectedService?.price ?? 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    const queueNum = generateQueueNumber(selectedCategory.id);
    const barcodeStr = generateBarcode(selectedService.name, queueNum);

    const payload = {
      user_id: user?.id,
      hospital_id: selectedHospital.id,
      insurance_policy_id: useInsurance && userPolicy ? userPolicy.id : null,
      health_service_id: selectedService.id, // database ID
      service_type: selectedCategory.id,
      service_name: selectedService.name,
      schedule_date: scheduleDate,
      schedule_time: scheduleTime,
      price: payAmount,
      ...(appliedPromo?.code ? { promo_code: appliedPromo.code } : promoCode.trim() ? { promo_code: promoCode.trim().toUpperCase() } : {}),
      queue_number: queueNum,
      barcode_data: barcodeStr,
      notes: notes,
      status: "registered"
    };

    try {
      const res = await axios.post(
        "/api/v1/service-registrations",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSuccessData(res.data.data);
        setStep(6);
      } else {
        setError(res.data.message || "Terjadi kesalahan.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
        "Gagal melakukan pendaftaran layanan.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 6) {
      setStep(step - 1);
      setError("");
    } else {
      navigate("/home");
    }
  };

  const formatRupiah = (num) =>
    "Rp " + Number(num).toLocaleString("id-ID");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/70 animate-fadeIn">
      {/* Header Sticky */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-4 sticky top-[72px] z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBack}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">Pendaftaran Layanan Kesehatan</h1>
              <p className="text-xs text-slate-500">
                {step === 1 && "Langkah 1: Pilih Kategori Layanan"}
                {step === 2 && `Langkah 2: Pilih Layanan ${selectedCategory?.name}`}
                {step === 3 && "Langkah 3: Pilih Rumah Sakit / Klinik Rekanan"}
                {step === 4 && "Langkah 4: Pilih Jadwal Pertemuan"}
                {step === 5 && "Langkah 5: Konfirmasi Pendaftaran"}
                {step === 6 && "Pendaftaran Berhasil"}
              </p>
            </div>
          </div>
          {step < 6 && (
            <span className="text-xs font-bold text-slate-400">
              Langkah {step} dari 5
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">
        {/* Progress Bar Top */}
        {step < 6 && (
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── STEP 1: PILIH KATEGORI LAYANAN ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-1">
              <h2 className="text-xl font-bold text-slate-900">Pilih Layanan Utama</h2>
              <p className="text-sm text-slate-500">Pilih kategori layanan kesehatan yang Anda inginkan saat ini.</p>
            </div>

            {loadingServices ? (
              <div className="flex flex-col justify-center items-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-xs text-slate-400 font-semibold">Mengambil daftar layanan dari database...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200/60 rounded-2xl text-slate-400 text-sm">
                Belum ada data layanan kesehatan di database.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {categories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat)}
                      className="w-full bg-white/95 border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4 text-left transition-all duration-300 hover:shadow-xl hover:border-blue-200 group relative overflow-hidden"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-bold text-slate-900 text-base">{cat.name}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: PILIH DETAIL LAYANAN ── */}
        {step === 2 && selectedCategory && (
          <div className="space-y-4">
            <div className="p-1 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pilih Paket Layanan</h2>
                <p className="text-sm text-slate-500">Tentukan paket pemeriksaan atau tindakan yang Anda perlukan.</p>
              </div>
              <button onClick={() => setStep(1)} className="text-xs font-bold text-blue-500 hover:underline">
                Ubah Kategori
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {selectedCategory.services.map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => handleSelectService(srv)}
                  className="w-full bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left transition-all duration-300 hover:shadow-xl hover:border-blue-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">{srv.name}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{srv.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <span className="font-black text-indigo-600 text-lg">{formatRupiah(srv.price)}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: PILIH FASILITAS KESEHATAN ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-1 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pilih Lokasi & Mitra</h2>
                <p className="text-sm text-slate-500">Pilih Rumah Sakit atau Klinik rekanan MefaSafe terdekat.</p>
              </div>
              <button onClick={() => setStep(2)} className="text-xs font-bold text-blue-500 hover:underline">
                Ubah Layanan
              </button>
            </div>

            {loadingHospitals ? (
              <div className="flex flex-col justify-center items-center py-16 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-xs text-slate-400 font-semibold">Mengambil daftar faskes mitra...</p>
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200/60 rounded-2xl text-slate-400 text-sm">
                <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                Belum ada Rumah Sakit rekanan terdaftar.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {hospitals.map((hosp) => (
                  <button
                    key={hosp.id}
                    onClick={() => handleSelectHospital(hosp)}
                    className="w-full bg-white border border-slate-200/60 p-5 rounded-2xl flex items-start gap-4 text-left transition-all duration-300 hover:shadow-xl hover:border-blue-200 group relative"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm leading-snug">{hosp.name}</p>
                        {hosp.is_partner && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">✓ Mitra MefaSafe</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {hosp.address}, {hosp.city}
                      </p>
                      {hosp.phone && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {hosp.phone}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 absolute right-5 top-[50%] -translate-y-1/2 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: PILIH TANGGAL & WAKTU ── */}
        {step === 4 && (
          <form onSubmit={handleSelectSchedule} className="space-y-5">
            <div className="p-1">
              <h2 className="text-xl font-bold text-slate-900">Pilih Tanggal & Waktu</h2>
              <p className="text-sm text-slate-500">Tentukan jadwal kedatangan Anda untuk mendapatkan layanan.</p>
            </div>

            {/* Input Tanggal */}
            <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm space-y-3">
              <label className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Pilih Tanggal Kunjungan
              </label>
              <input
                type="date"
                value={scheduleDate}
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                required
              />
            </div>

            {/* Slot Waktu */}
            <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm space-y-3">
              <label className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Pilih Jam / Slot Waktu
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setScheduleTime(slot)}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold text-xs transition-all duration-200 text-center ${
                      scheduleTime === slot
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 bg-white hover:border-blue-200"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Catatan / Keluhan */}
            <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm space-y-3">
              <label className="font-bold text-slate-900 text-sm">
                Catatan Opsional / Keluhan Singkat
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis keluhan atau kebutuhan khusus Anda di sini (misal: perlu kursi roda, puasa mulai jam 10 malam, dll)..."
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              Lanjut ke Pembayaran & Konfirmasi <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ── STEP 5: KONFIRMASI & PEMBAYARAN ── */}
        {step === 5 && selectedCategory && selectedService && selectedHospital && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-1">
              <h2 className="text-xl font-bold text-slate-900">Pembayaran & Konfirmasi</h2>
              <p className="text-sm text-slate-500">Tinjau kembali pendaftaran Anda dan pilih metode penjaminan.</p>
            </div>

            {/* Card Summary */}
            <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">Ringkasan Layanan</h3>
              
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between py-2.5 text-sm">
                  <span className="text-slate-500">Kategori</span>
                  <span className="font-bold text-slate-800">{selectedCategory.name}</span>
                </div>
                <div className="flex justify-between py-2.5 text-sm">
                  <span className="text-slate-500">Paket Layanan</span>
                  <span className="font-bold text-slate-800">{selectedService.name}</span>
                </div>
                <div className="flex justify-between py-2.5 text-sm">
                  <span className="text-slate-500">Fasilitas Kesehatan</span>
                  <span className="font-bold text-slate-800 text-right">{selectedHospital.name}</span>
                </div>
                <div className="flex justify-between py-2.5 text-sm">
                  <span className="text-slate-500">Alamat</span>
                  <span className="text-slate-400 text-xs text-right max-w-[200px] leading-relaxed">{selectedHospital.address}</span>
                </div>
                <div className="flex justify-between py-2.5 text-sm">
                  <span className="text-slate-500">Tanggal Kunjungan</span>
                  <span className="font-bold text-slate-800">
                    {new Date(scheduleDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 text-sm">
                  <span className="text-slate-500">Jam Kunjungan</span>
                  <span className="font-bold text-slate-800">{scheduleTime}</span>
                </div>
                {notes && (
                  <div className="flex justify-between py-2.5 text-sm">
                    <span className="text-slate-500">Catatan</span>
                    <span className="text-slate-600 text-xs italic max-w-[200px] text-right">{notes}</span>
                  </div>
                )}
                {appliedPromo && (
                  <>
                    <div className="flex justify-between py-2.5 text-sm">
                      <span className="text-slate-500">Harga Awal</span>
                      <span className="text-slate-600 line-through">{formatRupiah(selectedService.price)}</span>
                    </div>
                    <div className="flex justify-between py-2.5 text-sm">
                      <span className="text-slate-500">Diskon Promo ({appliedPromo.discount_percent}%)</span>
                      <span className="font-bold text-emerald-600">- {formatRupiah(appliedPromo.discount_amount)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-3 text-base font-black">
                  <span className="text-slate-900">Total Biaya</span>
                  <span className="text-indigo-600">{formatRupiah(payAmount)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm">
              <PromoCodeInput
                userId={user?.id}
                feature="service_registration"
                amount={Number(selectedService.price)}
                value={promoCode}
                onChange={setPromoCode}
                onApplied={setAppliedPromo}
                label="Kode Promo (opsional)"
              />
            </div>

            {/* Toggles Asuransi */}
            <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-blue-500" />
                Gunakan Asuransi MefaSafe?
              </h3>

              {userPolicy ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-blue-800 truncate">{userPolicy.policy_number}</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        {userPolicy.insurance_type} — {userPolicy.insured_name}
                      </p>
                      {/* Saldo info */}
                      {policyBalance !== null && (
                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-slate-500">
                            Saldo tersedia:{" "}
                            <span className="font-bold text-emerald-600">
                              {formatRupiah(policyBalance)}
                            </span>
                          </span>
                          {useInsurance && selectedService && (
                            <>
                              <span className="text-slate-300">→</span>
                              <span className="text-xs text-slate-500">
                                Setelah digunakan:{" "}
                                <span className={`font-bold ${policyBalance - payAmount < 0 ? "text-red-500" : "text-blue-600"}`}>
                                  {formatRupiah(Math.max(0, policyBalance - payAmount))}
                                </span>
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 shrink-0">
                      POLIS AKTIF
                    </span>
                  </div>

                  {/* Peringatan saldo tidak cukup */}
                  {useInsurance && selectedService && policyBalance !== null && policyBalance < payAmount && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        Saldo asuransi tidak mencukupi. Kekurangan:{" "}
                        <strong>{formatRupiah(payAmount - policyBalance)}</strong>.
                        Silakan bayar mandiri atau isi ulang polis.
                      </span>
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setUseInsurance(!useInsurance)}
                      className={`w-11 h-6 rounded-full transition-all duration-300 relative shrink-0 ${
                        useInsurance ? "bg-blue-500" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                          useInsurance ? "left-6" : "left-1"
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {useInsurance ? "Biaya dicover asuransi MefaSafe" : "Bayar mandiri di tempat / kasir faskes"}
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-4 rounded-xl leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    Anda belum memiliki polis asuransi MefaSafe yang aktif. Pendaftaran ini akan menggunakan metode pembayaran **Mandiri (Bayar di Kasir RS)**.
                    <button
                      type="button"
                      onClick={() => navigate("/health-service")}
                      className="underline font-bold text-amber-900 block mt-1 hover:text-amber-950"
                    >
                      Ajukan pembelian polis asuransi &raquo;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses Pendaftaran...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi & Kirim Pendaftaran
                </>
              )}
            </button>
          </div>
        )}

        {/* ── STEP 6: SUKSES ── */}
        {step === 6 && successData && (
          <div className="rounded-2xl bg-white border border-slate-200/60 p-6 shadow-xl text-center space-y-5 animate-scaleUp">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">Registrasi Layanan Berhasil!</h2>
              <p className="text-slate-500 text-sm mt-1">Tunjukkan nomor antrian atau barcode ini ke resepsionis/kasir faskes.</p>
            </div>

            {/* Queue Card */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-md relative overflow-hidden">
              {/* background pattern */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />

              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1.5">Nomor Antrian Kunjungan</p>
              <p className="text-5xl font-black tracking-widest">{successData.queue_number}</p>
              
              <div className="border-t border-white/20 mt-4 pt-3 text-left space-y-1">
                <p className="text-sm font-bold truncate">{successData.service_name}</p>
                <p className="text-xs opacity-90 truncate">{selectedHospital?.name}</p>
                <p className="text-xs opacity-75 mt-2">
                  Jadwal: {new Date(scheduleDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} | {scheduleTime}
                </p>
              </div>
            </div>

            {/* Detail Details */}
            <div className="rounded-2xl bg-slate-50 border border-slate-100 divide-y divide-slate-100 text-left">
              {[
                { label: "Nama Pasien", value: user?.name || "Pasien MefaSafe" },
                { label: "Nomor Barcode", value: successData.barcode_data },
                { label: "Penjaminan", value: useInsurance && userPolicy ? `Asuransi (${userPolicy.policy_number})` : "Mandiri (Bayar di Kasir)" },
                { label: "Status Registrasi", value: "Terdaftar ✓" }
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between px-4 py-3 gap-4">
                  <span className="text-xs text-slate-500 shrink-0">{label}</span>
                  <span className="text-xs font-bold text-slate-950 text-right break-all">{value}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/riwayat?filter=all")}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:shadow-sm transition-all"
              >
                Lihat di Riwayat
              </button>
              <button
                onClick={() => navigate("/home")}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm hover:shadow-lg transition-all"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

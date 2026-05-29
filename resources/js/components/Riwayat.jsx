import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Building2, CreditCard, FileText, Clock,
  CheckCircle2, XCircle, AlertCircle, Loader2,
  QrCode, ChevronDown, ChevronUp, Filter, Shield,
} from "lucide-react";

const TYPE_CONFIG = {
  registration: {
    icon: Building2,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    label: "Pendaftaran RS",
  },
  service_registration: {
    icon: FileText,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    label: "Pendaftaran Layanan",
  },
  transaction: {
    icon: CreditCard,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    label: "Transaksi",
  },
};

const STATUS_CONFIG = {
  registered:  { color: "bg-blue-100 text-blue-700",   icon: CheckCircle2 },
  canceled:    { color: "bg-red-100 text-red-700",     icon: XCircle },
  success:     { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  failed:      { color: "bg-red-100 text-red-700",     icon: XCircle },
  pending:     { color: "bg-amber-100 text-amber-700", icon: Clock },
  approved:    { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected:    { color: "bg-red-100 text-red-700",     icon: XCircle },
  partial:     { color: "bg-blue-100 text-blue-700",   icon: AlertCircle },
  verified:    { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  inactive:    { color: "bg-slate-100 text-slate-700", icon: Clock },
  active:      { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

export default function Riwayat({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const token = localStorage.getItem("mefasafe_token");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          `/api/v1/riwayat?user_id=${user?.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) setItems(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetch();
  }, [user?.id, token]);

  const [cancelLoading, setCancelLoading] = useState(null); // id yang sedang dicancel

  const handleCancel = async (type, id) => {
    const endpoint = type === "registration" ? "hospital-registrations" : "service-registrations";
    const confirmCancel = window.confirm("Apakah Anda yakin ingin membatalkan pendaftaran ini?");
    if (!confirmCancel) return;

    setCancelLoading(id);
    try {
      const res = await axios.put(
        `/api/v1/${endpoint}/${id}`,
        { status: "canceled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success || res.status === 200) {
        const msg = res.data.message || "Pendaftaran berhasil dibatalkan.";
        alert(msg);
        const refreshRes = await axios.get(
          `/api/v1/riwayat?user_id=${user?.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (refreshRes.data.success) setItems(refreshRes.data.data);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || "Gagal membatalkan pendaftaran.";
      alert(msg);
    } finally {
      setCancelLoading(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedFilter = params.get("filter");
    const validFilters = ["all", "registration", "service_registration", "transaction"];
    if (requestedFilter && validFilters.includes(requestedFilter)) {
      setFilter(requestedFilter);
    }
  }, [location.search]);

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  const counts = {
    all: items.length,
    registration: items.filter((i) => i.type === "registration").length,
    service_registration: items.filter((i) => i.type === "service_registration").length,
    transaction: items.filter((i) => i.type === "transaction").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/70 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            Riwayat Aktivitas
          </h1>
          <p className="text-sm text-slate-500 mt-1">Semua riwayat pendaftaran dan transaksi Anda</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "Semua" },
            { key: "registration", label: "Pendaftaran RS" },
            { key: "service_registration", label: "Pendaftaran Layanan" },
            { key: "transaction", label: "Transaksi" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                filter === key
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
              }`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                filter === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">Belum ada riwayat</p>
            <p className="text-sm mt-1">Aktivitas Anda akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const cfg = TYPE_CONFIG[item.type];
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              const StatusIcon = statusCfg.icon;
              const isExpanded = expandedId === `${item.type}-${item.id}`;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm overflow-hidden transition-all duration-300"
                >
                  {/* Row utama */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : `${item.type}-${item.id}`)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-slate-900">{item.title}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {item.status_label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{item.subtitle}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.date}</p>
                    </div>

                    {/* Expand icon */}
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    }
                  </button>

                  {/* Detail expanded */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 space-y-3">
                      <p className="text-sm text-slate-600">{item.detail}</p>

                      {/* Nomor antrian & barcode khusus pendaftaran RS & Layanan */}
                      {(item.type === "registration" || item.type === "service_registration") && item.queue_number && (
                        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wider mb-1">Nomor Antrian</p>
                              <p className="text-3xl font-black tracking-widest">{item.queue_number}</p>
                            </div>
                            <div className="text-right">
                              <QrCode className="w-10 h-10 opacity-60 ml-auto mb-1" />
                              <p className="text-[9px] opacity-70 font-mono break-all max-w-[140px]">{item.barcode}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tombol Batal — hanya untuk service_registration dengan logika waktu */}
                      {item.type === "service_registration" && item.status === "registered" && (() => {
                        const minutesLeft = Math.max(0, 60 - (item.minutes_since_created ?? 60));
                        const canCancel = item.can_cancel;

                        return (
                          <div className="pt-2 space-y-2">
                            {canCancel ? (
                              <>
                                {/* Info waktu tersisa */}
                                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  <span>
                                    Batas pembatalan:{" "}
                                    <strong>
                                      {minutesLeft > 0
                                        ? `${minutesLeft} menit lagi`
                                        : "kurang dari 1 menit"}
                                    </strong>
                                    {item.uses_insurance && " · Saldo asuransi akan dikembalikan"}
                                  </span>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleCancel(item.type, item.id)}
                                    disabled={cancelLoading === item.id}
                                    className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
                                  >
                                    {cancelLoading === item.id ? (
                                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Membatalkan...</>
                                    ) : (
                                      <><XCircle className="w-3.5 h-3.5" /> Batalkan Pendaftaran</>
                                    )}
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                                <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                <span>
                                  Tidak dapat dibatalkan — batas waktu 1 jam telah terlewati.
                                  {item.uses_insurance && " Saldo asuransi tidak dapat dikembalikan."}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Tombol Batal untuk pendaftaran RS biasa */}
                      {item.type === "registration" && item.status === "registered" && (
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleCancel(item.type, item.id)}
                            disabled={cancelLoading === item.id}
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {cancelLoading === item.id ? (
                              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Membatalkan...</>
                            ) : (
                              <><XCircle className="w-3.5 h-3.5" /> Batalkan Pendaftaran</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";
import { Shield, Loader2, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_META = {
  pending: { label: "Menunggu Verifikasi", style: "bg-amber-100 text-amber-700", icon: Clock },
  verified: { label: "Terverifikasi", style: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Ditolak", style: "bg-red-100 text-red-700", icon: XCircle },
  active: { label: "Aktif", style: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  inactive: { label: "Tidak Aktif", style: "bg-slate-100 text-slate-700", icon: Clock },
};

const TYPE_LABEL = {
  jiwa: "Asuransi Jiwa",
  kesehatan: "Asuransi Kesehatan",
  kendaraan: "Asuransi Kendaraan",
};

export default function Asuransi({ user }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("mefasafe_token");

  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/v1/my-policies", {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: user?.id },
        });

        if (res.data?.data) {
          setPolicies(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setError("Tidak dapat mengambil riwayat asuransi. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchPolicies();
    } else {
      setLoading(false);
    }
  }, [user?.id, token]);

  const getStatusMeta = (policy) => {
    if (policy.payment_status) {
      return STATUS_META[policy.payment_status] || STATUS_META.pending;
    }
    return policy.status === "active" ? STATUS_META.active : STATUS_META.inactive;
  };

  const formatRupiah = (value) => {
    if (value == null) return "-";
    return `Rp ${Number(value).toLocaleString("id-ID")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/70 animate-fadeIn">
      <div className="bg-white/85 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Halaman Asuransi</h1>
              <p className="text-sm text-slate-500">Riwayat paket asuransi dan status polis Anda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
            {error}
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Shield className="w-14 h-14 mx-auto mb-4 opacity-40" />
            <p className="font-semibold">Belum ada riwayat asuransi</p>
            <p className="text-sm mt-1">Anda belum memiliki polis aktif atau riwayat pembelian polis.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => {
              const status = getStatusMeta(policy);
              const isExpanded = expandedId === policy.id;
              const StatusIcon = status.icon;

              return (
                <div key={policy.id} className="rounded-3xl border border-slate-200 bg-white/95 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : policy.id)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-lg font-semibold text-slate-900">{TYPE_LABEL[policy.insurance_type] || "Asuransi"}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${status.style}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">Polis: {policy.policy_number}</p>
                      <p className="text-xs text-slate-400 mt-1">Dibuat: {new Date(policy.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Nomor Polis</p>
                          <p className="text-sm font-bold text-slate-900">{policy.policy_number}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Jenis Polis</p>
                          <p className="text-sm font-bold text-slate-900">{TYPE_LABEL[policy.insurance_type] || policy.insurance_type}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Premi</p>
                          <p className="text-sm font-bold text-slate-900">{formatRupiah(policy.premium_amount)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Limit Coverage</p>
                          <p className="text-sm font-bold text-slate-900">{formatRupiah(policy.coverage_limit)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Periode</p>
                          <p className="text-sm font-bold text-slate-900">{policy.start_date || "-"} - {policy.end_date || "-"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Metode Pembayaran</p>
                          <p className="text-sm font-bold text-slate-900">{policy.payment_method || "Belum dipilih"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status Pembayaran</p>
                          <p className="text-sm font-bold text-slate-900">{policy.payment_status ? (STATUS_META[policy.payment_status]?.label || policy.payment_status) : "-"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status Polis</p>
                          <p className="text-sm font-bold text-slate-900">{policy.status === "active" ? "Aktif" : "Tidak Aktif"}</p>
                        </div>
                      </div>
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

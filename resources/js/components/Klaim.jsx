import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { FileText, Loader2, CheckCircle2, XCircle, AlertCircle, Plus, UploadCloud, X } from "lucide-react";

const STATUS_CONFIG = {
  pending: { color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  approved: { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { color: "bg-red-100 text-red-700", icon: XCircle },
  partial: { color: "bg-blue-100 text-blue-700", icon: AlertCircle },
};

export default function Klaim({ user }) {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    insurance_policy_id: "",
    claim_amount: "",
    description: "",
    document: null,
  });

  const token = localStorage.getItem("mefasafe_token") || localStorage.getItem("token");

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [claimsRes, policiesRes] = await Promise.all([
        axios.get(`/api/v1/claims`, {
          params: { user_id: user.id },
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/v1/my-policies`, {
          params: { user_id: user.id },
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      if (claimsRes.data?.data) setClaims(claimsRes.data.data);
      if (policiesRes.data?.data) setPolicies(policiesRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, token]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, document: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.insurance_policy_id || !formData.claim_amount || !formData.description || !formData.document) {
      alert("Harap lengkapi semua field dan unggah dokumen.");
      return;
    }

    const selectedPolicy = policies.find(p => p.id == formData.insurance_policy_id);
    if (selectedPolicy && Number(formData.claim_amount) > Number(selectedPolicy.remaining_limit)) {
      alert(`Nominal klaim tidak boleh melebihi sisa saldo (Rp ${Number(selectedPolicy.remaining_limit).toLocaleString('id-ID')}).`);
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("user_id", user.id);
      data.append("insurance_policy_id", formData.insurance_policy_id);
      data.append("claim_amount", formData.claim_amount);
      data.append("description", formData.description);
      data.append("document", formData.document);

      await axios.post("/api/v1/claims", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Reset and close
      setFormData({ insurance_policy_id: "", claim_amount: "", description: "", document: null });
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengajukan klaim.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-500" />
              Klaim Saya
            </h1>
            <p className="text-sm text-slate-500 mt-1">Daftar pengajuan klaim Anda dan status verifikasinya</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajukan Klaim
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-semibold text-slate-600">Belum ada pengajuan klaim</p>
              <p className="text-sm mt-1">Ajukan klaim jika Anda butuh penggantian biaya</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition shadow-md"
              >
                Buat Pengajuan Baru
              </button>
            </div>
          ) : (
            claims.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;

              return (
                <div key={c.id} className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">Pengajuan Klaim</p>
                        <p className="text-sm font-semibold text-slate-600 mt-0.5">Rp {Number(c.claim_amount).toLocaleString('id-ID')}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(c.created_at).toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase tracking-wide">{c.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100">
                    <p className="font-medium text-slate-900 mb-1">Keterangan:</p>
                    {c.description}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Pengajuan Klaim */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">Form Pengajuan Klaim</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Polis Asuransi</label>
                <select 
                  required
                  value={formData.insurance_policy_id}
                  onChange={(e) => setFormData({...formData, insurance_policy_id: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                >
                  <option value="">-- Pilih Polis --</option>
                  {policies.map(p => (
                    <option key={p.id} value={p.id}>{p.policy_number} - {p.insurance_type}</option>
                  ))}
                </select>
                {formData.insurance_policy_id && (() => {
                  const selectedPolicy = policies.find(p => p.id == formData.insurance_policy_id);
                  return selectedPolicy ? (
                    <p className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Saldo Limit Tersedia: Rp {Number(selectedPolicy.remaining_limit).toLocaleString('id-ID')}
                    </p>
                  ) : null;
                })()}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nominal Klaim (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 text-sm font-medium">Rp</span>
                  <input 
                    type="number"
                    required
                    min="0"
                    max={formData.insurance_policy_id ? policies.find(p => p.id == formData.insurance_policy_id)?.remaining_limit : undefined}
                    placeholder="Contoh: 1500000"
                    value={formData.claim_amount}
                    onChange={(e) => setFormData({...formData, claim_amount: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Keterangan / Diagnosa</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Jelaskan alasan pengobatan / diagnosis dokter..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bukti Kuitansi / Medis</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-orange-300 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 font-medium">
                      {formData.document ? formData.document.name : "Klik untuk upload dokumen"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, atau PDF (Maks. 4MB)</p>
                  </div>
                  <input type="file" required accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Pengajuan Klaim"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

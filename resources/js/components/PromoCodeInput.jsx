import { useState } from "react";
import axios from "axios";
import { CheckCircle2, Loader2, Tag, X } from "lucide-react";

const formatRupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

export default function PromoCodeInput({
  userId,
  feature,
  amount,
  value,
  onChange,
  onApplied,
  label = "Kode Promo",
  className = "",
}) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(null);

  const applyCode = async () => {
    const code = (value || "").trim().toUpperCase();
    if (!code) {
      setError("Masukkan kode promo terlebih dahulu.");
      setApplied(null);
      onApplied?.(null);
      return;
    }

    setChecking(true);
    setError("");

    try {
      const res = await axios.post("/api/v1/promo-codes/validate", {
        user_id: userId,
        code,
        feature,
        amount,
      });

      const result = res.data.data;
      setApplied(result);
      onApplied?.(result);
    } catch (err) {
      setApplied(null);
      onApplied?.(null);
      setError(err.response?.data?.message || "Kode promo tidak valid.");
    } finally {
      setChecking(false);
    }
  };

  const clearCode = () => {
    onChange?.("");
    setApplied(null);
    setError("");
    onApplied?.(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value.toUpperCase());
            if (applied) {
              setApplied(null);
              onApplied?.(null);
            }
            setError("");
          }}
          placeholder="Contoh: MEFA10"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {applied ? (
          <button
            type="button"
            onClick={clearCode}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" /> Hapus
          </button>
        ) : (
          <button
            type="button"
            onClick={applyCode}
            disabled={checking || !userId}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
            Terapkan
          </button>
        )}
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      {applied && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            Kode {applied.code} aktif — diskon {applied.discount_percent}%
          </div>
          <p className="mt-1">
            Potongan {formatRupiah(applied.discount_amount)} · Total bayar {formatRupiah(applied.final_amount)}
          </p>
        </div>
      )}
    </div>
  );
}

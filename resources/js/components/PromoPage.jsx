import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BannerCarousel from "./BannerCarousel";
import { ArrowLeft, CheckCircle2, Copy, Gift, Loader2, Share2, TicketPercent, UserPlus, Users } from "lucide-react";

export default function PromoPage({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  const fetchReferral = async () => {
    try {
      const token = localStorage.getItem("mefasafe_token");
      const res = await axios.get("/api/v1/referrals/me", {
        headers: { Authorization: `Bearer ${token}` },
        params: { user_id: user?.id },
      });
      setData(res.data.data);
    } catch (error) {
      console.error("Referral fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferral();
    axios.get("/api/v1/banners/active")
      .then((res) => setBanners(res.data?.data || []))
      .catch(() => setBanners([]));
  }, [user?.id]);

  const openLink = (url) => {
    if (!url) return;
    if (/^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(url);
  };

  const applyReferralCode = async (event) => {
    event.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      setApplyError("Masukkan kode referral teman Anda.");
      return;
    }

    setApplying(true);
    setApplyError("");
    setApplySuccess("");

    try {
      const token = localStorage.getItem("mefasafe_token");
      const res = await axios.post(
        "/api/v1/referrals/apply",
        { referral_code: code, user_id: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplySuccess(res.data.message || "Kode referral berhasil digunakan.");
      setInputCode("");
      await fetchReferral();
    } catch (error) {
      setApplyError(error.response?.data?.message || "Gagal menggunakan kode referral.");
    } finally {
      setApplying(false);
    }
  };

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-500">Promo belum tersedia.</div>;
  }

  const progress = Math.min(100, Math.round((data.referral_count / data.required_referrals) * 100));
  const couponReady = data.referral_count >= data.required_referrals && data.coupon;
  const inviteText = `Pakai kode undangan MefaSafe saya: ${data.referral_code}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl">
          <div className="p-8 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
              <Gift className="w-4 h-4" />
              Program Referral
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-black">Ajak teman, dapatkan kode diskon {data.discount_percent}%</h1>
            <p className="mt-3 max-w-2xl text-white/85">
              Bagikan kode undangan Anda. Setelah {data.required_referrals} pengguna mendaftar memakai kode ini, kode diskon {data.discount_percent}% akan aktif untuk transaksi Anda.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-slate-900">Punya Kode Referral Teman?</h2>
              <p className="mt-1 text-sm text-slate-600">
                Masukkan kode undangan dari teman Anda. Setiap kode hanya bisa dipakai sekali per akun.
              </p>
            </div>
          </div>

          {data.applied_referral ? (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
              <p className="text-sm font-bold text-green-800">Kode referral sudah terpakai</p>
              <p className="mt-1 text-sm text-green-700">
                Anda mendaftar memakai kode <span className="font-black tracking-wider">{data.applied_referral.referral_code}</span>
                {data.applied_referral.referrer_name ? ` dari ${data.applied_referral.referrer_name}` : ""}.
              </p>
            </div>
          ) : (
            <form onSubmit={applyReferralCode} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start">
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Contoh: PENGGUNA0001"
                className="flex-1 rounded-2xl border border-slate-200 px-5 py-4 text-lg font-bold tracking-widest text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={applying}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 font-bold text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {applying ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                Gunakan Kode
              </button>
            </form>
          )}

          {applyError && <p className="mt-3 text-sm font-semibold text-red-600">{applyError}</p>}
          {applySuccess && !data.applied_referral && (
            <p className="mt-3 text-sm font-semibold text-green-600">{applySuccess}</p>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Kode Undangan Anda</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-3xl font-black tracking-widest text-blue-700">
                {data.referral_code}
              </div>
              <button onClick={() => copy(data.referral_code, "kode")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white hover:bg-blue-700">
                <Copy className="w-5 h-5" />
                Salin
              </button>
            </div>
            <button onClick={() => copy(inviteText, "pesan")} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <Share2 className="w-4 h-4" />
              Salin Pesan Undangan
            </button>
            {copied && <p className="mt-2 text-sm font-semibold text-green-600">Berhasil menyalin {copied}.</p>}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Progress Undangan</p>
                <p className="text-xs text-slate-500">{data.referral_count} dari {data.required_referrals} pengguna</p>
              </div>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {data.remaining_referrals > 0
                ? `Butuh ${data.remaining_referrals} pendaftaran lagi untuk membuka diskon.`
                : "Target terpenuhi. Kode diskon sudah aktif."}
            </p>
          </section>
        </div>

        <section className={`rounded-3xl border p-6 shadow-sm ${couponReady ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${couponReady ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                {couponReady ? <CheckCircle2 className="w-6 h-6" /> : <TicketPercent className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Kode Diskon {data.discount_percent}%</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {couponReady ? `Gunakan kode ini saat transaksi untuk potongan ${data.discount_percent}%.` : "Kode diskon akan muncul setelah target undangan terpenuhi."}
                </p>
              </div>
            </div>
            {couponReady && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="rounded-2xl border border-green-200 bg-white px-5 py-3 text-xl font-black tracking-wider text-green-700">
                  {data.coupon.code}
                </div>
                <button onClick={() => copy(data.coupon.code, "kupon")} className="rounded-2xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700">
                  Salin Kupon
                </button>
              </div>
            )}
          </div>
        </section>

        {banners.length > 0 && <BannerCarousel banners={banners} onNavigate={openLink} />}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-black text-slate-900">Riwayat pengguna yang memakai kode Anda</h3>
          <div className="mt-4 divide-y divide-slate-100">
            {data.referrals.length === 0 ? (
              <p className="py-6 text-sm text-slate-400">Belum ada pengguna yang memakai kode undangan Anda.</p>
            ) : data.referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-bold text-slate-800">{ref.referred_user?.name || "-"}</p>
                  <p className="text-xs text-slate-500">{ref.referred_user?.email || "-"}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(ref.created_at).toLocaleDateString("id-ID")}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

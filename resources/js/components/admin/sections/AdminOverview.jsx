import { useEffect, useState } from "react";
import axios from "axios";
import {
    Users,
    Shield,
    FileText,
    CreditCard,
    Hospital,
    Stethoscope,
    Star,
    TrendingUp,
    TrendingDown,
    Loader2,
    Clock,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed"];

function Panel({ title, subtitle, children, className = "" }) {
    return (
        <section className={`rounded-[1.35rem] border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/70 ${className}`}>
            <div className="mb-4">
                <h3 className="text-sm font-black tracking-tight text-slate-950">{title}</h3>
                {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
            </div>
            {children}
        </section>
    );
}

export default function AdminOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/stats`, { headers: { Authorization: `Bearer ${token()}` } })
            .then((r) => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );

    if (!data) return <p className="text-red-500">Gagal memuat data.</p>;

    const statCards = [
        { label: "Total Pengguna", value: data.total_users, icon: Users, color: "blue", sub: "Pengguna aktif" },
        { label: "Total Polis", value: data.total_policies, icon: Shield, color: "indigo", sub: `${data.active_policies} aktif` },
        { label: "Total Klaim", value: data.total_claims, icon: FileText, color: "amber", sub: `${data.pending_claims} pending` },
        { label: "Total Transaksi", value: data.total_transactions, icon: CreditCard, color: "green", sub: "Semua transaksi" },
        { label: "Pendapatan Premi", value: fmt(data.total_revenue), icon: TrendingUp, color: "emerald", sub: "Premi masuk" },
        { label: "Total Klaim Keluar", value: fmt(data.total_payout), icon: TrendingDown, color: "red", sub: "Klaim dibayar" },
        { label: "Rumah Sakit", value: data.total_hospitals, icon: Hospital, color: "cyan", sub: "Mitra RS" },
        { label: "Konsultasi", value: data.total_consultations, icon: Stethoscope, color: "purple", sub: "Total sesi" },
        { label: "Rating Rata-rata", value: `${data.avg_rating}/5`, icon: Star, color: "yellow", sub: "Dari feedback" },
        { label: "Pembayaran Pending", value: data.pending_payments, icon: Clock, color: "orange", sub: "Menunggu verifikasi" },
    ];

    const colorMap = {
        blue: "bg-blue-50 text-blue-700 ring-blue-100",
        indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
        amber: "bg-amber-50 text-amber-700 ring-amber-100",
        green: "bg-green-50 text-green-700 ring-green-100",
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        red: "bg-red-50 text-red-700 ring-red-100",
        cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
        purple: "bg-violet-50 text-violet-700 ring-violet-100",
        yellow: "bg-yellow-50 text-yellow-700 ring-yellow-100",
        orange: "bg-orange-50 text-orange-700 ring-orange-100",
    };

    const claimPie = Object.entries(data.claims_by_status || {}).map(([name, value]) => ({ name, value }));
    const policyPie = Object.entries(data.policies_by_type || {}).map(([name, value]) => ({ name, value }));
    const barData = (data.monthly_revenue || []).map((m) => ({
        month: m.month,
        Premi: Number(m.revenue),
        Klaim: Number(m.payout),
    }));

    return (
        <div className="space-y-6">
            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Ringkasan Operasional</p>
                        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Dashboard Admin</h2>
                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Pantau performa polis, klaim, pembayaran, rumah sakit, dan konsultasi dari satu tempat.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
                        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                            <p className="text-xs font-semibold text-amber-700">Pending</p>
                            <p className="text-xl font-black text-amber-900">{data.pending_payments}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                            <p className="text-xs font-semibold text-emerald-700">Polis Aktif</p>
                            <p className="text-xl font-black text-emerald-900">{data.active_policies}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {statCards.map(({ label, value, icon: Icon, color, sub }) => (
                    <div key={label} className="group rounded-[1.35rem] border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/70 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${colorMap[color]}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className="rounded-full bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-400 ring-1 ring-slate-100">Live</span>
                        </div>
                        <p className="truncate text-2xl font-black tracking-tight text-slate-950">{value}</p>
                        <p className="mt-1 text-xs font-bold text-slate-700">{label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Panel title="Pendapatan vs Klaim" subtitle="Tren 6 bulan terakhir" className="lg:col-span-2">
                    {barData.length === 0 ? (
                        <p className="py-10 text-center text-sm text-slate-400">Belum ada data transaksi.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={barData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}jt`} axisLine={false} tickLine={false} />
                                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 18px 45px rgba(15,23,42,.12)" }} />
                                <Bar dataKey="Premi" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="Klaim" fill="#dc2626" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Panel>

                <div className="space-y-4">
                    <Panel title="Status Klaim">
                        {claimPie.length === 0 ? (
                            <p className="py-6 text-center text-xs text-slate-400">Belum ada klaim.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={claimPie} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value">
                                        {claimPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e2e8f0" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Panel>

                    <Panel title="Polis per Tipe">
                        {policyPie.length === 0 ? (
                            <p className="py-6 text-center text-xs text-slate-400">Belum ada polis.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie data={policyPie} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value">
                                        {policyPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e2e8f0" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </Panel>
                </div>
            </div>
        </div>
    );
}

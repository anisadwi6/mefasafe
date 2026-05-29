import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Loader2,
  AlertCircle,
  Heart,
  Car,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

const COLORS = {
  jiwa: "#8b5cf6",
  kesehatan: "#10b981",
  kendaraan: "#f59e0b",
};

const TYPE_INFO = {
  jiwa: { label: "Asuransi Jiwa", icon: Users, color: "from-purple-500 to-purple-600" },
  kesehatan: { label: "Asuransi Kesehatan", icon: Heart, color: "from-green-500 to-green-600" },
  kendaraan: { label: "Asuransi Kendaraan", icon: Car, color: "from-amber-500 to-amber-600" },
};

export default function Monitor({ user }) {
  const [saldoSummary, setSaldoSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [claimsHistory, setClaimsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedType, setSelectedType] = useState(null);
  const [showSaldo, setShowSaldo] = useState(false);
  const token = localStorage.getItem("mefasafe_token");

  useEffect(() => {
    const fetchMonitorData = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, chartRes, historyRes] = await Promise.all([
          axios.get("/api/v1/monitor/saldo-summary", {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id: user?.id },
          }),
          axios.get("/api/v1/monitor/saldo-chart", {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id: user?.id },
          }),
          axios.get("/api/v1/monitor/claims-history", {
            headers: { Authorization: `Bearer ${token}` },
            params: { user_id: user?.id },
          }),
        ]);

        if (summaryRes.data?.success) setSaldoSummary(summaryRes.data.data);
        if (chartRes.data?.success) setChartData(chartRes.data.data);
        if (historyRes.data?.success) setClaimsHistory(historyRes.data.data);
      } catch (err) {
        console.error("Monitor fetch error:", err);
        setError("Gagal mengambil data monitor. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMonitorData();
    }
  }, [user?.id, token]);

  const formatRupiah = (value) => {
    if (value == null || value === undefined) return "-";
    return `Rp ${Number(value).toLocaleString("id-ID")}`;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/70 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-slate-600 font-medium">Memuat data monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/70 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/85 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Monitor Saldo Polis</h1>
              <p className="text-sm text-slate-500">Pantau saldo dan penggunaan asuransi Anda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200/60 bg-white/50 rounded-t-2xl p-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100/60"
            }`}
          >
            Ringkasan Saldo
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === "charts"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100/60"
            }`}
          >
            Grafik Penggunaan
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === "history"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100/60"
            }`}
          >
            Riwayat Klaim
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Total Summary Card */}
            {saldoSummary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold opacity-90">Total Plafon</h3>
                    <DollarSign className="w-5 h-5 opacity-60" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black">
                      {formatRupiah(saldoSummary.total_coverage_all).replace("Rp ", "")}
                    </p>
                  </div>
                  <p className="text-xs opacity-75 mt-3">Total limit asuransi aktif</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold opacity-90">Sudah Digunakan</h3>
                    <TrendingDown className="w-5 h-5 opacity-60" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black">
                      {formatRupiah(saldoSummary.total_claims_all).replace("Rp ", "")}
                    </p>
                  </div>
                  <p className="text-xs opacity-75 mt-3">Total klaim yang disetujui</p>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold opacity-90">Sisa Saldo</h3>
                    <TrendingUp className="w-5 h-5 opacity-60" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black">
                      {formatRupiah(
                        saldoSummary.total_coverage_all - saldoSummary.total_claims_all
                      ).replace("Rp ", "")}
                    </p>
                  </div>
                  <p className="text-xs opacity-75 mt-3">Tersedia untuk digunakan</p>
                </div>
              </div>
            )}

            {/* Saldo by Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {saldoSummary?.summary.map((item) => {
                const typeInfo = TYPE_INFO[item.type];
                const IconComponent = typeInfo.icon;

                return (
                  <div key={item.type} className="rounded-2xl bg-white border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-slate-300/60">
                    {/* Header */}
                    <div
                      className={`bg-gradient-to-r ${typeInfo.color} text-white p-4 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{typeInfo.label}</p>
                          <p className="text-xs opacity-90">{item.policy_count} polis</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSaldo(!showSaldo)}
                        className="p-1 hover:bg-white/20 rounded-lg transition-all"
                      >
                        {showSaldo ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Plafon */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Plafon Total</span>
                        <span className="font-semibold text-slate-900">
                          {showSaldo ? formatRupiah(item.total_coverage) : "••••••"}
                        </span>
                      </div>

                      {/* Used */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Sudah Digunakan</span>
                        <span className="font-semibold text-red-600">
                          {showSaldo ? formatRupiah(item.total_claims_approved) : "••••••"}
                        </span>
                      </div>

                      {/* Remaining */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-sm font-semibold text-slate-700">Sisa Saldo</span>
                        <span className="font-bold text-lg text-green-600">
                          {showSaldo ? formatRupiah(item.remaining_balance) : "••••••"}
                        </span>
                      </div>

                      {/* Usage Bar */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Penggunaan</span>
                          <span className="text-xs font-semibold text-slate-700">
                            {item.usage_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.usage_percentage > 80
                                ? "bg-red-500"
                                : item.usage_percentage > 50
                                ? "bg-amber-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${item.usage_percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHARTS TAB */}
        {activeTab === "charts" && (
          <div className="space-y-6">
            {/* Bar Chart - Saldo Remaining vs Used */}
            {chartData.length > 0 && (
              <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Perbandingan Saldo Sisa & Terpakai</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value) => formatRupiah(value)}
                    />
                    <Legend />
                    <Bar dataKey="remaining" name="Sisa Saldo" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="used" name="Sudah Digunakan" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pie Charts by Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chartData.map((item) => {
                const pieData = [
                  { name: "Sisa", value: item.remaining },
                  { name: "Terpakai", value: item.used },
                ];

                return (
                  <div
                    key={item.name}
                    className="rounded-2xl bg-white border border-slate-200/60 shadow-sm p-6"
                  >
                    <h3 className="text-base font-bold text-slate-900 mb-4">{item.name}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip formatter={(value) => formatRupiah(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                          Sisa
                        </span>
                        <span className="font-semibold">{formatRupiah(item.remaining)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-500"></span>
                          Terpakai
                        </span>
                        <span className="font-semibold">{formatRupiah(item.used)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Riwayat Klaim</h2>
            </div>

            {claimsHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Activity className="w-14 h-14 mx-auto mb-4 opacity-40" />
                <p className="font-semibold">Belum ada riwayat klaim</p>
                <p className="text-sm mt-1">Data klaim Anda akan ditampilkan di sini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        Jenis Asuransi
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                        Nominal
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimsHistory.map((claim) => {
                      const typeInfo = TYPE_INFO[claim.policy_type];
                      const statusColors = {
                        approved: "bg-green-100 text-green-700",
                        pending: "bg-amber-100 text-amber-700",
                        partial: "bg-blue-100 text-blue-700",
                        rejected: "bg-red-100 text-red-700",
                      };

                      return (
                        <tr
                          key={claim.id}
                          className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {new Date(claim.date).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {typeInfo?.label}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-right text-slate-900">
                            {formatRupiah(claim.amount)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                statusColors[claim.status] || statusColors.pending
                              }`}
                            >
                              {claim.status === "approved"
                                ? "Disetujui"
                                : claim.status === "pending"
                                ? "Menunggu"
                                : claim.status === "partial"
                                ? "Sebagian"
                                : "Ditolak"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

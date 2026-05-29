import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Routes, Route, Navigate } from "react-router-dom";
import Profile from "./Profile";
import Notifikasi from "./Notifikasi";
import ChatBot from "./ChatBot";
import HealthService from "./HealthService";
import DaftarRS from "./DaftarRS";
import PendaftaranRS from "./PendaftaranRS";
import PendaftaranLayanan from "./PendaftaranLayanan";
import Riwayat from "./Riwayat";
import Asuransi from "./Asuransi";
import Klaim from "./Klaim";
import KalenderPengingat from "./KalenderPengingat";
import Konsultasi from "./Konsultasi";
import Feedback from "./Feedback";
import SupportPage from "./SupportPage";
import TentangKami from "./TentangKami";
import Monitor from "./Monitor";
import PromoPage from "./PromoPage";
import BannerCarousel from "./BannerCarousel";
import UserTestimonials from "./UserTestimonials";
import ReminderPopup from "./ReminderPopup";
import AccessibilityPanel from "./AccessibilityPanel";
import { useAccessibility } from "./useAccessibility";
import ChatNotifToast from "./ChatNotifToast";
import { useChatNotif } from "./useChatNotif";
import { resolveMediaUrl } from "../utils/mediaUrl";
import axios from "axios";
import {
  Menu,
  Mail,
  Phone,
  Eye,
  EyeOff,
  X,
  Calendar,
  MessageSquare,
  FileText,
  Activity,
  Clock,
  Hospital,
  Stethoscope,
  Bell,
  User,
  Home as HomeIcon,
  ArrowRight,
  ChevronRight,
  Shield,
  Heart,
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Loader2,
  Info,
} from "lucide-react";
import logo from "../../../assets/logo.png";
import family from "../../../assets/family.png";

export default function Home({ user, profile, onLogout }) {
  const [showSaldo, setShowSaldo] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const isChatBot = location.pathname === "/chatbot";

  // ── Home Dashboard Data ──────────────────────────────────────────────
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [reminderBadge, setReminderBadge] = useState(0);
  const [banners, setBanners] = useState([]);
  const [showA11yPanel, setShowA11yPanel] = useState(false);
  const { settings: a11ySettings, update: updateA11y, reset: resetA11y } = useAccessibility();

  // ── Chat Notifications ───────────────────────────────────────────────
  const [chatToasts, setChatToasts] = useState([]);
  const toastCounter = useRef(0);

  const { unreadCount: chatUnread, clearAll: clearChatBadge } = useChatNotif({
    role: "user",
    userId: user?.id,
    onNewMsg: (consultationId, msg, consultation) => {
      setChatToasts((prev) => [
        ...prev,
        {
          id: ++toastCounter.current,
          consultationId,
          role: "user",
          senderName: consultation?.doctor_name || "Dokter",
          message: msg.message,
        },
      ]);
    },
  });

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [location.pathname, user?.id]); // re-fetch setiap pindah halaman atau user berubah

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get("/api/v1/banners/active");
        setBanners(res.data?.data || []);
      } catch (error) {
        console.error("Banners fetch error:", error);
        setBanners([]);
      }
    };

    fetchBanners();
  }, []);

  const openPromo = (url) => {
    if (!url) return;
    if (/^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(url);
  };

  const fetchDashboardData = async () => {
    const userId = user?.id;
    if (!userId) return;
    try {
      const token = localStorage.getItem("mefasafe_token");
      const res = await axios.get(`/api/v1/home-dashboard?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setDashboardData(res.data.data);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchReminderBadge = async () => {
    const userId = user?.id;
    if (!userId) {
      setReminderBadge(0);
      return;
    }

    try {
      const token = localStorage.getItem("mefasafe_token") || localStorage.getItem("token");
      const res = await axios.get(`/api/v1/reminders/today`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { user_id: userId },
      });

      if (res.data.success) {
        setReminderBadge(Array.isArray(res.data.data) ? res.data.data.length : 0);
      }
    } catch (error) {
      console.error("Reminder badge fetch error:", error);
      setReminderBadge(0);
    }
  };

  useEffect(() => {
    fetchReminderBadge();

    const intervalId = window.setInterval(fetchReminderBadge, 60000);

    return () => window.clearInterval(intervalId);
  }, [user?.id]);

  // Helper: format rupiah
  const formatRupiah = (num) =>
    "Rp " + Number(num).toLocaleString("id-ID");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const getInitials = (name) => {
    if (!name) return "P";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const profilePhotoUrl = resolveMediaUrl(user?.profile_picture);

  const menuItems = [
    {
      icon: <Hospital className="w-7 h-7" />,
      label: "Daftar Rumah Sakit",
      onClick: () => navigate("/daftarRS"),
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      color: "blue",
      description: "Cari RS terdekat",
    },
    {
      icon: <Stethoscope className="w-7 h-7" />,
      label: "Konsultasi Dokter",
      onClick: () => { navigate("/konsul"); clearChatBadge(); },
      gradient: "from-purple-500 via-purple-600 to-pink-600",
      color: "purple",
      description: "Chat dengan dokter",
      badge: chatUnread > 0 ? chatUnread : null,
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      label: "Kalender Pengingat",
      onClick: () => navigate("/kalender"),
      gradient: "from-orange-500 via-orange-600 to-amber-600",
      color: "orange",
      description: "Atur jadwal kontrol",
      badge: reminderBadge,
    },
    {
      icon: <MessageSquare className="w-7 h-7" />,
      label: "Feedback & Saran",
      onClick: () => navigate("/feedback"),
      gradient: "from-green-500 via-green-600 to-emerald-600",
      color: "green",
      description: "Berikan masukan",
    },
    {
      icon: <Clock className="w-7 h-7" />,
      label: "Riwayat",
      onClick: () => navigate("/riwayat"),
      gradient: "from-indigo-500 via-indigo-600 to-blue-600",
      color: "indigo",
      description: "Lihat riwayat pendaftaran dan transaksi",
    },
    {
      icon: <Activity className="w-7 h-7" />,
      label: "Health Tracking",
      onClick: () => navigate("/health-service"),
      gradient: "from-red-500 via-red-600 to-rose-600",
      color: "red",
      description: "Monitor kesehatan",
    },
    {
      icon: <FileText className="w-7 h-7" />,
      label: "Pendaftaran Layanan",
      onClick: () => navigate("/pendaftaran-layanan"),
      gradient: "from-yellow-500 via-yellow-600 to-orange-500",
      color: "yellow",
      description: "Daftar layanan baru",
    },
    {
      icon: <Users className="w-7 h-7" />,
      label: "Tentang Kami",
      onClick: () => navigate("/tentang"),
      gradient: "from-teal-500 via-teal-600 to-cyan-600",
      color: "teal",
      description: "Kenali lebih jauh",
    },
  ];

  const sidebarMenu = [
    { icon: <HomeIcon className="w-5 h-5" />, label: "Home", onClick: () => navigate("/home") },
    {
      icon: <Bell className="w-5 h-5" />,
      label: "Notifikasi",
      onClick: () => { navigate("/notifikasi"); clearChatBadge(); },
      badge: chatUnread > 0 ? chatUnread : null,
    },
    { icon: <MessageSquare className="w-5 h-5" />, label: "ChatBot", onClick: () => navigate("/chatbot") },
  ];

  const stats = [
    { icon: <Shield className="w-6 h-6" />, label: "Perlindungan",    value: dashboardData?.stats?.perlindungan        ?? "—", colorClass: "from-blue-500 to-blue-600"   },
    { icon: <Heart  className="w-6 h-6" />, label: "Klaim Disetujui", value: dashboardData?.stats?.claim_approval_rate ?? "—", colorClass: "from-red-500 to-red-600"    },
    { icon: <Users  className="w-6 h-6" />, label: "Member Aktif",    value: dashboardData?.stats?.active_members      ?? "—", colorClass: "from-purple-500 to-purple-600" },
    { icon: <Award  className="w-6 h-6" />, label: "Rating",          value: dashboardData?.stats?.rating              ?? "—", colorClass: "from-yellow-500 to-yellow-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-x-hidden">
      {/* Enhanced Animated Background with Parallax */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
            top: `${-200 + scrollY * 0.1}px`,
            right: `${-200 + mousePosition.x * 0.01}px`,
          }}
        ></div>
        <div 
          className="absolute w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
            bottom: `${-200 + scrollY * 0.15}px`,
            left: `${-200 - mousePosition.x * 0.01}px`,
          }}
        ></div>
        <div 
          className="absolute w-[400px] h-[400px] rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float-slow"
          style={{
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
            top: "40%",
            left: "50%",
            transform: `translate(-50%, -50%) translateY(${scrollY * 0.05}px)`,
          }}
        ></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      </div>

      {/* Glass Morphism Header */}
      <header 
        className={`relative z-50 backdrop-blur-xl border-b transition-all duration-500 sticky top-0 ${
          scrollY > 10 
            ? "bg-white/70 border-white/20 shadow-lg shadow-blue-500/5" 
            : "bg-white/40 border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between relative">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2.5 -ml-2 rounded-xl hover:bg-white/80 transition-all duration-300 text-gray-700 md:hidden group"
              >
                <Menu className={`w-6 h-6 transition-all duration-500 group-hover:scale-125 ${showSidebar ? 'rotate-90 scale-125' : 'group-hover:rotate-90'}`} />
              </button>

              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                </div>
                <div>
                  <div className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    MefaSafe
                  </div>
                  <div className="text-xs text-gray-500">
                    Health Insurance
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
              {sidebarMenu.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 group hover:bg-white/60"
                >
                  <span className="group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </button>
              ))}
            </nav>

            {/* Profile Section */}
            <div className="flex items-center gap-3 relative">
              {/* Profile Button */}
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="focus:outline-none group"
              >
                {profilePhotoUrl ? (
                  <div className="relative">
                    <img 
                      src={profilePhotoUrl} 
                      alt="Profile" 
                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-300" 
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 items-center justify-center text-white font-bold text-sm shadow-lg hidden">
                      {getInitials(user?.name)}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      {getInitials(user?.name)}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
                  </div>
                )}
              </button>

              {/* Enhanced Profile Dropdown */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  ></div>
                  <div className="absolute right-0 top-16 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 py-2 z-50 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-semibold text-gray-900">{user?.name || "Pengguna"}</div>
                      <div className="text-sm text-gray-500">{user?.email || "user@mefasafe.com"}</div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/Profil");
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300 flex items-center gap-3 group"
                    >
                      <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>Edit Profil</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-1"></div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 flex items-center gap-3 group"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Keluar</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={`relative z-10 ${isChatBot ? "p-0" : "px-4 md:px-6 py-8"}`}>
        <Routes>
          <Route path="/home" element={
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Hero Section with Enhanced Animation */}
              <div className="animate-fade-in-up">
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative inline-flex">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full border border-blue-200/50 backdrop-blur-sm">
                      <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                        {getGreeting()}
                      </span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-md animate-pulse-slow"></div>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-3 animate-gradient bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  {user?.name || "Pengguna MefaSafe"}
                </h1>
                <p className="text-gray-600 text-lg md:text-xl flex items-center gap-2">
                  <span>Kelola kesehatan keluarga dengan</span>
                  <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">mudah & aman</span>
                </p>
              </div>

              {/* Enhanced Balance Card with 3D Effect */}
              <div className="animate-fade-in-up animation-delay-200">
                <div className="group relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-white via-white to-blue-50/30 rounded-3xl p-8 md:p-10 border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:scale-[1.01]">
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500"></div>
                      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Saldo Asuransi</p>
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            {dashboardLoading ? (
                              <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="text-2xl font-bold">Memuat...</span>
                              </div>
                            ) : (
                              <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {showSaldo
                                  ? (dashboardData?.balance?.formatted_balance ?? "Rp 0")
                                  : "Rp •••••••••"}
                              </p>
                            )}
                            <button
                              onClick={() => setShowSaldo(!showSaldo)}
                              className="p-2.5 rounded-xl hover:bg-white/80 transition-all duration-300 text-gray-700 group/eye"
                            >
                              {showSaldo
                                ? <Eye className="w-5 h-5 group-hover/eye:scale-110 transition-transform" />
                                : <EyeOff className="w-5 h-5 group-hover/eye:scale-110 transition-transform" />}
                            </button>
                          </div>
                          {/* Trend */}
                          {!dashboardLoading && dashboardData?.balance && (
                            <div className={`flex items-center gap-2 text-sm font-medium ${dashboardData.balance.trend_up ? "text-green-600" : "text-red-500"}`}>
                              {dashboardData.balance.trend_up
                                ? <TrendingUp className="w-4 h-4" />
                                : <TrendingDown className="w-4 h-4" />}
                              <span>
                                {dashboardData.balance.trend_up ? "+" : "-"}
                                {dashboardData.balance.trend_percent}% dari bulan lalu
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {dashboardLoading ? (
                            <div className="px-4 py-2 bg-gray-200 text-gray-400 text-xs font-bold rounded-xl animate-pulse">MEMUAT</div>
                          ) : dashboardData?.policy ? (
                            <>
                              <div className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 ${dashboardData.policy.status === "active" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-gray-400 to-gray-500"}`}>
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                {dashboardData.policy.status === "active" ? "AKTIF" : "TIDAK AKTIF"}
                              </div>
                              {dashboardData.policy.end_date && (
                                <div className="text-xs text-gray-500">Berlaku s/d {dashboardData.policy.end_date}</div>
                              )}
                              {dashboardData.policy.active_count > 1 && (
                                <div className="text-xs text-cyan-600 font-medium">
                                  {dashboardData.policy.active_count} polis aktif
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white text-xs font-bold rounded-xl">
                              BELUM ADA POLIS
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-medium">Penggunaan Limit</span>
                          <span className="font-bold text-gray-900">
                            {dashboardLoading ? "—" : `${dashboardData?.balance?.usage_percent ?? 0}%`}
                          </span>
                        </div>
                        <div className="relative h-3 bg-gray-200/50 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg transition-all duration-1000"
                            style={{ width: `${dashboardData?.balance?.usage_percent ?? 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-3 gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => navigate("/klaim")}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/60 hover:bg-white transition-all duration-300 group/action border border-gray-100"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover/action:scale-110 transition-transform duration-300">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            Klaim
                            {dashboardData?.pending_claims > 0 && (
                              <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                                {dashboardData.pending_claims}
                              </span>
                            )}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate("/asuransi")}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/60 hover:bg-white transition-all duration-300 group/action border border-gray-100"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover/action:scale-110 transition-transform duration-300">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">Asuransi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate("/monitor")}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/60 hover:bg-white transition-all duration-300 group/action border border-gray-100"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover/action:scale-110 transition-transform duration-300">
                            <Activity className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">Monitor</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.colorClass} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <span className="text-white">{stat.icon}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>

              {/* Banner Iklan: Promo + Informasi */}
              <BannerCarousel banners={banners} onNavigate={openPromo} />

              {/* Services Section */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                      Layanan Unggulan
                    </h2>
                    <p className="text-gray-600">Akses cepat ke semua layanan kesehatan Anda</p>
                  </div>
                  
                </div>

                {/* Enhanced Service Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-500 shadow-md hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Hover Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </div>

                      <div className="relative z-10">
                        {/* Icon with Glow */}
                        <div className="relative mb-4">
                          <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                            {item.icon}
                          </div>
                          <div className={`absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}></div>
                          {item.badge && item.badge > 0 && (
                            <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        {/* Label */}
                        <p className="text-sm font-bold text-gray-900 text-center leading-snug mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                          {item.label}
                        </p>

                        {/* Description */}
                        <p className="text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {item.description}
                        </p>

                        {/* Arrow Icon */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                            <ArrowRight className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Testimoni Pengguna */}
              <UserTestimonials onNavigate={openPromo} />

            </div>
          } />
          <Route path="/notifikasi" element={<Notifikasi user={user} />} />
          <Route path="/chatbot" element={<ChatBot />} />
          <Route path="/health-service" element={<HealthService user={user} />} />
          <Route path="/tentang" element={<TentangKami />} />
          <Route path="/dukungan/:page" element={<SupportPage />} />
          <Route path="/daftarRS" element={<DaftarRS user={user} />} />
          <Route path="/daftar-rs/:id" element={<PendaftaranRS user={user} />} />
          <Route path="/pendaftaran-layanan" element={<PendaftaranLayanan user={user} />} />
          <Route path="/riwayat" element={<Riwayat user={user} />} />
          <Route path="/asuransi" element={<Asuransi user={user} />} />
          <Route path="/klaim" element={<Klaim user={user} />} />
          <Route path="/kalender" element={<KalenderPengingat user={user} />} />
          <Route path="/konsul" element={<Konsultasi user={user} />} />
          <Route path="/feedback" element={<Feedback user={user} />} />
          <Route path="/monitor" element={<Monitor user={user} />} />
          <Route path="/promo" element={<PromoPage user={user} />} />
          
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>



      {/* Enhanced Footer */}
      {!isChatBot && <footer className="relative z-10 mt-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="footer-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footer-grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} alt="MefaSafe" className="h-8 brightness-0 invert" />
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Platform asuransi kesehatan digital terpercaya untuk melindungi keluarga Indonesia.
              </p>
              <div className="flex gap-3">
                {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                  <button
                    key={social}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <span className="text-xs">{social[0].toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Services */}
            <div>
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded"></div>
                Layanan
              </h3>
              <ul className="space-y-3">
                {menuItems.slice(0, 4).map((item, index) => (
                  <li key={index}>
                    <button
                      onClick={item.onClick}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help & Support */}
            <div>
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded"></div>
                Dukungan
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  { label: "Pusat Bantuan", path: "/dukungan/pusat-bantuan" },
                  { label: "Syarat & Ketentuan", path: "/dukungan/syarat-dan-ketentuan" },
                  { label: "Kebijakan Privasi", path: "/dukungan/kebijakan-privasi" },
                  { label: "FAQ", path: "/dukungan/faq" },
                  { label: "Peta Situs", path: "/dukungan/peta-situs" },
                  { label: "Kebijakan Cookie", path: "/dukungan/kebijakan-cookie" },
                ].map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => navigate(item.path)}
                      className="hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-pink-500 to-red-500 rounded"></div>
                Hubungi Kami
              </h3>
              <div className="space-y-4">
                <a 
                  href="mailto:bantuan@mefasafe.com" 
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm font-medium">bantuan@mefasafe.com</div>
                  </div>
                </a>
                <a 
                  href="tel:+622112345678" 
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-all duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Telepon</div>
                    <div className="text-sm font-medium">021-1234-5678</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2026 MefaSafe Insurance. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <button
                type="button"
                onClick={() => navigate("/dukungan/peta-situs")}
                className="hover:text-white transition-colors duration-300"
              >
                Peta Situs
              </button>
              <button
                type="button"
                onClick={() => setShowA11yPanel(true)}
                className="hover:text-white transition-colors duration-300"
              >
                Aksesibilitas
              </button>
              <button
                type="button"
                onClick={() => navigate("/dukungan/kebijakan-cookie")}
                className="hover:text-white transition-colors duration-300"
              >
                Cookie
              </button>
            </div>
          </div>
        </div>
      </footer>}

      {/* Enhanced Sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          showSidebar ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowSidebar(false)}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-2xl z-50 transition-transform duration-500 ease-out md:hidden ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="MefaSafe" className="h-10 object-contain" />
              <div>
              </div>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
            >
              <X className="w-5 h-5 text-gray-600 group-hover:rotate-90 group-hover:scale-125 transition-all duration-300" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            {profilePhotoUrl ? (
              <img 
                src={profilePhotoUrl} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            {!profilePhotoUrl && (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">
                {getInitials(user?.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{user?.name || "Pengguna"}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email || "user@mefasafe.com"}</div>
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="p-4 space-y-2">
          {sidebarMenu.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setShowSidebar(false);
              }}
              className="relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 text-gray-700 font-medium group overflow-hidden"
            >
              <span className="relative z-10 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">
                {item.icon}
              </span>
              <span className="relative z-10 group-hover:text-blue-600 transition-colors duration-300">{item.label}</span>
              {item.badge && (
                <span className="relative z-10 ml-auto w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="relative z-10 w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <div className="text-center text-xs text-gray-500 mb-2">MefaSafe v2.0</div>
          <div className="text-center text-xs text-gray-400">© 2026 All rights reserved</div>
        </div>
      </aside>

      {/* Enhanced Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.05); }
          50% { transform: translate(-20px, 30px) scale(0.95); }
          75% { transform: translate(40px, 20px) scale(1.02); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-40px, 30px) scale(1.03); }
          50% { transform: translate(30px, -30px) scale(0.97); }
          75% { transform: translate(-30px, -20px) scale(1.05); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(-50%, -50%) translate(20px, -30px) scale(1.08); }
          66% { transform: translate(-50%, -50%) translate(-15px, 25px) scale(0.92); }
        }

        @keyframes particle {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 12s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }

        .animate-particle {
          animation: particle linear infinite;
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }

        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>
      
      {/* Global Overlays */}
      <div className="relative z-[99999]">
        <ReminderPopup userId={user?.id} />
        <ChatNotifToast
          toasts={chatToasts}
          onDismiss={(id) => setChatToasts((prev) => prev.filter((t) => t.id !== id))}
          onOpen={() => { navigate("/konsul"); clearChatBadge(); }}
        />
      </div>

      <AccessibilityPanel
        open={showA11yPanel}
        onClose={() => setShowA11yPanel(false)}
        settings={a11ySettings}
        onUpdate={updateA11y}
        onReset={resetA11y}
      />
    </div>
  );
}

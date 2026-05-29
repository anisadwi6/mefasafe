import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
    LayoutDashboard, Users, Shield, FileText, CreditCard,
    Hospital, Stethoscope, Star, Calendar,
    Settings, LogOut, Menu, X, ChevronRight, Bell, Megaphone, Info, Tag
} from "lucide-react";
import AdminOverview    from "./sections/AdminOverview";
import AdminUsers       from "./sections/AdminUsers";
import AdminAdmins      from "./sections/AdminAdmins";
import AdminPolicies    from "./sections/AdminPolicies";
import AdminClaims      from "./sections/AdminClaims";
import AdminTransactions from "./sections/AdminTransactions";
import AdminHospitals   from "./sections/AdminHospitals";
import AdminDoctors     from "./sections/AdminDoctors";
import AdminConsultations from "./sections/AdminConsultations";
import AdminFeedbacks   from "./sections/AdminFeedbacks";
import AdminRegistrations from "./sections/AdminRegistrations";
import AdminPackages    from "./sections/AdminPackages";
import AdminPromotions  from "./sections/AdminPromotions";
import AdminAnnouncements from "./sections/AdminAnnouncements";
import AdminPromoCodes from "./sections/AdminPromoCodes";
import ChatNotifToast   from "../ChatNotifToast";
import { useChatNotif } from "../useChatNotif";

const NAV = [
    { id: "overview",       label: "Overview",          icon: LayoutDashboard },
    { id: "users",          label: "Pengguna",           icon: Users },
    { id: "admins",         label: "Kelola Admin",       icon: Shield },
    { id: "policies",       label: "Polis Asuransi",     icon: Shield },
    { id: "claims",         label: "Klaim",              icon: FileText },
    { id: "transactions",   label: "Transaksi",          icon: CreditCard },
    { id: "hospitals",      label: "Rumah Sakit",        icon: Hospital },
    { id: "doctors",        label: "Dokter",             icon: Stethoscope },
    { id: "consultations",  label: "Konsultasi Dokter",  icon: Stethoscope },
    { id: "registrations",  label: "Registrasi",         icon: Calendar },
    { id: "feedbacks",      label: "Feedback",           icon: Star },
    { id: "packages",       label: "Paket Asuransi",     icon: Settings },
    { id: "promotions",     label: "Promo",              icon: Megaphone },
    { id: "announcements",  label: "Informasi",          icon: Info },
    { id: "promo_codes",    label: "Kode Promo",         icon: Tag },
];

const API = "/api/v1/admin";
const adminToken = () => localStorage.getItem("admin_token");

const formatBadge = (value) => {
    const number = Number(value || 0);
    return number > 99 ? "99+" : String(number);
};

export default function AdminDashboard({ admin, onLogout }) {
    const [active, setActive]       = useState("overview");
    const [sidebarOpen, setSidebar] = useState(false);
    const [stats, setStats]         = useState(null);

    // ── Chat Notifications ────────────────────────────────────────────
    const [chatToasts, setChatToasts] = useState([]);
    const toastCounter = useRef(0);

    const { unreadCount: chatUnread, clearAll: clearChatBadge } = useChatNotif({
        role: "admin",
        onNewMsg: (consultationId, msg, consultation) => {
            setChatToasts((prev) => [
                ...prev,
                {
                    id: ++toastCounter.current,
                    consultationId,
                    role: "admin",
                    senderName: consultation?.user?.name || "Pengguna",
                    message: msg.message,
                },
            ]);
        },
    });

    useEffect(() => {
        let mounted = true;

        const fetchStats = () => {
            axios.get(`${API}/stats`, { headers: { Authorization: `Bearer ${adminToken()}` } })
                .then((res) => {
                    if (mounted) setStats(res.data.data);
                })
                .catch(console.error);
        };

        fetchStats();
        const interval = window.setInterval(fetchStats, 30000);

        return () => {
            mounted = false;
            window.clearInterval(interval);
        };
    }, []);

    const navBadges = useMemo(() => ({
        overview: stats?.pending_payments || 0,
        users: stats?.total_users || 0,
        admins: stats?.total_admins || 0,
        policies: stats?.pending_policies || stats?.total_policies || 0,
        claims: stats?.pending_claims || 0,
        transactions: stats?.pending_transactions || 0,
        hospitals: stats?.inactive_hospitals || stats?.total_hospitals || 0,
        doctors: stats?.inactive_doctors || stats?.total_doctors || 0,
        consultations: Math.max(Number(stats?.pending_consultations || 0), Number(chatUnread || 0)),
        registrations: stats?.pending_registrations || 0,
        feedbacks: stats?.total_feedbacks || 0,
        packages: stats?.total_packages || 0,
        promotions: stats?.active_promotions || stats?.total_promotions || 0,
        announcements: stats?.active_announcements || stats?.total_announcements || 0,
        promo_codes: stats?.active_promo_codes || stats?.total_promo_codes || 0,
    }), [stats, chatUnread]);

    const navBadgeTone = (id, value, isActive) => {
        if (isActive) return "bg-white/20 text-white";
        if (Number(value || 0) <= 0) return "bg-slate-100 text-slate-500";
        if (["claims", "transactions", "consultations", "registrations"].includes(id)) return "bg-red-500 text-white";
        if (["overview", "policies", "hospitals", "doctors"].includes(id)) return "bg-amber-500 text-white";
        return "bg-slate-200 text-slate-700";
    };

    const ActiveSection = {
        overview:      AdminOverview,
        users:         AdminUsers,
        admins:        AdminAdmins,
        policies:      AdminPolicies,
        claims:        AdminClaims,
        transactions:  AdminTransactions,
        hospitals:     AdminHospitals,
        doctors:       AdminDoctors,
        consultations: AdminConsultations,
        registrations: AdminRegistrations,
        feedbacks:     AdminFeedbacks,
        packages:      AdminPackages,
        promotions:    AdminPromotions,
        announcements: AdminAnnouncements,
        promo_codes:   AdminPromoCodes,
    }[active] || AdminOverview;

    const currentNav = NAV.find((n) => n.id === active);

    return (
        <div className="flex h-screen overflow-hidden bg-[#f5f7fb] text-slate-900">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white/95 text-slate-900 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-transform duration-300
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}
            >
                {/* Brand */}
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 shadow-lg shadow-slate-900/20">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-black leading-tight tracking-tight">MefaSafe</p>
                        <p className="text-xs font-medium text-slate-500">Admin Control Center</p>
                    </div>
                    <button
                        onClick={() => setSidebar(false)}
                        className="ml-auto rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Menu</p>
                    {NAV.map(({ id, label, icon: Icon }) => (
                        (() => {
                            const rawBadge = navBadges[id] || 0;
                            const badge = formatBadge(rawBadge);
                            const showBadge = stats !== null;
                            const badgeClass = navBadgeTone(id, rawBadge, active === id);

                            return (
                        <button
                            key={id}
                            onClick={() => {
                                setActive(id);
                                setSidebar(false);
                                if (id === "consultations") clearChatBadge();
                            }}
                            className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all
                                ${active === id
                                    ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
                        >
                            <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${active === id ? "bg-white/10" : "bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 group-hover:text-slate-950"}`}>
                                <Icon className="h-4 w-4" />
                            </span>
                            <span className="truncate">{label}</span>
                            {showBadge && (
                                <span className={`ml-auto flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-[11px] font-black ${badgeClass}`}>
                                    {badge}
                                </span>
                            )}
                            {active === id && !showBadge && (
                                <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                        </button>
                            );
                        })()
                    ))}
                </nav>

                {/* Admin info + logout */}
                <div className="border-t border-slate-100 p-4">
                    <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                            {admin.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{admin.name}</p>
                            <p className="truncate text-xs text-slate-500">{admin.email}</p>
                        </div>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebar(false)}
                />
            )}

            {/* Main */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex flex-shrink-0 items-center gap-4 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-xl lg:px-7">
                    <button
                        onClick={() => setSidebar(true)}
                        className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:text-slate-900 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="min-w-0">
                        <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block">MefaSafe Admin</p>
                        <h1 className="truncate text-xl font-black tracking-tight text-slate-950">{currentNav?.label}</h1>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {chatUnread > 0 && (
                            <button onClick={() => { setActive("consultations"); clearChatBadge(); }}
                                className="hidden items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100 sm:flex">
                                <Bell className="h-4 w-4" />
                                {chatUnread > 99 ? "99+" : chatUnread}
                            </button>
                        )}
                        <div className="hidden items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 sm:flex">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            Online
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-7">
                    <div className="mx-auto max-w-[1600px]">
                        {active === "admins" ? (
                            <AdminAdmins currentAdminId={admin?.id} />
                        ) : (
                            <ActiveSection />
                        )}
                    </div>
                    {/* Chat notification toasts */}
                    <ChatNotifToast
                        toasts={chatToasts}
                        onDismiss={(id) => setChatToasts((prev) => prev.filter((t) => t.id !== id))}
                        onOpen={() => { setActive("consultations"); clearChatBadge(); }}
                    />
                </main>
            </div>
        </div>
    );
}

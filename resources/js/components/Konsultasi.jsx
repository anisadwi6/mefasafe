import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import PromoCodeInput from "./PromoCodeInput";
import { 
    Stethoscope, Calendar, Clock, Video, MessageSquare, 
    ChevronLeft, Send, Search, Star, Shield, AlertCircle, 
    MoreVertical, Info, CheckCircle2, Trash2, X,
    CreditCard, Wallet, BadgeCheck, ArrowLeft, Loader2,
    Upload, Copy, Building2
} from "lucide-react";

const CONSULTATION_PRICE = 75000;

const BANK_ACCOUNTS = [
    { bank: "BCA", norek: "1234567890", atas_nama: "PT MefaSafe Indonesia" },
    { bank: "Mandiri", norek: "9876543210", atas_nama: "PT MefaSafe Indonesia" },
    { bank: "BNI", norek: "1122334455", atas_nama: "PT MefaSafe Indonesia" },
];

const formatRupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");
export default function Konsultasi({ user }) {
    const [activeTab, setActiveTab] = useState("doctors");
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const messagesEndRef = useRef(null);
    const prevMsgCount   = useRef(0);
    const activeChatRef  = useRef(null); // mirror of activeChat for use inside intervals

    const [doctors, setDoctors] = useState([]);

    // ── Booking modal state ──────────────────────────────────────────────
    const [bookingStep, setBookingStep] = useState(1); // 1=pilih tipe, 2=pembayaran, 3=upload bukti
    const [bookingType, setBookingType] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [pendingConsultId, setPendingConsultId] = useState(null); // untuk upload bukti transfer
    const [proofFile, setProofFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [copiedNorek, setCopiedNorek] = useState(null);
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState(null);

    // ── Insurance policy state ───────────────────────────────────────────
    const [userPolicy, setUserPolicy] = useState(null);
    const [policyBalance, setPolicyBalance] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        const token = localStorage.getItem("mefasafe_token");
        const headers = { Authorization: `Bearer ${token}` };
        // Fetch polis aktif
        axios.get(`/api/v1/my-policies?user_id=${user.id}`, { headers })
            .then(res => {
                const active = (res.data.data || []).find(p => p.status === "active");
                setUserPolicy(active || null);
                if (active) {
                    // Fetch saldo
                    axios.get(`/api/v1/monitor/saldo-summary?user_id=${user.id}`, { headers })
                        .then(r => {
                            if (r.data.success) {
                                const summary = r.data.data?.summary || [];
                                const match = summary.find(s => s.type === active.insurance_type);
                                setPolicyBalance(match ? match.remaining_balance : null);
                            }
                        }).catch(() => {});
                }
            }).catch(() => {});
    }, [user?.id]);

    // ── Keep activeChatRef in sync ───────────────────────────────────────
    useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

    // ── Fetch doctors (once) ─────────────────────────────────────────────
    const fetchDoctors = async () => {
        try {
            const res = await axios.get(`/api/v1/doctors`);
            if (res.data.data) {
                const formattedDoctors = res.data.data.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    specialist: doc.specialist,
                    rating: 4.8 + (Math.random() * 0.2),
                    exp: Math.floor(Math.random() * 15 + 5) + " Tahun",
                    status: doc.availability === "available" ? "Tersedia" : "Sibuk",
                    originalData: doc
                }));
                setDoctors(formattedDoctors);
            }
        } catch (error) {
            console.error("Failed to fetch doctors", error);
        }
    };

    useEffect(() => { fetchDoctors(); }, []);

    // ── Central polling: consultations + messages ────────────────────────
    // Runs every 3 seconds always (not just when tab is open).
    // Updates consultation list AND syncs activeChat status/messages.
    const fetchConsultations = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const token = localStorage.getItem("mefasafe_token");
            const res = await axios.get(`/api/v1/doctor-consultations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.data) {
                const userConsults = res.data.data.filter(c => c.user_id === user.id);
                setConsultations(userConsults);

                // Sync activeChat if open
                const current = activeChatRef.current;
                if (current) {
                    const updated = userConsults.find(c => c.id === current.id);
                    if (updated) {
                        // Sync status changes (e.g. admin approved/completed)
                        setActiveChat(prev => ({ ...prev, status: updated.status }));

                        // Sync messages
                        const newMsgs = updated.messages || [];
                        if (newMsgs.length > prevMsgCount.current) {
                            prevMsgCount.current = newMsgs.length;
                            setMessages(newMsgs);
                            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch consultations", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Initial load
    useEffect(() => { if (user?.id) fetchConsultations(); }, [user?.id]);

    // Polling every 3 seconds
    useEffect(() => {
        if (!user?.id) return;
        const interval = setInterval(() => fetchConsultations(true), 3000);
        return () => clearInterval(interval);
    }, [user?.id]);

    // Open booking modal (reset to step 1)
    const openBookingModal = (doc) => {
        setSelectedDoctor(doc);
        setBookingStep(1);
        setBookingType(null);
        setPaymentMethod(null);
        setBookingError("");
        setPendingConsultId(null);
        setProofFile(null);
        setPromoCode("");
        setAppliedPromo(null);
    };

    const consultationPayAmount = appliedPromo?.final_amount ?? CONSULTATION_PRICE;

    const handleSelectType = (type) => {
        setBookingType(type);
        setBookingStep(2);
        setBookingError("");
    };

    const copyNorek = (norek) => {
        navigator.clipboard.writeText(norek).then(() => {
            setCopiedNorek(norek);
            setTimeout(() => setCopiedNorek(null), 2000);
        });
    };

    const bookConsultation = async () => {
        if (!selectedDoctor || !bookingType || !paymentMethod) return;
        setBookingLoading(true);
        setBookingError("");
        try {
            const token = localStorage.getItem("mefasafe_token");
            const payload = {
                user_id: user.id,
                doctor_name: selectedDoctor.name,
                specialist_type: selectedDoctor.specialist,
                consultation_type: bookingType,
                payment_method: paymentMethod,
                session_duration_minutes: 45,
            };
            if (paymentMethod === "saldo_asuransi" && userPolicy) {
                payload.insurance_policy_id = userPolicy.id;
            }
            if (appliedPromo?.code) {
                payload.promo_code = appliedPromo.code;
            } else if (promoCode.trim()) {
                payload.promo_code = promoCode.trim().toUpperCase();
            }

            const res = await axios.post(`/api/v1/doctor-consultations`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 201) {
                if (paymentMethod === "transfer") {
                    // Lanjut ke step upload bukti
                    setPendingConsultId(res.data.data.id);
                    setBookingStep(3);
                    // Refresh saldo jika pakai asuransi
                } else {
                    // Saldo asuransi — langsung selesai
                    if (userPolicy) {
                        setPolicyBalance(prev => prev !== null ? prev - consultationPayAmount : null);
                    }
                    setSelectedDoctor(null);
                    setBookingStep(1);
                    setBookingType(null);
                    setPaymentMethod(null);
                    setActiveTab("history");
                    fetchConsultations(true);
                }
            }
        } catch (err) {
            const msg = err?.response?.data?.message || "Gagal membuat konsultasi.";
            setBookingError(msg);
        } finally {
            setBookingLoading(false);
        }
    };

    const uploadProof = async () => {
        if (!proofFile || !pendingConsultId) return;
        setUploadLoading(true);
        setBookingError("");
        try {
            const token = localStorage.getItem("mefasafe_token");
            const formData = new FormData();
            formData.append("payment_proof", proofFile);
            await axios.post(`/api/v1/doctor-consultations/${pendingConsultId}/upload-proof`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            setSelectedDoctor(null);
            setBookingStep(1);
            setBookingType(null);
            setPaymentMethod(null);
            setPendingConsultId(null);
            setProofFile(null);
            setActiveTab("history");
            fetchConsultations(true);
        } catch (err) {
            setBookingError(err?.response?.data?.message || "Gagal upload bukti transfer.");
        } finally {
            setUploadLoading(false);
        }
    };

    const [sessionExpired, setSessionExpired] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    // ── Session Timer ────────────────────────────────────────────────────
    useEffect(() => {
        if (!activeChat) {
            setSessionExpired(false);
            setTimeLeft(null);
            return;
        }

        const isEnded = activeChat.status === "completed" || activeChat.status === "rejected";
        if (isEnded) {
            setSessionExpired(true);
            setTimeLeft(0);
            return;
        }

        const startedAt = new Date(activeChat.created_at).getTime();
        const durationMs = (activeChat.session_duration_minutes || 45) * 60 * 1000;
        const endsAt = startedAt + durationMs;

        const tick = () => {
            const remaining = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) {
                setSessionExpired(true);
                // Auto-mark as completed on backend
                const token = localStorage.getItem("mefasafe_token");
                axios.put(`/api/v1/doctor-consultations/${activeChat.id}`, { status: "completed" }, {
                    headers: { Authorization: `Bearer ${token}` },
                }).catch(() => {});
            }
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [activeChat?.id, activeChat?.status]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;
        if (sessionExpired || activeChat.status === "completed" || activeChat.status === "rejected") return;

        try {
            const token = localStorage.getItem("mefasafe_token");
            const msg = newMessage;
            setNewMessage("");

            await axios.post(`/api/v1/doctor-consultations/${activeChat.id}/messages`, {
                sender: "user",
                message: msg
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Gagal mengirim pesan.");
        }
    };

    const openChat = (consultation) => {
        prevMsgCount.current = (consultation.messages || []).length;
        setMessages(consultation.messages || []);
        setActiveChat(consultation);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const deleteConsultation = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem("mefasafe_token");
            await axios.delete(`/api/v1/doctor-consultations/${deleteTarget.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConsultations(prev => prev.filter(c => c.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (error) {
            console.error("Failed to delete consultation", error);
            alert("Gagal menghapus konsultasi.");
        } finally {
            setDeleting(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Determine if chat is locked
    const isChatLocked = sessionExpired
        || activeChat?.status === "completed"
        || activeChat?.status === "rejected"
        || activeChat?.status === "waiting_approval";


    // Helper: format seconds → MM:SS
    const formatTime = (secs) => {
        if (secs === null) return "";
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // Render Chat View
    if (activeChat) {
        return (
            <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 md:p-6 text-white flex items-center justify-between shadow-lg z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setActiveChat(null)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold backdrop-blur-sm border-2 border-white/50">
                                    <Stethoscope className="w-6 h-6 text-white" />
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-purple-600 ${isChatLocked ? "bg-gray-400" : "bg-green-400"}`}></div>
                            </div>
                            <div>
                                <h2 className="font-bold text-lg leading-tight">{activeChat.doctor_name}</h2>
                                <p className="text-white/80 text-sm flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    {activeChat.specialist_type}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Session timer */}
                        {!isChatLocked && timeLeft !== null && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold
                                ${timeLeft <= 300 ? "bg-red-500/30 text-red-100 animate-pulse" : "bg-white/10 text-white/90"}`}>
                                <Clock className="w-4 h-4" />
                                {formatTime(timeLeft)}
                            </div>
                        )}
                        {isChatLocked && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold bg-gray-500/30 text-white/70">
                                <X className="w-4 h-4" />
                                Sesi Berakhir
                            </div>
                        )}
                        <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                            <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 space-y-4">
                    <div className="text-center">
                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                            Konsultasi Dimulai
                        </span>
                    </div>
                    
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                            <MessageSquare className="w-16 h-16 mb-4" />
                            <p>Belum ada pesan. Mulai sapa dokter Anda!</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={msg.id || idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm relative group ${
                                msg.sender === 'user' 
                                ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-br-sm' 
                                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                            }`}>
                                <p className="text-sm md:text-base leading-relaxed">{msg.message}</p>
                                <span className={`text-[10px] block mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                    {isChatLocked ? (
                        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium">
                            <X className="w-4 h-4" />
                            {activeChat.status === "completed"
                                ? "Sesi konsultasi telah selesai. Chat tidak dapat dilanjutkan."
                                : activeChat.status === "rejected"
                                ? "Konsultasi ditolak. Chat tidak tersedia."
                                : "Waktu sesi 45 menit telah habis. Chat ditutup."}
                        </div>
                    ) : (
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Ketik keluhan Anda di sini..."
                                className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center min-w-[50px]"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-semibold mb-4 border border-white/20">
                                <Stethoscope className="w-4 h-4 text-purple-300" />
                                <span className="text-purple-100">Layanan Medis MefaSafe</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                                Konsultasi Dokter <br/> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">Tanpa Antre</span>
                            </h1>
                            <p className="text-purple-100/80 max-w-xl text-lg">
                                Dapatkan penanganan medis terbaik dari ujung jari Anda. Konsultasi langsung dengan dokter spesialis berpengalaman.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl w-full md:w-fit border border-gray-100 shadow-sm">
                    <button 
                        onClick={() => setActiveTab("doctors")}
                        className={`flex-1 md:w-48 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'doctors' ? 'bg-white shadow-md text-purple-700' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Cari Dokter
                    </button>
                    <button 
                        onClick={() => setActiveTab("history")}
                        className={`flex-1 md:w-48 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'history' ? 'bg-white shadow-md text-purple-700' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Riwayat Konsultasi
                    </button>
                </div>

                {/* Content: Doctors List */}
                {activeTab === "doctors" && (
                    <div className="space-y-6">
                        {/* Search & Filter */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Cari nama dokter atau spesialisasi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                                />
                            </div>
                            <button className="bg-white border border-gray-200 px-6 py-4 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2">
                                <Clock className="w-5 h-5" />
                                Tersedia Hari Ini
                            </button>
                        </div>

                        {/* Doctors Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {doctors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialist.toLowerCase().includes(searchQuery.toLowerCase())).map((doc) => (
                                <div key={doc.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-500 group">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner group-hover:scale-105 transition-transform duration-500"
                                                style={{ background: `hsl(${(doc.name.charCodeAt(3) || 200) * 5 % 360}, 65%, 50%)` }}>
                                                {doc.name.split(' ').slice(1, 3).map(w => w[0]).join('').toUpperCase() || doc.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${doc.status === 'Tersedia' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                                {doc.status === 'Tersedia' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight">{doc.name}</h3>
                                            <p className="text-purple-600 text-sm font-medium mb-2">{doc.specialist}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                    {doc.rating}
                                                </span>
                                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    {doc.exp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => openBookingModal(doc)}
                                            className="col-span-2 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 hover:text-white transition-all duration-300 border border-purple-100 hover:border-transparent flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Mulai Konsultasi
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content: History */}
                {activeTab === "history" && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Konsultasi Anda</h2>
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : consultations.length === 0 ? (
                            <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada konsultasi</h3>
                                <p className="text-gray-500">Anda belum pernah melakukan konsultasi dokter. Mulai cari dokter sekarang!</p>
                                <button 
                                    onClick={() => setActiveTab("doctors")}
                                    className="mt-6 px-6 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-all"
                                >
                                    Cari Dokter
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {consultations.map(c => (
                                    <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 gap-4 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center border border-purple-200">
                                                <Stethoscope className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{c.doctor_name}</h4>
                                                <p className="text-gray-500 text-sm flex items-center gap-2">
                                                    <span>{c.specialist_type}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                    <span className="capitalize">{c.consultation_type}</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col md:items-end gap-2">
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className={`px-3 py-1 rounded-full font-medium text-xs border ${
                                                    c.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    c.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}>
                                                    {c.status === 'waiting_approval' ? 'Menunggu' : 
                                                     c.status === 'approved' ? 'Berlangsung' : 
                                                     c.status === 'completed' ? 'Selesai' : c.status}
                                                </span>
                                                {/* Payment badge */}
                                                <span className={`px-3 py-1 rounded-full font-medium text-xs border ${
                                                    c.payment_status === 'paid'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : c.payment_status === 'pending' && c.payment_method === 'transfer'
                                                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                                                        : c.payment_status === 'failed'
                                                        ? 'bg-red-50 text-red-600 border-red-200'
                                                        : 'bg-red-50 text-red-600 border-red-200'
                                                }`}>
                                                    {c.payment_status === 'paid'
                                                        ? '✓ Lunas'
                                                        : c.payment_status === 'pending' && c.payment_method === 'transfer'
                                                        ? '⏳ Verifikasi Transfer'
                                                        : c.payment_status === 'failed'
                                                        ? '✖ Ditolak'
                                                        : '⚠ Belum Bayar'}
                                                </span>
                                                <span className="text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(c.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-2">
                                                {/* Belum bayar → tombol bayar (sembunyikan jika sudah upload bukti transfer) */}
                                                {c.payment_status === 'pending' && c.payment_method !== 'transfer' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDoctor({ name: c.doctor_name, specialist: c.specialist_type });
                                                            setBookingStep(2);
                                                            setBookingType(c.consultation_type);
                                                            setPaymentMethod(null);
                                                        }}
                                                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-md transition-all text-sm flex items-center gap-2"
                                                    >
                                                        <CreditCard className="w-4 h-4" />
                                                        Bayar Sekarang
                                                    </button>
                                                )}
                                                {/* Sudah bayar → buka chat */}
                                                {c.payment_status === 'paid' && (c.status === 'approved' || c.status === 'waiting_approval') && (
                                                    <button 
                                                        onClick={() => openChat(c)}
                                                        className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:shadow-md transition-all text-sm flex items-center gap-2"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Buka Chat
                                                    </button>
                                                )}
                                                {c.status === 'completed' && (
                                                    <button 
                                                        onClick={() => openChat(c)}
                                                        className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all text-sm flex items-center gap-2"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        Lihat Chat
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDeleteTarget(c)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Hapus konsultasi"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Booking Modal Overlay - Portal ke document.body */}
            {selectedDoctor && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                        {/* ── STEP 1: Pilih Tipe Konsultasi ── */}
                        {bookingStep === 1 && (
                            <>
                                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center">
                                    <h3 className="text-xl font-bold">Mulai Konsultasi</h3>
                                    <p className="text-purple-100 text-sm mt-1">Pilih metode konsultasi Anda</p>
                                </div>
                                <div className="p-6 overflow-y-auto">
                                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0"
                                            style={{ background: `hsl(${(selectedDoctor.name.charCodeAt(3) || 200) * 5 % 360}, 65%, 50%)` }}>
                                            {selectedDoctor.name.split(' ').slice(1, 3).map(w => w[0]).join('').toUpperCase() || selectedDoctor.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{selectedDoctor.name}</h4>
                                            <p className="text-purple-600 text-sm">{selectedDoctor.specialist}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50 flex items-start gap-3 mb-4">
                                        <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-purple-800">
                                            Durasi sesi <strong>45 menit</strong>. Biaya konsultasi <strong>{formatRupiah(CONSULTATION_PRICE)}</strong> per sesi.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => handleSelectType("chat")}
                                            className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group">
                                            <MessageSquare className="w-8 h-8 text-gray-400 group-hover:text-purple-600 mb-2 transition-colors" />
                                            <span className="font-semibold text-gray-700 group-hover:text-purple-700">Chat</span>
                                            <span className="text-xs text-gray-400 mt-0.5">{formatRupiah(CONSULTATION_PRICE)}</span>
                                        </button>
                                        <button disabled className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-200 opacity-50 cursor-not-allowed">
                                            <Video className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="font-semibold text-gray-700">Video Call</span>
                                            <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full mt-1">Segera</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-gray-100">
                                    <button onClick={() => setSelectedDoctor(null)}
                                        className="w-full py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                                        Batal
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ── STEP 2: Pembayaran ── */}
                        {bookingStep === 2 && (
                            <>
                                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                                    <button onClick={() => { setBookingStep(1); setBookingError(""); }}
                                        className="flex items-center gap-1.5 text-purple-200 hover:text-white text-sm mb-3 transition-colors">
                                        <ArrowLeft className="w-4 h-4" /> Kembali
                                    </button>
                                    <h3 className="text-xl font-bold">Pembayaran Konsultasi</h3>
                                    <p className="text-purple-100 text-sm mt-1">Selesaikan pembayaran untuk memulai sesi</p>
                                </div>

                                <div className="p-6 space-y-5 overflow-y-auto">
                                    {/* Ringkasan */}
                                    <div className="rounded-2xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
                                        {[
                                            ["Dokter", selectedDoctor.name],
                                            ["Spesialisasi", selectedDoctor.specialist],
                                            ["Metode", bookingType === "chat" ? "Chat" : "Video Call"],
                                            ["Durasi", "45 Menit"],
                                        ].map(([label, val]) => (
                                            <div key={label} className="flex justify-between items-center px-4 py-3 text-sm">
                                                <span className="text-gray-500">{label}</span>
                                                <span className="font-semibold text-gray-800">{val}</span>
                                            </div>
                                        ))}
                                        {appliedPromo && (
                                            <div className="flex justify-between items-center px-4 py-3 text-sm">
                                                <span className="text-gray-500">Diskon ({appliedPromo.discount_percent}%)</span>
                                                <span className="font-semibold text-emerald-600">- {formatRupiah(appliedPromo.discount_amount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center px-4 py-3">
                                            <span className="font-bold text-gray-900">Total Bayar</span>
                                            <span className="font-black text-purple-600 text-lg">{formatRupiah(consultationPayAmount)}</span>
                                        </div>
                                    </div>

                                    <PromoCodeInput
                                        userId={user?.id}
                                        feature="consultation"
                                        amount={CONSULTATION_PRICE}
                                        value={promoCode}
                                        onChange={setPromoCode}
                                        onApplied={setAppliedPromo}
                                        label="Kode Promo (opsional)"
                                    />

                                    {/* Error */}
                                    {bookingError && (
                                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            {bookingError}
                                        </div>
                                    )}

                                    {/* Pilih Metode Bayar */}
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 mb-3">Pilih Metode Pembayaran</p>
                                        <div className="space-y-2.5">
                                            {/* Saldo Asuransi */}
                                            <button onClick={() => setPaymentMethod("saldo_asuransi")}
                                                className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                                    paymentMethod === "saldo_asuransi" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300 bg-white"
                                                }`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                                    paymentMethod === "saldo_asuransi" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                    <Wallet className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-semibold text-sm ${paymentMethod === "saldo_asuransi" ? "text-purple-800" : "text-gray-800"}`}>
                                                        Saldo Asuransi MefaSafe
                                                    </p>
                                                    {userPolicy ? (
                                                        <div className="mt-1 space-y-0.5">
                                                            <p className="text-xs text-gray-500">
                                                                Polis: <span className="font-semibold">{userPolicy.policy_number}</span>
                                                                {" · "}<span className="capitalize">{userPolicy.insurance_type}</span>
                                                            </p>
                                                            {policyBalance !== null && (
                                                                <p className="text-xs">
                                                                    Saldo:{" "}
                                                                    <span className={`font-bold ${policyBalance < consultationPayAmount ? "text-red-500" : "text-emerald-600"}`}>
                                                                        {formatRupiah(policyBalance)}
                                                                    </span>
                                                                    {paymentMethod === "saldo_asuransi" && policyBalance >= consultationPayAmount && (
                                                                        <span className="text-gray-400"> → {formatRupiah(policyBalance - consultationPayAmount)}</span>
                                                                    )}
                                                                </p>
                                                            )}
                                                            {policyBalance !== null && policyBalance < consultationPayAmount && (
                                                                <p className="text-xs text-red-500 font-medium">Saldo tidak mencukupi</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-amber-600 mt-1">Tidak ada polis aktif</p>
                                                    )}
                                                </div>
                                                {paymentMethod === "saldo_asuransi" && <BadgeCheck className="w-5 h-5 text-purple-500 shrink-0 mt-1" />}
                                            </button>

                                            {/* Transfer Bank */}
                                            <button onClick={() => setPaymentMethod("transfer")}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                                                    paymentMethod === "transfer" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300 bg-white"
                                                }`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                    paymentMethod === "transfer" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-semibold text-sm ${paymentMethod === "transfer" ? "text-purple-800" : "text-gray-800"}`}>
                                                        Transfer Bank / Virtual Account
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">BCA, Mandiri, BNI — upload bukti, tunggu verifikasi admin</p>
                                                </div>
                                                {paymentMethod === "transfer" && <BadgeCheck className="w-5 h-5 text-purple-500 shrink-0" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-gray-100 flex gap-3">
                                    <button onClick={() => setSelectedDoctor(null)}
                                        className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                                        Batal
                                    </button>
                                    <button onClick={bookConsultation}
                                        disabled={!paymentMethod || bookingLoading || (paymentMethod === "saldo_asuransi" && (!userPolicy || policyBalance < consultationPayAmount))}
                                        className="flex-1 py-3 font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {bookingLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                                        ) : paymentMethod === "transfer" ? (
                                            <><CreditCard className="w-4 h-4" /> Lanjut ke Transfer</>
                                        ) : (
                                            <><CheckCircle2 className="w-4 h-4" /> Bayar & Mulai</>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ── STEP 3: Upload Bukti Transfer ── */}
                        {bookingStep === 3 && (
                            <>
                                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                                    <h3 className="text-xl font-bold">Upload Bukti Transfer</h3>
                                    <p className="text-purple-100 text-sm mt-1">Transfer ke salah satu rekening berikut, lalu upload buktinya</p>
                                </div>

                                <div className="p-6 space-y-5 overflow-y-auto">
                                    {/* Nominal */}
                                    <div className="rounded-2xl bg-purple-50 border border-purple-200 p-4 text-center">
                                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">Nominal Transfer</p>
                                        <p className="text-3xl font-black text-purple-700">{formatRupiah(consultationPayAmount)}</p>
                                        <p className="text-xs text-purple-500 mt-1">Pastikan nominal tepat agar verifikasi lebih cepat</p>
                                    </div>

                                    {/* Rekening */}
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 mb-3">Rekening Tujuan</p>
                                        <div className="space-y-2.5">
                                            {BANK_ACCOUNTS.map(acc => (
                                                <div key={acc.bank} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 bg-white">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                                        <Building2 className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 text-sm">{acc.bank}</p>
                                                        <p className="text-base font-mono font-semibold text-gray-700 tracking-wider">{acc.norek}</p>
                                                        <p className="text-xs text-gray-400">{acc.atas_nama}</p>
                                                    </div>
                                                    <button onClick={() => copyNorek(acc.norek)}
                                                        className={`p-2 rounded-xl transition-all ${copiedNorek === acc.norek ? "bg-green-100 text-green-600" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}
                                                        title="Salin nomor rekening">
                                                        {copiedNorek === acc.norek ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Upload Bukti */}
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 mb-3">Upload Bukti Transfer</p>
                                        <label className={`flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                                            proofFile ? "border-purple-400 bg-purple-50" : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50"
                                        }`}>
                                            <input type="file" className="hidden" accept="image/*,.pdf"
                                                onChange={e => setProofFile(e.target.files[0] || null)} />
                                            {proofFile ? (
                                                <div className="text-center px-4">
                                                    <CheckCircle2 className="w-8 h-8 text-purple-500 mx-auto mb-1" />
                                                    <p className="text-sm font-semibold text-purple-700 truncate max-w-[220px]">{proofFile.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">Klik untuk ganti file</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">Klik untuk upload bukti transfer</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, atau PDF · Maks 5MB</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    {/* Info verifikasi */}
                                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-xl">
                                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                                        <span>Setelah upload, admin akan memverifikasi pembayaran Anda. Chat akan terbuka setelah verifikasi selesai (biasanya dalam 1×24 jam).</span>
                                    </div>

                                    {/* Error */}
                                    {bookingError && (
                                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            {bookingError}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-gray-100 flex gap-3">
                                    <button onClick={() => setSelectedDoctor(null)}
                                        className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                                        Nanti Saja
                                    </button>
                                    <button onClick={uploadProof}
                                        disabled={!proofFile || uploadLoading}
                                        className="flex-1 py-3 font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        {uploadLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> Kirim Bukti</>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation Modal - Portal ke document.body */}
            {deleteTarget && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Trash2 className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold">Hapus Konsultasi?</h3>
                            <p className="text-red-100 text-sm mt-1">Tindakan ini tidak dapat dibatalkan</p>
                        </div>
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">
                                <p className="font-semibold text-gray-900">{deleteTarget.doctor_name}</p>
                                <p className="text-sm text-gray-500">{deleteTarget.specialist_type} &bull; {deleteTarget.consultation_type}</p>
                            </div>
                            <p className="text-sm text-gray-600 text-center mb-5">
                                Semua riwayat pesan dalam konsultasi ini juga akan dihapus secara permanen.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={deleting}
                                    className="flex-1 py-3 px-4 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Batal
                                </button>
                                <button
                                    onClick={deleteConsultation}
                                    disabled={deleting}
                                    className="flex-1 py-3 px-4 font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menghapus...</>
                                    ) : (
                                        <><Trash2 className="w-4 h-4" /> Hapus</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Search, Loader2, MessageSquare, Send, CheckCircle2, XCircle, Clock, Eye, X, CreditCard, AlertCircle, Download, CheckCheck } from "lucide-react";

const API = "/api/v1/admin";
const token = () => localStorage.getItem("admin_token");

const STATUS_CFG = {
    waiting_approval: { label: "Menunggu",   color: "bg-amber-100 text-amber-700",   icon: Clock },
    approved:         { label: "Disetujui",  color: "bg-green-100 text-green-700",   icon: CheckCircle2 },
    rejected:         { label: "Ditolak",    color: "bg-red-100 text-red-700",       icon: XCircle },
    completed:        { label: "Selesai",    color: "bg-blue-100 text-blue-700",     icon: CheckCircle2 },
};

const PAYMENT_STATUS_CFG = {
    pending: { label: "Menunggu Verifikasi", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
    paid:    { label: "Terverifikasi",       color: "bg-green-100 text-green-700", icon: CheckCheck },
    failed:  { label: "Ditolak",             color: "bg-red-100 text-red-700",     icon: XCircle },
};

// Format seconds → MM:SS
const formatTime = (secs) => {
    if (secs === null || secs === undefined) return "";
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

export default function AdminConsultations() {
    const [consultations, setConsultations] = useState([]);
    const [meta, setMeta]                   = useState({});
    const [loading, setLoading]             = useState(true);
    const [search, setSearch]               = useState("");
    const [status, setStatus]               = useState("");
    const [page, setPage]                   = useState(1);
    const [selected, setSelected]           = useState(null);
    const [messages, setMessages]           = useState([]);
    const [msgInput, setMsgInput]           = useState("");
    const [sending, setSending]             = useState(false);
    const [updating, setUpdating]           = useState(null);
    const [verifyingPayment, setVerifyingPayment] = useState(null);
    const [toast, setToast]                 = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const msgEndRef                         = useRef(null);
    const [timeLeft, setTimeLeft]           = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);

    // Auto-poll messages every 3 seconds when a chat is open
    useEffect(() => {
        if (!selected) return;
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${API}/consultations`, {
                    headers: { Authorization: `Bearer ${token()}` },
                    params: { search: "", status: "", page: 1, per_page: 100 },
                });
                const all = res.data.data.data || [];
                const updated = all.find((c) => c.id === selected.id);
                if (updated) {
                    const newMsgs = updated.messages || [];
                    if (newMsgs.length > messages.length) {
                        setMessages(newMsgs);
                        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                    }
                    // Sync status changes (e.g. completed from user side)
                    if (updated.status !== selected.status) {
                        setSelected((prev) => ({ ...prev, status: updated.status }));
                    }
                }
            } catch (e) { /* silent */ }
        }, 3000);
        return () => clearInterval(interval);
    }, [selected?.id, messages.length]);

    // Session countdown timer
    useEffect(() => {
        if (!selected) {
            setTimeLeft(null);
            setSessionExpired(false);
            return;
        }

        const isEnded = selected.status === "completed" || selected.status === "rejected";
        if (isEnded) {
            setSessionExpired(true);
            setTimeLeft(0);
            return;
        }

        const startedAt = new Date(selected.created_at).getTime();
        const durationMs = (selected.session_duration_minutes || 45) * 60 * 1000;
        const endsAt = startedAt + durationMs;

        const tick = () => {
            const remaining = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) {
                setSessionExpired(true);
                // Auto-mark completed
                axios.put(`${API}/consultations/${selected.id}`, { status: "completed" }, {
                    headers: { Authorization: `Bearer ${token()}` },
                }).catch(() => {});
            }
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [selected?.id, selected?.status]);

    const fetchConsultations = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/consultations`, {
                headers: { Authorization: `Bearer ${token()}` },
                params: { search, status, page, per_page: 12 },
            });
            setConsultations(res.data.data.data || []);
            setMeta(res.data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchConsultations(); }, [search, status, page]);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    const openChat = (c) => {
        setSelected(c);
        setMessages(c.messages || []);
        setShowPaymentModal(false);
        setSessionExpired(false);
        setTimeLeft(null);
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const handleSend = async () => {
        if (!msgInput.trim() || !selected) return;
        if (sessionExpired || selected.status === "completed" || selected.status === "rejected") return;
        setSending(true);
        try {
            const res = await axios.post(`${API}/consultations/${selected.id}/messages`,
                { message: msgInput },
                { headers: { Authorization: `Bearer ${token()}` } }
            );
            setMessages((prev) => [...prev, res.data.data]);
            setMsgInput("");
            setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (e) { showToast("Gagal mengirim pesan."); }
        finally { setSending(false); }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setUpdating(id + newStatus);
        try {
            await axios.put(`${API}/consultations/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token()}` } });
            showToast("Status konsultasi diperbarui.");
            fetchConsultations();
            if (selected?.id === id) setSelected((prev) => ({ ...prev, status: newStatus }));
        } catch (e) { showToast("Gagal memperbarui."); }
        finally { setUpdating(null); }
    };

    const handleVerifyPayment = async (action) => {
        if (!selected) return;
        setVerifyingPayment(action);
        try {
            const res = await axios.post(`${API}/consultations/${selected.id}/verify-payment`,
                { action },
                { headers: { Authorization: `Bearer ${token()}` } }
            );
            setSelected((prev) => ({ ...prev, payment_status: res.data.data.payment_status, status: res.data.data.status }));
            showToast(res.data.message);
            fetchConsultations();
            if (action === 'reject') setShowPaymentModal(false);
        } catch (e) {
            showToast(e.response?.data?.message || "Gagal memverifikasi pembayaran.");
        }
        finally { setVerifyingPayment(null); }
    };

    return (
        <div className="space-y-4">
            {toast && (
                <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl text-sm">{toast}</div>
            )}

            {/* Payment Verification Modal */}
            {showPaymentModal && selected && selected.payment_method === 'transfer' && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-slate-800">Verifikasi Pembayaran Transfer</h3>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {/* User & Consultation Info */}
                            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                                <p className="text-sm"><span className="font-semibold text-slate-600">Pengguna:</span> {selected.user?.name}</p>
                                <p className="text-sm"><span className="font-semibold text-slate-600">Dokter:</span> {selected.doctor_name} ({selected.specialist_type})</p>
                                <p className="text-sm"><span className="font-semibold text-slate-600">Tipe Konsultasi:</span> {selected.consultation_type}</p>
                            </div>

                            {/* Payment Status */}
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-sm font-semibold text-slate-600 mb-2">Status Pembayaran</p>
                                {selected.payment_status && (
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const cfg = PAYMENT_STATUS_CFG[selected.payment_status] || PAYMENT_STATUS_CFG.pending;
                                            const Icon = cfg.icon;
                                            return (
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                    <Icon className="w-3 h-3" />{cfg.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Payment Proof */}
                            {selected.payment_proof_path && (
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-sm font-semibold text-slate-600 mb-2">Bukti Pembayaran</p>
                                    {(() => {
                                        const url = `/storage/${selected.payment_proof_path}`;
                                        const ext = (selected.payment_proof_path || '').split('.').pop()?.toLowerCase();
                                        if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif') {
                                            return (
                                                <div className="space-y-2">
                                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                                        <img src={url} alt="Bukti Pembayaran" className="w-full max-h-64 object-contain rounded-lg border" />
                                                    </a>
                                                    <div>
                                                        <a href={url} target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition">
                                                            <Download className="w-3.5 h-3.5" />
                                                            Buka di tab baru
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (ext === 'pdf') {
                                            return (
                                                <div className="space-y-2">
                                                    <iframe src={url} title="Bukti Pembayaran" className="w-full h-64 rounded-md border" />
                                                    <div>
                                                        <a href={url} target="_blank" rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition">
                                                            <Download className="w-3.5 h-3.5" />
                                                            Unduh / Buka di tab baru
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Fallback: show link
                                        return (
                                            <a href={url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition">
                                                <Download className="w-3.5 h-3.5" />
                                                Lihat Bukti
                                            </a>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selected.payment_status === 'pending' && (
                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => handleVerifyPayment('approve')}
                                        disabled={verifyingPayment !== null}
                                        className="flex-1 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold text-sm hover:bg-green-200 disabled:opacity-50 transition flex items-center justify-center gap-2">
                                        {verifyingPayment === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Terima
                                    </button>
                                    <button onClick={() => handleVerifyPayment('reject')}
                                        disabled={verifyingPayment !== null}
                                        className="flex-1 px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold text-sm hover:bg-red-200 disabled:opacity-50 transition flex items-center justify-center gap-2">
                                        {verifyingPayment === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                        Tolak
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            {!showPaymentModal && selected && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm">{selected.user?.name}</p>
                                <p className="text-xs text-slate-500">{selected.doctor_name} · {selected.specialist_type}</p>
                            </div>

                            {/* Payment Verification Badge & Button */}
                            {selected.payment_method === 'transfer' && (
                                <div className="flex items-center gap-2">
                                    {selected.payment_status && (
                                        <>
                                            {(() => {
                                                const cfg = PAYMENT_STATUS_CFG[selected.payment_status] || PAYMENT_STATUS_CFG.pending;
                                                const Icon = cfg.icon;
                                                return (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                        <Icon className="w-3 h-3" />{cfg.label}
                                                    </span>
                                                );
                                            })()}
                                        </>
                                    )}
                                    {selected.payment_status === 'pending' && (
                                        <button onClick={() => setShowPaymentModal(true)}
                                            className="p-1.5 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200">
                                            <CreditCard className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Timer */}
                            {!sessionExpired && timeLeft !== null && (
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold
                                    ${timeLeft <= 300 ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-600"}`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTime(timeLeft)}
                                </div>
                            )}
                            {sessionExpired && (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-500">
                                    <X className="w-3.5 h-3.5" />
                                    Selesai
                                </div>
                            )}
                            <div className="flex gap-2">
                                {selected.status === "waiting_approval" && (
                                    <>
                                        {/* Check if payment needs verification for transfer method */}
                                        {selected.payment_method === 'transfer' && selected.payment_status !== 'paid' ? (
                                            <button disabled title="Verifikasi pembayaran transfer terlebih dahulu"
                                                className="px-2 py-1 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold opacity-50 cursor-not-allowed">
                                                Setujui
                                            </button>
                                        ) : (
                                            <button onClick={() => handleUpdateStatus(selected.id, "approved")}
                                                className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200">
                                                Setujui
                                            </button>
                                        )}
                                        <button onClick={() => handleUpdateStatus(selected.id, "rejected")}
                                            className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200">
                                            Tolak
                                        </button>
                                    </>
                                )}
                                {selected.status === "approved" && !sessionExpired && (
                                    <button onClick={() => handleUpdateStatus(selected.id, "completed")}
                                        className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200">
                                        Selesai
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                            {messages.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-8">Belum ada pesan.</p>
                            ) : messages.map((m) => (
                                <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm
                                        ${m.sender === "admin"
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-slate-100 text-slate-800 rounded-bl-sm"}`}>
                                        <p>{m.message}</p>
                                        <p className={`text-xs mt-1 ${m.sender === "admin" ? "text-blue-200" : "text-slate-400"}`}>
                                            {new Date(m.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={msgEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-200">
                            {sessionExpired || selected.status === "completed" || selected.status === "rejected" ? (
                                <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium">
                                    <X className="w-4 h-4" />
                                    {selected.status === "completed"
                                        ? "Sesi selesai. Chat tidak dapat dilanjutkan."
                                        : selected.status === "rejected"
                                        ? "Konsultasi ditolak."
                                        : "Waktu sesi 45 menit telah habis."}
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        value={msgInput}
                                        onChange={(e) => setMsgInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                        placeholder="Ketik balasan admin..."
                                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <button onClick={handleSend} disabled={sending || !msgInput.trim()}
                                        className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Cari pengguna atau dokter..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Semua Status</option>
                    <option value="waiting_approval">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                    <option value="completed">Selesai</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Pengguna</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Dokter</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Spesialis</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Pembayaran</th>
                                <th className="text-left px-4 py-3 font-semibold text-slate-600">Tanggal</th>
                                <th className="text-right px-4 py-3 font-semibold text-slate-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                                </td></tr>
                            ) : consultations.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Tidak ada konsultasi.</td></tr>
                            ) : consultations.map((c) => {
                                const cfg = STATUS_CFG[c.status] || STATUS_CFG.waiting_approval;
                                const Icon = cfg.icon;
                                const paymentCfg = PAYMENT_STATUS_CFG[c.payment_status] || PAYMENT_STATUS_CFG.pending;
                                const PaymentIcon = paymentCfg.icon;
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-800">{c.user?.name || "-"}</td>
                                        <td className="px-4 py-3 text-slate-600">{c.doctor_name}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{c.specialist_type}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                <Icon className="w-3 h-3" />{cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {c.payment_method === 'transfer' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-slate-600">Transfer</span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${paymentCfg.color}`}>
                                                        <PaymentIcon className="w-3 h-3" />{paymentCfg.label}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-600">{c.payment_method || "-"}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">
                                            {new Date(c.created_at).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openChat(c)}
                                                    className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200">
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                {c.payment_method === 'transfer' && c.payment_status === 'pending' && (
                                                    <button onClick={() => { setSelected(c); setShowPaymentModal(true); }}
                                                        className="p-1.5 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200" title="Verifikasi pembayaran">
                                                        <CreditCard className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {c.status === "waiting_approval" && (
                                                    <>
                                                        {c.payment_method === 'transfer' && c.payment_status !== 'paid' ? (
                                                            <button disabled title="Verifikasi pembayaran transfer terlebih dahulu"
                                                                className="px-2 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-xs font-semibold opacity-50 cursor-not-allowed">
                                                                Setujui
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleUpdateStatus(c.id, "approved")}
                                                                disabled={!!updating}
                                                                className="px-2 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 disabled:opacity-50">
                                                                Setujui
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleUpdateStatus(c.id, "rejected")}
                                                            disabled={!!updating}
                                                            className="px-2 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 disabled:opacity-50">
                                                            Tolak
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
                        <span>Halaman {meta.current_page} dari {meta.last_page} ({meta.total} konsultasi)</span>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">← Prev</button>
                            <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * ChatNotifToast — popup notifikasi pesan chat baru.
 * Muncul di pojok kanan bawah, auto-dismiss setelah 5 detik.
 */
import { useEffect, useState } from "react";
import { MessageSquare, X, Stethoscope } from "lucide-react";

export default function ChatNotifToast({ toasts, onDismiss, onOpen }) {
    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onDismiss={onDismiss} onOpen={onOpen} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss, onOpen }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate in
        const show = setTimeout(() => setVisible(true), 10);
        // Auto-dismiss after 5s
        const hide = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }, 5000);
        return () => { clearTimeout(show); clearTimeout(hide); };
    }, [toast.id]);

    return (
        <div
            className={`pointer-events-auto flex items-start gap-3 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-80 transition-all duration-300
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                    {toast.role === "admin" ? "Pesan dari Pengguna" : "Pesan dari Dokter/Admin"}
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">{toast.senderName}</p>
                <p className="text-sm text-slate-600 truncate mt-0.5">{toast.message}</p>
                {onOpen && (
                    <button
                        onClick={() => onOpen(toast.consultationId)}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                        Buka Chat →
                    </button>
                )}
            </div>

            {/* Dismiss */}
            <button
                onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 300); }}
                className="text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 rounded-b-2xl overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-shrink-bar" />
            </div>
        </div>
    );
}

/**
 * useChatNotif — shared hook untuk polling pesan konsultasi baru.
 *
 * Cara kerja:
 * - Setiap 4 detik fetch semua konsultasi milik user (atau semua untuk admin).
 * - Bandingkan jumlah pesan terbaru dengan snapshot sebelumnya.
 * - Kalau ada pesan baru dari lawan bicara → increment badge + trigger toast.
 *
 * @param {object} options
 * @param {string}   options.role        - "user" | "admin"
 * @param {number}   [options.userId]    - ID user (untuk sisi user)
 * @param {function} [options.onNewMsg]  - callback(consultationId, message) saat ada pesan baru
 */
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BASE = "/api/v1";

export function useChatNotif({ role, userId, onNewMsg } = {}) {
    const [unreadCount, setUnreadCount] = useState(0);
    // Map: consultationId → last known message count
    const snapshot = useRef({});
    // Set of consultation IDs currently open (so we don't badge those)
    const openChats = useRef(new Set());

    const markOpen = (id) => openChats.current.add(id);
    const markClosed = (id) => {
        openChats.current.delete(id);
        // Clear badge for this chat
        snapshot.current[id] = snapshot.current[id]; // keep count, just remove from unread
    };
    const clearAll = () => setUnreadCount(0);

    useEffect(() => {
        if (role === "user" && !userId) return;

        const poll = async () => {
            try {
                let consultations = [];

                if (role === "user") {
                    const token = localStorage.getItem("mefasafe_token");
                    const res = await axios.get(`${BASE}/doctor-consultations`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    consultations = (res.data.data || []).filter((c) => c.user_id === userId);
                } else {
                    // admin
                    const token = localStorage.getItem("admin_token");
                    const res = await axios.get(`${BASE}/admin/consultations`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { per_page: 50 },
                    });
                    consultations = res.data.data?.data || [];
                }

                let newUnread = 0;

                for (const c of consultations) {
                    const msgs = c.messages || [];
                    const prevCount = snapshot.current[c.id] ?? msgs.length;
                    const isOpen = openChats.current.has(c.id);

                    if (msgs.length > prevCount) {
                        // There are new messages
                        const newMsgs = msgs.slice(prevCount);
                        for (const msg of newMsgs) {
                            // For user: notify on admin messages; for admin: notify on user messages
                            const isFromOther =
                                (role === "user" && msg.sender === "admin") ||
                                (role === "admin" && msg.sender === "user");

                            if (isFromOther) {
                                if (!isOpen) newUnread++;
                                if (onNewMsg) onNewMsg(c.id, msg, c);
                            }
                        }
                    }

                    snapshot.current[c.id] = msgs.length;
                }

                if (newUnread > 0) {
                    setUnreadCount((prev) => prev + newUnread);
                }
            } catch (e) {
                // silent — don't spam console on every poll
            }
        };

        // Initial poll
        poll();
        const interval = setInterval(poll, 4000);
        return () => clearInterval(interval);
    }, [role, userId]);

    return { unreadCount, clearAll, markOpen, markClosed };
}

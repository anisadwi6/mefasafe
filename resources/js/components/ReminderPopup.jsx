import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, CalendarClock, Clock3, X, ArrowRight } from "lucide-react";

const API = "/api/v1";

export default function ReminderPopup({ userId }) {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [closedIds, setClosedIds] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  const visibleReminders = useMemo(() => {
    return reminders.filter((reminder) => !closedIds.includes(reminder.id));
  }, [reminders, closedIds]);

  useEffect(() => {
    if (!userId) {
      setReminders([]);
      setIsVisible(false);
      return;
    }

    let isMounted = true;

    const fetchTodayReminders = async () => {
      try {
        const token = localStorage.getItem("mefasafe_token") || localStorage.getItem("token");
        const response = await axios.get(`${API}/reminders/today`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: userId },
        });

        if (!isMounted) return;

        if (response.data.success) {
          setReminders(response.data.data || []);
        }
      } catch (error) {
        console.error("Reminder popup fetch error:", error);
      }
    };

    fetchTodayReminders();
    const intervalId = window.setInterval(fetchTodayReminders, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [userId]);

  useEffect(() => {
    setIsVisible(visibleReminders.length > 0);
  }, [visibleReminders]);

  if (!isVisible || visibleReminders.length === 0) {
    return null;
  }

  const closePopup = () => {
    setClosedIds((prev) => Array.from(new Set([...prev, ...visibleReminders.map((item) => item.id)])));
  };

  const topReminder = visibleReminders[0];

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4 sm:px-6 pointer-events-none">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-white/70 bg-white/95 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.4)] backdrop-blur-xl p-4 sm:p-5 pointer-events-auto">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-3 text-white shrink-0">
            <Bell className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-500">Pengingat Hari Ini</p>
                <h2 className="mt-1 text-base font-black text-slate-900">{visibleReminders.length} reminder aktif</h2>
              </div>
              <button
                type="button"
                aria-label="Tutup popup pengingat"
                onClick={closePopup}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {visibleReminders.slice(0, 3).map((reminder) => (
                <div
                  key={reminder.id}
                  className="rounded-2xl border border-orange-100 bg-orange-50/80 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{reminder.title}</p>
                      {reminder.description && (
                        <p className="mt-1 text-xs text-slate-600">{reminder.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-orange-600">
                      <Clock3 className="w-3.5 h-3.5" />
                      {reminder.reminder_time ? reminder.reminder_time.slice(0, 5) : "--:--"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  closePopup();
                  navigate("/kalender");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                <CalendarClock className="w-4 h-4" />
                Buka Kalender Pengingat
                <ArrowRight className="w-4 h-4" />
              </button>
              {topReminder?.reminder_time && (
                <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                  {topReminder.reminder_time.slice(0, 5)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

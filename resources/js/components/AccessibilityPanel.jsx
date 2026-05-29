import { X, Type, Contrast, Zap, RotateCcw } from "lucide-react";

export default function AccessibilityPanel({ open, onClose, settings, onUpdate, onReset }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" role="dialog" aria-labelledby="a11y-title">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Aksesibilitas</p>
            <h2 id="a11y-title" className="text-lg font-bold text-slate-900">Pengaturan Tampilan</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Type className="h-4 w-4" /> Ukuran Teks
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Normal", value: 100 },
                { label: "Besar", value: 112 },
                { label: "Sangat Besar", value: 125 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdate({ fontPercent: opt.value })}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    settings.fontPercent === opt.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Contrast className="h-4 w-4" /> Kontras Tinggi
            </span>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => onUpdate({ highContrast: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-blue-600"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Zap className="h-4 w-4" /> Kurangi Animasi
            </span>
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(e) => onUpdate({ reduceMotion: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-blue-600"
            />
          </label>

          <p className="text-xs text-slate-500">
            Pengaturan disimpan otomatis di perangkat Anda dan berlaku di seluruh halaman MefaSafe.
          </p>
        </div>

        <div className="flex gap-2 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Info, Sparkles } from "lucide-react";
import family from "../../../assets/family.png";

const THEMES = {
  promo: {
    gradient: "from-violet-700 via-purple-600 to-fuchsia-600",
    sideGradient: "from-pink-500 to-rose-600",
    button: "bg-white text-purple-700 hover:bg-purple-50",
    badge: "bg-white/20 text-white",
    icon: Sparkles,
  },
  info: {
    gradient: "from-teal-700 via-emerald-600 to-cyan-600",
    sideGradient: "from-sky-500 to-blue-600",
    button: "bg-white text-emerald-700 hover:bg-emerald-50",
    badge: "bg-white/20 text-white",
    icon: Info,
  },
};

function BannerCard({ banner, variant = "main", onAction }) {
  const theme = THEMES[banner.kind] || THEMES.promo;
  const Icon = theme.icon;
  const isMain = variant === "main";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} text-white shadow-xl ${
        isMain ? "min-h-[280px] md:min-h-[320px]" : "min-h-[280px] md:min-h-full"
      }`}
    >
      <div className={`relative flex h-full flex-col ${isMain ? "md:flex-row" : ""} items-stretch`}>
        <div className={`flex flex-1 flex-col justify-center p-6 md:p-8 ${isMain ? "md:max-w-[58%]" : ""}`}>
          <span className={`mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${theme.badge}`}>
            <Icon className="h-3.5 w-3.5" />
            {banner.badge}
            {banner.kind === "promo" && banner.discount_percent ? (
              <span className="ml-1 rounded-full bg-white/25 px-2 py-0.5">Diskon {banner.discount_percent}%</span>
            ) : null}
          </span>
          <h3 className={`font-black leading-tight ${isMain ? "text-2xl md:text-3xl" : "text-xl"}`}>{banner.title}</h3>
          <p className={`mt-2 text-white/90 ${isMain ? "text-sm md:text-base line-clamp-3" : "text-sm line-clamp-4"}`}>
            {banner.description}
          </p>
          {banner.button_label && banner.button_url && (
            <button
              type="button"
              onClick={() => onAction(banner.button_url)}
              className={`mt-5 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition hover:scale-[1.02] ${theme.button}`}
            >
              {banner.button_label}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className={`relative flex items-end justify-center ${isMain ? "md:w-[42%] p-4 md:p-6" : "p-4 pt-0"}`}>
          <div className="absolute inset-0 bg-white/10 blur-3xl" />
          <img
            src={banner.image_url || family}
            alt={banner.title}
            className={`relative z-10 object-contain drop-shadow-2xl ${
              isMain ? "h-44 md:h-56 w-auto max-w-full" : "h-36 w-auto max-w-full"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default function BannerCarousel({ banners, onNavigate }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [banners]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (!banners?.length) return null;

  const main = banners[index];
  const side = banners.length > 1 ? banners[(index + 1) % banners.length] : null;

  const prev = () => setIndex((current) => (current - 1 + banners.length) % banners.length);
  const next = () => setIndex((current) => (current + 1) % banners.length);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promo & Informasi</h2>
          <p className="text-sm text-gray-500">Penawaran dan pengumuman terbaru dari MefaSafe</p>
        </div>
        {banners.length > 1 && (
          <div className="hidden items-center gap-2 sm:flex">
            <button type="button" onClick={prev} className="rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button type="button" onClick={next} className="rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <div className={`grid gap-4 ${side ? "lg:grid-cols-3" : ""}`}>
        <div className={side ? "lg:col-span-2" : ""}>
          <BannerCard banner={main} variant="main" onAction={onNavigate} />
        </div>
        {side && (
          <div className="hidden lg:block">
            <BannerCard banner={side} variant="side" onAction={onNavigate} />
          </div>
        )}
      </div>

      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {banners.map((banner, dotIndex) => (
            <button
              key={banner.uid}
              type="button"
              onClick={() => setIndex(dotIndex)}
              className={`h-2.5 rounded-full transition-all ${
                dotIndex === index ? "w-8 bg-purple-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Banner ${dotIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

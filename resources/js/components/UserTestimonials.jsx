import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Quote } from "lucide-react";
import { resolveMediaUrl } from "../utils/mediaUrl";

function TestimonialAvatar({ src, name }) {
  const [failed, setFailed] = useState(false);
  const avatarSrc = resolveMediaUrl(src);

  if (!avatarSrc || failed) {
    const label = (name || "M")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-400 to-rose-500 text-2xl font-black text-white">
        {label}
      </div>
    );
  }

  return (
    <img
      src={avatarSrc}
      alt={name}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function UserTestimonials({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/v1/feedbacks/featured")
      .then((res) => setItems(res.data?.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-4">
      <div className="mb-8 text-center md:text-left">
        <h2 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">
          Kata Mereka tentang MefaSafe
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Pengalaman nyata dari pengguna yang telah memakai layanan kami
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="flex flex-col items-center text-center">
            <div className="mb-5 h-24 w-24 overflow-hidden rounded-full border-4 border-pink-100 bg-pink-50 shadow-sm">
              <TestimonialAvatar src={item.user_avatar} name={item.user_name} />
            </div>

            <Quote className="mb-2 h-5 w-5 text-pink-300" />

            <p className="font-serif text-lg leading-relaxed text-slate-800">
              &ldquo;{item.content}&rdquo;
            </p>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              {item.user_name}
            </p>

            <button
              type="button"
              onClick={() => onNavigate?.(item.cta_url)}
              className="mt-5 rounded-full border-2 border-pink-500 px-5 py-2 text-sm font-bold text-pink-600 transition hover:bg-pink-500 hover:text-white"
            >
              {item.cta_label}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

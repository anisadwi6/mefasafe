/**
 * Normalisasi URL media agar selalu memakai origin halaman saat ini.
 * Memperbaiki URL lama yang tersimpan sebagai http://localhost/... saat diakses via 127.0.0.1:8000.
 */
export function resolveMediaUrl(url) {
  if (!url || url === "") return null;
  if (url.startsWith("blob:")) return url;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);
      return `${window.location.origin}${parsed.pathname}`;
    } catch {
      return url;
    }
  }

  return `${window.location.origin}/${String(url).replace(/^\//, "")}`;
}

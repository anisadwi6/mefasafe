import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Phone, Mail, Search, Filter,
  Navigation, Building2, Loader2, Star,
  ChevronRight, X, BadgeCheck, AlertCircle,
} from "lucide-react";

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icon untuk RS mitra
const partnerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Custom icon untuk lokasi user
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const TYPE_LABELS = {
  umum: "RS Umum", swasta: "RS Swasta",
  khusus: "RS Khusus", puskesmas: "Puskesmas",
};

const TYPE_COLORS = {
  umum: "bg-blue-100 text-blue-700",
  swasta: "bg-purple-100 text-purple-700",
  khusus: "bg-orange-100 text-orange-700",
  puskesmas: "bg-green-100 text-green-700",
};

export default function DaftarRS({ user }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const [hospitals, setHospitals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPartner, setFilterPartner] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const token = localStorage.getItem("mefasafe_token");

  // ── Fetch hospitals ──────────────────────────────────────────────────
  const fetchHospitals = async (lat = null, lng = null) => {
    try {
      const params = {};
      if (lat && lng) { params.lat = lat; params.lng = lng; }
      const res = await axios.get("/api/v1/hospitals", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      if (res.data.success) {
        setHospitals(res.data.data);
        setFiltered(res.data.data);
      }
    } catch (e) {
      console.error("Error fetching hospitals:", e);
    } finally {
      setLoading(false);
    }
  };

  // ── Init map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-7.9666, 112.6326], // Default: Malang
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    fetchHospitals();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ── Update markers saat hospitals berubah ────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Hapus marker lama
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filtered.forEach((h) => {
      const marker = L.marker([h.latitude, h.longitude], { icon: partnerIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="min-width:200px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${h.name}</div>
            <div style="font-size:12px;color:#666;margin-bottom:4px">${h.address}, ${h.city}</div>
            ${h.distance_km ? `<div style="font-size:12px;color:#3b82f6;font-weight:600">📍 ${h.distance_km} km dari lokasi Anda</div>` : ""}
            ${h.phone ? `<div style="font-size:12px;margin-top:4px">📞 ${h.phone}</div>` : ""}
            ${h.is_partner ? `<div style="font-size:11px;color:#10b981;font-weight:600;margin-top:4px">✓ Mitra MefaSafe</div>` : ""}
          </div>
        `);

      marker.on("click", () => setSelectedHospital(h));
      markersRef.current.push(marker);
    });
  }, [filtered]);

  // ── Get user location ────────────────────────────────────────────────
  const getUserLocation = () => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Browser tidak mendukung geolokasi.");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Hapus marker user lama
        if (userMarkerRef.current) userMarkerRef.current.remove();

        // Tambah marker user baru
        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup("<b>📍 Lokasi Anda</b>")
          .openPopup();

        // Pindahkan peta ke lokasi user
        mapInstanceRef.current.setView([latitude, longitude], 13);

        // Fetch ulang dengan koordinat user
        fetchHospitals(latitude, longitude);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError("Tidak dapat mengakses lokasi. Pastikan izin lokasi diaktifkan.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Filter & Search ──────────────────────────────────────────────────
  useEffect(() => {
    let result = [...hospitals];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q)
      );
    }

    if (filterType !== "all") {
      result = result.filter((h) => h.type === filterType);
    }

    if (filterPartner) {
      result = result.filter((h) => h.is_partner);
    }

    setFiltered(result);
  }, [search, filterType, filterPartner, hospitals]);

  // ── Fly to hospital on card click ────────────────────────────────────
  const flyToHospital = (h) => {
    setSelectedHospital(h);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([h.latitude, h.longitude], 16, { duration: 1.2 });
      // Buka popup marker yang sesuai
      markersRef.current.forEach((m) => {
        const pos = m.getLatLng();
        if (Math.abs(pos.lat - h.latitude) < 0.0001 && Math.abs(pos.lng - h.longitude) < 0.0001) {
          m.openPopup();
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/70 animate-fadeIn">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-7 h-7 text-blue-500" />
                Daftar Rumah Sakit
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {hospitals.length} rumah sakit mitra MefaSafe tersedia
              </p>
            </div>

            {/* Tombol lokasi */}
            <button
              onClick={getUserLocation}
              disabled={locationLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
            >
              {locationLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Mencari lokasi...</>
              ) : (
                <><Navigation className="w-4 h-4" /> Gunakan Lokasi Saya</>
              )}
            </button>
          </div>

          {/* Error lokasi */}
          {locationError && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {locationError}
            </div>
          )}

          {/* Info lokasi aktif */}
          {userLocation && (
            <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl">
              <MapPin className="w-4 h-4 shrink-0" />
              Menampilkan RS terdekat dari lokasi Anda. RS diurutkan berdasarkan jarak.
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">

          {/* ── Panel Kiri: List RS ── */}
          <div className="flex flex-col gap-4">
            {/* Search & Filter */}
            <div className="rounded-2xl bg-white/90 border border-slate-200/60 p-4 shadow-sm space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama RS atau kota..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>

              {/* Filter type */}
              <div className="flex flex-wrap gap-2">
                {["all", "umum", "swasta", "khusus", "puskesmas"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      filterType === t
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t === "all" ? "Semua" : TYPE_LABELS[t]}
                  </button>
                ))}
              </div>

              {/* Filter mitra */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setFilterPartner(!filterPartner)}
                  className={`w-10 h-5 rounded-full transition-all duration-300 relative ${
                    filterPartner ? "bg-blue-500" : "bg-slate-300"
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                    filterPartner ? "left-5" : "left-0.5"
                  }`} />
                </div>
                <span className="text-sm text-slate-600 font-medium">Hanya RS Mitra MefaSafe</span>
              </label>
            </div>

            {/* List RS */}
            <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-semibold">Tidak ada RS ditemukan</p>
                  <p className="text-sm mt-1">Coba ubah filter pencarian</p>
                </div>
              ) : (
                filtered.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => flyToHospital(h)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                      selectedHospital?.id === h.id
                        ? "border-blue-400 bg-blue-50/80 shadow-md"
                        : "border-slate-200/60 bg-white/90 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-slate-900 text-sm leading-tight">{h.name}</span>
                          {h.is_partner && (
                            <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{h.address}, {h.city}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[h.type]}`}>
                            {TYPE_LABELS[h.type]}
                          </span>
                          {h.distance_km !== null && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                              📍 {h.distance_km} km
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-colors ${
                        selectedHospital?.id === h.id ? "text-blue-500" : "text-slate-300"
                      }`} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Panel Kanan: Peta + Detail ── */}
          <div className="flex flex-col gap-4">
            {/* Peta */}
            <div
              ref={mapRef}
              className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-lg"
              style={{ height: selectedHospital ? "380px" : "520px", transition: "height 0.3s ease" }}
            />

            {/* Detail RS yang dipilih */}
            {selectedHospital && (
              <div className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur-xl p-5 shadow-lg animate-fadeIn">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-black text-slate-900">{selectedHospital.name}</h2>
                      {selectedHospital.is_partner && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          <BadgeCheck className="w-3 h-3" /> Mitra MefaSafe
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${TYPE_COLORS[selectedHospital.type]}`}>
                      {TYPE_LABELS[selectedHospital.type]}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedHospital(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{selectedHospital.address}, {selectedHospital.city}, {selectedHospital.province}</span>
                    </div>
                    {selectedHospital.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-green-500 shrink-0" />
                        <a href={`tel:${selectedHospital.phone}`} className="hover:text-blue-600 transition-colors">
                          {selectedHospital.phone}
                        </a>
                      </div>
                    )}
                    {selectedHospital.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-purple-500 shrink-0" />
                        <a href={`mailto:${selectedHospital.email}`} className="hover:text-blue-600 transition-colors truncate">
                          {selectedHospital.email}
                        </a>
                      </div>
                    )}
                    {selectedHospital.distance_km !== null && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                        <Navigation className="w-4 h-4 shrink-0" />
                        {selectedHospital.distance_km} km dari lokasi Anda
                      </div>
                    )}
                  </div>

                  {selectedHospital.facilities && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fasilitas</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedHospital.facilities.split(",").map((f) => (
                          <span key={f} className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                            {f.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tombol daftar */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate("/daftar-rs/" + selectedHospital.id)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    Daftar ke Rumah Sakit Ini
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

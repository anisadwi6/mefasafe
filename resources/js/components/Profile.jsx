import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Camera, Upload, ShieldCheck, Save, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { resolveMediaUrl } from '../utils/mediaUrl';

export default function Profile({ user, profile, onUpdate }) {
  const navigate = useNavigate();
  const ktpInputRef = useRef(null);
  const ttdInputRef = useRef(null);
  const profilePictureInputRef = useRef(null);

  const [ktpFile, setKtpFile] = useState(null);
  const [ttdFile, setTtdFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    full_name: profile?.full_name || '',
    birth_info: profile?.birth_info || '',
    address: profile?.address || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  const profilePhotoSrc = profilePictureFile
    ? URL.createObjectURL(profilePictureFile)
    : resolveMediaUrl(user?.profile_picture);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.profile_picture, profilePictureFile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const token = localStorage.getItem('mefasafe_token');
      const data = new FormData();
      data.append('_method', 'PUT'); // Laravel needs this for multipart/form-data PUT requests
      
      if (formData.name) data.append('name', formData.name);
      if (formData.email) data.append('email', formData.email);
      if (formData.full_name) data.append('full_name', formData.full_name);
      if (formData.birth_info) data.append('birth_info', formData.birth_info);
      if (formData.address) data.append('address', formData.address);
      if (ktpFile) data.append('identity_card', ktpFile);
      if (ttdFile) data.append('digital_signature', ttdFile);
      if (profilePictureFile) data.append('profile_picture', profilePictureFile);

      const response = await axios.post(`/api/v1/users/${user.id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      const updatedUser = response.data.data;
      const updatedProfile = updatedUser.profile;

      // Update local storage so data persists across reloads
      localStorage.setItem('mefasafe_user', JSON.stringify(updatedUser));
      localStorage.setItem('mefasafe_profile', JSON.stringify(updatedProfile));

      // Update state in App.jsx
      if (onUpdate) onUpdate(updatedUser, updatedProfile);

      setIsSaving(false);
      setSaveMessage('Profil berhasil diperbarui!');
      
      // Navigate back to dashboard immediately
      navigate('/home');
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsSaving(false);
      setSaveMessage('Gagal memperbarui profil. Periksa data Anda.');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const hasKtp = Boolean(profile?.identity_card_path || ktpFile);
  const hasSignature = Boolean(profile?.digital_signature_path || ttdFile);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 selection:bg-indigo-500 selection:text-white">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.12);
          }
          50% {
            box-shadow: 0 0 0 18px rgba(79, 70, 229, 0);
          }
        }

        @keyframes shimmer {
          from {
            transform: translateX(-120%);
          }
          to {
            transform: translateX(180%);
          }
        }
      `}</style>

      <div className="mb-8 animate-[fadeInUp_0.55s_ease-out]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-[0.3em]">Profil</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2">
              Kelola identitas Anda
            </h2>
            <p className="text-slate-500 mt-2 max-w-2xl text-sm md:text-base">
              Perbarui informasi pribadi dengan tampilan yang lebih bersih, modern, dan nyaman untuk digunakan.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-700 text-sm font-semibold shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            Akun terverifikasi
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-white/70 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.30)] overflow-hidden mb-8 animate-[fadeInUp_0.6s_ease-out]">
        <div className="relative h-40 md:h-44 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.55),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(217,70,239,0.35),_transparent_28%),linear-gradient(135deg,_#0f172a,_#312e81_58%,_#7c3aed)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.12),transparent)] opacity-70" />
          <div className="absolute inset-0 animate-[pulseGlow_4.5s_ease-in-out_infinite]" />
        </div>

        <div className="px-6 md:px-8 pb-8 -mt-20 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-5 md:gap-8">
            <div className="relative group">
              <input 
                type="file" 
                ref={profilePictureInputRef} 
                className="hidden" 
                accept=".jpg,.jpeg,.png" 
                onChange={(e) => {
                  setProfilePictureFile(e.target.files[0]);
                  setAvatarError(false);
                }}
              />
              {profilePhotoSrc && !avatarError ? (
                <img
                  src={profilePhotoSrc}
                  alt="Foto profil"
                  className="w-32 h-32 rounded-[24px] object-cover border-[6px] border-white shadow-[0_20px_50px_-18px_rgba(79,70,229,0.45)] transition duration-500 group-hover:scale-[1.02]"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-32 h-32 rounded-[24px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 flex items-center justify-center text-white font-black text-3xl shadow-[0_20px_50px_-18px_rgba(79,70,229,0.5)] border-[6px] border-white relative overflow-hidden animate-[float_5s_ease-in-out_infinite]">
                  {getInitials(user?.name)}
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)] animate-[shimmer_2.8s_linear_infinite]" />
                </div>
              )}
              <button
                type="button"
                onClick={() => profilePictureInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                aria-label="Ubah foto profil"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="pb-2 flex-1">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
                {user?.name || 'Pengguna'}
              </h3>
              <p className="mt-2 text-sm md:text-base text-indigo-100/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.18)]">
                {user?.email || 'Lengkapi profil Anda agar data verifikasi selalu up to date.'}
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status</p>
                  <p className="mt-2 text-sm font-bold text-slate-800">Siap disimpan</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Akun</p>
                  <p className="mt-2 text-sm font-bold text-slate-800">{user?.name ? 'Aktif' : 'Belum lengkap'}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Dokumen</p>
                  <p className="mt-2 text-sm font-bold text-slate-800">{hasKtp && hasSignature ? '2/2 siap' : 'Perlu melengkapi'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-8">
          <div className="space-y-6">
            <section className="rounded-[26px] border border-slate-100 bg-white/90 p-6 md:p-7 shadow-[0_25px_80px_-50px_rgba(15,23,42,0.28)] animate-[fadeInUp_0.65s_ease-out]">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-1 rounded-full bg-indigo-600" />
                <div>
                  <h4 className="text-base font-bold text-slate-900">Informasi akun</h4>
                  <p className="text-xs text-slate-500">Tetap update agar akses dan komunikasi lebih aman.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Username</span>
                  <div className="relative group">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                      placeholder="Username"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Email</span>
                  <div className="relative group">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                      placeholder="Email"
                      required
                    />
                  </div>
                </label>
              </div>
            </section>

            <section className="rounded-[26px] border border-slate-100 bg-white/90 p-6 md:p-7 shadow-[0_25px_80px_-50px_rgba(15,23,42,0.28)] animate-[fadeInUp_0.7s_ease-out]">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-1 rounded-full bg-violet-600" />
                <div>
                  <h4 className="text-base font-bold text-slate-900">Data diri</h4>
                  <p className="text-xs text-slate-500">Lengkapi agar data identitas selalu konsisten.</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Nama lengkap</span>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100 transition-all duration-300"
                    placeholder="Nama sesuai identitas"
                  />
                </label>

                <label className="block">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Tempat, tanggal lahir</span>
                  <div className="relative group">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-violet-600 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="birth_info"
                      value={formData.birth_info}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100 transition-all duration-300"
                      placeholder="Jakarta, 01 Januari 1990"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Alamat lengkap</span>
                  <div className="relative group">
                    <span className="pointer-events-none absolute left-3 top-3 text-slate-400 group-focus-within:text-violet-600 transition-colors">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="4"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100 transition-all duration-300 resize-none"
                      placeholder="Tulis alamat rumah domisili saat ini..."
                    />
                  </div>
                </label>
              </div>
            </section>
          </div>

          <aside className="rounded-[26px] border border-slate-100 bg-white/90 p-6 shadow-[0_25px_80px_-50px_rgba(15,23,42,0.28)] animate-[fadeInUp_0.8s_ease-out]">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-1 rounded-full bg-emerald-500" />
              <div>
                <h4 className="text-base font-bold text-slate-900">Dokumen verifikasi</h4>
                <p className="text-xs text-slate-500">Unggah dokumen dengan pengalaman visual yang lebih jelas dan nyaman.</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => ktpInputRef.current?.click()}
                className={`w-full rounded-[22px] border text-left p-4 transition-all duration-300 ${
                  hasKtp
                    ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50'
                    : 'border-slate-200 bg-slate-50/80 hover:border-indigo-200 hover:bg-white hover:shadow-lg'
                }`}
              >
                <input
                  type="file"
                  ref={ktpInputRef}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setKtpFile(e.target.files[0])}
                />

                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-xl p-2.5 ${hasKtp ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-500 shadow-sm'}`}>
                    {hasKtp ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Unggah KTP</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {hasKtp ? (ktpFile?.name || 'KTP_Terverifikasi.jpg') : 'JPG, PNG, atau PDF • maksimal 2MB'}
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => ttdInputRef.current?.click()}
                className={`w-full rounded-[22px] border text-left p-4 transition-all duration-300 ${
                  hasSignature
                    ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50'
                    : 'border-slate-200 bg-slate-50/80 hover:border-violet-200 hover:bg-white hover:shadow-lg'
                }`}
              >
                <input
                  type="file"
                  ref={ttdInputRef}
                  className="hidden"
                  accept=".png"
                  onChange={(e) => setTtdFile(e.target.files[0])}
                />

                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-xl p-2.5 ${hasSignature ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-500 shadow-sm'}`}>
                    {hasSignature ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Tanda tangan digital</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {hasSignature ? (ttdFile?.name || 'Ttd_Digital_Signature.png') : 'PNG transparan • maksimal 1MB'}
                    </p>
                  </div>
                </div>
              </button>

              <div className="rounded-[20px] bg-gradient-to-br from-slate-950 to-slate-800 p-4 text-white">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">Tips cepat</p>
                <p className="mt-3 text-sm leading-6 text-slate-100">
                  Gunakan dokumen dengan kontras yang baik agar verifikasi lebih cepat dan hasil unggahan terlihat lebih rapi.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            {saveMessage ? (
              <p className="text-sm font-semibold text-emerald-600 animate-[fadeInUp_0.35s_ease-out]">
                {saveMessage}
              </p>
            ) : (
              <p className="text-sm text-slate-500">Perubahan akan disimpan secara lokal untuk pratinjau.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-slate-950 text-white font-semibold text-sm shadow-[0_16px_40px_-18px_rgba(15,23,42,0.85)] hover:-translate-y-0.5 hover:bg-slate-900 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Menyimpan...' : 'Simpan perubahan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
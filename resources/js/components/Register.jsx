import React from 'react';
import axios from 'axios';

export default function Register({ onAuthSuccess, onSwitchToLogin, onViewAgreement }) {
    const [form, setForm] = React.useState({
        full_name: '',
        birth_info: '',
        address: '',
        email: '',
        password: '',
        referral_code: '',
    });
    const [identityCard, setIdentityCard] = React.useState(null);
    const [digitalSignature, setDigitalSignature] = React.useState(null);
    const [errors, setErrors] = React.useState({});
    const [message, setMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: undefined }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});
        setMessage('');

        const payload = new FormData();
        payload.append('full_name', form.full_name);
        payload.append('birth_info', form.birth_info);
        payload.append('address', form.address);
        payload.append('email', form.email);
        payload.append('password', form.password);
        if (form.referral_code.trim()) {
            payload.append('referral_code', form.referral_code.trim().toUpperCase());
        }

        if (identityCard) {
            payload.append('identity_card', identityCard);
        }
        if (digitalSignature) {
            payload.append('digital_signature', digitalSignature);
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/register', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const { token, user, profile } = response.data;
            localStorage.setItem('mefasafe_token', token);
            localStorage.setItem('mefasafe_user', JSON.stringify(user));
            localStorage.setItem('mefasafe_profile', JSON.stringify(profile));
            onAuthSuccess?.(user, profile);
        } catch (error) {
            const serverErrors = error?.response?.data?.errors;
            if (serverErrors) {
                setErrors(serverErrors);
                return;
            }
            setMessage(error?.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const pageStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background:
            'radial-gradient(circle at top left, rgba(37, 99, 235, 0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.18), transparent 26%), linear-gradient(135deg, #eff6ff 0%, #f8fbff 55%, #e0f2fe 100%)',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    };

    const cardStyle = {
        width: '100%',
        maxWidth: '760px',
        padding: '32px 28px',
        borderRadius: '28px',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(191, 219, 254, 0.7)',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
        backdropFilter: 'blur(18px)',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.92rem',
        fontWeight: 600,
        color: '#0f172a',
        marginBottom: '8px',
    };

    const inputStyle = {
        width: '100%',
        padding: '13px 14px',
        borderRadius: '14px',
        border: '1px solid #cbd5e1',
        backgroundColor: '#f8fafc',
        fontSize: '0.98rem',
        color: '#0f172a',
        marginTop: '6px',
        boxSizing: 'border-box',
        transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
    };

    const primaryButtonStyle = {
        width: '100%',
        padding: '14px 16px',
        borderRadius: '16px',
        border: 'none',
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '1rem',
        cursor: 'pointer',
        boxShadow: '0 18px 30px rgba(37, 99, 235, 0.24)',
        transition: 'transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease',
    };

    const secondaryButtonStyle = {
        width: '100%',
        padding: '14px 16px',
        borderRadius: '16px',
        border: '1px solid #bfdbfe',
        background: 'rgba(239, 246, 255, 0.9)',
        color: '#1d4ed8',
        fontWeight: 700,
        fontSize: '1rem',
        cursor: 'pointer',
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
    };

    return (
        <div style={pageStyle}>
            <style>{`
                .register-shell input::placeholder { color: #94a3b8; }
                .register-shell input:focus {
                    outline: none;
                    border-color: #60a5fa;
                    background-color: #ffffff;
                    box-shadow: 0 0 0 4px rgba(147, 197, 253, 0.22);
                }
                .register-shell button:hover:not(:disabled) {
                    transform: translateY(-1px);
                }
                .register-shell input[type='file'] {
                    width: 100%;
                    padding: 12px 0;
                    color: #334155;
                }
                @media (max-width: 640px) {
                    .register-card { padding: 26px 22px !important; border-radius: 24px !important; }
                }
            `}</style>
            <div className="register-shell register-card" style={cardStyle}>
                <div style={{ marginBottom: '22px' }}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: 'rgba(191, 219, 254, 0.45)',
                        color: '#1d4ed8',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                    }}>
                        Registrasi pengguna
                    </span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '14px 0 8px' }}>
                        Buat akun MefaSafe
                    </h2>
                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.98rem' }}>
                        Lengkapi data dengan desain yang lebih bersih, cepat dibaca, dan terasa premium di semua perangkat.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={gridStyle}>
                        <label style={{ display: 'block' }}>
                            <span style={labelStyle}>Nama Lengkap</span>
                            <input name="full_name" value={form.full_name} onChange={handleChange} style={inputStyle} placeholder="Nama sesuai KTP" required />
                            {errors.full_name?.map((item) => <div key={item} style={{ color: '#dc2626', fontSize: '0.86rem', marginTop: '6px' }}>{item}</div>)}
                        </label>

                        <label style={{ display: 'block' }}>
                            <span style={labelStyle}>Tempat, Tanggal Lahir</span>
                            <input name="birth_info" value={form.birth_info} onChange={handleChange} style={inputStyle} placeholder="Contoh: Jakarta, 01-01-1990" required />
                            {errors.birth_info?.map((item) => <div key={item} style={{ color: '#dc2626', fontSize: '0.86rem', marginTop: '6px' }}>{item}</div>)}
                        </label>
                    </div>

                    <label style={{ display: 'block', marginTop: '16px' }}>
                        <span style={labelStyle}>Alamat</span>
                        <input name="address" value={form.address} onChange={handleChange} style={inputStyle} placeholder="Alamat sesuai KTP" required />
                        {errors.address?.map((item) => <div key={item} style={{ color: '#dc2626', fontSize: '0.86rem', marginTop: '6px' }}>{item}</div>)}
                    </label>

                    <div style={{ ...gridStyle, marginTop: '16px' }}>
                        <label style={{ display: 'block' }}>
                            <span style={labelStyle}>Email</span>
                            <input name="email" value={form.email} onChange={handleChange} style={inputStyle} placeholder="nama@email.com" required />
                            {errors.email?.map((item) => <div key={item} style={{ color: '#dc2626', fontSize: '0.86rem', marginTop: '6px' }}>{item}</div>)}
                        </label>

                        <label style={{ display: 'block' }}>
                            <span style={labelStyle}>Password</span>
                            <input type="password" name="password" value={form.password} onChange={handleChange} style={inputStyle} placeholder="Buat password" required />
                            {errors.password?.map((item) => <div key={item} style={{ color: '#dc2626', fontSize: '0.86rem', marginTop: '6px' }}>{item}</div>)}
                        </label>
                    </div>

                    <label style={{ display: 'block', marginTop: '16px' }}>
                        <span style={labelStyle}>Kode Undangan (opsional)</span>
                        <input name="referral_code" value={form.referral_code} onChange={handleChange} style={inputStyle} placeholder="Contoh: HANN0001" />
                        {errors.referral_code?.map((item) => <div key={item} style={{ color: '#dc2626', fontSize: '0.86rem', marginTop: '6px' }}>{item}</div>)}
                    </label>

                    <div style={{ ...gridStyle, marginTop: '16px' }}>
                        <label style={{ display: 'block' }}>
                            <span style={labelStyle}>KTP (jpg/png/pdf)</span>
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setIdentityCard(e.target.files[0])} />
                            {errors.identity_card?.map((item) => <div key={item} style={{ color: '#dc2626', fontSize: '0.86rem', marginTop: '6px' }}>{item}</div>)}
                        </label>

                        <label style={{ display: 'block' }}>
                            <span style={labelStyle}>Tanda Tangan Digital (jpg/png/pdf)</span>
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setDigitalSignature(e.target.files[0])} />
                            {errors.digital_signature?.map((item) => <div key={item} style={{ color: '#dc2626', fontSize: '0.86rem', marginTop: '6px' }}>{item}</div>)}
                        </label>
                    </div>

                    {message ? <div style={{ color: '#dc2626', marginTop: '16px', fontSize: '0.92rem' }}>{message}</div> : null}

                    <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, opacity: loading ? 0.8 : 1, marginTop: '20px', marginBottom: '12px' }}>
                        {loading ? 'Memproses...' : 'Daftar'}
                    </button>

                    <button type="button" onClick={onSwitchToLogin} style={{ ...secondaryButtonStyle, marginBottom: '12px' }}>
                        Sudah punya akun? Masuk
                    </button>

                    <button type="button" onClick={onViewAgreement} style={{ ...secondaryButtonStyle, background: 'rgba(248, 250, 252, 0.95)', color: '#0f172a' }}>
                        Baca Lembar Persetujuan
                    </button>
                </form>
            </div>
        </div>
    );
}

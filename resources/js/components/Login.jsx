import React from 'react';
import axios from 'axios';

export default function Login({ onAuthSuccess, onSwitchToRegister }) {
    const [form, setForm] = React.useState({ email: '', password: '' });
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

        try {
            setLoading(true);
            const response = await axios.post('/api/login', form);
            const { token, user } = response.data;

            localStorage.setItem('mefasafe_token', token);
            localStorage.setItem('mefasafe_user', JSON.stringify(user));
            localStorage.setItem('mefasafe_profile', JSON.stringify(user?.profile || null));
            onAuthSuccess?.(user, user?.profile || null);
        } catch (error) {
            const serverErrors = error?.response?.data?.errors;
            if (serverErrors) {
                setErrors(serverErrors);
                return;
            }

            setMessage(error?.response?.data?.message || 'Login gagal. Silakan coba lagi.');
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
        maxWidth: '440px',
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

    return (
        <div style={pageStyle}>
            <style>{`
                .login-shell input::placeholder { color: #94a3b8; }
                .login-shell input:focus {
                    outline: none;
                    border-color: #60a5fa;
                    background-color: #ffffff;
                    box-shadow: 0 0 0 4px rgba(147, 197, 253, 0.22);
                }
                .login-shell button:hover:not(:disabled) {
                    transform: translateY(-1px);
                }
                @media (max-width: 640px) {
                    .login-shell { padding: 0 !important; }
                    .login-card { padding: 26px 22px !important; border-radius: 24px !important; }
                }
            `}</style>
            <div className="login-shell" style={cardStyle}>
                <div style={{ marginBottom: '24px' }}>
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
                        Login pengguna
                    </span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '14px 0 8px' }}>
                        Masuk ke akun
                    </h2>
                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.98rem' }}>
                        Kelola layanan MefaSafe dengan pengalaman yang rapi, cepat, dan terpercaya.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '16px' }}>
                        <span style={labelStyle}>Email</span>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="nama@email.com"
                            required
                        />
                        {errors.email?.map((item) => <div key={item} style={{ color: '#dc2626', fontSize: '0.86rem', marginTop: '6px' }}>{item}</div>)}
                    </label>

                    <label style={{ display: 'block', marginBottom: '18px' }}>
                        <span style={labelStyle}>Password</span>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Masukkan password"
                            required
                        />
                        {errors.password?.map((item) => <div key={item} style={{ color: '#dc2626', fontSize: '0.86rem', marginTop: '6px' }}>{item}</div>)}
                    </label>

                    {message ? <div style={{ color: '#dc2626', marginBottom: '14px', fontSize: '0.92rem' }}>{message}</div> : null}

                    <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, opacity: loading ? 0.8 : 1, marginBottom: '12px' }}>
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>

                    <button type="button" onClick={onSwitchToRegister} style={secondaryButtonStyle}>
                        Belum punya akun? Buat akun baru
                    </button>
                </form>
            </div>
        </div>
    );
}

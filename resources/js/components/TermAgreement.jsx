import React from 'react';

export default function TermAgreement({ onContinue, onBackToLogin }) {
    const [accepted, setAccepted] = React.useState(false);

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
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(191, 219, 254, 0.7)',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
        backdropFilter: 'blur(18px)',
    };

    const primaryButtonStyle = {
        flex: 1,
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
        flex: 1,
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
                .agreement-shell button:hover:not(:disabled) {
                    transform: translateY(-1px);
                }
                .agreement-shell li {
                    margin-bottom: 14px;
                    line-height: 1.7;
                    color: #0f172a;
                }
                @media (max-width: 640px) {
                    .agreement-shell { padding: 26px 22px !important; border-radius: 24px !important; }
                    .agreement-actions { flex-direction: column !important; }
                }
            `}</style>
            <div className="agreement-shell" style={cardStyle}>
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
                        Lembar Persetujuan
                    </span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '14px 0 8px' }}>
                        Syarat dan Ketentuan Utama
                    </h2>
                    <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.98rem' }}>
                        Bacalah seluruh pernyataan berikut dengan seksama sebelum melanjutkan proses pendaftaran.
                    </p>
                </div>

                <ul style={{ marginBottom: '22px', paddingLeft: '18px', fontSize: '0.98rem' }}>
                    <li>Saya mengajukan permohonan untuk menjadi peserta program asuransi di bawah Mefa Safe Insurance.</li>
                    <li>Saya telah membaca, memahami, dan menyetujui seluruh ketentuan, manfaat, pengecualian, serta biaya premi yang tercantum dalam dokumen informasi produk Mefa Safe Insurance.</li>
                    <li>Saya memberikan persetujuan kepada Mefa Safe Insurance untuk mengumpulkan, menyimpan, dan memproses data pribadi saya sesuai kebutuhan layanan asuransi dan ketentuan perlindungan data yang berlaku.</li>
                    <li>Saya menyatakan seluruh data dan informasi yang saya berikan adalah benar, lengkap, dan dapat dipertanggungjawabkan.</li>
                    <li>Saya memahami bahwa pengajuan polis dapat diterima atau ditolak setelah melalui proses verifikasi dan penilaian risiko (underwriting).</li>
                    <li>Saya menyetujui pembayaran premi sesuai jadwal dan metode yang telah saya pilih, serta memahami konsekuensi jika terjadi keterlambatan pembayaran.</li>
                    <li>Dengan menandatangani lembar persetujuan ini, saya menyatakan bersedia terikat secara hukum dengan syarat dan ketentuan yang berlaku di Mefa Safe Insurance.</li>
                </ul>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '22px', color: '#0f172a', fontSize: '0.98rem' }}>
                    <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(event) => setAccepted(event.target.checked)}
                        style={{ marginTop: '4px', width: '18px', height: '18px' }}
                    />
                    <span>Saya menyetujui semua syarat dan ketentuan.</span>
                </label>

                <div className="agreement-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={onContinue}
                        disabled={!accepted}
                        style={{ ...primaryButtonStyle, opacity: accepted ? 1 : 0.64, cursor: accepted ? 'pointer' : 'not-allowed' }}
                    >
                        Lanjutkan ke pendaftaran
                    </button>
                    <button type="button" onClick={onBackToLogin} style={secondaryButtonStyle}>
                        Kembali ke login
                    </button>
                </div>
            </div>
        </div>
    );
}

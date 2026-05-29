// resources/js/components/App.jsx
import React from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Profile from './Profile';
import Login from './Login';
import Register from './Register';
import TermAgreement from './TermAgreement';
import { resolveMediaUrl } from '../utils/mediaUrl';

export default function App() {
    const [screen, setScreen] = React.useState('login');
    const [user, setUser] = React.useState(null);
    const [profile, setProfile] = React.useState(null);

    React.useEffect(() => {
        const savedToken = localStorage.getItem('mefasafe_token');
        const savedUser = localStorage.getItem('mefasafe_user');
        const savedProfile = localStorage.getItem('mefasafe_profile');

        if (savedToken && savedUser) {
            const parsedUser = JSON.parse(savedUser);
            const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null;

            setUser(parsedUser);
            setProfile(parsedProfile);
            setScreen('dashboard');

            // Refresh data user agar URL foto profil selalu sesuai host saat ini
            axios
                .get(`/api/v1/users/${parsedUser.id}`, {
                    headers: { Authorization: `Bearer ${savedToken}` },
                })
                .then((res) => {
                    const freshUser = res.data?.data;
                    if (!freshUser) return;

                    setUser(freshUser);
                    setProfile(freshUser.profile ?? parsedProfile);
                    localStorage.setItem('mefasafe_user', JSON.stringify(freshUser));
                    if (freshUser.profile) {
                        localStorage.setItem('mefasafe_profile', JSON.stringify(freshUser.profile));
                    }
                })
                .catch(() => {});
        }
    }, []);

    const handleAuthSuccess = (nextUser, nextProfile) => {
        const normalizedUser = nextUser
            ? { ...nextUser, profile_picture: resolveMediaUrl(nextUser.profile_picture) ?? nextUser.profile_picture }
            : nextUser;

        setUser(normalizedUser);
        setProfile(nextProfile);
        setScreen('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('mefasafe_token');
        localStorage.removeItem('mefasafe_user');
        localStorage.removeItem('mefasafe_profile');
        setUser(null);
        setProfile(null);
        setScreen('login');
    };

    if (screen === 'dashboard') {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/Profil" element={<Profile user={user} profile={profile} onUpdate={handleAuthSuccess} onLogout={handleLogout} />} />
                    <Route path="/*" element={<Dashboard user={user} profile={profile} onLogout={handleLogout} />} />
                </Routes>
            </BrowserRouter>
        );
    }

    if (screen === 'register') {
        return (
            <Register
                onAuthSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setScreen('login')}
                onViewAgreement={() => setScreen('agreement')}
            />
        );
    }

    if (screen === 'agreement') {
        return (
            <TermAgreement
                onContinue={() => setScreen('register')}
                onBackToLogin={() => setScreen('login')}
            />
        );
    }

    return (
        <Login
            onAuthSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setScreen('agreement')}
        />
    );
}
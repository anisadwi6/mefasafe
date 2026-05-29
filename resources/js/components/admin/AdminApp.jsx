import { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

export default function AdminApp() {
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        const user  = localStorage.getItem("admin_user");
        if (token && user) {
            const parsed = JSON.parse(user);
            if (parsed.role === "admin") setAdmin(parsed);
        }
    }, []);

    const handleLogin = (user, token) => {
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_user", JSON.stringify(user));
        setAdmin(user);
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        setAdmin(null);
    };

    if (!admin) return <AdminLogin onLogin={handleLogin} />;
    return <AdminDashboard admin={admin} onLogout={handleLogout} />;
}

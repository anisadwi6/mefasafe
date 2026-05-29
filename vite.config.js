import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import laravel from 'laravel-vite-plugin';
import path from 'path'; // Ditambahkan untuk kebutuhan alias path

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx', 'resources/js/admin.jsx'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: '127.0.0.1',
        },
        // Opsional: Menambahkan watch options jika Anda menggunakan Docker / WSL
        watch: {
            usePolling: true,
        },
    },
    optimizeDeps: {
        include: ['recharts'],
    },
    resolve: {
        alias: {
            // Membuat alias '@' mengarah ke folder 'resources/js'
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    build: {
        // Membersihkan folder build lama sebelum melakukan build baru
        emptyOutDir: true,
        
        // Catatan: outDir, assetsDir, dan manifest sengaja dihapus 
        // karena sudah di-handle secara otomatis secara aman oleh plugin Laravel.
    },
});
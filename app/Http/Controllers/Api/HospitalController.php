<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hospital;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HospitalController extends Controller
{
    /**
     * Daftar semua RS aktif, diurutkan berdasarkan jarak dari user
     */
    public function index(Request $request): JsonResponse
    {
        $hospitals = Hospital::where('is_active', true)->get();

        $userLat = (float) $request->query('lat', 0);
        $userLng = (float) $request->query('lng', 0);

        // Tambahkan jarak ke setiap RS
        $hospitals = $hospitals->map(function ($h) use ($userLat, $userLng) {
            $distance = ($userLat && $userLng)
                ? $h->distanceFrom($userLat, $userLng)
                : null;

            return [
                'id'          => $h->id,
                'name'        => $h->name,
                'address'     => $h->address,
                'city'        => $h->city,
                'province'    => $h->province,
                'phone'       => $h->phone,
                'email'       => $h->email,
                'latitude'    => $h->latitude,
                'longitude'   => $h->longitude,
                'type'        => $h->type,
                'facilities'  => $h->facilities,
                'is_partner'  => $h->is_partner,
                'is_active'   => $h->is_active,
                'distance_km' => $distance ? round($distance, 1) : null,
            ];
        });

        // Sort by distance jika koordinat user tersedia
        if ($userLat && $userLng) {
            $hospitals = $hospitals->sortBy('distance_km')->values();
        }

        return response()->json([
            'success' => true,
            'data'    => $hospitals,
        ]);
    }

    /**
     * Detail satu RS beserta dokternya
     */
    public function show(string $id): JsonResponse
    {
        $hospital = Hospital::with(['doctors' => function ($q) {
            $q->where('availability', 'available')->orderBy('specialist');
        }])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $hospital]);
    }

    /**
     * Daftar dokter di RS tertentu
     */
    public function doctors(string $id): JsonResponse
    {
        $hospital = Hospital::findOrFail($id);
        $doctors  = $hospital->doctors()
            ->where('availability', 'available')
            ->orderBy('specialist')
            ->get();

        return response()->json(['success' => true, 'data' => $doctors]);
    }

    /**
     * Daftar semua dokter dari semua RS
     */
    public function allDoctors(): JsonResponse
    {
        $doctors = \App\Models\Doctor::with('hospital')
            ->where('availability', 'available')
            ->orderBy('name')
            ->get();

        return response()->json(['success' => true, 'data' => $doctors]);
    }

    /**
     * Admin: tambah RS baru
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'address'    => ['required', 'string'],
            'city'       => ['required', 'string', 'max:100'],
            'province'   => ['nullable', 'string', 'max:100'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'email'      => ['nullable', 'email'],
            'latitude'   => ['required', 'numeric', 'between:-90,90'],
            'longitude'  => ['required', 'numeric', 'between:-180,180'],
            'type'       => ['sometimes', 'in:umum,swasta,khusus,puskesmas'],
            'facilities' => ['nullable', 'string'],
            'is_partner' => ['sometimes', 'boolean'],
            'is_active'  => ['sometimes', 'boolean'],
        ]);

        $hospital = Hospital::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Rumah sakit berhasil ditambahkan.',
            'data'    => $hospital,
        ], 201);
    }

    /**
     * Admin: update RS
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $hospital = Hospital::findOrFail($id);

        $validated = $request->validate([
            'name'       => ['sometimes', 'string', 'max:255'],
            'address'    => ['sometimes', 'string'],
            'city'       => ['sometimes', 'string', 'max:100'],
            'province'   => ['nullable', 'string', 'max:100'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'email'      => ['nullable', 'email'],
            'latitude'   => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude'  => ['sometimes', 'numeric', 'between:-180,180'],
            'type'       => ['sometimes', 'in:umum,swasta,khusus,puskesmas'],
            'facilities' => ['nullable', 'string'],
            'is_partner' => ['sometimes', 'boolean'],
            'is_active'  => ['sometimes', 'boolean'],
        ]);

        $hospital->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Rumah sakit berhasil diperbarui.',
            'data'    => $hospital->fresh(),
        ]);
    }

    /**
     * Admin: hapus RS
     */
    public function destroy(string $id): JsonResponse
    {
        Hospital::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Rumah sakit berhasil dihapus.']);
    }
}

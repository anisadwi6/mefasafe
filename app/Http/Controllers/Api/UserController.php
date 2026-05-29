<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with('profile')->latest()->get();

        return response()->json([
            'message' => 'Users retrieved successfully.',
            'data' => $users,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'in:pengguna,admin'],
            'full_name' => ['required', 'string', 'max:255'],
            'birth_info' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'identity_card' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'digital_signature' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ]);

        $user = DB::transaction(function () use ($validated, $request) {
            $user = User::create([
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => $validated['role'],
            ]);

            $profileData = [
                'user_id' => $user->id,
                'full_name' => $validated['full_name'],
                'birth_info' => $validated['birth_info'],
                'address' => $validated['address'],
            ];

            if ($request->hasFile('identity_card')) {
                $profileData['identity_card_path'] = $this->uploadFile($request->file('identity_card'), 'ktp');
            }

            if ($request->hasFile('digital_signature')) {
                $profileData['digital_signature_path'] = $this->uploadFile($request->file('digital_signature'), 'signatures');
            }

            $user->profile()->create($profileData);

            return $user->load('profile');
        });

        return response()->json([
            'message' => 'User and profile registered successfully.',
            'data' => $user,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $user = User::with('profile')->findOrFail($id);

        return response()->json([
            'message' => 'User retrieved successfully.',
            'data' => $user,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::with('profile')->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email:rfc,dns', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', 'string', 'min:8', 'confirmed'],
            'role' => ['sometimes', 'in:pengguna,admin'],
            'full_name' => ['sometimes', 'string', 'max:255'],
            'birth_info' => ['sometimes', 'string', 'max:255'],
            'address' => ['sometimes', 'string', 'max:500'],
            'profile_picture' => ['sometimes', 'nullable', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
            'identity_card' => ['sometimes', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'digital_signature' => ['sometimes', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ]);

        $user = DB::transaction(function () use ($user, $validated, $request) {
            if (array_key_exists('name', $validated)) {
                $user->name = $validated['name'];
            }

            if (array_key_exists('email', $validated)) {
                $user->email = $validated['email'];
            }

            if (array_key_exists('password', $validated)) {
                $user->password = $validated['password'];
            }

            if (array_key_exists('role', $validated)) {
                $user->role = $validated['role'];
            }

            if ($request->hasFile('profile_picture')) {
                $user->profile_picture = $this->uploadFile($request->file('profile_picture'), 'profiles');
            }

            $user->save();

            $profileData = [];

            foreach (['full_name', 'birth_info', 'address'] as $field) {
                if (array_key_exists($field, $validated)) {
                    $profileData[$field] = $validated[$field];
                }
            }

            if ($request->hasFile('identity_card')) {
                $profileData['identity_card_path'] = $this->uploadFile($request->file('identity_card'), 'ktp');
            }

            if ($request->hasFile('digital_signature')) {
                $profileData['digital_signature_path'] = $this->uploadFile($request->file('digital_signature'), 'signatures');
            }

            if ($profileData !== []) {
                $user->profile()->updateOrCreate(['user_id' => $user->id], $profileData);
            }

            return $user->fresh('profile');
        });

        return response()->json([
            'message' => 'User and profile updated successfully.',
            'data' => $user,
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ], 200);
    }

    private function uploadFile($file, string $folder): string
    {
        $directory = public_path($folder);

        if (! is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $file->move($directory, $filename);

        return $folder . '/' . $filename;
    }
}

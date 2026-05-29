<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        if ($request->filled('referral_code')) {
            $request->merge(['referral_code' => strtoupper($request->input('referral_code'))]);
        }

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'birth_info' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'email' => ['required', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'referral_code' => ['nullable', 'string', 'exists:users,referral_code'],
            'identity_card' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
            'digital_signature' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ]);

        $user = DB::transaction(function () use ($validated, $request) {
            $user = User::create([
                'name' => $validated['full_name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => 'pengguna',
                'referral_code' => $this->makeReferralCode($validated['full_name']),
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

            if (! empty($validated['referral_code'])) {
                $referrer = User::where('referral_code', strtoupper($validated['referral_code']))->first();
                if ($referrer && $referrer->id !== $user->id) {
                    Referral::create([
                        'referrer_id' => $referrer->id,
                        'referred_user_id' => $user->id,
                        'referral_code' => $referrer->referral_code,
                    ]);
                }
            }

            return $user->fresh('profile');
        });

        $token = $user->createToken('mefasafe-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'profile' => $user->profile,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($validated)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $user = User::with('profile')->where('email', $validated['email'])->firstOrFail();
        $token = $user->createToken('mefasafe-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'profile' => $user->profile,
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

    private function makeReferralCode(string $name): string
    {
        $prefix = strtoupper(Str::slug(substr($name, 0, 4), '')) ?: 'MEFA';

        do {
            $code = $prefix . random_int(1000, 9999);
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiscountCoupon;
use App\Models\Promotion;
use App\Models\Referral;
use App\Models\User;
use App\Services\PromoCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReferralController extends Controller
{
    public function __construct(private readonly PromoCodeService $promoCodeService)
    {
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $settings = $this->promoSettings();

        if (!$user->referral_code) {
            $user->update(['referral_code' => 'MEFA' . str_pad((string) $user->id, 4, '0', STR_PAD_LEFT)]);
        }

        $referrals = Referral::with('referredUser:id,name,email,created_at')
            ->where('referrer_id', $user->id)
            ->latest()
            ->get();

        $coupon = null;
        if ($referrals->count() >= $settings['required_referrals']) {
            $coupon = DiscountCoupon::firstOrCreate(
                ['user_id' => $user->id, 'discount_percent' => $settings['discount_percent']],
                [
                    'code' => $this->makeCouponCode($user, $settings['discount_percent']),
                    'required_referrals' => $settings['required_referrals'],
                    'usage_limit' => null,
                    'is_active' => true,
                ]
            );
        } else {
            $coupon = DiscountCoupon::where('user_id', $user->id)
                ->where('discount_percent', $settings['discount_percent'])
                ->latest()
                ->first();
        }

        $appliedReferral = Referral::with('referrer:id,name,referral_code')
            ->where('referred_user_id', $user->id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'referral_code' => $user->referral_code,
                'required_referrals' => $settings['required_referrals'],
                'referral_count' => $referrals->count(),
                'remaining_referrals' => max(0, $settings['required_referrals'] - $referrals->count()),
                'discount_percent' => $settings['discount_percent'],
                'coupon' => $coupon,
                'referrals' => $referrals,
                'applied_referral' => $appliedReferral ? [
                    'referral_code' => $appliedReferral->referral_code,
                    'referrer_name' => $appliedReferral->referrer?->name,
                    'applied_at' => $appliedReferral->created_at,
                ] : null,
            ],
        ]);
    }

    public function apply(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'referral_code' => ['required', 'string', 'max:50'],
        ]);

        $code = strtoupper(trim($validated['referral_code']));

        if (Referral::where('referred_user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah pernah memakai kode referral.',
            ], 422);
        }

        $referrer = User::where('referral_code', $code)->first();

        if (!$referrer) {
            return response()->json([
                'success' => false,
                'message' => 'Kode referral tidak ditemukan.',
            ], 422);
        }

        if ($referrer->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa memakai kode referral sendiri.',
            ], 422);
        }

        Referral::create([
            'referrer_id' => $referrer->id,
            'referred_user_id' => $user->id,
            'referral_code' => $referrer->referral_code,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kode referral berhasil digunakan.',
            'data' => [
                'referral_code' => $referrer->referral_code,
                'referrer_name' => $referrer->name,
            ],
        ]);
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'code' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'feature' => ['sometimes', 'string'],
        ]);

        $feature = $validated['feature'] ?? 'insurance';

        try {
            $result = $this->promoCodeService->validate(
                $validated['code'],
                (int) $validated['user_id'],
                $feature,
                (float) $validated['amount']
            );
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first() ?? 'Kode diskon tidak valid.',
            ], 422);
        }

        return response()->json(['success' => true, 'data' => $result]);
    }

    private function resolveUser(Request $request): ?User
    {
        $user = $request->user();
        if ($user) return $user;

        $userId = $request->query('user_id') ?? $request->input('user_id');
        return $userId ? User::find($userId) : null;
    }

    private function promoSettings(): array
    {
        $promotion = Promotion::where('is_active', true)
            ->orderBy('sort_order')
            ->latest()
            ->first();

        return [
            'discount_percent' => (int) ($promotion?->discount_percent ?? 20),
            'required_referrals' => (int) ($promotion?->required_referrals ?? 3),
        ];
    }

    private function makeCouponCode(User $user, int $discountPercent): string
    {
        $prefix = 'PROMO' . $discountPercent;

        do {
            $code = $prefix . '-' . strtoupper($user->referral_code ?: ('U' . $user->id));
        } while (DiscountCoupon::where('code', $code)->where('user_id', '!=', $user->id)->exists());

        return $code;
    }
}

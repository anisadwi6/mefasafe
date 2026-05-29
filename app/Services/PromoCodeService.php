<?php

namespace App\Services;

use App\Models\DiscountCoupon;
use App\Models\PromoCode;
use App\Models\PromoCodeUsage;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class PromoCodeService
{
    public function validate(string $code, int $userId, string $feature, float $amount): array
    {
        $code = strtoupper(trim($code));

        if ($code === '') {
            throw ValidationException::withMessages([
                'code' => ['Kode promo wajib diisi.'],
            ]);
        }

        if (! array_key_exists($feature, PromoCode::FEATURE_LABELS)) {
            throw ValidationException::withMessages([
                'feature' => ['Fitur pembayaran tidak valid.'],
            ]);
        }

        $adminPromo = PromoCode::where('code', $code)->first();
        if ($adminPromo) {
            return $this->validateAdminPromo($adminPromo, $userId, $feature, $amount);
        }

        $referralCoupon = DiscountCoupon::where('code', $code)
            ->where('user_id', $userId)
            ->where('is_active', true)
            ->first();

        if ($referralCoupon) {
            return $this->validateReferralCoupon($referralCoupon, $feature, $amount);
        }

        throw ValidationException::withMessages([
            'code' => ['Kode promo tidak valid atau sudah tidak aktif.'],
        ]);
    }

    public function recordAdminUsage(
        PromoCode $promo,
        int $userId,
        string $feature,
        float $originalAmount,
        float $discountAmount,
        float $finalAmount,
        ?string $referenceType = null,
        ?int $referenceId = null
    ): void {
        PromoCodeUsage::create([
            'promo_code_id' => $promo->id,
            'user_id' => $userId,
            'feature' => $feature,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'original_amount' => $originalAmount,
            'discount_amount' => $discountAmount,
            'final_amount' => $finalAmount,
        ]);

        $promo->increment('used_count');
    }

    public function recordReferralUsage(DiscountCoupon $coupon): void
    {
        $coupon->increment('used_count');
    }

    private function validateAdminPromo(PromoCode $promo, int $userId, string $feature, float $amount): array
    {
        if (! $promo->is_active) {
            throw ValidationException::withMessages(['code' => ['Kode promo tidak aktif.']]);
        }

        $now = Carbon::now();
        if ($promo->starts_at && $now->lt($promo->starts_at)) {
            throw ValidationException::withMessages(['code' => ['Kode promo belum berlaku.']]);
        }
        if ($promo->ends_at && $now->gt($promo->ends_at)) {
            throw ValidationException::withMessages(['code' => ['Kode promo sudah kedaluwarsa.']]);
        }

        $features = $promo->applicable_features ?? [];
        if (! in_array($feature, $features, true)) {
            $label = PromoCode::FEATURE_LABELS[$feature] ?? $feature;
            throw ValidationException::withMessages([
                'code' => ["Kode promo tidak berlaku untuk {$label}."],
            ]);
        }

        if ($promo->usage_limit && $promo->used_count >= $promo->usage_limit) {
            throw ValidationException::withMessages(['code' => ['Kuota penggunaan kode promo sudah habis.']]);
        }

        $userUsage = $promo->usages()->where('user_id', $userId)->count();
        if ($promo->per_user_limit && $userUsage >= $promo->per_user_limit) {
            throw ValidationException::withMessages(['code' => ['Anda sudah mencapai batas pemakaian kode ini.']]);
        }

        return $this->buildResult($promo->code, (int) $promo->discount_percent, $amount, 'admin', $promo->id);
    }

    private function validateReferralCoupon(DiscountCoupon $coupon, string $feature, float $amount): array
    {
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            throw ValidationException::withMessages(['code' => ['Kode diskon referral sudah habis.']]);
        }

        return $this->buildResult($coupon->code, (int) $coupon->discount_percent, $amount, 'referral', $coupon->id);
    }

    private function buildResult(string $code, int $discountPercent, float $amount, string $source, int $sourceId): array
    {
        $discountAmount = round($amount * ($discountPercent / 100), 2);
        $finalAmount = max(0, round($amount - $discountAmount, 2));

        return [
            'code' => $code,
            'source' => $source,
            'source_id' => $sourceId,
            'discount_percent' => $discountPercent,
            'original_amount' => $amount,
            'discount_amount' => $discountAmount,
            'final_amount' => $finalAmount,
        ];
    }
}

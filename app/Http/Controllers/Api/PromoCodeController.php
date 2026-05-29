<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Services\PromoCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PromoCodeController extends Controller
{
    public function __construct(private readonly PromoCodeService $promoCodeService)
    {
    }

    public function features(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => collect(PromoCode::FEATURE_LABELS)->map(fn ($label, $key) => [
                'key' => $key,
                'label' => $label,
            ])->values(),
        ]);
    }

    public function validateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'code' => ['required', 'string', 'max:50'],
            'feature' => ['required', 'string', 'in:' . implode(',', array_keys(PromoCode::FEATURE_LABELS))],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            $result = $this->promoCodeService->validate(
                $validated['code'],
                (int) $validated['user_id'],
                $validated['feature'],
                (float) $validated['amount']
            );
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => collect($e->errors())->flatten()->first() ?? 'Kode promo tidak valid.',
                'errors' => $e->errors(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}

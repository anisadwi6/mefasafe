<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;

class PromotionController extends Controller
{
    public function active(): JsonResponse
    {
        $promotion = Promotion::where('is_active', true)
            ->orderBy('sort_order')
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'data' => $promotion,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $services = HealthService::where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'message' => 'Health services retrieved successfully.',
            'data' => $services,
        ], 200);
    }
}

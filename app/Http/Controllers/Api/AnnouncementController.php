<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;

class AnnouncementController extends Controller
{
    public function active(): JsonResponse
    {
        $announcements = Announcement::where('is_active', true)
            ->orderBy('sort_order')
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $announcements,
        ]);
    }
}

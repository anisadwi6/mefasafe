<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;

class BannerController extends Controller
{
    public function active(): JsonResponse
    {
        $promotions = Promotion::where('is_active', true)
            ->orderBy('sort_order')
            ->latest()
            ->get()
            ->map(fn (Promotion $item) => $this->formatBanner($item, 'promo'));

        $announcements = Announcement::where('is_active', true)
            ->orderBy('sort_order')
            ->latest()
            ->get()
            ->map(fn (Announcement $item) => $this->formatBanner($item, 'info'));

        $banners = $promotions
            ->concat($announcements)
            ->sortBy([
                ['sort_order', 'asc'],
                ['id', 'desc'],
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }

    private function formatBanner(Promotion|Announcement $item, string $kind): array
    {
        return [
            'uid' => $kind . '-' . $item->id,
            'kind' => $kind,
            'badge' => $item->badge,
            'title' => $item->title,
            'description' => $item->description,
            'button_label' => $item->button_label,
            'button_url' => $item->button_url,
            'image_url' => $item->image_url,
            'sort_order' => $item->sort_order,
            'discount_percent' => $item instanceof Promotion ? $item->discount_percent : null,
        ];
    }
}

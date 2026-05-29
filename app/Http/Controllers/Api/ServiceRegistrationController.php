<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\DiscountCoupon;
use App\Models\HealthService;
use App\Models\InsurancePolicy;
use App\Models\PromoCode;
use App\Models\ServiceRegistration;
use App\Services\PromoCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class ServiceRegistrationController extends Controller
{
    public function __construct(private readonly PromoCodeService $promoCodeService)
    {
    }
    public function index(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');
        $query = ServiceRegistration::with(['user', 'hospital', 'insurancePolicy', 'healthService'])->latest();
        
        if ($userId) {
            $query->where('user_id', $userId);
        }

        return response()->json([
            'success' => true,
            'message' => 'Service registrations retrieved successfully.',
            'data' => $query->get(),
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'             => ['required', 'exists:users,id'],
            'hospital_id'         => ['nullable', 'exists:hospitals,id'],
            'insurance_policy_id' => ['nullable', 'exists:insurance_policies,id'],
            'health_service_id'   => ['required', 'exists:health_services,id'],
            'service_type'        => ['required', 'string', 'max:100'],
            'service_name'        => ['required', 'string', 'max:255'],
            'schedule_date'       => ['required', 'date'],
            'schedule_time'       => ['required', 'string', 'max:100'],
            'price'               => ['sometimes', 'numeric', 'min:0'],
            'promo_code'          => ['sometimes', 'nullable', 'string', 'max:50'],
            'queue_number'        => ['required', 'string', 'max:100'],
            'barcode_data'        => ['required', 'string', 'max:255'],
            'notes'               => ['nullable', 'string', 'max:1000'],
            'status'              => ['sometimes', 'in:registered,completed,canceled'],
        ]);

        $healthService = HealthService::findOrFail($validated['health_service_id']);
        $originalPrice = (float) $healthService->price;
        $finalPrice = $originalPrice;
        $discountAmount = 0;
        $appliedPromoCode = null;
        $promoResult = null;

        if (! empty($validated['promo_code'])) {
            try {
                $promoResult = $this->promoCodeService->validate(
                    $validated['promo_code'],
                    (int) $validated['user_id'],
                    PromoCode::FEATURE_SERVICE,
                    $originalPrice
                );
            } catch (ValidationException $e) {
                return response()->json([
                    'success' => false,
                    'message' => collect($e->errors())->flatten()->first() ?? 'Kode promo tidak valid.',
                ], 422);
            }

            $finalPrice = (float) $promoResult['final_amount'];
            $discountAmount = (float) $promoResult['discount_amount'];
            $appliedPromoCode = $promoResult['code'];
        }

        // Kalau pakai asuransi, validasi saldo mencukupi
        if (!empty($validated['insurance_policy_id'])) {
            $policy = InsurancePolicy::findOrFail($validated['insurance_policy_id']);

            if ($policy->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Polis asuransi tidak aktif.',
                ], 422);
            }

            $usedAmount = $policy->claims()
                ->whereIn('status', ['approved', 'partial'])
                ->sum('claim_amount');

            $remainingBalance = (float) $policy->coverage_limit - (float) $usedAmount;

            if ($finalPrice > $remainingBalance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Saldo asuransi tidak mencukupi. Sisa saldo: Rp ' . number_format($remainingBalance, 0, ',', '.'),
                ], 422);
            }
        }

        return DB::transaction(function () use ($validated, $originalPrice, $finalPrice, $discountAmount, $appliedPromoCode, $promoResult) {
            $serviceRegistration = ServiceRegistration::create([
                'user_id'             => $validated['user_id'],
                'hospital_id'         => $validated['hospital_id'] ?? null,
                'insurance_policy_id' => $validated['insurance_policy_id'] ?? null,
                'health_service_id'   => $validated['health_service_id'],
                'service_type'        => $validated['service_type'],
                'service_name'        => $validated['service_name'],
                'schedule_date'       => $validated['schedule_date'],
                'schedule_time'       => $validated['schedule_time'],
                'price'               => $finalPrice,
                'original_price'      => $appliedPromoCode ? $originalPrice : null,
                'discount_amount'     => $appliedPromoCode ? $discountAmount : null,
                'promo_code'          => $appliedPromoCode,
                'queue_number'        => $validated['queue_number'],
                'barcode_data'        => $validated['barcode_data'],
                'notes'               => $validated['notes'] ?? null,
                'status'              => $validated['status'] ?? 'registered',
            ]);

            if ($promoResult) {
                if ($promoResult['source'] === 'admin') {
                    $this->promoCodeService->recordAdminUsage(
                        PromoCode::findOrFail($promoResult['source_id']),
                        (int) $validated['user_id'],
                        PromoCode::FEATURE_SERVICE,
                        $originalPrice,
                        $discountAmount,
                        $finalPrice,
                        'service_registration',
                        $serviceRegistration->id
                    );
                } else {
                    $this->promoCodeService->recordReferralUsage(
                        DiscountCoupon::findOrFail($promoResult['source_id'])
                    );
                }
            }

            // Otomatis buat klaim & kurangi saldo asuransi
            if (!empty($validated['insurance_policy_id'])) {
                Claim::create([
                    'user_id'             => $validated['user_id'],
                    'insurance_policy_id' => $validated['insurance_policy_id'],
                    'claim_amount'        => $finalPrice,
                    'description'         => 'Klaim otomatis: ' . $validated['service_name'] . ' — ' . $validated['schedule_date'],
                    'status'              => 'approved',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Service registration created successfully.',
                'data' => $serviceRegistration->load(['hospital', 'insurancePolicy', 'healthService']),
            ], 201);
        });
    }

    public function show(string $id): JsonResponse
    {
        $serviceRegistration = ServiceRegistration::with(['user', 'hospital', 'insurancePolicy', 'healthService'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Service registration retrieved successfully.',
            'data' => $serviceRegistration,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $serviceRegistration = ServiceRegistration::findOrFail($id);

        $validated = $request->validate([
            'user_id'             => ['sometimes', 'exists:users,id'],
            'hospital_id'         => ['sometimes', 'nullable', 'exists:hospitals,id'],
            'insurance_policy_id' => ['sometimes', 'nullable', 'exists:insurance_policies,id'],
            'health_service_id'   => ['sometimes', 'exists:health_services,id'],
            'service_type'        => ['sometimes', 'string', 'max:100'],
            'service_name'        => ['sometimes', 'string', 'max:255'],
            'schedule_date'       => ['sometimes', 'date'],
            'schedule_time'       => ['sometimes', 'string', 'max:100'],
            'price'               => ['sometimes', 'numeric', 'min:0'],
            'queue_number'        => ['sometimes', 'string', 'max:100'],
            'barcode_data'        => ['sometimes', 'string', 'max:255'],
            'notes'               => ['sometimes', 'nullable', 'string', 'max:1000'],
            'status'              => ['sometimes', 'in:registered,completed,canceled'],
        ]);

        // ── Logika pembatalan ────────────────────────────────────────────
        if (isset($validated['status']) && $validated['status'] === 'canceled') {
            // Hanya bisa batalkan yang masih 'registered'
            if ($serviceRegistration->status !== 'registered') {
                return response()->json([
                    'success' => false,
                    'message' => 'Pendaftaran ini tidak dapat dibatalkan karena statusnya sudah ' . $serviceRegistration->status . '.',
                ], 422);
            }

            $minutesSinceCreated = $serviceRegistration->created_at->diffInMinutes(now());

            // ≥ 60 menit → tidak bisa dibatalkan
            if ($minutesSinceCreated >= 60) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pendaftaran tidak dapat dibatalkan. Batas waktu pembatalan (1 jam) telah terlewati.',
                ], 422);
            }

            return DB::transaction(function () use ($serviceRegistration, $validated) {
                $serviceRegistration->fill($validated)->save();

                // Kembalikan saldo asuransi jika digunakan
                if ($serviceRegistration->insurance_policy_id) {
                    // Cari klaim otomatis yang dibuat saat pendaftaran
                    $claim = \App\Models\Claim::where('insurance_policy_id', $serviceRegistration->insurance_policy_id)
                        ->where('user_id', $serviceRegistration->user_id)
                        ->where('status', 'approved')
                        ->where('claim_amount', $serviceRegistration->price)
                        ->whereDate('created_at', $serviceRegistration->created_at->toDateString())
                        ->latest()
                        ->first();

                    if ($claim) {
                        $claim->update(['status' => 'rejected']); // refund: ubah status jadi rejected agar tidak terhitung
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Pendaftaran berhasil dibatalkan.' . ($serviceRegistration->insurance_policy_id ? ' Saldo asuransi telah dikembalikan.' : ''),
                    'data'    => $serviceRegistration->fresh(['user', 'hospital', 'insurancePolicy', 'healthService']),
                ]);
            });
        }

        $serviceRegistration->fill($validated)->save();

        return response()->json([
            'success' => true,
            'message' => 'Service registration updated successfully.',
            'data' => $serviceRegistration->fresh(['user', 'hospital', 'insurancePolicy', 'healthService']),
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $serviceRegistration = ServiceRegistration::findOrFail($id);
        $serviceRegistration->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service registration deleted successfully.',
        ], 200);
    }

    /**
     * Batalkan pendaftaran layanan dengan kebijakan waktu 1 jam:
     * - Kurang dari 1 jam sejak mendaftar → TIDAK BISA dibatalkan, saldo tetap terpotong.
     * - Lebih dari atau sama dengan 1 jam → BISA dibatalkan, saldo dikembalikan.
     */
    public function cancel(string $id): JsonResponse
    {
        $serviceRegistration = ServiceRegistration::findOrFail($id);

        // Sudah dibatalkan atau selesai
        if ($serviceRegistration->status !== 'registered') {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftaran ini sudah tidak dapat diubah (status: ' . $serviceRegistration->status . ').',
            ], 422);
        }

        $createdAt   = Carbon::parse($serviceRegistration->created_at);
        $now         = Carbon::now();
        $diffMinutes = $createdAt->diffInMinutes($now);

        // Kurang dari 60 menit (hitungan menit) → TOLAK
        if ($diffMinutes < 60) {
            $sisaMenit = 60 - $diffMinutes;
            return response()->json([
                'success'          => false,
                'message'          => 'Pembatalan tidak dapat dilakukan. Pendaftaran hanya bisa dibatalkan setelah 1 jam sejak waktu pendaftaran. Sisa waktu: ' . $sisaMenit . ' menit lagi.',
                'can_cancel'       => false,
                'minutes_remaining'=> $sisaMenit,
            ], 422);
        }

        // Lebih dari 1 jam → IZINKAN batal + kembalikan saldo
        return DB::transaction(function () use ($serviceRegistration) {
            // Hapus klaim otomatis yang terkait (refund saldo)
            if ($serviceRegistration->insurance_policy_id) {
                Claim::where('insurance_policy_id', $serviceRegistration->insurance_policy_id)
                    ->where('claim_amount', $serviceRegistration->price)
                    ->where('status', 'approved')
                    ->where('description', 'like', '%' . $serviceRegistration->service_name . '%')
                    ->orderByDesc('created_at')
                    ->first()
                    ?->delete();
            }

            $serviceRegistration->update(['status' => 'canceled']);

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran berhasil dibatalkan. Saldo asuransi telah dikembalikan.',
                'data'    => $serviceRegistration->fresh(),
            ], 200);
        });
    }
}

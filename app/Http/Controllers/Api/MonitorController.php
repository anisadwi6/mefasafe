<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InsurancePolicy;
use App\Models\Claim;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MonitorController extends Controller
{
    public function getPolicySaldoSummary(Request $request)
    {
        try {
            $userId = Auth::id() ?? $request->query('user_id');

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan',
                ], 401);
            }

            // Get all policies with claims relationship
            $policies = InsurancePolicy::where('user_id', '=', $userId, 'and')
                ->where('status', '=', 'active', 'and')
                ->with('claims')
                ->get();

            if ($policies->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'summary' => [],
                        'total_coverage_all' => 0,
                        'total_claims_all' => 0,
                    ],
                ]);
            }

            $policyTypes = ['jiwa', 'kesehatan', 'kendaraan'];
            $summary = [];
            $totalCoverageAll = 0;
            $totalClaimsAll = 0;

            foreach ($policyTypes as $type) {
                $typePolicies = $policies->filter(function ($policy) use ($type) {
                    return $policy->insurance_type === $type;
                });
                
                $totalCoverage = $typePolicies->sum(function ($policy) {
                    return $policy->coverage_limit ?? 0;
                });

                $totalClaims = $typePolicies->sum(function ($policy) {
                    return $policy->claims->whereIn('status', ['approved', 'partial'])->sum('claim_amount');
                });

                $totalCoverageAll += $totalCoverage;
                $totalClaimsAll += $totalClaims;
                $remainingBalance = $totalCoverage - $totalClaims;

                $summary[] = [
                    'type' => $type,
                    'label' => $this->getTypeLabel($type),
                    'total_coverage' => (float) $totalCoverage,
                    'total_claims_approved' => (float) $totalClaims,
                    'remaining_balance' => (float) max(0, $remainingBalance),
                    'usage_percentage' => $totalCoverage > 0 ? round(($totalClaims / $totalCoverage) * 100, 2) : 0,
                    'policy_count' => $typePolicies->count(),
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'total_coverage_all' => (float) $totalCoverageAll,
                    'total_claims_all' => (float) $totalClaimsAll,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getClaimsHistory(Request $request)
    {
        $userId = Auth::id() ?? $request->query('user_id');
        $type = $request->query('type'); // jiwa, kesehatan, kendaraan

        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan',
            ], 401);
        }

        $policiesQuery = InsurancePolicy::where('user_id', '=', $userId, 'and')
            ->where('status', '=', 'active', 'and');

        if ($type) {
            $policiesQuery->where('insurance_type', '=', $type, 'and');
        }

        $policyIds = $policiesQuery->pluck('id')->all();

        if (empty($policyIds)) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $claims = Claim::whereIn('insurance_policy_id', $policyIds, 'and', false)
            ->with('insurancePolicy')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($claim) {
                return [
                    'id' => $claim->id,
                    'date' => $claim->created_at->format('Y-m-d'),
                    'amount' => (float) $claim->claim_amount,
                    'status' => $claim->status,
                    'policy_type' => optional($claim->insurancePolicy)->insurance_type,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $claims,
        ]);
    }

    public function getSaldoChart(Request $request)
    {
        $userId = Auth::id() ?? $request->query('user_id');

        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan',
            ], 401);
        }

        $policies = InsurancePolicy::where('user_id', '=', $userId, 'and')
            ->where('status', '=', 'active', 'and')
            ->get();

        $policyTypes = ['jiwa', 'kesehatan', 'kendaraan'];
        $chartData = [];

        foreach ($policyTypes as $type) {
            $typePolicies = $policies->where('insurance_type', $type);
            
            $totalCoverage = $typePolicies->sum('coverage_limit');
            $totalClaims = 0;

            foreach ($typePolicies as $policy) {
                $approvedClaims = Claim::where('insurance_policy_id', '=', $policy->id, 'and')
                    ->whereIn('status', ['approved', 'partial'], 'and', false)
                    ->sum('claim_amount');
                $totalClaims += $approvedClaims;
            }

            $remainingBalance = max(0, $totalCoverage - $totalClaims);

            $chartData[] = [
                'name' => $this->getTypeLabel($type),
                'remaining' => (float) $remainingBalance,
                'used' => (float) $totalClaims,
                'total' => (float) $totalCoverage,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $chartData,
        ]);
    }

    private function getTypeLabel($type)
    {
        return match ($type) {
            'jiwa' => 'Asuransi Jiwa',
            'kesehatan' => 'Asuransi Kesehatan',
            'kendaraan' => 'Asuransi Kendaraan',
            default => ucfirst($type),
        };
    }
}
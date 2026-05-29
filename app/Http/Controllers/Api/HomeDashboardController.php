<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\Feedback;
use App\Models\InsurancePolicy;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Coba Auth::user() dulu, fallback ke user_id dari request
        $user = Auth::user();

        if (!$user) {
            $userId = $request->query('user_id') ?? $request->input('user_id');
            if (!$userId) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
            }
            $user = \App\Models\User::find($userId);
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found.'], 404);
            }
        }

        // ── 1. SEMUA POLIS AKTIF USER (sama seperti halaman Monitor) ─────
        $activePolicies = InsurancePolicy::where('user_id', $user->id)
            ->where('status', 'active')
            ->with('claims')
            ->get();

        // Polis terbaru untuk info kartu (nomor polis, tanggal berlaku)
        $policy = $activePolicies->sortByDesc('created_at')->first();

        // ── 2. SALDO / COVERAGE (jumlahkan semua polis aktif) ────────────
        $coverageLimit = $activePolicies->sum(fn ($p) => $p->coverage_limit ?? 0);
        $totalClaimUsed = $activePolicies->sum(function ($p) {
            return $p->claims->whereIn('status', ['approved', 'partial'])->sum('claim_amount');
        });
        $remainingBalance = max(0, $coverageLimit - $totalClaimUsed);
        $usagePercent     = $coverageLimit > 0
            ? min(100, round(($totalClaimUsed / $coverageLimit) * 100, 2))
            : 0;

        // ── 3. PERBANDINGAN BULAN INI VS BULAN LALU ──────────────────────
        $thisMonth  = Transaction::where('user_id', $user->id)
            ->where('status', 'success')
            ->whereMonth('transaction_date', Carbon::now()->month)
            ->whereYear('transaction_date', Carbon::now()->year)
            ->sum('amount');

        $lastMonth  = Transaction::where('user_id', $user->id)
            ->where('status', 'success')
            ->whereMonth('transaction_date', Carbon::now()->subMonth()->month)
            ->whereYear('transaction_date', Carbon::now()->subMonth()->year)
            ->sum('amount');

        $trendPercent = 0;
        $trendUp      = true;
        if ($lastMonth > 0) {
            $trendPercent = round((($thisMonth - $lastMonth) / $lastMonth) * 100);
            $trendUp      = $trendPercent >= 0;
        } elseif ($thisMonth > 0) {
            $trendPercent = 100;
            $trendUp      = true;
        }

        // ── 4. STATS CARD ────────────────────────────────────────────────
        // Perlindungan: ada polis aktif = 100%, tidak ada = 0%
        $perlindungan = $activePolicies->isNotEmpty() ? '100%' : '0%';

        // Klaim disetujui: persentase approved dari semua klaim user
        $totalClaims    = Claim::where('user_id', $user->id)->count();
        $approvedClaims = Claim::where('user_id', $user->id)
            ->whereIn('status', ['approved', 'partial'])
            ->count();
        $claimApprovalRate = $totalClaims > 0
            ? round(($approvedClaims / $totalClaims) * 100) . '%'
            : '0%';

        // Member aktif: total user dengan polis aktif
        $activeMemberCount = User::whereHas('insurancePolicies', function ($q) {
            $q->where('status', 'active');
        })->count();
        $memberLabel = $activeMemberCount >= 1000
            ? round($activeMemberCount / 1000, 1) . 'K+'
            : $activeMemberCount . '+';

        // Rating: rata-rata dari tabel feedbacks
        try {
            $avgRating = Feedback::avg('rating');
            $ratingLabel = $avgRating ? number_format($avgRating, 1) . '/5' : '5.0/5';
        } catch (\Exception $e) {
            $ratingLabel = '5.0/5';
        }

        // ── 5. QUICK ACTIONS ─────────────────────────────────────────────
        $pendingClaims = Claim::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        $recentTransactions = Transaction::where('user_id', $user->id)
            ->latest('transaction_date')
            ->take(3)
            ->get(['transaction_type', 'amount', 'status', 'transaction_date']);

        return response()->json([
            'success' => true,
            'data' => [
                // Kartu saldo
                'policy' => $policy ? [
                    'policy_number'  => $policy->policy_number,
                    'insurance_type' => $policy->insurance_type,
                    'insured_name'   => $policy->insured_name,
                    'status'         => $policy->status,
                    'end_date'       => $policy->end_date
                        ? Carbon::parse($policy->end_date)->translatedFormat('M Y')
                        : null,
                    'active_count'   => $activePolicies->count(),
                ] : null,

                'balance' => [
                    'coverage_limit'    => $coverageLimit,
                    'used_amount'       => $totalClaimUsed,
                    'remaining_balance' => $remainingBalance,
                    'usage_percent'     => $usagePercent,
                    'formatted_balance' => 'Rp ' . number_format($remainingBalance, 0, ',', '.'),
                    'trend_percent'     => abs($trendPercent),
                    'trend_up'          => $trendUp,
                ],

                // Stats cards
                'stats' => [
                    'perlindungan'       => $perlindungan,
                    'claim_approval_rate'=> $claimApprovalRate,
                    'active_members'     => $memberLabel,
                    'rating'             => $ratingLabel,
                ],

                // Quick actions
                'pending_claims'      => $pendingClaims,
                'recent_transactions' => $recentTransactions,
            ],
        ]);
    }
}

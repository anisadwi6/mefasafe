<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClaimController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');

        $query = Claim::with(['user', 'insurancePolicy'])->latest();
        if ($userId) {
            $query->where('user_id', $userId);
        }

        return response()->json([
            'message' => 'Claims retrieved successfully.',
            'data' => $query->get(),
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'insurance_policy_id' => ['required', 'exists:insurance_policies,id'],
            'claim_amount' => ['required', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,2})?$/'],
            'description' => ['required', 'string', 'max:5000'],
            'document' => ['sometimes', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'status' => ['sometimes', 'in:pending,approved,rejected,partial'],
        ]);

        $documentPath = null;
        if ($request->hasFile('document')) {
            $documentPath = $this->uploadFile($request->file('document'));
        }

        $claim = Claim::create([
            'user_id' => $validated['user_id'],
            'insurance_policy_id' => $validated['insurance_policy_id'],
            'claim_amount' => $validated['claim_amount'],
            'description' => $validated['description'],
            'document_path' => $documentPath,
            'status' => $validated['status'] ?? 'pending',
        ]);

        return response()->json([
            'message' => 'Claim created successfully.',
            'data' => $claim,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $claim = Claim::with(['user', 'insurancePolicy'])->findOrFail($id);

        return response()->json([
            'message' => 'Claim retrieved successfully.',
            'data' => $claim,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $claim = Claim::findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['sometimes', 'exists:users,id'],
            'insurance_policy_id' => ['sometimes', 'exists:insurance_policies,id'],
            'claim_amount' => ['sometimes', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,2})?$/'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'document' => ['sometimes', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'status' => ['sometimes', 'in:pending,approved,rejected,partial'],
        ]);

        if (array_key_exists('document', $validated) && $request->hasFile('document')) {
            $validated['document_path'] = $this->uploadFile($request->file('document'));
        }

        $previousStatus = $claim->status;
        $claim->fill($validated);
        $claim->save();

        if (! in_array($previousStatus, ['approved', 'partial']) && in_array($claim->status, ['approved', 'partial'])) {
            Transaction::create([
                'user_id' => $claim->user_id,
                'insurance_policy_id' => $claim->insurance_policy_id,
                'transaction_type' => 'klaim_keluar',
                'amount' => $claim->claim_amount,
                'transaction_date' => now(),
                'status' => 'success',
            ]);
        }

        return response()->json([
            'message' => 'Claim updated successfully.',
            'data' => $claim->fresh(['user', 'insurancePolicy']),
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $claim = Claim::findOrFail($id);
        $claim->delete();

        return response()->json([
            'message' => 'Claim deleted successfully.',
        ], 200);
    }

    private function uploadFile($file): string
    {
        $directory = public_path('claims');

        if (! is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $file->move($directory, $filename);

        return 'claims/' . $filename;
    }
}

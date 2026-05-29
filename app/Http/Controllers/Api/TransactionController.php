<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Transactions retrieved successfully.',
            'data' => Transaction::with(['user', 'insurancePolicy'])->latest()->get(),
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'insurance_policy_id' => ['nullable', 'exists:insurance_policies,id'],
            'transaction_type' => ['required', 'in:premi_masuk,klaim_keluar'],
            'amount' => ['required', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,2})?$/'],
            'transaction_date' => ['required', 'date'],
            'status' => ['required', 'in:success,failed,pending'],
        ]);

        $transaction = Transaction::create($validated);

        return response()->json([
            'message' => 'Transaction created successfully.',
            'data' => $transaction,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $transaction = Transaction::with(['user', 'insurancePolicy'])->findOrFail($id);

        return response()->json([
            'message' => 'Transaction retrieved successfully.',
            'data' => $transaction,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['sometimes', 'exists:users,id'],
            'insurance_policy_id' => ['sometimes', 'nullable', 'exists:insurance_policies,id'],
            'transaction_type' => ['sometimes', 'in:premi_masuk,klaim_keluar'],
            'amount' => ['sometimes', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,2})?$/'],
            'transaction_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:success,failed,pending'],
        ]);

        $transaction->fill($validated)->save();

        return response()->json([
            'message' => 'Transaction updated successfully.',
            'data' => $transaction->fresh(['user', 'insurancePolicy']),
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $transaction = Transaction::findOrFail($id);
        $transaction->delete();

        return response()->json([
            'message' => 'Transaction deleted successfully.',
        ], 200);
    }
}

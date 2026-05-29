<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HospitalRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HospitalRegistrationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Hospital registrations retrieved successfully.',
            'data' => HospitalRegistration::with('user')->latest()->get(),
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'insurance_policy_id' => ['nullable', 'exists:insurance_policies,id'],
            'hospital_name' => ['required', 'string', 'max:255'],
            'doctor_name' => ['required', 'string', 'max:255'],
            'schedule_date' => ['required', 'date'],
            'queue_number' => ['required', 'string', 'max:100'],
            'barcode_data' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'in:registered,canceled'],
        ]);

        $hospitalRegistration = HospitalRegistration::create([
            'user_id' => $validated['user_id'],
            'insurance_policy_id' => $validated['insurance_policy_id'] ?? null,
            'hospital_name' => $validated['hospital_name'],
            'doctor_name' => $validated['doctor_name'],
            'schedule_date' => $validated['schedule_date'],
            'queue_number' => $validated['queue_number'],
            'barcode_data' => $validated['barcode_data'],
            'status' => $validated['status'] ?? 'registered',
        ]);

        return response()->json([
            'message' => 'Hospital registration created successfully.',
            'data' => $hospitalRegistration,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $hospitalRegistration = HospitalRegistration::with('user')->findOrFail($id);

        return response()->json([
            'message' => 'Hospital registration retrieved successfully.',
            'data' => $hospitalRegistration,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $hospitalRegistration = HospitalRegistration::findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['sometimes', 'exists:users,id'],
            'insurance_policy_id' => ['sometimes', 'nullable', 'exists:insurance_policies,id'],
            'hospital_name' => ['sometimes', 'string', 'max:255'],
            'doctor_name' => ['sometimes', 'string', 'max:255'],
            'schedule_date' => ['sometimes', 'date'],
            'queue_number' => ['sometimes', 'string', 'max:100'],
            'barcode_data' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'in:registered,canceled'],
        ]);

        $hospitalRegistration->fill($validated)->save();

        return response()->json([
            'message' => 'Hospital registration updated successfully.',
            'data' => $hospitalRegistration->fresh('user'),
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $hospitalRegistration = HospitalRegistration::findOrFail($id);
        $hospitalRegistration->delete();

        return response()->json([
            'message' => 'Hospital registration deleted successfully.',
        ], 200);
    }
}

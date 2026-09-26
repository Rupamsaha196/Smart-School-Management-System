<?php

namespace App\Http\Controllers;

use App\Models\StudentFee;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeeController extends Controller
{
    /**
     * List fees with optional filters.
     * GET /fees?student_id=1&status=Pending&month=September
     */
    public function index(Request $request)
    {
        $query = StudentFee::with('student')
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->month, fn($q) => $q->where('month', $request->month))
            ->when($request->type, fn($q) => $q->where('type', $request->type));

        return response()->json($query->orderBy('id', 'desc')->get());
    }

    /**
     * Create a new fee record.
     */
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'type'       => 'required|string',
            'amount'     => 'required|numeric|min:0',
            'month'      => 'required|string',
        ]);

        $data = $request->all();

        // Auto-generate receipt number
        $lastReceipt = StudentFee::max('id') ?? 0;
        $data['receipt_no'] = 'RCP' . date('Y') . str_pad($lastReceipt + 1, 5, '0', STR_PAD_LEFT);
        $data['paid']       = $data['paid'] ?? 0;
        $data['status']     = ($data['paid'] >= $data['amount']) ? 'Paid' : (($data['paid'] > 0) ? 'Partial' : 'Pending');

        if ($request->user()) {
            $data['collected_by'] = $request->user()->id;
        }

        $fee = StudentFee::create($data);

        if ($fee->paid > 0) {
            $student = Student::find($fee->student_id);
            $studentName = $student ? "{$student->first_name} {$student->last_name}" : 'Student';
            $admNo = $student ? $student->admission_no : '';
            DB::table('transactions')->insert([
                'type'        => 'Income',
                'head'        => $fee->type ?? 'Fee Payment',
                'amount'      => $fee->paid,
                'date'        => now()->toDateString(),
                'description' => "Fee payment ({$fee->type}) for {$studentName} ({$admNo})",
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        return response()->json($fee->load('student'), 201);
    }

    /**
     * Collect payment by student ID or admission number.
     * POST /fees/collect
     */
    public function collect(Request $request)
    {
        $request->validate([
            'amount'       => 'required|numeric|min:1',
            'payment_mode' => 'nullable|string',
        ]);

        $student = null;
        if ($request->filled('student_id')) {
            $student = Student::find($request->student_id);
        }
        if (!$student && $request->filled('admission_no')) {
            $adm = trim($request->admission_no);
            $student = Student::where('admission_no', $adm)
                ->orWhere('admission_no', 'like', "%$adm%")
                ->first();
        }

        if (!$student) {
            return response()->json(['message' => 'Student not found.'], 404);
        }

        $amount = (float)$request->amount;
        $type   = $request->type ?? 'Tuition Fee';
        $month  = $request->month ?? date('F');
        $mode   = $request->payment_mode ?? 'Cash';

        $lastReceipt = StudentFee::max('id') ?? 0;
        $receiptNo = 'RCP' . date('Y') . str_pad($lastReceipt + 1, 5, '0', STR_PAD_LEFT);

        $fee = StudentFee::create([
            'student_id'   => $student->id,
            'type'         => $type,
            'month'        => $month,
            'amount'       => $amount,
            'paid'         => $amount,
            'status'       => 'Paid',
            'date'         => now()->toDateString(),
            'payment_mode' => $mode,
            'receipt_no'   => $receiptNo,
            'collected_by' => $request->user()?->id,
        ]);

        // Automatically record into Income
        $studentName = trim("{$student->first_name} {$student->last_name}") ?: $student->name;
        DB::table('transactions')->insert([
            'type'        => 'Income',
            'head'        => 'Fee Collection',
            'amount'      => $amount,
            'date'        => now()->toDateString(),
            'description' => "Fee payment ({$type}) for {$studentName} ({$student->admission_no})",
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return response()->json([
            'message' => "Fee of ₹{$amount} collected successfully and logged to Income.",
            'fee'     => $fee->load('student'),
            'receipt' => $receiptNo,
        ], 201);
    }

    /**
     * Collect payment against an existing fee record.
     * POST /fees/{fee}/pay
     */
    public function pay(Request $request, StudentFee $fee)
    {
        $request->validate([
            'paid'         => 'required|numeric|min:0',
            'payment_mode' => 'nullable|string',
            'transaction_id' => 'nullable|string',
        ]);

        $newPaid = $fee->paid + $request->paid;
        $status  = ($newPaid >= $fee->amount) ? 'Paid' : 'Partial';

        $fee->update([
            'paid'           => min($newPaid, $fee->amount),
            'status'         => $status,
            'payment_mode'   => $request->payment_mode ?? $fee->payment_mode,
            'transaction_id' => $request->transaction_id,
            'date'           => now()->toDateString(),
            'collected_by'   => $request->user()?->id,
        ]);

        // Auto-add income transaction
        DB::table('transactions')->insert([
            'type'        => 'Income',
            'head'        => $fee->type,
            'amount'      => $request->paid,
            'date'        => now()->toDateString(),
            'description' => 'Fee collection for ' . ($fee->student->first_name ?? 'Student'),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return response()->json($fee->fresh()->load('student'));
    }

    /**
     * Fee collection summary / overview.
     * GET /fees/summary
     */
    public function summary()
    {
        $totalDue       = StudentFee::sum('amount');
        $totalCollected = StudentFee::where('status', 'Paid')->sum('paid');
        $totalPending   = StudentFee::where('status', 'Pending')->sum('amount');

        $monthlyData = StudentFee::where('status', 'Paid')
            ->select(
                DB::raw("strftime('%m', date) as month_num"),
                DB::raw("strftime('%Y', date) as year"),
                DB::raw('sum(paid) as collected')
            )
            ->whereNotNull('date')
            ->groupBy('month_num', 'year')
            ->orderBy('year', 'desc')
            ->orderBy('month_num', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'total_due'       => $totalDue,
            'total_collected' => $totalCollected,
            'total_pending'   => $totalPending,
            'collection_rate' => $totalDue > 0 ? round(($totalCollected / $totalDue) * 100, 2) : 0,
            'monthly_data'    => $monthlyData,
        ]);
    }

    /**
     * Get fee details for one record.
     */
    public function show(StudentFee $fee)
    {
        return response()->json($fee->load('student'));
    }

    public function update(Request $request, StudentFee $fee)
    {
        $fee->update($request->all());
        return response()->json($fee->fresh()->load('student'));
    }

    public function destroy(StudentFee $fee)
    {
        $fee->delete();
        return response()->json(null, 204);
    }

    /**
     * Defaulters list — students with Pending fees.
     * GET /fees/defaulters
     */
    public function defaulters(Request $request)
    {
        $defaulters = StudentFee::with('student')
            ->where('status', 'Pending')
            ->selectRaw('student_id, sum(amount) as total_due, sum(paid) as total_paid, count(*) as pending_count')
            ->groupBy('student_id')
            ->orderByDesc('total_due')
            ->get();

        return response()->json($defaulters);
    }
}

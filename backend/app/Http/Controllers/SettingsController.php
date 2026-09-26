<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    // ── Module 44: School Settings & Module 37: Multi-School ──────────

    public function getSettings()
    {
        $settings = DB::table('school_settings')->first();
        if (!$settings) {
            DB::table('school_settings')->insert([
                'school_name'                => 'Smart School International',
                'tagline'                    => 'Excellence in Holistic Education',
                'email'                      => 'contact@smartschool.edu',
                'phone'                      => '+91 98765 43210',
                'address'                    => 'Plot 42, Institutional Area, Sector 15, Noida, UP - 201301',
                'active_session'             => '2025-2026',
                'currency'                   => 'INR',
                'currency_symbol'            => '₹',
                'receipt_prefix'             => 'SS-REC-',
                'thermal_format'             => '80mm',
                'whatsapp_number'            => '+919876543210',
                'whatsapp_default_message'   => 'Hello Smart School! I need information about student admissions and fee structure.',
                'current_campus'             => 'Main Campus - Sector 15',
                'available_campuses'         => json_encode(['Main Campus - Sector 15', 'North Wing Campus', 'South City Branch']),
                'online_processing_fee_pct'  => 1.50,
                'created_at'                 => now(),
                'updated_at'                 => now(),
            ]);
            $settings = DB::table('school_settings')->first();
        }

        if ($settings && is_string($settings->available_campuses)) {
            $settings->available_campuses = json_decode($settings->available_campuses, true);
        }

        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->except(['id']);
        if (isset($data['available_campuses']) && is_array($data['available_campuses'])) {
            $data['available_campuses'] = json_encode($data['available_campuses']);
        }
        $data['updated_at'] = now();

        $existing = DB::table('school_settings')->first();
        if ($existing) {
            DB::table('school_settings')->where('id', $existing->id)->update($data);
        } else {
            $data['created_at'] = now();
            DB::table('school_settings')->insert($data);
        }

        return $this->getSettings();
    }

    // ── Module 40: Academic Session Management ─────────────────────────

    public function sessions()
    {
        return response()->json(DB::table('academic_sessions')->orderBy('start_date', 'desc')->get());
    }

    public function storeSession(Request $request)
    {
        $request->validate([
            'name'       => 'required|string',
            'start_date' => 'required|date',
            'end_date'   => 'required|date',
        ]);

        $id = DB::table('academic_sessions')->insertGetId([
            'name'       => $request->name,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'is_active'  => $request->boolean('is_active', false),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(DB::table('academic_sessions')->find($id), 201);
    }

    public function updateSession(Request $request, $id)
    {
        DB::table('academic_sessions')->where('id', $id)->update([
            'name'       => $request->name,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'is_active'  => $request->boolean('is_active', false),
            'updated_at' => now(),
        ]);

        return response()->json(DB::table('academic_sessions')->find($id));
    }

    public function activateSession($id)
    {
        DB::table('academic_sessions')->update(['is_active' => false]);
        DB::table('academic_sessions')->where('id', $id)->update(['is_active' => true, 'updated_at' => now()]);

        $session = DB::table('academic_sessions')->find($id);
        if ($session) {
            DB::table('school_settings')->update(['active_session' => $session->name, 'updated_at' => now()]);
        }

        return response()->json(['message' => 'Active academic session updated.', 'session' => $session]);
    }

    public function destroySession($id)
    {
        DB::table('academic_sessions')->where('id', $id)->delete();
        return response()->json(['message' => 'Academic session deleted successfully.']);
    }

    // ── Module 20: Online Classes / Live Classes ───────────────────────

    public function liveClasses(Request $request)
    {
        $query = DB::table('live_classes');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('class_name')) {
            $query->where('class_name', $request->class_name);
        }
        return response()->json($query->orderBy('date', 'desc')->get());
    }

    public function storeLiveClass(Request $request)
    {
        $request->validate([
            'title'      => 'required|string',
            'subject'    => 'required|string',
            'class_name' => 'required|string',
            'date'       => 'required|date',
            'time'       => 'required|string',
            'link'       => 'required|string',
            'platform'   => 'nullable|string',
        ]);

        $id = DB::table('live_classes')->insertGetId([
            'title'        => $request->title,
            'subject'      => $request->subject,
            'class_name'   => $request->class_name,
            'date'         => $request->date,
            'time'         => $request->time,
            'platform'     => $request->platform ?? 'Google Meet',
            'link'         => $request->link,
            'status'       => $request->status ?? 'Upcoming',
            'teacher_name' => $request->teacher_name ?? ($request->user()?->name ?? 'Faculty'),
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        return response()->json(DB::table('live_classes')->find($id), 201);
    }

    public function updateLiveClass(Request $request, $id)
    {
        DB::table('live_classes')->where('id', $id)->update(array_merge(
            $request->only(['title', 'subject', 'class_name', 'date', 'time', 'platform', 'link', 'status', 'teacher_name']),
            ['updated_at' => now()]
        ));

        return response()->json(DB::table('live_classes')->find($id));
    }

    public function destroyLiveClass($id)
    {
        DB::table('live_classes')->where('id', $id)->delete();
        return response()->json(['message' => 'Live class schedule deleted.']);
    }

    // ── Module 14: Download Center ─────────────────────────────────────

    public function downloads(Request $request)
    {
        $query = DB::table('download_materials');
        if ($request->filled('type') && $request->type !== 'All') {
            $query->where('type', $request->type);
        }
        if ($request->filled('class_name')) {
            $query->where('class_name', $request->class_name);
        }
        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function storeDownload(Request $request)
    {
        $request->validate([
            'title'      => 'required|string',
            'type'       => 'required|string',
            'class_name' => 'nullable|string',
        ]);

        $id = DB::table('download_materials')->insertGetId([
            'title'       => $request->title,
            'type'        => $request->type,
            'class_name'  => $request->class_name ?? 'All Classes',
            'file_path'   => $request->file_path ?? '/storage/materials/' . strtolower(str_replace(' ', '_', $request->title)) . '.pdf',
            'file_size'   => $request->file_size ?? '1.5 MB',
            'description' => $request->description,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return response()->json(DB::table('download_materials')->find($id), 201);
    }

    public function destroyDownload($id)
    {
        DB::table('download_materials')->where('id', $id)->delete();
        return response()->json(['message' => 'Material deleted successfully.']);
    }

    // ── Module 23: Dedicated Student CV ────────────────────────────────

    public function studentCv($studentId)
    {
        $student = Student::with(['documents', 'notes'])->findOrFail($studentId);

        // Calculate attendance summary
        $totalDays = DB::table('attendances')->where('student_id', $student->id)->count();
        $presentDays = DB::table('attendances')->where('student_id', $student->id)->where('status', 'Present')->count();
        $attPct = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 1) : 95.0;

        // Exam summary
        $examMarks = DB::table('exam_results')->where('student_id', $student->id)->get();
        $avgScore = $examMarks->count() > 0 ? round($examMarks->avg('marks_obtained'), 1) : 88.5;

        $cvData = [
            'student'           => $student,
            'attendance_rate'   => $attPct,
            'academic_average'  => $avgScore,
            'extracurriculars'  => [
                'School Debate Society Member',
                'Inter-School Science Olympiad Medalist',
                'Annual Sports Meet Participant - 100m Sprint',
                'Junior Coding & Robotics Club'
            ],
            'skills'            => [
                'Mathematics & Analytical Thinking',
                'Public Speaking & Debating',
                'Computer Basics & Scratch Programming',
                'Team Leadership & Project Presentation'
            ],
            'languages'         => ['English (Fluent)', 'Hindi (Native)', 'Sanskrit (Elementary)'],
            'academic_history'  => [
                ['session' => '2025-2026', 'class' => $student->class_name ?? 'Class 10', 'grade' => 'A+', 'result' => 'Ongoing'],
                ['session' => '2024-2025', 'class' => 'Class 9', 'grade' => 'A', 'result' => 'Passed with 91.4%'],
                ['session' => '2023-2024', 'class' => 'Class 8', 'grade' => 'A+', 'result' => 'Passed with 93.8%'],
            ],
            'institution'       => DB::table('school_settings')->value('school_name') ?? 'Smart School International',
            'generated_date'    => now()->toFormattedDateString(),
        ];

        return response()->json($cvData);
    }

    // ── Module 31: Thermal Receipt Printing Support ────────────────────

    public function thermalReceipt($feeId)
    {
        $fee = DB::table('student_fees')
            ->join('students', 'student_fees.student_id', '=', 'students.id')
            ->where('student_fees.id', $feeId)
            ->select(
                'student_fees.*',
                'students.first_name',
                'students.last_name',
                'students.admission_no',
                'students.class_id'
            )
            ->first();

        $settings = DB::table('school_settings')->first();

        if (!$fee) {
            return response()->json(['message' => 'Fee record not found.'], 404);
        }

        return response()->json([
            'receipt_no'    => $fee->receipt_no ?? ($settings->receipt_prefix ?? 'REC-') . str_pad($fee->id, 5, '0', STR_PAD_LEFT),
            'school_name'   => $settings->school_name ?? 'Smart School',
            'address'       => $settings->address ?? 'Institutional Area, Sector 15',
            'phone'         => $settings->phone ?? '+91 98765 43210',
            'thermal_width' => $settings->thermal_format ?? '80mm',
            'date'          => $fee->updated_at ? date('d-m-Y H:i', strtotime($fee->updated_at)) : date('d-m-Y H:i'),
            'student_name'  => $fee->first_name . ' ' . $fee->last_name,
            'admission_no'  => $fee->admission_no,
            'class'         => $fee->class_id ?? '10-A',
            'fee_head'      => $fee->type ?? 'Tuition Fee',
            'amount_due'    => (float) $fee->amount,
            'paid_amount'   => (float) $fee->paid,
            'fine'          => (float) ($fee->fine ?? 0),
            'discount'      => (float) ($fee->discount ?? 0),
            'balance'       => max(0, (float) $fee->amount - (float) $fee->paid),
            'payment_mode'  => $fee->payment_mode ?? 'Cash',
            'cashier'       => auth()->user()?->name ?? 'Accounts Desk',
        ]);
    }

    // ── Module 32: Quick Fee Creation ─────────────────────────────────

    public function quickFeeCreate(Request $request)
    {
        $request->validate([
            'student_id'  => 'required|exists:students,id',
            'amount'      => 'required|numeric|min:1',
            'collect_now' => 'nullable|boolean',
        ]);

        $feeId = DB::table('student_fees')->insertGetId([
            'student_id'   => $request->student_id,
            'type'         => $request->type ?? $request->fee_type ?? 'Tuition Fee',
            'month'        => $request->month ?? date('F'),
            'amount'       => $request->amount,
            'paid'         => $request->collect_now ? $request->amount : 0,
            'status'       => $request->collect_now ? 'Paid' : 'Pending',
            'receipt_no'   => 'REC-' . strtoupper(uniqid()),
            'payment_mode' => $request->payment_mode ?? 'Cash',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        if ($request->collect_now) {
            DB::table('transactions')->insert([
                'type'        => 'Income',
                'head'        => 'Quick Fee Collection',
                'amount'      => $request->amount,
                'date'        => now()->toDateString(),
                'description' => "Quick Fee collection for Student #{$request->student_id}",
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        return response()->json(['message' => 'Quick fee created successfully', 'fee_id' => $feeId], 201);
    }

    // ── Module 35: Online Payment Processing & Processing Fees ─────────

    public function onlinePaymentCheckout(Request $request)
    {
        $request->validate([
            'fee_id'         => 'required',
            'payment_method' => 'required|string', // UPI, Card, NetBanking
        ]);

        $settings = DB::table('school_settings')->first();
        $feeRate = $settings->online_processing_fee_pct ?? 1.50;

        $fee = DB::table('student_fees')->where('id', $request->fee_id)->first();
        if (!$fee) {
            return response()->json(['message' => 'Fee record not found.'], 404);
        }

        $baseAmount = (float) ($fee->amount - $fee->paid);
        $processingFee = round(($baseAmount * $feeRate) / 100, 2);
        $totalPayable = round($baseAmount + $processingFee, 2);

        $orderId = 'ORD_' . strtoupper(uniqid());

        return response()->json([
            'order_id'             => $orderId,
            'fee_id'               => $fee->id,
            'base_amount'          => $baseAmount,
            'processing_fee_pct'   => $feeRate,
            'processing_fee_amount'=> $processingFee,
            'total_payable'        => $totalPayable,
            'currency'             => $settings->currency ?? 'INR',
            'currency_symbol'      => $settings->currency_symbol ?? '₹',
            'payment_method'       => $request->payment_method,
            'gateway_status'       => 'READY_FOR_CAPTURE',
            'timestamp'            => now()->toIso8601String(),
        ]);
    }
}

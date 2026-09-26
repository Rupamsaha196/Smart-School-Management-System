<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\StaffAttendance;
use App\Models\SalaryRecord;
use App\Models\PayslipItem;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    // ── Staff CRUD ─────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $query = Staff::query();
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                  ->orWhere('emp_id', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%");
            });
        }
        if ($request->filled('role'))       $query->where('role', $request->role);
        if ($request->filled('department')) $query->where('department', $request->department);
        if ($request->filled('status'))     $query->where('status', $request->status);

        return response()->json($query->orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'       => 'required|string',
            'role'       => 'required|string',
            'department' => 'nullable|string',
            'email'      => 'nullable|email',
            'emp_id'     => 'nullable|string',
        ]);

        $data = $request->all();
        $data['department'] = $data['department'] ?? 'General';

        if (empty($data['emp_id'])) {
            $num = (Staff::max('id') ?? 0) + 1;
            do {
                $candidate = 'EMP' . str_pad($num, 3, '0', STR_PAD_LEFT);
                $num++;
            } while (Staff::where('emp_id', $candidate)->exists());
            $data['emp_id'] = $candidate;
        }

        $data['status'] = $data['status'] ?? 'Active';

        return response()->json(Staff::create($data), 201);
    }

    public function show(Staff $staff)
    {
        return response()->json($staff->load([
            'salaryRecords',
            'attendances',
        ]));
    }

    public function update(Request $request, Staff $staff)
    {
        $data = $request->except(['id']);
        if (empty($data['emp_id'])) {
            unset($data['emp_id']);
        }
        $staff->update($data);
        return response()->json($staff->fresh());
    }

    public function destroy(Staff $staff)
    {
        $staff->delete();
        return response()->json(null, 204);
    }

    // ── Staff Attendance ────────────────────────────────────────────────

    public function attendance(Request $request)
    {
        $query = StaffAttendance::with('staff')
            ->when($request->date, fn($q) => $q->whereDate('date', $request->date))
            ->when($request->staff_id, fn($q) => $q->where('staff_id', $request->staff_id));

        return response()->json($query->orderBy('date', 'desc')->get());
    }

    public function markAttendance(Request $request)
    {
        $status = $request->status === 'Half-Day' ? 'Half Day' : $request->status;
        $request->merge(['status' => $status]);

        $request->validate([
            'staff_id'  => 'required|exists:staff,id',
            'date'      => 'required|date',
            'status'    => 'required|in:Present,Absent,Late,Half Day,Holiday,Leave',
            'time_in'   => 'nullable|date_format:H:i',
            'time_out'  => 'nullable|date_format:H:i',
        ]);

        $record = StaffAttendance::updateOrCreate(
            ['staff_id' => $request->staff_id, 'date' => $request->date],
            $request->only('status', 'remark', 'time_in', 'time_out')
        );

        return response()->json($record);
    }

    public function bulkMarkAttendance(Request $request)
    {
        $request->validate([
            'date'      => 'required|date',
            'records'   => 'required|array',
            'records.*.staff_id' => 'required|exists:staff,id',
            'records.*.status'   => 'required|string',
        ]);

        $date = $request->date;
        $count = 0;

        foreach ($request->records as $item) {
            $rawStatus = $item['status'] ?? 'Present';
            $status = ($rawStatus === 'Half-Day') ? 'Half Day' : $rawStatus;
            if (!in_array($status, ['Present', 'Absent', 'Late', 'Half Day', 'Holiday', 'Leave'])) {
                $status = 'Present';
            }

            StaffAttendance::updateOrCreate(
                ['staff_id' => $item['staff_id'], 'date' => $date],
                [
                    'status'   => $status,
                    'remark'   => $item['remark'] ?? null,
                    'time_in'  => $item['time_in'] ?? null,
                    'time_out' => $item['time_out'] ?? null,
                ]
            );
            $count++;
        }

        return response()->json(['message' => "$count staff attendance records saved successfully."]);
    }

    // ── Payroll ─────────────────────────────────────────────────────────

    public function salaryRecords(Staff $staff)
    {
        return response()->json($staff->salaryRecords()->with('items')->orderBy('year', 'desc')->orderBy('month')->get());
    }

    public function generatePayslip(Request $request, Staff $staff)
    {
        $request->validate([
            'month'       => 'required|string',
            'year'        => 'required|integer',
            'allowances'  => 'nullable|numeric',
            'deductions'  => 'nullable|numeric',
            'items'       => 'nullable|array',
        ]);

        $basic      = $staff->basic_salary ?? 0;
        $allowances = $request->allowances ?? 0;
        $deductions = $request->deductions ?? 0;
        $net        = $basic + $allowances - $deductions;

        $record = SalaryRecord::updateOrCreate(
            ['staff_id' => $staff->id, 'month' => $request->month, 'year' => $request->year],
            [
                'basic'        => $basic,
                'allowances'   => $allowances,
                'deductions'   => $deductions,
                'net_salary'   => $net,
                'status'       => $request->status ?? 'Pending',
                'payment_date' => $request->payment_date,
                'payment_mode' => $request->payment_mode,
            ]
        );

        // Save line items
        if ($request->filled('items')) {
            $record->items()->delete();
            foreach ($request->items as $item) {
                $record->items()->create($item);
            }
        }

        return response()->json($record->load('items', 'staff'));
    }

    public function payPayslip(Request $request, SalaryRecord $record)
    {
        $record->update([
            'status'       => 'Paid',
            'payment_date' => $request->payment_date ?? now()->toDateString(),
            'payment_mode' => $request->payment_mode ?? 'Bank Transfer',
        ]);

        return response()->json($record->load('staff'));
    }
}

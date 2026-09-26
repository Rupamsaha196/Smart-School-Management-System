<?php

namespace App\Http\Controllers;

use App\Models\LeaveApplication;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveApplication::with('leaveable', 'approvedBy')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->leave_type, fn($q) => $q->where('leave_type', $request->leave_type));

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'leaveable_type' => 'required|in:App\\Models\\Staff,App\\Models\\Student',
            'leaveable_id'   => 'required|integer',
            'leave_type'     => 'required|string',
            'from_date'      => 'required|date',
            'to_date'        => 'required|date|after_or_equal:from_date',
            'reason'         => 'required|string',
        ]);

        $leave = LeaveApplication::create($request->all());
        return response()->json($leave->load('leaveable'), 201);
    }

    public function show(LeaveApplication $leave)
    {
        return response()->json($leave->load('leaveable', 'approvedBy'));
    }

    /**
     * Approve or reject a leave application.
     * POST /leaves/{leave}/action
     */
    public function action(Request $request, LeaveApplication $leave)
    {
        $request->validate([
            'status'  => 'required|in:Approved,Rejected',
            'remarks' => 'nullable|string',
        ]);

        $leave->update([
            'status'      => $request->status,
            'remarks'     => $request->remarks,
            'approved_by' => $request->user()->id,
        ]);

        return response()->json($leave->load('leaveable', 'approvedBy'));
    }

    public function destroy(LeaveApplication $leave)
    {
        $leave->delete();
        return response()->json(null, 204);
    }
}

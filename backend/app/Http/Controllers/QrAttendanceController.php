<?php

namespace App\Http\Controllers;

use App\Models\QrAttendanceLog;
use Illuminate\Http\Request;

class QrAttendanceController extends Controller
{
    /**
     * List recent QR scan logs, newest first.
     */
    public function index(Request $request)
    {
        $limit = $request->get('limit', 50);

        $logs = QrAttendanceLog::orderBy('scanned_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($logs);
    }

    /**
     * Process a QR/barcode scan and record attendance.
     */
    public function scan(Request $request)
    {
        $validated = $request->validate([
            'identifier' => 'required|string|max:255',
        ]);

        // Determine person type from identifier prefix convention:
        // T-xxx = Staff, S-xxx or anything else = Student
        $identifier = $validated['identifier'];
        $personType = str_starts_with(strtoupper($identifier), 'T') ? 'Staff' : 'Student';

        // In production, you'd look up the person from a students/staff table.
        // For now, generate a descriptive name from the identifier.
        $name = $personType === 'Staff'
            ? 'Staff #' . substr($identifier, 1)
            : 'Student #' . $identifier;

        $log = QrAttendanceLog::create([
            'name'        => $name,
            'identifier'  => $identifier,
            'person_type' => $personType,
            'status'      => 'Present',
            'scanned_at'  => now(),
        ]);

        return response()->json($log, 201);
    }

    /**
     * Get attendance stats for today.
     */
    public function todayStats()
    {
        $today = now()->toDateString();

        $stats = [
            'total'    => QrAttendanceLog::whereDate('scanned_at', $today)->count(),
            'students' => QrAttendanceLog::whereDate('scanned_at', $today)->where('person_type', 'Student')->count(),
            'staff'    => QrAttendanceLog::whereDate('scanned_at', $today)->where('person_type', 'Staff')->count(),
        ];

        return response()->json($stats);
    }
}

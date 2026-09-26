<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Get attendance list with filters.
     * GET /attendance?date=2026-09-26&class_id=8&section_id=1
     */
    public function index(Request $request)
    {
        $query = Attendance::with('student')
            ->when($request->date, fn($q) => $q->whereDate('date', $request->date))
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->when($request->month && $request->year, fn($q) =>
                $q->whereMonth('date', $request->month)->whereYear('date', $request->year)
            );

        return response()->json($query->orderBy('date', 'desc')->get());
    }

    /**
     * Bulk mark attendance for a class on a date.
     * POST /attendance/bulk
     * body: { date, class_id, section_id, records: [{student_id, status, remark}] }
     */
    public function bulkMark(Request $request)
    {
        $request->validate([
            'date'              => 'required|date',
            'class_id'         => 'required',
            'records'          => 'required|array',
            'records.*.student_id' => 'required|exists:students,id',
            'records.*.status'     => 'required|in:Present,Absent,Late,Half Day,Holiday',
        ]);

        $markedBy = $request->user()->id;
        $upserted = 0;

        foreach ($request->records as $rec) {
            Attendance::updateOrCreate(
                ['student_id' => $rec['student_id'], 'date' => $request->date],
                [
                    'class_id'  => $request->class_id,
                    'status'    => $rec['status'],
                    'remark'    => $rec['remark'] ?? null,
                    'marked_by' => $markedBy,
                ]
            );
            $upserted++;
        }

        return response()->json(['message' => "Attendance marked for $upserted students."]);
    }

    /**
     * Get attendance summary for a student.
     * GET /attendance/student/{student}
     */
    public function studentSummary(Student $student, Request $request)
    {
        $query = Attendance::where('student_id', $student->id);

        if ($request->filled('month') && $request->filled('year')) {
            $query->whereMonth('date', $request->month)->whereYear('date', $request->year);
        }

        $records = $query->get();

        $summary = [
            'total'    => $records->count(),
            'present'  => $records->where('status', 'Present')->count(),
            'absent'   => $records->where('status', 'Absent')->count(),
            'late'     => $records->where('status', 'Late')->count(),
            'half_day' => $records->where('status', 'Half Day')->count(),
        ];

        $summary['percentage'] = $summary['total'] > 0
            ? round(($summary['present'] / $summary['total']) * 100, 2)
            : 0;

        return response()->json([
            'student' => $student->name,
            'summary' => $summary,
            'records' => $records,
        ]);
    }

    /**
     * Get daily attendance stats.
     * GET /attendance/daily-stats?date=2026-09-26
     */
    public function dailyStats(Request $request)
    {
        $date = $request->date ?? now()->toDateString();

        $stats = Attendance::whereDate('date', $date)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $totalStudents = Student::where('status', 'active')->count();
        $markedCount   = Attendance::whereDate('date', $date)->count();

        return response()->json([
            'date'          => $date,
            'total_students' => $totalStudents,
            'marked'        => $markedCount,
            'not_marked'    => max(0, $totalStudents - $markedCount),
            'present'       => $stats['Present'] ?? 0,
            'absent'        => $stats['Absent'] ?? 0,
            'late'          => $stats['Late'] ?? 0,
            'half_day'      => $stats['Half Day'] ?? 0,
        ]);
    }

    /**
     * Generate an attendance report (e.g. monthly for a class).
     * GET /attendance/report?month=9&year=2026&class_id=8
     */
    public function report(Request $request)
    {
        $request->validate([
            'class_id' => 'required',
            'month'    => 'required|integer',
            'year'     => 'required|integer',
        ]);

        $students = Student::where('class_id', $request->class_id)
            ->when($request->section_id, fn($q) => $q->where('section_id', $request->section_id))
            ->get();

        $attendances = Attendance::where('class_id', $request->class_id)
            ->whereMonth('date', $request->month)
            ->whereYear('date', $request->year)
            ->get()
            ->groupBy('student_id');

        $report = [];
        foreach ($students as $student) {
            $studentAtt = $attendances->get($student->id, collect());
            $present = $studentAtt->where('status', 'Present')->count();
            $absent  = $studentAtt->where('status', 'Absent')->count();
            $total   = $studentAtt->count();

            $report[] = [
                'student_id'   => $student->id,
                'name'         => $student->name,
                'admission_no' => $student->admission_no,
                'present'      => $present,
                'absent'       => $absent,
                'total_marked' => $total,
                'percentage'   => $total > 0 ? round(($present / $total) * 100, 2) : 0,
                'daily_records'=> $studentAtt->keyBy('date')->map(fn($a) => $a->status),
            ];
        }

        return response()->json([
            'class_id' => $request->class_id,
            'month'    => $request->month,
            'year'     => $request->year,
            'report'   => collect($report)->sortByDesc('percentage')->values()->all(),
        ]);
    }
}

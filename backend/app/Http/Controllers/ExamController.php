<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\ExamSchedule;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    // ── Exams CRUD ────────────────────────────────────────────────────

    public function index()
    {
        return response()->json(Exam::with('schedules')->orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'       => 'required|string',
            'term'       => 'required|string',
            'type'       => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
        ]);
        return response()->json(Exam::create($request->all()), 201);
    }

    public function show(Exam $exam)
    {
        return response()->json($exam->load('schedules.subject', 'schedules.schoolClass'));
    }

    public function update(Request $request, Exam $exam)
    {
        $exam->update($request->all());
        return response()->json($exam);
    }

    public function destroy(Exam $exam)
    {
        $exam->delete();
        return response()->json(null, 204);
    }

    // ── Exam Schedules ─────────────────────────────────────────────────

    public function schedules(Exam $exam)
    {
        return response()->json($exam->schedules()->with('subject', 'schoolClass')->get());
    }

    public function addSchedule(Request $request, Exam $exam)
    {
        $request->validate([
            'class_id'    => 'required',
            'subject_id'  => 'required|exists:subjects,id',
            'exam_date'   => 'required|date',
            'total_marks' => 'nullable|integer',
            'pass_marks'  => 'nullable|integer',
        ]);

        $schedule = $exam->schedules()->create($request->all());
        return response()->json($schedule->load('subject', 'schoolClass'), 201);
    }

    public function updateSchedule(Request $request, Exam $exam, $scheduleId)
    {
        $schedule = $exam->schedules()->findOrFail($scheduleId);
        $schedule->update($request->all());
        return response()->json($schedule->load('subject', 'schoolClass'));
    }

    public function destroySchedule(Exam $exam, $scheduleId)
    {
        $schedule = $exam->schedules()->findOrFail($scheduleId);
        $schedule->delete();
        return response()->json(null, 204);
    }

    // ── Marks Entry ────────────────────────────────────────────────────

    /**
     * Get marks for an exam/class combination.
     * GET /exams/{exam}/marks?class_id=8&subject_id=1
     */
    public function marks(Exam $exam, Request $request)
    {
        $query = ExamResult::where('exam', $exam->name)
            ->with('student');

        if ($request->filled('subject')) {
            $query->where('subject', $request->subject);
        }

        return response()->json($query->get());
    }

    /**
     * Bulk marks entry.
     * POST /exams/{exam}/marks/bulk
     */
    public function bulkMarksEntry(Request $request, Exam $exam)
    {
        $request->validate([
            'records'           => 'required|array',
            'records.*.student_id' => 'required|exists:students,id',
            'records.*.subject'    => 'required|string',
            'records.*.marks'      => 'required|integer|min:0',
            'records.*.total'      => 'required|integer|min:1',
        ]);

        $saved = 0;
        foreach ($request->records as $rec) {
            $pass     = $rec['marks'] >= (($rec['pass_marks'] ?? 35) / 100 * $rec['total']);
            $percent  = ($rec['marks'] / $rec['total']) * 100;
            $grade    = $this->calculateGrade($percent);
            $status   = $pass ? 'Pass' : 'Fail';

            ExamResult::updateOrCreate(
                [
                    'student_id' => $rec['student_id'],
                    'exam'       => $exam->name,
                    'subject'    => $rec['subject'],
                ],
                [
                    'marks'   => $rec['marks'],
                    'total'   => $rec['total'],
                    'grade'   => $grade,
                    'status'  => $status,
                    'remarks' => $rec['remarks'] ?? null,
                ]
            );
            $saved++;
        }

        return response()->json(['message' => "Marks saved for $saved records."]);
    }

    /**
     * Get student report card for an exam.
     * GET /exams/{exam}/report-card/{student}
     */
    public function reportCard(Exam $exam, Student $student)
    {
        $results = ExamResult::where('student_id', $student->id)
            ->where('exam', $exam->name)
            ->get();

        $totalMarks    = $results->sum('total');
        $obtainedMarks = $results->sum('marks');
        $percentage    = $totalMarks > 0 ? round(($obtainedMarks / $totalMarks) * 100, 2) : 0;
        $overallGrade  = $this->calculateGrade($percentage);

        return response()->json([
            'student'       => $student,
            'exam'          => $exam->name,
            'results'       => $results,
            'total_marks'   => $totalMarks,
            'obtained_marks' => $obtainedMarks,
            'percentage'    => $percentage,
            'overall_grade' => $overallGrade,
        ]);
    }

    private function calculateGrade(float $percentage): string
    {
        if ($percentage >= 90) return 'A+';
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B+';
        if ($percentage >= 60) return 'B';
        if ($percentage >= 50) return 'C';
        if ($percentage >= 35) return 'D';
        return 'F';
    }
}

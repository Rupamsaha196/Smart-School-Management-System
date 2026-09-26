<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\ClassSubject;
use App\Models\StudentPromotion;
use App\Models\Student;
use Illuminate\Http\Request;

class AcademicsController extends Controller
{
    // ── Classes ────────────────────────────────────────────────────────

    public function classes()
    {
        return response()->json(SchoolClass::orderBy('name')->get());
    }

    public function storeClass(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:school_classes,name']);
        return response()->json(SchoolClass::create($request->all()), 201);
    }

    public function updateClass(Request $request, SchoolClass $class)
    {
        $class->update($request->all());
        return response()->json($class->fresh());
    }

    public function destroyClass(SchoolClass $class)
    {
        $class->delete();
        return response()->json(null, 204);
    }

    // ── Subjects ───────────────────────────────────────────────────────

    public function subjects()
    {
        return response()->json(Subject::orderBy('name')->get());
    }

    public function storeSubject(Request $request)
    {
        $request->validate(['name' => 'required|string', 'code' => 'nullable|string|unique:subjects,code']);
        return response()->json(Subject::create($request->all()), 201);
    }

    public function updateSubject(Request $request, Subject $subject)
    {
        $subject->update($request->all());
        return response()->json($subject->fresh());
    }

    public function destroySubject(Subject $subject)
    {
        $subject->delete();
        return response()->json(null, 204);
    }

    // ── Class-Subject Assignment ────────────────────────────────────────

    public function classSubjects(SchoolClass $class)
    {
        return response()->json($class->subjects()->with('subject')->get());
    }

    public function assignSubject(Request $request, SchoolClass $class)
    {
        $request->validate([
            'subject_id'   => 'required|exists:subjects,id',
            'teacher_name' => 'nullable|string',
        ]);

        $cs = ClassSubject::firstOrCreate(
            ['class_id' => $class->id, 'subject_id' => $request->subject_id],
            ['teacher_name' => $request->teacher_name]
        );

        return response()->json($cs->load('subject'), 201);
    }

    public function removeSubject(SchoolClass $class, Subject $subject)
    {
        ClassSubject::where('class_id', $class->id)->where('subject_id', $subject->id)->delete();
        return response()->json(null, 204);
    }

    // ── Student Promotion ───────────────────────────────────────────────

    /**
     * Bulk promote students from one class to another.
     * POST /academics/promote
     */
    public function promoteStudents(Request $request)
    {
        $request->validate([
            'student_ids'   => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'to_class'      => 'required|string',
            'to_section'    => 'required|string',
            'academic_year' => 'required|integer',
            'result'        => 'nullable|in:Promoted,Failed,Detained',
        ]);

        $promotedBy = $request->user()->id;
        $count = 0;

        foreach ($request->student_ids as $studentId) {
            $student = Student::find($studentId);
            if (!$student) continue;

            // Record promotion history
            StudentPromotion::create([
                'student_id'    => $student->id,
                'from_class'    => $student->class_id,
                'from_section'  => $student->section_id,
                'to_class'      => $request->to_class,
                'to_section'    => $request->to_section,
                'academic_year' => $request->academic_year,
                'result'        => $request->result ?? 'Promoted',
                'promoted_by'   => $promotedBy,
            ]);

            // Update student's class/section
            if (($request->result ?? 'Promoted') === 'Promoted') {
                $student->update([
                    'class_id'   => $request->to_class,
                    'section_id' => $request->to_section,
                ]);
            }

            $count++;
        }

        return response()->json(['message' => "$count students processed for promotion."]);
    }

    /**
     * Bulk allocate students to a class and section.
     * POST /academics/allocate
     */
    public function allocateStudents(Request $request)
    {
        $request->validate([
            'student_ids'   => 'required|array',
            'student_ids.*' => 'exists:students,id',
            'class_id'      => 'required|string',
            'section_id'    => 'nullable|string',
        ]);

        $count = Student::whereIn('id', $request->student_ids)->update([
            'class_id'   => $request->class_id,
            'section_id' => $request->section_id,
        ]);

        return response()->json(['message' => "$count students allocated successfully."]);
    }
}

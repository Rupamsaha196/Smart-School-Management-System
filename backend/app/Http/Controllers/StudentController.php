<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query();

        // Filters
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%$s%")
                  ->orWhere('last_name', 'like', "%$s%")
                  ->orWhere('admission_no', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('phone', 'like', "%$s%");
            });
        }
        if ($request->filled('class_id'))   $query->where('class_id', $request->class_id);
        if ($request->filled('section_id')) $query->where('section_id', $request->section_id);
        if ($request->filled('status'))     $query->where('status', $request->status);
        if ($request->filled('gender'))     $query->where('gender', $request->gender);

        return response()->json($query->orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'dob'            => 'nullable|date',
            'gender'         => 'nullable|string',
            'admission_date' => 'nullable|date',
            'class_id'       => 'nullable|string',
            'email'          => 'nullable|email',
        ]);

        $data = $request->except(['documents']);

        // Generate admission number if not provided
        if (empty($data['admission_no'])) {
            $maxId = (Student::max('id') ?? 0) + 1;
            $data['admission_no'] = 'SS' . date('Y') . str_pad($maxId, 4, '0', STR_PAD_LEFT);
        }

        $data['status'] = $data['status'] ?? 'active';

        $student = Student::create($data);

        // Log timeline event
        $student->timelines()->create([
            'event'      => 'Admission',
            'description' => 'Student admitted to ' . ($student->class_name ?? 'school'),
            'event_date' => $student->admission_date ?? now(),
        ]);

        return response()->json($student, 201);
    }

    /**
     * 360° Student Profile — loads all relations.
     */
    public function show(Student $student)
    {
        $student->load([
            'fees',
            'examResults',
            'attendances',
            'documents',
            'notes.addedBy',
            'timelines',
            'promotions',
            'customFieldValues.customField',
            'siblings',
        ]);
        return response()->json($student);
    }

    public function update(Request $request, Student $student)
    {
        $student->update($request->except(['documents']));
        return response()->json($student);
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(null, 204);
    }

    /**
     * Upload documents for a student.
     */
    public function uploadDocument(Request $request, Student $student)
    {
        $request->validate([
            'document'      => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'document_type' => 'required|string',
        ]);

        $file = $request->file('document');
        $path = $file->store("student_documents/{$student->id}", 'public');

        $doc = $student->documents()->create([
            'document_type' => $request->document_type,
            'file_path'     => $path,
            'original_name' => $file->getClientOriginalName(),
        ]);

        return response()->json($doc, 201);
    }

    /**
     * Add a note to a student profile.
     */
    public function addNote(Request $request, Student $student)
    {
        $request->validate(['note' => 'required|string', 'type' => 'nullable|string']);

        $note = $student->notes()->create([
            'note'     => $request->note,
            'type'     => $request->type ?? 'General',
            'added_by' => $request->user()->id,
        ]);

        return response()->json($note->load('addedBy'), 201);
    }

    /**
     * Add a sibling relationship.
     */
    public function addSibling(Request $request, Student $student)
    {
        $request->validate(['sibling_id' => 'required|exists:students,id']);

        $siblingId = $request->sibling_id;

        // Avoid self-referencing
        if ($siblingId == $student->id) {
            return response()->json(['message' => 'A student cannot be their own sibling.'], 422);
        }

        // Sync both directions
        $student->siblings()->syncWithoutDetaching([$siblingId]);
        Student::find($siblingId)->siblings()->syncWithoutDetaching([$student->id]);

        return response()->json(['message' => 'Sibling added successfully.']);
    }
}

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
            'event'       => 'Admission',
            'description' => 'Student admitted to ' . ($student->class_name ?? 'school'),
            'event_date'  => $student->admission_date ?? now(),
        ]);

        // Process uploaded documents during admission if any
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $key => $file) {
                // If the frontend sends an array of files, we upload them
                $path = $file->store("student_documents/{$student->id}", 'public');
                $student->documents()->create([
                    // Just use the key or a default type if it's an array
                    'document_type' => is_string($key) ? $key : 'General',
                    'file_path'     => $path,
                    'original_name' => $file->getClientOriginalName(),
                ]);
            }
        }

        return response()->json($student->load('documents'), 201);
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
     * Get a specific note.
     */
    public function getNote(Student $student, $noteId)
    {
        $note = $student->notes()->with('addedBy')->findOrFail($noteId);
        return response()->json($note);
    }

    /**
     * Update a specific note.
     */
    public function updateNote(Request $request, Student $student, $noteId)
    {
        $request->validate(['note' => 'required|string', 'type' => 'nullable|string']);
        $note = $student->notes()->findOrFail($noteId);
        $note->update($request->only('note', 'type'));
        return response()->json($note->load('addedBy'));
    }

    /**
     * Delete a specific note.
     */
    public function deleteNote(Student $student, $noteId)
    {
        $note = $student->notes()->findOrFail($noteId);
        $note->delete();
        return response()->json(null, 204);
    }

    /**
     * Generate Transfer Certificate (TC) details.
     */
    public function downloadTc(Student $student)
    {
        $student->load(['fees', 'examResults', 'attendances']);
        
        $dobStr = null;
        if ($student->dob) {
            $dobStr = is_object($student->dob) ? $student->dob->format('Y-m-d') : date('Y-m-d', strtotime($student->dob));
        }

        $tcNumber = 'TC-' . date('Y') . '-' . str_pad($student->id, 4, '0', STR_PAD_LEFT);

        $tcData = [
            'school_name' => config('app.name', 'Smart School'),
            'tc_number' => $tcNumber,
            'student_name' => $student->name,
            'admission_no' => $student->admission_no,
            'dob' => $dobStr,
            'father_name' => $student->father_name,
            'mother_name' => $student->mother_name,
            'leaving_date' => now()->format('Y-m-d'),
            'reason_for_leaving' => 'Parents request',
            'conduct' => 'Good',
            'class_left' => $student->class_id,
            'attendance_summary' => $student->attendances->count() > 0 ? 'Regular' : 'N/A',
            'fees_paid' => $student->fees->where('status', 'Pending')->count() == 0 ? 'Yes' : 'No (Pending Dues)',
        ];

        return response()->json([
            'message' => 'TC Generated',
            'tc_number' => $tcNumber,
            'student_name' => $student->name,
            'admission_no' => $student->admission_no,
            'tc_data' => $tcData
        ]);
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

<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    public function index()
    {
        return response()->json(Student::orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'dob'        => 'nullable|date',
            'gender'     => 'nullable|string',
            'admission_date' => 'nullable|date',
            'class_id'   => 'nullable|string',
        ]);
        
        $data = $request->except(['documents']);
        
        // Generate admission number if not provided
        if (empty($data['admission_no'])) {
            $maxId = (Student::max('id') ?? 0) + 1;
            $data['admission_no'] = 'SS' . date('Y') . str_pad($maxId, 4, '0', STR_PAD_LEFT);
        }

        $data['status'] = $data['status'] ?? 'active';

        $student = Student::create($data);
        return response()->json($student, 201);
    }
    
    public function show(Student $student)
    {
        // Load relations for 360 profile
        $student->load(['fees', 'examResults']);
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
}

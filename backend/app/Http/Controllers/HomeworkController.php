<?php

namespace App\Http\Controllers;

use App\Models\Homework;
use Illuminate\Http\Request;

class HomeworkController extends Controller
{
    public function index(Request $request)
    {
        $query = Homework::with('subject', 'schoolClass', 'assignedBy')
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->subject_id, fn($q) => $q->where('subject_id', $request->subject_id))
            ->when($request->section, fn($q) => $q->where('section', $request->section));

        return response()->json($query->orderBy('due_date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id'      => 'required|exists:school_classes,id',
            'subject_id'    => 'required|exists:subjects,id',
            'description'   => 'required|string',
            'assigned_date' => 'required|date',
            'due_date'      => 'required|date|after_or_equal:assigned_date',
        ]);

        $data = $request->all();
        $data['assigned_by'] = $request->user()->id;

        return response()->json(Homework::create($data)->load('subject', 'schoolClass'), 201);
    }

    public function show(Homework $homework)
    {
        return response()->json($homework->load('subject', 'schoolClass', 'assignedBy'));
    }

    public function update(Request $request, Homework $homework)
    {
        $homework->update($request->all());
        return response()->json($homework->fresh()->load('subject', 'schoolClass'));
    }

    public function destroy(Homework $homework)
    {
        $homework->delete();
        return response()->json(null, 204);
    }
}

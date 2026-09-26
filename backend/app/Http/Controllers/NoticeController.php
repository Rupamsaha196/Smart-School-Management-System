<?php

namespace App\Http\Controllers;

use App\Models\Notice;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    public function index(Request $request)
    {
        $query = Notice::with('createdBy')
            ->when($request->audience, fn($q) => $q->where('audience', $request->audience))
            ->when($request->filled('published'), fn($q) => $q->where('is_published', (bool)$request->published));

        return response()->json($query->orderBy('date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'    => 'required|string|max:255',
            'content'  => 'required|string',
            'date'     => 'required|date',
            'audience' => 'nullable|string',
        ]);

        $data = $request->all();
        $data['created_by']   = $request->user()->id;
        $data['is_published'] = $data['is_published'] ?? true;

        return response()->json(Notice::create($data)->load('createdBy'), 201);
    }

    public function show(Notice $notice)
    {
        return response()->json($notice->load('createdBy'));
    }

    public function update(Request $request, Notice $notice)
    {
        $notice->update($request->all());
        return response()->json($notice->fresh()->load('createdBy'));
    }

    public function destroy(Notice $notice)
    {
        $notice->delete();
        return response()->json(null, 204);
    }
}

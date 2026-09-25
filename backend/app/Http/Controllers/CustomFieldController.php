<?php

namespace App\Http\Controllers;

use App\Models\CustomField;
use Illuminate\Http\Request;

class CustomFieldController extends Controller
{
    /**
     * List all custom fields, optionally filtered by form.
     */
    public function index(Request $request)
    {
        $query = CustomField::query();

        if ($request->has('form')) {
            $query->where('form', $request->form);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a new custom field.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'form'     => 'required|string|max:255',
            'label'    => 'required|string|max:255',
            'type'     => 'required|in:Text,Number,Date,Dropdown',
            'required' => 'boolean',
            'options'  => 'nullable|array',
        ]);

        $field = CustomField::create($validated);

        return response()->json($field, 201);
    }

    /**
     * Show a single custom field.
     */
    public function show(CustomField $customField)
    {
        return response()->json($customField);
    }

    /**
     * Update a custom field.
     */
    public function update(Request $request, CustomField $customField)
    {
        $validated = $request->validate([
            'form'     => 'sometimes|required|string|max:255',
            'label'    => 'sometimes|required|string|max:255',
            'type'     => 'sometimes|required|in:Text,Number,Date,Dropdown',
            'required' => 'boolean',
            'options'  => 'nullable|array',
        ]);

        $customField->update($validated);

        return response()->json($customField);
    }

    /**
     * Delete a custom field.
     */
    public function destroy(CustomField $customField)
    {
        $customField->delete();

        return response()->json(null, 204);
    }
}

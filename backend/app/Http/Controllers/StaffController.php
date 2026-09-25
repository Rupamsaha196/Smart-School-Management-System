<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index()
    {
        return response()->json(Staff::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'emp_id' => 'required|string|unique:staff',
            'name' => 'required|string',
            'role' => 'required|string',
            'department' => 'required|string',
            'status' => 'string',
        ]);

        $staff = Staff::create($validated);
        return response()->json($staff, 201);
    }
}

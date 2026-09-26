<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HostelController extends Controller
{
    public function index()
    {
        return response()->json(DB::table('hostels')->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string', 'type' => 'required|string']);
        $data = $request->all();
        $data['created_at'] = $data['updated_at'] = now();
        $id = DB::table('hostels')->insertGetId($data);
        return response()->json(DB::table('hostels')->find($id), 201);
    }

    public function show(int $id)
    {
        return response()->json(DB::table('hostels')->find($id));
    }

    public function update(Request $request, int $id)
    {
        $data = $request->all();
        $data['updated_at'] = now();
        DB::table('hostels')->where('id', $id)->update($data);
        return response()->json(DB::table('hostels')->find($id));
    }

    public function destroy(int $id)
    {
        DB::table('hostels')->where('id', $id)->delete();
        return response()->json(null, 204);
    }

    // Allocate student
    public function allocateStudent(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'hostel_id'  => 'required|exists:hostels,id',
            'join_date'  => 'required|date',
        ]);

        DB::table('student_hostels')->updateOrInsert(
            ['student_id' => $request->student_id],
            [
                'hostel_id'  => $request->hostel_id,
                'room_id'    => $request->room_id,
                'join_date'  => $request->join_date,
                'leave_date' => $request->leave_date,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        return response()->json(['message' => 'Student allocated to hostel successfully.']);
    }

    // Get students in a hostel
    public function hostelStudents(int $hostelId)
    {
        return response()->json(
            DB::table('student_hostels')
                ->join('students', 'students.id', '=', 'student_hostels.student_id')
                ->where('student_hostels.hostel_id', $hostelId)
                ->select('students.id', 'students.first_name', 'students.last_name', 'students.class_id', 'student_hostels.room_id')
                ->get()
        );
    }
}

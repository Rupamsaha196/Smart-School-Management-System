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

    // Rooms list with occupancy calculation
    public function rooms()
    {
        $rooms = DB::table('hostel_rooms')
            ->leftJoin('hostels', 'hostels.id', '=', 'hostel_rooms.hostel_id')
            ->select(
                'hostel_rooms.*',
                'hostels.name as hostel_name',
                'hostels.type as hostel_type'
            )
            ->get();

        $occupancies = DB::table('student_hostels')
            ->whereNull('leave_date')
            ->select('room_id', DB::raw('count(*) as count'))
            ->groupBy('room_id')
            ->pluck('count', 'room_id');

        $result = $rooms->map(function ($r) use ($occupancies) {
            $occupied = $occupancies[$r->id] ?? 0;
            return [
                'id'         => $r->id,
                'hostel_id'  => $r->hostel_id,
                'hostel'     => $r->hostel_name ?? 'Main Hostel',
                'room'       => $r->room_no,
                'type'       => $r->type,
                'cost'       => (float)$r->fee,
                'capacity'   => (int)$r->capacity,
                'occupied'   => (int)$occupied,
                'available'  => max(0, (int)$r->capacity - (int)$occupied),
            ];
        });

        return response()->json($result);
    }

    public function storeRoom(Request $request)
    {
        $request->validate([
            'room_no'   => 'required|string',
            'hostel_id' => 'nullable|integer',
            'type'      => 'nullable|string',
            'capacity'  => 'nullable|integer',
            'fee'       => 'nullable|numeric',
        ]);

        $hostelId = $request->hostel_id;
        if (!$hostelId) {
            // Find or create default hostel
            $hostel = DB::table('hostels')->first();
            if (!$hostel) {
                $hostelId = DB::table('hostels')->insertGetId([
                    'name'       => $request->hostel ?? 'Boys Hostel A',
                    'type'       => 'Boys',
                    'intake'     => 100,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $hostelId = $hostel->id;
            }
        }

        $id = DB::table('hostel_rooms')->insertGetId([
            'hostel_id'  => $hostelId,
            'room_no'    => $request->room_no,
            'type'       => $request->type ?? '2 Bed',
            'capacity'   => $request->capacity ?? 2,
            'fee'        => $request->fee ?? $request->cost ?? 3000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(DB::table('hostel_rooms')->find($id), 201);
    }

    // Allocate student
    public function allocateStudent(Request $request)
    {
        $studentId = $request->student_id;
        if (!$studentId && $request->filled('admission_no')) {
            $adm = trim($request->admission_no);
            $student = \App\Models\Student::where('admission_no', $adm)
                ->orWhere('admission_no', 'like', "%$adm%")
                ->first();
            if ($student) {
                $studentId = $student->id;
            }
        }

        if (!$studentId) {
            return response()->json(['message' => 'Valid student ID or Admission Number is required.'], 422);
        }

        $hostelId = $request->hostel_id;
        if (!$hostelId && $request->filled('room_id')) {
            $room = DB::table('hostel_rooms')->find($request->room_id);
            if ($room) {
                $hostelId = $room->hostel_id;
            }
        }

        if (!$hostelId) {
            $hostel = DB::table('hostels')->first();
            $hostelId = $hostel ? $hostel->id : 1;
        }

        DB::table('student_hostels')->updateOrInsert(
            ['student_id' => $studentId],
            [
                'hostel_id'  => $hostelId,
                'room_id'    => $request->room_id,
                'join_date'  => $request->join_date ?? now()->toDateString(),
                'leave_date' => $request->leave_date,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $student = \App\Models\Student::find($studentId);

        return response()->json([
            'message'    => "Student {$student?->first_name} allocated to hostel successfully.",
            'student_id' => $studentId,
            'hostel_id'  => $hostelId,
            'room_id'    => $request->room_id,
        ]);
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

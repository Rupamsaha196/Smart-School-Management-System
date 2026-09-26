<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransportController extends Controller
{
    // ── Routes ─────────────────────────────────────────────────────────

    public function routes()
    {
        return response()->json(DB::table('transport_routes')->orderBy('route_name')->get());
    }

    public function storeRoute(Request $request)
    {
        $request->validate([
            'route_name'  => 'required|string',
            'vehicle_no'  => 'required|string',
            'driver_name' => 'required|string',
            'fare'        => 'required|numeric',
        ]);
        $data = $request->all();
        $data['created_at'] = $data['updated_at'] = now();
        $id = DB::table('transport_routes')->insertGetId($data);
        return response()->json(DB::table('transport_routes')->find($id), 201);
    }

    public function updateRoute(Request $request, int $id)
    {
        $data = $request->all();
        $data['updated_at'] = now();
        DB::table('transport_routes')->where('id', $id)->update($data);
        return response()->json(DB::table('transport_routes')->find($id));
    }

    public function destroyRoute(int $id)
    {
        DB::table('transport_routes')->where('id', $id)->delete();
        return response()->json(null, 204);
    }

    // ── Stops ──────────────────────────────────────────────────────────

    public function stops(int $routeId)
    {
        return response()->json(DB::table('transport_stops')->where('route_id', $routeId)->orderBy('order')->get());
    }

    public function storeStop(Request $request, int $routeId)
    {
        $request->validate(['stop_name' => 'required|string']);
        $data = $request->all();
        $data['route_id']   = $routeId;
        $data['created_at'] = $data['updated_at'] = now();
        $id = DB::table('transport_stops')->insertGetId($data);
        return response()->json(DB::table('transport_stops')->find($id), 201);
    }

    // ── Student Transport Assignment ────────────────────────────────────

    public function assignStudent(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'route_id'   => 'required|exists:transport_routes,id',
        ]);

        DB::table('student_transports')->updateOrInsert(
            ['student_id' => $request->student_id],
            [
                'route_id'      => $request->route_id,
                'stop_id'       => $request->stop_id,
                'academic_year' => $request->academic_year ?? date('Y'),
                'created_at'    => now(),
                'updated_at'    => now(),
            ]
        );

        return response()->json(['message' => 'Student assigned to transport route.']);
    }

    public function routeStudents(int $routeId)
    {
        return response()->json(
            DB::table('student_transports')
                ->join('students', 'students.id', '=', 'student_transports.student_id')
                ->where('student_transports.route_id', $routeId)
                ->select('students.id', 'students.first_name', 'students.last_name', 'students.class_id', 'student_transports.stop_id')
                ->get()
        );
    }
}

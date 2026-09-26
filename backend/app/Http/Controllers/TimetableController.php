<?php

namespace App\Http\Controllers;

use App\Models\Timetable;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    /**
     * GET /timetable?class_id=1&day=Monday
     */
    public function index(Request $request)
    {
        $query = Timetable::with('subject', 'class_')
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->section, fn($q) => $q->where('section', $request->section))
            ->when($request->day, fn($q) => $q->where('day', $request->day));

        return response()->json($query->orderByRaw("FIELD(day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')")->orderBy('start_time')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id'   => 'required',
            'day'        => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
            'start_time' => 'required',
            'end_time'   => 'required',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        return response()->json(Timetable::create($request->all())->load('subject'), 201);
    }

    public function update(Request $request, Timetable $timetable)
    {
        $timetable->update($request->all());
        return response()->json($timetable->fresh()->load('subject'));
    }

    public function destroy(Timetable $timetable)
    {
        $timetable->delete();
        return response()->json(null, 204);
    }

    /**
     * Get full weekly timetable for a class.
     * GET /timetable/weekly?class_id=1
     */
    public function weekly(Request $request)
    {
        $request->validate(['class_id' => 'required']);

        $slots = Timetable::with('subject')
            ->where('class_id', $request->class_id)
            ->when($request->section, fn($q) => $q->where('section', $request->section))
            ->orderBy('start_time')
            ->get()
            ->groupBy('day');

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $weekly = [];
        foreach ($days as $day) {
            $weekly[$day] = $slots[$day] ?? [];
        }

        return response()->json($weekly);
    }
}

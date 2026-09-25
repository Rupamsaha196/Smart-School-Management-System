<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;

class CalendarEventController extends Controller
{
    /**
     * List all calendar events, sorted by date.
     */
    public function index()
    {
        $events = CalendarEvent::orderBy('date')->get();

        return response()->json($events);
    }

    /**
     * Store a new calendar event.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'date'  => 'required|date',
            'type'  => 'required|in:Academic,Event,Holiday',
            'description' => 'nullable|string',
        ]);

        $event = CalendarEvent::create($validated);

        return response()->json($event, 201);
    }

    /**
     * Show a single calendar event.
     */
    public function show(CalendarEvent $calendarEvent)
    {
        return response()->json($calendarEvent);
    }

    /**
     * Update a calendar event.
     */
    public function update(Request $request, CalendarEvent $calendarEvent)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'date'  => 'sometimes|required|date',
            'type'  => 'sometimes|required|in:Academic,Event,Holiday',
            'description' => 'nullable|string',
        ]);

        $calendarEvent->update($validated);

        return response()->json($calendarEvent);
    }

    /**
     * Delete a calendar event.
     */
    public function destroy(CalendarEvent $calendarEvent)
    {
        $calendarEvent->delete();

        return response()->json(null, 204);
    }
}

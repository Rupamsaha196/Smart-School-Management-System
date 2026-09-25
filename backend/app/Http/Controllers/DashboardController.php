<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Staff;
use App\Models\StudentFee;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Simple mock of some stats, combined with real data
        $totalStudents = Student::count();
        $totalStaff = Staff::count();
        $feesCollected = StudentFee::where('status', 'Paid')->sum('amount');
        
        return response()->json([
            'totalStudents' => $totalStudents,
            'totalStaff' => $totalStaff,
            'feesCollected' => '₹' . number_format($feesCollected),
            'attendance' => '91.2%', // Mocked for now
        ]);
    }
}

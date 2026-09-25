<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarEventController;
use App\Http\Controllers\CustomFieldController;
use App\Http\Controllers\QrAttendanceController;
use App\Http\Controllers\TwoFactorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// ── Public (unauthenticated) ─────────────────────────────────
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/two-factor/verify', [AuthController::class, 'verifyTwoFactor']);

// Temporary Seed Route (Run once to populate database)
Route::get('/seed', function () {
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
    return 'Database seeded successfully! You can now log in.';
});

// ── Protected (Sanctum token required) ───────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Annual Calendar
    Route::apiResource('calendar-events', CalendarEventController::class);

    // Custom Fields
    Route::apiResource('custom-fields', CustomFieldController::class);

    // QR / Barcode Attendance
    Route::get('/qr-attendance', [QrAttendanceController::class, 'index']);
    Route::post('/qr-attendance/scan', [QrAttendanceController::class, 'scan']);
    Route::get('/qr-attendance/today-stats', [QrAttendanceController::class, 'todayStats']);

    // Two-Factor Authentication
    Route::get('/two-factor/status', [TwoFactorController::class, 'status']);
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index']);

    Route::post('/two-factor/setup', [TwoFactorController::class, 'setup']);
    Route::post('/two-factor/enable', [TwoFactorController::class, 'enable']);
    Route::post('/two-factor/disable', [TwoFactorController::class, 'disable']);
    
    // Students
    Route::apiResource('students', App\Http\Controllers\StudentController::class);

    // Staff
    Route::apiResource('staff', App\Http\Controllers\StaffController::class);

    // Generic Resources for Academics, Fees, Operations
    $genericResources = [
        'classes', 'subjects', 'exams', 
        'fee-types', 'transactions', 
        'library-books', 'transport-routes', 'hostels'
    ];
    foreach ($genericResources as $res) {
        Route::get("/$res", [\App\Http\Controllers\GenericResourceController::class, 'index']);
        Route::post("/$res", [\App\Http\Controllers\GenericResourceController::class, 'store']);
        Route::get("/$res/{id}", [\App\Http\Controllers\GenericResourceController::class, 'show']);
        Route::put("/$res/{id}", [\App\Http\Controllers\GenericResourceController::class, 'update']);
        Route::delete("/$res/{id}", [\App\Http\Controllers\GenericResourceController::class, 'destroy']);
    }
});

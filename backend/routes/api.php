<?php

use App\Http\Controllers\AcademicsController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarEventController;
use App\Http\Controllers\CustomFieldController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\FeeController;
use App\Http\Controllers\HomeworkController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\QrAttendanceController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\TransportController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Smart School – API Routes
| Infosof Technologies 2026
|--------------------------------------------------------------------------
*/

// ── Public (unauthenticated) ──────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/two-factor/verify', [AuthController::class, 'verifyTwoFactor']);

// ── Health Check (Render.com pings this) ─────────────────────────────
Route::get('/health', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $dbOk = true;
    } catch (\Exception $e) {
        $dbOk = false;
    }
    return response()->json([
        'status'  => 'ok',
        'service' => 'Smart School API',
        'version' => '2.0.0',
        'db'      => $dbOk ? 'connected' : 'error',
        'time'    => now()->toIso8601String(),
    ]);
});

// Seed Route — run once on first deploy to populate DB
Route::get('/seed', function () {
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
    return response()->json(['message' => 'Database migrated and seeded successfully!']);
});

Route::get('/check-users', fn() => \App\Models\User::all(['id', 'name', 'email', 'role']));

// ── Protected (Sanctum token required) ───────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ─────────────────────────────────────────────────────────
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ── Two-Factor Auth ───────────────────────────────────────────────
    Route::prefix('two-factor')->group(function () {
        Route::get('/status', [TwoFactorController::class, 'status']);
        Route::post('/setup', [TwoFactorController::class, 'setup']);
        Route::post('/enable', [TwoFactorController::class, 'enable']);
        Route::post('/disable', [TwoFactorController::class, 'disable']);
    });

    // ── Dashboard ─────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── User & Role Management ────────────────────────────────────────
    Route::prefix('users')->group(function () {
        Route::get('/', [UserManagementController::class, 'users']);
        Route::post('/', [UserManagementController::class, 'createUser']);
        Route::put('/{user}', [UserManagementController::class, 'updateUser']);
        Route::delete('/{user}', [UserManagementController::class, 'deleteUser']);
    });
    Route::get('/roles', [UserManagementController::class, 'roles']);
    Route::get('/permissions', [UserManagementController::class, 'permissions']);
    Route::get('/roles/{role}/permissions', [UserManagementController::class, 'rolePermissions']);
    Route::put('/roles/{role}/permissions', [UserManagementController::class, 'syncRolePermissions']);

    // ── Students ─────────────────────────────────────────────────────
    Route::prefix('students')->group(function () {
        Route::get('/', [StudentController::class, 'index']);
        Route::post('/', [StudentController::class, 'store']);
        Route::get('/{student}', [StudentController::class, 'show']);
        Route::put('/{student}', [StudentController::class, 'update']);
        Route::delete('/{student}', [StudentController::class, 'destroy']);

        // Documents
        Route::post('/{student}/documents', [StudentController::class, 'uploadDocument']);

        // Notes
        Route::get('/{student}/notes/{noteId}', [StudentController::class, 'getNote']);
        Route::post('/{student}/notes', [StudentController::class, 'addNote']);
        Route::put('/{student}/notes/{noteId}', [StudentController::class, 'updateNote']);
        Route::delete('/{student}/notes/{noteId}', [StudentController::class, 'deleteNote']);

        // TC Download
        Route::get('/{student}/tc', [StudentController::class, 'downloadTc']);

        // Siblings
        Route::post('/{student}/siblings', [StudentController::class, 'addSibling']);
    });

    // ── Staff ─────────────────────────────────────────────────────────
    Route::prefix('staff')->group(function () {
        Route::get('/', [StaffController::class, 'index']);
        Route::post('/', [StaffController::class, 'store']);
        Route::get('/{staff}', [StaffController::class, 'show']);
        Route::put('/{staff}', [StaffController::class, 'update']);
        Route::delete('/{staff}', [StaffController::class, 'destroy']);

        // Salary / Payroll
        Route::get('/{staff}/salary', [StaffController::class, 'salaryRecords']);
        Route::post('/{staff}/payslip', [StaffController::class, 'generatePayslip']);
    });

    // Payslip payment (needs its own route outside staff prefix for model binding)
    Route::post('/payslips/{record}/pay', [StaffController::class, 'payPayslip']);

    // ── Attendance ────────────────────────────────────────────────────
    Route::prefix('attendance')->group(function () {
        // Student Attendance
        Route::get('/', [AttendanceController::class, 'index']);
        Route::post('/bulk', [AttendanceController::class, 'bulkMark']);
        Route::get('/daily-stats', [AttendanceController::class, 'dailyStats']);
        Route::get('/student/{student}', [AttendanceController::class, 'studentSummary']);

        // Staff Attendance
        Route::get('/staff', [StaffController::class, 'attendance']);
        Route::post('/staff', [StaffController::class, 'markAttendance']);
    });

    // ── QR / Biometric Attendance ─────────────────────────────────────
    Route::prefix('qr-attendance')->group(function () {
        Route::get('/', [QrAttendanceController::class, 'index']);
        Route::post('/scan', [QrAttendanceController::class, 'scan']);
        Route::get('/today-stats', [QrAttendanceController::class, 'todayStats']);
    });

    // ── Leave Management ──────────────────────────────────────────────
    Route::prefix('leaves')->group(function () {
        Route::get('/', [LeaveController::class, 'index']);
        Route::post('/', [LeaveController::class, 'store']);
        Route::get('/{leave}', [LeaveController::class, 'show']);
        Route::post('/{leave}/action', [LeaveController::class, 'action']);
        Route::delete('/{leave}', [LeaveController::class, 'destroy']);
    });

    // ── Academics ─────────────────────────────────────────────────────
    Route::prefix('academics')->group(function () {
        // Classes
        Route::get('/classes', [AcademicsController::class, 'classes']);
        Route::post('/classes', [AcademicsController::class, 'storeClass']);
        Route::put('/classes/{class}', [AcademicsController::class, 'updateClass']);
        Route::delete('/classes/{class}', [AcademicsController::class, 'destroyClass']);
        Route::get('/classes/{class}/subjects', [AcademicsController::class, 'classSubjects']);
        Route::post('/classes/{class}/subjects', [AcademicsController::class, 'assignSubject']);
        Route::delete('/classes/{class}/subjects/{subject}', [AcademicsController::class, 'removeSubject']);

        // Subjects
        Route::get('/subjects', [AcademicsController::class, 'subjects']);
        Route::post('/subjects', [AcademicsController::class, 'storeSubject']);
        Route::put('/subjects/{subject}', [AcademicsController::class, 'updateSubject']);
        Route::delete('/subjects/{subject}', [AcademicsController::class, 'destroySubject']);

        // Student Promotion & Allocation
        Route::post('/promote', [AcademicsController::class, 'promoteStudents']);
        Route::post('/allocate', [AcademicsController::class, 'allocateStudents']);
    });

    // ── Timetable ─────────────────────────────────────────────────────
    Route::prefix('timetable')->group(function () {
        Route::get('/', [TimetableController::class, 'index']);
        Route::post('/', [TimetableController::class, 'store']);
        Route::put('/{timetable}', [TimetableController::class, 'update']);
        Route::delete('/{timetable}', [TimetableController::class, 'destroy']);
        Route::get('/weekly', [TimetableController::class, 'weekly']);
    });

    // ── Exams & Marks ─────────────────────────────────────────────────
    Route::prefix('exams')->group(function () {
        Route::get('/', [ExamController::class, 'index']);
        Route::post('/', [ExamController::class, 'store']);
        Route::get('/{exam}', [ExamController::class, 'show']);
        Route::put('/{exam}', [ExamController::class, 'update']);
        Route::delete('/{exam}', [ExamController::class, 'destroy']);

        // Schedules
        Route::get('/{exam}/schedules', [ExamController::class, 'schedules']);
        Route::post('/{exam}/schedules', [ExamController::class, 'addSchedule']);
        Route::put('/{exam}/schedules/{schedule}', [ExamController::class, 'updateSchedule']);
        Route::delete('/{exam}/schedules/{schedule}', [ExamController::class, 'destroySchedule']);

        // Marks
        Route::get('/{exam}/marks', [ExamController::class, 'marks']);
        Route::post('/{exam}/marks/bulk', [ExamController::class, 'bulkMarksEntry']);
        Route::get('/{exam}/report-card/{student}', [ExamController::class, 'reportCard']);
    });

    // ── Fees & Finance ────────────────────────────────────────────────
    Route::prefix('fees')->group(function () {
        Route::get('/', [FeeController::class, 'index']);
        Route::post('/', [FeeController::class, 'store']);
        Route::get('/summary', [FeeController::class, 'summary']);
        Route::get('/defaulters', [FeeController::class, 'defaulters']);
        Route::get('/{fee}', [FeeController::class, 'show']);
        Route::put('/{fee}', [FeeController::class, 'update']);
        Route::delete('/{fee}', [FeeController::class, 'destroy']);
        Route::post('/{fee}/pay', [FeeController::class, 'pay']);
    });

    // ── Income/Expense (Transactions) ─────────────────────────────────
    Route::apiResource('transactions', \App\Http\Controllers\GenericResourceController::class);
    Route::get('/fee-types', [\App\Http\Controllers\GenericResourceController::class, 'index']);
    Route::post('/fee-types', [\App\Http\Controllers\GenericResourceController::class, 'store']);
    Route::get('/fee-types/{id}', [\App\Http\Controllers\GenericResourceController::class, 'show']);
    Route::put('/fee-types/{id}', [\App\Http\Controllers\GenericResourceController::class, 'update']);
    Route::delete('/fee-types/{id}', [\App\Http\Controllers\GenericResourceController::class, 'destroy']);

    // ── Library ───────────────────────────────────────────────────────
    Route::prefix('library')->group(function () {
        Route::get('/books', [LibraryController::class, 'books']);
        Route::post('/books', [LibraryController::class, 'storeBook']);
        Route::put('/books/{id}', [LibraryController::class, 'updateBook']);
        Route::delete('/books/{id}', [LibraryController::class, 'destroyBook']);
        Route::get('/stats', [LibraryController::class, 'stats']);

        // Issues
        Route::get('/issues', [LibraryController::class, 'issues']);
        Route::post('/issues', [LibraryController::class, 'issueBook']);
        Route::post('/issues/{issueId}/return', [LibraryController::class, 'returnBook']);
    });

    // ── Transport ─────────────────────────────────────────────────────
    Route::prefix('transport')->group(function () {
        Route::get('/routes', [TransportController::class, 'routes']);
        Route::post('/routes', [TransportController::class, 'storeRoute']);
        Route::put('/routes/{id}', [TransportController::class, 'updateRoute']);
        Route::delete('/routes/{id}', [TransportController::class, 'destroyRoute']);

        Route::get('/routes/{routeId}/stops', [TransportController::class, 'stops']);
        Route::post('/routes/{routeId}/stops', [TransportController::class, 'storeStop']);
        Route::put('/routes/{routeId}/stops/{stopId}', [TransportController::class, 'updateStop']);
        Route::delete('/routes/{routeId}/stops/{stopId}', [TransportController::class, 'destroyStop']);
        Route::get('/routes/{routeId}/students', [TransportController::class, 'routeStudents']);

        Route::post('/assign', [TransportController::class, 'assignStudent']);
    });

    // ── Hostel ───────────────────────────────────────────────────────
    Route::get('/hostels', [\App\Http\Controllers\GenericResourceController::class, 'index']);
    Route::post('/hostels', [\App\Http\Controllers\GenericResourceController::class, 'store']);
    Route::get('/hostels/{id}', [\App\Http\Controllers\GenericResourceController::class, 'show']);
    Route::put('/hostels/{id}', [\App\Http\Controllers\GenericResourceController::class, 'update']);
    Route::delete('/hostels/{id}', [\App\Http\Controllers\GenericResourceController::class, 'destroy']);

    // ── Homework ──────────────────────────────────────────────────────
    Route::apiResource('homework', HomeworkController::class);

    // ── Notices / Communication ───────────────────────────────────────
    Route::apiResource('notices', NoticeController::class);

    // ── Annual Calendar ───────────────────────────────────────────────
    Route::apiResource('calendar-events', CalendarEventController::class);

    // ── Custom Fields ─────────────────────────────────────────────────
    Route::apiResource('custom-fields', CustomFieldController::class);
});

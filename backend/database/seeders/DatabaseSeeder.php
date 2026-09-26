<?php

namespace Database\Seeders;

use App\Models\CalendarEvent;
use App\Models\CustomField;
use App\Models\QrAttendanceLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Demo Users ───────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'superadmin@smartschool.com'],
            ['name' => 'Super Admin', 'password' => Hash::make('password'), 'role' => 'super_admin', 'is_active' => true]
        );

        User::updateOrCreate(
            ['email' => 'admin@smartschool.com'],
            ['name' => 'Admin User', 'password' => Hash::make('password'), 'role' => 'admin', 'is_active' => true]
        );

        User::updateOrCreate(
            ['email' => 'teacher@smartschool.com'],
            ['name' => 'Rajesh Sharma', 'password' => Hash::make('password'), 'role' => 'teacher', 'is_active' => true, 'phone' => '9876540001']
        );

        User::updateOrCreate(
            ['email' => 'accountant@smartschool.com'],
            ['name' => 'Sunita Verma', 'password' => Hash::make('password'), 'role' => 'accountant', 'is_active' => true]
        );

        User::updateOrCreate(
            ['email' => 'receptionist@smartschool.com'],
            ['name' => 'Meena Patel', 'password' => Hash::make('password'), 'role' => 'receptionist', 'is_active' => true]
        );

        User::updateOrCreate(
            ['email' => 'librarian@smartschool.com'],
            ['name' => 'Amit Kumar', 'password' => Hash::make('password'), 'role' => 'librarian', 'is_active' => true]
        );

        User::updateOrCreate(
            ['email' => 'parent@smartschool.com'],
            ['name' => 'Rajesh Sharma (Parent)', 'password' => Hash::make('password'), 'role' => 'parent', 'is_active' => true]
        );

        User::updateOrCreate(
            ['email' => 'student@smartschool.com'],
            ['name' => 'Aarav Sharma', 'password' => Hash::make('password'), 'role' => 'student', 'is_active' => true]
        );

        // ── Permissions (RBAC) ────────────────────────────────────────
        $modules = [
            'Students'   => ['view', 'create', 'edit', 'delete'],
            'Staff'      => ['view', 'create', 'edit', 'delete'],
            'Attendance' => ['view', 'mark', 'report'],
            'Fees'       => ['view', 'create', 'collect', 'report'],
            'Exams'      => ['view', 'create', 'marks_entry', 'report'],
            'Academics'  => ['view', 'create', 'edit', 'delete'],
            'Library'    => ['view', 'issue', 'return', 'manage'],
            'Transport'  => ['view', 'manage'],
            'Hostel'     => ['view', 'manage'],
            'Notices'    => ['view', 'create', 'edit', 'delete'],
            'Timetable'  => ['view', 'manage'],
            'Payroll'    => ['view', 'generate', 'pay'],
            'Reports'    => ['view', 'export'],
            'Settings'   => ['view', 'manage'],
        ];

        foreach ($modules as $module => $actions) {
            foreach ($actions as $action) {
                \App\Models\Permission::firstOrCreate(
                    ['name' => strtolower($module) . '.' . $action],
                    ['module' => $module, 'action' => $action]
                );
            }
        }

        // Grant all permissions to super_admin and admin
        $allPermissions = \App\Models\Permission::pluck('id')->toArray();
        $adminRoles = ['super_admin', 'admin'];
        foreach ($adminRoles as $role) {
            foreach ($allPermissions as $pid) {
                \Illuminate\Support\Facades\DB::table('role_permissions')->updateOrInsert(
                    ['role' => $role, 'permission_id' => $pid],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }

        // Teacher permissions
        $teacherPermissions = \App\Models\Permission::whereIn('name', [
            'students.view', 'attendance.view', 'attendance.mark',
            'exams.view', 'exams.marks_entry', 'academics.view',
            'timetable.view', 'notices.view', 'library.view',
        ])->pluck('id');
        foreach ($teacherPermissions as $pid) {
            \Illuminate\Support\Facades\DB::table('role_permissions')->updateOrInsert(
                ['role' => 'teacher', 'permission_id' => $pid],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        // Accountant permissions
        $accountantPermissions = \App\Models\Permission::whereIn('name', [
            'fees.view', 'fees.create', 'fees.collect', 'fees.report',
            'payroll.view', 'payroll.generate', 'payroll.pay',
            'reports.view', 'reports.export', 'students.view',
        ])->pluck('id');
        foreach ($accountantPermissions as $pid) {
            \Illuminate\Support\Facades\DB::table('role_permissions')->updateOrInsert(
                ['role' => 'accountant', 'permission_id' => $pid],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        // Librarian permissions
        $librarianPermissions = \App\Models\Permission::whereIn('name', [
            'library.view', 'library.issue', 'library.return', 'library.manage',
            'students.view',
        ])->pluck('id');
        foreach ($librarianPermissions as $pid) {
            \Illuminate\Support\Facades\DB::table('role_permissions')->updateOrInsert(
                ['role' => 'librarian', 'permission_id' => $pid],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        // ── Calendar Events ──────────────────────────────────────
        CalendarEvent::insert([
            [
                'title' => 'Summer Vacation Begins',
                'date'  => '2026-05-15',
                'type'  => 'Holiday',
                'description' => 'Summer break starts for all students.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Annual Sports Meet',
                'date'  => '2026-11-20',
                'type'  => 'Event',
                'description' => 'Inter-house sports competition.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'First Term Exams',
                'date'  => '2026-09-10',
                'type'  => 'Academic',
                'description' => 'First term final examinations for all classes.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Independence Day Celebration',
                'date'  => '2026-08-15',
                'type'  => 'Event',
                'description' => 'Flag hoisting and cultural programs.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Diwali Holiday',
                'date'  => '2026-10-20',
                'type'  => 'Holiday',
                'description' => 'School closed for Diwali festival.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Parent-Teacher Meeting',
                'date'  => '2026-12-05',
                'type'  => 'Academic',
                'description' => 'PTM for all classes.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // ── Custom Fields ────────────────────────────────────────
        CustomField::insert([
            [
                'form'     => 'Student Admission',
                'label'    => 'Blood Group',
                'type'     => 'Dropdown',
                'required' => true,
                'options'  => json_encode(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'form'     => 'Staff Record',
                'label'    => 'Previous School Name',
                'type'     => 'Text',
                'required' => false,
                'options'  => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'form'     => 'Student Admission',
                'label'    => 'Allergies',
                'type'     => 'Text',
                'required' => false,
                'options'  => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // ── QR Attendance Logs (sample entries) ──────────────────
        QrAttendanceLog::insert([
            [
                'name'        => 'Suresh Kumar',
                'identifier'  => 'T1001',
                'person_type' => 'Staff',
                'status'      => 'Present',
                'scanned_at'  => now()->setTime(8, 15),
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'Amit Singh',
                'identifier'  => 'S2045',
                'person_type' => 'Student',
                'status'      => 'Present',
                'scanned_at'  => now()->setTime(8, 22),
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => 'Priya Sharma',
                'identifier'  => 'S2046',
                'person_type' => 'Student',
                'status'      => 'Present',
                'scanned_at'  => now()->setTime(8, 30),
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
        // ── Students ───────────────────────────────────────────────
        $student1 = \App\Models\Student::updateOrCreate(
            ['admission_no' => 'SS2025001'],
            ['first_name' => 'Aarav', 'last_name' => 'Sharma', 'class_id' => '8', 'section_id' => '1', 'gender' => 'Male', 'phone' => '9876543210', 'status' => 'active', 'dob' => '2012-05-15', 'blood_group' => 'B+', 'religion' => 'Hindu', 'category' => 'General', 'roll_no' => '12', 'admission_date' => '2023-04-01', 'email' => 'aarav.parent@email.com', 'address' => '123 MG Road, Sector 15', 'city' => 'Noida', 'state' => 'Uttar Pradesh', 'pincode' => '201301', 'father_name' => 'Rajesh Sharma', 'father_phone' => '9876543200', 'father_occupation' => 'Engineer', 'mother_name' => 'Sunita Sharma', 'mother_phone' => '9876543201', 'mother_occupation' => 'Teacher']
        );
        \App\Models\Student::updateOrCreate(['admission_no' => 'SS2025002'], ['first_name' => 'Priya', 'last_name' => 'Singh', 'class_id' => '11', 'section_id' => '2', 'gender' => 'Female', 'phone' => '9876543211', 'status' => 'active']);
        \App\Models\Student::updateOrCreate(['admission_no' => 'SS2025003'], ['first_name' => 'Rohan', 'last_name' => 'Patel', 'class_id' => '13', 'section_id' => '1', 'gender' => 'Male', 'phone' => '9876543212', 'status' => 'active']);
        
        // Add 360 profile relations to Aarav (only if not already seeded)
        if (\App\Models\StudentFee::where('student_id', $student1->id)->doesntExist()) {
            \App\Models\StudentFee::insert([
                ['student_id' => $student1->id, 'type' => 'Tuition Fee', 'amount' => 12500, 'paid' => 12500, 'status' => 'Paid', 'date' => '2025-04-10', 'month' => 'April', 'created_at' => now(), 'updated_at' => now()],
                ['student_id' => $student1->id, 'type' => 'Tuition Fee', 'amount' => 12500, 'paid' => 12500, 'status' => 'Paid', 'date' => '2025-05-08', 'month' => 'May', 'created_at' => now(), 'updated_at' => now()],
                ['student_id' => $student1->id, 'type' => 'Tuition Fee', 'amount' => 12500, 'paid' => 12500, 'status' => 'Paid', 'date' => '2025-06-12', 'month' => 'June', 'created_at' => now(), 'updated_at' => now()],
                ['student_id' => $student1->id, 'type' => 'Transport Fee', 'amount' => 3000, 'paid' => 3000, 'status' => 'Paid', 'date' => '2025-04-10', 'month' => 'Q1', 'created_at' => now(), 'updated_at' => now()],
                ['student_id' => $student1->id, 'type' => 'Tuition Fee', 'amount' => 12500, 'paid' => 0, 'status' => 'Pending', 'date' => null, 'month' => 'September', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
        
        if (\App\Models\ExamResult::where('student_id', $student1->id)->doesntExist()) {
            \App\Models\ExamResult::insert([
                ['student_id' => $student1->id, 'exam' => 'Unit Test 1', 'subject' => 'Mathematics', 'marks' => 42, 'total' => 50, 'grade' => 'A+', 'created_at' => now(), 'updated_at' => now()],
                ['student_id' => $student1->id, 'exam' => 'Unit Test 1', 'subject' => 'Science', 'marks' => 38, 'total' => 50, 'grade' => 'A', 'created_at' => now(), 'updated_at' => now()],
                ['student_id' => $student1->id, 'exam' => 'Unit Test 1', 'subject' => 'English', 'marks' => 44, 'total' => 50, 'grade' => 'A+', 'created_at' => now(), 'updated_at' => now()],
                ['student_id' => $student1->id, 'exam' => 'Unit Test 1', 'subject' => 'Hindi', 'marks' => 36, 'total' => 50, 'grade' => 'A', 'created_at' => now(), 'updated_at' => now()],
                ['student_id' => $student1->id, 'exam' => 'Unit Test 1', 'subject' => 'Social Studies', 'marks' => 40, 'total' => 50, 'grade' => 'A+', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // ── Staff ──────────────────────────────────────────────────
        \App\Models\Staff::updateOrCreate(['emp_id' => 'EMP001'], ['name' => 'Rajesh Sharma', 'role' => 'Teacher', 'department' => 'Science', 'designation' => 'Senior Teacher', 'email' => 'rajesh@smartschool.com', 'phone' => '9876540001', 'joining_date' => '2020-06-01', 'basic_salary' => 45000, 'status' => 'Active']);
        \App\Models\Staff::updateOrCreate(['emp_id' => 'EMP002'], ['name' => 'Sunita Verma', 'role' => 'Accountant', 'department' => 'Finance', 'designation' => 'Senior Accountant', 'email' => 'sunita@smartschool.com', 'phone' => '9876540002', 'joining_date' => '2019-04-01', 'basic_salary' => 38000, 'status' => 'Active']);
        \App\Models\Staff::updateOrCreate(['emp_id' => 'EMP003'], ['name' => 'Amit Kumar', 'role' => 'Librarian', 'department' => 'Library', 'designation' => 'Chief Librarian', 'email' => 'amit@smartschool.com', 'phone' => '9876540003', 'joining_date' => '2021-07-15', 'basic_salary' => 32000, 'status' => 'Active']);
        \App\Models\Staff::updateOrCreate(['emp_id' => 'EMP004'], ['name' => 'Meena Patel', 'role' => 'Receptionist', 'department' => 'Admin', 'designation' => 'Front Desk Officer', 'email' => 'meena@smartschool.com', 'phone' => '9876540004', 'joining_date' => '2022-01-10', 'basic_salary' => 28000, 'status' => 'Active']);
        
        // ── Academics, Fees, Operations ────────────────────────────
        if (\Illuminate\Support\Facades\DB::table('school_classes')->count() === 0) {
            \Illuminate\Support\Facades\DB::table('school_classes')->insert([
                ['name' => 'Nursery', 'sections' => 'A', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'LKG', 'sections' => 'A, B', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'UKG', 'sections' => 'A, B', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Class 1', 'sections' => 'A, B', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Class 5', 'sections' => 'A, B', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Class 8', 'sections' => 'A, B', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Class 10', 'sections' => 'A, B', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Class 11', 'sections' => 'Science, Arts', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Class 12', 'sections' => 'Science, Arts, Commerce', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (\Illuminate\Support\Facades\DB::table('subjects')->count() === 0) {
            \Illuminate\Support\Facades\DB::table('subjects')->insert([
                ['name' => 'Mathematics', 'code' => 'MATH101', 'type' => 'Theory', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Science', 'code' => 'SCI101', 'type' => 'Theory', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Physics', 'code' => 'PHY101', 'type' => 'Practical', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Chemistry', 'code' => 'CHEM101', 'type' => 'Practical', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'English', 'code' => 'ENG101', 'type' => 'Theory', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Hindi', 'code' => 'HIN101', 'type' => 'Theory', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Social Studies', 'code' => 'SS101', 'type' => 'Theory', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Computer Science', 'code' => 'CS101', 'type' => 'Practical', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (\Illuminate\Support\Facades\DB::table('exams')->count() === 0) {
            \Illuminate\Support\Facades\DB::table('exams')->insert([
                ['name' => 'Unit Test 1', 'term' => 'Term 1', 'type' => 'Written', 'status' => 'Completed', 'start_date' => '2026-07-10', 'end_date' => '2026-07-15', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Mid Term 2026', 'term' => 'Term 1', 'type' => 'Written', 'status' => 'Scheduled', 'start_date' => '2026-10-01', 'end_date' => '2026-10-10', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Annual Exam 2026', 'term' => 'Term 2', 'type' => 'Written', 'status' => 'Scheduled', 'start_date' => '2027-02-15', 'end_date' => '2027-03-05', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (\Illuminate\Support\Facades\DB::table('fee_types')->count() === 0) {
            \Illuminate\Support\Facades\DB::table('fee_types')->insert([
                ['name' => 'Tuition Fee', 'amount' => 12500, 'frequency' => 'Monthly', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Transport Fee', 'amount' => 3000, 'frequency' => 'Monthly', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Hostel Fee', 'amount' => 8000, 'frequency' => 'Monthly', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Library Fee', 'amount' => 500, 'frequency' => 'Annual', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Examination Fee', 'amount' => 1000, 'frequency' => 'Annual', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Sports Fee', 'amount' => 750, 'frequency' => 'Annual', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (\Illuminate\Support\Facades\DB::table('transactions')->count() === 0) {
            \Illuminate\Support\Facades\DB::table('transactions')->insert([
                ['type' => 'Income', 'head' => 'Tuition Fee', 'amount' => 125000, 'date' => '2026-09-01', 'description' => 'September fee collection', 'created_at' => now(), 'updated_at' => now()],
                ['type' => 'Income', 'head' => 'Transport Fee', 'amount' => 30000, 'date' => '2026-09-01', 'description' => 'September transport fees', 'created_at' => now(), 'updated_at' => now()],
                ['type' => 'Expense', 'head' => 'Electricity', 'amount' => 15000, 'date' => '2026-09-05', 'description' => 'August electricity bill', 'created_at' => now(), 'updated_at' => now()],
                ['type' => 'Expense', 'head' => 'Staff Salary', 'amount' => 450000, 'date' => '2026-09-01', 'description' => 'September payroll', 'created_at' => now(), 'updated_at' => now()],
                ['type' => 'Expense', 'head' => 'Maintenance', 'amount' => 25000, 'date' => '2026-09-10', 'description' => 'Lab equipment maintenance', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (\Illuminate\Support\Facades\DB::table('library_books')->count() === 0) {
            \Illuminate\Support\Facades\DB::table('library_books')->insert([
                ['title' => 'Advanced Physics', 'author' => 'H.C. Verma', 'isbn' => '978-1234567890', 'qty' => 10, 'available_qty' => 8, 'status' => 'Available', 'created_at' => now(), 'updated_at' => now()],
                ['title' => 'Mathematics for Class 10', 'author' => 'R.D. Sharma', 'isbn' => '978-0987654321', 'qty' => 15, 'available_qty' => 15, 'status' => 'Available', 'created_at' => now(), 'updated_at' => now()],
                ['title' => 'Wings of Fire', 'author' => 'A.P.J. Abdul Kalam', 'isbn' => '978-8173711466', 'qty' => 5, 'available_qty' => 3, 'status' => 'Available', 'created_at' => now(), 'updated_at' => now()],
                ['title' => 'NCERT Chemistry Part 1', 'author' => 'NCERT', 'isbn' => '978-8174507327', 'qty' => 20, 'available_qty' => 20, 'status' => 'Available', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (\Illuminate\Support\Facades\DB::table('transport_routes')->count() === 0) {
            \Illuminate\Support\Facades\DB::table('transport_routes')->insert([
                ['route_name' => 'Route 1 - Downtown', 'vehicle_no' => 'UP16 AB 1234', 'driver_name' => 'Ramesh', 'driver_phone' => '9876543220', 'fare' => 1500, 'created_at' => now(), 'updated_at' => now()],
                ['route_name' => 'Route 2 - North Campus', 'vehicle_no' => 'UP16 CD 5678', 'driver_name' => 'Suresh', 'driver_phone' => '9876543221', 'fare' => 1800, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (\Illuminate\Support\Facades\DB::table('hostels')->count() === 0) {
            \Illuminate\Support\Facades\DB::table('hostels')->insert([
                ['name' => 'Boys Hostel A', 'type' => 'Boys', 'address' => 'Campus North Wing', 'intake' => 100, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Girls Hostel B', 'type' => 'Girls', 'address' => 'Campus South Wing', 'intake' => 80, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // ── Notices ────────────────────────────────────────────────
        if (\App\Models\Notice::count() === 0) {
            $adminUser = \App\Models\User::where('role', 'admin')->first();
            if ($adminUser) {
                \App\Models\Notice::insert([
                    ['title' => 'Annual Sports Day 2026', 'content' => 'Annual Sports Day will be held on October 15, 2026. All students are requested to participate.', 'date' => '2026-10-15', 'audience' => 'All', 'is_published' => true, 'created_by' => $adminUser->id, 'created_at' => now(), 'updated_at' => now()],
                    ['title' => 'Fee Payment Reminder', 'content' => 'Last date for September fee payment is 10th October 2026. Please pay on time to avoid fine.', 'date' => '2026-10-01', 'audience' => 'Parents', 'is_published' => true, 'created_by' => $adminUser->id, 'created_at' => now(), 'updated_at' => now()],
                    ['title' => 'Parent Teacher Meeting', 'content' => 'PTM scheduled for 5th December 2026. All parents are required to attend.', 'date' => '2026-12-05', 'audience' => 'Parents', 'is_published' => true, 'created_by' => $adminUser->id, 'created_at' => now(), 'updated_at' => now()],
                ]);
            }
        }
    }
}

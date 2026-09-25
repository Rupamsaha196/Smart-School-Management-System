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
            ['email' => 'admin@smartschool.com'],
            ['name' => 'Admin User', 'password' => Hash::make('password'), 'role' => 'admin']
        );

        User::updateOrCreate(
            ['email' => 'teacher@smartschool.com'],
            ['name' => 'Teacher User', 'password' => Hash::make('password'), 'role' => 'teacher']
        );

        User::updateOrCreate(
            ['email' => 'accountant@smartschool.com'],
            ['name' => 'Accountant User', 'password' => Hash::make('password'), 'role' => 'accountant']
        );

        User::updateOrCreate(
            ['email' => 'parent@smartschool.com'],
            ['name' => 'Parent User', 'password' => Hash::make('password'), 'role' => 'parent']
        );

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
        $student1 = \App\Models\Student::create(['admission_no' => 'SS2025001', 'first_name' => 'Aarav', 'last_name' => 'Sharma', 'class_id' => '8', 'section_id' => '1', 'gender' => 'Male', 'phone' => '9876543210', 'status' => 'active', 'dob' => '2012-05-15', 'blood_group' => 'B+', 'religion' => 'Hindu', 'category' => 'General', 'roll_no' => '12', 'admission_date' => '2023-04-01', 'email' => 'aarav.parent@email.com', 'address' => '123 MG Road, Sector 15', 'city' => 'Noida', 'state' => 'Uttar Pradesh', 'pincode' => '201301', 'father_name' => 'Rajesh Sharma', 'father_phone' => '9876543200', 'father_occupation' => 'Engineer', 'mother_name' => 'Sunita Sharma', 'mother_phone' => '9876543201', 'mother_occupation' => 'Teacher']);
        \App\Models\Student::create(['admission_no' => 'SS2025002', 'first_name' => 'Priya', 'last_name' => 'Singh', 'class_id' => '11', 'section_id' => '2', 'gender' => 'Female', 'phone' => '9876543211', 'status' => 'active']);
        \App\Models\Student::create(['admission_no' => 'SS2025003', 'first_name' => 'Rohan', 'last_name' => 'Patel', 'class_id' => '13', 'section_id' => '1', 'gender' => 'Male', 'phone' => '9876543212', 'status' => 'active']);
        
        // Add 360 profile relations to Aarav
        \App\Models\StudentFee::insert([
            ['student_id' => $student1->id, 'type' => 'Tuition Fee', 'amount' => 12500, 'paid' => 12500, 'status' => 'Paid', 'date' => '2025-04-10', 'month' => 'April', 'created_at' => now(), 'updated_at' => now()],
            ['student_id' => $student1->id, 'type' => 'Tuition Fee', 'amount' => 12500, 'paid' => 12500, 'status' => 'Paid', 'date' => '2025-05-08', 'month' => 'May', 'created_at' => now(), 'updated_at' => now()],
            ['student_id' => $student1->id, 'type' => 'Tuition Fee', 'amount' => 12500, 'paid' => 12500, 'status' => 'Paid', 'date' => '2025-06-12', 'month' => 'June', 'created_at' => now(), 'updated_at' => now()],
            ['student_id' => $student1->id, 'type' => 'Transport Fee', 'amount' => 3000, 'paid' => 3000, 'status' => 'Paid', 'date' => '2025-04-10', 'month' => 'Q1', 'created_at' => now(), 'updated_at' => now()],
            ['student_id' => $student1->id, 'type' => 'Tuition Fee', 'amount' => 12500, 'paid' => 0, 'status' => 'Pending', 'date' => null, 'month' => 'September', 'created_at' => now(), 'updated_at' => now()],
        ]);
        
        \App\Models\ExamResult::insert([
            ['student_id' => $student1->id, 'exam' => 'Unit Test 1', 'subject' => 'Mathematics', 'marks' => 42, 'total' => 50, 'grade' => 'A+', 'created_at' => now(), 'updated_at' => now()],
            ['student_id' => $student1->id, 'exam' => 'Unit Test 1', 'subject' => 'Science', 'marks' => 38, 'total' => 50, 'grade' => 'A', 'created_at' => now(), 'updated_at' => now()],
            ['student_id' => $student1->id, 'exam' => 'Unit Test 1', 'subject' => 'English', 'marks' => 44, 'total' => 50, 'grade' => 'A+', 'created_at' => now(), 'updated_at' => now()],
            ['student_id' => $student1->id, 'exam' => 'Unit Test 1', 'subject' => 'Hindi', 'marks' => 36, 'total' => 50, 'grade' => 'A', 'created_at' => now(), 'updated_at' => now()],
            ['student_id' => $student1->id, 'exam' => 'Unit Test 1', 'subject' => 'Social Studies', 'marks' => 40, 'total' => 50, 'grade' => 'A+', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── Staff ──────────────────────────────────────────────────
        \App\Models\Staff::insert([
            ['emp_id' => 'EMP001', 'name' => 'Rajesh Sharma', 'role' => 'Teacher', 'department' => 'Science', 'status' => 'Active', 'created_at' => now(), 'updated_at' => now()],
            ['emp_id' => 'EMP002', 'name' => 'Sunita Verma', 'role' => 'Accountant', 'department' => 'Finance', 'status' => 'Active', 'created_at' => now(), 'updated_at' => now()],
            ['emp_id' => 'EMP003', 'name' => 'Amit Kumar', 'role' => 'Librarian', 'department' => 'Library', 'status' => 'Active', 'created_at' => now(), 'updated_at' => now()],
        ]);
        
        // ── Academics, Fees, Operations ────────────────────────────
        \Illuminate\Support\Facades\DB::table('school_classes')->insert([
            ['name' => 'Class 10', 'sections' => 'A, B', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Class 11', 'sections' => 'Science, Arts', 'created_at' => now(), 'updated_at' => now()],
        ]);
        \Illuminate\Support\Facades\DB::table('subjects')->insert([
            ['name' => 'Mathematics', 'code' => 'MATH101', 'type' => 'Theory', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Physics', 'code' => 'PHY101', 'type' => 'Practical', 'created_at' => now(), 'updated_at' => now()],
        ]);
        \Illuminate\Support\Facades\DB::table('exams')->insert([
            ['name' => 'Mid Term 2025', 'term' => 'Term 1', 'start_date' => '2025-10-01', 'end_date' => '2025-10-15', 'created_at' => now(), 'updated_at' => now()],
        ]);
        \Illuminate\Support\Facades\DB::table('fee_types')->insert([
            ['name' => 'Tuition Fee', 'amount' => 12500, 'frequency' => 'Monthly', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Transport Fee', 'amount' => 3000, 'frequency' => 'Monthly', 'created_at' => now(), 'updated_at' => now()],
        ]);
        \Illuminate\Support\Facades\DB::table('transactions')->insert([
            ['type' => 'Income', 'head' => 'Tuition Fee', 'amount' => 12500, 'date' => '2025-09-01', 'description' => 'Aarav fee', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'Expense', 'head' => 'Electricity', 'amount' => 4500, 'date' => '2025-09-05', 'description' => 'August bill', 'created_at' => now(), 'updated_at' => now()],
        ]);
        \Illuminate\Support\Facades\DB::table('library_books')->insert([
            ['title' => 'Advanced Physics', 'author' => 'H.C. Verma', 'isbn' => '978-1234567890', 'qty' => 10, 'available_qty' => 8, 'status' => 'Available', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Mathematics for Class 10', 'author' => 'R.D. Sharma', 'isbn' => '978-0987654321', 'qty' => 15, 'available_qty' => 15, 'status' => 'Available', 'created_at' => now(), 'updated_at' => now()],
        ]);
        \Illuminate\Support\Facades\DB::table('transport_routes')->insert([
            ['route_name' => 'Route 1 - Downtown', 'vehicle_no' => 'UP16 AB 1234', 'driver_name' => 'Ramesh', 'driver_phone' => '9876543220', 'fare' => 1500, 'created_at' => now(), 'updated_at' => now()],
        ]);
        \Illuminate\Support\Facades\DB::table('hostels')->insert([
            ['name' => 'Boys Hostel A', 'type' => 'Boys', 'address' => 'Campus North', 'intake' => 100, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    protected $fillable = [
        'emp_id', 'name', 'role', 'designation', 'department',
        'email', 'phone', 'dob', 'gender', 'blood_group',
        'religion', 'category', 'joining_date', 'address',
        'city', 'state', 'pincode', 'qualification',
        'basic_salary', 'account_no', 'bank_name', 'ifsc_code',
        'profile_photo', 'status',
    ];

    protected $casts = [
        'dob'          => 'date',
        'joining_date' => 'date',
        'basic_salary' => 'decimal:2',
    ];

    public function salaryRecords()
    {
        return $this->hasMany(SalaryRecord::class);
    }

    public function attendances()
    {
        return $this->hasMany(StaffAttendance::class);
    }

    public function leaveApplications()
    {
        return $this->morphMany(LeaveApplication::class, 'leaveable');
    }
}

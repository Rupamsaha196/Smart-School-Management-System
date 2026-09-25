<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'admission_no', 'first_name', 'last_name', 'dob', 'gender', 'blood_group', 
        'religion', 'category', 'caste', 'admission_date', 'class_id', 'section_id', 
        'roll_no', 'rte', 'previous_school', 'previous_class',
        'email', 'phone', 'address', 'city', 'state', 'pincode', 'country',
        'father_name', 'father_phone', 'father_occupation',
        'mother_name', 'mother_phone', 'mother_occupation',
        'guardian_name', 'guardian_relation', 'guardian_phone', 'guardian_email',
        'status',
    ];
    
    // Helper to get full name
    public function getNameAttribute()
    {
        $fullName = trim(($this->first_name ?? '') . ' ' . ($this->last_name ?? ''));
        return $fullName !== '' ? $fullName : ($this->admission_no ?? 'Student #' . $this->id);
    }
    
    // Map class_id and section_id to names for the list view
    public function getClassNameAttribute()
    {
        $classes = [
            '1' => 'Nursery', '2' => 'LKG', '3' => 'UKG',
            '4' => 'Class 1', '5' => 'Class 2', '6' => 'Class 3',
            '7' => 'Class 4', '8' => 'Class 5', '9' => 'Class 6',
            '10' => 'Class 7', '11' => 'Class 8', '12' => 'Class 9',
            '13' => 'Class 10', '14' => 'Class 11', '15' => 'Class 12'
        ];
        return $classes[$this->class_id] ?? ($this->class_id ?: 'Class 1');
    }
    
    public function getSectionAttribute()
    {
        $sections = ['1' => 'A', '2' => 'B', '3' => 'C', '4' => 'D'];
        return $sections[$this->section_id] ?? ($this->section_id ?: 'A');
    }
    
    protected $appends = ['name', 'class_name', 'section'];
    
    public function fees()
    {
        return $this->hasMany(StudentFee::class);
    }
    
    public function examResults()
    {
        return $this->hasMany(ExamResult::class);
    }
}

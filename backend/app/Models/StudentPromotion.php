<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentPromotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'from_class', 'from_section', 'to_class',
        'to_section', 'academic_year', 'result', 'promoted_by',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentNote extends Model
{
    use HasFactory;

    protected $fillable = ['student_id', 'added_by', 'note', 'type'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}

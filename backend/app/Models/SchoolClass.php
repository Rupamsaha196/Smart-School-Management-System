<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'school_classes';

    protected $fillable = ['name', 'sections', 'class_teacher', 'room_no'];

    public function subjects()
    {
        return $this->hasMany(ClassSubject::class, 'class_id');
    }

    public function timetables()
    {
        return $this->hasMany(Timetable::class, 'class_id');
    }
}

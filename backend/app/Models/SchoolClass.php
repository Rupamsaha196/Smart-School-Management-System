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

    public function getSectionsArrayAttribute()
    {
        if (empty($this->sections)) return [];
        // If it's stored as JSON, json_decode it.
        $decoded = json_decode($this->sections, true);
        if (is_array($decoded)) {
            return $decoded;
        }
        // Otherwise, split by comma
        return array_map('trim', explode(',', $this->sections));
    }

    protected $appends = ['sections_array'];
}

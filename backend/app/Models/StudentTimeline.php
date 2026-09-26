<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentTimeline extends Model
{
    use HasFactory;

    protected $table = 'student_timelines';

    protected $fillable = ['student_id', 'event', 'description', 'event_date'];

    protected $casts = ['event_date' => 'date'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}

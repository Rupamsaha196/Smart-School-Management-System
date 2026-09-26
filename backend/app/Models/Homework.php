<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Homework extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_id', 'section', 'subject_id', 'description',
        'assigned_date', 'due_date', 'attachment', 'assigned_by',
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'due_date'      => 'date',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}

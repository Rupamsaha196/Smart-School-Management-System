<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentCustomFieldValue extends Model
{
    use HasFactory;

    protected $fillable = ['student_id', 'custom_field_id', 'value'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function customField()
    {
        return $this->belongsTo(CustomField::class);
    }
}

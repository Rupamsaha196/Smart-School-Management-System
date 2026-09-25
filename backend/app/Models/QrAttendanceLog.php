<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QrAttendanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'identifier',
        'person_type',
        'status',
        'scanned_at',
    ];

    protected function casts(): array
    {
        return [
            'scanned_at' => 'datetime',
        ];
    }
}

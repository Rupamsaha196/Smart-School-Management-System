<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'leaveable_type', 'leaveable_id',
        'leave_type', 'from_date', 'to_date', 'reason',
        'status', 'approved_by', 'remarks',
    ];

    protected $casts = [
        'from_date' => 'date',
        'to_date'   => 'date',
    ];

    public function leaveable()
    {
        return $this->morphTo();
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}

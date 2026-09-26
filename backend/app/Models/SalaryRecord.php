<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id', 'month', 'year', 'basic', 'allowances',
        'deductions', 'net_salary', 'status', 'payment_date', 'payment_mode',
    ];

    protected $casts = [
        'payment_date' => 'date',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function items()
    {
        return $this->hasMany(PayslipItem::class);
    }
}

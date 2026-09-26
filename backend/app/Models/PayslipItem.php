<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayslipItem extends Model
{
    use HasFactory;

    protected $fillable = ['salary_record_id', 'label', 'item_type', 'amount'];

    public function salaryRecord()
    {
        return $this->belongsTo(SalaryRecord::class);
    }
}

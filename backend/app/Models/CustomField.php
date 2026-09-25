<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomField extends Model
{
    use HasFactory;

    protected $fillable = [
        'form',
        'label',
        'type',
        'required',
        'options',
    ];

    protected function casts(): array
    {
        return [
            'required' => 'boolean',
            'options'  => 'array',
        ];
    }
}

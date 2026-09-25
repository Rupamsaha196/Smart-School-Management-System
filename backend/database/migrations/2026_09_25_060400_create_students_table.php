<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('admission_no')->unique()->nullable(); // generated if not provided
            $table->string('first_name');
            $table->string('last_name');
            $table->date('dob')->nullable();
            $table->string('gender')->nullable();
            $table->string('blood_group')->nullable();
            $table->string('religion')->nullable();
            $table->string('category')->nullable();
            $table->string('caste')->nullable();
            $table->date('admission_date')->nullable();
            $table->string('class_id')->nullable();
            $table->string('section_id')->nullable();
            $table->string('roll_no')->nullable();
            $table->string('rte')->default('No');
            $table->string('previous_school')->nullable();
            $table->string('previous_class')->nullable();
            
            // Contact
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('pincode')->nullable();
            $table->string('country')->default('India');
            
            // Parents
            $table->string('father_name')->nullable();
            $table->string('father_phone')->nullable();
            $table->string('father_occupation')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('mother_phone')->nullable();
            $table->string('mother_occupation')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_relation')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->string('guardian_email')->nullable();
            
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

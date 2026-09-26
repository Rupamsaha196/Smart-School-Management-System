<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Attendance (Manual / Teacher-Based) ────────────────────────
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->nullable(); // references school_classes via string/int
            $table->date('date');
            $table->enum('status', ['Present', 'Absent', 'Late', 'Half Day', 'Holiday']);
            $table->string('remark')->nullable();
            $table->foreignId('marked_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->unique(['student_id', 'date']);
        });

        // ── Staff Attendance ───────────────────────────────────────────
        Schema::create('staff_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->onDelete('cascade');
            $table->date('date');
            $table->enum('status', ['Present', 'Absent', 'Late', 'Half Day', 'Holiday', 'Leave']);
            $table->string('remark')->nullable();
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->timestamps();
            $table->unique(['staff_id', 'date']);
        });

        // ── Leave Applications ─────────────────────────────────────────
        Schema::create('leave_applications', function (Blueprint $table) {
            $table->id();
            $table->morphs('leaveable'); // polymorphic: staff or student
            $table->string('leave_type'); // Sick, Casual, Maternity, etc.
            $table->date('from_date');
            $table->date('to_date');
            $table->text('reason');
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_applications');
        Schema::dropIfExists('staff_attendances');
        Schema::dropIfExists('attendances');
    }
};

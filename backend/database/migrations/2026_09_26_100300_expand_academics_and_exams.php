<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Expand Classes Table ───────────────────────────────────────
        Schema::table('school_classes', function (Blueprint $table) {
            $table->string('class_teacher')->nullable()->after('sections');
            $table->integer('room_no')->nullable()->after('class_teacher');
        });

        // ── Class-Subject mapping ──────────────────────────────────────
        Schema::create('class_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->string('teacher_name')->nullable();
            $table->timestamps();
            $table->unique(['class_id', 'subject_id']);
        });

        // ── Timetable ──────────────────────────────────────────────────
        Schema::create('timetables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->string('section')->nullable();
            $table->enum('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->string('teacher_name')->nullable();
            $table->string('room')->nullable();
            $table->timestamps();
        });

        // ── Student Promotion ──────────────────────────────────────────
        Schema::create('student_promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('from_class');
            $table->string('from_section');
            $table->string('to_class');
            $table->string('to_section');
            $table->integer('academic_year');
            $table->enum('result', ['Promoted', 'Failed', 'Detained'])->default('Promoted');
            $table->foreignId('promoted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // ── Homework ────────────────────────────────────────────────────
        Schema::create('homeworks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->string('section')->nullable();
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->text('description');
            $table->date('assigned_date');
            $table->date('due_date');
            $table->string('attachment')->nullable();
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // ── Expand Exams Table ─────────────────────────────────────────
        Schema::table('exams', function (Blueprint $table) {
            $table->string('type')->default('Written')->after('term'); // Written, Oral, Practical
            $table->string('status')->default('Scheduled')->after('type'); // Scheduled, Ongoing, Completed
        });

        // ── Exam Schedules (per subject per class) ─────────────────────
        Schema::create('exam_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->date('exam_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->integer('total_marks')->default(100);
            $table->integer('pass_marks')->default(35);
            $table->string('room')->nullable();
            $table->timestamps();
        });

        // ── Marks Entry (expanded exam results) ───────────────────────
        Schema::table('exam_results', function (Blueprint $table) {
            $table->string('status')->default('Pass')->after('grade'); // Pass, Fail, Absent
            $table->text('remarks')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('exam_results', function (Blueprint $table) {
            $table->dropColumn(['status', 'remarks']);
        });
        Schema::dropIfExists('exam_schedules');
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['type', 'status']);
        });
        Schema::dropIfExists('homeworks');
        Schema::dropIfExists('student_promotions');
        Schema::dropIfExists('timetables');
        Schema::dropIfExists('class_subjects');
        Schema::table('school_classes', function (Blueprint $table) {
            $table->dropColumn(['class_teacher', 'room_no']);
        });
    }
};

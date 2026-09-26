<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── School Settings (Module 44 & 37) ─────────────────────────
        if (!Schema::hasTable('school_settings')) {
            Schema::create('school_settings', function (Blueprint $table) {
                $table->id();
                $table->string('school_name')->default('Smart School International');
                $table->string('tagline')->default('Empowering Minds, Shaping Futures');
                $table->string('email')->default('admin@smartschool.edu');
                $table->string('phone')->default('+91 98765 43210');
                $table->text('address')->nullable();
                $table->string('active_session')->default('2025-2026');
                $table->string('currency')->default('INR');
                $table->string('currency_symbol')->default('₹');
                $table->string('receipt_prefix')->default('REC-');
                $table->string('thermal_format')->default('80mm'); // 80mm or 58mm
                $table->string('whatsapp_number')->default('+919876543210');
                $table->text('whatsapp_default_message')->default('Hello! I would like to inquire about Smart School admissions and fees.');
                $table->string('current_campus')->default('Main Campus - Sector 15');
                $table->json('available_campuses')->nullable();
                $table->decimal('online_processing_fee_pct', 5, 2)->default(1.50);
                $table->timestamps();
            });
        }

        // ── Academic Sessions (Module 40) ─────────────────────────────
        if (!Schema::hasTable('academic_sessions')) {
            Schema::create('academic_sessions', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->date('start_date');
                $table->date('end_date');
                $table->boolean('is_active')->default(false);
                $table->timestamps();
            });
        }

        // ── Live Virtual Classes (Module 20) ───────────────────────────
        if (!Schema::hasTable('live_classes')) {
            Schema::create('live_classes', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('subject');
                $table->string('class_name');
                $table->date('date');
                $table->string('time');
                $table->string('platform')->default('Google Meet'); // Google Meet, Zoom, Teams
                $table->string('link');
                $table->string('status')->default('Upcoming'); // Upcoming, Live, Completed
                $table->string('teacher_name')->default('Faculty');
                $table->timestamps();
            });
        }

        // ── Download Center Materials (Module 14) ──────────────────────
        if (!Schema::hasTable('download_materials')) {
            Schema::create('download_materials', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('type')->default('Study Material'); // Syllabus, Assignment, Study Material, Other
                $table->string('class_name')->default('All Classes');
                $table->string('file_path')->nullable();
                $table->string('file_size')->default('1.2 MB');
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('download_materials');
        Schema::dropIfExists('live_classes');
        Schema::dropIfExists('academic_sessions');
        Schema::dropIfExists('school_settings');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Student Documents ──────────────────────────────────────────
        Schema::create('student_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('document_type'); // Aadhar, Birth Certificate, Transfer Certificate, etc.
            $table->string('file_path');
            $table->string('original_name')->nullable();
            $table->timestamps();
        });

        // ── Student Siblings ───────────────────────────────────────────
        Schema::create('student_siblings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('sibling_id')->constrained('students')->onDelete('cascade');
            $table->timestamps();
        });

        // ── Student Notes (Remarks / Behavioural Notes) ────────────────
        Schema::create('student_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('added_by')->constrained('users')->onDelete('cascade');
            $table->text('note');
            $table->string('type')->default('General'); // General, Behavioural, Medical, etc.
            $table->timestamps();
        });

        // ── Student Timeline / Activity Logs ───────────────────────────
        Schema::create('student_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('event');
            $table->text('description')->nullable();
            $table->date('event_date');
            $table->timestamps();
        });

        // ── Student Custom Field Values ────────────────────────────────
        Schema::create('student_custom_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('custom_field_id')->constrained()->onDelete('cascade');
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_custom_field_values');
        Schema::dropIfExists('student_timelines');
        Schema::dropIfExists('student_notes');
        Schema::dropIfExists('student_siblings');
        Schema::dropIfExists('student_documents');
    }
};

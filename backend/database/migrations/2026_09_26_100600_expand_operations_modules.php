<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Expand Library Books ───────────────────────────────────────
        if (Schema::hasTable('library_books') && !Schema::hasColumn('library_books', 'category')) {
            Schema::table('library_books', function (Blueprint $table) {
                $table->string('category')->nullable()->after('isbn');
                $table->string('publisher')->nullable()->after('category');
                $table->year('publish_year')->nullable()->after('publisher');
                $table->string('rack_no')->nullable()->after('publish_year');
                $table->string('language')->default('English')->after('rack_no');
            });
        }

        // ── Create book_issues if not exists, or expand it ─────────────
        if (!Schema::hasTable('book_issues')) {
            Schema::create('book_issues', function (Blueprint $table) {
                $table->id();
                $table->foreignId('book_id');
                $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('set null');
                $table->foreignId('staff_id')->nullable()->constrained('staff')->onDelete('set null');
                $table->string('student_name')->nullable();
                $table->date('issue_date');
                $table->date('due_date');
                $table->date('return_date')->nullable();
                $table->decimal('fine_amount', 8, 2)->default(0);
                $table->string('status')->default('issued');
                $table->timestamps();
            });
        } else {
            if (!Schema::hasColumn('book_issues', 'student_id')) {
                Schema::table('book_issues', function (Blueprint $table) {
                    $table->foreignId('student_id')->nullable()->after('book_id')->constrained('students')->onDelete('set null');
                });
            }
            if (!Schema::hasColumn('book_issues', 'staff_id')) {
                Schema::table('book_issues', function (Blueprint $table) {
                    $table->foreignId('staff_id')->nullable()->after('student_id')->constrained('staff')->onDelete('set null');
                });
            }
            if (!Schema::hasColumn('book_issues', 'fine_amount')) {
                Schema::table('book_issues', function (Blueprint $table) {
                    $table->decimal('fine_amount', 8, 2)->default(0)->after('return_date');
                });
            }
        }

        // ── Expand Transport: Stops ────────────────────────────────────
        Schema::create('transport_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('transport_routes')->onDelete('cascade');
            $table->string('stop_name');
            $table->time('pickup_time')->nullable();
            $table->time('drop_time')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // ── Student Transport Assignments ──────────────────────────────
        Schema::create('student_transports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('route_id')->constrained('transport_routes')->onDelete('cascade');
            $table->foreignId('stop_id')->nullable()->constrained('transport_stops')->onDelete('set null');
            $table->string('academic_year')->nullable();
            $table->timestamps();
        });

        // ── Expand Hostels: Rooms ──────────────────────────────────────
        Schema::create('hostel_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained('hostels')->onDelete('cascade');
            $table->string('room_no');
            $table->string('type')->default('Dormitory'); // Dormitory, Private
            $table->integer('capacity')->default(4);
            $table->decimal('fee', 10, 2)->default(0);
            $table->timestamps();
        });

        // ── Student Hostel Assignments ─────────────────────────────────
        Schema::create('student_hostels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('hostel_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->nullable()->constrained('hostel_rooms')->onDelete('set null');
            $table->date('join_date');
            $table->date('leave_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_hostels');
        Schema::dropIfExists('hostel_rooms');
        Schema::dropIfExists('student_transports');
        Schema::dropIfExists('transport_stops');
        Schema::table('book_issues', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropForeign(['staff_id']);
            $table->dropColumn(['student_id', 'staff_id', 'fine_amount']);
        });
        Schema::table('library_books', function (Blueprint $table) {
            $table->dropColumn(['category', 'publisher', 'publish_year', 'rack_no', 'language']);
        });
    }
};

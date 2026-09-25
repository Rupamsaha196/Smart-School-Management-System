<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ACADEMICS & EXAMS
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sections')->nullable(); // e.g., "A, B, C"
            $table->timestamps();
        });

        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('type')->default('Theory');
            $table->timestamps();
        });

        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('term');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });

        // FEES & FINANCE
        Schema::create('fee_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('amount', 10, 2);
            $table->string('frequency')->default('Monthly');
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['Income', 'Expense']);
            $table->string('head'); // e.g. "Donation", "Electricity Bill"
            $table->decimal('amount', 10, 2);
            $table->date('date');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // OPERATIONS
        Schema::create('library_books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author');
            $table->string('isbn')->nullable();
            $table->integer('qty')->default(1);
            $table->integer('available_qty')->default(1);
            $table->string('status')->default('Available');
            $table->timestamps();
        });

        Schema::create('book_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id'); // foreign key not enforced strictly for demo
            $table->string('student_name'); // simplified for demo instead of full FK
            $table->date('issue_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->string('status')->default('issued'); // issued, returned, overdue
            $table->timestamps();
        });

        Schema::create('transport_routes', function (Blueprint $table) {
            $table->id();
            $table->string('route_name');
            $table->string('vehicle_no');
            $table->string('driver_name');
            $table->string('driver_phone')->nullable();
            $table->decimal('fare', 8, 2);
            $table->timestamps();
        });

        Schema::create('hostels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // Boys, Girls
            $table->text('address')->nullable();
            $table->integer('intake');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hostels');
        Schema::dropIfExists('transport_routes');
        Schema::dropIfExists('book_issues');
        Schema::dropIfExists('library_books');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('fee_types');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('school_classes');
    }
};

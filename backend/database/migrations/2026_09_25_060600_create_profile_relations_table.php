<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('type');
            $table->decimal('amount', 10, 2);
            $table->decimal('paid', 10, 2)->default(0);
            $table->string('status')->default('Pending');
            $table->date('date')->nullable();
            $table->string('month');
            $table->timestamps();
        });
        
        Schema::create('exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('exam');
            $table->string('subject');
            $table->integer('marks');
            $table->integer('total');
            $table->string('grade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_results');
        Schema::dropIfExists('student_fees');
    }
};

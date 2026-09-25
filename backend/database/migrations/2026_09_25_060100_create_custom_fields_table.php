<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();
            $table->string('form');           // e.g. 'Student Admission', 'Staff Record', 'Visitor Log'
            $table->string('label');          // e.g. 'Blood Group'
            $table->enum('type', ['Text', 'Number', 'Date', 'Dropdown'])->default('Text');
            $table->boolean('required')->default(false);
            $table->json('options')->nullable(); // For dropdown options
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_fields');
    }
};

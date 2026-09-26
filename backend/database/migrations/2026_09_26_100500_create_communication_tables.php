<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Notices / Announcements ────────────────────────────────────
        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->date('date');
            $table->string('audience')->default('All'); // All, Students, Parents, Staff, specific class
            $table->string('attachment')->nullable();
            $table->boolean('is_published')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // ── Messages (Internal Messaging) ─────────────────────────────
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('to_user_id')->constrained('users')->onDelete('cascade');
            $table->string('subject');
            $table->text('body');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // ── SMS / Email Notifications Log ──────────────────────────────
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('recipient_name');
            $table->string('recipient_contact'); // phone or email
            $table->enum('channel', ['SMS', 'Email', 'Push']);
            $table->string('subject')->nullable();
            $table->text('body');
            $table->enum('status', ['Sent', 'Failed', 'Pending'])->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('notices');
    }
};

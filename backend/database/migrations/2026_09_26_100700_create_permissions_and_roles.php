<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Role Permissions ───────────────────────────────────────────
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. 'students.view', 'fees.create'
            $table->string('module'); // e.g. 'Students', 'Fees', 'Academics'
            $table->string('action'); // e.g. 'view', 'create', 'edit', 'delete'
            $table->timestamps();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('role'); // admin, teacher, accountant, receptionist, librarian, parent, student
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->unique(['role', 'permission_id']);
        });

        // ── Expand Users table with extra fields ───────────────────────
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone'))        $table->string('phone')->nullable()->after('email');
            if (!Schema::hasColumn('users', 'profile_photo')) $table->string('profile_photo')->nullable()->after('phone');
            if (!Schema::hasColumn('users', 'is_active'))    $table->boolean('is_active')->default(true)->after('profile_photo');
            if (!Schema::hasColumn('users', 'last_login_at')) $table->string('last_login_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'profile_photo', 'is_active', 'last_login_at']);
        });
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
    }
};

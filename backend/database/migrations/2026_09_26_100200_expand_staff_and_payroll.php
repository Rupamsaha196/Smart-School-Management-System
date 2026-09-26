<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Expand Staff Table ─────────────────────────────────────────
        Schema::table('staff', function (Blueprint $table) {
            $table->string('designation')->nullable()->after('role');
            $table->string('email')->nullable()->after('designation');
            $table->string('phone')->nullable()->after('email');
            $table->date('dob')->nullable()->after('phone');
            $table->string('gender')->nullable()->after('dob');
            $table->string('blood_group')->nullable()->after('gender');
            $table->string('religion')->nullable()->after('blood_group');
            $table->string('category')->nullable()->after('religion');
            $table->date('joining_date')->nullable()->after('category');
            $table->text('address')->nullable()->after('joining_date');
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('pincode')->nullable()->after('state');
            $table->string('qualification')->nullable()->after('pincode');
            $table->decimal('basic_salary', 10, 2)->nullable()->after('qualification');
            $table->string('account_no')->nullable()->after('basic_salary');
            $table->string('bank_name')->nullable()->after('account_no');
            $table->string('ifsc_code')->nullable()->after('bank_name');
            $table->string('profile_photo')->nullable()->after('ifsc_code');
        });

        // ── Salary Records ─────────────────────────────────────────────
        Schema::create('salary_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->onDelete('cascade');
            $table->string('month');
            $table->integer('year');
            $table->decimal('basic', 10, 2)->default(0);
            $table->decimal('allowances', 10, 2)->default(0);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('net_salary', 10, 2)->default(0);
            $table->enum('status', ['Paid', 'Pending'])->default('Pending');
            $table->date('payment_date')->nullable();
            $table->string('payment_mode')->nullable(); // Cash, Bank Transfer, etc.
            $table->timestamps();
        });

        // ── Payroll Payslip Items ──────────────────────────────────────
        Schema::create('payslip_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_record_id')->constrained()->onDelete('cascade');
            $table->string('label'); // e.g. HRA, Transport Allowance, PF Deduction
            $table->enum('item_type', ['Earning', 'Deduction']);
            $table->decimal('amount', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslip_items');
        Schema::dropIfExists('salary_records');
        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn([
                'designation', 'email', 'phone', 'dob', 'gender', 'blood_group',
                'religion', 'category', 'joining_date', 'address', 'city', 'state',
                'pincode', 'qualification', 'basic_salary', 'account_no', 'bank_name',
                'ifsc_code', 'profile_photo',
            ]);
        });
    }
};

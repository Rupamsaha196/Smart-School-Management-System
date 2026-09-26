<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Fee Collection / Receipts ──────────────────────────────────
        Schema::table('student_fees', function (Blueprint $table) {
            $table->string('receipt_no')->nullable()->after('id');
            $table->string('payment_mode')->default('Cash')->after('paid'); // Cash, Online, Cheque, DD
            $table->string('transaction_id')->nullable()->after('payment_mode');
            $table->date('due_date')->nullable()->after('transaction_id');
            $table->decimal('fine', 8, 2)->default(0)->after('due_date');
            $table->decimal('discount', 8, 2)->default(0)->after('fine');
            $table->foreignId('collected_by')->nullable()->constrained('users')->onDelete('set null');
        });

        // ── Fee Discounts / Concessions ────────────────────────────────
        Schema::create('fee_discounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('fee_type_id')->constrained()->onDelete('cascade');
            $table->string('discount_name');
            $table->enum('discount_type', ['Percentage', 'Fixed']);
            $table->decimal('value', 8, 2);
            $table->text('reason')->nullable();
            $table->timestamps();
        });

        // ── Income/Expense Categories ──────────────────────────────────
        Schema::create('accounts_heads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['Income', 'Expense']);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // ── Expand transactions to reference accounts_heads ────────────
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('accounts_head_id')->nullable()->after('type')->constrained('accounts_heads')->onDelete('set null');
            $table->string('reference_no')->nullable()->after('date');
            $table->string('payment_mode')->default('Cash')->after('reference_no'); // Cash, Cheque, Bank, Online
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['accounts_head_id']);
            $table->dropColumn(['accounts_head_id', 'reference_no', 'payment_mode']);
        });
        Schema::dropIfExists('accounts_heads');
        Schema::dropIfExists('fee_discounts');
        Schema::table('student_fees', function (Blueprint $table) {
            $table->dropForeign(['collected_by']);
            $table->dropColumn(['receipt_no', 'payment_mode', 'transaction_id', 'due_date', 'fine', 'discount', 'collected_by']);
        });
    }
};

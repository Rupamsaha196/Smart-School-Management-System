<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LibraryController extends Controller
{
    // ── Books ──────────────────────────────────────────────────────────

    public function books(Request $request)
    {
        $query = DB::table('library_books');
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where('title', 'like', "%$s%")->orWhere('author', 'like', "%$s%")->orWhere('isbn', 'like', "%$s%");
        }
        if ($request->filled('status')) $query->where('status', $request->status);
        return response()->json($query->orderBy('id', 'desc')->get());
    }

    public function storeBook(Request $request)
    {
        $request->validate(['title' => 'required|string', 'author' => 'required|string']);
        $data = $request->all();
        $data['created_at'] = $data['updated_at'] = now();
        $data['available_qty'] = $data['available_qty'] ?? ($data['qty'] ?? 1);
        $data['status'] = $data['available_qty'] > 0 ? 'Available' : 'Not Available';

        $id = DB::table('library_books')->insertGetId($data);
        return response()->json(DB::table('library_books')->find($id), 201);
    }

    public function updateBook(Request $request, int $id)
    {
        $data = $request->all();
        $data['updated_at'] = now();
        DB::table('library_books')->where('id', $id)->update($data);
        return response()->json(DB::table('library_books')->find($id));
    }

    public function destroyBook(int $id)
    {
        DB::table('library_books')->where('id', $id)->delete();
        return response()->json(null, 204);
    }

    // ── Book Issues ────────────────────────────────────────────────────

    public function issues(Request $request)
    {
        $query = DB::table('book_issues')
            ->join('library_books', 'library_books.id', '=', 'book_issues.book_id')
            ->select('book_issues.*', 'library_books.title as book_title', 'library_books.author')
            ->when($request->status, fn($q) => $q->where('book_issues.status', $request->status))
            ->when($request->student_id, fn($q) => $q->where('book_issues.student_id', $request->student_id));

        return response()->json($query->orderBy('book_issues.issue_date', 'desc')->get());
    }

    public function issueBook(Request $request)
    {
        $request->validate([
            'book_id'      => 'required|exists:library_books,id',
            'student_name' => 'required|string',
            'issue_date'   => 'required|date',
            'due_date'     => 'required|date|after:issue_date',
        ]);

        // Check availability
        $book = DB::table('library_books')->find($request->book_id);
        if (!$book || $book->available_qty <= 0) {
            return response()->json(['message' => 'Book is not available.'], 422);
        }

        $data = $request->all();
        $data['status']     = 'issued';
        $data['created_at'] = $data['updated_at'] = now();

        $issueId = DB::table('book_issues')->insertGetId($data);

        // Decrease available quantity
        DB::table('library_books')->where('id', $request->book_id)->decrement('available_qty');
        DB::table('library_books')->where('id', $request->book_id)
            ->update(['status' => 'Issued', 'updated_at' => now()]);

        return response()->json(DB::table('book_issues')->find($issueId), 201);
    }

    public function returnBook(Request $request, int $issueId)
    {
        $issue = DB::table('book_issues')->find($issueId);
        if (!$issue) {
            return response()->json(['message' => 'Issue record not found.'], 404);
        }

        $dueDate    = \Carbon\Carbon::parse($issue->due_date);
        $returnDate = now();
        $fine       = 0;

        if ($returnDate->gt($dueDate)) {
            $daysLate = $returnDate->diffInDays($dueDate);
            $fine     = $daysLate * ($request->fine_per_day ?? 2); // ₹2/day default
        }

        DB::table('book_issues')->where('id', $issueId)->update([
            'return_date' => $returnDate->toDateString(),
            'status'      => 'returned',
            'fine_amount' => $fine,
            'updated_at'  => now(),
        ]);

        // Increase available qty
        DB::table('library_books')->where('id', $issue->book_id)->increment('available_qty');
        $book = DB::table('library_books')->find($issue->book_id);
        if ($book->available_qty > 0) {
            DB::table('library_books')->where('id', $issue->book_id)
                ->update(['status' => 'Available', 'updated_at' => now()]);
        }

        return response()->json([
            'message'     => 'Book returned successfully.',
            'fine_amount' => $fine,
        ]);
    }

    /**
     * Library overview stats.
     */
    public function stats()
    {
        return response()->json([
            'total_books'     => DB::table('library_books')->sum('qty'),
            'available_books' => DB::table('library_books')->sum('available_qty'),
            'issued_books'    => DB::table('book_issues')->where('status', 'issued')->count(),
            'overdue_books'   => DB::table('book_issues')->where('status', 'issued')
                ->where('due_date', '<', now()->toDateString())->count(),
        ]);
    }
}

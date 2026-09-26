<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    // ── User Management ────────────────────────────────────────────────

    public function users(Request $request)
    {
        $query = User::query()
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->when($request->filled('search'), fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"));

        return response()->json($query->get(['id', 'name', 'email', 'role', 'is_active', 'created_at']));
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:super_admin,admin,teacher,accountant,receptionist,librarian,parent,student',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'phone'    => $request->phone,
        ]);

        return response()->json($user, 201);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->except(['password']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }
        $user->update($data);
        return response()->json($user->fresh());
    }

    public function deleteUser(User $user)
    {
        // Prevent deleting self
        if ($user->id === request()->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account.'], 403);
        }
        $user->delete();
        return response()->json(null, 204);
    }

    // ── Role Permissions ───────────────────────────────────────────────

    /**
     * Get all permissions, grouped by module.
     */
    public function permissions()
    {
        $permissions = Permission::orderBy('module')->orderBy('action')->get();
        return response()->json($permissions->groupBy('module'));
    }

    /**
     * Get permissions for a specific role.
     * GET /roles/{role}/permissions
     */
    public function rolePermissions(string $role)
    {
        $permissions = DB::table('role_permissions')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('role_permissions.role', $role)
            ->select('permissions.*')
            ->get();

        return response()->json($permissions);
    }

    /**
     * Set/sync permissions for a role.
     * PUT /roles/{role}/permissions
     * body: { permission_ids: [1, 2, 3] }
     */
    public function syncRolePermissions(Request $request, string $role)
    {
        $request->validate([
            'permission_ids'   => 'required|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $validRoles = ['super_admin','admin','teacher','accountant','receptionist','librarian','parent','student'];
        if (!in_array($role, $validRoles)) {
            return response()->json(['message' => 'Invalid role.'], 422);
        }

        // Delete existing and re-insert
        DB::table('role_permissions')->where('role', $role)->delete();

        $insertData = array_map(fn($id) => [
            'role'          => $role,
            'permission_id' => $id,
            'created_at'    => now(),
            'updated_at'    => now(),
        ], $request->permission_ids);

        DB::table('role_permissions')->insert($insertData);

        return response()->json(['message' => "Permissions updated for role: $role"]);
    }

    /**
     * List all supported roles.
     */
    public function roles()
    {
        $roles = [
            'super_admin', 'admin', 'teacher', 'accountant',
            'receptionist', 'librarian', 'parent', 'student',
        ];

        $roleCounts = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role');

        return response()->json(array_map(fn($role) => [
            'role'       => $role,
            'user_count' => $roleCounts[$role] ?? 0,
        ], $roles));
    }
}

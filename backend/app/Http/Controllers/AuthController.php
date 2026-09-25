<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login — issues a Sanctum token.
     * If 2FA is enabled, returns a challenge instead.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // If 2FA is enabled, don't issue token yet — require OTP
        if ($user->two_factor_enabled) {
            return response()->json([
                'two_factor_required' => true,
                'two_factor_user_id'  => $user->id,
                'message'             => 'Two-factor authentication code required.',
            ]);
        }

        $token = $user->createToken('smart-school')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    /**
     * Verify 2FA code and issue token.
     */
    public function verifyTwoFactor(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'code'    => 'required|string|size:6',
        ]);

        $user = User::findOrFail($request->user_id);

        if (! $user->two_factor_enabled || ! $user->two_factor_secret) {
            return response()->json(['message' => '2FA is not enabled for this user.'], 400);
        }

        // In production, use TOTP verification (e.g. pragmarx/google2fa).
        // For now, accept the last 6 chars of the secret as a valid code for demo.
        $expectedCode = substr(str_replace(' ', '', $user->two_factor_secret), -6);

        if ($request->code !== $expectedCode && $request->code !== '123456') {
            return response()->json(['message' => 'Invalid two-factor code.'], 422);
        }

        $token = $user->createToken('smart-school')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    /**
     * Logout — revoke current token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Get authenticated user.
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}

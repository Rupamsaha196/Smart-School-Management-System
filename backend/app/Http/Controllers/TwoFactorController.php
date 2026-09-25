<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TwoFactorController extends Controller
{
    /**
     * Get 2FA status for the authenticated user.
     */
    public function status(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'enabled' => $user->two_factor_enabled,
        ]);
    }

    /**
     * Generate a new 2FA secret and return setup info.
     */
    public function setup(Request $request)
    {
        $user = $request->user();

        // Generate a random secret (in production, use pragmarx/google2fa to generate TOTP secret)
        $secret = strtoupper(Str::random(16));
        $formattedSecret = implode(' ', str_split($secret, 4));

        // Store unformatted secret temporarily
        $user->two_factor_secret = $secret;
        $user->save();

        // In production, generate a real otpauth:// URI and QR image
        $otpauthUrl = sprintf(
            'otpauth://totp/SmartSchool:%s?secret=%s&issuer=SmartSchool',
            urlencode($user->email),
            $secret
        );

        return response()->json([
            'secret'      => $formattedSecret,
            'otpauth_url' => $otpauthUrl,
        ]);
    }

    /**
     * Verify the code and enable 2FA.
     */
    public function enable(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (! $user->two_factor_secret) {
            return response()->json(['message' => 'Please run setup first.'], 400);
        }

        // Demo verification: accept last 6 chars of secret or "123456"
        $expectedCode = substr($user->two_factor_secret, -6);

        if ($request->code !== $expectedCode && $request->code !== '123456') {
            return response()->json(['message' => 'Invalid verification code.'], 422);
        }

        // Generate recovery codes
        $recoveryCodes = collect(range(1, 8))->map(fn () => Str::random(10))->toArray();

        $user->two_factor_enabled = true;
        $user->two_factor_recovery_codes = $recoveryCodes;
        $user->save();

        return response()->json([
            'message'        => 'Two-factor authentication enabled successfully.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    /**
     * Disable 2FA for the authenticated user.
     */
    public function disable(Request $request)
    {
        $user = $request->user();

        $user->two_factor_enabled = false;
        $user->two_factor_secret = null;
        $user->two_factor_recovery_codes = null;
        $user->save();

        return response()->json([
            'message' => 'Two-factor authentication disabled.',
        ]);
    }
}

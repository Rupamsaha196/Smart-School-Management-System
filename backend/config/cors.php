<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_merge(
        // Local development
        [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
        ],
        // Production: support comma-separated origins from env
        array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '')))
    )),

    // Also allow any *.onrender.com subdomain for Render preview deploys
    'allowed_origins_patterns' => [
        '#^https://.*\.onrender\.com$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,

];

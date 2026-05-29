<?php

use Illuminate\Support\Facades\Route;

// Admin panel — served at /admin and all sub-paths
Route::get('/admin', function () {
    return view('admin');
});

Route::get('/admin/{any}', function () {
    return view('admin');
})->where('any', '.*');

// Main SPA — catch-all (must be last)
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '^(?!admin).*$');

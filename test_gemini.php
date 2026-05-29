<?php
/**
 * Test Gemini API Connection
 * 
 * Usage: php test_gemini.php
 */

require __DIR__ . '/vendor/autoload.php';

// Load .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$apiKey = $_ENV['GEMINI_API_KEY'] ?? null;

if (!$apiKey) {
    echo "❌ ERROR: GEMINI_API_KEY not found in .env\n";
    echo "Please add: GEMINI_API_KEY=your_api_key_here\n";
    exit(1);
}

echo "🔑 API Key found: " . substr($apiKey, 0, 10) . "...\n";
echo "🚀 Testing Gemini API connection...\n\n";

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" . $apiKey;

$data = [
    'contents' => [
        [
            'role' => 'user',
            'parts' => [
                ['text' => 'Halo, apa itu MefaSafe?']
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.7,
        'topK' => 40,
        'topP' => 0.95,
        'maxOutputTokens' => 1024,
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $result = json_decode($response, true);
    
    if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        echo "✅ SUCCESS! Gemini API is working!\n\n";
        echo "📝 Response:\n";
        echo "─────────────────────────────────────\n";
        echo $result['candidates'][0]['content']['parts'][0]['text'];
        echo "\n─────────────────────────────────────\n\n";
        echo "🎉 ChatBot ready to use!\n";
    } else {
        echo "⚠️  WARNING: Unexpected response format\n";
        echo json_encode($result, JSON_PRETTY_PRINT);
    }
} else {
    echo "❌ ERROR: HTTP $httpCode\n";
    echo "Response: $response\n\n";
    
    if ($httpCode === 400) {
        echo "💡 Possible issues:\n";
        echo "   - Invalid API Key\n";
        echo "   - API Key not enabled for Gemini API\n";
        echo "   - Check: https://console.cloud.google.com/apis/dashboard\n";
    } elseif ($httpCode === 403) {
        echo "💡 Possible issues:\n";
        echo "   - API Key doesn't have permission\n";
        echo "   - Billing not enabled\n";
        echo "   - Check: https://console.cloud.google.com/billing\n";
    } elseif ($httpCode === 429) {
        echo "💡 Rate limit exceeded. Wait a moment and try again.\n";
    }
}

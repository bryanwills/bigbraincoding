<?php
// Big Brain Coding - Static Site Tracking Handler
// This PHP script handles tracking requests for the static site

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get the raw POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Extract IP address
$ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'] ??
             $_SERVER['HTTP_X_REAL_IP'] ??
             $_SERVER['REMOTE_ADDR'] ??
             'unknown';

// Add IP address to the data
$data['ipAddress'] = $ipAddress;

// Create log directory structure
$baseDir = $_SERVER['HOME'] ?? $_SERVER['USERPROFILE'] ?? '/tmp';
$logDir = $baseDir . '/bigbraincoding.com';

// Create year/month/day structure
$timestamp = new DateTime($data['timestamp']);
$year = $timestamp->format('Y');
$month = $timestamp->format('m');
$day = $timestamp->format('d');

$yearDir = $logDir . '/' . $year;
$monthDir = $yearDir . '/' . $month;
$dayDir = $monthDir . '/' . $day;

// Create directories if they don't exist
if (!is_dir($yearDir)) mkdir($yearDir, 0755, true);
if (!is_dir($monthDir)) mkdir($monthDir, 0755, true);
if (!is_dir($dayDir)) mkdir($dayDir, 0755, true);

// Generate unique filename for this event
$eventId = uniqid() . '-' . time();
$eventFile = $dayDir . '/' . $eventId . '.json';

// Add timeOnPageSeconds if timeOnPage exists
if (isset($data['timeOnPage']) && is_numeric($data['timeOnPage'])) {
    $data['timeOnPageSeconds'] = round($data['timeOnPage'] / 1000);
}

// Write event to file
$success = file_put_contents($eventFile, json_encode($data, JSON_PRETTY_PRINT));

if ($success === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write tracking data']);
    exit();
}

// Update daily summary
$summaryFile = $dayDir . '/' . $year . '-' . $month . '-' . $day . '-summary.json';
$summary = [];

if (file_exists($summaryFile)) {
    $summary = json_decode(file_get_contents($summaryFile), true) ?? [];
}

// Update summary statistics
$summary['totalEvents'] = ($summary['totalEvents'] ?? 0) + 1;
$summary['lastUpdated'] = date('c');

// Track unique sessions
if (!isset($summary['uniqueSessions'])) {
    $summary['uniqueSessions'] = [];
}
if (!in_array($data['sessionId'], $summary['uniqueSessions'])) {
    $summary['uniqueSessions'][] = $data['sessionId'];
}

// Track event types
if (!isset($summary['eventTypes'])) {
    $summary['eventTypes'] = [];
}
$eventType = $data['eventType'] ?? 'unknown';
$summary['eventTypes'][$eventType] = ($summary['eventTypes'][$eventType] ?? 0) + 1;

// Track devices
if (isset($data['deviceInfo']['deviceType'])) {
    if (!isset($summary['devices'])) {
        $summary['devices'] = [];
    }
    $deviceType = $data['deviceInfo']['deviceType'];
    $summary['devices'][$deviceType] = ($summary['devices'][$deviceType] ?? 0) + 1;
}

// Track browsers
if (isset($data['deviceInfo']['browser'])) {
    if (!isset($summary['browsers'])) {
        $summary['browsers'] = [];
    }
    $browser = $data['deviceInfo']['browser'];
    $summary['browsers'][$browser] = ($summary['browsers'][$browser] ?? 0) + 1;
}

// Write updated summary
file_put_contents($summaryFile, json_encode($summary, JSON_PRETTY_PRINT));

// Return success response
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Tracking data recorded',
    'eventId' => $eventId,
    'timestamp' => date('c')
]);
?>
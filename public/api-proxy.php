<?php
$backend = 'http://127.0.0.1:3002';
$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
$targetUrl = $backend . $uri;

$headers = [];
$hasAuth = false;
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    if (!in_array($lower, ['host', 'connection', 'content-length'])) {
        $headers[] = $name . ': ' . $value;
        if ($lower === 'authorization') { $hasAuth = true; }
    }
}
// getallheaders() drops Authorization in FastCGI/CGI mode — fall back to $_SERVER
if (!$hasAuth) {
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers[] = 'Authorization: ' . $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
}

$body = file_get_contents('php://input');

$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
if (!empty($body)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false || $httpCode === 0) {
    // Try to restart Node.js and retry once
    $startScript = '/home/u616274976/domains/capilarshopping-com-622134.hostingersite.com/nodejs/start_api.sh';
    if (is_executable($startScript)) {
        shell_exec('bash ' . $startScript . ' > /dev/null 2>&1 &');
        sleep(3);

        $ch2 = curl_init($targetUrl);
        curl_setopt($ch2, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, $headers);
        if (!empty($body)) {
            curl_setopt($ch2, CURLOPT_POSTFIELDS, $body);
        }
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_HEADER, true);
        curl_setopt($ch2, CURLOPT_FOLLOWLOCATION, false);
        curl_setopt($ch2, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch2, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch2);
        $httpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        $headerSize = curl_getinfo($ch2, CURLINFO_HEADER_SIZE);
        curl_close($ch2);
    }
}

if ($response === false || $httpCode === 0) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode(['statusCode' => 503, 'message' => 'API backend unavailable']);
    exit;
}

$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

http_response_code($httpCode);

$skipHeaders = [
    'transfer-encoding', 'connection',
    'access-control-allow-origin', 'access-control-allow-methods',
    'access-control-allow-headers', 'access-control-allow-credentials',
    'access-control-max-age',
];
foreach (explode("\r\n", $responseHeaders) as $header) {
    if (empty($header) || strpos($header, 'HTTP/') === 0) { continue; }
    $headerName = strtolower(explode(':', $header, 2)[0]);
    if (!in_array($headerName, $skipHeaders)) {
        header($header, false);
    }
}

echo $responseBody;

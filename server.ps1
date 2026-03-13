$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://192.168.1.9:8080/")
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()

Write-Host "Server running at http://192.168.1.9:8080/ (accessible from your phone on the same Wi-Fi)"
Write-Host "Press Ctrl+C to stop"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath.TrimStart("/")
        if ([string]::IsNullOrEmpty($path)) { $path = "index.html" }
        
        # Adjust path to handle files placed outside root by parsing URL correctly
        # The images are one directory up sometimes so we handle it gracefully, but usually it's in root.
        $targetFile = Join-Path (Get-Location).Path $path

        # If file not found in current dir but it's ezgif, it might be in parent
        if ((Test-Path $targetFile) -eq $false -and $path.StartsWith("ezgif-frame")) {
             $targetFile = Join-Path (Get-Location).Path "..\$path"
        }
        
        if (Test-Path $targetFile -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($targetFile)
            $response.ContentLength64 = $bytes.Length
            
            if ($targetFile -match '\.html$') { $response.ContentType = 'text/html' }
            elseif ($targetFile -match '\.css$') { $response.ContentType = 'text/css' }
            elseif ($targetFile -match '\.js$') { $response.ContentType = 'application/javascript' }
            elseif ($targetFile -match '\.jpg$') { $response.ContentType = 'image/jpeg' }
            elseif ($targetFile -match '\.png$') { $response.ContentType = 'image/png' }
            
            $response.StatusCode = 200
            $stream = $response.OutputStream
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} catch {
    Write-Host "Error: $_"
} finally {
    $listener.Stop()
}

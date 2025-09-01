# Simple HTTP Server using PowerShell
$port = 8080
$url = "http://localhost:$port/"

Write-Host "Starting HTTP Server on $url"
Write-Host "Press Ctrl+C to stop the server"

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host "Server started. Open your browser and navigate to:"
Write-Host "$url" -ForegroundColor Green
Write-Host "${url}index.html" -ForegroundColor Green
Write-Host "${url}test-login.html" -ForegroundColor Green

try {
    while ($listener.IsListening) {
        # Wait for a request
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get the requested file path
        $requestedPath = $request.Url.LocalPath
        if ($requestedPath -eq "/") {
            $requestedPath = "/index.html"
        }
        
        $filePath = Join-Path (Get-Location) $requestedPath.TrimStart('/')
        
        Write-Host "Request: $($request.HttpMethod) $($request.Url.LocalPath)" -ForegroundColor Yellow
        
        if (Test-Path $filePath -PathType Leaf) {
            # File exists, serve it
            $content = Get-Content $filePath -Raw -Encoding UTF8
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            
            # Set content type based on file extension
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css" { $response.ContentType = "text/css; charset=utf-8" }
                ".js" { $response.ContentType = "application/javascript; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                default { $response.ContentType = "text/plain; charset=utf-8" }
            }
            
            $response.ContentLength64 = $buffer.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            # File not found
            $notFoundMessage = "404 - File Not Found: $requestedPath"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFoundMessage)
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $buffer.Length
            $response.StatusCode = 404
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            Write-Host "File not found: $filePath" -ForegroundColor Red
        }
        
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
    Write-Host "Server stopped."
}
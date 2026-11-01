$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = if ($env:PORT) { [int]$env:PORT } else { 8080 }
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "FAO Schwarz concept running at http://localhost:$port/"
Write-Host "Press Ctrl+C to stop."

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()

    try {
      $relative = $context.Request.Url.LocalPath.TrimStart("/")

      if ([string]::IsNullOrWhiteSpace($relative)) {
        $relative = "index.html"
      }

      $relative = $relative -replace "/", "\"
      $file = Join-Path $root $relative
      $resolved = [System.IO.Path]::GetFullPath($file)

      if (-not $resolved.StartsWith([System.IO.Path]::GetFullPath($root), [System.StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $resolved -PathType Leaf)) {
        $context.Response.StatusCode = 404
        $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
        $context.Response.ContentType = "text/plain; charset=utf-8"
        $context.Response.ContentLength64 = $body.Length
        if ($context.Request.HttpMethod -ne "HEAD") {
          $context.Response.OutputStream.Write($body, 0, $body.Length)
        }
        $context.Response.Close()
        continue
      }

      $extension = [System.IO.Path]::GetExtension($resolved).ToLowerInvariant()
      $contentType = switch ($extension) {
        ".html" { "text/html; charset=utf-8" }
        ".css"  { "text/css; charset=utf-8" }
        ".js"   { "application/javascript; charset=utf-8" }
        ".jpg"  { "image/jpeg" }
        ".jpeg" { "image/jpeg" }
        ".png"  { "image/png" }
        ".webp" { "image/webp" }
        ".svg"  { "image/svg+xml" }
        ".ico"  { "image/x-icon" }
        ".pdf"  { "application/pdf" }
        ".txt"  { "text/plain; charset=utf-8" }
        default { "application/octet-stream" }
      }

      $bytes = [System.IO.File]::ReadAllBytes($resolved)
      $context.Response.ContentType = $contentType
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.Headers["Cache-Control"] = "no-cache"

      if ($context.Request.HttpMethod -ne "HEAD") {
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      }

      $context.Response.Close()
    }
    catch {
      Write-Host "Request error: $($_.Exception.Message)"
      try { $context.Response.Abort() } catch { }
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}

$root = $PSScriptRoot
# 自动探测默认首页（优先 首页.html，其次第一个 html）
$defaultPage = '首页.html'
if (-not (Test-Path (Join-Path $root $defaultPage) -PathType Leaf)) {
  $first = Get-ChildItem $root -Filter '*.html' | Select-Object -First 1
  if ($first) { $defaultPage = $first.Name }
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8765/')
$listener.Start()
Write-Host "Serving $root on http://localhost:8765/"
Write-Host "Default page: $defaultPage"

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $raw = $req.Url.AbsolutePath
    $path = [System.Uri]::UnescapeDataString($raw)
    if ($path -eq '/' -or $path -eq '') { $path = '/' + $defaultPage }
    $file = Join-Path $root $path.TrimStart('/')
    if (Test-Path $file -PathType Leaf) {
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $mime = switch ($ext) {
        '.html' { 'text/html; charset=utf-8' }
        '.css'  { 'text/css; charset=utf-8' }
        '.js'   { 'application/javascript; charset=utf-8' }
        '.png'  { 'image/png' }
        '.jpg'  { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.svg'  { 'image/svg+xml' }
        '.ico'  { 'image/x-icon' }
        default { 'application/octet-stream' }
      }
      $bytes = [IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentType = $mime
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      Write-Host "404: $file"
    }
    $ctx.Response.Close()
  } catch { Write-Host $_.Exception.Message }
}
$ErrorActionPreference = "Stop"

$BaseUrl = if ($args.Count -gt 0) { $args[0] } else { "http://127.0.0.1:8080" }

Invoke-RestMethod "$BaseUrl/healthz" | Out-Null
$home = Invoke-WebRequest "$BaseUrl/" -UseBasicParsing
if ($home.Content -notmatch "Muhammad Kashif") {
  throw "Smoke test failed: home page did not contain expected portfolio name."
}

Write-Output "Smoke test passed for $BaseUrl"

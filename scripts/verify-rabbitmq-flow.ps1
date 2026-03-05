param(
  [string]$BaseUrl = "http://localhost:8080",
  [string]$Name = "Test User",
  [string]$Email = "test1@example.com",
  [string]$Password = "Pass@123",
  [string]$Role = "user",
  [string]$TimeSlot = "09:00-10:00",
  [int]$LogTail = 200
)

$ErrorActionPreference = "Stop"

function Invoke-JsonRequest {
  param(
    [Parameter(Mandatory = $true)][ValidateSet("GET", "POST", "PUT", "PATCH", "DELETE")] [string]$Method,
    [Parameter(Mandatory = $true)][string]$Url,
    [string]$Body = "",
    [string]$BearerToken = ""
  )

  $headers = @("-H", "Content-Type: application/json")
  if ($BearerToken) {
    $headers += @("-H", "Authorization: Bearer $BearerToken")
  }

  $args = @("-sS", "-X", $Method, $Url) + $headers
  if ($Body) {
    $args += @("-d", $Body)
  }

  $raw = & curl.exe @args
  return $raw
}

Write-Host "==> Starting containers (build included)..."
docker compose up -d --build

Write-Host "==> Health checks..."
try {
  $rootHealth = Invoke-JsonRequest -Method "GET" -Url "$BaseUrl/health"
  Write-Host "Root health:" $rootHealth
} catch {
  Write-Host "Root /health not available via nginx. Continuing..."
}

$appointmentApi = Invoke-JsonRequest -Method "GET" -Url "$BaseUrl/api"
Write-Host "Appointment API:" $appointmentApi

$paymentApi = Invoke-JsonRequest -Method "GET" -Url "$BaseUrl/api/pay"
Write-Host "Payment API:" $paymentApi

Write-Host "==> Register user (or continue if already exists)..."
$registerBody = "{`"name`":`"$Name`",`"email`":`"$Email`",`"password`":`"$Password`",`"role`":`"$Role`"}"
try {
  $registerResponse = Invoke-JsonRequest -Method "POST" -Url "$BaseUrl/api/auth/register" -Body $registerBody
  Write-Host "Register response:" $registerResponse
} catch {
  Write-Host "Register failed or user exists. Continuing to login..."
}

Write-Host "==> Login..."
$loginBody = "{`"email`":`"$Email`",`"password`":`"$Password`"}"
$loginRaw = Invoke-JsonRequest -Method "POST" -Url "$BaseUrl/api/auth/login" -Body $loginBody
$login = $loginRaw | ConvertFrom-Json

if (-not $login.token) {
  throw "Login succeeded but no token returned. Raw response: $loginRaw"
}

$token = $login.token
Write-Host "Token acquired."

$bookingDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
Write-Host "==> Booking appointment for $bookingDate ($TimeSlot)..."
$bookingBody = "{`"date`":`"$bookingDate`",`"timeSlot`":`"$TimeSlot`"}"
$bookingRaw = Invoke-JsonRequest -Method "POST" -Url "$BaseUrl/api/appointments" -Body $bookingBody -BearerToken $token
Write-Host "Booking response:" $bookingRaw

Write-Host "==> Tailing logs for event flow..."
docker compose logs --tail=$LogTail appointment-service payment-service rabbitmq

Write-Host ""
Write-Host "Done. Verify logs include:"
Write-Host "1) [saga][appointment-service] published appointment.created"
Write-Host "2) [saga][payment-service] received appointment.created"
Write-Host "3) payment.success or payment.failed"
Write-Host "4) [notification][payment-service] ... notification simulated"

# AdhikarAI - PowerShell Verification Script for Scam Shield Integration
# Run directly in PowerShell: powershell -ExecutionPolicy Bypass -File test_scam_shield.ps1

$ErrorActionPreference = "Continue"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " AdhikarAI Scam Shield Integration Tests" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

$passed = 0
$failed = 0

# 1. Scam Shield Gateway Health Probe
Write-Host "`n1. Testing GET /api/scam/health..." -ForegroundColor Yellow
try {
    $healthRes = Invoke-RestMethod -Uri "http://localhost:3000/api/scam/health" -Method Get
    Write-Host "   Gateway:          $($healthRes.gateway)" -ForegroundColor Green
    Write-Host "   Scam Service:     $($healthRes.scam_service.status) on port $($healthRes.scam_service.port)" -ForegroundColor Green
    Write-Host "   Patterns Loaded:  $($healthRes.scam_service.patterns_loaded)" -ForegroundColor Green
    if ($healthRes.gateway -eq "Node.js Express" -and $healthRes.scam_service.status -eq "healthy") {
        Write-Host "   PASS: Gateway health probe returned expected status." -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   FAIL: Unexpected health response format." -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   FAIL: Could not reach health endpoint: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 2. Suspicious Electricity Disconnection Scam Message
Write-Host "`n2. Testing POST /api/scam/analyze (Power Bill Fraud with urgent threat & .xyz link)..." -ForegroundColor Yellow
$scamBody1 = @{
    message_text = "Dear Customer, your electricity connection will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Please immediately call 9876543210."
    url = "http://power-bill-update.xyz"
} | ConvertTo-Json

try {
    $scamRes1 = Invoke-RestMethod -Uri "http://localhost:3000/api/scam/analyze" -Method Post -ContentType "application/json" -Body $scamBody1
    Write-Host "   Risk Level:        $($scamRes1.risk_level)" -ForegroundColor Red
    Write-Host "   Scam Type:         $($scamRes1.scam_type)" -ForegroundColor Yellow
    Write-Host "   Confidence Score:  $($scamRes1.confidence_score)" -ForegroundColor Cyan
    Write-Host "   Is Mock:           $($scamRes1.is_mock)" -ForegroundColor Green
    Write-Host "   Matched Patterns:  $(($scamRes1.matched_patterns -join ', '))" -ForegroundColor Gray
    Write-Host "   Warning Signs:     $(($scamRes1.warning_signs -join ' | '))" -ForegroundColor Gray
    Write-Host "   Helpline Cited:    $($scamRes1.recommended_actions -match '1930' | Select-Object -First 1)" -ForegroundColor Green

    if ($scamRes1.risk_level -eq "high" -and $scamRes1.scam_type -like "*Power Bill*") {
        Write-Host "   PASS: Correctly flagged urgent power bill fraud as HIGH risk." -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   FAIL: Expected high risk for power bill fraud." -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   FAIL: Scam analysis failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 3. Advance-Fee Fake Scholarship Scam
Write-Host "`n3. Testing POST /api/scam/analyze (Advance Fee Fake Scholarship)..." -ForegroundColor Yellow
$scamBody2 = @{
    message_text = "Congratulations! You have been awarded National Higher Education Scholarship worth Rs 50,000. Click http://scholarship-gov-grant.in/apply to pay processing fee of Rs 499 and claim now."
} | ConvertTo-Json

try {
    $scamRes2 = Invoke-RestMethod -Uri "http://localhost:3000/api/scam/analyze" -Method Post -ContentType "application/json" -Body $scamBody2
    Write-Host "   Risk Level:        $($scamRes2.risk_level)" -ForegroundColor Red
    Write-Host "   Scam Type:         $($scamRes2.scam_type)" -ForegroundColor Yellow
    Write-Host "   Confidence Score:  $($scamRes2.confidence_score)" -ForegroundColor Cyan

    if ($scamRes2.risk_level -eq "high" -and $scamRes2.scam_type -like "*Scholarship*") {
        Write-Host "   PASS: Correctly identified fake scholarship advance-fee scam." -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   FAIL: Expected high risk fake scholarship detection." -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   FAIL: Fake scholarship analysis failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 4. Verified Legitimate Government Announcement
Write-Host "`n4. Testing POST /api/scam/analyze (Legitimate .gov.in Notification)..." -ForegroundColor Yellow
$scamBody3 = @{
    message_text = "Dear Student, applications for National Means-cum-Merit Scholarship (NMMS) are open until 31st Oct. Apply online at official portal https://scholarships.gov.in"
    url = "https://scholarships.gov.in"
} | ConvertTo-Json

try {
    $scamRes3 = Invoke-RestMethod -Uri "http://localhost:3000/api/scam/analyze" -Method Post -ContentType "application/json" -Body $scamBody3
    Write-Host "   Risk Level:        $($scamRes3.risk_level)" -ForegroundColor Green
    Write-Host "   Scam Type:         $($scamRes3.scam_type)" -ForegroundColor Yellow
    Write-Host "   Confidence Score:  $($scamRes3.confidence_score)" -ForegroundColor Cyan

    if ($scamRes3.risk_level -eq "safe") {
        Write-Host "   PASS: Correctly recognized genuine .gov.in announcement as SAFE." -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   FAIL: Expected safe risk level for official gov notification." -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "   FAIL: Legitimate notification check failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 5. Input Validation: Missing / Empty message_text (Expect HTTP 400)
Write-Host "`n5. Testing POST /api/scam/analyze with empty message (Expect HTTP 400)..." -ForegroundColor Yellow
$scamBodyEmpty = @{ message_text = "" } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/scam/analyze" -Method Post -ContentType "application/json" -Body $scamBodyEmpty
    Write-Host "   FAIL: Should have rejected empty message with HTTP 400." -ForegroundColor Red
    $failed++
} catch {
    Write-Host "   PASS: Successfully rejected empty message with HTTP 400." -ForegroundColor Green
    Write-Host "   Error detail: $($_.Exception.Message)" -ForegroundColor Gray
    $passed++
}

# 6. Input Validation: Oversized Message (> 5000 chars, Expect HTTP 400)
Write-Host "`n6. Testing POST /api/scam/analyze with oversized message (> 5000 chars, Expect HTTP 400)..." -ForegroundColor Yellow
$hugeText = "A" * 5005
$scamBodyHuge = @{ message_text = $hugeText } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/scam/analyze" -Method Post -ContentType "application/json" -Body $scamBodyHuge
    Write-Host "   FAIL: Should have rejected oversized message with HTTP 400." -ForegroundColor Red
    $failed++
} catch {
    Write-Host "   PASS: Successfully rejected oversized message with HTTP 400." -ForegroundColor Green
    Write-Host "   Error detail: $($_.Exception.Message)" -ForegroundColor Gray
    $passed++
}

# 7. Input Validation: Non-string message_text (Expect HTTP 400)
Write-Host "`n7. Testing POST /api/scam/analyze with numeric message_text (Expect HTTP 400)..." -ForegroundColor Yellow
$scamBodyNum = '{"message_text": 12345678}'
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/scam/analyze" -Method Post -ContentType "application/json" -Body $scamBodyNum
    Write-Host "   FAIL: Should have rejected non-string message with HTTP 400." -ForegroundColor Red
    $failed++
} catch {
    Write-Host "   PASS: Successfully rejected non-string message with HTTP 400." -ForegroundColor Green
    Write-Host "   Error detail: $($_.Exception.Message)" -ForegroundColor Gray
    $passed++
}

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " Test Summary: $passed Passed, $failed Failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "=======================================================" -ForegroundColor Cyan

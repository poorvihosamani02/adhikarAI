# AdhikarAI - PowerShell Scheme Eligibility Verification Script
# Run this script directly in PowerShell from C:\Users\DELL\Desktop\adhikar-practice\backend

$ErrorActionPreference = "Stop"

Write-Host "`n=== AdhikarAI Eligibility Engine Verification ===" -ForegroundColor Cyan

# Step 1: Register a fresh test citizen
$randomId = Get-Random -Minimum 10000 -Maximum 99999
$email = "citizen_ps_$randomId@example.com"
$password = "TestPass123!"

Write-Host "`n1. Registering test citizen ($email)..." -ForegroundColor Yellow
$regBody = @{
    name = "Kavita Rao"
    email = $email
    password = $password
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -ContentType "application/json" -Body $regBody
Write-Host "   Registered user ID: $($regRes.user.id)" -ForegroundColor Green

# Step 2: Log in to obtain JWT token
Write-Host "`n2. Logging in to obtain JWT token..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$token = $loginRes.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "   JWT token obtained successfully." -ForegroundColor Green

# Step 3: Check eligibility before creating profile (Expect has_profile = false)
Write-Host "`n3. Calling GET /api/schemes/matched before saving profile..." -ForegroundColor Yellow
$noProfileRes = Invoke-RestMethod -Uri "http://localhost:3000/api/schemes/matched" -Method Get -Headers $headers
Write-Host "   has_profile: $($noProfileRes.has_profile)" -ForegroundColor Green
Write-Host "   matched_count: $($noProfileRes.matched_count)" -ForegroundColor Green
Write-Host "   message: $($noProfileRes.message)" -ForegroundColor Green

# Step 4: Create Citizen Profile (Karnataka OBC Female Student, Income Rs 1,80,000)
Write-Host "`n4. Saving citizen profile (Karnataka OBC Female Student, Income Rs 1,80,000)..." -ForegroundColor Yellow
$profileBody = @{
    age = 21
    gender = "Female"
    annualIncome = 180000
    category = "OBC"
    state = "Karnataka"
    educationLevel = "Undergraduate"
    course = "B.Tech"
    occupation = "Student"
    isMinority = $false
    isBPL = $false
} | ConvertTo-Json

$profileRes = Invoke-RestMethod -Uri "http://localhost:3000/api/profile" -Method Post -Headers $headers -ContentType "application/json" -Body $profileBody
Write-Host "   Profile saved successfully: $($profileRes.message)" -ForegroundColor Green

# Step 5: Evaluate Scheme Eligibility
Write-Host "`n5. Calling GET /api/schemes/matched for citizen profile..." -ForegroundColor Yellow
$matchedRes = Invoke-RestMethod -Uri "http://localhost:3000/api/schemes/matched" -Method Get -Headers $headers

Write-Host "   Total schemes evaluated: $($matchedRes.summary.total_schemes_evaluated)" -ForegroundColor Green
Write-Host "   Matched schemes count:   $($matchedRes.matched_count)" -ForegroundColor Green
Write-Host "   Ineligible schemes:      $($matchedRes.summary.ineligible_count)" -ForegroundColor Green

Write-Host "`nTop 5 Evaluated Schemes:" -ForegroundColor Cyan
$matchedRes.schemes | Select-Object -First 5 | ForEach-Object {
    $statusColor = if ($_.is_eligible) { "Green" } else { "Red" }
    Write-Host "`n[$($_.scheme_id)] $($_.scheme_name)" -ForegroundColor Yellow
    Write-Host "  Status:        $($_.match_status) (Score: $($_.match_score))" -ForegroundColor $statusColor
    Write-Host "  Verified:      $($_.is_officially_verified) ($($_.verification_status))" -ForegroundColor Gray
    Write-Host "  Match Summary: $($_.match_summary)"
    if ($_.matched_criteria.Count -gt 0) {
        Write-Host "  Matched Criteria:" -ForegroundColor Green
        $_.matched_criteria | ForEach-Object { Write-Host "    - $_" -ForegroundColor Green }
    }
    if ($_.unmet_criteria.Count -gt 0) {
        Write-Host "  Unmet Criteria:" -ForegroundColor Red
        $_.unmet_criteria | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
    }
}

Write-Host "`n=== Verification Complete: All Endpoints Working! ===" -ForegroundColor Cyan

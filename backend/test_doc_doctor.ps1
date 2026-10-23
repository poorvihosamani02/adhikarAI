# AdhikarAI Document Doctor API Integration Tests

Write-Host "=== TEST 1: Health Check ===" -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri "http://localhost:3000/api/documents/health" -Method Get
Write-Host "Gateway: $($health.gateway), Service: $($health.doc_service.service), Rules: $($health.doc_service.rules_loaded)" -ForegroundColor Green

Write-Host "`n=== TEST 2: Valid Aadhaar Verification ===" -ForegroundColor Cyan
$validBody = @{
    scheme_id = "GOV001"
    document_type = "Identity proof"
    document_name = "Aadhaar"
    file_name = "citizen_aadhaar.pdf"
    file_size_kb = 240
    user_notes = "Testing Aadhaar verification for scholarship"
} | ConvertTo-Json

$resValid = Invoke-RestMethod -Uri "http://localhost:3000/api/documents/check" -Method Post -ContentType "application/json" -Body $validBody
Write-Host "Rule ID: $($resValid.rule_id)" -ForegroundColor Green
Write-Host "Authority: $($resValid.issuing_authority)" -ForegroundColor Green
Write-Host "Extracted Fields Count: $(($resValid.extracted_fields.psobject.properties | Measure-Object).Count)" -ForegroundColor Green
Write-Host "Validation Checks: $($resValid.validation_checks.Count)" -ForegroundColor Green

Write-Host "`n=== TEST 3: Unsupported File Extension (.exe) ===" -ForegroundColor Cyan
$badExtBody = @{
    document_type = "Identity proof"
    document_name = "Aadhaar"
    file_name = "malicious_payload.exe"
    file_size_kb = 120
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/documents/check" -Method Post -ContentType "application/json" -Body $badExtBody
    Write-Host "FAIL: Should have rejected .exe" -ForegroundColor Red
} catch {
    Write-Host "PASS: Successfully rejected .exe: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n=== TEST 4: Empty File (0 KB) ===" -ForegroundColor Cyan
$emptyBody = @{
    document_type = "Identity proof"
    document_name = "Aadhaar"
    file_name = "empty_file.pdf"
    file_size_kb = 0
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/documents/check" -Method Post -ContentType "application/json" -Body $emptyBody
    Write-Host "FAIL: Should have rejected 0 KB file" -ForegroundColor Red
} catch {
    Write-Host "PASS: Successfully rejected 0 KB file: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n=== TEST 5: Oversized File (6000 KB > 5MB limit) ===" -ForegroundColor Cyan
$oversizedBody = @{
    document_type = "Identity proof"
    document_name = "Aadhaar"
    file_name = "huge_scan.pdf"
    file_size_kb = 6000
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/documents/check" -Method Post -ContentType "application/json" -Body $oversizedBody
    Write-Host "FAIL: Should have rejected oversized file" -ForegroundColor Red
} catch {
    Write-Host "PASS: Successfully rejected oversized file: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n=== ALL TESTS FINISHED ===" -ForegroundColor Cyan

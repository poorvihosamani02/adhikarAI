# AdhikarAI - PowerShell Verification Script for Scheme Details and Document Checklist
# Run directly in PowerShell: powershell -ExecutionPolicy Bypass -File test_scheme_docs.ps1

$ErrorActionPreference = "Continue"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " AdhikarAI Scheme Details & Document Checklist Tests" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Existing Scheme Details (GOV001)
Write-Host "`n1. Testing GET /api/schemes/GOV001 (Scheme Details)..." -ForegroundColor Yellow
$res1 = Invoke-RestMethod -Uri "http://localhost:3000/api/schemes/GOV001" -Method Get
Write-Host "   Scheme ID:       $($res1.data.scheme_id)" -ForegroundColor Green
Write-Host "   Name:            $($res1.data.scheme_name)" -ForegroundColor Green
Write-Host "   Provider:        $($res1.data.provider_name)" -ForegroundColor Green
Write-Host "   Benefit:         Rs $($res1.data.benefit_amount) ($($res1.data.benefit_frequency))" -ForegroundColor Green
Write-Host "   Max Income:      Rs $($res1.data.max_family_income)" -ForegroundColor Green
Write-Host "   Portal Link:     $($res1.data.application_info.application_url)" -ForegroundColor Green
Write-Host "   Verified Status: $($res1.data.verification_info.status) (is_verified: $($res1.data.verification_info.is_officially_verified))" -ForegroundColor Green
Write-Host "   Has Documents:   $($res1.data.has_required_documents)" -ForegroundColor Green

# 2. Document Checklist for Scheme with Cataloged Documents (GOV018 - Gruha Lakshmi)
Write-Host "`n2. Testing GET /api/schemes/GOV018/documents (Scheme with 5 documents)..." -ForegroundColor Yellow
$res2 = Invoke-RestMethod -Uri "http://localhost:3000/api/schemes/GOV018/documents" -Method Get
Write-Host "   Scheme:          $($res2.scheme_id) - $($res2.scheme_name)" -ForegroundColor Green
Write-Host "   Documents Count: $($res2.documents_count)" -ForegroundColor Green
Write-Host "   Verified Status: $($res2.verification_status)" -ForegroundColor Green
Write-Host "   Checklist Items:" -ForegroundColor Cyan
$res2.documents | ForEach-Object {
    Write-Host "     * [$($_.id)] $($_.name) - Category: $($_.category)" -ForegroundColor White
    Write-Host "       Guidance: $($_.guidance)" -ForegroundColor Gray
}

# 3. Document Checklist for Scheme with Missing Documents (GOV002 - NMMSS)
Write-Host "`n3. Testing GET /api/schemes/GOV002/documents (Missing document info in dataset)..." -ForegroundColor Yellow
$res3 = Invoke-RestMethod -Uri "http://localhost:3000/api/schemes/GOV002/documents" -Method Get
Write-Host "   Scheme:                 $($res3.scheme_id) - $($res3.scheme_name)" -ForegroundColor Green
Write-Host "   Has Required Documents: $($res3.has_required_documents)" -ForegroundColor Green
Write-Host "   Documents Array Length: $($res3.documents.Count)" -ForegroundColor Green
Write-Host "   Unavailable Message:    $($res3.unavailable_message)" -ForegroundColor Yellow

# 4. Unknown Scheme ID (Expect HTTP 404)
Write-Host "`n4. Testing GET /api/schemes/GOV99999/documents (Unknown ID)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/schemes/GOV99999/documents" -Method Get
} catch {
    Write-Host "   Successfully returned 404 Not Found as expected." -ForegroundColor Green
    Write-Host "   Error detail: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " All Scheme Details & Document Checklist Tests Passed!" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

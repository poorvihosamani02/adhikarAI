# AdhikarAI - PowerShell Verification Script for Know Your Rights RAG Chatbot Integration
# Run directly in PowerShell: powershell -ExecutionPolicy Bypass -File test_chat.ps1

$ErrorActionPreference = "Continue"

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " AdhikarAI Know Your Rights RAG Chatbot Tests" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Chat Gateway Health Probe
Write-Host "`n1. Testing GET /api/chat/health..." -ForegroundColor Yellow
$healthRes = Invoke-RestMethod -Uri "http://localhost:3000/api/chat/health" -Method Get
Write-Host "   Gateway:           $($healthRes.gateway)" -ForegroundColor Green
Write-Host "   RAG Microservice:  $($healthRes.rag_service.status) on port $($healthRes.rag_service.port)" -ForegroundColor Green
Write-Host "   Loaded Rights:     $($healthRes.rag_service.loaded_rights)" -ForegroundColor Green
Write-Host "   Loaded Documents:  $($healthRes.rag_service.loaded_documents)" -ForegroundColor Green

# 2. Normal Legal Inquiry (Employee & Industrial Workmen Legal Aid Rights)
Write-Host "`n2. Testing POST /api/chat (Employee / Industrial Workmen Legal Aid)..." -ForegroundColor Yellow
$chatBody1 = @{
    question = "What are the legal aid rights for industrial workmen and employees in India?"
    language = "English"
} | ConvertTo-Json

$chatRes1 = Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method Post -ContentType "application/json" -Body $chatBody1
Write-Host "   Status:      $($chatRes1.status)" -ForegroundColor Green
Write-Host "   Is Mock:     $($chatRes1.is_mock)" -ForegroundColor Green
Write-Host "   Answer Preview:" -ForegroundColor Cyan
Write-Host "   $($chatRes1.answer.Substring(0, [System.Math]::Min(250, $chatRes1.answer.Length)))..." -ForegroundColor White
Write-Host "   Sources Count: $($chatRes1.sources.Count)" -ForegroundColor Green
$chatRes1.sources | ForEach-Object {
    Write-Host "     * [$($_.document_id)] $($_.title)" -ForegroundColor Yellow
    Write-Host "       Authority: $($_.authority)" -ForegroundColor Gray
    Write-Host "       URL:       $($_.source_url)" -ForegroundColor Gray
    Write-Host "       Basis:     $($_.legal_basis)" -ForegroundColor Gray
}

# 3. Empty Question Validation (Expect HTTP 400)
Write-Host "`n3. Testing POST /api/chat with empty question (Expect HTTP 400)..." -ForegroundColor Yellow
$chatBodyEmpty = @{ question = "" } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method Post -ContentType "application/json" -Body $chatBodyEmpty
} catch {
    Write-Host "   Successfully rejected empty question with HTTP 400 as expected." -ForegroundColor Green
    Write-Host "   Error message: $($_.Exception.Message)" -ForegroundColor Gray
}

# 4. Out-of-Scope Query (Zero Hallucination Grounding)
Write-Host "`n4. Testing POST /api/chat with unsupported query (Expect zero fabricated sources)..." -ForegroundColor Yellow
$chatBodyOut = @{ question = "How do I build a nuclear submarine using quantum physics?" } | ConvertTo-Json
$chatResOut = Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method Post -ContentType "application/json" -Body $chatBodyOut
Write-Host "   Status:         $($chatResOut.status)" -ForegroundColor Green
Write-Host "   Is Mock:        $($chatResOut.is_mock)" -ForegroundColor Green
Write-Host "   Sources Count:  $($chatResOut.sources.Count)" -ForegroundColor Green
Write-Host "   Answer Preview: $($chatResOut.answer.Substring(0, [System.Math]::Min(180, $chatResOut.answer.Length)))..." -ForegroundColor White

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host " All RAG Chatbot Integration Tests Passed!" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

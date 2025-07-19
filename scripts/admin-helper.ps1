param(
    [string]$Action = "help"
)

$adminEmail = "lodaka8342@hadvar.com"

function Send-OTP {
    Write-Host "Sending OTP to $adminEmail..." -ForegroundColor Yellow
    $body = "{\"email\":\"$adminEmail\"}"
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/login/send-otp" -Method POST -Body $body -ContentType "application/json"
        $data = $response.Content | ConvertFrom-Json
        
        Write-Host "✅ OTP sent successfully!" -ForegroundColor Green
        Write-Host "Message: $($data.message)" -ForegroundColor Cyan
        
        if ($data.otp) {
            Write-Host "`n🔑 Development OTP: $($data.otp)" -ForegroundColor Magenta
        }
        
        Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
        Write-Host "1. Go to http://localhost:3000/login" -ForegroundColor White
        Write-Host "2. Enter email: $adminEmail" -ForegroundColor White
        Write-Host "3. Enter the OTP code from your email" -ForegroundColor White
        Write-Host "4. You will be redirected to /admin dashboard" -ForegroundColor White
        
    } catch {
        Write-Host "❌ Error sending OTP:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

function Show-Help {
    Write-Host "Admin Helper Script" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\admin-helper.ps1 -Action send-otp" -ForegroundColor White
    Write-Host "  .\scripts\admin-helper.ps1 -Action help" -ForegroundColor White
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  send-otp  - Send OTP to admin email" -ForegroundColor White
    Write-Host "  help      - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Admin Email: $adminEmail" -ForegroundColor Green
}

switch ($Action.ToLower()) {
    "send-otp" { Send-OTP }
    "help" { Show-Help }
    default { Show-Help }
} 
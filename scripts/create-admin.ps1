$adminEmail = "lamejoc243@dariolo.com"

Write-Host "Creating admin user..." -ForegroundColor Yellow

$body = @{
    email = $adminEmail
    firstName = "Admin"
    lastName = "User"
    role = "ADMIN"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/register" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "✅ Admin user created successfully!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
    
    Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check your email for the OTP code" -ForegroundColor White
    Write-Host "2. Go to http://localhost:3000/verify" -ForegroundColor White
    Write-Host "3. Enter email: $adminEmail" -ForegroundColor White
    Write-Host "4. Enter the OTP code from your email" -ForegroundColor White
    Write-Host "5. You will be logged in and redirected to /admin dashboard" -ForegroundColor White
    
    if ($response.otp) {
        Write-Host "`n🔑 Development OTP (for testing): $($response.otp)" -ForegroundColor Magenta
    }
    
} catch {
    Write-Host "❌ Error creating admin user:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
} 
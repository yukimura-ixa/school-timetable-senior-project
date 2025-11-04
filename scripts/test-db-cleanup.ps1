# Test Database Cleanup Script
# Stops and removes the PostgreSQL test container

Write-Host "🧹 Cleaning up test database..." -ForegroundColor Cyan

# Stop and remove containers
docker-compose -f docker-compose.test.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Test database stopped and removed!" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Cleanup completed with warnings" -ForegroundColor Yellow
}

# Optionally remove volumes (uncomment to delete all test data)
# Write-Host "`n🗑️  Removing test data volumes..." -ForegroundColor Yellow
# docker-compose -f docker-compose.test.yml down -v
# Write-Host "✅ Test data volumes removed!" -ForegroundColor Green

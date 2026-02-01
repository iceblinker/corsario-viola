$remote_host = "root@138.199.156.62"
Write-Host "🐳 Checking Docker containers..."
ssh -t $remote_host "docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Networks}}'"

Write-Host "🔍 Application Logs:"
ssh -t root@138.199.156.62 'docker logs --tail 20 corsario-viola-corsario-viola-1'

Write-Host "`n🔍 Caddy Logs:"
ssh -t root@138.199.156.62 'docker logs --tail 20 caddy'

Write-Host "`n🔍 Connectivity Check:"
# Using single quotes to prevent PowerShell from interpreting special characters
ssh -t root@138.199.156.62 'docker exec caddy wget -qO- http://corsario-viola-corsario-viola-1:3000'

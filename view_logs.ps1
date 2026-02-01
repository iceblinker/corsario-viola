$remote_host = "root@138.199.156.62"
Write-Host "📜 Fetching logs from VPS..."
ssh -t $remote_host "docker logs corsario-viola-corsario-viola-1 --tail 50"

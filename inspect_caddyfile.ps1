$remote_host = "root@138.199.156.62"
Write-Host "📄 Reading Caddyfile..."
ssh -t $remote_host "cat /etc/caddy/Caddyfile"

$remote_host = "root@138.199.156.62"
Write-Host "📜 Tailing Caddy logs... (Press Ctrl+C to stop)"
# Using Invoke-Expression to avoid parser quirks with direct arguments
ssh -t $remote_host "docker logs -f caddy"

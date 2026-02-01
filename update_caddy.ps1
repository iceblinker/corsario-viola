$remote_host = "root@138.199.156.62"
$domain = "corsario.138.199.156.62.sslip.io"

Write-Host "⚙️ Updating Caddyfile for $domain..."

# Use a simplified one-line command to avoid Windows/Linux newline issues
$cmd = "echo '$domain { reverse_proxy localhost:3000 }' >> /etc/caddy/Caddyfile"
$reload_cmd = "docker exec caddy caddy reload 2>/dev/null || systemctl reload caddy 2>/dev/null || docker restart caddy"

ssh -t $remote_host "$cmd && echo '✅ Added config.' && $reload_cmd && echo '🔄 Reloaded Caddy.'"

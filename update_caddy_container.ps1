$remote_host = "root@138.199.156.62"
$container_name = "corsario-viola-corsario-viola-1"

Write-Host "⚙️ Pointing Caddy to $container_name..."

# Using one-liner to avoid line ending issues
$cmd = "sed -i 's/reverse_proxy localhost:3000/reverse_proxy $container_name:3000/g' /etc/caddy/Caddyfile"

# Try all possible names for caddy container
$reload_cmd = "docker exec caddy caddy reload 2>/dev/null || docker exec caddy-stack caddy reload 2>/dev/null || systemctl reload caddy 2>/dev/null || docker restart caddy 2>/dev/null || docker restart caddy-stack 2>/dev/null"

ssh -t $remote_host "$cmd && echo '✅ Config updated.' && $reload_cmd && echo '🔄 Reloaded Caddy.'"

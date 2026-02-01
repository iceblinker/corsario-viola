$remote_host = "root@138.199.156.62"

Write-Host "🔧 Repairing Caddyfile..."

# Define content simpler
$lines = @(
    "vixsrc-addon.servequake.com {",
    "    reverse_proxy vixsrc-addon:3000",
    "}",
    "",
    "corsario.138.199.156.62.sslip.io {",
    "    reverse_proxy corsario-viola-corsario-viola-1:3000",
    "}"
)

# Write to file using Set-Content (safer than pipeline sometimes)
Set-Content -Path "Caddyfile.new" -Value $lines -Encoding Ascii

Write-Host "Please start the SCP transfer..."
scp Caddyfile.new "${remote_host}:/etc/caddy/Caddyfile"

Write-Host "Reloading Caddy..."
# Use a simple string for the command, avoid fancy logic if possible
$cmd = "docker exec caddy caddy reload 2>/dev/null || docker exec caddy-stack caddy reload 2>/dev/null || systemctl reload caddy 2>/dev/null || docker restart caddy"
ssh -t $remote_host $cmd

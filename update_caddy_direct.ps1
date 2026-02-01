$Content = @"
vixsrc-addon.servequake.com {
    reverse_proxy vixsrc-addon:3000
}

corsario.138.199.156.62.sslip.io {
    reverse_proxy corsario-viola-corsario-viola-1:3000
}
"@

Write-Host "Creating local Caddyfile..."
Set-Content -Path "Caddyfile.temp" -Value $Content -Encoding Ascii

Write-Host "Uploading to VPS..."
# Upload to a temporary path on the host first
scp Caddyfile.temp root@138.199.156.62:/tmp/Caddyfile.new

Write-Host "Injecting into Caddy Container..."
# Move from host temp to container /etc/caddy/Caddyfile
ssh -t root@138.199.156.62 "docker cp /tmp/Caddyfile.new caddy:/etc/caddy/Caddyfile"

Write-Host "Reloading Caddy..."
ssh -t root@138.199.156.62 "docker exec caddy caddy reload"

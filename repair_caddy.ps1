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
scp Caddyfile.temp root@138.199.156.62:/etc/caddy/Caddyfile

Write-Host "Restarting Caddy container..."
# Simple restart is often more reliable than exec reload if we are unsure of state
ssh -t root@138.199.156.62 "docker restart caddy"

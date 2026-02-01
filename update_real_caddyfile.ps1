$Content = @"
vixsrc-addon.servequake.com {
    reverse_proxy vixsrc-addon:3000
}

corsario.138.199.156.62.sslip.io {
    reverse_proxy corsario-viola-corsario-viola-1:3000
}
"@

Write-Host "Creating local Caddyfile..."
Set-Content -Path "Caddyfile.final" -Value $Content -Encoding Ascii

Write-Host "Uploading to correct path on VPS (/root/caddy/Caddyfile)..."
scp Caddyfile.final root@138.199.156.62:/root/caddy/Caddyfile

Write-Host "Reloading Caddy..."
ssh -t root@138.199.156.62 "docker exec caddy caddy reload"

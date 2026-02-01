$remote_host = "root@138.199.156.62"

Write-Host "🔍 Inspecting Caddy mounts..."
# Using single quotes for the outer string allows double quotes inside without escaping
ssh -t $remote_host 'docker inspect -f "{{range .Mounts}}{{if eq .Destination \"/etc/caddy/Caddyfile\"}}{{.Source}}{{end}}{{end}}" caddy'

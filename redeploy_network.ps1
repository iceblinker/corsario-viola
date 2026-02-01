$remote_host = "root@138.199.156.62"
$remote_dir = "~/corsario-viola"

Write-Host "🔄 Updating Docker configuration on VPS..."

# 1. Upload updated docker-compose.yml
scp docker-compose.yml "${remote_host}:${remote_dir}/docker-compose.yml"

# 2. Re-up container
ssh -t $remote_host "cd $remote_dir && docker-compose up -d --build"

Write-Host "✅ Network configuration updated. Container restarting..."

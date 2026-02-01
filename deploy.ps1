$ErrorActionPreference = "Stop"
$remote_host = "root@138.199.156.62"
$remote_dir = "~/corsario-viola"
$repo_url = "https://github.com/iceblinker/corsario-viola"

Write-Host "🚀 Starting deployment to $remote_host..."

# 1. Clone or Pull
Write-Host "`n📦 Checking repository on VPS..."
ssh -t $remote_host "
    if [ ! -d '$remote_dir' ]; then 
        echo 'Cloning repository...';
        git clone $repo_url $remote_dir; 
    else 
        echo 'Updating repository...';
        cd $remote_dir;
        git pull;
    fi
"

# 2. Copy .env
Write-Host "`n⚙️ Copying local .env configuration..."
scp .env "${remote_host}:${remote_dir}/.env"

# 3. Install & Start
Write-Host "`n🚀 Installing dependencies and starting application..."
# Note: Using 'node local-server.js' via npm start. 
# We try to use PM2 for persistence if available, otherwise just run it.
ssh -t $remote_host "
    cd $remote_dir && \
    npm install && \
    if command -v pm2 &> /dev/null; then
        echo 'Using PM2...';
        pm2 delete corsario-viola 2>/dev/null || true;
        pm2 start npm --name 'corsario-viola' -- start;
        pm2 save;
    else
        echo 'PM2 not found. Running with nohup...';
        nohup npm start > app.log 2>&1 &
        echo 'Application started in background.';
    fi
"

Write-Host "`n✅ Deployment sequence completed."

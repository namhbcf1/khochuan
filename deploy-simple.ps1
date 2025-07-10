# Simple PowerShell deployment script

Write-Output "Deploying KhoChuan POS to Cloudflare..."

# Build frontend
Write-Output "Building frontend..."
Set-Location -Path frontend
npm install
npm run build

# Deploy to Cloudflare Pages
Write-Output "Deploying to Cloudflare Pages..."
wrangler pages publish dist --project-name="khochuan-pos"

# Return to root directory
Set-Location -Path ..

Write-Output "Deployment complete!" 
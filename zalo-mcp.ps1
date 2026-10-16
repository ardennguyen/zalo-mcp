[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [string]$Action,

    [string]$oaPort = "",
    [string]$mcpPort = "",
    [switch]$clean
)

# Ensure execution policy allows running local scripts
Set-ExecutionPolicy Bypass -Scope Process -Force -ErrorAction SilentlyContinue

function Run-Install {
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  Zalo MCP Server - Automatic Installer (Windows)" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host ""

    $installDir = "$PWD\zalo-mcp"
    if (!(Test-Path $installDir)) {
        New-Item -ItemType Directory -Force -Path $installDir | Out-Null
    }

    $baseUrl = "https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main"
    $files = @(
        "package.json",
        "mcp-server.js",
        "README.md",
        ".env.example",
        "zalo-mcp.sh",
        "zalo-mcp.ps1"
    )

    Write-Host "Downloading files into $installDir..."
    foreach ($file in $files) {
        Write-Host "  -> Downloading $file"
        Invoke-WebRequest -Uri "$baseUrl/$file" -OutFile "$installDir\$file" -UseBasicParsing -ErrorAction SilentlyContinue
    }

    Write-Host "`nDownload complete. Starting initialization..." -ForegroundColor Green
    Set-Location -Path $installDir

    if (Test-Path "zalo-mcp.ps1") {
        .\zalo-mcp.ps1 init
    } else {
        Write-Host "Error: zalo-mcp.ps1 was not downloaded correctly." -ForegroundColor Red
        exit 1
    }
}

function Run-Clean {
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  Zalo MCP Server - Clean Environment (Windows)" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "[1/2] Unlinking global zalo-mcp CLI command..." -ForegroundColor Yellow
    npm unlink -g @ardennguyen/zalo-mcp 2>&1 | Out-Null
    Write-Host "Global CLI command unlinked.`n" -ForegroundColor Green

    Write-Host "[2/2] Removing Node.js dependencies (node_modules)..." -ForegroundColor Yellow
    if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
    if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
    if (Test-Path "venv") { Remove-Item -Recurse -Force "venv" }
    if (Test-Path "requirements.txt") { Remove-Item -Force "requirements.txt" }
    Write-Host "Dependencies removed.`n" -ForegroundColor Green
    
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  Cleanup Complete!" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "Your deployment folder is now completely reset."
    Write-Host "Run '.\zalo-mcp.ps1 init' to download fresh dependencies again.`n"
}

function Run-Init {
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  Zalo MCP Server Setup - Windows Initialization" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 1. Check Node.js
    Write-Host "[1/4] Checking Node.js installation..." -ForegroundColor Yellow
    try {
        $nodeVersionOutput = node -v 2>&1
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($nodeVersionOutput)) { throw }
        $nodeVersionString = $nodeVersionOutput -replace 'v', ''
        $nodeMajor = [int]($nodeVersionString -split '\.')[0]
        
        if ($nodeMajor -lt 22) {
            Write-Host "[WARNING] Node.js version is $nodeMajor, but version 22 or higher is required." -ForegroundColor Yellow
        }
        Write-Host "Node.js is ready.`n" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Node.js is not installed or not in your PATH." -ForegroundColor Red
        Write-Host "Please download and install Node.js - version 22 or higher - from: https://nodejs.org/`n"
        exit 1
    }
    
    # 2. Install Node.js dependencies
    if ($clean) {
        Write-Host "[CLEAN] Removing existing node_modules and package-lock.json..." -ForegroundColor Magenta
        if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
        if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
        if (Test-Path "venv") { Remove-Item -Recurse -Force "venv" }
    }
    
    Write-Host "[2/4] Installing Node.js dependencies locally..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install Node.js dependencies. Check your internet connection or npm logs.`n" -ForegroundColor Red
        exit 1
    }
    Write-Host "Node.js dependencies installed successfully.`n" -ForegroundColor Green
    
    # 3. Link global zalo-mcp CLI command
    Write-Host "[3/4] Linking global 'zalo-mcp' CLI command..." -ForegroundColor Yellow
    npm link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Could not link global 'zalo-mcp' command. You can still use 'node mcp-server.js' or 'npm run' inside this folder.`n" -ForegroundColor Yellow
    } else {
        Write-Host "Global 'zalo-mcp' command is now available in PowerShell/CMD!`n" -ForegroundColor Green
    }
    
    # 4. Copy and Configure .env
    Write-Host "[4/4] Setting up environment configuration..." -ForegroundColor Yellow
    if (!(Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env file from .env.example template."
    } else {
        Write-Host ".env file already exists."
    }
    
    $global:oaPort = $oaPort
    $global:mcpPort = $mcpPort
    if ([string]::IsNullOrWhiteSpace($global:oaPort)) {
        $oaPortInput = Read-Host "Enter Zalo OA Webhook Port [default: 3000]"
        $global:oaPort = if ([string]::IsNullOrWhiteSpace($oaPortInput)) { "3000" } else { $oaPortInput }
    }
    
    if ([string]::IsNullOrWhiteSpace($global:mcpPort)) {
        $mcpPortInput = Read-Host "Enter Zalo MCP HTTP Port [default: 3847]"
        $global:mcpPort = if ([string]::IsNullOrWhiteSpace($mcpPortInput)) { "3847" } else { $mcpPortInput }
    }
    
    $envContent = Get-Content ".env"
    if ($envContent -notmatch 'ZALO_OA_WEBHOOK_PORT=') { $envContent += 'ZALO_OA_WEBHOOK_PORT=3000' }
    if ($envContent -notmatch 'ZALO_MCP_HTTP_PORT=') { $envContent += 'ZALO_MCP_HTTP_PORT=3847' }
    
    $envContent = $envContent -replace 'ZALO_OA_WEBHOOK_PORT=.*', "ZALO_OA_WEBHOOK_PORT=$($global:oaPort)" -replace 'ZALO_MCP_HTTP_PORT=.*', "ZALO_MCP_HTTP_PORT=$($global:mcpPort)"
    $envContent | Set-Content ".env"
    
    Write-Host "Configured Zalo OA Webhook Port to: $($global:oaPort)"
    Write-Host "Configured Zalo MCP HTTP Port to: $($global:mcpPort)`n"
    
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  Setup Completed Successfully!" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "`nNext Steps:"
    Write-Host "1. Scan QR code to login your Personal Zalo Account:" -ForegroundColor White
    Write-Host "   zalo-mcp login   (or: npm run login)`n" -ForegroundColor DarkGray
    Write-Host "2. [Optional] Setup your Zalo Official Account:" -ForegroundColor White
    Write-Host "   zalo-mcp oa init --app-id [ID] --secret [KEY]`n" -ForegroundColor DarkGray
    Write-Host "3. Add this server to your Claude Code or Cursor config." -ForegroundColor White
    Write-Host "   Read README.md for details.`n" -ForegroundColor DarkGray
}

function Run-Update {
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  Zalo MCP Server Update - Windows" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host ""

    # Step 1: Self-update this script and mcp-server.js from npm registry
    Write-Host "[1/3] Updating deployment scripts from npm registry..." -ForegroundColor Yellow
    npm install @ardennguyen/zalo-mcp@latest --no-save
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  -> [WARNING] Could not download @ardennguyen/zalo-mcp from npm. (continuing)" -ForegroundColor Yellow
    } else {
        $selfFiles = @("zalo-mcp.ps1", "zalo-mcp.sh", "mcp-server.js", "package.json")
        foreach ($file in $selfFiles) {
            $sourcePath = ".\node_modules\@ardennguyen\zalo-mcp\$file"
            if (Test-Path $sourcePath) {
                Copy-Item $sourcePath ".\$file" -Force
                Write-Host "  -> Updated $file" -ForegroundColor Green
            }
        }
    }
    Write-Host "Scripts updated.`n" -ForegroundColor Green

    # Step 1.5: Ensure .env exists and remove legacy Python artifacts if present
    if (!(Test-Path ".env") -and (Test-Path ".env.example")) {
        Write-Host "Restoring missing .env file from template..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
    }
    if (Test-Path "venv") { Remove-Item -Recurse -Force "venv" }
    if (Test-Path "requirements.txt") { Remove-Item -Force "requirements.txt" }

    # Step 2: Update @ardennguyen/zalo-agent-cli from npm registry
    Write-Host "[2/3] Updating @ardennguyen/zalo-agent-cli from npm registry..." -ForegroundColor Yellow
    npm install @ardennguyen/zalo-agent-cli@latest
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to update @ardennguyen/zalo-agent-cli from npm." -ForegroundColor Red
        exit 1
    }
    Write-Host "@ardennguyen/zalo-agent-cli updated successfully.`n" -ForegroundColor Green

    # Step 3: Refresh global zalo-mcp CLI link
    Write-Host "[3/3] Refreshing global 'zalo-mcp' CLI command link..." -ForegroundColor Yellow
    npm link
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Could not link global 'zalo-mcp' command.`n" -ForegroundColor Yellow
    } else {
        Write-Host "Global 'zalo-mcp' command updated!`n" -ForegroundColor Green
    }

    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  Update completed!" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host ""
}


if ([string]::IsNullOrWhiteSpace($Action)) {
    Write-Host "Usage: .\zalo-mcp.ps1 <command> [options]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  install Install the Zalo MCP Server from GitHub into a new directory"
    Write-Host "  init    Initialize the environment (install Node deps, link CLI, config .env)"
    Write-Host "  update  Update existing Node dependencies and refresh CLI link"
    Write-Host "  clean   Remove all downloaded dependencies (node_modules) and unlink CLI"
    Write-Host ""
    Write-Host "Options (for init):"
    Write-Host "  -clean         Remove existing dependencies before initialization"
    Write-Host "  -oaPort <port> Webhook port for OA (default: 3000)"
    Write-Host "  -mcpPort <port> HTTP port for MCP (default: 3847)"
    exit 1
}

switch ($Action.ToLower()) {
    "install"{ Run-Install }
    "init"   { Run-Init }
    "update" { Run-Update }
    "clean"  { Run-Clean }
    default {
        Write-Host "Unknown command: $Action" -ForegroundColor Red
        Write-Host "Available commands: install, init, update, clean"
        exit 1
    }
}

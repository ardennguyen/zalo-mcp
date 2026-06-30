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
        "requirements.txt",
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
    
    Write-Host "[1/2] Removing Node.js dependencies (node_modules)..." -ForegroundColor Yellow
    if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
    if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
    Write-Host "Node dependencies removed.`n" -ForegroundColor Green
    
    Write-Host "[2/2] Removing Python environment (venv)..." -ForegroundColor Yellow
    if (Test-Path "venv") { Remove-Item -Recurse -Force "venv" }
    Write-Host "Python environment removed.`n" -ForegroundColor Green
    
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
        
        if ($nodeMajor -lt 20) {
            Write-Host "[WARNING] Node.js version is $nodeMajor, but version 20 or higher is recommended." -ForegroundColor Yellow
        }
        Write-Host "Node.js is ready.`n" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Node.js is not installed or not in your PATH." -ForegroundColor Red
        Write-Host "Please download and install Node.js - version 20 or higher - from: https://nodejs.org/`n"
        exit 1
    }
    
    # 2. Install Node.js dependencies
    if ($clean) {
        Write-Host "[CLEAN] Removing existing node_modules and package-lock.json..." -ForegroundColor Magenta
        if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
        if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
    }
    
    Write-Host "[2/4] Installing Node.js dependencies locally..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install Node.js dependencies. Check your internet connection or npm logs.`n" -ForegroundColor Red
        exit 1
    }
    Write-Host "Node.js dependencies installed successfully.`n" -ForegroundColor Green
    
    # 3. Optional Python virtual environment setup
    Write-Host "[3/4] Checking for Python to set up optional reporting environment..." -ForegroundColor Yellow
    try {
        $null = python --version 2>&1
        $pythonFound = $true
    } catch {
        $pythonFound = $false
    }
    
    if ($pythonFound -and $LASTEXITCODE -eq 0) {
        Write-Host "Python detected. Setting up isolated virtual environment [venv]..."
        if ($clean) {
            Write-Host "[CLEAN] Removing existing venv..." -ForegroundColor Magenta
            if (Test-Path "venv") { Remove-Item -Recurse -Force "venv" }
        }
        
        if (!(Test-Path "venv")) {
            python -m venv venv
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[WARNING] Failed to create virtual environment. Continuing without venv." -ForegroundColor Yellow
                $pythonFound = $false
            }
        }
        
        if ($pythonFound) {
            Write-Host "Activating venv and installing Python dependencies..."
            & ".\venv\Scripts\python.exe" -m pip install --upgrade pip | Out-Null
            & ".\venv\Scripts\pip.exe" install -r requirements.txt
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[WARNING] Some python dependencies failed to install." -ForegroundColor Yellow
            }
            Write-Host "Python environment is set up.`n" -ForegroundColor Green
        }
    } else {
        Write-Host "[NOTE] Python was not found on your system." -ForegroundColor DarkGray
        Write-Host "Skipping python virtual environment setup." -ForegroundColor DarkGray
        Write-Host "[This is optional and only required if you run custom Python report scripts. The core Zalo MCP runs fine.]`n" -ForegroundColor DarkGray
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
    Write-Host "   npx zalo-agent login`n" -ForegroundColor DarkGray
    Write-Host "2. [Optional] Setup your Zalo Official Account:" -ForegroundColor White
    Write-Host "   npx zalo-agent oa init --app-id [ID] --secret [KEY]`n" -ForegroundColor DarkGray
    Write-Host "3. Add this server to your Claude Code or Cursor config." -ForegroundColor White
    Write-Host "   Read README.md for details.`n" -ForegroundColor DarkGray
}

function Run-Update {
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  Zalo MCP Server Update - Windows" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "[1/2] Updating Node.js dependencies..." -ForegroundColor Yellow
    npm update
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Failed to run 'npm update'. Running 'npm install' as fallback..." -ForegroundColor Yellow
        npm install
    }
    Write-Host "Node.js packages updated successfully.`n" -ForegroundColor Green
    
    Write-Host "[2/2] Updating Python dependencies (if virtual environment exists)..." -ForegroundColor Yellow
    if (Test-Path "venv") {
        Write-Host "Virtual environment detected. Updating packages..."
        & ".\venv\Scripts\python.exe" -m pip install --upgrade pip | Out-Null
        & ".\venv\Scripts\pip.exe" install --upgrade -r requirements.txt
        Write-Host "Python dependencies updated successfully.`n" -ForegroundColor Green
    } else {
        Write-Host "No python virtual environment found. Skipping python update.`n" -ForegroundColor DarkGray
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
    Write-Host "  init    Initialize the environment (install Node/Python deps, config .env)"
    Write-Host "  update  Update existing Node/Python dependencies"
    Write-Host "  clean   Remove all downloaded dependencies (node_modules, venv)"
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

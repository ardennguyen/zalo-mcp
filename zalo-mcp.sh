#!/bin/bash

# Parse command line arguments
ACTION=$1
shift

OA_PORT=""
MCP_PORT=""
CLEAN_INSTALL="0"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --oa-port) OA_PORT="$2"; shift ;;
        --mcp-port) MCP_PORT="$2"; shift ;;
        --clean) CLEAN_INSTALL="1" ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

run_install() {
    echo "==================================================="
    echo "  Zalo MCP Server - Automatic Installer (macOS/Linux)"
    echo "==================================================="
    echo ""
    
    INSTALL_DIR="$PWD/zalo-mcp"
    mkdir -p "$INSTALL_DIR"
    
    BASE_URL="https://raw.githubusercontent.com/ardennguyen/zalo-mcp/main"
    FILES=(
        "package.json"
        "mcp-server.js"
        "requirements.txt"
        "README.md"
        ".env.example"
        "zalo-mcp.sh"
        "zalo-mcp.ps1"
    )
    
    echo "Downloading files into $INSTALL_DIR..."
    for FILE in "${FILES[@]}"; do
        echo "  -> Downloading $FILE"
        curl -fsSL -o "$INSTALL_DIR/$FILE" "$BASE_URL/$FILE"
        
        if [[ "$FILE" == *.sh ]]; then
            chmod +x "$INSTALL_DIR/$FILE"
        fi
    done
    
    echo -e "\nDownload complete. Starting initialization..."
    cd "$INSTALL_DIR" || exit 1
    
    if [ -f "./zalo-mcp.sh" ]; then
        ./zalo-mcp.sh init
    else
        echo "Error: zalo-mcp.sh was not downloaded correctly."
        exit 1
    fi
}

run_clean() {
    echo "==================================================="
    echo "  Zalo MCP Server - Clean Environment (macOS/Linux)"
    echo "==================================================="
    echo ""
    
    echo "[1/2] Removing Node.js dependencies (node_modules)..."
    rm -rf node_modules package-lock.json
    echo "Node dependencies removed."
    echo ""
    
    echo "[2/2] Removing Python environment (venv)..."
    rm -rf venv
    echo "Python environment removed."
    echo ""
    
    echo "==================================================="
    echo "  Cleanup Complete!"
    echo "==================================================="
    echo "Your deployment folder is now completely reset."
    echo "Run './zalo-mcp.sh init' to download fresh dependencies again."
    echo ""
}

run_init() {
    echo "==================================================="
    echo "  Zalo MCP Server Setup - macOS / Linux Initialization"
    echo "==================================================="
    echo ""
    
    # 1. Check Node.js
    echo "[1/4] Checking Node.js installation..."
    if ! command -v node >/dev/null 2>&1; then
        echo "[ERROR] Node.js is not installed or not in your PATH."
        echo "Please download and install Node.js - version 20 or higher - from: https://nodejs.org/"
        echo ""
        exit 1
    fi
    
    NODE_VERSION=$(node -v | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
    
    if [ "$NODE_MAJOR" -lt 20 ]; then
        echo "[WARNING] Node.js version is $NODE_MAJOR, but version 20 or higher is recommended."
    fi
    echo "Node.js is ready."
    echo ""
    
    # 2. Install Node.js dependencies
    if [ "$CLEAN_INSTALL" = "1" ]; then
        echo "[CLEAN] Removing existing node_modules and package-lock.json..."
        rm -rf node_modules package-lock.json
    fi
    
    echo "[2/4] Installing Node.js dependencies locally..."
    if ! npm install; then
        echo "[ERROR] Failed to install Node.js dependencies. Check your internet connection or npm logs."
        echo ""
        exit 1
    fi
    echo "Node.js dependencies installed successfully."
    echo ""
    
    # 3. Optional Python virtual environment setup
    echo "[3/4] Checking for Python to set up optional reporting environment..."
    PYTHON_BIN=""
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_BIN="python3"
    elif command -v python >/dev/null 2>&1; then
        PYTHON_BIN="python"
    fi
    
    if [ -n "$PYTHON_BIN" ]; then
        echo "Python detected ($PYTHON_BIN). Setting up isolated virtual environment [venv]..."
        if [ "$CLEAN_INSTALL" = "1" ]; then
            echo "[CLEAN] Removing existing venv..."
            rm -rf venv
        fi
        
        if [ ! -d "venv" ]; then
            if ! $PYTHON_BIN -m venv venv; then
                echo "[WARNING] Failed to create virtual environment. Continuing without venv."
                PYTHON_BIN=""
            fi
        fi
        
        if [ -n "$PYTHON_BIN" ]; then
            echo "Activating venv and installing Python dependencies..."
            # Use source to activate properly
            . venv/bin/activate
            pip install --upgrade pip >/dev/null 2>&1
            if ! pip install -r requirements.txt; then
                echo "[WARNING] Some python dependencies failed to install."
            fi
            deactivate
            echo "Python environment is set up."
        fi
    else
        echo "[NOTE] Python was not found on your system."
        echo "Skipping python virtual environment setup. "
        echo "[This is optional and only required if you run custom Python report scripts. The core Zalo MCP runs fine.]"
    fi
    echo ""
    
    # 4. Copy and Configure .env
    echo "[4/4] Setting up environment configuration..."
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "Created .env file from .env.example template."
    else
        echo ".env file already exists."
    fi
    
    # Interactive port selection if not passed as CLI arguments
    if [ -z "$OA_PORT" ]; then
        read -p "Enter Zalo OA Webhook Port [default: 3000]: " OA_INPUT
        OA_PORT=${OA_INPUT:-3000}
    fi
    
    if [ -z "$MCP_PORT" ]; then
        read -p "Enter Zalo MCP HTTP Port [default: 3847]: " MCP_INPUT
        MCP_PORT=${MCP_INPUT:-3847}
    fi
    
    # Ensure port variables exist in the .env file, then replace their values
    if ! grep -q "^ZALO_OA_WEBHOOK_PORT=" .env; then echo "ZALO_OA_WEBHOOK_PORT=3000" >> .env; fi
    if ! grep -q "^ZALO_MCP_HTTP_PORT=" .env; then echo "ZALO_MCP_HTTP_PORT=3847" >> .env; fi
    
    # Perform POSIX-compliant awk replacement to set ports in-place
    awk -v oa="$OA_PORT" -v mcp="$MCP_PORT" '{
        if ($0 ~ /^ZALO_OA_WEBHOOK_PORT=/) print "ZALO_OA_WEBHOOK_PORT=" oa;
        else if ($0 ~ /^ZALO_MCP_HTTP_PORT=/) print "ZALO_MCP_HTTP_PORT=" mcp;
        else print $0;
    }' .env > .env.tmp && mv .env.tmp .env
    
    echo "Configured Zalo OA Webhook Port to: $OA_PORT"
    echo "Configured Zalo MCP HTTP Port to: $MCP_PORT"
    echo ""
    
    echo "==================================================="
    echo "  Setup Completed Successfully!"
    echo "==================================================="
    echo ""
    echo "Next Steps:"
    echo "1. Scan QR code to login your Personal Zalo Account:"
    echo "   npx zalo-agent login"
    echo ""
    echo "2. [Optional] Setup your Zalo Official Account:"
    echo "   npx zalo-agent oa init --app-id [ID] --secret [KEY]"
    echo ""
    echo "3. Add this server to your Claude Code or Cursor config."
    echo "   Read README.md for details."
    echo ""
}

run_update() {
    echo "==================================================="
    echo "  Zalo MCP Server Update - macOS/Linux"
    echo "==================================================="
    echo ""
    
    echo "[1/2] Updating Node.js dependencies..."
    if ! npm update; then
        echo "[WARNING] Failed to run 'npm update'. Running 'npm install' as fallback..."
        npm install
    fi
    echo "Node.js packages updated successfully."
    echo ""
    
    echo "[2/2] Updating Python dependencies (if virtual environment exists)..."
    if [ -d "venv" ]; then
        echo "Virtual environment detected. Updating packages..."
        . venv/bin/activate
        pip install --upgrade pip >/dev/null 2>&1
        pip install --upgrade -r requirements.txt
        deactivate
        echo "Python dependencies updated successfully."
    else
        echo "No python virtual environment found. Skipping python update."
    fi
    echo ""
    
    echo "==================================================="
    echo "  Update completed!"
    echo "==================================================="
    echo ""
}

if [ -z "$ACTION" ]; then
    echo "Usage: ./zalo-mcp.sh <command> [options]"
    echo ""
    echo "Commands:"
    echo "  install Install the Zalo MCP Server from GitHub into a new directory"
    echo "  init    Initialize the environment (install Node/Python deps, config .env)"
    echo "  update  Update existing Node/Python dependencies"
    echo "  clean   Remove all downloaded dependencies (node_modules, venv)"
    echo ""
    echo "Options (for init):"
    echo "  --clean         Remove existing dependencies before initialization"
    echo "  --oa-port <port> Webhook port for OA (default: 3000)"
    echo "  --mcp-port <port> HTTP port for MCP (default: 3847)"
    exit 1
fi

case "$ACTION" in
    install)
        run_install
        ;;
    init)
        run_init
        ;;
    update)
        run_update
        ;;
    clean)
        run_clean
        ;;
    *)
        echo "Unknown command: $ACTION"
        echo "Available commands: install, init, update, clean"
        exit 1
        ;;
esac

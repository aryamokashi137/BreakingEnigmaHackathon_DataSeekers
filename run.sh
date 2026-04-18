#!/bin/bash

#****************************************************************************=
# Legal RAG Pipeline - Application Startup Script
#****************************************************************************=

set -u

API_PID=""
UI_PID=""

echo "*************************************************"
echo "Legal RAG Pipeline - Starting Application Services"
echo "*************************************************"

export FLASK_APP=api/app.py
export FLASK_ENV=development
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT" || exit 1

BACKEND_LOG="${TMPDIR:-/tmp}/legalnexus-backend.log"
FRONTEND_LOG="${TMPDIR:-/tmp}/legalnexus-frontend.log"

if [ -x "$PROJECT_ROOT/venv/bin/python" ]; then
    PYTHON_BIN="$PROJECT_ROOT/venv/bin/python"
    PIP_BIN="$PROJECT_ROOT/venv/bin/pip"
else
    PYTHON_BIN="python3"
    PIP_BIN="pip3"
fi

print_log_and_exit() {
    local label="$1"
    local log_file="$2"

    echo "Error: $label failed to start"
    if [ -f "$log_file" ]; then
        echo ""
        echo "Last log output from $label:"
        cat "$log_file"
    fi
    exit 1
}

cleanup() {
    echo ""
    echo "Stopping services..."

    if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
        echo "Stopping Flask API server (PID: $API_PID)..."
        kill "$API_PID" 2>/dev/null
    fi

    if [ -n "$UI_PID" ] && kill -0 "$UI_PID" 2>/dev/null; then
        echo "Stopping React development server (PID: $UI_PID)..."
        kill "$UI_PID" 2>/dev/null
    fi

    echo "All services stopped successfully"
}

trap cleanup SIGINT SIGTERM EXIT

echo "Performing dependency checks..."

if ! command -v python3 >/dev/null 2>&1; then
    echo "Error: Python 3 is required but not installed"
    echo "Please install Python 3.11+ from https://python.org"
    exit 1
fi

if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is required but not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "Error: npm is required but not installed"
    echo "npm should be included with Node.js installation"
    exit 1
fi

echo "All required dependencies found"

echo "Checking Python dependencies..."
"$PIP_BIN" install -r requirements.txt || exit 1

echo "Checking Node.js dependencies..."
if [ ! -d "ui/node_modules" ]; then
    echo "Installing Node.js dependencies..."
    (
        cd ui || exit 1
        npm install
    ) || exit 1
fi

echo "Starting Flask API server..."
: > "$BACKEND_LOG"
"$PYTHON_BIN" api/app.py >"$BACKEND_LOG" 2>&1 &
API_PID=$!
sleep 3

if ! kill -0 "$API_PID" 2>/dev/null; then
    print_log_and_exit "Flask API server" "$BACKEND_LOG"
fi
echo "Flask API server started with PID: $API_PID"

echo "Starting React development server..."
: > "$FRONTEND_LOG"
(
    cd ui || exit 1
    BROWSER=none DANGEROUSLY_DISABLE_HOST_CHECK=true npm start >"$FRONTEND_LOG" 2>&1
) &
UI_PID=$!
sleep 5

if ! kill -0 "$UI_PID" 2>/dev/null; then
    print_log_and_exit "React development server" "$FRONTEND_LOG"
fi
echo "React development server started with PID: $UI_PID"

echo ""
echo "*************************************************"
echo "Application services successfully started"
echo "*************************************************"
echo "Backend API:  http://localhost:5000"
echo "Frontend UI:  http://localhost:3000"
echo "Backend log:  $BACKEND_LOG"
echo "Frontend log: $FRONTEND_LOG"
echo "*************************************************"
echo "Press Ctrl+C to stop all services"
echo ""

echo "Monitoring services... (Use Ctrl+C to stop)"
wait

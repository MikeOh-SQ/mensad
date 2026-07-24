#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$PROJECT_DIR/.vite.pid"
LOG_FILE="$PROJECT_DIR/.vite.log"
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-5173}"

cd "$PROJECT_DIR"

if [[ -f "$PID_FILE" ]]; then
  existing_pid="$(cat "$PID_FILE")"
  if kill -0 "$existing_pid" 2>/dev/null; then
    echo "Service is already running (PID: $existing_pid)."
    echo "URL: http://$(hostname -I 2>/dev/null | awk '{print $1}'):$PORT"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm ci
fi

echo "Starting service on $HOST:$PORT..."
nohup setsid npm run dev -- --host "$HOST" --port "$PORT" --strictPort >"$LOG_FILE" 2>&1 &
service_pid=$!
echo "$service_pid" >"$PID_FILE"

for _ in {1..30}; do
  if ! kill -0 "$service_pid" 2>/dev/null; then
    rm -f "$PID_FILE"
    echo "Service failed to start. Check $LOG_FILE."
    exit 1
  fi

  if grep -q "Local:" "$LOG_FILE" 2>/dev/null; then
    local_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
    echo "Service started (PID: $service_pid)."
    echo "Local URL:   http://localhost:$PORT"
    if [[ -n "$local_ip" ]]; then
      echo "Network URL: http://$local_ip:$PORT"
    fi
    echo "Log: $LOG_FILE"
    exit 0
  fi
  sleep 0.2
done

echo "Service is running (PID: $service_pid)."
echo "Log: $LOG_FILE"

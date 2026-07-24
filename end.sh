#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$PROJECT_DIR/.vite.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "Service is not running: PID file not found."
  exit 0
fi

service_pid="$(cat "$PID_FILE")"

if ! kill -0 "$service_pid" 2>/dev/null; then
  rm -f "$PID_FILE"
  echo "Service is not running. Removed stale PID file."
  exit 0
fi

kill -- "-$service_pid"

for _ in {1..50}; do
  if ! kill -0 "$service_pid" 2>/dev/null; then
    rm -f "$PID_FILE"
    echo "Service stopped."
    exit 0
  fi
  sleep 0.1
done

kill -KILL -- "-$service_pid" 2>/dev/null || true
rm -f "$PID_FILE"
echo "Service was forcefully stopped."

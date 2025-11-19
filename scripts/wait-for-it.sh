#!/usr/bin/env bash
# wait-for-it.sh: Wait for a service to be available

set -e

host="$1"
shift
port="$1"
shift
timeout="${WAIT_TIMEOUT:-30}"

echo "⏳ Waiting for $host:$port..."

for i in $(seq 1 $timeout); do
  if nc -z "$host" "$port" > /dev/null 2>&1; then
    echo "✅ $host:$port is available!"
    exec "$@"
    exit 0
  fi
  echo "⏳ Waiting... ($i/$timeout)"
  sleep 1
done

echo "❌ Timeout waiting for $host:$port"
exit 1

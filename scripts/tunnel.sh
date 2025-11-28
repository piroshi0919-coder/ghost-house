#!/usr/bin/env bash
# Keep a localtunnel session running and log the public URL
LOGFILE="/tmp/localtunnel.log"
echo "[tunnel-supervisor] start: $(date -Is)" >> "$LOGFILE"
while true; do
  echo "[tunnel-supervisor] launching localtunnel at $(date -Is)" >> "$LOGFILE"
  # start localtunnel; npx --yes will install/run it if needed
  npx --yes localtunnel --port 3000 >> "$LOGFILE" 2>&1
  CODE=$?
  echo "[tunnel-supervisor] localtunnel exited with code $CODE at $(date -Is)" >> "$LOGFILE"
  # small backoff
  sleep 2
done

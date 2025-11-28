#!/usr/bin/env bash
# Simple supervisor: restart node server.js whenever it exits
LOGFILE="$(pwd)/server.run.log"
echo "---- supervisor start: $(date -Is) ----" >> "$LOGFILE"
while true; do
  echo "[supervisor] starting node server at $(date -Is)" >> "$LOGFILE"
  # run node and append stdout/stderr to logfile
  node server.js >> "$LOGFILE" 2>&1
  CODE=$?
  echo "[supervisor] node exited with code $CODE at $(date -Is)" >> "$LOGFILE"
  # short backoff before restart
  sleep 1
done

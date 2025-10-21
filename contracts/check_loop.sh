#!/bin/bash
echo "⏳ VRF 응답 대기 중... (Ctrl+C로 중지)"
echo ""
while true; do
  echo "=== $(date '+%H:%M:%S') 확인 중... ==="
  forge script script/CheckWinningNumbers.s.sol:CheckWinningNumbers --rpc-url https://public-en-kairos.node.kaia.io 2>/dev/null | grep -A 20 "Draw #"
  echo ""
  sleep 15
done

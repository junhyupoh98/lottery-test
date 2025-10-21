#!/bin/bash
echo "=== 최근 컨트랙트 트랜잭션 확인 ==="
echo ""
CONTRACT="0x098dA63EDAf32DA8E69F9AD3A00368262EDEc4bE"
RPC="https://public-en-kairos.node.kaia.io"

# 최근 블록 번호
BLOCK=$(cast block-number --rpc-url $RPC)
echo "현재 블록: $BLOCK"
echo ""

# 컨트랙트 이벤트 확인
echo "=== RandomWordsRequested 이벤트 확인 ==="
cast logs --from-block $((BLOCK - 1000)) --to-block latest \
  --address $CONTRACT \
  "RandomWordsRequested(uint256,uint256)" \
  --rpc-url $RPC 2>/dev/null || echo "VRF 요청 이벤트 없음"

echo ""
echo "=== WinningNumbersSet 이벤트 확인 ==="
cast logs --from-block $((BLOCK - 1000)) --to-block latest \
  --address $CONTRACT \
  "WinningNumbersSet(uint256,uint8[6])" \
  --rpc-url $RPC 2>/dev/null || echo "당첨 번호 설정 이벤트 없음"


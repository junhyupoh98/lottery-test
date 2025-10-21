# Kiwoom Lottery - 프로젝트 현황

## 📊 완성도

| 항목 | 상태 | 완성도 |
|------|------|--------|
| 스마트 컨트랙트 | ✅ 완료 | 90% |
| VRF 통합 | ✅ 완료 | 100% |
| 로컬 테스트 | ✅ 완료 | 100% |
| 테스트넷 배포 | ✅ 완료 | 100% |
| 프론트엔드 | 🚧 진행 중 | 40% |

---

## 🚀 배포 정보

### Kaia Kairos 테스트넷
- **Lotto 컨트랙트**: `0x2e7bb733b7813628a46130fa48b9f9cdda29e088` ← **최종 버전 (테스트 함수 포함)**
- **MockVRF 컨트랙트**: `0xbb1ced5b060cc67af8c393844b1d3054afb90273`
- **네트워크**: Kaia Kairos Testnet (Chain ID: 1001)
- **Explorer**: https://baobab.klaytnscope.com/
- **배포 날짜**: 2025-10-21 (최종)
- **관리자 지갑**: `0xe4885a25c43c8d6087f8d5a1162f9b869c08c98c`

### 💰 당첨금 분배 규칙
- **1등**: 70% (단독 당첨 시 100%)
- **2등**: 10% (미당첨 시 3등으로 이전)
- **3등**: 20%
- **이월 잭팟**: 1등 미당첨 시 다음 회차로 이월

### 🧪 테스트 기능
- **`setWinningNumbersForTest()`**: 관리자 전용 테스트 함수 (실제 배포 전 삭제 예정)
  - 당첨 시나리오 테스트용
  - VRF 없이 당첨번호 직접 설정 가능

### VRF 설정 (현재 MockVRF 사용)
- **상태**: 테스트용 Mock VRF 사용 중
- **향후 계획**: Orakl VRF로 전환 예정

---

## 📁 프로젝트 구조

### contracts/
```
contracts/
├── src/
│   ├── Lotto.sol                    # 메인 로또 컨트랙트
│   └── mocks/
│       └── MockVRFCoordinatorV2.sol # 로컬 테스트용 Mock VRF
├── script/
│   ├── DeployLotto.s.sol            # 실제 배포 스크립트
│   ├── DeployLottoLocal.s.sol       # 로컬 배포 스크립트
│   ├── TestLottoComplete.s.sol      # 통합 테스트 스크립트
│   ├── CreateDraw.s.sol             # 회차 생성 스크립트
│   └── BuyTicket.s.sol              # 티켓 구매 스크립트
├── test/
│   └── Lotto.t.sol                  # Foundry 테스트
└── foundry.toml                     # Foundry 설정
```

### frontend/
```
frontend/
├── src/app/
│   ├── page.tsx                     # 메인 페이지 (미구현)
│   └── layout.tsx                   # 레이아웃
├── lib/
│   └── lottoAbi.json                # Lotto 컨트랙트 ABI
├── fortuneData.mjs                  # 포춘쿠키 데이터
└── env.example                      # 환경변수 예시
```

---

## ✅ 완성된 기능

### 스마트 컨트랙트
- [x] ERC721 NFT 티켓 발행
- [x] 티켓 구매 (0.01 ETH)
- [x] 번호 유효성 검증 (1-45, 중복 불가)
- [x] 회차별 관리
- [x] Chainlink VRF 난수 생성
- [x] 피셔-예이츠 셔플 (중복 없는 번호)
- [x] 자동 당첨금 분배 (6개 일치)
- [x] 상금 풀 관리
- [x] Owner 권한 관리

### 테스트
- [x] 로컬 테스트 (Anvil + Mock VRF)
- [x] 전체 플로우 테스트
- [x] Foundry 유닛 테스트

### 배포
- [x] Scroll Sepolia 배포
- [x] 컨트랙트 검증 (Verified)
- [x] VRF Subscription 설정

---

## ⏳ 개발 필요

### 스마트 컨트랙트
- [ ] 당첨 등급 추가 (5개, 4개, 3개 일치)
- [ ] 등급별 상금 비율 설정
- [ ] withdraw() 보안 개선
- [ ] Chainlink Automation 통합 (자동 추첨)

### 프론트엔드
- [x] 지갑 연결 (MetaMask)
- [x] 현재 회차 정보 표시
- [x] 번호 선택 UI
- [x] 자동 번호 생성
- [x] 티켓 구매 기능
- [x] 내 티켓 조회 (당첨 여부 포함)
- [x] 당첨 번호 확인
- [x] 당첨 내역 확인 (상금 분배 내역)
- [x] MockVRF RequestId 자동 조회 ⭐ NEW
- [x] 트랜잭션 상태 모달 ⭐ NEW
- [x] 모바일 반응형 UI ⭐ NEW
- [x] 에러 처리 개선 ⭐ NEW
- [ ] 통계 대시보드
- [ ] 실제 VRF 연동 (Orakl VRF)

---

## 🎯 핵심 기능 설명

### 티켓 구매
```solidity
function buyTicket(uint8[6] memory _numbers, string memory _tokenURI) external payable
```
- 0.01 ETH 고정 가격
- 1-45 범위의 6개 번호 선택
- ERC721 NFT로 발행
- 상금 풀에 자동 적립

### VRF 난수 생성
```solidity
function requestRandomWinningNumbers(uint256 _drawId) public onlyOwner returns (uint256 requestId)
```
- Chainlink VRF로 안전한 난수 생성
- 피셔-예이츠 셔플로 중복 없는 6개 번호
- 자동으로 당첨금 분배 실행

### 당첨 확인
- 구매한 번호와 당첨 번호 비교
- 6개 모두 일치 시 상금 균등 분배
- 당첨자 없으면 상금 풀 유지

---

## 🚀 시작하기

### 로컬 테스트
```bash
# 1. Anvil 실행 (터미널 1)
anvil

# 2. 통합 테스트 실행 (터미널 2)
cd contracts
forge script script/TestLottoComplete.s.sol:TestLottoComplete \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast \
  -vvvv
```

### 테스트넷 배포
```bash
cd contracts
forge script script/DeployLotto.s.sol:DeployLotto \
  --rpc-url https://sepolia-rpc.scroll.io \
  --broadcast \
  --verify \
  -vvvv
```

---

## 📝 다음 단계

### 우선순위 1 (필수)
1. VRF Subscription LINK 충전
2. 회차 생성 및 판매 시작
3. 티켓 구매 테스트
4. VRF 추첨 테스트

### 우선순위 2 (프론트엔드)
1. 지갑 연결 기능
2. 티켓 구매 UI
3. 번호 선택/자동 생성
4. 내 티켓 조회

### 우선순위 3 (추가 기능)
1. 당첨 등급 시스템
2. 자동 추첨 (Chainlink Automation)
3. 통계 및 분석
4. 메타데이터 IPFS 업로드

---

## 🔗 유용한 링크

- **Chainlink VRF Dashboard**: https://vrf.chain.link/scroll-sepolia
- **LINK Faucet**: https://faucets.chain.link/scroll-sepolia
- **Scroll Sepolia Faucet**: https://sepolia-faucet.scroll.io/
- **Scroll Explorer**: https://sepolia.scrollscan.com/
- **Foundry Book**: https://book.getfoundry.sh/

---

**마지막 업데이트**: 2025-10-20


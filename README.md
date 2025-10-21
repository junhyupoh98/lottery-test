# 🎰 Kiwoom Lottery

Chainlink VRF를 활용한 탈중앙화 로또 시스템

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-red)](https://getfoundry.sh/)
[![Chainlink](https://img.shields.io/badge/Powered%20by-Chainlink%20VRF-blue)](https://chain.link/)

---

## 🎯 프로젝트 소개

Kiwoom Lottery는 블록체인 기반의 투명하고 공정한 로또 시스템입니다.

### ✨ 주요 특징

- 🎫 **ERC721 NFT 티켓**: 각 티켓은 고유한 NFT
- 🎲 **Chainlink VRF**: 검증 가능한 난수로 당첨 번호 생성
- 💰 **자동 분배**: 스마트 컨트랙트가 당첨금 자동 분배
- 🔍 **완전 투명**: 모든 거래가 블록체인에 기록
- 🌐 **탈중앙화**: 중앙 기관 없이 작동

---

## 📊 현재 상태

✅ **스마트 컨트랙트 완성** (90%)  
✅ **로컬 테스트 완료** (100%)  
✅ **테스트넷 배포 완료** (Kaia Kairos)  
✅ **프론트엔드 개발 중** (40%)
  - ✅ 티켓 구매 UI
  - ✅ 내 티켓 조회
  - ✅ 상금 분배 내역
  - ✅ MockVRF RequestId 자동 조회
  - ✅ 트랜잭션 상태 모달
  - ✅ 모바일 반응형 UI
  - ✅ 에러 처리 개선

**배포된 컨트랙트** (2025-10-21 최종): 
- **Lotto**: [0x2e7bb733b7813628a46130fa48b9f9cdda29e088](https://baobab.klaytnscope.com/account/0x2e7bb733b7813628a46130fa48b9f9cdda29e088) - **테스트 함수 포함**
- **MockVRF**: [0xbb1ced5b060cc67af8c393844b1d3054afb90273](https://baobab.klaytnscope.com/account/0xbb1ced5b060cc67af8c393844b1d3054afb90273)
- **네트워크**: Kaia Kairos Testnet (Chain ID: 1001)

### 💰 당첨금 분배 규칙
- **1등**: 70% (단독 당첨 시 100%)
- **2등**: 10% (미당첨 시 3등으로 이전)
- **3등**: 20%
- **이월 잭팟**: 1등 미당첨 시 다음 회차로 이월

### 🧪 테스트 기능
- **`setWinningNumbersForTest()`**: 관리자가 테스트용 당첨번호 직접 설정 가능 (실제 배포 전 삭제 예정)

---

## 🛠️ 기술 스택

### Smart Contracts
- **Solidity** 0.8.24
- **Foundry** - 개발 프레임워크
- **OpenZeppelin** - ERC721 구현
- **Chainlink VRF V2** - 난수 생성

### Frontend (예정)
- **Next.js** 15
- **React** 19
- **ethers.js** 6
- **TailwindCSS** 4

---

## 🚀 시작하기

### 필수 요구사항

- [Foundry](https://getfoundry.sh/)
- [Node.js](https://nodejs.org/) 18+
- [Git](https://git-scm.com/)

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/kiwoom-lottery.git
cd kiwoom-lottery

# Foundry 의존성 설치
cd contracts
forge install

# Frontend 의존성 설치
cd ../frontend
npm install
```

---

## 🧪 로컬 테스트

### 1. Anvil 실행 (로컬 블록체인)

```bash
anvil
```

### 2. 통합 테스트 실행

```bash
cd contracts

forge script script/TestLottoComplete.s.sol:TestLottoComplete \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast \
  -vvvv
```

이 명령어는 다음을 수행합니다:
- ✅ 컨트랙트 배포 (Mock VRF 포함)
- ✅ 회차 생성
- ✅ 티켓 2장 구매
- ✅ VRF 난수 생성
- ✅ 당첨 번호 확인
- ✅ 당첨금 분배

---

## 📦 테스트넷 배포

### 1. 환경 변수 설정

```bash
cd contracts
cp .env.example .env
# .env 파일을 편집하여 값 입력
```

필요한 환경 변수:
```bash
VRF_COORDINATOR_V2=0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
VRF_SUBSCRIPTION_ID=your_subscription_id
VRF_KEY_HASH=0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae
PRIVATE_KEY=0xyour_private_key
ETHERSCAN_API_KEY=your_api_key
```

### 2. 배포 실행

```bash
forge script script/DeployLotto.s.sol:DeployLotto \
  --rpc-url https://sepolia-rpc.scroll.io \
  --broadcast \
  --verify \
  -vvvv
```

### 3. VRF Subscription 설정

1. https://vrf.chain.link/scroll-sepolia 접속
2. 배포된 컨트랙트 주소를 Consumer로 추가
3. LINK 토큰 충전

---

## 📖 사용 방법

### 회차 생성

```bash
forge script script/CreateDraw.s.sol:CreateDraw \
  --rpc-url https://sepolia-rpc.scroll.io \
  --broadcast \
  -vvvv
```

### 티켓 구매

```bash
forge script script/BuyTicket.s.sol:BuyTicket \
  --rpc-url https://sepolia-rpc.scroll.io \
  --broadcast \
  -vvvv
```

---

## 🔧 스마트 컨트랙트 API

### 주요 함수

#### `buyTicket(uint8[6] memory _numbers, string memory _tokenURI)`
티켓 구매 (0.01 ETH)

**Parameters:**
- `_numbers`: 1-45 범위의 6개 번호 배열
- `_tokenURI`: 메타데이터 URI

**Example:**
```solidity
uint8[6] memory numbers = [7, 12, 23, 31, 38, 42];
lotto.buyTicket{value: 0.01 ether}(numbers, "ipfs://...");
```

#### `requestRandomWinningNumbers(uint256 _drawId)`
VRF로 당첨 번호 생성 요청 (Owner only)

**Parameters:**
- `_drawId`: 추첨할 회차 번호

#### `winningNumbers(uint256 _drawId, uint256 _index)`
회차별 당첨 번호 조회

**Returns:**
- 해당 인덱스의 당첨 번호 (uint8)

---

## 📁 프로젝트 구조

```
kiwoom-lottery/
├── contracts/
│   ├── src/
│   │   ├── Lotto.sol                    # 메인 컨트랙트
│   │   └── mocks/
│   │       └── MockVRFCoordinatorV2.sol
│   ├── script/
│   │   ├── DeployLotto.s.sol            # 배포
│   │   ├── TestLottoComplete.s.sol      # 통합 테스트
│   │   ├── CreateDraw.s.sol             # 회차 생성
│   │   └── BuyTicket.s.sol              # 티켓 구매
│   └── test/
│       └── Lotto.t.sol                  # 테스트
├── frontend/
│   ├── src/app/
│   │   └── page.tsx                     # 메인 페이지
│   └── lib/
│       └── lottoAbi.json                # 컨트랙트 ABI
└── README.md
```

---

## 🧩 로또 시스템 설명

### 티켓 구매
1. 1-45 범위에서 6개의 번호 선택
2. 0.01 ETH 지불
3. ERC721 NFT로 티켓 발행
4. 상금 풀에 자동 적립

### 당첨 번호 생성
1. Owner가 VRF 난수 요청
2. Chainlink VRF가 난수 생성
3. 피셔-예이츠 셔플로 6개 번호 추출
4. 자동으로 당첨금 분배 실행

### 당첨금 분배
1. 구매한 번호와 당첨 번호 비교
2. 6개 모두 일치 시 당첨
3. 당첨자들에게 상금 균등 분배
4. 당첨자 없으면 다음 회차로 이월

---

## 🔐 보안

- ✅ Ownable 패턴으로 권한 관리
- ✅ Chainlink VRF로 안전한 난수
- ✅ 재진입 공격 방어
- ✅ 입력 값 유효성 검증
- ⚠️ withdraw() 함수 개선 필요

---

## 🗺️ 로드맵

### Phase 1 (완료) ✅
- [x] 스마트 컨트랙트 개발
- [x] Chainlink VRF 통합
- [x] 로컬 테스트
- [x] 테스트넷 배포

### Phase 2 (진행 중) 🚧
- [x] 프론트엔드 기본 구조
- [x] 지갑 연결 기능
- [x] 티켓 구매 UI
- [x] 당첨 확인 UI
- [x] 내 티켓 조회
- [x] 상금 분배 내역
- [x] MockVRF RequestId 자동 조회
- [x] 트랜잭션 상태 모달
- [x] 모바일 반응형
- [ ] 실제 VRF 연동 (Orakl VRF)

### Phase 3 (예정) 📋
- [ ] 당첨 등급 시스템 (5개, 4개, 3개 일치)
- [ ] Chainlink Automation (자동 추첨)
- [ ] 통계 대시보드
- [ ] 메인넷 배포

---

## 🤝 기여하기

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

MIT License

---

## 🔗 링크

- **배포된 컨트랙트**: [Scroll Sepolia Explorer](https://sepolia.scrollscan.com/address/0x1fd02347ed80ef3e182d24dc16c59398e4525140)
- **Chainlink VRF**: [VRF Dashboard](https://vrf.chain.link/scroll-sepolia)
- **문서**: [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

## 👥 팀

- **개발자**: [Your Name]
- **컨트랙트**: Lotto.sol
- **네트워크**: Scroll Sepolia

---

## 📞 문의

질문이나 제안사항이 있으시면 이슈를 열어주세요!

---

**⚠️ 주의**: 이 프로젝트는 교육 목적으로 개발되었습니다. 실제 자금을 사용하기 전에 충분한 검토와 감사가 필요합니다.


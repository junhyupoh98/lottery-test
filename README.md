# 🎰 Kiwoom Lottery (키움 로또)

**블록체인 기반 탈중앙화 로또 시스템**

Kaia 블록체인(Kairos Testnet)에 배포된 완전 투명하고 공정한 로또 DApp입니다.

---

## 🌟 주요 특징

- ✅ **완전 탈중앙화**: 스마트 컨트랙트로 자동 운영
- ✅ **투명한 당첨금 분배**: 70% 1등 / 10% 2등 / 20% 운영비
- ✅ **공정한 추첨**: VRF(검증 가능한 난수) 사용
- ✅ **자동 당첨금 지급**: 컨트랙트가 자동으로 분배
- ✅ **실시간 조회**: 내 티켓, 당첨 내역 실시간 확인
- ✅ **모바일 최적화**: 반응형 디자인

---

## 🛠 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **ethers.js v6**

### Smart Contract
- **Solidity 0.8.24**
- **Foundry** (개발 프레임워크)
- **Kaia Blockchain** (Kairos Testnet)
- **Orakl VRF** (난수 생성)

### 배포
- **Frontend**: Vercel
- **Smart Contract**: Kaia Kairos Testnet

---

## 📋 프로젝트 구조

```
kiwoom-lottery/
├── contracts/                  # 스마트 컨트랙트
│   ├── src/
│   │   ├── Lottery.sol        # 메인 로또 컨트랙트
│   │   └── MockVRF.sol        # 테스트용 VRF
│   ├── script/
│   │   └── Deploy.s.sol       # 배포 스크립트
│   └── test/                  # 컨트랙트 테스트
│
├── frontend/                   # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # 메인 페이지
│   │   │   └── layout.tsx     # 레이아웃
│   │   └── abi/
│   │       ├── LotteryABI.json
│   │       └── MockVRFABI.json
│   └── public/
│
├── .env                        # 환경 변수 (Git 제외)
└── README.md                   # 프로젝트 문서
```

---

## 🔗 배포 정보

### Kaia Kairos Testnet

| 항목 | 정보 |
|------|------|
| **Network** | Kaia Kairos (Testnet) |
| **Chain ID** | 1001 |
| **RPC URL** | https://public-en-kairos.node.kaia.io |
| **Block Explorer** | https://kairos.kaiascan.io |
| **Lottery Contract** | `0x2e7bb733b7813628a46130fa48b9f9cdda29e088` |
| **MockVRF Contract** | `0xbb1ced5b060cc67af8c393844b1d3054afb90273` |
| **Owner Address** | `0x6Cc5339ec1072F3e232F41c799c511aa30FaD165` |

### Frontend (Vercel)
- **URL**: [Vercel에서 자동 생성된 URL]
- **자동 배포**: `main` 브랜치에 푸시 시 자동 배포

---

## 🎯 주요 기능

### 1️⃣ 사용자 기능
- 티켓 구매 (1~45 중 6개 번호 선택)
- 내 티켓 조회
- 당첨 내역 확인
- 당첨금 자동 수령

### 2️⃣ 관리자 기능 (Owner만)
- 새 회차 생성
- VRF 당첨번호 추첨
- 테스트용 당첨번호 설정
- 운영비 인출

### 3️⃣ 당첨 규칙
- **1등**: 6개 번호 모두 일치 → 상금의 70%
- **2등**: 5개 번호 일치 → 상금의 10%
- **운영비**: 20% (관리자 인출 가능)
- **잭팟**: 1등 당첨자 없을 시 누적

---

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18+
- Foundry
- MetaMask
- Kaia 테스트넷 KAIA (Faucet에서 받기)

### 1. 프로젝트 클론
```bash
git clone https://github.com/junhyupoh98/lottery-test.git
cd lottery-test
```

### 2. 환경 변수 설정
루트 디렉토리에 `.env` 파일 생성:

```env
# 컨트랙트 배포용 (Foundry)
PRIVATE_KEY=your_private_key_here
KAIA_KAIROS_RPC_URL=https://public-en-kairos.node.kaia.io

# 프론트엔드용
NEXT_PUBLIC_CONTRACT_ADDRESS=0x2e7bb733b7813628a46130fa48b9f9cdda29e088
NEXT_PUBLIC_MOCK_VRF_ADDRESS=0xbb1ced5b060cc67af8c393844b1d3054afb90273
NEXT_PUBLIC_OWNER_ADDRESS=0x6Cc5339ec1072F3e232F41c799c511aa30FaD165
```

**⚠️ 중요: `.env` 파일은 절대 Git에 커밋하지 마세요!**

### 3. Frontend 설치 및 실행
```bash
cd frontend
npm install
npm run dev
```

→ http://localhost:3000 에서 확인

### 4. Smart Contract 컴파일
```bash
cd contracts
forge build
```

### 5. Smart Contract 배포 (선택)
```bash
forge script script/Deploy.s.sol:DeployLottery --rpc-url $KAIA_KAIROS_RPC_URL --broadcast --legacy
```

---

## 🧪 테스트 방법

### 테스트 시나리오

#### 1️⃣ **티켓 구매 테스트**
1. MetaMask 연결
2. 번호 6개 선택 (1~45)
3. "🎫 티켓 구매" 버튼 클릭
4. MetaMask에서 트랜잭션 승인
5. "내 티켓" 섹션에서 확인

#### 2️⃣ **당첨번호 설정 테스트** (관리자만)

**방법 1: UI 사용 (추천)**
1. 관리자 지갑으로 연결
2. "🎯 테스트용 당첨번호 직접 설정" 섹션
3. 회차 번호 입력 (예: 5)
4. 당첨 번호 6개 입력 (예: 1, 7, 15, 23, 32, 45)
5. "당첨번호 설정 및 당첨금 분배" 버튼 클릭
6. MetaMask 승인
7. 당첨금 자동 분배 완료!

**방법 2: 터미널 사용**
```bash
cast send 0x2e7bb733b7813628a46130fa48b9f9cdda29e088 \
  "setWinningNumbersForTest(uint256,uint8[6])" \
  5 "[1,7,15,23,32,45]" \
  --rpc-url https://public-en-kairos.node.kaia.io \
  --private-key $PRIVATE_KEY \
  --legacy
```

#### 3️⃣ **당첨금 확인**
1. "당첨 내역" 탭 클릭
2. 회차 선택
3. 당첨 여부 및 수령 금액 확인

---

## 📊 스마트 컨트랙트 주요 함수

### 사용자 함수
```solidity
// 티켓 구매
function buyTicket(uint256 drawId, uint8[6] memory numbers) payable

// 내 티켓 조회
function getMyTickets(address player, uint256 drawId) returns (Ticket[])

// 당첨 번호 조회
function getWinningNumbers(uint256 drawId) returns (uint8[6])
```

### 관리자 함수 (onlyOwner)
```solidity
// 회차 생성
function createOrUpdateDraw(uint256 drawId, uint256 drawTimestamp, bool isActive)

// VRF 요청
function requestRandomWinningNumbers(uint256 drawId)

// 테스트용 당첨번호 설정
function setWinningNumbersForTest(uint256 drawId, uint8[6] memory numbers)

// 운영비 인출
function withdrawFees()
```

---

## 💰 당첨금 분배 규칙

### 자동 분배 시스템
당첨번호가 설정되면 스마트 컨트랙트가 자동으로:

1. **모든 티켓 검증**
2. **등수 분류** (1등, 2등)
3. **당첨금 계산**
   - 1등: 총 상금의 70% ÷ 1등 당첨자 수
   - 2등: 총 상금의 10% ÷ 2등 당첨자 수
   - 운영비: 총 상금의 20%
4. **즉시 지급** (당첨자 지갑으로 전송)

### 잭팟 누적
- 1등 당첨자가 없으면 → 다음 회차로 이월
- `accumulatedJackpot` 변수에 누적

---

## 🔒 보안 고려사항

### 구현된 보안 기능
- ✅ **ReentrancyGuard**: 재진입 공격 방지
- ✅ **onlyOwner**: 관리자 권한 제한
- ✅ **번호 유효성 검증**: 1~45, 중복 방지
- ✅ **회차 상태 관리**: 종료된 회차만 추첨 가능
- ✅ **가스 최적화**: Solidity 0.8.24 사용

### ⚠️ 주의사항
1. **테스트용 함수**: `setWinningNumbersForTest`는 메인넷 배포 전 삭제 필요
2. **Private Key**: 절대 공개 저장소에 올리지 마세요
3. **운영비 관리**: Owner 지갑 보안 철저히

---

## 🧩 ABI 파일

컨트랙트와 상호작용하기 위한 ABI 파일:
- `frontend/src/abi/LotteryABI.json`
- `frontend/src/abi/MockVRFABI.json`

배포 후 ABI 업데이트:
```bash
cd contracts
forge build
cp out/Lottery.sol/Lottery.json ../frontend/src/abi/LotteryABI.json
```

---

## 🌐 Vercel 배포

### 1. Vercel 프로젝트 생성
```bash
cd frontend
npm install -g vercel
vercel
```

### 2. 환경 변수 설정 (Vercel Dashboard)
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_MOCK_VRF_ADDRESS`
- `NEXT_PUBLIC_OWNER_ADDRESS`

### 3. 자동 배포
`main` 브랜치에 푸시하면 자동으로 배포됩니다.

---

## 🐛 문제 해결

### MetaMask 연결 안 됨
- Kaia Kairos 네트워크 추가되어 있는지 확인
- Chain ID: 1001
- RPC URL: https://public-en-kairos.node.kaia.io

### 트랜잭션 실패
- 가스비 충분한지 확인 (KAIA 잔액)
- 회차가 활성화되어 있는지 확인
- 번호 중복 또는 범위 확인 (1~45)

### 당첨금 안 들어옴
- 당첨번호가 설정되었는지 확인
- Block Explorer에서 트랜잭션 확인
- `prizeDistributions` 조회

---

## 📞 문의

- **GitHub Issues**: [이슈 등록]
- **Owner**: 0x6Cc5339ec1072F3e232F41c799c511aa30FaD165

---

## 📜 라이선스

MIT License

---

## 🎉 감사의 말

- **Kaia Foundation**: 블록체인 인프라 제공
- **Orakl Network**: VRF 서비스 제공
- **Foundry**: 개발 도구

---

## 🗂 버전 히스토리

### v1.0.0 (2025-10-21)
- ✅ 초기 배포 (Kaia Kairos)
- ✅ 기본 로또 기능 구현
- ✅ UI/UX 완성
- ✅ 당첨금 분배 시스템
- ✅ 테스트용 당첨번호 설정 UI
- ✅ Vercel 배포

---

**🚀 블록체인으로 투명하고 공정한 로또를 즐기세요!**

# 📁 프로젝트 구조 (Project Structure)

## 🗂 전체 디렉토리 구조

```
kiwoom-lottery/
│
├── 📄 README.md                        # 프로젝트 개요 및 가이드
├── 📄 QUICKSTART.md                    # 5분 빠른 시작 가이드
├── 📄 TECHNICAL.md                     # 기술 문서 (아키텍처, API 등)
├── 📄 ENV_SETUP.md                     # 환경 변수 설정 가이드
├── 📄 PROJECT_STRUCTURE.md             # 이 문서
├── 📄 .gitignore                       # Git 제외 파일 목록
│
├── 📁 contracts/                       # 스마트 컨트랙트 (Foundry)
│   ├── 📁 src/
│   │   ├── 📄 Lottery.sol             # 메인 로또 컨트랙트
│   │   └── 📄 MockVRF.sol             # 테스트용 VRF
│   │
│   ├── 📁 script/
│   │   └── 📄 Deploy.s.sol            # 배포 스크립트
│   │
│   ├── 📁 test/
│   │   └── 📄 Lottery.t.sol           # 컨트랙트 테스트
│   │
│   ├── 📁 lib/                         # Foundry 의존성
│   │   ├── forge-std/
│   │   └── openzeppelin-contracts/
│   │
│   ├── 📁 out/                         # 컴파일 결과 (Git 제외)
│   ├── 📁 cache/                       # 캐시 (Git 제외)
│   ├── 📁 broadcast/                   # 배포 기록 (Git 제외)
│   │
│   ├── 📄 foundry.toml                # Foundry 설정
│   └── 📄 remappings.txt              # Import 경로 매핑
│
├── 📁 frontend/                        # Next.js 프론트엔드
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📄 page.tsx            # 메인 페이지 (로또 UI)
│   │   │   ├── 📄 layout.tsx          # 전역 레이아웃
│   │   │   └── 📄 globals.css         # 전역 스타일
│   │   │
│   │   └── 📁 abi/
│   │       ├── 📄 LotteryABI.json     # Lottery 컨트랙트 ABI
│   │       └── 📄 MockVRFABI.json     # MockVRF 컨트랙트 ABI
│   │
│   ├── 📁 public/                      # 정적 파일
│   │   ├── next.svg
│   │   └── vercel.svg
│   │
│   ├── 📁 node_modules/                # npm 패키지 (Git 제외)
│   ├── 📁 .next/                       # 빌드 결과 (Git 제외)
│   │
│   ├── 📄 package.json                # npm 의존성
│   ├── 📄 package-lock.json           # npm 잠금 파일
│   ├── 📄 tsconfig.json               # TypeScript 설정
│   ├── 📄 next.config.ts              # Next.js 설정
│   ├── 📄 tailwind.config.ts          # Tailwind CSS 설정
│   └── 📄 postcss.config.mjs          # PostCSS 설정
│
└── 📄 .env                             # 환경 변수 (Git 제외!)
```

---

## 🔑 핵심 파일 설명

### 📄 문서 파일

| 파일 | 용도 | 대상 |
|------|------|------|
| `README.md` | 프로젝트 전체 개요 | 모든 사용자 |
| `QUICKSTART.md` | 5분 빠른 시작 | 신규 개발자 |
| `TECHNICAL.md` | 기술 상세 문서 | 개발자/AI |
| `ENV_SETUP.md` | 환경 변수 가이드 | 신규 개발자 |
| `PROJECT_STRUCTURE.md` | 프로젝트 구조 | 개발자 |

---

### 📄 스마트 컨트랙트 파일

#### `contracts/src/Lottery.sol`
**역할**: 메인 로또 컨트랙트

**주요 기능**:
- 티켓 구매 (`buyTicket`)
- VRF 난수 요청 (`requestRandomWinningNumbers`)
- 당첨금 자동 분배 (`_distributePrizes`)
- 회차 관리 (`createOrUpdateDraw`)

**라인 수**: ~600줄

**핵심 로직**:
```solidity
// 티켓 구매
function buyTicket(uint256 drawId, uint8[6] memory numbers) 
    external payable nonReentrant

// VRF 콜백 (자동 호출)
function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) 
    internal override

// 당첨금 분배 (내부)
function _distributePrizes(uint256 drawId) private
```

---

#### `contracts/src/MockVRF.sol`
**역할**: 테스트용 VRF (난수 생성기)

**주요 기능**:
- 난수 생성 시뮬레이션
- `fulfillRequest()` 수동 호출

**라인 수**: ~100줄

**사용 시기**: 테스트넷에서만 사용 (메인넷에서는 실제 Orakl VRF 사용)

---

#### `contracts/script/Deploy.s.sol`
**역할**: 컨트랙트 배포 스크립트

**실행 방법**:
```bash
forge script script/Deploy.s.sol \
    --rpc-url $KAIA_KAIROS_RPC_URL \
    --broadcast \
    --legacy
```

**출력**:
- Lottery 컨트랙트 주소
- MockVRF 컨트랙트 주소

---

### 📄 Frontend 파일

#### `frontend/src/app/page.tsx`
**역할**: 메인 UI (전체 로또 인터페이스)

**라인 수**: ~1,800줄

**주요 섹션**:
1. **State 관리** (1-150줄)
2. **Hooks** (150-400줄)
   - `useEffect` (초기화)
   - 데이터 로딩 함수
3. **컨트랙트 함수** (400-1000줄)
   - `buyTicket`
   - `requestWinningNumbers`
   - `setTestWinningNumbers` (테스트용)
4. **UI 컴포넌트** (1000-1800줄)
   - 사용자 뷰
   - 관리자 패널
   - 당첨 조회

**주요 기능**:
```typescript
// 지갑 연결
const connectWallet = async () => { ... }

// 티켓 구매
const buyTicket = async () => { ... }

// 당첨번호 설정 (관리자)
const setTestWinningNumbers = async () => { ... }
```

---

#### `frontend/src/abi/*.json`
**역할**: 컨트랙트 ABI (Application Binary Interface)

**생성 방법**:
```bash
cd contracts
forge build
cp out/Lottery.sol/Lottery.json ../frontend/src/abi/LotteryABI.json
```

**사용 예시**:
```typescript
import lottoAbi from '@/abi/LotteryABI.json';
const contract = new ethers.Contract(address, lottoAbi, provider);
```

---

## 🔄 데이터 흐름

### 티켓 구매 플로우
```
사용자 입력 (page.tsx)
    ↓
buyTicket() 함수 호출
    ↓
ethers.js → MetaMask
    ↓
Kaia Blockchain
    ↓
Lottery.sol → buyTicket()
    ↓
티켓 저장 → 이벤트 발생
    ↓
Frontend 갱신 (loadContractData)
```

### 당첨금 분배 플로우
```
관리자 (page.tsx)
    ↓
setTestWinningNumbers() 호출
    ↓
Lottery.sol → setWinningNumbersForTest()
    ↓
_distributePrizes() 자동 실행
    ↓
당첨자 검증 → 상금 계산
    ↓
KAIA 전송 (transfer)
    ↓
PrizeDistributed 이벤트
    ↓
Frontend → loadPrizeDistributions()
```

---

## 📦 빌드 결과물

### Smart Contract
```bash
# 컴파일
forge build

# 결과물 위치
contracts/out/Lottery.sol/Lottery.json
contracts/out/MockVRF.sol/MockVRF.json
```

### Frontend
```bash
# 개발 빌드
npm run dev

# 프로덕션 빌드
npm run build

# 결과물 위치
frontend/.next/
```

---

## 🚫 Git에서 제외되는 파일

### 절대 커밋하면 안 되는 파일
```
❌ .env                    # Private Key 포함!
❌ .env.local              # 환경 변수
❌ private-key.txt         # Private Key 파일
❌ contracts/broadcast/    # 배포 기록 (계정 정보 포함)
```

### 자동 생성 파일 (제외)
```
📁 node_modules/          # npm 패키지
📁 .next/                 # Next.js 빌드
📁 out/                   # Foundry 컴파일
📁 cache/                 # Foundry 캐시
```

---

## 🔍 파일 크기 참고

| 파일 | 라인 수 | 크기 |
|------|---------|------|
| `Lottery.sol` | ~600 | ~25KB |
| `page.tsx` | ~1,800 | ~70KB |
| `README.md` | ~400 | ~18KB |
| `TECHNICAL.md` | ~700 | ~30KB |

---

## 🎯 신규 개발자를 위한 시작점

### 1️⃣ 전체 이해하기
1. `README.md` 읽기
2. `QUICKSTART.md` 따라하기
3. `TECHNICAL.md` 참고

### 2️⃣ 코드 탐색 순서
1. `frontend/src/app/page.tsx` (UI 전체)
2. `contracts/src/Lottery.sol` (비즈니스 로직)
3. `contracts/script/Deploy.s.sol` (배포)

### 3️⃣ 수정 시작하기
1. UI 변경 → `page.tsx`
2. 로직 변경 → `Lottery.sol`
3. 배포 스크립트 → `Deploy.s.sol`

---

## 🔧 개발 워크플로우

### Frontend 개발
```bash
cd frontend
npm run dev          # 개발 서버 실행
# 파일 수정 → 자동 새로고침
npm run build        # 프로덕션 빌드 테스트
```

### Contract 개발
```bash
cd contracts
forge build          # 컴파일
forge test           # 테스트 실행
forge script ...     # 배포
```

### 통합 워크플로우
```bash
# 1. Contract 수정
cd contracts && forge build

# 2. ABI 업데이트
cp out/Lottery.sol/Lottery.json ../frontend/src/abi/LotteryABI.json

# 3. Frontend 새로고침
cd ../frontend && npm run dev

# 4. 테스트
# 브라우저에서 확인
```

---

## 📚 추가 리소스

### 프로젝트 내부
- `contracts/test/` - 단위 테스트
- `frontend/public/` - 정적 리소스
- `.github/` - GitHub Actions (CI/CD)

### 외부 문서
- [Foundry Book](https://book.getfoundry.sh/)
- [Next.js Docs](https://nextjs.org/docs)
- [ethers.js Docs](https://docs.ethers.org/)
- [Kaia Docs](https://docs.kaia.io/)

---

**💡 팁**: 
- VS Code에서 `Ctrl+P` → 파일명 입력으로 빠른 탐색
- `Ctrl+Shift+F`로 전체 프로젝트 검색
- Git Graph 확장으로 커밋 히스토리 확인

**Happy Coding! 🚀**


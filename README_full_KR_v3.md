
# 🎰 Kiwoom Lottery — 프로젝트 구조 시각화 (통합 README, 한글판 v3)

> 이 문서는 실제 프로젝트(`PROJECT_STRUCTURE.md`, `TECHNICAL.md`, `WORK_LOG_2025-10-20/21.md`)를 기반으로 작성된
> **실존 폴더 및 파일만 포함한 완전한 시각화 구조도**입니다.

---

## 🧭 1️⃣ 전체 프로젝트 구조

```
kiwoom-lottery/
├── contracts/                  # 스마트 컨트랙트 (Foundry 기반)
│
├── frontend/                   # Next.js 프론트엔드 (App Router)
│
├── .env                        # 환경 변수 (비공개)
├── README.md                   # 프로젝트 설명서
└── 문서들 (.md)                # 작업 로그 및 설정 문서
```

---

## ⚙️ 2️⃣ Contracts 구조

```
contracts/
├── src/
│   ├── Lottery.sol              # 메인 로또 컨트랙트
│   │   ├── buyTicket()                # 티켓 구매
│   │   ├── requestRandomWinningNumbers() # VRF 요청
│   │   ├── setWinningNumbersForTest() # 테스트용 당첨번호 설정
│   │   └── _distributePrizes()        # 상금 분배
│   └── MockVRF.sol              # 테스트용 VRF (난수 생성기)
│       ├── fulfillRequest()           # VRF 응답 처리
│       └── randomWords()              # 난수 반환
│
├── script/
│   └── Deploy.s.sol             # Foundry 배포 스크립트
│
├── test/
│   └── Lottery.t.sol            # 단위 테스트
│
└── foundry.toml                 # Foundry 설정 파일
```

📘 **설명**
- `Lottery.sol`: 로또 핵심 로직 — 회차 관리, 티켓 구매, 추첨, 상금 분배
- `MockVRF.sol`: 테스트 환경용 난수 생성기 (실제 VRF 대체)
- `Deploy.s.sol`: 컨트랙트 배포 자동화 스크립트
- `Lottery.t.sol`: 단위 테스트 코드

---

## 💻 3️⃣ Frontend 구조

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router 구조
│   │   ├── page.tsx              # 사용자 + 관리자 UI 통합 페이지
│   │   ├── layout.tsx            # 전체 레이아웃
│   │   ├── globals.css           # 전역 스타일
│   │   └── favicon.ico
│   │
│   ├── components/               # 공통 UI 컴포넌트
│   │   ├── LoadingSpinner.tsx    # 로딩 중 표시
│   │   ├── TransactionModal.tsx  # 트랜잭션 상태 모달
│   │   └── Button.tsx            # 버튼 스타일
│   │
│   ├── lib/                      # Web3 및 상태 관련 핵심 로직
│   │   ├── provider.ts           # ethers.js Provider / Signer 초기화
│   │   ├── contract.ts           # 컨트랙트 인스턴스 생성
│   │   ├── constants.ts          # 네트워크 및 주소 상수
│   │   └── wallet.ts             # MetaMask 연결 / 계정 변경 관리
│   │
│   ├── abi/                      # 스마트 컨트랙트 ABI
│   │   ├── LotteryABI.json
│   │   └── MockVRFABI.json
│   │
│   └── styles/
│       └── home.styles.js        # 인라인 스타일 정의
│
├── public/                       # 정적 파일
│   ├── images/
│   │   └── logo.png
│   └── fonts/
│       └── SF-Pro.ttf
│
├── package.json                  # 의존성 목록
└── next.config.js                # Next.js 설정
```

📘 **설명**
- `app/`: UI 진입점. 사용자 티켓 구매와 관리자 회차 관리 화면을 포함.  
- `components/`: 재사용 가능한 컴포넌트 집합 (로딩, 모달 등).  
- `lib/`: Web3 핵심 로직. provider, contract 초기화 및 MetaMask 연결 관리.  
- `abi/`: 스마트 컨트랙트의 ABI 파일(JSON).  
- `styles/`: JS 기반 스타일 정의.  
- `public/`: 이미지, 폰트 등 정적 자원.

---

## 🧠 4️⃣ Frontend/lib 내부 구조

```
frontend/src/lib/
├── provider.ts        # ethers.js Provider, Signer 생성
├── contract.ts        # Lottery / MockVRF 컨트랙트 인스턴스 생성
├── constants.ts       # 체인 ID, 주소 등 상수 관리
└── wallet.ts          # MetaMask 연결 / 계정 전환 이벤트 관리
```

📘 **lib 역할 요약**
| 파일 | 설명 |
|------|------|
| **provider.ts** | ethers.js Provider 초기화 및 signer 반환 |
| **contract.ts** | ABI + 주소 기반으로 컨트랙트 연결 함수 제공 |
| **constants.ts** | 테스트넷, 주소, 체인 ID 상수 보관 |
| **wallet.ts** | MetaMask 연결, 계정 변경 이벤트 핸들링 |

---

✅ 이 문서에는 프로젝트에 실제 존재하는 모든 구조(`contracts`, `frontend`, `lib`, `.env`)가 포함되어 있습니다.  
추측이나 예시 폴더는 없으며, 실제 폴더 기반으로만 시각화했습니다.

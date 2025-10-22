
# 🎰 Kiwoom Lottery — 단계별 온보딩 가이드 (통합 README, 한글판)

> 이 문서 하나로 프로젝트 클론부터 실행, 테스트, (선택 시) 배포까지 모두 따라 할 수 있습니다.  
> 주니어 개발자도 그대로 순서대로 입력만 하면 작동하도록 작성되었습니다.

---

## 0) 이 문서로 할 수 있는 것 (약 30~60분 소요)

- Kaia Kairos 테스트넷과 연결된 로컬 Next.js UI 실행
- 테스트 KAIA로 로또 티켓 구매
- (선택) 관리자 모드에서 회차 생성 / 종료 / 추첨 (Mock VRF 사용) / 자동 상금 분배 확인
- 전체 폴더 구조 및 데이터 흐름 이해

---

## 1️⃣ 사전 준비 (최초 1회 설치)

필수 설치 프로그램:

| 항목 | 설치 링크 |
|------|------------|
| Node.js 18 이상 | https://nodejs.org/ |
| Git | https://git-scm.com/ |
| MetaMask (Chrome 확장) | https://metamask.io/ |
| (선택) Foundry (스마트 컨트랙트용) | https://book.getfoundry.sh/ |

버전 확인:
```bash
node --version
git --version
```

Foundry 설치 (선택):
```bash
# macOS / Linux
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## 2️⃣ 프로젝트 클론하기

```bash
git clone https://github.com/junhyupoh98/lottery-test.git
cd lottery-test
```

폴더 구조가 아래와 같이 보이면 정상입니다:
```
contracts/
frontend/
README.md 등 문서들
```

---

## 3️⃣ MetaMask 네트워크 추가

MetaMask → 네트워크 → “네트워크 추가” → “직접 추가” 클릭 후 다음 입력:

| 항목 | 값 |
|------|----|
| 네트워크 이름 | Kaia Kairos Testnet |
| RPC URL | https://public-en-kairos.node.kaia.io |
| Chain ID | 1001 |
| 통화 기호 | KAIA |
| 블록 탐색기 | https://baobab.klaytnscope.com |

> **오류 해결:**  
> “missing revert data / Internal JSON-RPC error” 발생 시 기존 Kaia/Klaytn 테스트넷 삭제 후 위 정보로 새로 추가하고 페이지를 **Ctrl + Shift + R**로 새로고침하세요.

---

## 4️⃣ 테스트 KAIA 받기

[https://faucet.kaia.io/](https://faucet.kaia.io/) 접속 → 지갑 주소 입력 → **테스트 KAIA 수령**  
(가스비 포함 0.2 KAIA 이상 보유 권장)

---

## 5️⃣ 환경 변수 설정 (.env)

루트 폴더(`kiwoom-lottery/`)에서 `.env` 파일 생성:
```bash
touch .env
```

아래 내용 복사 후 붙여넣기:
```env
PRIVATE_KEY=your_private_key_without_0x_prefix
KAIA_KAIROS_RPC_URL=https://public-en-kairos.node.kaia.io

NEXT_PUBLIC_CONTRACT_ADDRESS=0x2e7bb733b7813628a46130fa48b9f9cdda29e088
NEXT_PUBLIC_MOCK_VRF_ADDRESS=0xbb1ced5b060cc67af8c393844b1d3054afb90273
NEXT_PUBLIC_OWNER_ADDRESS=0x6Cc5339ec1072F3e232F41c799c511aa30FaD165
```

**주의사항**
- `.env` 파일은 `.gitignore`에 포함되어야 합니다.  
- Private Key는 배포용 테스트 계정으로만 사용하세요.  
- 위 주소들은 이미 배포된 컨트랙트이므로 바로 테스트 가능합니다.

---

## 6️⃣ 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.  
MetaMask를 **Kaia Kairos** 네트워크로 전환한 뒤, “Connect Wallet” 버튼을 눌러 연결 승인.

---

## 7️⃣ 사용자 테스트 (티켓 구매)

1. MetaMask 연결  
2. 번호 6개 선택 (1~45, 중복 불가)  
3. “🎫 티켓 구매 (0.01 KAIA)” 클릭  
4. MetaMask 트랜잭션 승인  
5. “내 티켓” 탭에서 구매 내역 확인  

문제 발생 시:
- 네트워크가 Kaia Kairos인지 확인  
- 잔액이 충분한지 확인 (≥0.02 KAIA)
- 페이지 새로고침 후 다시 시도

---

## 8️⃣ 관리자 기능 (선택)

관리자 기능은 두 가지 방법으로 접근할 수 있습니다:

### (A) 기존 배포된 컨트랙트 사용
`.env`의 `NEXT_PUBLIC_OWNER_ADDRESS` 값이 현재 MetaMask 계정 주소와 동일하면  
관리자 패널이 자동으로 표시됩니다.  

가능한 기능:
- 회차 생성 및 종료  
- VRF 요청 (MockVRF)  
- 테스트용 당첨번호 수동 설정  
- 상금 분배 실행  

### (B) 새로운 컨트랙트 직접 배포

Foundry 설치 후 아래 실행:
```bash
cd contracts
forge build
forge script script/Deploy.s.sol   --rpc-url $KAIA_KAIROS_RPC_URL   --broadcast   --legacy
```
출력된 주소를 `.env`에 복사:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=배포된_Lottery_주소
NEXT_PUBLIC_MOCK_VRF_ADDRESS=배포된_MockVRF_주소
NEXT_PUBLIC_OWNER_ADDRESS=본인_지갑주소
```

서버 재시작 후 관리자 권한으로 실행됩니다.

---

## 9️⃣ 추첨 전체 흐름 (Mock VRF 기준)

| 단계 | 설명 |
|------|------|
| 1 | 관리자 → 회차 생성 (판매 시작) |
| 2 | 사용자 → 티켓 구매 |
| 3 | 관리자 → 회차 종료 |
| 4 | 관리자 → `requestRandomWinningNumbers(drawId)` 호출 |
| 5 | Mock VRF → `fulfillRequest(requestId)` 호출 |
| 6 | 컨트랙트 자동으로 `_distributePrizes()` 실행 |

※ `drawId`와 `requestId`는 다를 수 있습니다.  
UI 상단의 “VRF 요청 이력”에서 자동 조회됩니다.

---

## 🔩 프로젝트 구조

```
contracts/
  src/
    Lottery.sol          # 메인 컨트랙트
    MockVRF.sol          # 테스트용 VRF
  script/
    Deploy.s.sol         # 배포 스크립트
frontend/
  src/app/page.tsx       # UI 전체 (사용자 + 관리자)
  src/abi/*.json         # ABI 정의
.env                      # 환경 변수 (비공개)
```

데이터 흐름:
```
UI → ethers.js → MetaMask → Kaia Kairos → Lottery.sol
                         ↑
              MockVRF에서 난수 반환
```

---

## 🧠 문제 해결 (Troubleshooting)

| 문제 | 원인 | 해결 방법 |
|------|------|------------|
| RPC 오류 (missing revert data) | RPC 주소 잘못됨 | Kaia Kairos 네트워크 재등록 |
| “Cannot read properties of undefined” | .env 누락 | .env 작성 후 npm run dev 재시작 |
| 트랜잭션 실패 | 잔액 부족 | Faucet에서 KAIA 추가 |
| MockVRF 작동 안 함 | requestId 잘못 입력 | “VRF 요청 이력”에서 최신 requestId 선택 |

---

## 🧩 유용한 명령어

```bash
# 프론트엔드 실행
cd frontend
npm run dev

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# Foundry (스마트 컨트랙트)
cd contracts
forge build
forge test
forge script script/Deploy.s.sol --rpc-url $KAIA_KAIROS_RPC_URL --broadcast --legacy
```

---

## 📊 개발 현황

| 항목 | 상태 | 완성도 |
|------|------|--------|
| 스마트 컨트랙트 | ✅ 완료 | 90% |
| VRF 연동 | ✅ 완료 | 100% |
| 테스트넷 배포 | ✅ 완료 | 100% |
| 프론트엔드 | 🚧 진행 중 | 40% |

---

## 🚀 향후 계획

| 우선순위 | 항목 | 설명 |
|-----------|------|------|
| 🔥 | 실제 Orakl VRF 연동 | MockVRF → Orakl VRF |
| 🔥 | 자동 회차 종료 | Chainlink Automation |
| ⚙️ | 과거 회차 조회 | 페이지네이션, 필터 |
| 📊 | 통계 대시보드 | 판매액, 당첨자 수 등 |
| 🔔 | 알림 시스템 | 트랜잭션 상태 알림 |

---

## ⚠️ 보안 유의사항

- `.env` 파일은 절대 커밋하지 말 것  
- 메인넷 Private Key 사용 금지  
- 테스트넷 계정만 사용  
- Discord / Slack 등지에 키 공유 금지  

---

## 🙋‍♀️ 제작자 정보

| 역할 | 이름 |
|------|------|
| PM / Frontend | Eunseo Kim |
| Smart Contract | Junhyup Oh |
| Design & QA | Team Kiwoom |

---

✅ **이 문서 하나로 클론 → 설정 → 실행 → 티켓 구매 → 추첨 → 분배까지 가능합니다.**

# ⚡ 빠른 시작 가이드 (Quick Start)

5분 안에 로또 DApp 실행하기! 🚀

---

## 🎯 목표

- ✅ 프론트엔드 실행
- ✅ MetaMask 연결
- ✅ 티켓 구매 테스트

---

## 📋 사전 준비

### 1. 필수 도구 설치

```bash
# Node.js 18+ 확인
node --version

# Git 확인
git --version
```

### 2. MetaMask 설치
- [Chrome 확장 프로그램](https://metamask.io/download/)
- 지갑 생성 또는 복원

### 3. Kaia Kairos 네트워크 추가

MetaMask에서:
1. 네트워크 선택
2. "네트워크 추가" 클릭
3. 아래 정보 입력:

```
네트워크 이름: Kaia Kairos
RPC URL: https://public-en-kairos.node.kaia.io
Chain ID: 1001
통화 기호: KAIA
Block Explorer: https://kairos.kaiascan.io
```

### 4. 테스트 KAIA 받기
- [Kaia Faucet](https://faucet.kaia.io/) 방문
- 지갑 주소 입력
- 테스트 KAIA 받기

---

## 🚀 실행 (3단계)

### Step 1: 프로젝트 클론

```bash
git clone https://github.com/junhyupoh98/lottery-test.git
cd lottery-test
```

### Step 2: Frontend 설치 및 실행

```bash
cd frontend
npm install
npm run dev
```

**출력 예시**:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### Step 3: 브라우저에서 열기

```
http://localhost:3000
```

---

## 🎮 첫 티켓 구매하기

### 1. 지갑 연결
- "🦊 MetaMask 연결" 버튼 클릭
- MetaMask 팝업에서 승인

### 2. 번호 선택
- 1~45 중 6개 번호 선택
- 또는 "🎲 자동 선택" 클릭

### 3. 티켓 구매
- "🎫 티켓 구매 (0.01 KAIA)" 버튼 클릭
- MetaMask에서 트랜잭션 승인
- 약 3초 후 완료!

### 4. 티켓 확인
- "내 티켓" 탭 클릭
- 구매한 티켓 확인

---

## 🎯 관리자 기능 테스트 (선택)

### 방법 1: 기존 컨트랙트 사용
- Owner 지갑 주소로 연결
- 관리자 패널 자동 표시

### 방법 2: 새 컨트랙트 배포
```bash
# 1. .env 파일 생성
cd lottery-test
nano .env

# 2. Private Key 추가
PRIVATE_KEY=your_private_key_here
KAIA_KAIROS_RPC_URL=https://public-en-kairos.node.kaia.io

# 3. 컨트랙트 배포
cd contracts
forge script script/Deploy.s.sol \
    --rpc-url $KAIA_KAIROS_RPC_URL \
    --broadcast \
    --legacy

# 4. 배포된 주소 복사
# Lottery: 0x...
# MockVRF: 0x...

# 5. frontend/.env.local 업데이트
cd ../frontend
nano .env.local

NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_LOTTERY_ADDRESS
NEXT_PUBLIC_MOCK_VRF_ADDRESS=0xYOUR_MOCK_VRF_ADDRESS
NEXT_PUBLIC_OWNER_ADDRESS=0xYOUR_WALLET_ADDRESS

# 6. 개발 서버 재시작
npm run dev
```

---

## 🎰 전체 플로우 테스트

### 1. 새 회차 생성 (관리자)
```
관리자 패널 > "✨ 추첨 생성 및 활성화"
```

### 2. 티켓 구매 (사용자)
```
번호 선택 > "🎫 티켓 구매"
```

### 3. 당첨번호 설정 (관리자)
```
관리자 패널 > "🎯 테스트용 당첨번호 직접 설정"
회차: 5
번호: 1, 7, 15, 23, 32, 45
"🎯 당첨번호 설정 및 당첨금 분배" 클릭
```

### 4. 당첨 확인 (사용자)
```
"당첨 내역" 탭 > 회차 선택 > 결과 확인
```

---

## 📱 다른 사람과 함께 테스트

### Vercel 배포 (전세계 접속 가능)

```bash
# 1. Vercel 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 배포
cd frontend
vercel --prod

# 4. URL 공유
# https://your-app.vercel.app
```

친구에게 URL 공유 → 함께 로또 참여!

---

## 🐛 문제 해결

### "Module not found" 오류
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### MetaMask 연결 안 됨
1. MetaMask 잠금 해제 확인
2. Kaia Kairos 네트워크 선택 확인
3. 페이지 새로고침

### 트랜잭션 실패
1. KAIA 잔액 확인 (최소 0.1 KAIA)
2. 가스비 충분한지 확인
3. 번호 중복 확인 (1~45 사이)

### "Cannot read properties of undefined"
- `.env.local` 파일 확인
- 환경 변수 올바른지 확인
- 개발 서버 재시작

---

## 📚 다음 단계

### 더 알아보기
- 📖 [README.md](./README.md) - 전체 프로젝트 개요
- 🔧 [TECHNICAL.md](./TECHNICAL.md) - 기술 문서
- 🔑 [ENV_SETUP.md](./ENV_SETUP.md) - 환경 변수 상세 가이드

### 기능 추가하기
- 🎨 UI 커스터마이징
- 📊 통계 대시보드 추가
- 🔔 알림 기능 구현
- 🌙 다크 모드 추가

### 실전 배포하기
- 🚀 메인넷 배포
- 🔒 보안 강화
- 📈 모니터링 설정
- 🎯 마케팅 시작

---

## ⏱ 타임라인

| 시간 | 작업 |
|------|------|
| 0분 | 프로젝트 클론 |
| 1분 | 패키지 설치 |
| 2분 | 개발 서버 실행 |
| 3분 | MetaMask 연결 |
| 4분 | 티켓 구매 |
| 5분 | ✅ 완료! |

---

## 🎉 성공!

축하합니다! 🎊 

이제 블록체인 로또 DApp을 성공적으로 실행했습니다!

**다음 할 일**:
- [ ] 친구 초대해서 함께 테스트
- [ ] GitHub Star ⭐ 눌러주기
- [ ] 피드백 공유 (Issues)
- [ ] 코드 커스터마이징

---

**💬 질문이 있나요?**
- GitHub Issues: [이슈 등록]
- Discord: [커뮤니티 참여]

**Happy Coding! 🚀**


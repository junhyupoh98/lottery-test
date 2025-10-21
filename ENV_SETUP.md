# 🔧 환경 변수 설정 가이드

## 📋 필요한 환경 변수

프로젝트를 실행하려면 루트 디렉토리에 `.env` 파일을 생성하고 아래 변수들을 설정해야 합니다.

---

## 🚀 빠른 설정

### 1. `.env` 파일 생성

루트 디렉토리(`kiwoom-lottery/`)에서:

```bash
touch .env
```

### 2. 아래 내용 복사 후 실제 값으로 변경

```env
# Smart Contract 배포용 (Foundry)
PRIVATE_KEY=your_private_key_here_without_0x_prefix
KAIA_KAIROS_RPC_URL=https://public-en-kairos.node.kaia.io

# Frontend 환경 변수 (Next.js)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x2e7bb733b7813628a46130fa48b9f9cdda29e088
NEXT_PUBLIC_MOCK_VRF_ADDRESS=0xbb1ced5b060cc67af8c393844b1d3054afb90273
NEXT_PUBLIC_OWNER_ADDRESS=0x6Cc5339ec1072F3e232F41c799c511aa30FaD165
```

---

## 🔑 각 변수 설명

### `PRIVATE_KEY`
- **목적**: 스마트 컨트랙트 배포 및 관리자 작업용
- **형식**: 64자 16진수 (0x 접두사 제외)
- **획득 방법**:
  1. MetaMask 열기
  2. 계정 메뉴 (⋮) 클릭
  3. "계정 상세 정보" 선택
  4. "개인키 내보내기" 클릭
  5. 비밀번호 입력 후 개인키 복사
- **예시**: `1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`
- **⚠️ 주의**: 절대 공개하지 마세요!

### `KAIA_KAIROS_RPC_URL`
- **목적**: Kaia Kairos Testnet 연결
- **기본값**: `https://public-en-kairos.node.kaia.io`
- **변경 불필요**: 기본값 사용

### `NEXT_PUBLIC_CONTRACT_ADDRESS`
- **목적**: 배포된 Lottery 컨트랙트 주소
- **형식**: 0x로 시작하는 42자 주소
- **획득 방법**: 컨트랙트 배포 후 자동 출력됨
- **기본값**: `0x2e7bb733b7813628a46130fa48b9f9cdda29e088` (이미 배포된 컨트랙트)

### `NEXT_PUBLIC_MOCK_VRF_ADDRESS`
- **목적**: 테스트용 MockVRF 컨트랙트 주소
- **형식**: 0x로 시작하는 42자 주소
- **기본값**: `0xbb1ced5b060cc67af8c393844b1d3054afb90273` (이미 배포된 컨트랙트)

### `NEXT_PUBLIC_OWNER_ADDRESS`
- **목적**: 관리자 지갑 주소 (UI에서 관리자 패널 표시용)
- **형식**: 0x로 시작하는 42자 주소
- **획득 방법**: MetaMask에서 계정 주소 복사
- **예시**: `0x6Cc5339ec1072F3e232F41c799c511aa30FaD165`

---

## 📝 시나리오별 설정

### 시나리오 1: 기존 배포된 컨트랙트 사용 (추천)

이미 배포된 컨트랙트를 그대로 사용하려면:

```env
# 컨트랙트 배포 불필요
PRIVATE_KEY=your_private_key_here

# 이미 배포된 컨트랙트 주소 사용
KAIA_KAIROS_RPC_URL=https://public-en-kairos.node.kaia.io
NEXT_PUBLIC_CONTRACT_ADDRESS=0x2e7bb733b7813628a46130fa48b9f9cdda29e088
NEXT_PUBLIC_MOCK_VRF_ADDRESS=0xbb1ced5b060cc67af8c393844b1d3054afb90273
NEXT_PUBLIC_OWNER_ADDRESS=0x6Cc5339ec1072F3e232F41c799c511aa30FaD165
```

**장점**: 즉시 사용 가능, 배포 불필요

**주의**: 
- Owner가 다른 사람이므로 관리자 기능 사용 불가
- 일반 사용자로만 테스트 가능 (티켓 구매, 조회)

---

### 시나리오 2: 새로운 컨트랙트 배포

자신만의 컨트랙트를 배포하려면:

```env
# 당신의 Private Key (관리자가 됨)
PRIVATE_KEY=your_private_key_here
KAIA_KAIROS_RPC_URL=https://public-en-kairos.node.kaia.io

# 배포 후 자동으로 출력된 주소로 변경
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
NEXT_PUBLIC_MOCK_VRF_ADDRESS=0xYOUR_DEPLOYED_MOCK_VRF_ADDRESS
NEXT_PUBLIC_OWNER_ADDRESS=0xYOUR_WALLET_ADDRESS
```

**배포 방법**:
```bash
cd contracts
forge script script/Deploy.s.sol \
    --rpc-url $KAIA_KAIROS_RPC_URL \
    --broadcast \
    --legacy
```

**장점**: 
- 관리자 권한 보유
- 모든 기능 테스트 가능

---

### 시나리오 3: Frontend만 실행 (로컬 개발)

컨트랙트는 건드리지 않고 프론트엔드만 개발하려면:

```env
# Private Key 불필요 (컨트랙트 배포 안 함)

# 기존 배포된 컨트랙트 사용
NEXT_PUBLIC_CONTRACT_ADDRESS=0x2e7bb733b7813628a46130fa48b9f9cdda29e088
NEXT_PUBLIC_MOCK_VRF_ADDRESS=0xbb1ced5b060cc67af8c393844b1d3054afb90273
NEXT_PUBLIC_OWNER_ADDRESS=0x6Cc5339ec1072F3e232F41c799c511aa30FaD165
```

```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 보안 주의사항

### ✅ DO (해야 할 것)
- ✅ `.env` 파일은 `.gitignore`에 추가되어 있는지 확인
- ✅ Private Key는 절대 공유하지 않기
- ✅ 테스트넷 계정만 사용 (메인넷 계정 X)
- ✅ 환경 변수는 서버/로컬에만 저장

### ❌ DON'T (하지 말아야 할 것)
- ❌ Private Key를 코드에 하드코딩
- ❌ `.env` 파일을 Git에 커밋
- ❌ Private Key를 Discord, Slack 등에 공유
- ❌ 메인넷 Private Key 사용

---

## 🧪 환경 변수 확인

설정이 올바른지 확인:

```bash
# .env 파일 존재 확인
ls -la | grep .env

# Frontend 환경 변수 확인 (로컬 실행 후)
cd frontend
npm run dev
# 브라우저 콘솔에서: console.log(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)

# Foundry 환경 변수 확인
echo $PRIVATE_KEY
echo $KAIA_KAIROS_RPC_URL
```

---

## 🌐 Vercel 환경 변수 설정

Vercel에 배포할 때는 Dashboard에서 직접 설정:

1. Vercel 프로젝트 선택
2. **Settings** > **Environment Variables**
3. 아래 변수 추가:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x2e7b...e088` | All |
| `NEXT_PUBLIC_MOCK_VRF_ADDRESS` | `0xbb1c...0273` | All |
| `NEXT_PUBLIC_OWNER_ADDRESS` | `0x6Cc5...D165` | All |

**주의**: 
- `PRIVATE_KEY`는 Vercel에 추가하지 마세요! (프론트엔드에서 불필요)
- `NEXT_PUBLIC_` 접두사가 있어야 브라우저에서 접근 가능

---

## 🐛 문제 해결

### 오류: "Cannot find module '.env'"
**해결**: `.env` 파일이 루트 디렉토리에 있는지 확인

### 오류: "Invalid private key"
**해결**: 
- Private Key에서 `0x` 접두사 제거
- 64자 16진수인지 확인

### 오류: "Network not supported"
**해결**: MetaMask에 Kaia Kairos 네트워크 추가

### Frontend에서 환경 변수 안 읽힘
**해결**: 
- `NEXT_PUBLIC_` 접두사 확인
- 개발 서버 재시작 (`npm run dev`)

---

## 📞 추가 도움

문제가 계속되면 GitHub Issues에 문의하세요:
- `.env` 파일 구조 스크린샷 (Private Key는 가리고)
- 오류 메시지
- 실행 환경 (OS, Node 버전)

**⚠️ 절대 Private Key는 공유하지 마세요!**


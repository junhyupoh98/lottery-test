# 🦊 MetaMask Kaia Kairos 네트워크 설정 가이드

## ❌ 발생하는 에러

```
missing revert data (action="call", data=null, reason=null...)
MetaMask - RPC Error: Internal JSON-RPC error
```

이 에러는 **MetaMask의 RPC 설정이 잘못되었을 때** 발생합니다.

---

## ✅ 해결 방법

### Option 1: 네트워크 수정 (추천)

1. **MetaMask 열기**
2. 상단 네트워크 클릭
3. **Kaia Kairos** 또는 **Klaytn Baobab** 찾기
4. 톱니바퀴(⚙️) 클릭
5. **RPC URL 수정**:

```
https://public-en-kairos.node.kaia.io
```

6. 저장

---

### Option 2: 네트워크 새로 추가 (권장)

기존 네트워크가 문제가 있다면 완전히 삭제하고 새로 추가:

#### 1단계: 기존 네트워크 삭제
- MetaMask → 설정 → 네트워크
- Kaia Kairos / Klaytn Baobab 찾아서 삭제

#### 2단계: 새 네트워크 추가
- MetaMask → 설정 → 네트워크 → 네트워크 추가

**입력할 정보:**

| 항목 | 값 |
|------|-----|
| **네트워크 이름** | `Kaia Kairos Testnet` |
| **RPC URL** | `https://public-en-kairos.node.kaia.io` |
| **Chain ID** | `1001` |
| **통화 기호** | `KAIA` |
| **블록 탐색기 URL** | `https://baobab.klaytnscope.com` |

---

### Option 3: 다른 RPC URL 시도

공식 RPC가 안 되면 백업 RPC 사용:

**백업 RPC #1:**
```
https://api.baobab.klaytn.net:8651
```

**백업 RPC #2:**
```
https://klaytn-baobab-rpc.allthatnode.com:8651
```

---

## 🔍 확인 방법

네트워크 설정 후:

1. **브라우저 새로고침** (`Ctrl + Shift + R`)
2. **개발자 도구 열기** (`F12`)
3. **Console 탭** 확인

### 성공 시 로그:
```
🔧 환경변수 CONTRACT_ADDRESS: 0x21c0ccacd367c8e7ce5ac69d17c257c34393b25f
🌐 현재 연결된 네트워크: 1001
✅ 컨트랙트 연결 완료
📊 컨트랙트 데이터 로드 시작...
🔍 Contract address: 0x21c0cCACd367C8E7CE5aC69d17C257c34393B25f
```

### 실패 시 로그:
```
❌ 컨트랙트 데이터 로드 실패
⚠️ RPC 통신 오류!
```

---

## 💡 추가 팁

### 1. MetaMask 리셋 (최후의 수단)

MetaMask → 설정 → 고급 → 계정 재설정

⚠️ **주의**: 이 방법은 트랜잭션 히스토리를 지웁니다 (지갑 잔액은 유지됨)

### 2. 네트워크 전환 확인

프론트엔드에서 자동으로 네트워크 전환을 요청합니다.
MetaMask 팝업이 뜨면 **승인**해주세요!

### 3. KAIA 토큰 받기 (테스트넷)

https://faucet.kaia.io/ 에서 무료로 받을 수 있습니다.

---

## 🚨 여전히 안 되면?

1. **MetaMask 업데이트** - 최신 버전 사용
2. **브라우저 재시작**
3. **시크릿 모드**에서 테스트
4. **다른 브라우저**에서 테스트 (Chrome, Brave 등)

---

## 📞 도움 요청

여전히 문제가 있다면:

1. **브라우저 콘솔 로그** 전체 복사
2. **MetaMask 네트워크 설정** 스크린샷
3. **에러 메시지** 전체 복사

이 정보와 함께 문의해주세요!

---

**마지막 업데이트**: 2025-10-21


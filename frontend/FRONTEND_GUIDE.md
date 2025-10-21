# 🎨 Kiwoom Lottery Frontend Guide

## 📋 현재 구현된 기능

### ✅ UI/UX
- [x] 반응형 디자인 (모바일/태블릿/데스크톱) ⭐ 개선됨
- [x] 그라데이션 배경 (Purple-Blue-Indigo)
- [x] Glassmorphism 스타일
- [x] 커스텀 스크롤바
- [x] 호버 애니메이션
- [x] 터치 피드백 (모바일)
- [x] 트랜잭션 상태 모달 ⭐ NEW
- [x] 로딩 스피너 컴포넌트 ⭐ NEW

### ✅ 핵심 기능 (완전 구현됨!)
- [x] 지갑 연결 로직 (MetaMask)
- [x] 현재 회차 & 잭팟 표시
- [x] 번호 선택 UI (1-45)
- [x] 자동 번호 생성
- [x] 선택된 번호 표시
- [x] 티켓 구매 기능 (트랜잭션)
- [x] 내 티켓 조회 (당첨 여부 포함)
- [x] 상금 분배 내역
- [x] 당첨 번호 조회
- [x] 관리자 패널 (Owner only)
- [x] MockVRF RequestId 자동 조회 ⭐ NEW
- [x] 에러 처리 및 재시도 ⭐ NEW

### ⏳ 구현 필요
- [ ] 실제 VRF 연동 (Orakl VRF)
- [ ] 통계 대시보드
- [ ] 과거 회차 조회 (페이지네이션)
- [ ] 알림 기능
- [ ] 다크모드 토글

---

## 🚀 실행 방법

### 1. 의존성 설치
```bash
cd frontend
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 🎨 UI 구조

### 메인 페이지 구성
```
┌─────────────────────────────────────────┐
│ Header                                   │
│  - 로고                                  │
│  - 지갑 연결 버튼 / 주소 표시             │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Hero Section                             │
│  - 💰 JACKPOT 금액                       │
│  - 🎫 현재 회차                          │
└─────────────────────────────────────────┘
┌──────────────────┬──────────────────────┐
│ 번호 선택         │ 티켓 정보             │
│  - 선택된 번호    │  - 가격               │
│  - 1-45 그리드    │  - 선택 상태          │
│  - 자동 생성      │  - 구매 버튼          │
│  - 초기화         │  - 안내사항           │
└──────────────────┴──────────────────────┘
┌─────────────────────────────────────────┐
│ 🎟️ 내 티켓                               │
│  (구매한 티켓 목록)                       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 🏆 최근 당첨 번호                         │
│  (당첨 번호 히스토리)                     │
└─────────────────────────────────────────┘
```

---

## 🎯 사용자 플로우

### 1. 지갑 미연결 상태
```
[메인 화면]
  └─→ 잭팟 정보 표시
  └─→ "지갑을 연결하여 시작하세요" 메시지
  └─→ [지갑 연결] 버튼
```

### 2. 지갑 연결 후
```
[메인 화면]
  └─→ Header에 지갑 주소 표시
  └─→ [번호 선택] 섹션 활성화
        ├─→ 1-45 그리드에서 6개 선택
        ├─→ 또는 "자동 생성" 클릭
        └─→ 선택 완료 시 [티켓 구매] 버튼 활성화
  └─→ [티켓 구매] 클릭
        ├─→ MetaMask 트랜잭션 승인
        └─→ 구매 완료 후 "내 티켓"에 표시
```

---

## 🎨 디자인 컬러 팔레트

### 배경
- Primary: `from-purple-900 via-blue-900 to-indigo-900`
- Overlay: `bg-white/10` (Glassmorphism)
- Border: `border-white/20`

### 강조색
- Jackpot: `from-yellow-400 via-orange-500 to-red-500`
- Button Primary: `from-pink-500 to-purple-500`
- Button Secondary: `from-green-500 to-emerald-500`
- Selected Number: `from-yellow-400 to-orange-500`

### 텍스트
- Primary: `text-white`
- Secondary: `text-white/80`
- Disabled: `text-white/40`

---

## 📱 반응형 디자인

### 데스크톱 (lg:)
- 2열 그리드 레이아웃
- 번호 그리드: 9열
- 최대 너비: 7xl (1280px)

### 모바일
- 1열 레이아웃
- 번호 그리드: 자동 조정
- 패딩 축소

---

## 🔌 블록체인 연동 계획

### Phase 1: ethers.js 설정
```typescript
// lib/ethers.ts
import { ethers } from 'ethers';
import LottoABI from './lottoAbi.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_LOTTO_CONTRACT_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

export const getSigner = () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
};

export const getContract = (signerOrProvider) => {
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    LottoABI,
    signerOrProvider
  );
};
```

### Phase 2: Hooks 구현
```typescript
// hooks/useLotto.ts
import { useState, useEffect } from 'react';
import { getProvider, getContract } from '@/lib/ethers';

export function useLotto() {
  const [currentDraw, setCurrentDraw] = useState(0);
  const [jackpot, setJackpot] = useState('0');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const provider = getProvider();
    const contract = getContract(provider);
    
    const drawId = await contract.currentDrawId();
    const prize = await contract.prizePool(drawId);
    
    setCurrentDraw(Number(drawId));
    setJackpot(ethers.formatEther(prize));
  };

  return { currentDraw, jackpot, fetchData };
}
```

### Phase 3: 트랜잭션 구현
```typescript
const buyTicket = async (numbers: number[]) => {
  const signer = await getSigner();
  const contract = getContract(signer);
  
  const tx = await contract.buyTicket(
    numbers,
    "ipfs://metadata",
    { value: ethers.parseEther("0.01") }
  );
  
  await tx.wait();
};
```

---

## 🎯 다음 단계

### 우선순위 1 (필수)
1. [ ] ethers.js 설치 및 설정
2. [ ] 환경변수 설정 (.env.local)
3. [ ] 지갑 연결 로직 구현
4. [ ] 컨트랙트 읽기 구현

### 우선순위 2 (핵심 기능)
1. [ ] 티켓 구매 트랜잭션
2. [ ] 내 티켓 조회
3. [ ] 당첨 번호 표시
4. [ ] 트랜잭션 상태 UI

### 우선순위 3 (UX 개선)
1. [ ] 로딩 스피너
2. [ ] 에러 핸들링
3. [ ] Toast 알림
4. [ ] 트랜잭션 히스토리

---

## 📝 현재 상태

✅ **UI 디자인** - 완성  
✅ **번호 선택 로직** - 완성  
⏳ **블록체인 연동** - 준비 단계  
⏳ **트랜잭션 처리** - 미구현  
⏳ **내 티켓 조회** - 미구현  

---

## 🎨 스크린샷 예상

### 지갑 미연결
```
┌─────────────────────────────────────────┐
│  🎰 Kiwoom Lottery     [지갑 연결] 버튼  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│           💰 JACKPOT                     │
│           0 ETH                          │
│        🎫 현재 회차: #0                   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│               🔐                         │
│     지갑을 연결하여 시작하세요            │
│    MetaMask를 연결하고 로또 티켓을        │
│            구매하세요!                   │
│       [지갑 연결하기 버튼]               │
└─────────────────────────────────────────┘
```

### 지갑 연결 후
```
┌─────────────────────────────────────────┐
│  🎰 Kiwoom Lottery     [0x1234...5678]   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│           💰 JACKPOT                     │
│          0.02 ETH                        │
│        🎫 현재 회차: #1                   │
└─────────────────────────────────────────┘
┌──────────────────┬──────────────────────┐
│ 🎯 번호 선택      │ 🎫 티켓 정보          │
│                  │                       │
│ [7][12][23]      │ 티켓 가격: 0.01 ETH   │
│ [31][38][42]     │ 선택: 6 / 6           │
│                  │ 회차: #1              │
│ [1-45 그리드]    │                       │
│                  │ [🎉 티켓 구매하기]     │
│ [🎲 자동][🗑️ 초기화] │                    │
└──────────────────┴──────────────────────┘
```

---

**마지막 업데이트**: 2025-10-20


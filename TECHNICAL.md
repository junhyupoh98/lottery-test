# 🔧 기술 문서 (Technical Documentation)

## 📐 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  User View   │  │  Admin View  │  │   Results    │      │
│  │  (티켓구매)    │  │  (관리패널)    │  │  (당첨조회)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                 │                 │             │
│           └─────────────────┴─────────────────┘             │
│                          │                                  │
│                    ethers.js v6                             │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   MetaMask      │
                  │   (Web3 Wallet) │
                  └────────┬────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│              Kaia Blockchain (Kairos Testnet)               │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────┐          │
│  │         Lottery.sol (Main Contract)          │          │
│  │  ┌────────────┐  ┌────────────┐             │          │
│  │  │  Tickets   │  │   Draws    │             │          │
│  │  │  Storage   │  │   State    │             │          │
│  │  └────────────┘  └────────────┘             │          │
│  │  ┌────────────┐  ┌────────────┐             │          │
│  │  │   Prize    │  │    VRF     │             │          │
│  │  │Distribution│  │Integration │             │          │
│  │  └────────────┘  └────────────┘             │          │
│  └──────────────────────┬───────────────────────┘          │
│                         │                                  │
│  ┌──────────────────────▼───────────────────────┐          │
│  │         MockVRF.sol (Test Only)              │          │
│  │  - 테스트용 난수 생성                           │          │
│  │  - fulfillRequest() 수동 호출                  │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎲 스마트 컨트랙트 상세

### Lottery.sol 구조

```solidity
contract Lottery is VRFConsumerBase, ReentrancyGuard {
    // 상태 변수
    uint256 public currentDrawId;              // 현재 회차
    uint256 public ticketPrice;                // 티켓 가격
    uint256 public accumulatedJackpot;         // 누적 잭팟
    uint256 public collectedFees;              // 수수료 누적
    
    // 매핑
    mapping(uint256 => Draw) public draws;
    mapping(uint256 => mapping(address => Ticket[])) public tickets;
    mapping(uint256 => PrizeDistribution[]) public prizeDistributions;
    
    // 구조체
    struct Draw {
        uint256 drawId;
        uint256 drawTimestamp;
        bool isActive;
        uint8[6] winningNumbers;
        bool hasWinningNumbers;
        uint256 prizePool;
    }
    
    struct Ticket {
        uint8[6] numbers;
        uint256 purchaseTime;
        address player;
    }
    
    struct PrizeDistribution {
        address winner;
        uint256 amount;
        uint8 rank;
        uint256 timestamp;
    }
}
```

### 주요 로직 흐름

#### 1. 티켓 구매 (`buyTicket`)
```
1. 입력 검증
   ├─ 회차 활성화 확인
   ├─ 티켓 가격 확인
   ├─ 번호 유효성 (1-45)
   └─ 중복 번호 체크

2. 티켓 저장
   └─ tickets[drawId][msg.sender].push(ticket)

3. 상금 풀 증가
   └─ draws[drawId].prizePool += msg.value

4. 이벤트 발생
   └─ TicketPurchased(...)
```

#### 2. VRF 당첨번호 요청 (`requestRandomWinningNumbers`)
```
1. 권한 확인 (onlyOwner)

2. 회차 상태 확인
   ├─ 활성화된 회차
   └─ 당첨번호 미설정

3. VRF 요청
   └─ requestId = IVRFCoordinator.requestRandomWords(...)

4. 매핑 저장
   └─ requestIdToDrawId[requestId] = drawId

5. 이벤트 발생
   └─ RandomWordsRequested(requestId, drawId)
```

#### 3. VRF 콜백 (`fulfillRandomWords`)
```
1. VRF Coordinator가 호출 (자동)

2. 난수를 1-45 범위로 변환
   for (i = 0; i < 6; i++) {
       numbers[i] = (randomWords[i] % 45) + 1
   }

3. 중복 제거 (선형 탐색)

4. 당첨번호 저장
   └─ draws[drawId].winningNumbers = numbers

5. 당첨금 자동 분배
   └─ _distributePrizes(drawId)
```

#### 4. 당첨금 분배 (`_distributePrizes`)
```
1. 모든 티켓 순회
   for each ticket in draws[drawId]:

2. 일치 번호 계산
   matchCount = countMatches(ticket, winningNumbers)

3. 등수 판정
   ├─ 6개 일치 → 1등
   └─ 5개 일치 → 2등

4. 당첨자 분류
   ├─ rank1Winners[]
   └─ rank2Winners[]

5. 상금 계산
   ├─ rank1Prize = (prizePool * 70%) / rank1Winners.length
   ├─ rank2Prize = (prizePool * 10%) / rank2Winners.length
   └─ feeAmount = prizePool * 20%

6. 전송 (KAIA)
   ├─ 1등 당첨자들에게 전송
   ├─ 2등 당첨자들에게 전송
   └─ 수수료 누적 (collectedFees)

7. 1등 없으면 잭팟 누적
   if (rank1Winners.length == 0) {
       accumulatedJackpot += rank1Prize
   }

8. 이벤트 발생
   └─ PrizeDistributed(...)
```

---

## 🔐 보안 패턴

### 1. ReentrancyGuard
```solidity
modifier nonReentrant() {
    require(_status != _ENTERED);
    _status = _ENTERED;
    _;
    _status = _NOT_ENTERED;
}
```
**적용 함수**: `buyTicket`, `withdrawFees`

### 2. Access Control
```solidity
modifier onlyOwner() {
    require(msg.sender == owner);
    _;
}
```
**적용 함수**: 모든 관리자 함수

### 3. 입력 검증
```solidity
function _validateNumbers(uint8[6] memory numbers) private pure {
    for (uint i = 0; i < 6; i++) {
        require(numbers[i] >= 1 && numbers[i] <= 45);
        for (uint j = i + 1; j < 6; j++) {
            require(numbers[i] != numbers[j]); // 중복 방지
        }
    }
}
```

### 4. 상태 관리
- 회차별 상태 관리 (`isActive`, `hasWinningNumbers`)
- 과거 회차 데이터 불변성 보장

---

## 🌐 Frontend 아키텍처

### React Hooks 구조

```typescript
// 상태 관리
const [isConnected, setIsConnected] = useState(false);
const [contract, setContract] = useState<any>(null);
const [provider, setProvider] = useState<any>(null);
const [currentDrawId, setCurrentDrawId] = useState(0);
const [myTickets, setMyTickets] = useState<any[]>([]);

// ethers.js 초기화
useEffect(() => {
    initializeEthers();
}, []);

// 지갑 연결
const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    // ...
};

// 컨트랙트 데이터 로드
const loadContractData = async (contract: any) => {
    const drawId = await contract.currentDrawId();
    const prizePool = await contract.draws(drawId).prizePool;
    // ...
};
```

### 트랜잭션 처리 패턴

```typescript
const buyTicket = async () => {
    try {
        setIsLoading(true);
        
        // 1. 서명자 가져오기
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        
        // 2. 컨트랙트 연결
        const contractWithSigner = new ethers.Contract(
            contractAddress, 
            lottoAbi, 
            signer
        );
        
        // 3. 트랜잭션 전송
        const tx = await contractWithSigner.buyTicket(
            currentDrawId,
            selectedNumbers,
            { value: ethers.parseEther(ticketPrice) }
        );
        
        // 4. 확인 대기
        await tx.wait();
        
        // 5. UI 업데이트
        loadContractData(contract);
        
    } catch (error) {
        handleError(error);
    } finally {
        setIsLoading(false);
    }
};
```

---

## 📊 가스 최적화

### 구현된 최적화 기법

1. **Storage vs Memory**
   ```solidity
   // ❌ 비효율적
   uint8[] storage numbers = draws[drawId].winningNumbers;
   
   // ✅ 효율적
   uint8[6] memory numbers = draws[drawId].winningNumbers;
   ```

2. **Short Circuit Evaluation**
   ```solidity
   require(isActive && !hasWinningNumbers);
   ```

3. **고정 크기 배열**
   ```solidity
   uint8[6] memory numbers; // 동적 배열보다 저렴
   ```

4. **이벤트 활용**
   - 온체인 저장 대신 이벤트 로그 활용
   - `indexed` 키워드로 필터링 최적화

### 가스 비용 추정 (Kaia Kairos)

| 함수 | 가스 | 비용 (KAIA) |
|------|------|-------------|
| `buyTicket` | ~150,000 | ~0.003 |
| `requestRandomWinningNumbers` | ~200,000 | ~0.004 |
| `setWinningNumbersForTest` | ~300,000 | ~0.006 |
| `withdrawFees` | ~50,000 | ~0.001 |

*가스 가격: 25 gwei 기준*

---

## 🧪 테스트 전략

### Unit Tests (Foundry)
```solidity
contract LotteryTest is Test {
    Lottery lottery;
    
    function setUp() public {
        lottery = new Lottery(...);
    }
    
    function testBuyTicket() public {
        uint8[6] memory numbers = [1,2,3,4,5,6];
        lottery.buyTicket{value: 0.01 ether}(1, numbers);
        // assertions...
    }
    
    function testPrizeDistribution() public {
        // 시나리오 테스트
    }
}
```

### Integration Tests
1. 전체 플로우 테스트
2. VRF 통합 테스트
3. 다중 사용자 시나리오

### Frontend Tests
```typescript
// Jest + React Testing Library
describe('Lottery DApp', () => {
    it('should connect wallet', async () => {
        // ...
    });
    
    it('should buy ticket', async () => {
        // ...
    });
});
```

---

## 🔄 데이터 흐름

### 티켓 구매 시퀀스
```
User → Frontend → MetaMask → Kaia RPC → Contract
  ↓
  └─> 트랜잭션 해시 반환
  ↓
  └─> 블록 확정 대기 (tx.wait())
  ↓
  └─> 이벤트 발생 (TicketPurchased)
  ↓
  └─> Frontend 데이터 갱신
```

### 당첨 처리 시퀀스
```
Admin → requestRandomWinningNumbers()
  ↓
VRF Coordinator → fulfillRandomWords()
  ↓
Contract → _distributePrizes()
  ↓
  ├─> 1등 당첨자에게 전송
  ├─> 2등 당첨자에게 전송
  └─> 이벤트 발생 (PrizeDistributed)
  ↓
Frontend → 이벤트 감지 및 UI 업데이트
```

---

## 🌍 네트워크 설정

### Kaia Kairos Testnet
```json
{
  "chainId": "0x3e9",
  "chainName": "Kaia Kairos",
  "nativeCurrency": {
    "name": "KAIA",
    "symbol": "KAIA",
    "decimals": 18
  },
  "rpcUrls": ["https://public-en-kairos.node.kaia.io"],
  "blockExplorerUrls": ["https://kairos.kaiascan.io"]
}
```

### MetaMask 자동 추가
```typescript
await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
        chainId: '0x3e9',
        chainName: 'Kaia Kairos',
        // ...
    }]
});
```

---

## 📦 배포 프로세스

### Smart Contract 배포
```bash
# 1. 환경 변수 확인
source .env

# 2. 컴파일
forge build

# 3. 배포 (Dry Run)
forge script script/Deploy.s.sol --rpc-url $KAIA_KAIROS_RPC_URL

# 4. 실제 배포
forge script script/Deploy.s.sol \
    --rpc-url $KAIA_KAIROS_RPC_URL \
    --broadcast \
    --legacy

# 5. 검증 (선택)
forge verify-contract <CONTRACT_ADDRESS> \
    src/Lottery.sol:Lottery \
    --chain-id 1001
```

### Frontend 배포 (Vercel)
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 프로젝트 링크
vercel link

# 4. 환경 변수 설정
vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
vercel env add NEXT_PUBLIC_MOCK_VRF_ADDRESS
vercel env add NEXT_PUBLIC_OWNER_ADDRESS

# 5. 배포
vercel --prod
```

---

## 🐞 디버깅 팁

### 컨트랙트 호출 확인
```bash
# 현재 회차 조회
cast call <CONTRACT_ADDRESS> "currentDrawId()(uint256)" \
    --rpc-url https://public-en-kairos.node.kaia.io

# 티켓 가격 조회
cast call <CONTRACT_ADDRESS> "ticketPrice()(uint256)" \
    --rpc-url https://public-en-kairos.node.kaia.io

# 잔액 조회
cast balance <ADDRESS> \
    --rpc-url https://public-en-kairos.node.kaia.io
```

### 이벤트 로그 조회
```typescript
const filter = contract.filters.TicketPurchased();
const events = await contract.queryFilter(filter, fromBlock, toBlock);
console.log('Tickets purchased:', events.length);
```

### 트랜잭션 실패 분석
1. Block Explorer에서 트랜잭션 조회
2. Revert Reason 확인
3. Gas Used vs Gas Limit 비교

---

## 📈 성능 최적화

### Frontend
- **React.memo**: 불필요한 리렌더링 방지
- **useMemo/useCallback**: 계산 최적화
- **Lazy Loading**: 컴포넌트 지연 로딩
- **이미지 최적화**: Next.js Image 사용

### Contract
- **Batch Processing**: 여러 작업 한 번에
- **Storage Packing**: 변수 크기 최적화
- **Event 활용**: 온체인 스토리지 절약

---

## 🔮 향후 개선 사항

### Phase 2
- [ ] 실제 Orakl VRF 통합
- [ ] 메인넷 배포
- [ ] 다중 회차 동시 운영
- [ ] 자동 회차 생성 (Chainlink Automation)

### Phase 3
- [ ] NFT 티켓 발행
- [ ] 소셜 기능 (공유, 추천)
- [ ] 모바일 앱 (React Native)
- [ ] 다국어 지원

### Phase 4
- [ ] DAO 거버넌스
- [ ] 토큰 이코노미
- [ ] Cross-chain 지원
- [ ] AI 번호 추천

---

**개발자 문의: GitHub Issues 활용**


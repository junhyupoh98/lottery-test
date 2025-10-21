'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import * as lottoAbiModule from '../../lib/lottoAbi.json';
import * as mockVrfAbiModule from '../../lib/mockVrfAbi.json';

const lottoAbi = (lottoAbiModule as any).default || lottoAbiModule;
const mockVrfAbi = (mockVrfAbiModule as any).default || mockVrfAbiModule;

// 로딩 스피너 컴포넌트
const LoadingSpinner = ({ size = 'medium', message = '' }: { size?: 'small' | 'medium' | 'large', message?: string }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {message && <p className="mt-2 text-sm text-white/70">{message}</p>}
    </div>
  );
};

// 트랜잭션 상태 모달 컴포넌트
const TransactionModal = ({ 
  isOpen, 
  status, 
  message, 
  txHash,
  onClose,
  onRetry 
}: { 
  isOpen: boolean; 
  status: 'pending' | 'success' | 'error'; 
  message: string; 
  txHash?: string;
  onClose?: () => void;
  onRetry?: () => void;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 sm:p-8 max-w-md w-full border-2 border-white/20 shadow-2xl">
        {status === 'pending' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">트랜잭션 처리 중</h3>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-4xl">
                ✓
              </div>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">성공!</h3>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-4xl">
                ✕
              </div>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">오류 발생</h3>
          </>
        )}
        
        <p className="text-white/80 text-center mb-4 whitespace-pre-line text-sm sm:text-base">{message}</p>
        
        {txHash && (
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <p className="text-xs text-white/60 mb-1">트랜잭션 해시:</p>
            <p className="text-xs text-blue-300 font-mono break-all">{txHash}</p>
            <a 
              href={`https://baobab.klaytnscope.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline mt-2 block"
            >
              Explorer에서 보기 →
            </a>
          </div>
        )}
        
        {/* 버튼들 */}
        <div className="flex gap-2 sm:gap-3 mt-4">
          {status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              재시도
            </button>
          )}
          {(status === 'success' || status === 'error') && onClose && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [ticketPrice, setTicketPrice] = useState('0.01'); // ETH
  const [contract, setContract] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [currentDrawId, setCurrentDrawId] = useState(0);
  const [prizePool, setPrizePool] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [selectedDrawForResults, setSelectedDrawForResults] = useState(0);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [newDrawId, setNewDrawId] = useState(0);
  const [newDrawTimestamp, setNewDrawTimestamp] = useState('');
  const [drawStatus, setDrawStatus] = useState<'selling' | 'closed' | 'drawn'>('selling');
  const [hasWinningNumbers, setHasWinningNumbers] = useState(false);
  const [prizeDistributions, setPrizeDistributions] = useState<any[]>([]);
  
  // 테스트용 당첨번호 설정
  const [testDrawId, setTestDrawId] = useState(0);
  const [testNumbers, setTestNumbers] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [accumulatedJackpot, setAccumulatedJackpot] = useState('0');
  const [collectedFees, setCollectedFees] = useState('0');
  const [latestRequestId, setLatestRequestId] = useState<number | null>(null);
  const [vrfRequestHistory, setVrfRequestHistory] = useState<any[]>([]);
  
  // 트랜잭션 모달 상태
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalStatus, setTxModalStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [txModalMessage, setTxModalMessage] = useState('');
  const [txHash, setTxHash] = useState('');

  // 컨트랙트 초기화
  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum !== 'undefined') {
        // 환경 변수가 없으면 기본값 사용 (Kaia Kairos 최신 배포 - 체크섬 주소)
            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x2e7bb733b7813628a46130fa48b9f9cdda29e088';
        
        console.log('🔧 환경변수 CONTRACT_ADDRESS:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
        console.log('🔧 환경변수 CHAIN_ID:', process.env.NEXT_PUBLIC_CHAIN_ID);
        console.log('📍 사용할 컨트랙트 주소:', contractAddress);
        
        try {
          // 🔧 [FIX] JsonRpcProvider로 직접 RPC 연결 (MetaMask 호환성 문제 우회)
          const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://public-en-kairos.node.kaia.io';
          const jsonRpcProvider = new ethers.JsonRpcProvider(rpcUrl);
          
          console.log('🔌 RPC 직접 연결:', rpcUrl);
          
          // 네트워크 확인
          const network = await jsonRpcProvider.getNetwork();
          console.log('🌐 현재 연결된 네트워크:', network.chainId.toString());
          
          if (network.chainId !== 1001n) {
            console.warn('⚠️ 잘못된 네트워크! Kaia Kairos (1001)로 전환해주세요.');
          }
          
          // 읽기 전용 컨트랙트 (JsonRpcProvider)
          const contract = new ethers.Contract(contractAddress, lottoAbi, jsonRpcProvider);
          setProvider(jsonRpcProvider);
          setContract(contract);
          
          console.log('✅ 컨트랙트 연결 완료 (MetaMask Provider):', contractAddress);
          
          // 컨트랙트 데이터 로드
          await loadContractData(contract);
          
          // 상금 분배 내역과 VRF 요청 이력도 미리 로드 (지갑 연결 전에도 볼 수 있도록)
          setTimeout(() => {
            loadPrizeDistributions();
            loadVrfRequestHistory();
          }, 500);
        } catch (error) {
          console.error('❌ 컨트랙트 연결 실패:', error);
        }
      }
    };
    
    initContract();
  }, []);

  // 컨트랙트와 주소가 준비되면 티켓 로드
  useEffect(() => {
    if (contract && address) {
      console.log('🎫 티켓 데이터 로드 중...');
      loadMyTickets();
    }
  }, [contract, address]);

  // 컨트랙트 데이터 로드
  const loadContractData = async (contract: any) => {
    try {
      console.log('📊 컨트랙트 데이터 로드 시작...');
      console.log('🔍 Contract address:', await contract.getAddress());
      
      // 🔧 [WORKAROUND] currentDrawId() 호출 문제 - 하드코딩으로 우회
      let currentDraw;
      try {
        currentDraw = await contract.currentDrawId();
        console.log('✅ currentDrawId 호출 성공:', currentDraw.toString());
      } catch (error) {
        console.warn('⚠️ currentDrawId 호출 실패, 기본값 5 사용');
        currentDraw = 5n; // 현재 회차 하드코딩 (추후 수정 필요)
      }
      
      // 다른 함수들도 개별적으로 try-catch
      let price, pool, jackpot, fees;
      try {
        price = await contract.ticketPrice();
        console.log('✅ ticketPrice 호출 성공');
      } catch (error) {
        console.warn('⚠️ ticketPrice 호출 실패, 기본값 사용');
        price = ethers.parseEther('0.01');
      }
      
      try {
        pool = await contract.prizePool(currentDraw);
        console.log('✅ prizePool 호출 성공');
      } catch (error) {
        console.warn('⚠️ prizePool 호출 실패, 기본값 사용');
        pool = 0n;
      }
      
      try {
        jackpot = await contract.accumulatedJackpot();
        console.log('✅ accumulatedJackpot 호출 성공');
      } catch (error) {
        console.warn('⚠️ accumulatedJackpot 호출 실패, 기본값 사용');
        jackpot = 0n;
      }
      
      try {
        fees = await contract.collectedFees();
        console.log('✅ collectedFees 호출 성공');
      } catch (error) {
        console.warn('⚠️ collectedFees 호출 실패, 기본값 사용');
        fees = 0n;
      }
      
      setCurrentDrawId(Number(currentDraw));
      setTicketPrice(ethers.formatEther(price));
      setPrizePool(ethers.formatEther(pool));
      setAccumulatedJackpot(ethers.formatEther(jackpot));
      setCollectedFees(ethers.formatEther(fees));
      
      console.log('📊 모든 데이터 로드 완료!');
      
      // 추첨 상태 확인
      await checkDrawStatus(contract, Number(currentDraw));
    } catch (error: any) {
      console.error('❌ 컨트랙트 데이터 로드 실패:', error);
      
      // RPC 에러 메시지 표시
      if (error.code === 'CALL_EXCEPTION' || error.message?.includes('missing revert data')) {
        console.error('⚠️ RPC 통신 오류! MetaMask의 Kaia Kairos 네트워크 설정을 확인하세요.');
        console.error('💡 RPC URL: https://public-en-kairos.node.kaia.io');
        
        alert(
          '⚠️ 네트워크 연결 오류!\n\n' +
          'MetaMask의 Kaia Kairos 네트워크 RPC 설정을 확인해주세요.\n\n' +
          '올바른 RPC URL:\n' +
          'https://public-en-kairos.node.kaia.io\n\n' +
          'Chain ID: 1001'
        );
      }
    }
  };

  // 추첨 상태 확인
  const checkDrawStatus = async (contract: any, drawId: number) => {
    try {
      // 현재 추첨의 당첨 번호가 있는지 확인
      const firstNumber = await contract.winningNumbers(drawId, 0);
      const hasNumbers = Number(firstNumber) > 0;
      setHasWinningNumbers(hasNumbers);
      
      if (hasNumbers) {
        setDrawStatus('drawn');
      } else {
        setDrawStatus('selling');
      }
    } catch (error) {
      setDrawStatus('selling');
      setHasWinningNumbers(false);
    }
  };

  // VRF 요청 이력 가져오기 (RequestId 자동 조회)
  const loadVrfRequestHistory = async () => {
    if (!contract || !provider) {
      console.log('⚠️ VRF 요청 이력 로드 조건 미충족');
      return;
    }
    
    try {
      console.log('🔍 VRF 요청 이벤트 조회 시작...');
      
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = currentBlock ? Math.max(0, currentBlock - 100000) : 0;
      
      console.log(`📍 블록 범위: ${fromBlock} ~ ${currentBlock || 'latest'}`);
      
      // RandomWordsRequested 이벤트 필터
      const filter = contract.filters.RandomWordsRequested();
      const events = await contract.queryFilter(filter, fromBlock, 'latest');
      console.log('📋 발견된 VRF 요청 이벤트 수:', events.length);
      
      const requests: any[] = [];
      
      for (const event of events) {
        const requestId = event.args?.requestId;
        const drawId = event.args?.drawId;
        
        requests.push({
          requestId: Number(requestId),
          drawId: Number(drawId),
          blockNumber: event.blockNumber
        });
      }
      
      // 최신 순으로 정렬
      requests.sort((a, b) => b.blockNumber - a.blockNumber);
      console.log('✅ 로드된 VRF 요청:', requests.length, '건');
      setVrfRequestHistory(requests);
      
      // 최신 requestId 설정
      if (requests.length > 0) {
        setLatestRequestId(requests[0].requestId);
        console.log('🎯 최신 Request ID:', requests[0].requestId);
      }
    } catch (error) {
      console.error('❌ VRF 요청 이력 로드 실패:', error);
      setVrfRequestHistory([]);
    }
  };

  // 상금 분배 내역 가져오기
  const loadPrizeDistributions = async () => {
    if (!contract) {
      console.log('⚠️ 상금 분배 내역 로드 조건 미충족: contract가 없음');
      return;
    }
    
    try {
      console.log('💰 상금 분배 이벤트 조회 시작...');
      
      // 현재 블록 가져오기
      const currentBlock = await provider?.getBlockNumber();
      // 최근 10만 블록만 조회 (약 1-2주 분량)
      const fromBlock = currentBlock ? Math.max(0, currentBlock - 100000) : 0;
      
      console.log(`📍 블록 범위: ${fromBlock} ~ ${currentBlock || 'latest'}`);
      
      // PrizesDistributed 이벤트 필터
      const filter = contract.filters.PrizesDistributed();
      const events = await contract.queryFilter(filter, fromBlock, 'latest');
      console.log('📋 발견된 분배 이벤트 수:', events.length);
      
      const distributions: any[] = [];
      
      for (const event of events) {
        const drawId = event.args?.drawId;
        const firstWinners = event.args?.firstWinners;
        const secondWinners = event.args?.secondWinners;
        const thirdWinners = event.args?.thirdWinners;
        const firstPrize = event.args?.firstPrize;
        const secondPrize = event.args?.secondPrize;
        const thirdPrize = event.args?.thirdPrize;
        const rolloverAmount = event.args?.rolloverAmount;
        
        const totalWinners = Number(firstWinners) + Number(secondWinners) + Number(thirdWinners);
        const totalPrize = BigInt(firstPrize || 0) * BigInt(firstWinners || 0) + 
                          BigInt(secondPrize || 0) * BigInt(secondWinners || 0) + 
                          BigInt(thirdPrize || 0) * BigInt(thirdWinners || 0);
        
        distributions.push({
          drawId: Number(drawId),
          firstWinners: Number(firstWinners),
          secondWinners: Number(secondWinners),
          thirdWinners: Number(thirdWinners),
          firstPrize: firstPrize ? ethers.formatEther(firstPrize) : '0',
          secondPrize: secondPrize ? ethers.formatEther(secondPrize) : '0',
          thirdPrize: thirdPrize ? ethers.formatEther(thirdPrize) : '0',
          rolloverAmount: rolloverAmount ? ethers.formatEther(rolloverAmount) : '0',
          totalWinners,
          totalPrize: ethers.formatEther(totalPrize),
          blockNumber: event.blockNumber
        });
      }
      
      // 최신 순으로 정렬
      distributions.sort((a, b) => b.drawId - a.drawId);
      console.log('✅ 로드된 상금 분배:', distributions.length, '건');
      setPrizeDistributions(distributions);
    } catch (error) {
      console.error('❌ 상금 분배 내역 로드 실패:', error);
      setPrizeDistributions([]);
    }
  };

  // 내 티켓 가져오기 (이벤트 기반) + 당첨 여부 확인
  const loadMyTickets = async () => {
    if (!contract || !address || !provider) {
      console.log('⚠️ 티켓 로드 조건 미충족:', { contract: !!contract, address: !!address, provider: !!provider });
      return;
    }
    
    try {
      console.log('🔍 티켓 이벤트 조회 시작:', address);
      
      // 현재 블록 가져오기
      const currentBlock = await provider.getBlockNumber();
      // 최근 10만 블록만 조회 (약 1-2주 분량)
      const fromBlock = Math.max(0, currentBlock - 100000);
      
      console.log(`📍 블록 범위: ${fromBlock} ~ ${currentBlock}`);
      
      // TicketPurchased 이벤트 필터
      const filter = contract.filters.TicketPurchased(address);
      const events = await contract.queryFilter(filter, fromBlock, 'latest');
      console.log('📋 발견된 이벤트 수:', events.length);
      
      const tickets: any[] = [];
      
      for (const event of events) {
        const tokenId = event.args?.ticketId;
        const drawId = event.args?.drawId;
        const numbers = event.args?.numbers;
        
        // 현재 소유자가 맞는지 확인
        try {
          const owner = await contract.ownerOf(tokenId);
          if (owner.toLowerCase() === address.toLowerCase()) {
            // 블록 타임스탬프 가져오기 (발급 시간)
            const block = await provider.getBlock(event.blockNumber);
            const purchaseTime = block ? block.timestamp : 0;
            
            // 당첨 번호 확인
            let isWinner = false;
            let matchCount = 0;
            try {
              const winningNums: number[] = [];
              for (let i = 0; i < 6; i++) {
                const num = await contract.winningNumbers(drawId, i);
                winningNums.push(Number(num));
              }
              
              // 당첨 번호가 있으면 비교
              if (winningNums[0] > 0) {
                const ticketNums = numbers.map((n: any) => Number(n));
                matchCount = ticketNums.filter((num: number) => winningNums.includes(num)).length;
                isWinner = matchCount === 6;
              }
            } catch (e) {
              // 당첨 번호 없음
            }
            
            tickets.push({
              tokenId: Number(tokenId),
              drawId: Number(drawId),
              numbers: numbers.map((n: any) => Number(n)),
              isWinner,
              matchCount,
              purchaseTime
            });
          }
        } catch (error) {
          // 티켓이 전송되었거나 소각된 경우 무시
          continue;
        }
      }
      
      console.log('✅ 로드된 티켓:', tickets.length, '장');
      setMyTickets(tickets);
    } catch (error) {
      console.error('❌ 티켓 로드 실패:', error);
      setMyTickets([]);
    }
  };

  // Owner 체크
  const checkOwner = async (contract: any, userAddress: string) => {
    try {
      // 실제 owner 주소 (배포한 지갑)
      const ownerAddress = '0xe4885A25c43C8d6087F8d5A1162F9b869c08c98C';
      setIsOwner(ownerAddress.toLowerCase() === userAddress.toLowerCase());
    } catch (error) {
      console.error('Owner 확인 실패:', error);
      setIsOwner(false);
    }
  };

  // 지갑 연결
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Kaia Kairos 네트워크로 전환 요청
        const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || '1001';
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
          });
        } catch (switchError: any) {
          // 네트워크가 MetaMask에 추가되지 않은 경우
          if (switchError.code === 4902) {
            alert('MetaMask에 Kaia Kairos Testnet을 먼저 추가해주세요!');
          }
        }
        
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAddress(accounts[0]);
        setIsConnected(true);
        
        // 잔액 조회
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });
        setBalance((parseInt(balance, 16) / 1e18).toFixed(4));
        
        // 컨트랙트 데이터 새로고침
        if (contract) {
          await loadContractData(contract);
          await checkOwner(contract, accounts[0]);
          await loadMyTickets();
          await loadPrizeDistributions();
          await loadVrfRequestHistory();
        }
        
        console.log('✅ 지갑 연결 성공:', accounts[0]);
      } catch (error) {
        console.error('지갑 연결 실패:', error);
      }
    } else {
      alert('MetaMask를 설치해주세요!');
    }
  };
  
  // 지갑 연결 해제
  const disconnectWallet = () => {
    setAddress('');
    setBalance('0');
    setIsConnected(false);
    setIsOwner(false);
    setMyTickets([]);
    console.log('✅ 지갑 연결 해제됨');
  };

  // 번호 선택/해제
  const toggleNumber = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  // 자동 선택 (랜덤)
  const autoSelect = () => {
    const numbers: number[] = [];
    while (numbers.length < 6) {
      const random = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(random)) {
        numbers.push(random);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
  };

  // 번호 초기화
  const clearSelection = () => {
    setSelectedNumbers([]);
  };

  // 당첨 번호 조회
  const loadWinningNumbers = async (drawId: number) => {
    if (!contract) return;
    
    try {
      const numbers: number[] = [];
      for (let i = 0; i < 6; i++) {
        const num = await contract.winningNumbers(drawId, i);
        numbers.push(Number(num));
      }
      setWinningNumbers(numbers);
    } catch (error) {
      console.error('당첨 번호 조회 실패:', error);
      setWinningNumbers([]);
    }
  };

  // 관리자: 현재 회차 종료 및 다음 회차 시작
  const endCurrentDraw = async () => {
    if (!contract || !provider || !isOwner) {
      alert('❌ 오류: 관리자 권한이 필요합니다!');
      return;
    }
    
    if (!confirm(`추첨 #${currentDrawId}를 종료하고 추첨 #${currentDrawId + 1}을 시작하시겠습니까?`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🔒 회차 종료 시작...');
      console.log('- 현재 회차:', currentDrawId);
      console.log('- 다음 회차:', currentDrawId + 1);
      
      // MetaMask의 BrowserProvider를 사용하여 서명자 가져오기
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      console.log('✅ Signer 획득:', await signer.getAddress());
      
      // 컨트랙트 주소 (Kaia Kairos 최신 배포)
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x2e7bb733b7813628a46130fa48b9f9cdda29e088';
      const contractWithSigner = new ethers.Contract(contractAddress, lottoAbi, signer);
      console.log('✅ 컨트랙트 연결:', contractAddress);
      
      const nextDrawId = currentDrawId + 1;
      // 다음 회차 날짜: 현재 시간 + 7일 (예시)
      const nextDrawTimestamp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
      
      console.log('📤 다음 회차 생성 중...');
      // 다음 추첨 생성
      const tx = await contractWithSigner.createOrUpdateDraw(nextDrawId, nextDrawTimestamp, true, {
        gasLimit: 200000
      });
      console.log('✅ 트랜잭션 전송 완료:', tx.hash);
      alert(`추첨 생성 트랜잭션 전송됨!\n\nTx Hash: ${tx.hash}\n\n확인 대기 중...`);
      await tx.wait();
      console.log('✅ 추첨 생성 완료');
      
      console.log('📤 현재 회차 변경 중...');
      // 다음 추첨을 현재 추첨으로 설정
      const tx2 = await contractWithSigner.setCurrentDraw(nextDrawId, {
        gasLimit: 100000
      });
      console.log('✅ 트랜잭션 전송 완료:', tx2.hash);
      await tx2.wait();
      console.log('✅ 현재 회차 변경 완료');
      
      alert(`✅ 성공!\n\n추첨 #${currentDrawId} 종료됨\n추첨 #${nextDrawId} 시작됨!`);
      loadContractData(contract);
      setDrawStatus('closed');
    } catch (error: any) {
      console.error('❌ 회차 종료 실패:', error);
      
      let errorMessage = '회차 종료 실패';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = '사용자가 트랜잭션을 거부했습니다.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = '가스비가 부족합니다. KAIA를 충전해주세요.';
      } else if (error.message?.includes('Ownable')) {
        errorMessage = 'Owner 권한이 필요합니다.';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}\n\n상세:\n${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 관리자: 추첨 생성 (수동)
  const createDraw = async () => {
    if (!contract || !provider || !isOwner) {
      alert('❌ 오류: 관리자 권한이 필요합니다!');
      return;
    }
    
    if (!newDrawId || !newDrawTimestamp) {
      alert('❌ 회차 번호와 날짜를 모두 입력해주세요!');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('✨ 추첨 생성 시작...');
      console.log('- 회차:', newDrawId);
      console.log('- 날짜:', newDrawTimestamp);
      
      // MetaMask의 BrowserProvider를 사용하여 서명자 가져오기
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      console.log('✅ Signer 획득:', await signer.getAddress());
      
      // 컨트랙트 주소 (Kaia Kairos 최신 배포)
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x2e7bb733b7813628a46130fa48b9f9cdda29e088';
      const contractWithSigner = new ethers.Contract(contractAddress, lottoAbi, signer);
      console.log('✅ 컨트랙트 연결:', contractAddress);
      
      const timestamp = new Date(newDrawTimestamp).getTime() / 1000;
      
      console.log('📤 추첨 생성 트랜잭션 전송 중...');
      const tx = await contractWithSigner.createOrUpdateDraw(newDrawId, Math.floor(timestamp), true, {
        gasLimit: 200000
      });
      
      console.log('✅ 트랜잭션 전송 완료:', tx.hash);
      alert(`추첨 생성 트랜잭션 전송됨!\n\nTx Hash: ${tx.hash}\n\n확인 대기 중...`);
      await tx.wait();
      console.log('✅ 추첨 생성 완료');
      
      console.log('📤 현재 회차로 설정 중...');
      // 현재 추첨으로 설정
      const tx2 = await contractWithSigner.setCurrentDraw(newDrawId, {
        gasLimit: 100000
      });
      console.log('✅ 트랜잭션 전송 완료:', tx2.hash);
      await tx2.wait();
      console.log('✅ 현재 회차 설정 완료');
      
      alert(`✅ 추첨이 생성되고 활성화되었습니다! 🎉\n\n회차 #${newDrawId} 시작!`);
      loadContractData(contract);
      
      // 입력값 초기화
      setNewDrawId(0);
      setNewDrawTimestamp('');
    } catch (error: any) {
      console.error('❌ 추첨 생성 실패:', error);
      
      let errorMessage = '추첨 생성 실패';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = '사용자가 트랜잭션을 거부했습니다.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = '가스비가 부족합니다. KAIA를 충전해주세요.';
      } else if (error.message?.includes('Ownable')) {
        errorMessage = 'Owner 권한이 필요합니다.';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}\n\n상세:\n${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 관리자: 테스트용 당첨번호 설정
  const setTestWinningNumbers = async () => {
    if (!provider || !isOwner) {
      alert('❌ 오류: 관리자 권한이 필요합니다!');
      return;
    }
    
    if (!testDrawId || testDrawId <= 0) {
      alert('❌ 회차 번호를 입력해주세요!');
      return;
    }
    
    // 번호 유효성 검증
    const validNumbers = testNumbers.filter(n => n >= 1 && n <= 45);
    if (validNumbers.length !== 6) {
      alert('❌ 1~45 사이의 번호 6개를 모두 입력해주세요!');
      return;
    }
    
    // 중복 검사
    const uniqueNumbers = new Set(testNumbers);
    if (uniqueNumbers.size !== 6) {
      alert('❌ 중복된 번호가 있습니다!');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🎯 테스트용 당첨번호 설정 시작...');
      console.log('- 회차:', testDrawId);
      console.log('- 번호:', testNumbers);
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x2e7bb733b7813628a46130fa48b9f9cdda29e088';
      const contractWithSigner = new ethers.Contract(contractAddress, lottoAbi, signer);
      
      console.log('📤 setWinningNumbersForTest 호출 중...');
      const tx = await contractWithSigner.setWinningNumbersForTest(testDrawId, testNumbers, {
        gasLimit: 500000
      });
      
      console.log('✅ 트랜잭션 전송 완료:', tx.hash);
      alert(`테스트용 당첨번호 설정 트랜잭션 전송됨!\n\nTx Hash: ${tx.hash}\n\n당첨금 분배 중...`);
      
      await tx.wait();
      console.log('✅ 트랜잭션 확정됨');
      
      alert(`✅ 당첨번호 설정 완료! 🎉\n\n회차: ${testDrawId}\n번호: ${testNumbers.join(', ')}\n\n당첨금이 자동으로 분배되었습니다!`);
      
      // 컨트랙트 데이터 새로고침
      if (contract) {
        loadContractData(contract);
        loadPrizeDistributions();
      }
      
      // 입력 초기화
      setTestDrawId(0);
      setTestNumbers([0, 0, 0, 0, 0, 0]);
      
    } catch (error: any) {
      console.error('❌ 테스트용 당첨번호 설정 실패:', error);
      
      let errorMessage = '테스트용 당첨번호 설정 실패';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = '사용자가 트랜잭션을 거부했습니다.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = '가스비가 부족합니다. KAIA를 충전해주세요.';
      } else if (error.message?.includes('Cannot set for current/future draw')) {
        errorMessage = '현재 또는 미래 회차에는 설정할 수 없습니다. 종료된 회차만 가능합니다.';
      } else if (error.message?.includes('Winning numbers already set')) {
        errorMessage = '이미 당첨번호가 설정된 회차입니다.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ 오류 발생\n\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 관리자: Mock VRF fulfillRequest (당첨 번호 생성)
  const mockVrfFulfillRequest = async (requestId: number) => {
    if (!provider || !isOwner) {
      alert('❌ 오류: 관리자 권한이 필요합니다!');
      return;
    }
    
    if (!requestId || requestId <= 0) {
      alert('❌ 올바른 요청 ID를 입력해주세요!');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🎲 Mock VRF fulfillRequest 시작...');
      console.log('- Request ID:', requestId);
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      
      // Mock VRF 주소 (Kaia Kairos 배포)
      const mockVrfAddress = process.env.NEXT_PUBLIC_MOCK_VRF_ADDRESS || '0xbb1ced5b060cc67af8c393844b1d3054afb90273';
      const mockVrfContract = new ethers.Contract(mockVrfAddress, mockVrfAbi, signer);
      
      console.log('📤 Mock VRF fulfillRequest 호출 중...');
      const tx = await mockVrfContract.fulfillRequest(requestId, {
        gasLimit: 500000
      });
      
      console.log('✅ 트랜잭션 전송 완료:', tx.hash);
      alert(`Mock VRF fulfillRequest 전송됨!\n\nTx Hash: ${tx.hash}\n\n당첨 번호 생성 중...`);
      
      await tx.wait();
      console.log('✅ 트랜잭션 확정됨');
      
      alert('✅ 당첨 번호가 생성되었습니다! 🎉\n\n"당첨 번호 확인"에서 결과를 확인하세요!');
      
      // 컨트랙트 데이터 새로고침
      if (contract) {
        loadContractData(contract);
      }
      
    } catch (error: any) {
      console.error('❌ Mock VRF fulfillRequest 실패:', error);
      
      let errorMessage = 'Mock VRF fulfillRequest 실패';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = '사용자가 트랜잭션을 거부했습니다.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = '가스비가 부족합니다. KAIA를 충전해주세요.';
      } else if (error.message?.includes('invalid requestId')) {
        errorMessage = '유효하지 않은 Request ID입니다.';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}\n\n상세:\n${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 관리자: VRF 요청 (당첨 번호 추첨)
  const requestWinningNumbers = async (drawId: number) => {
    if (!contract || !provider || !isOwner) {
      alert('❌ 오류: 관리자 권한이 필요합니다!');
      return;
    }
    
    // 유효성 검사 추가
    if (!drawId || drawId <= 0) {
      alert('❌ 올바른 추첨 번호를 입력해주세요!');
      return;
    }
    
    if (drawId >= currentDrawId) {
      alert(`❌ 오류: 현재 회차(#${currentDrawId})보다 이전 회차만 추첨할 수 있습니다!\n추첨하려는 회차: #${drawId}`);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🎲 VRF 요청 시작...');
      console.log('- 추첨 회차:', drawId);
      console.log('- 현재 회차:', currentDrawId);
      
      // MetaMask의 BrowserProvider를 사용하여 서명자 가져오기
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      console.log('✅ Signer 획득:', await signer.getAddress());
      
      // 컨트랙트 주소 (Kaia Kairos 최신 배포)
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x2e7bb733b7813628a46130fa48b9f9cdda29e088';
      const contractWithSigner = new ethers.Contract(contractAddress, lottoAbi, signer);
      console.log('✅ 컨트랙트 연결:', contractAddress);
      
      // 이미 당첨 번호가 있는지 확인
      try {
        const firstNumber = await contractWithSigner.winningNumbers(drawId, 0);
        if (Number(firstNumber) > 0) {
          alert(`❌ 이미 추첨된 회차입니다!\n추첨 #${drawId}의 당첨 번호가 이미 생성되었습니다.`);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.log('당첨 번호 확인 중 오류 (정상):', e);
      }
      
      console.log('📤 트랜잭션 전송 중...');
      const tx = await contractWithSigner.requestRandomWinningNumbers(drawId, {
        gasLimit: 500000 // 가스 리밋 명시적으로 설정
      });
      
      console.log('✅ 트랜잭션 전송 완료:', tx.hash);
      alert(`VRF 요청 전송됨!\n\nTx Hash: ${tx.hash}\n\nOrakl VRF가 당첨 번호를 생성합니다.\n(수 분 소요될 수 있습니다)`);
      
      await tx.wait();
      console.log('✅ 트랜잭션 확정됨');
      
      alert('✅ VRF 요청이 완료되었습니다!\n\n잠시 후 당첨 번호가 생성됩니다.\n(새로고침하여 결과를 확인하세요)');
      
      // 컨트랙트 데이터 새로고침
      loadContractData(contract);
      
      // VRF 요청 이력 새로고침 (requestId 자동 업데이트)
      setTimeout(() => loadVrfRequestHistory(), 1000);
      
    } catch (error: any) {
      console.error('❌ VRF 요청 실패:', error);
      
      // 에러 타입별 상세 메시지
      let errorMessage = 'VRF 요청 실패';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = '사용자가 트랜잭션을 거부했습니다.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = '가스비가 부족합니다. KAIA를 충전해주세요.';
      } else if (error.message?.includes('Ownable')) {
        errorMessage = 'Owner 권한이 필요합니다.';
      } else if (error.message?.includes('Cannot draw current')) {
        errorMessage = `현재 회차(#${currentDrawId})보다 이전 회차만 추첨할 수 있습니다.`;
      } else if (error.message?.includes('already set')) {
        errorMessage = '이미 추첨된 회차입니다.';
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}\n\n상세:\n${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 티켓 구매
  const buyTicket = async () => {
    if (selectedNumbers.length !== 6) {
      alert('6개의 번호를 선택해주세요!');
      return;
    }
    
    if (!contract || !provider) {
      alert('컨트랙트가 연결되지 않았습니다!');
      return;
    }
    
    if (!isConnected || !address) {
      alert('지갑을 먼저 연결해주세요!');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🎫 티켓 구매 시작...');
      console.log('- 선택 번호:', selectedNumbers);
      console.log('- 현재 회차:', currentDrawId);
      
      // MetaMask의 BrowserProvider를 사용하여 서명자 가져오기
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      console.log('✅ Signer 획득:', await signer.getAddress());
      
      // 잔액 확인
      const balance = await browserProvider.getBalance(address);
      const ticketPriceWei = ethers.parseEther(ticketPrice);
      if (balance < ticketPriceWei) {
        alert(`❌ 잔액이 부족합니다!\n필요: ${ticketPrice} KAIA\n현재: ${ethers.formatEther(balance)} KAIA`);
        setIsLoading(false);
        return;
      }
      
      // 컨트랙트 주소 (Kaia Kairos 최신 배포)
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x2e7bb733b7813628a46130fa48b9f9cdda29e088';
      
      // BrowserProvider로 새로운 컨트랙트 인스턴스 생성
      console.log('🔍 lottoAbi 타입:', typeof lottoAbi, Array.isArray(lottoAbi));
      console.log('🔍 lottoAbi 길이:', lottoAbi ? lottoAbi.length : 'null/undefined');
      
      const contractWithSigner = new ethers.Contract(contractAddress, lottoAbi, signer);
      console.log('✅ 컨트랙트 연결:', contractAddress);
      
      console.log('📤 트랜잭션 전송 중...');
      console.log('- selectedNumbers type:', typeof selectedNumbers[0]);
      console.log('- selectedNumbers:', selectedNumbers);
      
      // 모달 표시: 트랜잭션 전송 중
      setTxModalStatus('pending');
      setTxModalMessage('트랜잭션을 전송하고 있습니다...');
      setTxHash('');
      setTxModalOpen(true);
      
      // 트랜잭션 실행
      const tx = await contractWithSigner.buyTicket(
        selectedNumbers, // number[] -> 자동으로 uint8[6]로 변환됨
        `ipfs://kiwoom-lottery-ticket-${Date.now()}`,
        {
          value: ticketPriceWei,
          gasLimit: 500000 // 충분한 가스 설정
        }
      );
      
      console.log('✅ 트랜잭션 전송 완료:', tx.hash);
      
      // 모달 업데이트: 확인 대기 중
      setTxModalMessage('트랜잭션 확인 대기 중...');
      setTxHash(tx.hash);
      
      // 트랜잭션 대기
      await tx.wait();
      console.log('✅ 트랜잭션 확정됨:', tx.hash);
      
      // 모달 업데이트: 성공
      setTxModalStatus('success');
      setTxModalMessage(`티켓 구매가 완료되었습니다! 🎉\n\n선택 번호: ${selectedNumbers.join(', ')}`);
      
      // 2초 후 모달 닫기
      setTimeout(() => {
        setTxModalOpen(false);
      }, 3000);
      
      // 데이터 새로고침
      await loadContractData(contract);
      await loadMyTickets();
      await loadPrizeDistributions();
      setSelectedNumbers([]);
      
    } catch (error: any) {
      console.error('❌ 티켓 구매 실패:', error);
      
      let errorMessage = '티켓 구매에 실패했습니다.';
      let errorDetail = '';
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = '트랜잭션이 거부되었습니다';
        errorDetail = 'MetaMask에서 트랜잭션을 취소했습니다.\n다시 시도하려면 구매 버튼을 눌러주세요.';
      } else if (error.message?.includes('insufficient funds') || error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = '잔액이 부족합니다';
        errorDetail = `가스비를 포함한 충분한 KAIA가 필요합니다.\n현재 잔액: ${balance} KAIA\n필요 금액: 약 ${(parseFloat(ticketPrice) + 0.001).toFixed(4)} KAIA`;
      } else if (error.message?.includes('not open for sale')) {
        errorMessage = '판매가 종료되었습니다';
        errorDetail = '현재 회차의 티켓 판매가 종료되었습니다.\n다음 회차를 기다려주세요.';
      } else if (error.message?.includes('Not enough funds')) {
        errorMessage = '결제 금액이 부족합니다';
        errorDetail = `티켓 가격: ${ticketPrice} KAIA\n가스비도 추가로 필요합니다.`;
      } else if (error.message?.includes('user rejected')) {
        errorMessage = '트랜잭션이 거부되었습니다';
        errorDetail = 'MetaMask에서 트랜잭션을 취소했습니다.';
      } else if (error.reason) {
        errorMessage = '컨트랙트 에러';
        errorDetail = error.reason;
      } else if (error.message) {
        errorMessage = '알 수 없는 오류';
        errorDetail = error.message.slice(0, 200); // 너무 긴 메시지는 자르기
      }
      
      // 모달 업데이트: 에러
      setTxModalStatus('error');
      setTxModalMessage(`${errorMessage}\n\n${errorDetail}`);
      setTxModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 트랜잭션 모달 */}
      <TransactionModal
        isOpen={txModalOpen}
        status={txModalStatus}
        message={txModalMessage}
        txHash={txHash}
        onClose={() => setTxModalOpen(false)}
        onRetry={() => {
          setTxModalOpen(false);
          // 재시도는 buyTicket 함수를 다시 호출하면 됨 (사용자가 다시 클릭하도록 유도)
        }}
      />
      
      {/* 헤더 */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">
            🎰 Kiwoom Lottery
          </h1>
          
          {isConnected ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="text-white text-center sm:text-right">
                <p className="text-xs sm:text-sm">연결됨: {address.slice(0, 6)}...{address.slice(-4)}</p>
                <p className="text-xs sm:text-sm">잔액: {balance} KAIA</p>
              </div>
              <button
                onClick={disconnectWallet}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm w-full sm:w-auto"
              >
                연결 해제
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors w-full sm:w-auto"
            >
              지갑 연결
            </button>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            블록체인 로또
          </h2>
          <p className="text-xl text-white/80">
            Chainlink VRF로 공정한 추첨을 보장합니다
          </p>
        </div>

        {isConnected ? (
          <div className="max-w-6xl mx-auto">
            {/* 1. 추첨 상태 표시 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-center justify-center gap-4">
                <h3 className="text-2xl font-bold">추첨 #{currentDrawId}</h3>
                {drawStatus === 'selling' && (
                  <span className="px-4 py-2 bg-green-500 rounded-full text-black font-bold flex items-center gap-2">
                    🟢 판매 중
                  </span>
                )}
                {drawStatus === 'closed' && (
                  <span className="px-4 py-2 bg-yellow-500 rounded-full text-black font-bold flex items-center gap-2">
                    🟡 판매 종료
                  </span>
                )}
                {drawStatus === 'drawn' && (
                  <span className="px-4 py-2 bg-blue-500 rounded-full text-black font-bold flex items-center gap-2">
                    ✅ 추첨 완료
                  </span>
                )}
              </div>
            </div>

            {/* 2. 진행 단계 바 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xl ${drawStatus === 'selling' ? 'bg-green-500 text-black' : 'bg-green-500/50 text-white'}`}>
                    ✓
                  </div>
                  <p className="text-sm font-semibold">티켓 판매</p>
                </div>
                <div className={`flex-1 h-1 ${drawStatus !== 'selling' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <div className="flex-1 text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xl ${drawStatus === 'closed' ? 'bg-yellow-500 text-black' : drawStatus === 'drawn' ? 'bg-green-500/50 text-white' : 'bg-gray-600 text-gray-400'}`}>
                    {drawStatus === 'closed' || drawStatus === 'drawn' ? '✓' : '2'}
                  </div>
                  <p className="text-sm font-semibold">판매 종료</p>
                </div>
                <div className={`flex-1 h-1 ${drawStatus === 'drawn' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <div className="flex-1 text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xl ${drawStatus === 'drawn' ? 'bg-blue-500 text-black' : 'bg-gray-600 text-gray-400'}`}>
                    {drawStatus === 'drawn' ? '✓' : '3'}
                  </div>
                  <p className="text-sm font-semibold">당첨 번호 추첨</p>
                </div>
                <div className={`flex-1 h-1 ${drawStatus === 'drawn' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                <div className="flex-1 text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-xl ${drawStatus === 'drawn' ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
                    4
                  </div>
                  <p className="text-sm font-semibold">결과 확인</p>
                </div>
              </div>
            </div>

            {/* 3. 내가 산 티켓 표시 */}
            {address && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 text-white">
                <h3 className="text-xl font-bold mb-4">🎫 내 티켓 ({myTickets.length}장)</h3>
                {myTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-lg">아직 구매한 티켓이 없습니다</p>
                    <p className="text-sm mt-2">위에서 번호를 선택하고 티켓을 구매해보세요! 🎰</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {myTickets.map((ticket) => (
                      <div key={ticket.tokenId} className={`rounded-xl p-4 border-2 ${
                        ticket.matchCount === 6 ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400 animate-pulse' : 
                        ticket.matchCount === 5 ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400' :
                        ticket.matchCount === 4 ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400' :
                        'bg-white/5 border-white/20'
                      }`}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">티켓 #{ticket.tokenId}</span>
                            {ticket.purchaseTime > 0 && (
                              <span className="text-xs text-gray-400 mt-1">
                                발급: {new Date(ticket.purchaseTime * 1000).toLocaleString('ko-KR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <span className="text-sm bg-blue-500 px-3 py-1 rounded-full">회차: {ticket.drawId}</span>
                            {ticket.matchCount === 6 && (
                              <span className="text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full font-bold animate-bounce">
                                🥇 1등 당첨!
                              </span>
                            )}
                            {ticket.matchCount === 5 && (
                              <span className="text-sm bg-gradient-to-r from-blue-400 to-cyan-500 text-black px-3 py-1 rounded-full font-bold">
                                🥈 2등 당첨!
                              </span>
                            )}
                            {ticket.matchCount === 4 && (
                              <span className="text-sm bg-gradient-to-r from-green-400 to-emerald-500 text-black px-3 py-1 rounded-full font-bold">
                                🥉 3등 당첨!
                              </span>
                            )}
                            {ticket.matchCount > 0 && ticket.matchCount < 4 && (
                              <span className="text-sm bg-purple-500 px-3 py-1 rounded-full">
                                {ticket.matchCount}개 일치
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 justify-center">
                          {ticket.numbers.map((num: number, idx: number) => (
                            <div key={idx} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              ticket.matchCount === 6 ? 'bg-gradient-to-br from-yellow-300 to-orange-400 text-black scale-110' :
                              ticket.matchCount === 5 ? 'bg-gradient-to-br from-blue-300 to-cyan-400 text-black scale-105' :
                              ticket.matchCount === 4 ? 'bg-gradient-to-br from-green-300 to-emerald-400 text-black scale-105' :
                              'bg-gradient-to-br from-yellow-400 to-orange-500 text-black'
                            }`}>
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 상금 분배 내역 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 text-white">
              <h3 className="text-xl font-bold mb-4">💰 상금 분배 내역</h3>
              {prizeDistributions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-lg">아직 상금이 분배된 회차가 없습니다</p>
                  <p className="text-sm mt-2">당첨자가 발생하면 여기에 표시됩니다! 💸</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {prizeDistributions.map((dist) => (
                    <div key={dist.drawId} className={`rounded-xl p-4 border ${parseFloat(dist.rolloverAmount) > 0 ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30' : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-green-300">회차 #{dist.drawId}</span>
                        {parseFloat(dist.rolloverAmount) > 0 ? (
                          <span className="text-sm bg-purple-500 px-3 py-1 rounded-full animate-pulse">
                            🔄 이월: {parseFloat(dist.rolloverAmount).toFixed(4)} ETH
                          </span>
                        ) : (
                          <span className="text-sm bg-green-500 px-3 py-1 rounded-full">
                            총 지급: {parseFloat(dist.totalPrize).toFixed(4)} ETH
                          </span>
                        )}
                      </div>
                      
                      {parseFloat(dist.rolloverAmount) > 0 ? (
                        <div className="text-center py-4">
                          <p className="text-yellow-300 font-semibold">1등 당첨자 없음 - 다음 회차로 이월</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3 text-center">
                          {/* 1등 */}
                          {dist.firstWinners > 0 && (
                            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-3 border border-yellow-400/50">
                              <div className="text-xs text-yellow-300 mb-1">🥇 1등 (6개)</div>
                              <div className="text-lg font-bold text-yellow-400">{dist.firstWinners}명</div>
                              <div className="text-xs text-gray-300 mt-1">
                                {parseFloat(dist.firstPrize).toFixed(4)} ETH
                              </div>
                            </div>
                          )}
                          
                          {/* 2등 */}
                          {dist.secondWinners > 0 && (
                            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-3 border border-blue-400/50">
                              <div className="text-xs text-blue-300 mb-1">🥈 2등 (5개)</div>
                              <div className="text-lg font-bold text-blue-400">{dist.secondWinners}명</div>
                              <div className="text-xs text-gray-300 mt-1">
                                {parseFloat(dist.secondPrize).toFixed(4)} ETH
                              </div>
                            </div>
                          )}
                          
                          {/* 3등 */}
                          {dist.thirdWinners > 0 && (
                            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-3 border border-green-400/50">
                              <div className="text-xs text-green-300 mb-1">🥉 3등 (4개)</div>
                              <div className="text-lg font-bold text-green-400">{dist.thirdWinners}명</div>
                              <div className="text-xs text-gray-300 mt-1">
                                {parseFloat(dist.thirdPrize).toFixed(4)} ETH
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 현재 추첨 정보 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <div>
                  <h4 className="text-lg font-semibold mb-2">현재 추첨</h4>
                  <p className="text-2xl font-bold text-yellow-400">#{currentDrawId}</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">이번 회차 상금</h4>
                  <p className="text-2xl font-bold text-green-400">{parseFloat(prizePool).toFixed(4)} ETH</p>
                  <p className="text-xs text-gray-400 mt-1">(판매액의 80%)</p>
                </div>
                <div className={`${parseFloat(accumulatedJackpot) > 0 ? 'animate-pulse' : ''}`}>
                  <h4 className="text-lg font-semibold mb-2">누적 이월금</h4>
                  <p className="text-2xl font-bold text-purple-400">+{parseFloat(accumulatedJackpot).toFixed(4)} ETH</p>
                  {parseFloat(accumulatedJackpot) > 0 && (
                    <p className="text-xs text-purple-300 mt-1">🔥 1등 잭팟 가산!</p>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">티켓 가격</h4>
                  <p className="text-2xl font-bold text-blue-400">{ticketPrice} ETH</p>
                  <p className="text-xs text-gray-400 mt-1">(수수료 20% 포함)</p>
                </div>
              </div>
              {parseFloat(accumulatedJackpot) > 0 && (
                <div className="mt-4 p-3 bg-purple-500/20 border border-purple-400 rounded-lg text-center">
                  <p className="text-sm font-semibold text-purple-300">
                    💰 총 잭팟: {(parseFloat(prizePool) + parseFloat(accumulatedJackpot)).toFixed(4)} ETH
                  </p>
                </div>
              )}
            </div>

            {/* 로또 번호 선택 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6 text-center">로또 번호 선택 (6개)</h3>
              
              {/* 선택된 번호 표시 */}
              <div className="mb-6">
                <p className="text-center mb-4">
                  선택된 번호: {selectedNumbers.length}/6
                </p>
                <div className="flex justify-center gap-2 mb-4">
                  {selectedNumbers.map((num, index) => (
                    <div key={index} className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-lg">
                      {num}
                    </div>
                  ))}
                  {Array.from({ length: 6 - selectedNumbers.length }).map((_, index) => (
                    <div key={index} className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-gray-400">
                      ?
                    </div>
                  ))}
                </div>
              </div>

              {/* 번호 그리드 */}
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2 mb-6">
                {Array.from({ length: 45 }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => toggleNumber(number)}
                    disabled={!selectedNumbers.includes(number) && selectedNumbers.length >= 6}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-base sm:text-lg transition-all transform hover:scale-105 active:scale-95 ${
                      selectedNumbers.includes(number)
                        ? 'bg-yellow-500 text-black'
                        : selectedNumbers.length >= 6
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              {/* 버튼들 */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
                <button
                  onClick={autoSelect}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors w-full sm:w-auto"
                >
                  🎲 자동 선택
                </button>
                <button
                  onClick={clearSelection}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors w-full sm:w-auto"
                >
                  🗑️ 초기화
                </button>
              </div>

              {/* 구매 버튼 */}
              <div className="text-center">
                <button
                  onClick={buyTicket}
                  disabled={selectedNumbers.length !== 6 || isLoading}
                  className={`px-8 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105 ${
                    selectedNumbers.length === 6 && !isLoading
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? '⏳ 처리 중...' : selectedNumbers.length === 6 ? '🎫 티켓 구매하기' : '6개 번호를 선택해주세요'}
                </button>
              </div>
            </div>

            {/* 당첨 번호 확인 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white mt-8">
              <h3 className="text-2xl font-bold mb-6 text-center">당첨 번호 확인</h3>
              
              <div className="mb-6">
                <label className="block text-center mb-4">
                  확인할 추첨 회차:
                </label>
                <div className="flex justify-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max={currentDrawId > 0 ? currentDrawId - 1 : 1}
                    value={selectedDrawForResults || ''}
                    onChange={(e) => setSelectedDrawForResults(Number(e.target.value))}
                    className="w-24 px-4 py-2 bg-white/20 rounded-lg text-center font-bold"
                    placeholder="회차"
                  />
                  <button
                    onClick={() => loadWinningNumbers(selectedDrawForResults)}
                    disabled={!selectedDrawForResults || selectedDrawForResults >= currentDrawId}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    조회
                  </button>
                </div>
              </div>

              {winningNumbers.length > 0 ? (
                <div>
                  <p className="text-center mb-4 text-lg">
                    🎯 {selectedDrawForResults}회차 당첨 번호
                  </p>
                  <div className="flex justify-center gap-3">
                    {winningNumbers.map((num, index) => (
                      <div key={index} className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 text-black rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-white/60">
                  회차를 입력하고 조회 버튼을 눌러주세요
                </p>
              )}
            </div>

            {/* 관리자 패널 */}
            {isOwner && (
              <div className="bg-gradient-to-r from-red-900/30 to-purple-900/30 backdrop-blur-lg rounded-2xl p-8 text-white mt-8 border-2 border-red-500/50">
                <h3 className="text-2xl font-bold mb-6 text-center">👑 관리자 패널</h3>
                
                {/* 수수료 정보 및 인출 */}
                <div className="mb-8 p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/50">
                  <h4 className="text-xl font-semibold mb-4">💵 수수료 관리</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-300 mb-1">누적 수수료</div>
                      <div className="text-2xl font-bold text-green-400">{parseFloat(collectedFees).toFixed(4)} ETH</div>
                      <div className="text-xs text-gray-400 mt-1">(판매액의 20%)</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-300 mb-1">누적 이월금</div>
                      <div className="text-2xl font-bold text-purple-400">{parseFloat(accumulatedJackpot).toFixed(4)} ETH</div>
                      <div className="text-xs text-gray-400 mt-1">(1등 미당첨 시)</div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm(`수수료 ${collectedFees} ETH를 인출하시겠습니까?`)) return;
                      try {
                        setIsLoading(true);
                        const browserProvider = new ethers.BrowserProvider(window.ethereum);
                        const signer = await browserProvider.getSigner();
                        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x2e7bb733b7813628a46130fa48b9f9cdda29e088';
                        const contractWithSigner = new ethers.Contract(contractAddress, lottoAbi, signer);
                        const tx = await contractWithSigner.withdrawFees({ gasLimit: 100000 });
                        alert(`수수료 인출 트랜잭션 전송됨!\n\nTx Hash: ${tx.hash}`);
                        await tx.wait();
                        alert('✅ 수수료 인출 완료!');
                        loadContractData(contract);
                      } catch (error: any) {
                        alert(`❌ 수수료 인출 실패\n\n${error.message || error}`);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading || parseFloat(collectedFees) === 0}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {isLoading ? '⏳ 처리 중...' : `💰 수수료 인출 (${collectedFees} ETH)`}
                  </button>
                </div>
                
                {/* 현재 회차 종료 버튼 */}
                <div className="mb-8 p-6 bg-white/10 rounded-xl">
                  <h4 className="text-xl font-semibold mb-4">현재 회차 관리</h4>
                  <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-4">
                    <p className="text-sm mb-2">
                      현재 추첨 #{currentDrawId}를 종료하고 추첨 #{currentDrawId + 1}을 자동으로 시작합니다.
                    </p>
                    <p className="text-xs text-yellow-300">
                      ⚠️ 종료 후에는 현재 회차의 당첨 번호를 추첨할 수 있습니다.
                    </p>
                  </div>
                  <button
                    onClick={endCurrentDraw}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors"
                  >
                    {isLoading ? '⏳ 처리 중...' : `🔒 추첨 #${currentDrawId} 종료 → 추첨 #${currentDrawId + 1} 시작`}
                  </button>
                </div>

                {/* 추첨 생성 (수동) */}
                <div className="mb-8 p-6 bg-white/10 rounded-xl">
                  <h4 className="text-xl font-semibold mb-4">새 추첨 생성 (수동)</h4>
                  <p className="text-xs text-white/60 mb-4">특정 회차와 날짜를 지정하여 추첨을 생성합니다.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block mb-2">추첨 회차:</label>
                      <input
                        type="number"
                        value={newDrawId || ''}
                        onChange={(e) => setNewDrawId(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white/20 rounded-lg"
                        placeholder="예: 2"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">추첨 날짜/시간:</label>
                      <input
                        type="datetime-local"
                        value={newDrawTimestamp}
                        onChange={(e) => setNewDrawTimestamp(e.target.value)}
                        className="w-full px-4 py-2 bg-white/20 rounded-lg"
                      />
                    </div>
                  </div>
                  <button
                    onClick={createDraw}
                    disabled={!newDrawId || !newDrawTimestamp || isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {isLoading ? '⏳ 처리 중...' : '✨ 추첨 생성 및 활성화'}
                  </button>
                </div>

                {/* VRF 요청 */}
                <div className="p-6 bg-white/10 rounded-xl">
                  <h4 className="text-xl font-semibold mb-4">당첨 번호 추첨 (VRF)</h4>
                  <p className="text-sm text-white/70 mb-4">
                    VRF를 사용하여 공정한 당첨 번호를 생성합니다.
                  </p>
                  <div className="flex gap-4 mb-4">
                    <input
                      type="number"
                      value={selectedDrawForResults || ''}
                      onChange={(e) => setSelectedDrawForResults(Number(e.target.value))}
                      className="flex-1 px-4 py-2 bg-white/20 rounded-lg"
                      placeholder="추첨할 회차 번호"
                    />
                    <button
                      onClick={() => requestWinningNumbers(selectedDrawForResults)}
                      disabled={!selectedDrawForResults || isLoading}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      {isLoading ? '⏳ 처리 중...' : '🎲 VRF 요청'}
                    </button>
                  </div>
                  
                  {/* Mock VRF fulfillRequest (테스트용) */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <h5 className="text-lg font-semibold mb-2">🧪 Mock VRF (테스트용)</h5>
                    
                    {/* 최신 Request ID 표시 */}
                    {latestRequestId !== null && (
                      <div className="mb-3 p-3 bg-green-500/20 border border-green-500 rounded-lg">
                        <p className="text-sm text-green-300">
                          ✅ 최신 Request ID: <span className="font-bold text-xl text-green-400">{latestRequestId}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          VRF 요청이 감지되었습니다. 아래 버튼으로 당첨 번호를 생성하세요!
                        </p>
                      </div>
                    )}
                    
                    {/* VRF 요청 이력 (최근 3개) */}
                    {vrfRequestHistory.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg max-h-32 overflow-y-auto">
                        <p className="text-xs text-blue-300 mb-2">📋 VRF 요청 이력 (최근 {Math.min(5, vrfRequestHistory.length)}개)</p>
                        <div className="space-y-1">
                          {vrfRequestHistory.slice(0, 5).map((req, idx) => (
                            <div key={idx} className="text-xs text-gray-300 flex justify-between">
                              <span>회차 #{req.drawId}</span>
                              <span className="font-mono">Request ID: {req.requestId}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-yellow-300 mb-3">
                      ⚠️ VRF 요청 후, 최신 Request ID로 수동 실행하세요!
                    </p>
                    <div className="flex gap-4">
                      <input
                        type="number"
                        value={latestRequestId || 1}
                        onChange={(e) => setLatestRequestId(Number(e.target.value))}
                        className="w-32 px-4 py-2 bg-white/20 rounded-lg font-bold text-center"
                        placeholder="Request ID"
                        id="mockVrfRequestId"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('mockVrfRequestId') as HTMLInputElement;
                          mockVrfFulfillRequest(Number(input.value));
                        }}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        {isLoading ? '⏳ 처리 중...' : '🎲 당첨 번호 생성'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 테스트용 당첨번호 직접 설정 */}
                <div className="p-6 bg-white/10 rounded-xl">
                  <h4 className="text-xl font-semibold mb-4">🎯 테스트용 당첨번호 직접 설정</h4>
                  <p className="text-sm text-white/70 mb-4">
                    터미널 없이 편하게 테스트용 당첨번호를 설정할 수 있습니다.
                  </p>
                  
                  <div className="space-y-4">
                    {/* 회차 선택 */}
                    <div>
                      <label className="block text-sm text-white/70 mb-2">회차 번호</label>
                      <input
                        type="number"
                        value={testDrawId || ''}
                        onChange={(e) => setTestDrawId(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white/20 rounded-lg text-white placeholder-white/50"
                        placeholder="회차 번호 입력 (예: 5)"
                      />
                    </div>
                    
                    {/* 6개 번호 입력 */}
                    <div>
                      <label className="block text-sm text-white/70 mb-2">당첨 번호 (1~45)</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <input
                            key={index}
                            type="number"
                            min="1"
                            max="45"
                            value={testNumbers[index] || ''}
                            onChange={(e) => {
                              const newNumbers = [...testNumbers];
                              newNumbers[index] = Number(e.target.value);
                              setTestNumbers(newNumbers);
                            }}
                            className="w-full px-3 py-2 bg-white/20 rounded-lg text-white text-center placeholder-white/50"
                            placeholder={`#${index + 1}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-yellow-300 mt-2">
                        💡 팁: 1~45 사이의 중복되지 않는 번호 6개를 입력하세요
                      </p>
                    </div>
                    
                    {/* 설정 버튼 */}
                    <button
                      onClick={setTestWinningNumbers}
                      disabled={!testDrawId || isLoading}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                    >
                      {isLoading ? '⏳ 처리 중...' : '🎯 당첨번호 설정 및 당첨금 분배'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12">
              <h3 className="text-2xl font-bold text-white mb-4">
                지갑을 연결해주세요
              </h3>
              <p className="text-white/70 mb-8">
                MetaMask 지갑을 연결하여 로또에 참여하세요
              </p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
              >
                🦊 MetaMask 연결
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


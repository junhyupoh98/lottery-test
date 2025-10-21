// script/TestLottoComplete.s.sol
// 배포부터 테스트까지 한 번에!

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/Lotto.sol";
import "../src/mocks/MockVRFCoordinatorV2.sol";

contract TestLottoComplete is Script {
    function run() external {
        vm.startBroadcast();

        console.log("\n========================================");
        console.log("  KIWOOM LOTTO - COMPLETE TEST");
        console.log("========================================\n");

        // 1. Mock VRF Coordinator 배포
        console.log("=== 1. Deploying Contracts ===");
        MockVRFCoordinatorV2 mockVRF = new MockVRFCoordinatorV2();
        console.log("Mock VRF deployed at:", address(mockVRF));

        // 2. Lotto 컨트랙트 배포
        bytes32 keyHash = bytes32(uint256(1));
        uint64 subId = 1;
        Lotto lotto = new Lotto(address(mockVRF), subId, keyHash);
        console.log("Lotto deployed at:", address(lotto));

        // 3. 첫 회차 생성
        console.log("\n=== 2. Creating Draw #1 ===");
        lotto.createOrUpdateDraw(1, block.timestamp + 1 days, true);
        lotto.setCurrentDraw(1);
        console.log("Draw #1 created and opened for sale");

        // 4. 티켓 구매
        console.log("\n=== 3. Buying Tickets ===");
        uint256 price = lotto.ticketPrice();
        console.log("Ticket price:", price, "wei");
        
        uint8[6] memory numbers1 = [uint8(7), 12, 23, 31, 38, 42];
        lotto.buyTicket{value: price}(numbers1, "ipfs://ticket-1");
        console.log("Ticket #0 purchased: 7, 12, 23, 31, 38, 42");

        uint8[6] memory numbers2 = [uint8(1), 2, 3, 4, 5, 6];
        lotto.buyTicket{value: price}(numbers2, "ipfs://ticket-2");
        console.log("Ticket #1 purchased: 1, 2, 3, 4, 5, 6");

        // 5. 회차 2 생성 (추첨을 위해 현재 회차를 변경)
        console.log("\n=== 4. Moving to Next Draw ===");
        lotto.createOrUpdateDraw(2, block.timestamp + 2 days, true);
        lotto.setCurrentDraw(2);
        console.log("Current draw set to #2");

        // 6. VRF 난수 요청 (회차 1에 대해)
        console.log("\n=== 5. Requesting Random Numbers (VRF) ===");
        uint256 requestId = lotto.requestRandomWinningNumbers(1);
        console.log("VRF request ID:", requestId);

        // 7. Mock VRF fulfill
        console.log("\n=== 6. Generating Winning Numbers ===");
        mockVRF.fulfillRequest(requestId);
        console.log("VRF fulfilled successfully!");

        // 8. 당첨 번호 확인
        console.log("\n=== 7. Winning Numbers ===");
        uint8 n1 = lotto.winningNumbers(1, 0);
        uint8 n2 = lotto.winningNumbers(1, 1);
        uint8 n3 = lotto.winningNumbers(1, 2);
        uint8 n4 = lotto.winningNumbers(1, 3);
        uint8 n5 = lotto.winningNumbers(1, 4);
        uint8 n6 = lotto.winningNumbers(1, 5);
        console.log("Draw #1 winning numbers:");
        console.log(" -", n1, n2, n3);
        console.log(" -", n4, n5, n6);

        // 9. 상금 풀 확인
        console.log("\n=== 8. Prize Pool Status ===");
        uint256 pool = lotto.prizePool(1);
        console.log("Prize pool:", pool, "wei");
        console.log("Prize pool:", pool / 1e18, "ETH (before distribution)");
        
        if (pool == 0) {
            console.log("Prize distributed to winner(s)!");
        } else {
            console.log("No winners - prize pool remains");
        }

        // 10. 티켓 소유자 확인
        console.log("\n=== 9. Ticket Ownership ===");
        address owner0 = lotto.ownerOf(0);
        address owner1 = lotto.ownerOf(1);
        console.log("Ticket #0 owner:", owner0);
        console.log("Ticket #1 owner:", owner1);

        vm.stopBroadcast();

        console.log("\n========================================");
        console.log("  TEST COMPLETED SUCCESSFULLY!");
        console.log("========================================\n");
    }
}


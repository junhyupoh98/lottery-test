// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/Lotto.sol";

contract CheckContractState is Script {
    function run() external view {
        address contractAddress = 0x098dA63EDAf32DA8E69F9AD3A00368262EDEc4bE;
        Lotto lotto = Lotto(contractAddress);
        
        console.log("\n========================================");
        console.log("  LOTTO CONTRACT STATE CHECK");
        console.log("========================================\n");
        
        // 기본 정보
        console.log("=== Basic Info ===");
        console.log("Contract Address:", contractAddress);
        console.log("Owner:", lotto.owner());
        console.log("Ticket Price:", lotto.ticketPrice());
        console.log("Next Ticket ID:", lotto.nextTicketId());
        
        // 회차 정보
        console.log("\n=== Draw Info ===");
        uint256 currentDrawId = lotto.currentDrawId();
        console.log("Current Draw ID:", currentDrawId);
        
        // 현재 회차 상태
        (uint256 drawTimestamp, bool isOpenForSale) = lotto.draws(currentDrawId);
        console.log("Current Draw Timestamp:", drawTimestamp);
        console.log("Current Draw Open For Sale:", isOpenForSale);
        
        // 상금 풀
        uint256 pool = lotto.prizePool(currentDrawId);
        console.log("Current Prize Pool:", pool);
        
        // 이전 회차들 확인 (1부터 currentDrawId-1까지)
        if (currentDrawId > 0) {
            console.log("\n=== Previous Draws ===");
            for (uint256 i = 1; i < currentDrawId && i <= 5; i++) {
                console.log("\n--- Draw #", i, " ---");
                (uint256 ts, bool open) = lotto.draws(i);
                console.log("  Timestamp:", ts);
                console.log("  Open:", open);
                console.log("  Prize Pool:", lotto.prizePool(i));
                
                // 당첨 번호 확인
                try lotto.winningNumbers(i, 0) returns (uint8 num) {
                    if (num > 0) {
                        console.log("  Winning Numbers:");
                        console.log("   ", lotto.winningNumbers(i, 0));
                        console.log("   ", lotto.winningNumbers(i, 1));
                        console.log("   ", lotto.winningNumbers(i, 2));
                        console.log("   ", lotto.winningNumbers(i, 3));
                        console.log("   ", lotto.winningNumbers(i, 4));
                        console.log("   ", lotto.winningNumbers(i, 5));
                    } else {
                        console.log("  Winning Numbers: Not set");
                    }
                } catch {
                    console.log("  Winning Numbers: Not set");
                }
            }
        }
        
        console.log("\n========================================");
        console.log("  CHECK COMPLETED");
        console.log("========================================\n");
    }
}



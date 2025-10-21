// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/Lotto.sol";

contract CheckWinningNumbers is Script {
    function run() external view {
        address contractAddress = 0x098dA63EDAf32DA8E69F9AD3A00368262EDEc4bE;
        Lotto lotto = Lotto(contractAddress);
        
        console.log("\n========================================");
        console.log("  WINNING NUMBERS CHECK");
        console.log("========================================\n");
        
        uint256 currentDrawId = lotto.currentDrawId();
        console.log("Current Draw ID:", currentDrawId);
        
        // 이전 회차들 확인
        for (uint256 i = 1; i < currentDrawId && i <= 10; i++) {
            console.log("\n--- Draw #", i, " ---");
            
            try lotto.winningNumbers(i, 0) returns (uint8 num1) {
                if (num1 > 0) {
                    console.log("  Winning Numbers: GENERATED!");
                    console.log("   ", lotto.winningNumbers(i, 0));
                    console.log("   ", lotto.winningNumbers(i, 1));
                    console.log("   ", lotto.winningNumbers(i, 2));
                    console.log("   ", lotto.winningNumbers(i, 3));
                    console.log("   ", lotto.winningNumbers(i, 4));
                    console.log("   ", lotto.winningNumbers(i, 5));
                    
                    // 상금 풀 확인
                    uint256 pool = lotto.prizePool(i);
                    console.log("  Prize Pool After Distribution:", pool);
                    if (pool == 0) {
                        console.log("  Status: Prize distributed to winners!");
                    } else {
                        console.log("  Status: No winners, prize pool remains");
                    }
                } else {
                    console.log("  Winning Numbers: NOT YET (waiting for VRF...)");
                }
            } catch {
                console.log("  Winning Numbers: NOT YET (waiting for VRF...)");
            }
        }
        
        console.log("\n========================================");
        console.log("  TIP: Run this script again in 1-2 minutes");
        console.log("========================================\n");
    }
}



// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/Lotto.sol";
import "../src/mocks/MockVRFCoordinatorV2.sol";

contract DeployLottoWithMock is Script {
    function run() external returns (Lotto, MockVRFCoordinatorV2) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("\n========================================");
        console.log("  DEPLOYING LOTTO WITH MOCK VRF");
        console.log("========================================\n");
        
        // 1. Mock VRF Coordinator 배포
        console.log("1. Deploying Mock VRF Coordinator...");
        MockVRFCoordinatorV2 mockVRF = new MockVRFCoordinatorV2();
        console.log("   Mock VRF deployed at:", address(mockVRF));
        
        // 2. Lotto 컨트랙트 배포
        console.log("\n2. Deploying Lotto Contract...");
        bytes32 keyHash = bytes32(uint256(1));
        uint64 subId = 1;
        Lotto lotto = new Lotto(address(mockVRF), subId, keyHash);
        console.log("   Lotto deployed at:", address(lotto));
        
        // 3. 첫 회차 생성
        console.log("\n3. Creating First Draw...");
        lotto.createOrUpdateDraw(1, block.timestamp + 7 days, true);
        lotto.setCurrentDraw(1);
        console.log("   Draw #1 created and opened for sale");
        
        vm.stopBroadcast();
        
        console.log("\n========================================");
        console.log("  DEPLOYMENT COMPLETED!");
        console.log("========================================");
        console.log("\nAddresses:");
        console.log("  Mock VRF:  ", address(mockVRF));
        console.log("  Lotto:     ", address(lotto));
        console.log("\nNext Steps:");
        console.log("  1. Update frontend/.env.local with new Lotto address");
        console.log("  2. Start buying tickets!");
        console.log("  3. Request VRF from frontend (admin panel)");
        console.log("  4. Call fulfillRequest on Mock VRF");
        console.log("\n========================================\n");
        
        return (lotto, mockVRF);
    }
}



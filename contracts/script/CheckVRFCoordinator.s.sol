// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";

// Orakl VRF Coordinator 인터페이스
interface IVRFCoordinator {
    function getSubscription(uint64 subId) external view returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    );
}

contract CheckVRFCoordinator is Script {
    function run() external view {
        address vrfCoordinator = 0xDA8c0A00A372503aa6EC80f9b29Cc97C454bE499;
        uint64 subId = 1165;
        address myContract = 0x098dA63EDAf32DA8E69F9AD3A00368262EDEc4bE;
        
        console.log("\n========================================");
        console.log("  ORAKL VRF SUBSCRIPTION CHECK");
        console.log("========================================\n");
        
        console.log("VRF Coordinator:", vrfCoordinator);
        console.log("Subscription ID:", subId);
        console.log("My Contract:", myContract);
        console.log("");
        
        try IVRFCoordinator(vrfCoordinator).getSubscription(subId) returns (
            uint96 balance,
            uint64 reqCount,
            address owner,
            address[] memory consumers
        ) {
            console.log("=== Subscription Info ===");
            console.log("Balance:", balance);
            console.log("Request Count:", reqCount);
            console.log("Owner:", owner);
            console.log("");
            console.log("Consumers:");
            
            bool found = false;
            for (uint i = 0; i < consumers.length; i++) {
                console.log(" -", consumers[i]);
                if (consumers[i] == myContract) {
                    found = true;
                }
            }
            
            console.log("");
            if (found) {
                console.log("Result: Consumer REGISTERED!");
            } else {
                console.log("Result: Consumer NOT REGISTERED!");
                console.log("ACTION NEEDED: Add consumer on Orakl Admin");
            }
        } catch {
            console.log("ERROR: Cannot get subscription info");
            console.log("Possible reasons:");
            console.log("1. Subscription ID does not exist");
            console.log("2. VRF Coordinator address is wrong");
        }
        
        console.log("\n========================================\n");
    }
}



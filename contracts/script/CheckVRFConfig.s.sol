// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/Lotto.sol";

contract CheckVRFConfig is Script {
    function run() external view {
        address contractAddress = 0x098dA63EDAf32DA8E69F9AD3A00368262EDEc4bE;
        
        console.log("\n========================================");
        console.log("  VRF CONFIGURATION CHECK");
        console.log("========================================\n");
        
        // 스토리지 슬롯에서 VRF 설정 읽기
        // Lotto 컨트랙트의 VRF 관련 immutable 변수들은 컨트랙트 코드에 저장됨
        
        console.log("Contract Address:", contractAddress);
        console.log("\nTo check VRF settings, we need to:");
        console.log("1. Check the deployed contract's constructor parameters");
        console.log("2. Or add getter functions to the contract");
        
        console.log("\n=== Kaia Kairos Orakl VRF Info ===");
        console.log("VRF Coordinator (Kairos):");
        console.log("  Address: 0xDA8c0A00A372503aa6EC80f9b29Cc97C454bE499");
        console.log("\nKey Hash (200 gwei):");
        console.log("  0xd9af33106d664a53cb9946df5cd81a30695f5b72224ee64e798b278af812779c");
        console.log("\nOrakl Dashboard:");
        console.log("  https://admin.orakl.network");
        
        console.log("\n========================================\n");
    }
}



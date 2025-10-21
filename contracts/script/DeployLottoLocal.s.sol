// script/DeployLottoLocal.s.sol
// 로컬 테스트용 (Mock VRF 사용)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Lotto.sol";
import "../src/mocks/MockVRFCoordinatorV2.sol";

contract DeployLottoLocal is Script {
    function run() external returns (Lotto, MockVRFCoordinatorV2) {
        vm.startBroadcast();

        // 1. Mock VRF Coordinator 배포
        MockVRFCoordinatorV2 mockVRF = new MockVRFCoordinatorV2();
        console.log("Mock VRF Coordinator deployed at:", address(mockVRF));

        // 2. Lotto 컨트랙트 배포 (Mock VRF 사용)
        bytes32 keyHash = bytes32(uint256(1)); // 더미 값
        uint64 subId = 1; // 더미 값
        Lotto lotto = new Lotto(address(mockVRF), subId, keyHash);
        console.log("Lotto Contract deployed at:", address(lotto));

        // 3. 첫 회차 생성 및 설정
        lotto.createOrUpdateDraw(1, block.timestamp + 1 days, true);
        lotto.setCurrentDraw(1);
        console.log("Draw #1 created and set as current");

        vm.stopBroadcast();
        
        return (lotto, mockVRF);
    }
}


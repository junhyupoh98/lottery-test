// script/DeployLotto.s.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Lotto.sol";

contract DeployLotto is Script {
    function run() external returns (Lotto) {
        // .env 파일에서 VRF 설정을 읽어옵니다.
        address vrfCoordinator = vm.envAddress("VRF_COORDINATOR_V2");
        uint64 subscriptionId = uint64(vm.envUint("VRF_SUBSCRIPTION_ID"));
        bytes32 keyHash = vm.envBytes32("VRF_KEY_HASH");

        // .env 파일에서 배포자 개인키를 읽어옵니다.
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Lotto lotto = new Lotto(vrfCoordinator, subscriptionId, keyHash);

        vm.stopBroadcast();
        
        console.log("Lotto Contract Deployed at:", address(lotto));
        return lotto;
    }
}
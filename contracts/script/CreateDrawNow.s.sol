// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {Lotto} from "../src/Lotto.sol";

contract CreateDrawNow is Script {
    function run() external {
        address lottoContractAddress = 0x2e7bb733b7813628a46130fa48b9f9cdda29e088;
        Lotto lotto = Lotto(lottoContractAddress);

        // 현재 시간 + 1시간 후 (판매 종료 시간)
        uint256 drawIdToCreate = 1;
        uint256 drawTimestamp = block.timestamp + 3600; // 1시간 후

        vm.startBroadcast();

        // 추첨 생성 및 판매 시작
        lotto.createOrUpdateDraw(drawIdToCreate, drawTimestamp, true);
        lotto.setCurrentDraw(drawIdToCreate);

        vm.stopBroadcast();
    }
}

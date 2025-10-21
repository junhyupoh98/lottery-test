// contracts/script/CreateDraw.s.sol (완성된 최종 코드)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; // 버전 통일: 컨트랙트와 동일

import {Script} from "forge-std/Script.sol"; // 👈 2. 'Script' 도구 가져오기 (오류 2 해결)
import {Lotto} from "../src/Lotto.sol";

contract CreateDraw is Script {
    function run() external {
        // 이 주소는 우리가 새로 배포하고 검증한 Lotto 컨트랙트 주소입니다.
        address lottoContractAddress = 0x1fD02347ED80eF3e182d24Dc16C59398e4525140;
        Lotto lotto = Lotto(lottoContractAddress);

        // --- 여기에 생성할 회차 정보를 입력하세요 ---
        uint256 drawIdToCreate = 80;
        uint256 drawTimestamp = 1761424800; // 예시: 2025년 10월 25일 토요일 오후 9시

        vm.startBroadcast();

        // 1. 80회차의 추첨 날짜를 블록체인에 등록하고, 판매를 시작(true)합니다.
        lotto.createOrUpdateDraw(drawIdToCreate, drawTimestamp, true);

        // 2. 현재 판매할 티켓은 80회차임을 컨트랙트에 알립니다.
        lotto.setCurrentDraw(drawIdToCreate);

        vm.stopBroadcast();
    }
}
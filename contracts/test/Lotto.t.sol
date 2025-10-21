// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {Lotto} from "../src/Lotto.sol";
import {MockVRFCoordinatorV2} from "../src/mocks/MockVRFCoordinatorV2.sol";

contract LottoVRFTest is Test {
    Lotto private lotto;
    MockVRFCoordinatorV2 private mock;

    function setUp() public {
        mock = new MockVRFCoordinatorV2();
        // dummy values
        bytes32 keyHash = bytes32(uint256(1));
        uint64 subId = 1;
        lotto = new Lotto(address(mock), subId, keyHash);

        // 회차 생성 및 현재 회차 설정
        lotto.createOrUpdateDraw(1, block.timestamp + 1 days, true);
        lotto.setCurrentDraw(1);
    }

    function testBuyAndDrawAndDistribute() public {
        // 티켓 가격 지불 (EOA 사용자로 구매)
        uint256 price = lotto.ticketPrice();
        uint8[6] memory numbers = [uint8(1),2,3,4,5,6];
        address user = makeAddr("user");
        vm.deal(user, 10 ether);
        vm.prank(user);
        lotto.buyTicket{value: price}(numbers, "ipfs://cid");

        // 과거 회차에 대해 요청해야 하므로 현재를 2로 바꾸고 1에 대해 요청
        lotto.createOrUpdateDraw(2, block.timestamp + 2 days, true);
        lotto.setCurrentDraw(2);

        uint256 requestId = lotto.requestRandomWinningNumbers(1);

        // VRF fulfill 모의 실행
        mock.fulfillRequest(requestId);

        // winningNumbers 기록되었는지 확인
        (uint8 a0, uint8 a1, uint8 a2, uint8 a3, uint8 a4, uint8 a5) = _getWin(1);
        assertGt(a0, 0);
        assertGt(a1, 0);
        assertGt(a2, 0);
        assertGt(a3, 0);
        assertGt(a4, 0);
        assertGt(a5, 0);
    }

    function _getWin(uint256 drawId) internal view returns (uint8, uint8, uint8, uint8, uint8, uint8) {
        return (
            lotto.winningNumbers(drawId, 0),
            lotto.winningNumbers(drawId, 1),
            lotto.winningNumbers(drawId, 2),
            lotto.winningNumbers(drawId, 3),
            lotto.winningNumbers(drawId, 4),
            lotto.winningNumbers(drawId, 5)
        );
    }
}



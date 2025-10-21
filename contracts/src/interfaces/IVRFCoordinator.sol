// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IVRFCoordinator
 * @notice Orakl Network VRF Coordinator Interface
 */
interface IVRFCoordinator {
    function requestRandomWords(
        bytes32 keyHash,
        uint64 accId,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);
}


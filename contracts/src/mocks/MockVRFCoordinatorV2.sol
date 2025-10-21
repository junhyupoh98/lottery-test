// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MockVRFCoordinatorV2
 * @notice Mock VRF Coordinator for testing - compatible with Orakl VRF interface
 */
contract MockVRFCoordinatorV2 {
    uint256 private _nextRequestId = 1;

    struct Request {
        address consumer;
        bytes32 keyHash;
        uint64 accId;
        uint32 callbackGasLimit;
        uint32 numWords;
    }

    mapping(uint256 => Request) public requests;

    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint64 accId,
        address indexed sender
    );

    event RandomWordsFulfilled(
        uint256 indexed requestId,
        uint256[] randomWords
    );

    /**
     * @notice Request random words (Orakl VRF compatible interface)
     * @param keyHash The key hash
     * @param accId The account ID
     * @param callbackGasLimit Gas limit for callback
     * @param numWords Number of random words to request
     */
    function requestRandomWords(
        bytes32 keyHash,
        uint64 accId,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId) {
        requestId = _nextRequestId++;
        requests[requestId] = Request({
            consumer: msg.sender,
            keyHash: keyHash,
            accId: accId,
            callbackGasLimit: callbackGasLimit,
            numWords: numWords
        });

        emit RandomWordsRequested(keyHash, requestId, accId, msg.sender);
    }

    /**
     * @notice Fulfill VRF request (call this manually to trigger callback)
     * @param requestId The request ID to fulfill
     */
    function fulfillRequest(uint256 requestId) external {
        Request memory r = requests[requestId];
        require(r.consumer != address(0), "MockVRF: invalid requestId");

        // Generate pseudo-random numbers for testing
        uint256[] memory words = new uint256[](r.numWords);
        for (uint256 i = 0; i < r.numWords; i++) {
            words[i] = uint256(keccak256(abi.encode(
                block.timestamp,
                block.prevrandao,
                requestId,
                i,
                msg.sender
            )));
        }

        emit RandomWordsFulfilled(requestId, words);

        // Call the consumer's fulfillRandomWords function
        (bool success, ) = r.consumer.call(
            abi.encodeWithSignature(
                "fulfillRandomWords(uint256,uint256[])",
                requestId,
                words
            )
        );
        require(success, "MockVRF: callback failed");

        delete requests[requestId];
    }

    /**
     * @notice Get request details
     */
    function getRequest(uint256 requestId) external view returns (
        address consumer,
        bytes32 keyHash,
        uint64 accId,
        uint32 callbackGasLimit,
        uint32 numWords
    ) {
        Request memory r = requests[requestId];
        return (r.consumer, r.keyHash, r.accId, r.callbackGasLimit, r.numWords);
    }
}



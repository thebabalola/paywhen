// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IConditionOracle} from "./IConditionOracle.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ConditionOracle is IConditionOracle, Ownable {
    mapping(bytes32 => bool) public conditionStatus;
    mapping(bytes32 => string) public conditionDescriptions;

    event ConditionResolved(bytes32 indexed conditionId, bool status);

    constructor() Ownable(msg.sender) {}

    function resolveCondition(bytes32 conditionId, bool status) external onlyOwner {
        conditionStatus[conditionId] = status;
        emit ConditionResolved(conditionId, status);
    }

    function setConditionDescription(bytes32 conditionId, string memory description) external onlyOwner {
        conditionDescriptions[conditionId] = description;
    }

    function isConditionMet(bytes calldata data) external view override returns (bool) {
        bytes32 conditionId = abi.decode(data, (bytes32));
        return conditionStatus[conditionId];
    }

    function getConditionDescription(bytes calldata data) external view override returns (string memory) {
        bytes32 conditionId = abi.decode(data, (bytes32));
        return conditionDescriptions[conditionId];
    }
}

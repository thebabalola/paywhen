// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../IConditionOracle.sol";

contract MockOracle is IConditionOracle {
    mapping(bytes => bool) public conditions;

    function setCondition(bytes calldata data, bool met) external {
        conditions[data] = met;
    }

    function isConditionMet(bytes calldata data) external view override returns (bool) {
        return conditions[data];
    }

    function getConditionDescription(bytes calldata) external pure override returns (string memory) {
        return "Mock Condition";
    }
}

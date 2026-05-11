// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IConditionOracle
 * @dev Interface for modular oracles that verify conditions for payments.
 */
interface IConditionOracle {
    /**
     * @dev Check if a condition is met based on provided data.
     * @param data Encoded data specific to the oracle implementation.
     * @return bool True if the condition is met.
     */
    function isConditionMet(bytes calldata data) external view returns (bool);

    /**
     * @dev Get a description of the condition being checked.
     * @param data Encoded data specific to the oracle implementation.
     * @return string Human-readable description.
     */
    function getConditionDescription(bytes calldata data) external view returns (string memory);
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ConditionalPayment} from "./ConditionalPayment.sol";

/**
 * @title PaymentFactory
 * @notice Factory for deploying ConditionalPayment contracts
 * @dev Creates and tracks all conditional payment instances
 */
contract PaymentFactory {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Total number of payments created
    uint256 public totalPayments;

    /// @notice Mapping of payment ID to payment contract address
    mapping(uint256 => address) public payments;

    /// @notice Mapping of user address to their payment IDs
    mapping(address => uint256[]) public userPayments;

    /// @notice Available condition types
    enum ConditionType {
        TIMESTAMP,    // Execute at specific timestamp
        MANUAL,       // Execute upon manual approval
        RECURRING,    // Execute on interval
        ORACLE        // Execute based on oracle data (future)
    }

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emitted when a new payment is created
    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed paymentAddress,
        address indexed sender,
        address recipient,
        uint256 amount,
        ConditionType conditionType,
        uint256 executeAt
    );

    /// @notice Emitted when a payment is executed
    event PaymentExecuted(
        uint256 indexed paymentId,
        address indexed paymentAddress,
        address recipient,
        uint256 amount
    );

    /// @notice Emitted when a payment is refunded
    event PaymentRefunded(
        uint256 indexed paymentId,
        address indexed paymentAddress,
        address sender,
        uint256 amount
    );

    /*//////////////////////////////////////////////////////////////
                          CREATE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Create a new time-based conditional payment
     * @param recipient Address to receive funds
     * @param executeAt Unix timestamp when payment should execute
     * @return paymentAddress Address of deployed ConditionalPayment
     */
    function createTimeBasedPayment(
        address recipient,
        uint256 executeAt
    ) external payable returns (address paymentAddress) {
        require(recipient != address(0), "Invalid recipient");
        require(msg.value > 0, "Amount must be > 0");
        require(executeAt > block.timestamp, "Timestamp must be in future");
        require(executeAt <= block.timestamp + 365 days, "Too far in future");

        return _createPayment(
            recipient,
            ConditionType.TIMESTAMP,
            abi.encode(executeAt)
        );
    }

    /**
     * @notice Create a new manual approval payment
     * @param recipient Address to receive funds
     * @param approvers Addresses that can approve
     * @param requiredApprovals Number of approvals required
     * @return paymentAddress Address of deployed ConditionalPayment
     */
    function createManualPayment(
        address recipient,
        address[] calldata approvers,
        uint256 requiredApprovals
    ) external payable returns (address paymentAddress) {
        require(recipient != address(0), "Invalid recipient");
        require(msg.value > 0, "Amount must be > 0");
        require(approvers.length > 0, "Need approvers");
        require(requiredApprovals > 0 && requiredApprovals <= approvers.length, "Invalid threshold");

        return _createPayment(
            recipient,
            ConditionType.MANUAL,
            abi.encode(approvers, requiredApprovals)
        );
    }

    /**
     * @notice Create a new recurring payment
     * @param recipient Address to receive funds
     * @param startTime When first payment should occur
     * @param interval Seconds between payments
     * @param occurrences Number of payments (0 = infinite)
     * @return paymentAddress Address of deployed ConditionalPayment
     */
    function createRecurringPayment(
        address recipient,
        uint256 startTime,
        uint256 interval,
        uint256 occurrences
    ) external payable returns (address paymentAddress) {
        require(recipient != address(0), "Invalid recipient");
        require(msg.value > 0, "Amount must be > 0");
        require(interval >= 1 days, "Interval too short");
        require(interval <= 365 days, "Interval too long");
        require(startTime >= block.timestamp, "Start time in past");

        return _createPayment(
            recipient,
            ConditionType.RECURRING,
            abi.encode(startTime, interval, occurrences)
        );
    }

    /*//////////////////////////////////////////////////////////////
                         INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Internal function to deploy a ConditionalPayment contract
     */
    function _createPayment(
        address recipient,
        ConditionType conditionType,
        bytes memory conditionData
    ) internal returns (address) {
        totalPayments++;
        uint256 paymentId = totalPayments;

        ConditionalPayment payment = new ConditionalPayment{
            value: msg.value
        }(
            msg.sender,
            recipient,
            msg.value,
            uint8(conditionType),
            conditionData
        );

        address paymentAddress = address(payment);
        payments[paymentId] = paymentAddress;
        userPayments[msg.sender].push(paymentId);

        emit PaymentCreated(
            paymentId,
            paymentAddress,
            msg.sender,
            recipient,
            msg.value,
            conditionType,
            block.timestamp
        );

        return paymentAddress;
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Get payment address by ID
     */
    function getPayment(uint256 paymentId) external view returns (address) {
        return payments[paymentId];
    }

    /**
     * @notice Get all payment IDs for a user
     */
    function getUserPaymentIds(address user) external view returns (uint256[] memory) {
        return userPayments[user];
    }

    /**
     * @notice Get count of payments for a user
     */
    function getUserPaymentCount(address user) external view returns (uint256) {
        return userPayments[user].length;
    }

    /**
     * @notice Check if payment ID exists
     */
    function paymentExists(uint256 paymentId) external view returns (bool) {
        return paymentId > 0 && paymentId <= totalPayments;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PoolKey} from "../types/PoolKey.sol";
import {BalanceDelta} from "../types/BalanceDelta.sol";

interface IPoolManager {
    function donate(PoolKey calldata key, uint256 amount0, uint256 amount1, bytes calldata data) external returns (BalanceDelta);
}

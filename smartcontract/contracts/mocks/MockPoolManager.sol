// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";

contract MockPoolManager is IPoolManager {
    uint256 public donateCount;
    PoolKey public lastKey;
    uint256 public lastAmount0;
    uint256 public lastAmount1;

    function donate(PoolKey calldata key, uint256 amount0, uint256 amount1, bytes calldata) external override returns (BalanceDelta) {
        donateCount++;
        lastKey = key;
        lastAmount0 = amount0;
        lastAmount1 = amount1;
        return BalanceDelta.wrap(0);
    }

    function unlock(bytes calldata data) external override returns (bytes memory) {
        return data;
    }

    function updateDynamicLPFee(PoolKey calldata, uint24) external override {}
}

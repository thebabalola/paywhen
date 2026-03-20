// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

type BalanceDelta is int256;

using BalanceDeltaLibrary for BalanceDelta global;

library BalanceDeltaLibrary {
    function amount0(BalanceDelta delta) internal pure returns (int128) {
        return int128(BalanceDelta.unwrap(delta) >> 128);
    }
    function amount1(BalanceDelta delta) internal pure returns (int128) {
        return int128(BalanceDelta.unwrap(delta));
    }
}

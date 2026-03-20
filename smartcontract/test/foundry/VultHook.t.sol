// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import {VultHook} from "../../contracts/VultHook.sol";
import {MockPoolManager} from "../../contracts/mocks/MockPoolManager.sol";
import {MockUserVault} from "../../contracts/mocks/MockUserVault.sol";
import {SimpleERC20} from "../../contracts/mocks/SimpleERC20.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";

contract VultHookTest is Test {
    VultHook public hook;
    MockPoolManager public manager;
    MockUserVault public vault0;
    MockUserVault public vault1;
    SimpleERC20 public token0;
    SimpleERC20 public token1;
    PoolKey public key;

    function setUp() public {
        manager = new MockPoolManager();
        hook = new VultHook(IPoolManager(address(manager)));

        token0 = new SimpleERC20("Token 0", "TK0", 18);
        token1 = new SimpleERC20("Token 1", "TK1", 18);

        vault0 = new MockUserVault(address(token0));
        vault1 = new MockUserVault(address(token1));

        hook.setVaultForAsset(address(token0), address(vault0));
        hook.setVaultForAsset(address(token1), address(vault1));

        key = PoolKey({
            currency0: Currency.wrap(address(token0)),
            currency1: Currency.wrap(address(token1)),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(hook))
        });

        // Mint initial tokens to hook for testing liquidity addition
        token0.mint(address(hook), 1000 ether);
        token1.mint(address(hook), 1000 ether);
    }

    function test_afterAddLiquidity_DepositsToVault() public {
        ModifyLiquidityParams memory params = ModifyLiquidityParams({
            tickLower: -60,
            tickUpper: 60,
            liquidityDelta: 100 ether,
            salt: bytes32(0)
        });

        // delta.amount0() > 0 case
        // BalanceDelta amount0 is in the upper bits, amount1 in lower bits
        BalanceDelta delta = BalanceDelta.wrap((int256(100 ether) << 128) | int256(50 ether));
        BalanceDelta fees = BalanceDelta.wrap(0);

        hook.afterAddLiquidity(address(this), key, params, delta, fees, "");

        assertEq(vault0.totalAssets(), 100 ether);
        assertEq(vault1.totalAssets(), 50 ether);
        assertEq(token0.balanceOf(address(vault0)), 100 ether);
        assertEq(token1.balanceOf(address(vault1)), 50 ether);
    }

    function test_afterSwap_HarvestsAndDonatesYield() public {
        // Setup initial vault deposits
        token0.mint(address(vault0), 100 ether);
        token1.mint(address(vault1), 100 ether);
        vault0.setSimulatedAssets(100 ether, 100 ether);
        vault1.setSimulatedAssets(100 ether, 100 ether);

        // Simulate yield in vault0
        vault0.setSimulatedAssets(100 ether, 110 ether); // 10 ether yield
        
        // Also simulate yield in vault1
        vault1.setSimulatedAssets(100 ether, 105 ether); // 5 ether yield

        SwapParams memory params = SwapParams({
            zeroForOne: true,
            amountSpecified: 1 ether,
            sqrtPriceLimitX96: 0
        });
        BalanceDelta delta = BalanceDelta.wrap(0);

        hook.afterSwap(address(this), key, params, delta, "");

        // Verify yield was withdrawn from vaults (simulated assets go to hook then donated)
        assertEq(vault0.totalAssets(), 100 ether); // Yield was withdrawn
        assertEq(vault1.totalAssets(), 100 ether);

        // Verify manager received donation calls
        // In our simple MockPoolManager, we only track the LAST call.
        // VultHook calls donate(vault0) then donate(vault1).
        assertEq(manager.donateCount(), 2);
        assertEq(manager.lastAmount0(), 0);
        assertEq(manager.lastAmount1(), 5 ether); // Last call was for vault1
    }

    function test_afterSwap_NoYield_NoDonation() public {
        vault0.setSimulatedAssets(100 ether, 100 ether);
        vault1.setSimulatedAssets(100 ether, 100 ether);

        SwapParams memory params = SwapParams({
            zeroForOne: true,
            amountSpecified: 1 ether,
            sqrtPriceLimitX96: 0
        });
        BalanceDelta delta = BalanceDelta.wrap(0);

        hook.afterSwap(address(this), key, params, delta, "");

        assertEq(manager.donateCount(), 0);
    }
}

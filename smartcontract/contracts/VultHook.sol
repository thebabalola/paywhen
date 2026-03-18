// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {Currency, CurrencyLibrary} from "@uniswap/v4-core/src/types/Currency.sol";
import {ModifyLiquidityParams, SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUserVault} from "./interfaces/IUserVault.sol";

/**
 * @title VultHook
 * @dev Uniswap v4 Hook that integrates ForgeX ERC-4626 vaults for yield generation.
 * @notice This hook moves idle pool assets into vaults during liquidity additions and swaps.
 */
contract VultHook is BaseHook {
    using CurrencyLibrary for Currency;

    /*//////////////////////////////////////////////////////////////
                              ERRORS
    //////////////////////////////////////////////////////////////*/

    error OnlyOwner();
    error ZeroAddress();

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Contract owner with admin privileges
    address public owner;

    /// @notice Mapping of asset tokens to their corresponding ForgeX vaults
    mapping(address => address) public assetToVault;

    /// @notice Minimum yield threshold to trigger harvest (avoids dust donations)
    uint256 public constant MIN_YIELD_THRESHOLD = 1000;

    /*//////////////////////////////////////////////////////////////
                              EVENTS
    //////////////////////////////////////////////////////////////*/

    event VaultSet(address indexed asset, address indexed vault);
    event YieldHarvested(address indexed vault, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /*//////////////////////////////////////////////////////////////
                             MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {
        owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                             HOOK OVERRIDES
    //////////////////////////////////////////////////////////////*/

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: true,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    /**
     * @dev Move injected liquidity into ForgeX vaults after it's added to the pool.
     */
    function _afterAddLiquidity(
        address sender,
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        BalanceDelta delta,
        BalanceDelta feesAccrued,
        bytes calldata hookData
    ) internal override returns (bytes4, BalanceDelta) {
        address vault0 = assetToVault[Currency.unwrap(key.currency0)];
        address vault1 = assetToVault[Currency.unwrap(key.currency1)];

        // If vault exists for currency0, move assets
        if (vault0 != address(0) && delta.amount0() > 0) {
            uint256 amount = uint256(uint128(delta.amount0()));
            IERC20(Currency.unwrap(key.currency0)).approve(vault0, amount);
            IUserVault(vault0).deposit(amount, address(this));
        }

        // If vault exists for currency1, move assets
        if (vault1 != address(0) && delta.amount1() > 0) {
            uint256 amount = uint256(uint128(delta.amount1()));
            IERC20(Currency.unwrap(key.currency1)).approve(vault1, amount);
            IUserVault(vault1).deposit(amount, address(this));
        }

        return (BaseHook.afterAddLiquidity.selector, delta);
    }

    /**
     * @dev Before a swap, ensure the vault backing the output token has sufficient
     *      liquidity. If a vault holds assets and the swap will drain the pool side,
     *      withdraw from the vault to ensure the swap can complete.
     */
    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        // Determine which token the swapper is buying (output token)
        // zeroForOne = true means swapping token0 for token1 (buying token1)
        address outputToken = params.zeroForOne
            ? Currency.unwrap(key.currency1)
            : Currency.unwrap(key.currency0);

        address vault = assetToVault[outputToken];

        // If vault exists for the output token, withdraw some liquidity
        // to ensure the pool has enough to satisfy the swap
        if (vault != address(0)) {
            uint256 vaultAssets = IUserVault(vault).totalAssets();
            if (vaultAssets > MIN_YIELD_THRESHOLD) {
                // Withdraw a portion to rebalance pool liquidity
                uint256 withdrawAmount = vaultAssets / 10; // 10% rebalance
                if (withdrawAmount > MIN_YIELD_THRESHOLD) {
                    IUserVault(vault).withdraw(withdrawAmount, address(this), address(this));
                }
            }
        }

        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    /**
     * @dev Donate harvested interest back to the pool LPs.
     */
    function _afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        address vault0 = assetToVault[Currency.unwrap(key.currency0)];
        address vault1 = assetToVault[Currency.unwrap(key.currency1)];

        if (vault0 != address(0)) {
            uint256 currentAssets = IUserVault(vault0).totalAssets();
            uint256 accruedAssets = IUserVault(vault0).totalAssetsAccrued();

            if (accruedAssets > currentAssets + MIN_YIELD_THRESHOLD) {
                uint256 yieldAmount = accruedAssets - currentAssets;
                IUserVault(vault0).withdraw(yieldAmount, address(this), address(this));
                IERC20(Currency.unwrap(key.currency0)).approve(address(poolManager), yieldAmount);
                poolManager.donate(key, yieldAmount, 0, "");
                emit YieldHarvested(vault0, yieldAmount);
            }
        }

        if (vault1 != address(0)) {
            uint256 currentAssets = IUserVault(vault1).totalAssets();
            uint256 accruedAssets = IUserVault(vault1).totalAssetsAccrued();

            if (accruedAssets > currentAssets + MIN_YIELD_THRESHOLD) {
                uint256 yieldAmount = accruedAssets - currentAssets;
                IUserVault(vault1).withdraw(yieldAmount, address(this), address(this));
                IERC20(Currency.unwrap(key.currency1)).approve(address(poolManager), yieldAmount);
                poolManager.donate(key, 0, yieldAmount, "");
                emit YieldHarvested(vault1, yieldAmount);
            }
        }

        return (BaseHook.afterSwap.selector, 0);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Overriding to allow deployment to any address.
     * @notice In production, the hook must be at a specific address matching its permissions.
     */
    function validateHookAddress(BaseHook _this) internal pure override {}

    /**
     * @notice Set the ForgeX vault for a given asset token. Only callable by the owner.
     * @param asset The ERC-20 token address
     * @param vault The ForgeX UserVault address for that asset
     */
    function setVaultForAsset(address asset, address vault) external onlyOwner {
        if (asset == address(0)) revert ZeroAddress();
        assetToVault[asset] = vault;
        emit VaultSet(asset, vault);
    }

    /**
     * @notice Transfer ownership of the hook contract.
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

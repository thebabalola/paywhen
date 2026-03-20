// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IUserVault} from "../interfaces/IUserVault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockUserVault is IUserVault {
    IERC20 public _asset;
    uint256 public simulatedTotalAssets;
    uint256 public simulatedTotalAssetsAccrued;

    constructor(address asset_) {
        _asset = IERC20(asset_);
    }

    function deposit(uint256 assets, address) external override returns (uint256) {
        _asset.transferFrom(msg.sender, address(this), assets);
        simulatedTotalAssets += assets;
        simulatedTotalAssetsAccrued += assets;
        return assets;
    }

    function withdraw(uint256 assets, address receiver, address) external override returns (uint256) {
        simulatedTotalAssets -= assets;
        simulatedTotalAssetsAccrued -= assets;
        _asset.transfer(receiver, assets);
        return assets;
    }

    function totalAssets() external view override returns (uint256) {
        return simulatedTotalAssets;
    }

    function totalAssetsAccrued() external override returns (uint256) {
        return simulatedTotalAssetsAccrued;
    }

    function asset() external view override returns (address) {
        return address(_asset);
    }

    function setSimulatedAssets(uint256 total, uint256 accrued) external {
        simulatedTotalAssets = total;
        simulatedTotalAssetsAccrued = accrued;
    }
    
    function previewRedeem(uint256 shares) external pure override returns (uint256) { return shares; }
    function redeem(uint256 shares, address receiver, address) external override returns (uint256) { return shares; }
}

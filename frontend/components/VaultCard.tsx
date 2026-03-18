"use client";

import { useState, useEffect } from "react";
import { formatEther, parseEther } from "viem";
import { useVaultData, useVaultDeposit, useVaultWithdraw } from "@/hooks/useUserVault";
import { useToast } from "./Toast";

interface VaultCardProps {
  vaultAddress: `0x${string}`;
  index: number;
}

export default function VaultCard({ vaultAddress, index }: VaultCardProps) {
  const vault = useVaultData(vaultAddress);
  const deposit = useVaultDeposit(vaultAddress);
  const withdraw = useVaultWithdraw(vaultAddress);
  const { showToast } = useToast();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [step, setStep] = useState<"idle" | "approving" | "depositing">("idle");

  // Handle deposit flow: approve then deposit
  useEffect(() => {
    if (deposit.approveConfirmed && step === "approving") {
      setStep("depositing");
      const amount = parseEther(depositAmount);
      deposit.deposit(amount);
    }
  }, [deposit.approveConfirmed]);

  useEffect(() => {
    if (deposit.depositConfirmed) {
      showToast("Deposit successful!", "success");
      setDepositAmount("");
      setShowDeposit(false);
      setStep("idle");
      vault.refetch();
    }
  }, [deposit.depositConfirmed]);

  useEffect(() => {
    if (withdraw.isSuccess) {
      showToast("Withdrawal successful!", "success");
      setWithdrawAmount("");
      setShowWithdraw(false);
      vault.refetch();
    }
  }, [withdraw.isSuccess]);

  useEffect(() => {
    if (deposit.error) {
      showToast(`Deposit failed: ${deposit.error.message.slice(0, 80)}`, "error");
      setStep("idle");
    }
    if (withdraw.error) {
      showToast(`Withdraw failed: ${withdraw.error.message.slice(0, 80)}`, "error");
    }
  }, [deposit.error, withdraw.error]);

  const handleDeposit = () => {
    if (!depositAmount || !vault.assetAddress) return;
    const amount = parseEther(depositAmount);
    setStep("approving");
    deposit.approve(vault.assetAddress as `0x${string}`, amount);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) return;
    withdraw.withdraw(parseEther(withdrawAmount));
  };

  const formatUSD = (val: bigint | undefined) => {
    if (!val) return "$0.00";
    return `$${Number(formatEther(val)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTokens = (val: bigint | undefined) => {
    if (!val) return "0";
    return Number(formatEther(val)).toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold text-lg">
          V{index + 1}
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-gray-500 bg-black/20 px-3 py-1 rounded-full group-hover:text-primary transition-colors">
            {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}
          </div>
          {vault.isPaused && (
            <div className="text-xs text-red-400 mt-1 font-bold">PAUSED</div>
          )}
        </div>
      </div>

      <h3 className="text-xl font-black mb-1">ERC-4626 Vault</h3>

      <div className="grid grid-cols-2 gap-3 my-4 text-sm">
        <div className="bg-black/20 rounded-xl p-3">
          <div className="text-gray-500 text-xs font-bold">Total Assets</div>
          <div className="text-white font-bold">{formatTokens(vault.totalAssets)}</div>
        </div>
        <div className="bg-black/20 rounded-xl p-3">
          <div className="text-gray-500 text-xs font-bold">Value (USD)</div>
          <div className="text-accent font-bold">{formatUSD(vault.totalValueUSD)}</div>
        </div>
        <div className="bg-black/20 rounded-xl p-3">
          <div className="text-gray-500 text-xs font-bold">Your Shares</div>
          <div className="text-white font-bold">{formatTokens(vault.userShares)}</div>
        </div>
        <div className="bg-black/20 rounded-xl p-3">
          <div className="text-gray-500 text-xs font-bold">Share Price</div>
          <div className="text-secondary font-bold">{formatUSD(vault.sharePriceUSD)}</div>
        </div>
      </div>

      {/* Protocol allocation breakdown */}
      {(vault.aaveBalance || vault.compoundBalance) && (
        <div className="flex gap-2 mb-4 text-xs">
          {vault.aaveBalance && vault.aaveBalance > 0n && (
            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg font-bold">
              Aave: {formatTokens(vault.aaveBalance)}
            </span>
          )}
          {vault.compoundBalance && vault.compoundBalance > 0n && (
            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-lg font-bold">
              Compound: {formatTokens(vault.compoundBalance)}
            </span>
          )}
        </div>
      )}

      {/* Deposit Section */}
      {showDeposit && (
        <div className="mb-3 p-3 bg-black/30 rounded-xl space-y-2">
          <input
            type="number"
            placeholder="Amount to deposit"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="w-full p-3 rounded-lg bg-background border border-white/10 focus:border-primary outline-none text-sm"
          />
          <button
            onClick={handleDeposit}
            disabled={!depositAmount || deposit.isApproving || deposit.isDepositing}
            className="w-full py-2 bg-primary text-white rounded-lg font-bold text-sm disabled:opacity-50"
          >
            {step === "approving" ? "Approving..." : step === "depositing" ? "Depositing..." : "Confirm Deposit"}
          </button>
        </div>
      )}

      {/* Withdraw Section */}
      {showWithdraw && (
        <div className="mb-3 p-3 bg-black/30 rounded-xl space-y-2">
          <input
            type="number"
            placeholder="Amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full p-3 rounded-lg bg-background border border-white/10 focus:border-primary outline-none text-sm"
          />
          <button
            onClick={handleWithdraw}
            disabled={!withdrawAmount || withdraw.isPending}
            className="w-full py-2 bg-secondary text-white rounded-lg font-bold text-sm disabled:opacity-50"
          >
            {withdraw.isPending ? "Withdrawing..." : "Confirm Withdraw"}
          </button>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => { setShowDeposit(!showDeposit); setShowWithdraw(false); }}
          className="flex-1 py-3 bg-primary/10 border border-primary/20 rounded-xl font-bold text-primary hover:bg-primary/20 transition-all text-sm"
        >
          Deposit
        </button>
        <button
          onClick={() => { setShowWithdraw(!showWithdraw); setShowDeposit(false); }}
          className="flex-1 py-3 bg-secondary/10 border border-secondary/20 rounded-xl font-bold text-secondary hover:bg-secondary/20 transition-all text-sm"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

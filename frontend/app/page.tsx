'use client';
import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useUserPayments, useCreateTimestampPayment, useCreateManualPayment, useCreateRecurringPayment, useConditionalPayment, useApprovePayment, useExecutePayment, useRefundPayment } from "@/lib/hooks";
import { ConditionType } from "@/lib/constants";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'create' | 'status'>('create');

  // Payment creation state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [conditionType, setConditionType] = useState<ConditionType>(ConditionType.TIMESTAMP);
  const [executeAt, setExecuteAt] = useState("");
  const [approvers, setApprovers] = useState("");
  const [requiredApprovals, setRequiredApprovals] = useState("1");
  const [startTime, setStartTime] = useState("");
  const [interval, setInterval] = useState("");
  const [occurrences, setOccurrences] = useState("");

  // Status check state
  const [paymentId, setPaymentId] = useState("");

  // Transaction state
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Hooks
  const { data: userPaymentsData, refetch: refetchUserPayments } = useUserPayments(address || '0x' as `0x${string}`);
  const createTimestamp = useCreateTimestampPayment();
  const createManual = useCreateManualPayment();
  const createRecurring = useCreateRecurringPayment();
  const approve = useApprovePayment();
  const execute = useExecutePayment();
  const refund = useRefundPayment();

  // Derive payment IDs from userPaymentsData
  const paymentIds = useMemo(() => {
    return (userPaymentsData as bigint[]) || [];
  }, [userPaymentsData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      if (!recipient || !amount) {
        setStatus({ type: 'error', message: 'Recipient and amount are required' });
        return;
      }

      if (conditionType === ConditionType.TIMESTAMP) {
        if (!executeAt) {
          setStatus({ type: 'error', message: 'Execute date/time is required for timestamp payment' });
          return;
        }
        const timestamp = BigInt(Math.floor(new Date(executeAt).getTime() / 1000));
        await createTimestamp.createTimestampPayment({
          recipient: recipient as `0x${string}`,
          amount,
          executeAt: timestamp,
        });
        setStatus({ type: 'success', message: 'Timestamp payment created! Awaiting confirmation...' });
      }
      else if (conditionType === ConditionType.MANUAL) {
        const approverList = approvers.split(',').map(a => a.trim() as `0x${string}`).filter(a => a);
        if (approverList.length === 0) {
          setStatus({ type: 'error', message: 'At least one approver address is required' });
          return;
        }
        await createManual.createManualPayment({
          recipient: recipient as `0x${string}`,
          amount,
          approvers: approverList,
          requiredApprovals: BigInt(requiredApprovals || 1),
        });
        setStatus({ type: 'success', message: 'Manual payment created! Awaiting confirmation...' });
      }
      else if (conditionType === ConditionType.RECURRING) {
        if (!startTime || !interval || !occurrences) {
          setStatus({ type: 'error', message: 'Start time, interval, and occurrences are required for recurring payment' });
          return;
        }
        await createRecurring.createRecurringPayment({
          recipient: recipient as `0x${string}`,
          amount,
          startTime: BigInt(Math.floor(new Date(startTime).getTime() / 1000)),
          interval: BigInt(interval),
          occurrences: BigInt(occurrences),
        });
        setStatus({ type: 'success', message: 'Recurring payment created! Awaiting confirmation...' });
      }

      // Reset form
      setRecipient("");
      setAmount("");
      setExecuteAt("");
      setApprovers("");
      setRequiredApprovals("1");
      setStartTime("");
      setInterval("");
      setOccurrences("");
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to create payment' });
    }
  };

  const handleApprove = async (paymentAddress: `0x${string}`) => {
    try {
      await approve.approve(paymentAddress);
      setStatus({ type: 'success', message: 'Approval submitted! Awaiting confirmation...' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to approve' });
    }
  };

  const handleExecute = async (paymentAddress: `0x${string}`) => {
    try {
      await execute.execute(paymentAddress);
      setStatus({ type: 'success', message: 'Execution submitted! Awaiting confirmation...' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to execute' });
    }
  };

  const handleRefund = async (paymentAddress: `0x${string}`) => {
    try {
      await refund.refund(paymentAddress);
      setStatus({ type: 'success', message: 'Refund submitted! Awaiting confirmation...' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to refund' });
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getConditionTypeName = (type?: number) => {
    switch (type) {
      case ConditionType.TIMESTAMP: return 'Time-based';
      case ConditionType.MANUAL: return 'Manual Approval';
      case ConditionType.RECURRING: return 'Recurring';
      case ConditionType.ORACLE: return 'Oracle';
      default: return 'Unknown';
    }
  };

  const getConditionTypeColor = (type?: number) => {
    switch (type) {
      case ConditionType.TIMESTAMP: return 'bg-blue-500/10 text-blue-400';
      case ConditionType.MANUAL: return 'bg-yellow-500/10 text-yellow-400';
      case ConditionType.RECURRING: return 'bg-purple-500/10 text-purple-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
      <div className="max-w-4xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent">PayWhen</h1>
          <p className="text-gray-400 text-lg">Conditional payments — execute when conditions are met</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'create' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
          >
            Create Payment
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'status' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
          >
            My Payments ({paymentIds.length})
          </button>
        </div>

        {/* Status Messages */}
        {status && (
          <div className={`mb-6 p-4 rounded-lg border ${status.type === 'success' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <p className={status.type === 'success' ? 'text-green-400' : 'text-red-400'}>{status.message}</p>
          </div>
        )}

        {/* Create Payment Form */}
        {activeTab === 'create' && (
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-green-400">Create Conditional Payment</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              {/* Recipient & Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Amount (CELO)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
              </div>

              {/* Condition Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Condition Type</label>
                <select
                  value={conditionType}
                  onChange={(e) => setConditionType(Number(e.target.value) as ConditionType)}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                >
                  <option value={ConditionType.TIMESTAMP}>Time-based (execute at specific time)</option>
                  <option value={ConditionType.MANUAL}>Manual (requires recipient approval)</option>
                  <option value={ConditionType.RECURRING}>Recurring (repeat on schedule)</option>
                </select>
              </div>

              {/* Timestamp fields */}
              {conditionType === ConditionType.TIMESTAMP && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Execute At</label>
                  <input
                    type="datetime-local"
                    value={executeAt}
                    onChange={(e) => setExecuteAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
              )}

              {/* Manual approval fields */}
              {conditionType === ConditionType.MANUAL && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Approver Addresses (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="0x..., 0x..."
                      value={approvers}
                      onChange={(e) => setApprovers(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Required Approvals</label>
                    <input
                      type="number"
                      min="1"
                      value={requiredApprovals}
                      onChange={(e) => setRequiredApprovals(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Recurring fields */}
              {conditionType === ConditionType.RECURRING && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Start Date/Time</label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Interval (seconds)</label>
                    <input
                      type="number"
                      placeholder="86400"
                      value={interval}
                      onChange={(e) => setInterval(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">e.g., 86400 = daily</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Occurrences</label>
                    <input
                      type="number"
                      placeholder="12"
                      value={occurrences}
                      onChange={(e) => setOccurrences(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createTimestamp.isPending || createManual.isPending || createRecurring.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-teal-400 hover:from-green-600 hover:to-teal-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                {createTimestamp.isPending || createManual.isPending || createRecurring.isPending
                  ? 'Creating...'
                  : 'Create Conditional Payment'}
              </button>
            </form>
          </div>
        )}

        {/* My Payments Status */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {!isConnected ? (
              <div className="bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-700">
                <p className="text-gray-400">Connect your wallet to view your payments</p>
              </div>
            ) : paymentIds.length === 0 ? (
              <div className="bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-700">
                <p className="text-gray-400">No conditional payments found for this address</p>
              </div>
            ) : (
              paymentIds.map((pid, idx) => {
                const paymentIdNum = Number(pid);
                return (
                  <div key={pid.toString()} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Payment #{paymentIdNum}</h3>
                        <p className="text-sm text-gray-400">ID: {pid.toString()}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
                        {getConditionTypeName(0)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Use the PaymentFactory contract to look up payment details by ID.
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

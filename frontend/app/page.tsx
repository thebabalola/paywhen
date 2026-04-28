"use client";

import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  History, 
  Wallet, 
  ArrowRight, 
  Clock, 
  UserCheck, 
  Repeat, 
  ChevronRight,
  Loader2,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { 
  useUserPayments, 
  useCreateTimestampPayment, 
  useCreateManualPayment, 
  useCreateRecurringPayment, 
  useConditionalPayment, 
  useApprovePayment, 
  useExecutePayment, 
  useRefundPayment,
  useGetPaymentAddress
} from "@/lib/hooks";
import { ConditionType } from "@/lib/constants";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'create' | 'status'>('create');
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Form State
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [conditionType, setConditionType] = useState<ConditionType>(ConditionType.TIMESTAMP);
  const [executeAt, setExecuteAt] = useState("");
  const [approvers, setApprovers] = useState("");
  const [requiredApprovals, setRequiredApprovals] = useState("1");
  const [startTime, setStartTime] = useState("");
  const [interval, setInterval] = useState("");
  const [occurrences, setOccurrences] = useState("");

  const { data: userPaymentsData, isLoading: loadingPayments } = useUserPayments(address || '0x');
  const createTimestamp = useCreateTimestampPayment();
  const createManual = useCreateManualPayment();
  const createRecurring = useCreateRecurringPayment();

  const paymentIds = useMemo(() => (userPaymentsData as bigint[]) || [], [userPaymentsData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      if (conditionType === ConditionType.TIMESTAMP) {
        const timestamp = BigInt(Math.floor(new Date(executeAt).getTime() / 1000));
        await createTimestamp.createTimestampPayment({
          recipient: recipient as `0x${string}`,
          amount,
          executeAt: timestamp,
        });
      } else if (conditionType === ConditionType.MANUAL) {
        const approverList = approvers.split(',').map(a => a.trim() as `0x${string}`).filter(a => a);
        await createManual.createManualPayment({
          recipient: recipient as `0x${string}`,
          amount,
          approvers: approverList,
          requiredApprovals: BigInt(requiredApprovals || 1),
        });
      } else if (conditionType === ConditionType.RECURRING) {
        await createRecurring.createRecurringPayment({
          recipient: recipient as `0x${string}`,
          amount,
          startTime: BigInt(Math.floor(new Date(startTime).getTime() / 1000)),
          interval: BigInt(interval),
          occurrences: BigInt(occurrences),
        });
      }
      setStatus({ type: 'success', message: 'Intent published to blockchain!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Transaction failed' });
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30 overflow-x-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold tracking-widest uppercase mb-6">
            <ShieldCheck size={14} /> Secure On-Chain Escrow
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
            Programmable <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent italic">Payments</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium">
            Define the conditions. Lock the funds. Automate the execution. PayWhen transforms user intent into enforceable smart contracts.
          </p>
        </motion.div>

        {/* Dashboard Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            <TabButton 
              active={activeTab === 'create'} 
              onClick={() => setActiveTab('create')}
              icon={<Plus size={18} />}
              label="Create Intent"
            />
            <TabButton 
              active={activeTab === 'status'} 
              onClick={() => setActiveTab('status')}
              icon={<History size={18} />}
              label="My Dashboard"
              count={paymentIds.length}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'create' ? (
                <motion.div
                  key="create-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold">New Payment Intent</h2>
                      <p className="text-gray-500 text-sm">Configure your conditional execution rules</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-2xl">
                      <Wallet className="text-green-400" />
                    </div>
                  </div>

                  <form onSubmit={handleCreate} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput 
                        label="Recipient Address" 
                        placeholder="0x..." 
                        value={recipient} 
                        onChange={setRecipient}
                        icon={<ChevronRight size={16} className="text-gray-600" />}
                      />
                      <FormInput 
                        label="Amount (CELO)" 
                        type="number" 
                        placeholder="0.00" 
                        value={amount} 
                        onChange={setAmount}
                        icon={<span className="text-[10px] font-bold text-gray-600">CELO</span>}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Execution Trigger</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ConditionCard 
                          selected={conditionType === ConditionType.TIMESTAMP}
                          onClick={() => setConditionType(ConditionType.TIMESTAMP)}
                          icon={<Clock size={20} />}
                          title="Time-Based"
                          desc="Future date/time"
                        />
                        <ConditionCard 
                          selected={conditionType === ConditionType.MANUAL}
                          onClick={() => setConditionType(ConditionType.MANUAL)}
                          icon={<UserCheck size={20} />}
                          title="Manual"
                          desc="Approver threshold"
                        />
                        <ConditionCard 
                          selected={conditionType === ConditionType.RECURRING}
                          onClick={() => setConditionType(ConditionType.RECURRING)}
                          icon={<Repeat size={20} />}
                          title="Recurring"
                          desc="Scheduled interval"
                        />
                      </div>
                    </div>

                    {/* Dynamic Fields */}
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                      {conditionType === ConditionType.TIMESTAMP && (
                        <FormInput 
                          label="Execute Date & Time" 
                          type="datetime-local" 
                          value={executeAt} 
                          onChange={setExecuteAt}
                        />
                      )}
                      {conditionType === ConditionType.MANUAL && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput 
                            label="Approvers (comma separated)" 
                            placeholder="0x1, 0x2..." 
                            value={approvers} 
                            onChange={setApprovers}
                          />
                          <FormInput 
                            label="Required Approvals" 
                            type="number" 
                            value={requiredApprovals} 
                            onChange={setRequiredApprovals}
                          />
                        </div>
                      )}
                      {conditionType === ConditionType.RECURRING && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormInput label="Start" type="datetime-local" value={startTime} onChange={setStartTime} />
                          <FormInput label="Interval (sec)" type="number" value={interval} onChange={setInterval} />
                          <FormInput label="Occurrences" type="number" value={occurrences} onChange={setOccurrences} />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={createTimestamp.isPending || !isConnected}
                      className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl font-bold text-black flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                    >
                      {createTimestamp.isPending ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                      {isConnected ? "Publish Intent" : "Connect Wallet to Start"}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {!isConnected ? (
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-20 text-center">
                      <Wallet size={48} className="mx-auto mb-6 text-gray-600" />
                      <h3 className="text-2xl font-bold mb-2">Wallet Disconnected</h3>
                      <p className="text-gray-500 mb-8">Connect your wallet to manage your payment dashboard</p>
                      <appkit-button />
                    </div>
                  ) : paymentIds.length === 0 ? (
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-20 text-center">
                      <div className="w-20 h-20 bg-green-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/10">
                        <History size={32} className="text-green-500/50" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">No Active Intents</h3>
                      <p className="text-gray-500 mb-8 text-lg">You haven't created any conditional payments yet.</p>
                      <button 
                        onClick={() => setActiveTab('create')}
                        className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold"
                      >
                        Create Your First Intent
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {paymentIds.map((pid) => (
                        <PaymentItem key={pid.toString()} paymentId={pid} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

function TabButton({ active, onClick, icon, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${
        active 
          ? "bg-green-500/10 border border-green-500/30 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]" 
          : "hover:bg-white/5 text-gray-500"
      }`}
    >
      <div className="flex items-center gap-4 font-bold text-sm">
        {icon}
        {label}
      </div>
      {count !== undefined && (
        <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md">{count}</span>
      )}
    </button>
  );
}

function ConditionCard({ selected, onClick, icon, title, desc }: any) {
  return (
    <div 
      onClick={onClick}
      className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${
        selected 
          ? "bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/5" 
          : "bg-white/[0.02] border-white/5 hover:border-white/20"
      }`}
    >
      <div className={`mb-3 ${selected ? 'text-green-400' : 'text-gray-500'}`}>{icon}</div>
      <div className="font-bold text-sm mb-1">{title}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{desc}</div>
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text", icon }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1 group-focus-within:text-green-400 transition-colors">
        {label}
      </label>
      <div className="relative">
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/[0.03] border border-white/5 focus:border-green-500/50 focus:bg-white/[0.05] rounded-xl px-4 py-3 text-sm outline-none transition-all"
        />
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentItem({ paymentId }: { paymentId: bigint }) {
  const { data: address } = useGetPaymentAddress(paymentId);
  const payment = useConditionalPayment(address as `0x${string}`);
  const execute = useExecutePayment();
  const refund = useRefundPayment();
  const approve = useApprovePayment();

  if (!address || payment.isLoading) {
    return (
      <div className="h-24 bg-white/[0.02] rounded-2xl animate-pulse flex items-center px-6">
        <div className="w-8 h-8 bg-white/5 rounded-full mr-4" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/5 rounded w-1/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (payment.refunded) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (payment.executed) return 'text-green-400 bg-green-400/10 border-green-400/20';
    return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  };

  const getTypeName = () => {
    switch (payment.conditionType) {
      case 0: return 'Timestamp';
      case 1: return 'Manual Approval';
      case 2: return 'Recurring';
      default: return 'Custom';
    }
  };

  return (
    <div className="group relative bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-3xl p-6 transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        
        {/* Left Side: Basic Info */}
        <div className="flex gap-5 items-center">
          <div className={`p-4 rounded-2xl border ${getStatusColor()}`}>
            {payment.conditionType === 0 && <Clock size={24} />}
            {payment.conditionType === 1 && <UserCheck size={24} />}
            {payment.conditionType === 2 && <Repeat size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-xs uppercase tracking-widest text-gray-500">ID #{paymentId.toString()}</span>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor()}`}>
                {payment.refunded ? 'Refunded' : payment.executed ? 'Executed' : 'Locked'}
              </div>
            </div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              {payment.amount} CELO 
              <ArrowRight size={16} className="text-gray-600" /> 
              {payment.recipient?.slice(0,6)}...{payment.recipient?.slice(-4)}
            </h3>
            <p className="text-xs text-gray-500 font-medium">Type: {getTypeName()}</p>
          </div>
        </div>

        {/* Right Side: Actions & Detailed Status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {!payment.executed && !payment.refunded && (
            <>
              {payment.conditionType === 1 && (
                <button 
                  onClick={() => approve.approve(address as `0x${string}`)}
                  className="flex-1 md:flex-none h-11 px-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  Approve ({payment.approvalCount?.toString()}/{payment.requiredApprovals?.toString()})
                </button>
              )}
              <button 
                onClick={() => execute.execute(address as `0x${string}`)}
                disabled={!payment.canExecute}
                className="flex-1 md:flex-none h-11 px-6 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {execute.isPending ? <Loader2 size={14} className="animate-spin" /> : "Execute"}
              </button>
              <button 
                onClick={() => refund.refund(address as `0x${string}`)}
                className="h-11 w-11 flex items-center justify-center bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl transition-all"
              >
                <History size={16} />
              </button>
            </>
          )}
          <a 
            href={`https://celoscan.io/address/${address}`} 
            target="_blank" 
            className="h-11 w-11 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-xl transition-all"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Progress Bar for Recurring or Time-based */}
      {!payment.executed && !payment.refunded && payment.executeAt && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase mb-2">
            <span>Locked Since Publication</span>
            <span>Target: {new Date(Number(payment.executeAt) * 1000).toLocaleDateString()}</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: payment.canExecute ? '100%' : '60%' }}
              className={`h-full ${payment.canExecute ? 'bg-green-500' : 'bg-green-500/20'}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

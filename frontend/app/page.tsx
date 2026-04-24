'use client';
import { useState, useEffect } from "react";

export default function Home() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [conditionType, setConditionType] = useState("timestamp");
  const [executeAt, setExecuteAt] = useState("");
  const [status, setStatus] = useState("");
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => { setIsMiniPay(/MiniPay/i.test(navigator.userAgent)); }, []);

  const openMiniPay = (cId: string, amountEth: string, to: string) => {
    const p = new URLSearchParams({ chain: cId, amount: amountEth, action: "pay", to });
    window.location.href = `minipay://pay?${p.toString()}`;
  };

  const handleCreate = () => {
    if (!recipient || !amount) return;
    if (isMiniPay) {
      openMiniPay("celo", amount, recipient);
    } else {
      setStatus(`Payment created: ${amount} ETH to ${recipient}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent">PayWhen</h1>
          <p className="text-gray-400 text-lg">Conditional payments — execute when conditions are met</p>
          {isMiniPay && <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>MiniPay Detected</div>}
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Create Conditional Payment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Recipient Address</label>
              <input type="text" placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Amount (ETH)</label>
              <input type="number" step="0.01" placeholder="0.0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Condition Type</label>
              <select value={conditionType} onChange={(e) => setConditionType(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500">
                <option value="timestamp">Time-based (execute at specific time)</option>
                <option value="manual">Manual (requires recipient approval)</option>
                <option value="recurring">Recurring (repeat on schedule)</option>
              </select>
            </div>
            {conditionType === "timestamp" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Execute At (timestamp or date)</label>
                <input type="datetime-local" value={executeAt} onChange={(e) => setExecuteAt(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500" />
              </div>
            )}
            <button onClick={handleCreate} className="w-full bg-gradient-to-r from-green-500 to-teal-400 hover:from-green-600 hover:to-teal-500 text-white font-semibold py-3 px-6 rounded-lg transition-all">Create Conditional Payment</button>
          </div>
        </div>

        {status && (
          <div className="bg-gray-800/50 rounded-xl p-4 border-l-4 border-green-500">
            <p className="text-gray-300">{status}</p>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>PayWhen — Conditional payments on Celo. Funds held in escrow until conditions are met.</p>
        </div>
      </div>
    </div>
  );
}

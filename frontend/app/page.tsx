'use client';
import { useState, useEffect } from "react";
export default function Home() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [chainId, setChainId] = useState("");
  const [splits, setSplits] = useState([{ recipient: "", percent: 50, isVault: false }, { recipient: "", percent: 50, isVault: false }]);
  const [chainInfo, setChainInfo] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [isMiniPay, setIsMiniPay] = useState(false);
  useEffect(() => { setIsMiniPay(/MiniPay/i.test(navigator.userAgent)); }, []);
  const openMiniPay = (cId: string, amountEth: string, action: "pay" | "pass", to?: string) => {
    const p = new URLSearchParams({ chain: cId, amount: amountEth, action });
    if (to) p.set("to", to);
    window.location.href = `minipay://pay?${p.toString()}`;
  };
  const updateSplit = (idx: number, f: string, v: any) => {
    const ns = splits.map((s, i) => (i === idx ? { ...s, [f]: v } : s));
    if (f === "percent") {
      const tot = ns.reduce((s, x) => s + Number(x.percent || 0), 0);
      if (tot !== 100) {
        const ot = ns.reduce((s, x, i2) => s + (i2 === idx ? 0 : Number(x.percent || 0)), 0);
        ns[idx].percent = Math.max(0, 100 - ot);
      }
    }
    setSplits(ns);
  };
  const addSplit = () => { if (splits.length < 10) setSplits([...splits, { recipient: "", percent: 0, isVault: false }]); };
  const removeSplit = (idx: number) => {
    if (splits.length <= 1) return;
    const ns = splits.filter((_, i) => i !== idx);
    const rp = 100 - ns.reduce((s, x) => s + Number(x.percent || 0), 0);
    const per = Math.floor(rp / ns.length);
    const rem = rp % ns.length;
    ns.forEach((s, i) => { s.percent = per + (i < rem ? 1 : 0); });
    setSplits(ns);
  };
  const totalPercent = splits.reduce((s, x) => s + Number(x.percent || 0), 0);
  const handleCreate = () => {
    if (isMiniPay && amount) { openMiniPay("paywhen-chain", amount, "pay"); }
    else { setChainInfo({ status: "Chain created", amount, id: Date.now() }); setStatus("Chain created"); }
  };
  const handleExec = (act: "pay" | "pass", cid?: string) => {
    if (isMiniPay && amount) { openMiniPay(cid || "1", amount, act, act === "pass" ? recipient : undefined); }
    else { setChainInfo({ ...chainInfo, status: act === "pay" ? "Paid" : "Passed" }); setStatus(act === "pay" ? "Paid" : "Passed"); }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent">PayWhen</h1>
          <p className="text-gray-400 text-lg">Conditional payments — execute when conditions met</p>
          {isMiniPay && <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>MiniPay</div>}
        </div>
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-green-400">Create Payment</h2>
          <div className="space-y-4">
            <input type="number" step="0.01" placeholder="Amount (ETH)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
            <button onClick={handleCreate} className="w-full bg-gradient-to-r from-green-500 to-teal-400 hover:from-green-600 hover:to-teal-500 text-white font-semibold py-3 px-6 rounded-lg transition-all">{isMiniPay ? "Pay with MiniPay" : "Create Chain"}</button>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">Routes</h2><button onClick={addSplit} disabled={splits.length >= 10} className="text-sm text-green-400 disabled:text-gray-500">+ Add</button></div>
          <div className="space-y-3">
            {splits.map((sp, idx) => (
              <div key={idx} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex justify-between items-start mb-3"><span className="text-sm text-gray-400">Route {idx + 1}</span><button onClick={() => removeSplit(idx)} disabled={splits.length <= 1} className="text-red-400 hover:text-red-300 text-sm disabled:text-gray-600">Remove</button></div>
                <input type="text" placeholder="0x..." value={sp.recipient} onChange={(e) => updateSplit(idx, "recipient", e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-3 focus:outline-none focus:border-green-500" />
                <div className="flex items-center gap-3"><input type="number" min="0" max="100" value={sp.percent} onChange={(e) => updateSplit(idx, "percent", e.target.value)} className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-green-500" /><span className="text-gray-400 text-sm">%</span>
                  <label className="flex items-center gap-2 ml-auto text-sm"><input type="checkbox" checked={sp.isVault} onChange={(e) => updateSplit(idx, "isVault", e.target.checked)} className="rounded border-gray-600 text-green-500" /><span className="text-gray-400">Vault</span></label></div>
                {sp.recipient && <div className="mt-3 pt-3 border-t border-gray-700"><div className="flex justify-between text-sm"><span className="text-gray-400">Amount</span><span className="text-white">{((Number(amount) || 0) * Number(sp.percent) / 100).toFixed(2)} ETH</span></div></div>}
              </div>
            ))}
          </div>
          <div className={`mt-4 pt-4 border-t ${totalPercent === 100 ? "border-green-500/30" : "border-red-500/30"}`}><div className="flex justify-between items-center"><span className="text-sm text-gray-400">Total</span><span className={`font-semibold ${totalPercent === 100 ? "text-green-400" : "text-red-400"}`}>{totalPercent}%</span></div></div>
        </div>
        {amount && totalPercent === 100 && (<div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700"><h2 className="text-sm font-semibold text-gray-400 mb-3">Distribution</h2><div className="space-y-2">{splits.map((sp, idx) => (<div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${sp.isVault ? "bg-green-500" : "bg-teal-400"}`}></div><span className="text-sm text-gray-300">{sp.recipient?.slice(0, 6) + "..." + sp.recipient?.slice(-4) || "No address"}</span></div><span className="text-white font-medium">{((Number(amount) || 0) * Number(sp.percent) / 100).toFixed(2)} ETH</span></div>))}</div></div>)}
        <button onClick={() => handleExec("pay", chainId)} className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${amount && totalPercent === 100 ? "bg-gradient-to-r from-green-500 to-teal-400 shadow-lg shadow-green-500/20" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`} disabled={!amount || totalPercent !== 100}>{amount && totalPercent === 100 ? "Execute Payment" : "Complete setup to continue"}</button>
        {status && <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border-l-4 border-green-500"><p className="text-gray-300">{status}</p></div>}
        <div className="mt-6 text-center text-xs text-gray-500"><p>One transaction. Conditional outcomes.</p></div>
      </div>
    </div>
  );
}

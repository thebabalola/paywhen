"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { getDashboardInsights, getStrategyAdvice, getRiskAssessment } from "@/lib/ai";

type Tab = "insights" | "strategy" | "risk";

export default function AIInsights() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("insights");
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [riskPref, setRiskPref] = useState("balanced");

  const fetchData = async (tab: Tab) => {
    if (!address) return;
    setIsLoading(true);
    setContent("");
    try {
      let result: string;
      switch (tab) {
        case "insights":
          result = await getDashboardInsights(address);
          break;
        case "strategy":
          result = await getStrategyAdvice(address, riskPref);
          break;
        case "risk":
          result = await getRiskAssessment(address);
          break;
      }
      setContent(result);
    } catch {
      setContent("Unable to fetch AI analysis. Make sure the AI backend is running on localhost:8000.");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "insights", label: "Insights" },
    { key: "strategy", label: "Strategy" },
    { key: "risk", label: "Risk" },
  ];

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary/10 to-accent/10">
        <h3 className="font-black text-lg flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-gradient-to-r from-primary to-accent flex items-center justify-center text-xs font-black text-white">AI</span>
          ForgeX Intelligence
        </h3>
      </div>

      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-bold transition-all ${
              activeTab === tab.key
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {activeTab === "strategy" && (
          <div className="flex gap-2 mb-4">
            {["conservative", "balanced", "aggressive"].map((pref) => (
              <button
                key={pref}
                onClick={() => setRiskPref(pref)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  riskPref === pref
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-white/5 text-gray-400 border border-white/10"
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => fetchData(activeTab)}
          disabled={isLoading || !address}
          className="w-full py-3 mb-4 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/10 font-bold text-sm hover:from-primary/30 hover:to-secondary/30 transition-all disabled:opacity-50"
        >
          {isLoading ? "Analyzing..." : `Generate ${tabs.find((t) => t.key === activeTab)?.label}`}
        </button>

        {content && (
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</div>
          </div>
        )}

        {!content && !isLoading && (
          <p className="text-gray-500 text-sm text-center">
            Click the button above to generate AI-powered analysis of your portfolio.
          </p>
        )}
      </div>
    </div>
  );
}

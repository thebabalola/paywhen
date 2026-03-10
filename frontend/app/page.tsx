import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground font-sans">
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10 backdrop-blur-md">
        <div className="text-2xl font-black text-primary flex items-center gap-2 tracking-tighter">
          <div className="w-8 h-8 bg-primary rounded-md shadow-[0_0_15px_rgba(255,0,122,0.4)]"></div>
          FORGEX <span className="text-secondary">:</span> VULT
        </div>
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:shadow-[0_0_20px_rgba(255,0,122,0.3)] transition-all">
          Launch App
        </button>
      </header>

      <main className="flex flex-col items-center justify-center px-6 text-center max-w-5xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] -z-10"></div>
        
        <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-accent uppercase bg-accent/10 border border-accent/20 rounded-full">
          UHI8 Hookathon Capstone Project
        </div>

        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
          Yield-Native <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Liquidity Hooks</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-3xl font-medium leading-relaxed">
          ForgeX: Vult integrates ERC-4626 vaults directly into Uniswap v4 pools. 
          Stack vault interest and swap fees into a single automated strategy on Base.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <button className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,122,0.4)] transition-all">
            Start Saving
          </button>
          <button className="px-10 py-5 bg-background border-2 border-secondary text-secondary rounded-2xl font-black text-xl hover:bg-secondary/5 transition-all">
            Explore Vult
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full text-left">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <div className="text-accent mb-2 font-bold">Trading + Yield</div>
            <div className="text-sm text-gray-400">Maximize capital efficiency by earning DeFi yield on idle liquidity.</div>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <div className="text-primary mb-2 font-bold">v4 Hook Native</div>
            <div className="text-sm text-gray-400">Built on the cutting edge of Uniswap v4 architecture.</div>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <div className="text-secondary mb-2 font-bold">Retail Optimized</div>
            <div className="text-sm text-gray-400">A PiggyVest-style experience for global automated savings.</div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 text-center text-gray-600 text-xs font-bold tracking-widest uppercase">
        &copy; 2026 ForgeX Protocol &bull; Vult Systems &bull; Built on Base
      </footer>
    </div>
  );
}

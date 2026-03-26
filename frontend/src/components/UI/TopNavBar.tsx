'use client';

export default function TopNavBar() {
  const KXC_MARKETS = [
    { title: "Who will leave Trump's Cabinet next?", selection: 'Lori Chavez-DeRemer', stat: '49%', change: '↓27', color: 'text-red-400' },
    { title: 'Will the Citrini scenario happen?', selection: 'Yes', stat: '27%' },
    { title: 'When will any company achieve AGI?', selection: 'Before Oct 1, 2026', stat: '28%', change: '↑25', color: 'text-green-400' },
    { title: 'Who will be the 2028 Republican nominee?', selection: 'Donald J. Trump', stat: '2%' },
    { title: 'Will the US acquire Greenland during Trump Admin?', selection: '$0 / No Acquisition', stat: '77%' },
    { title: 'Who will win the 2028 US presidential election?', selection: 'Donald J. Trump', stat: '2%' },
    { title: 'Will a supervolcano erupt before 2050?', selection: 'Before Jan 1, 2050', stat: '27%', change: '↑4', color: 'text-green-400' },
    { title: 'Who will be the 2028 Democratic nominee?', selection: 'Gavin Newsom', stat: '27%', change: '↑2', color: 'text-green-400' }
  ];

  return (
    <header className="h-[44px] flex items-center px-3 gap-4 min-w-0 overflow-visible relative z-30 shadow-md" style={{ background: '#0d1219', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <span className="font-semibold text-sm whitespace-nowrap text-foreground font-sans">
          DisasterWatch
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}></div>

      {/* Search */}
      <div className="w-48 flex-shrink-0">
        <div className="relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle>
            </svg>
          </div>
          <input 
            className="w-full rounded px-3 py-1 text-sm pl-8 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 bg-white/5 border border-white/10 text-foreground"
            placeholder="Search..." 
            type="text" 
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center flex-shrink-0 gap-1">
          <button className="px-1.5 py-0.5 text-[10px] font-medium rounded opacity-60 hover:opacity-100 transition-opacity">6H</button>
          <button className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 border border-white/20">24H</button>
        </div>

        {/* Action Buttons */}
        <button className="flex items-center justify-center rounded-full w-7 h-7 hover:bg-white/10 transition-colors" title="Telegram alerts">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#26A5E4" className="flex-shrink-0"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path></svg>
        </button>

        <button className="flex items-center gap-1 rounded-full border transition-colors flex-shrink-0 px-2 py-0.5 border-emerald-500/60 bg-emerald-500/20 hover:bg-emerald-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="text-[10px] font-medium text-emerald-400">Login</span>
        </button>

        <button className="relative flex items-center gap-1 rounded-full border transition-colors flex-shrink-0 px-2 py-0.5 border-[#5865F2]/30 bg-[#5865F2]/10 hover:bg-[#5865F2]/20">
          <span className="absolute flex h-2 w-2 -top-0.5 -right-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5865F2]">
            <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path>
          </svg>
          <span className="text-[10px] font-medium text-[#5865F2]">Chat</span>
        </button>

        <button className="flex items-center gap-1 rounded-full border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 transition-colors flex-shrink-0 px-2 py-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"></path>
          </svg>
          <span className="text-[10px] font-medium text-pink-300">Support</span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }}></div>

      {/* Prediction Markets Ticker (Kalshi) */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 px-1.5 py-0.5 rounded border relative overflow-hidden" 
           style={{ background: 'rgba(0, 208, 132, 0.05)', borderColor: 'rgba(0, 208, 132, 0.3)' }}>
        <a href="#" className="flex-shrink-0 flex items-center gap-1.5 hover:opacity-80 z-10 bg-black pl-1 pr-2">
          <svg className="w-3.5 h-3.5" viewBox="0 0 32 32" fill="currentColor">
            <rect width="32" height="32" rx="6" fill="#00d084"></rect>
            <path d="M10 8v16h3.5v-6.5L20 24h4.5l-7.5-8 7-8H19.5l-6 7V8z" fill="#fff"></path>
          </svg>
          <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: '#00d084' }}>Kalshi</span>
        </a>
        <div className="w-px h-3 flex-shrink-0" style={{ background: 'rgba(0, 208, 132, 0.3)' }}></div>
        
        {/* Animated Marquee */}
        <div className="flex-1 min-w-0 overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 10px, black 90%, transparent)' }}>
          <div className="flex whitespace-nowrap ticker-scroll" style={{ width: 'max-content' }}>
            {[...KXC_MARKETS, ...KXC_MARKETS].map((market, i) => (
              <a key={i} href="#" className="inline-flex items-baseline mr-5 hover:opacity-80 cursor-pointer transition-opacity">
                <span className="text-[10px] font-medium text-white/80 tracking-wide">{market.title}</span>
                <span className="text-[10px] font-medium ml-1" style={{ color: '#00d084' }}>{market.selection}</span>
                <span className="text-[10px] font-semibold text-white ml-1 tabular-nums">{market.stat}</span>
                {market.change && (
                  <span className={`text-[10px] ml-1 tabular-nums font-medium ${market.color}`}>{market.change}</span>
                )}
                <span className="ml-4 opacity-30" style={{ color: '#00d084' }}>•</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Monitor Count */}
      <div className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap pl-3 border-l" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle>
        </svg>
        <span className="text-[11px] text-white/90 tabular-nums font-medium">
          {Intl.NumberFormat('en-US').format(Math.floor(2000 + Math.random() * 500))}
        </span>
        <span className="text-[10px] text-white/40 uppercase tracking-wide">Monitors</span>
      </div>
    </header>
  );
}

import { useApp } from './state';
import Sidebar from './components/Sidebar';
import MintPanel from './components/MintPanel';
import WalletPanel from './components/WalletPanel';
import History from './components/History';
import Settings from './components/Settings';
import { Toasts } from './components/ui';
import { useBalance } from './lib/useBalance';
import { fmtNative, shortAddr } from './lib/format';

function Hero() {
  const { wallet, chain, setPage } = useApp();
  const { bal } = useBalance(wallet?.address, chain);
  return (
    <section className="relative mb-5 overflow-hidden rounded-2xl border border-line bg-black">
      <img src="/logo.jpg" alt="" className="hero-art absolute inset-y-0 right-0 h-full w-3/4 object-cover object-[50%_30%] sm:w-3/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="relative flex min-h-[220px] flex-col justify-end gap-4 p-5 sm:min-h-[260px] sm:p-8">
        <h1 className="font-display text-6xl font-black leading-none tracking-wide sm:text-8xl">FAST MINT</h1>
        <p className="max-w-md text-sm text-bone/80">Mint from a burner wallet. The key stays in this tab and every transaction is signed here.</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {wallet ? (
            <>
              <span className="rounded-full border border-line bg-black/70 px-3 py-1 font-mono">{shortAddr(wallet.address)}</span>
              <span className="rounded-full border border-line bg-black/70 px-3 py-1">{fmtNative(bal, 5)} {chain.symbol}</span>
              <span className="rounded-full border border-blood/60 bg-black/70 px-3 py-1">{chain.name}</span>
            </>
          ) : (
            <button className="btn-red" onClick={() => setPage('wallet')}>Import burner wallet</button>
          )}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const { page } = useApp();
  const showMint = page === 'dashboard' || page === 'mint';
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="mx-auto max-w-6xl px-3 pb-24 pt-4 sm:px-6 md:ml-60 md:pb-10 md:pt-6">
        {page === 'dashboard' && <Hero />}
        {page !== 'dashboard' && <h1 className="mb-4 font-display text-4xl font-black">{{ mint: 'Mint NFT', wallet: 'Wallet', history: 'Transaction history', settings: 'Settings', dashboard: '' }[page]}</h1>}
        {/* Kept mounted so a running queue and the form survive page switches */}
        <div hidden={!showMint}><MintPanel /></div>
        {page === 'wallet' && <WalletPanel />}
        {page === 'history' && <History />}
        {page === 'settings' && <Settings />}
      </main>
      <Toasts />
    </div>
  );
}

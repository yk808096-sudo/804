# FAST MINT

Burner-wallet NFT minting dashboard. React + TypeScript + Vite + Tailwind + ethers v6.
All signing happens in the browser. There is no backend.

## Run locally

```bash
npm install
cp .env.example .env     # optional
npm run dev              # http://localhost:5173
npm run build            # type-check + production build into dist/
```

Needs Node 18+.

## Test on a testnet first

1. Make a brand-new wallet, fund it from a Base Sepolia faucet.
2. In the app: Wallet > import the key. Network defaults to Base Sepolia.
3. Deploy or find a testnet NFT contract, paste its address on Mint NFT.
4. Press FAST MINT, read the cost summary, confirm.

## Networks

Ethereum (1), Base (8453), Arbitrum One (42161), Polygon (137), BNB Smart Chain (56),
Robinhood Chain (46630). Test networks: Base Sepolia, Ethereum Sepolia, Arbitrum Sepolia.

- Robinhood Chain ships with its public testnet RPC/explorer. Check the current official
  values and replace them under Settings > RPC endpoints (or `VITE_RPC_46630`) before relying on it.
- Public RPCs are rate limited. Use your own RPC URLs for real mint days.

## How minting works

1. **Contract loading**: pasted ABI, else the explorer ABI (needs a free Etherscan API key,
   Settings), else a list of common ERC-721/1155 mint signatures. ERC-165 is queried to label the standard.
2. **Test functions** simulates each candidate with `eth_estimateGas` and tells you which the contract accepts.
3. **Arguments** are pre-filled by name/type (`{qty}`, `{wallet}`). Edit them for allowlist proofs,
   token IDs, etc. Merkle proofs and signatures must be supplied by you.
4. **FAST MINT** simulates the mint, builds the fee plan, checks balance and your spending limit, and shows
   a confirmation with the worst-case cost. Nothing is sent until you confirm.
5. Transactions are sent with explicit nonces. Standard waits for each receipt; Fast/Turbo send back to back
   with a higher fee. **Stop queue** halts anything not yet broadcast (broadcast transactions can't be recalled).
6. Status comes from real receipts. History is kept in local storage.

## Security model

- Private key is validated locally and held only in memory (React state).
- Optional persistence: AES-GCM with a PBKDF2 (310k iterations) key from your password. Never plaintext.
- Nothing is logged. No analytics, no backend. Only RPC calls (and the optional Etherscan ABI lookup) leave the page.
- `VITE_*` env vars are bundled into public JS. Never put secrets there.
- Use a dedicated burner wallet with only the funds you intend to spend.

## Deploy

Static site, so any host works:

- **Vercel / Netlify / Cloudflare Pages**: import the repo, build command `npm run build`, output `dist`.
  Add any `VITE_*` variables in the host's settings.
- Or `npm run build` and upload `dist/` anywhere.

## Limits to know about

- No contract is guaranteed to use a standard mint function. Custom sale logic (signatures, Merkle proofs,
  phase gating) needs the right ABI and arguments.
- Mint price is not auto-read from arbitrary contracts. Enter it yourself.
- This was written without being able to install dependencies or run the build in the authoring environment,
  so run `npm install && npm run build` and test on a testnet before trusting it.

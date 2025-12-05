# Refinger (Reactor Fingerprint Companion)

A Chrome extension that intercepts Bitcoin transactions displayed on **Chainalysis Reactor** and automatically analyzes which wallet software was used to create them.

![Extension demo](images/demo.gif)

## Features

- **Automatic interception** of transactions from Chainalysis API
- **One-click analysis** directly on the page
- **Percentage visualization** of identified wallets
- **Links to mempool.space** for each transaction
- **Modern UI** with light/dark themes
- **Multi-language support** (English & Italian)
- **Smart caching** to avoid duplicate API requests
- **Full analysis page** with detailed transaction breakdown

## Installation

### Chrome / Brave / Edge

1. Clone this repository:
   ```bash
   git clone https://github.com/rstlgu/refinger.git
   ```

2. Open your browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Brave: `brave://extensions/`
   - Edge: `edge://extensions/`

3. Enable **Developer Mode** (toggle in the top right)

4. Click **Load unpacked**

5. Select the repository folder

6. The extension will appear in your toolbar with a fingerprint icon

## How to Use

1. **Access Chainalysis Reactor** (`reactor.chainalysis.com`)

2. **Navigate** to a Bitcoin entity or address

3. **Click** on a cluster to view transfers

4. The extension **automatically intercepts** outgoing transactions

5. **Click the fingerprint button** at the bottom left of the page

6. For clusters with ≤50 transactions, analysis starts automatically
   - For larger clusters, press **"Analyze Fingerprint"**

7. View **results** with wallet percentages and detailed reasoning

## How It Works

### Interception

The extension intercepts Chainalysis API calls in this format:
```
https://reactor.chainalysis.com/api/v2/cluster/.../transfers
```

### Analysis

For each transaction hash:
1. Fetches complete details from **mempool.space** API
2. Analyzes transaction characteristics
3. Applies fingerprinting heuristics
4. Identifies the most likely wallet

### Heuristics Used

| Criterion | Description |
|-----------|-------------|
| **Anti-fee-sniping** | Locktime set to current block height |
| **nVersion** | Transaction version (1 or 2) |
| **Low-R grinding** | Signatures optimized for smaller size |
| **RBF signaling** | Replace-By-Fee opt-in |
| **Script types** | P2PKH, P2WPKH, P2TR, etc. |
| **BIP-69 ordering** | Lexicographical input/output sorting |
| **Address reuse** | Change sent to previously used address |
| **Change position** | First, last, or random output index |

## Supported Wallets

| Wallet | Key Characteristics |
|--------|---------------------|
| **Bitcoin Core** | Anti-fee-sniping, nVersion=2, low-R, RBF |
| **Electrum** | Anti-fee-sniping, BIP-69, nVersion=2 |
| **Blue Wallet** | nVersion=2, RBF, change last |
| **Coinbase Wallet** | nVersion=2, no RBF, max 2 outputs |
| **Exodus** | nVersion=2, no RBF, address reuse |
| **Trust Wallet** | nVersion=1, no RBF |
| **Trezor** | nVersion=1, BIP-69, RBF |
| **Ledger** | nVersion=1, RBF, change last |


## Project Structure

```
refinger/
├── manifest.json      # Extension config (Manifest V3)
├── background.js      # Service worker (intercept & analyze)
├── content.js         # Injected page script
├── injected.js        # Main world script for API interception
├── styles.css         # UI styles
├── popup.html/js      # Extension popup
├── analysis.html/js   # Full analysis page
├── docs.html/js       # Documentation page
├── i18n.js            # Translations (EN/IT)
├── icons/             # Extension & wallet icons
├── images/            # Documentation images
└── README.md          # Documentation
```

## Privacy & Security

- ✅ **No data sent** to external servers (except mempool.space for transaction data)
- ✅ All analysis happens **locally** in the browser
- ✅ Results cached in **local storage** only
- ✅ Extension works **only** on `reactor.chainalysis.com`
- ✅ **Open source** and auditable code

## Debugging

Open developer console (F12) on Chainalysis to see logs:
```
[Reactor Fingerprint Companion] 📨 Received outgoing transactions: 25
[Reactor Fingerprint Companion] ✅ Analysis complete: Bitcoin Core
```

For background script debugging:
1. Go to `chrome://extensions/`
2. Find the extension
3. Click "Service worker" to open DevTools

## Sources & References

This extension is based on the excellent research by **Ishaana**:

> **[Wallet Fingerprints: Detection & Analysis](https://ishaana.com/blog/wallet_fingerprinting/)**
> 
> Comprehensive analysis of wallet fingerprints and automated detection methodology. By implementing a few heuristics, about 50% of recent transactions can be attributed to their originating wallet.

![Block Analysis](images/block_807929_graph.png)
![Fingerprints Table](images/fingerprints_final.png)

### Additional Resources

- [Bitcoin Privacy Wiki](https://en.bitcoin.it/wiki/Privacy)
- [BIP-69: Lexicographical Indexing](https://github.com/bitcoin/bips/blob/master/bip-0069.mediawiki)
- [Mempool.space API](https://mempool.space/docs/api)

## Notes

- Requires access to **Chainalysis Reactor** (account required)
- Transactions are analyzed respecting API rate limits
- Results are **probabilistic**, not deterministic
- Custom or non-standard wallets may be classified as "Other"

## License

MIT License

---

**Disclaimer**: This tool is provided for educational and research purposes only. Use at your own responsibility.

import type { Chain } from "../src/types";
export default {
  "chain": "TestEdge2",
  "chainId": 54211,
  "explorers": [
    {
      "name": "TestEdge HAQQ Explorer",
      "url": "https://explorer.testedge2.haqq.network",
      "standard": "EIP3091"
    }
  ],
  "faucets": [
    "https://testedge2.haqq.network"
  ],
  "features": [],
  "infoURL": "https://islamiccoin.net",
  "name": "Haqq Chain Testnet",
  "nativeCurrency": {
    "name": "Islamic Coin",
    "symbol": "ISLM",
    "decimals": 18
  },
  "redFlags": [],
  "rpc": [
    "https://haqq-chain-testnet.rpc.thirdweb.com/${THIRDWEB_API_KEY}",
    "https://rpc.eth.testedge2.haqq.network"
  ],
  "shortName": "ISLMT",
  "slug": "haqq-chain-testnet",
  "testnet": true
} as const satisfies Chain;
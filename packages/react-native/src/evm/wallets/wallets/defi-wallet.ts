import { WalletOptions, WalletConfig } from "@thirdweb-dev/react-core";
import { WalletConnectV2 } from "./WalletConnectV2";
import { WCMeta } from "../types/wc";
import { walletIds } from "@thirdweb-dev/wallets";

export class DefiWallet extends WalletConnectV2 {
  static id = walletIds.defiWallet;
  static meta = {
    name: "Defi Wallet",
    iconURL:
      "https://lh3.googleusercontent.com/BmQtjccsO615vh8Dnc_SIATj9lQAFzBltJbW15pxEce8c3yHC_iXTn-Pa8_5jXL130l1hEIqiTn5_jUIjR6iNyif=w128-h128-e365-rj-sc0x00ffffff",
    links: {},
  };

  getMeta(): WCMeta {
    return DefiWallet.meta;
  }
}

type DefiWalletConfig = { projectId?: string };

export const defiWallet = (config?: DefiWalletConfig) => {
  return {
    id: DefiWallet.id,
    meta: DefiWallet.meta,
    create: (options: WalletOptions) =>
      new DefiWallet({
        ...options,
        walletId: "defi-wallet",
        projectId: config?.projectId,
      }),
  } satisfies WalletConfig<WalletConnectV2>;
};

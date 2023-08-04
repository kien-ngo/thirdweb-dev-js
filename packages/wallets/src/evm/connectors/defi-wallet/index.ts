import { InjectedConnector, InjectedConnectorOptions } from "../injected";
import { assertWindowEthereum } from "../../utils/assertWindowEthereum";
import { Ethereum } from "../injected/types";
import type { Chain } from "@thirdweb-dev/chains";
import { AsyncStorage } from "../../../core/AsyncStorage";

type DefiWalletConnectorConstructorArg = {
  chains?: Chain[];
  connectorStorage: AsyncStorage;
  options?: InjectedConnectorOptions;
};

export class DefiWalletConnector extends InjectedConnector {
  constructor(arg: DefiWalletConnectorConstructorArg) {
    const defaultOptions = {
      name: "Defi Wallet",
      getProvider() {
        function getReady(ethereum?: Ethereum) {
          const isDefiWallet = !!ethereum?.isDefiWallet;
          if (!isDefiWallet) {
            return;
          }
          return ethereum;
        }

        if (typeof window === "undefined") {
          return;
        }
        if (assertWindowEthereum(globalThis.window)) {
          if (globalThis.window.ethereum?.providers) {
            return globalThis.window.ethereum.providers.find(getReady);
          }

          return getReady(globalThis.window.ethereum);
        }
      },
    };
    const options = {
      ...defaultOptions,
      ...arg.options,
    };
    super({
      chains: arg.chains,
      options,
      connectorStorage: arg.connectorStorage,
    });
  }
}

import type { WalletConnectConnector as WalletConnectConnectorType } from "../connectors/wallet-connect";
import type { QRModalOptions } from "../connectors/wallet-connect/qrModalOptions";
import { Connector, WagmiAdapter } from "../interfaces/connector";
import { assertWindowEthereum } from "../utils/assertWindowEthereum";
import { AbstractClientWallet, WalletOptions } from "./base";
import type { DefiWalletConnector as DefiWalletConnectorType } from "../connectors/defi-wallet";
import { walletIds } from "../constants/walletIds";
import { TW_WC_PROJECT_ID } from "../constants/wc";

type DefiWalletAdditionalOptions = {
  /**
   * Whether to open the default Wallet Connect QR code Modal for connecting to Defi Wallet on mobile if Defi Wallet is not injected when calling connect().
   */
  qrcode?: boolean;

  /**
   * When connecting Defi Wallet using the QR Code - Wallet Connect connector is used which requires a project id.
   * This project id is Your project’s unique identifier for wallet connect that can be obtained at cloud.walletconnect.com.
   *
   * https://docs.walletconnect.com/2.0/web3modal/options#projectid-required
   */
  projectId?: string;

  /**
   * options to customize the Wallet Connect QR Code Modal ( only relevant when qrcode is true )
   *
   * https://docs.walletconnect.com/2.0/web3modal/options
   */
  qrModalOptions?: QRModalOptions;
};

export type DefiWalletOptions = WalletOptions<DefiWalletAdditionalOptions>;

type ConnectWithQrCodeArgs = {
  chainId?: number;
  onQrCodeUri: (uri: string) => void;
  onConnected: (accountAddress: string) => void;
};

export class DefiWallet extends AbstractClientWallet<DefiWalletAdditionalOptions> {
  connector?: Connector;
  walletConnectConnector?: WalletConnectConnectorType;
  defiWalletConnector?: DefiWalletConnectorType;
  isInjected: boolean;

  static meta = {
    name: "Defi Wallet",
    iconURL:
      "https://lh3.googleusercontent.com/BmQtjccsO615vh8Dnc_SIATj9lQAFzBltJbW15pxEce8c3yHC_iXTn-Pa8_5jXL130l1hEIqiTn5_jUIjR6iNyif=w128-h128-e365-rj-sc0x00ffffff",
    urls: {
      chrome:
        "https://chrome.google.com/webstore/detail/cryptocom-wallet-extensio/hifafgmccdpekplomjjkcfgodnhcellj",
      android: "https://play.google.com/store/apps/details?id=com.defi.wallet",
      ios: "https://apps.apple.com/app/id1512048310",
    },
  };

  static id = walletIds.defiWallet;

  public get walletName() {
    return "Defi Wallet" as const;
  }

  constructor(options: DefiWalletOptions) {
    super(DefiWallet.id, options);

    if (assertWindowEthereum(globalThis.window)) {
      this.isInjected = !!globalThis.window.ethereum?.isDefiWallet;
    } else {
      this.isInjected = false;
    }
  }

  protected async getConnector(): Promise<Connector> {
    if (!this.connector) {
      // if Defi wallet is injected, use the injected connector
      // otherwise, use the wallet connect connector for using the Defi wallet app on mobile via QR code scan

      if (this.isInjected) {
        // import the connector dynamically
        const { DefiWalletConnector } = await import(
          "../connectors/defi-wallet"
        );
        const defiWalletConnector = new DefiWalletConnector({
          chains: this.chains,
          connectorStorage: this.walletStorage,
          options: {
            shimDisconnect: true,
          },
        });

        this.defiWalletConnector = defiWalletConnector;

        this.connector = new WagmiAdapter(defiWalletConnector);
      } else {
        const { WalletConnectConnector } = await import(
          "../connectors/wallet-connect"
        );

        const walletConnectConnector = new WalletConnectConnector({
          chains: this.chains,
          options: {
            projectId: this.options?.projectId || TW_WC_PROJECT_ID, // TODO,
            storage: this.walletStorage,
            qrcode: this.options?.qrcode,
            dappMetadata: this.dappMetadata,
            qrModalOptions: this.options?.qrModalOptions,
          },
        });

        walletConnectConnector.getProvider().then((provider) => {
          provider.signer.client.on("session_request_sent", () => {
            this.emit("wc_session_request_sent");
          });
        });

        // need to save this for getting the QR code URI
        this.walletConnectConnector = walletConnectConnector;
        this.connector = new WagmiAdapter(walletConnectConnector);
      }
    }

    return this.connector;
  }

  /**
   * connect to wallet with QR code
   *
   * @example
   * ```typescript
   * defiWallet.connectWithQrCode({
   *  chainId: 1,
   *  onQrCodeUri(qrCodeUri) {
   *    // render the QR code with `qrCodeUri`
   *  },
   *  onConnected(accountAddress)  {
   *    // update UI to show connected state
   *  },
   * })
   * ```
   */
  async connectWithQrCode(options: ConnectWithQrCodeArgs) {
    await this.getConnector();
    const wcConnector = this.walletConnectConnector;

    if (!wcConnector) {
      throw new Error("WalletConnect connector not found");
    }

    const wcProvider = await wcConnector.getProvider();

    // set a listener for display_uri event
    wcProvider.on("display_uri", (uri) => {
      options.onQrCodeUri(uri);
    });

    // trigger connect flow
    this.connect({ chainId: options.chainId }).then(options.onConnected);
  }
}

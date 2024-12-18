import { http, createConfig } from "wagmi";
import { mainnet, sepolia, hardhat } from "wagmi/chains";
import { metaMask, coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, sepolia, hardhat],
  connectors: [
    metaMask({
      dappMetadata: {
        name: "NFT Marketplace",
        iconUrl: "../assets/icons/StoreFront.svg",
      },
    }),
    coinbaseWallet(),
  ],
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

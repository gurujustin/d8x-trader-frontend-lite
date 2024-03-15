import { Chain, connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { polygonMumbai, polygonZkEvm, polygonZkEvmTestnet, arbitrumSepolia } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
import { createClient } from 'viem';

import polygonTestIcon from 'assets/networks/polygonTest.chain.svg';
import zkMainIcon from 'assets/networks/zkEvmMain.chain.svg';
import zkTestIcon from 'assets/networks/zkEvmTest.chain.svg';
import arbitrumSepoliaIcon from 'assets/networks/arbitrumSepolia.chain.svg';
import x1Icon from 'assets/networks/x1.png';
import berachainIcon from 'assets/networks/berachain.png';
import { config } from 'config';
import { x1, cardona, artio } from 'utils/chains';

const chains = [
  { ...polygonZkEvm, iconUrl: zkMainIcon, iconBackground: 'transparent' } as Chain,
  { ...polygonMumbai, iconUrl: polygonTestIcon, iconBackground: 'transparent' },
  { ...polygonZkEvmTestnet, iconUrl: zkTestIcon, iconBackground: 'transparent' },
  { ...x1, iconUrl: x1Icon, iconBackground: 'transparent' },
  { ...cardona, iconUrl: zkTestIcon, iconBackground: 'transparent' },
  { ...artio, iconUrl: berachainIcon, iconBackground: 'transparent' },
  {
    ...arbitrumSepolia,
    iconUrl: arbitrumSepoliaIcon,
    iconBackground: 'transparent',
    blockExplorers: {
      default: {
        name: 'Arbiscan',
        url: 'https://sepolia.arbiscan.io/',
      },
    },
  },
]
  .filter(({ id }) => config.enabledChains.includes(id))
  .sort(({ id: id1 }, { id: id2 }) => config.enabledChains.indexOf(id1) - config.enabledChains.indexOf(id2)) as [
  Chain,
  ...Chain[],
];

const projectId = config.projectId;

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, rabbyWallet, walletConnectWallet],
    },
    {
      groupName: 'Others',
      wallets: [phantomWallet, coinbaseWallet, okxWallet, rainbowWallet],
    },
  ],
  { projectId, appName: 'D8X App' }
);

const wagmiConfig = createConfig({
  chains,
  connectors,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

export { chains, wagmiConfig };

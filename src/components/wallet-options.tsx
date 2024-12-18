import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { useState } from 'react';
import metamaskIcon from '@/assets/metamask_icon.png';
import coinbaseIcon from '@/assets/coinbase_icon.png';

// Define supported wallets configuration
const SUPPORTED_WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    connector: () => metaMask(),
    icon: <img src={metamaskIcon} alt="MetaMask" className="w-6 h-6" />
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    connector: () => coinbaseWallet(),
    // icon: "📱"
    icon: <img src={coinbaseIcon} alt="Coinbase Wallet" className="w-6 h-6" />
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    connector: () => walletConnect(),
    icon: "🔗"
  },
  {
    id: "injected",
    name: "Browser Wallet",
    connector: () => injected(),
    icon: "💳"
  }
];

export function WalletOptions() {
  const { connect, error } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [loadingWalletId, setLoadingWalletId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = (walletId: string, connector: () => any) => {
    if (isConnected) {
      setShowDropdown(!showDropdown);
      return;
    }
    setLoadingWalletId(walletId);
    connect({ connector: connector() });
    setLoadingWalletId(null);
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setShowDropdown(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {isConnected ? 'Connected Wallet' : 'Connect Wallet'}
        </h3>
        <p className="text-gray-500 mt-2">
          {isConnected 
            ? 'Manage your wallet connection'
            : 'Choose your preferred wallet provider'}
        </p>
      </div>
      
      <div className="space-y-3 relative">
        {SUPPORTED_WALLETS.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleConnect(wallet.id, wallet.connector)}
            className={`
              w-full px-6 py-4 
              ${isConnected ? 'bg-indigo-50' : 'bg-gray-100 hover:bg-indigo-400'}
              border-2 border-indigo-200 rounded-xl
              flex items-center justify-between
              transition-colors duration-200
              ${loadingWalletId === wallet.id && 'animate-pulse'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <span className="text-xl">{wallet.icon}</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-950">
                  {isConnected ? formatAddress(address!) : wallet.name}
                </p>
              </div>
            </div>
            {loadingWalletId === wallet.id && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
            )}
          </button>
        ))}

        {/* Dropdown Menu */}
        {showDropdown && isConnected && (
          <div className="absolute w-full mt-2 py-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              onClick={handleCopyAddress}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              Copy Address
            </button>
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
            >
             Disconnect {formatAddress(address!)}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}
    </div>
  );
}


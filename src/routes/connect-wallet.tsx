import { createFileRoute } from "@tanstack/react-router";
import { WalletOptions } from "@/components/wallet-options";

export const Route = createFileRoute('/connect-wallet')({
  component: ConnectWalletPage,
});

function ConnectWalletPage() {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Connect Your Wallet</h2>
      <WalletOptions />
    </div>
  );
} 
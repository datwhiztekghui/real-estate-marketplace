import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Copy } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface WalletOptionsProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletOptions({ isOpen, onClose }: WalletOptionsProps) {
  const { address, connector: activeConnector } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()

  // Function to copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Success",
        description: "Address copied to clipboard",
      })
    }
  }

  // Function to format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle>Wallet Options</DialogTitle>
        </DialogHeader>

        {address ? (
          <div className="space-y-4">
            {/* Current Account */}
            <div className="p-4 bg-slate-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Connected Account</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={copyAddress}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm font-mono">{formatAddress(address)}</p>
            </div>

            {/* Account Switching Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Switch Account</h3>
              {connectors
                .filter((x) => x.ready && x.id !== activeConnector?.id)
                .map((connector) => (
                  <Button
                    key={connector.id}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => {
                      disconnect()
                      connect({ connector })
                    }}
                    disabled={isLoading && connector.id === pendingConnector?.id}
                  >
                    {connector.name}
                    {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
                  </Button>
                ))}
            </div>

            {/* Disconnect Button */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                disconnect()
                onClose()
              }}
            >
              Disconnect {activeConnector?.name}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => connect({ connector })}
                disabled={!connector.ready || isLoading && connector.id === pendingConnector?.id}
              >
                {connector.name}
                {isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
                {!connector.ready && ' (unsupported)'}
              </Button>
            ))}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error.message}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}


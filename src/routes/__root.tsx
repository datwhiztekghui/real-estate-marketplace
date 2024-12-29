import { Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { WalletOptions } from "@/components/wallet-options";
import { formatAddress } from "@/utils/format";
import React, { Suspense, useState } from "react";
import { useAccount, useDisconnect, useReadContract, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">HOME</Link>
      </div>
    );
  },
});

export default Route;

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      );

function RootComponent() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showAddInspectorDialog, setShowAddInspectorDialog] = useState(false);
  const [showRemoveInspectorDialog, setShowRemoveInspectorDialog] = useState(false);
  const [inspectorAddress, setInspectorAddress] = useState("");

  // Check if current user is contract owner
  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const isOwner = address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase();

  // Contract write functions
  const { writeContractAsync: addInspector } = useWriteContract();

  const { writeAsync: removeInspector } = useWriteContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'removeInspector',
  });

  const handleAddInspector = async (address: string) => {
    try {
      await addInspector({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'addInspector',
        args: [address as `0x${string}`]
      });
      
      toast({
        title: "Success",
        description: "Inspector added successfully",
      });
    } catch (error) {
      console.error('Error adding inspector:', error);
      toast({
        title: "Error",
        description: "Failed to add inspector",
        variant: "destructive",
      });
    }
  };

  const handleRemoveInspector = async () => {
    try {
      await removeInspector({ args: [inspectorAddress] });
      setShowRemoveInspectorDialog(false);
      setInspectorAddress("");
    } catch (error) {
      console.error("Error removing inspector:", error);
    }
  };

  return (
    <>
      <header className="flex sticky h-16 shrink-0 items-center justify-between gap-2 mb-4 border-b px-4 bg-gray-900">
        <h1 style={{ color: '#703BF7' }} className="text-3xl font-bold flex gap-2">
          <img src="src/assets/propstake_logo.jpg" alt="Propstake logo" className="w-10 h-10" />
          PROPSTAKE
        </h1>
        <nav className="flex gap-4 text-lg items-center">
          <Link
            to="/list-property"
            className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
          >
            List Property
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-gray-300 hover:bg-indigo-700 hover:text-white">
                Inspector Management
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {isOwner && (
                <>
                  <DropdownMenuItem onClick={() => setShowAddInspectorDialog(true)}>
                    Add Inspector
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowRemoveInspectorDialog(true)}>
                    Remove Inspector
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>
                <Link to="/view-inspectors" className="w-full">
                  View Inspectors
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {address ? (
          <>
            <Button
              className="bg-propstakeIndigoHover hover:bg-indigo-600 text-white-100 p-3 border-[1px] hover:btn-hover flex justify-between gap-2 rounded-[10px]"
              onClick={() => setShowDisconnectModal(true)}
            >
              {formatAddress(address!)}
            </Button>

            <Dialog open={showDisconnectModal} onOpenChange={setShowDisconnectModal}>
              <DialogContent className="sm:max-w-[400px] bg-gray-900 rounded-2xl border-0 shadow-2xl backdrop-blur-sm">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Wallet Options</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(address);
                        setShowDisconnectModal(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Copy Address
                    </button>
                    <button
                      onClick={() => {
                        disconnect();
                        setShowDisconnectModal(false);
                      }}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Disconnect {formatAddress(address)}
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-propstakeIndigoHover text-white-100 p-3 border-[1px] hover:btn-hover flex justify-between gap-2 rounded-[10px]">
                Connect Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-2xl border-0 shadow-2xl">
              <WalletOptions />
            </DialogContent>
          </Dialog>
        )}
      </header>

      {/* Add Inspector Dialog */}
      <AlertDialog open={showAddInspectorDialog} onOpenChange={setShowAddInspectorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Inspector</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the wallet address of the inspector you want to add.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Inspector Address (0x...)"
            value={inspectorAddress}
            onChange={(e) => setInspectorAddress(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAddInspector(inspectorAddress)}>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Inspector Dialog */}
      <AlertDialog open={showRemoveInspectorDialog} onOpenChange={setShowRemoveInspectorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Inspector</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the wallet address of the inspector you want to remove.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Inspector Address (0x...)"
            value={inspectorAddress}
            onChange={(e) => setInspectorAddress(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveInspector}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Outlet />
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
      <Toaster />
    </>
  );
}
import { Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { WalletOptions } from "@/components/wallet-options";
import { formatAddress } from "@/utils/format";
import React, { Suspense, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
// import Navbar from "../components/Navbar";



export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">Start Over</Link>
      </div>
    );
  },
});

export default Route;


const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        }))
      );


function RootComponent() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  
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
        </nav>
        
        {/* <Navbar /> */}
        {address ? (
          <>
            <Button
              className="bg-propstakeIndigoHover hover:bg-indigo-600 text-white-100 p-3 border-[1px] hover:btn-hover flex justify-between gap-2 rounded-[10px]"
              onClick={() => setShowDisconnectModal(true)}
            >
              {formatAddress(address!)}
            </Button>

            <Dialog open={showDisconnectModal} onOpenChange={setShowDisconnectModal}>
              <DialogContent className="sm:max-w-[400px] bg-gray-900 rounded-2xl border-0 shadow-2xl">
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

      <Outlet />
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}

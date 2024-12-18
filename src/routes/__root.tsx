import { Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { WalletOptions } from "@/components/wallet-options";
import { formatAddress } from "@/utils/format";

import React, { Suspense, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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
  
  return (
    <>
      <header className="flex sticky h-16 shrink-0 items-center justify-between gap-2 mb-4 border-b px-4 bg-gray-900">
        <h1 style={{ color: '#703BF7' }} className="text-3xl font-bold flex gap-2">
        <img src="src/assets/propstake_logo.jpg" alt="Propstake logo" className="w-10 h-10" />
          PROPSTAKE
        </h1>
        <nav className="flex gap-4 text-lg items-center">

        </nav>
        
        {/* <Navbar /> */}
        {address ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                className="bg-propstakeIndigoHover hover:bg-indigo-600 text-white-100 p-3 border-[1px] hover:btn-hover flex justify-between gap-2 rounded-[10px]"
              >
                {formatAddress(address!)}
              </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] bg-gray-900 rounded-xl p-2 shadow-xl"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center px-4 py-3 text-white hover:bg-gray-800 rounded-lg outline-none"
                  onClick={() => navigator.clipboard.writeText(address)}
                >
                  Copy Address
                </DropdownMenu.Item>
                
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center px-4 py-3 text-red-500 hover:bg-gray-800 rounded-lg outline-none"
                  onClick={() => disconnect()}
                >
                  Disconnect {formatAddress(address)}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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

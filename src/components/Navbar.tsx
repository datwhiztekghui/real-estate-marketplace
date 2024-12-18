import { Link } from "@tanstack/react-router";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const {address} = useAccount();
  const {disconnect} = useDisconnect();
  const {connect, connectors} = useConnect();

  
  const navigationItems = [
    { name: 'Home', href: '/' },
    // { name: 'Buy', href: '/buy' },
    { name: 'List Property', href: '/list-property' },
    // { name: 'Browse Properties', href: '/browse' },
    // { name: 'My Properties', href: '/my-properties' },
    { name: 'Inspections', href: '/inspections' },
    { name: 'Bids', href: '/bids' },
    // { name: 'Learn More', href: '/learn' },
    // { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">PropStake</h1>
        <div className="flex space-x-4 items-center">
          {navigationItems.map((item) => (
            <Link key={item.name} to={item.href} className="hover:text-indigo-400">
              {item.name}
            </Link>
          ))}
        {address ? (
          <Button
            className="bg-accent-100 text-white-100 p-3 border-[1px] hover:btn-hover flex justify-between gap-2 rounded-[10px]"
            onClick={() => disconnect()}
          >
            Disconnect Wallet
          </Button>
        ) : (
          <Button
            className="bg-accent-100 text-white-100 p-3 border-[1px] hover:btn-hover flex justify-between gap-2 rounded-[10px]"
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect Wallet
          </Button>
        )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
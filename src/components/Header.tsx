import React from 'react';
import { Link } from '@tanstack/react-router';
import { ConnectWallet } from '@/components/connect-wallet';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-900 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Real Estate Marketplace
        </Link>
        <ConnectWallet />
      </div>
    </header>
  );
};

export default Header;
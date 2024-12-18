import React from 'react';
import { useParams } from '@tanstack/react-router';
import { useWriteContract } from 'wagmi';
import { realEstateMarketplaceAbi } from '@/generated';
import { ConnectWallet } from '@/components/connect-wallet';
import { ModeToggle } from '@/components/mode-toggle';


// import React from 'react';
// import { PropertyDetails, PropertyListing } from '../types';
// import { ModeToggle } from '@/components/mode-toggle';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = realEstateMarketplaceAbi;

const BidPlacementPage: React.FC = () => {
  const { id } = useParams({ from: '/$id' });
  const [bidAmount, setBidAmount] = React.useState<number>(0);
  const { writeContract } = useWriteContract();

  const handleBidPlacement = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'placeBid',
        args: [BigInt(id), BigInt(bidAmount)],
        value: BigInt(bidAmount)
      });
    } catch (error) {
      // Handle bid placement error
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Place Bid</h1>
        <div className="flex space-x-4">
          <ConnectWallet />
          <ModeToggle />
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold">Bid on Property #{id}</h2>
        <div className="flex items-center mt-4">
          <label htmlFor="bidAmount" className="mr-4">
            Bid Amount:
          </label>
          <input
            id="bidAmount"
            type="number"
            className="border border-gray-300 rounded-md px-4 py-2 w-full"
            value={bidAmount}
            onChange={(e) => setBidAmount(parseFloat(e.target.value))}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          onClick={handleBidPlacement}
        >
          Place Bid
        </button>
      </div>
    </div>
  );
};

export default BidPlacementPage;
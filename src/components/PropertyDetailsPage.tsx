import React from 'react';
import { useParams } from '@tanstack/react-router';
import { useReadContract } from 'wagmi';
import { PropertyDetails, PropertyListing } from '../types';
import { ConnectWallet } from '@/components/connect-wallet';
import { ModeToggle } from '@/components/mode-toggle';
import { realEstateMarketplaceAbi } from '@/generated';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = realEstateMarketplaceAbi;


const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams({ from: '/property/$id' });

  const [property, setProperty] = React.useState<{
    listing: PropertyListing;
    details: PropertyDetails;
  } | null>(null);

  const { data: propertyDetails } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPropertyDetails',
    args: id ? [BigInt(id)] : undefined,
  });

  React.useEffect(() => {
    if (propertyDetails) {
      const [listing, details] = propertyDetails;
      setProperty({
        listing,
        details
      });
    }
  }, [propertyDetails]);

  const handleBidPlacement = async () => {
    // Add logic to handle bid placement
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Property Details</h1>
        <div className="flex space-x-4">
          <ConnectWallet />
          <ModeToggle />
        </div>
      </div>
      {property ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold">{property.details.name}</h2>
          <p className="text-gray-600">{property.details.physicalAddress}</p>
          <p className="text-gray-600">
            {property.details.bedrooms} bedrooms, {property.details.squareFeet.toString()} sq ft, {property.details.yearBuilt} built
          </p>
          <p className="text-gray-600">{property.details.residenceType}</p>
          <div className="flex justify-between items-center mt-4">
            <p className="font-bold text-2xl">${property.listing.price.toString()}</p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleBidPlacement}
            >
              Place Bid
            </button>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;
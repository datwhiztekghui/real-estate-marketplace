import React from 'react';
import { Link } from '@tanstack/react-router';
import { useReadContract } from 'wagmi';
import { PropertyDetails, PropertyListing } from '../types';
import { realEstateMarketplaceAbi } from '@/generated';
import { ConnectWallet } from '@/components/connect-wallet';
import { ModeToggle } from '@/components/mode-toggle';
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi'

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = realEstateMarketplaceAbi;

const PropertyListPage: React.FC = () => {
  const [properties, setProperties] = React.useState<
    Array<{ id: string; listing: PropertyListing; details: PropertyDetails }>
  >([]);

  const { data: propertyCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'propertyCounter',
  });

  React.useEffect(() => {
    const fetchProperties = async () => {
      const count = propertyCount ? Number(propertyCount.toString()) : 0;
      const propertyList = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          getPropertyDetails(i + 1)
        )
      );
      setProperties(propertyList);
    };
    fetchProperties();
  }, [propertyCount]);

  const getPropertyDetails = async (id: number) => {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getPropertyDetails',
      args: [BigInt(id)],
    });
    const [listing, details] = data || [];
    return { id: id.toString(), listing, details };
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Property Listings</h1>
        <div className="flex space-x-4">
          <ConnectWallet />
          <ModeToggle />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <Link
            key={property.id}
            to={`/property/${property.id}`}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <img
              src="/placeholder.jpg"
              alt={property.details.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold">{property.details.name}</h3>
              <p className="text-gray-600">{property.details.physicalAddress}</p>
              <p className="text-gray-600">{property.details.residenceType}</p>
              <div className="flex justify-between mt-4">
                <p>
                  {property.details.bedrooms} bedrooms, {property.details.squareFeet.toString()} sq ft, {property.details.yearBuilt} built
                </p>
                <p className="font-bold">${property.listing.price.toString()}</p>
              </div>
              <div className="flex justify-between mt-2">
                {property.listing.forSale && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded">
                    For Sale
                  </span>
                )}
                {property.listing.forRent && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded">
                    For Rent
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PropertyListPage;
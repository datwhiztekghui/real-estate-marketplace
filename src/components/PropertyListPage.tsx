import React from 'react';
import { Link } from '@tanstack/react-router';
import { useReadContract } from 'wagmi';
import { PropertyDetails, PropertyListing } from '../types';
import { ConnectWallet } from '@/components/connect-wallet'; 
import { ModeToggle } from '@/components/mode-toggle';
import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';



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
            className="bg-gray-900 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow"
          >
            <img
              src={getPropertyImage(property.details.residenceType)}
              alt={property.details.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{property.details.name}</h3>
                <p className="text-gray-400">{property.details.physicalAddress}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-400">Bedrooms:</span>
                  <span className="text-white ml-2">{property.details.bedrooms}</span>
                </div>
                <div>
                  <span className="text-gray-400">Area:</span>
                  <span className="text-white ml-2">{property.details.squareFeet.toString()} sq ft</span>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white ml-2">{property.details.residenceType}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400">Price</p>
                  <p className="text-xl font-bold text-white">
                    {property.listing.forSale 
                      ? `${formatEther(property.listing.price)} ETH`
                      : `${formatEther(property.listing.rentAmount)} ETH/month`}
                  </p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PropertyListPage;
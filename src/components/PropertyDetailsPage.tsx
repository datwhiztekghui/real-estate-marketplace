import React from 'react';
import { useParams } from '@tanstack/react-router';
import { useReadContract } from 'wagmi';
import { PropertyDetails, PropertyListing } from '../types';
import { ConnectWallet } from '@/components/connect-wallet';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';
import { ModeToggle } from '@/components/mode-toggle';
import { formatEther } from "viem";



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
      const [listingArray, detailsArray] = propertyDetails as unknown as [PropertyListing, PropertyDetails];
      
      try {
        setProperty({
          listing: listingArray,
          details: detailsArray
        });
      } catch (error) {
        console.error('Error parsing property data:', error);
      }
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
        <div className="bg-gray-900 text-white">
          {/* Image Gallery */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="aspect-video rounded-xl overflow-hidden">
              <img 
                src="/modern-house.jpg" 
                alt="Property Main"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-video rounded-xl overflow-hidden">
              <img 
                src="/interior.jpg" 
                alt="Property Interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Property Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{property.details.name}</h2>
              <p className="text-gray-400 mb-6">{property.details.physicalAddress}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-400">Bedrooms</p>
                  <p className="text-xl">{property.details.bedrooms}</p>
                </div>
                <div>
                  <p className="text-gray-400">Bathrooms</p>
                  <p className="text-xl">{property.details.bathrooms}</p>
                </div>
                <div>
                  <p className="text-gray-400">Area</p>
                  <p className="text-xl">{property.details.squareFeet.toString()} sq ft</p>
                </div>
                <div>
                  <p className="text-gray-400">Year Built</p>
                  <p className="text-xl">{property.details.yearBuilt.toString()}</p>
                </div>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {property.details.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-indigo-500">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <div className="mb-4">
                  <p className="text-gray-400">Price</p>
                  <p className="text-3xl font-bold">
                    {property.listing.forSale 
                      ? `${formatEther(property.listing.price)} ETH`
                      : `${formatEther(property.listing.rentAmount)} ETH/month`}
                  </p>
                </div>

                {property.listing.acceptingBids && (
                  <button
                    onClick={handleBidPlacement}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Place Bid
                  </button>
                )}
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                <ul className="space-y-2">
                  {property.details.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-indigo-500">•</span>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;
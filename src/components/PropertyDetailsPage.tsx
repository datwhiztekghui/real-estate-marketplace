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

  const { data: propertyDetails, isError, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPropertyDetails',
    args: id ? [BigInt(id)] : undefined,
  });

  // Add error handling
  if (isError) {
    console.error('Contract read error:', error);
    return (
      <div className="text-red-500 text-center py-8">
        Error loading property details
      </div>
    );
  }

  React.useEffect(() => {
    if (propertyDetails) {
      try {
        const [listing, details] = propertyDetails as readonly [any, any];
        console.log('Raw listing data:', listing);
        console.log('Raw details data:', details);

        // Add validation checks
        if (!listing || !details) {
          console.error('Missing listing or details data');
          return;
        }

        const parsedProperty = {
          listing: {
            owner: listing[0] as `0x${string}`,
            price: BigInt(listing[1]?.toString() || '0'),
            forSale: Boolean(listing[2]),
            forRent: Boolean(listing[3]),
            rentAmount: BigInt(listing[4]?.toString() || '0'),
            rentDuration: BigInt(listing[5]?.toString() || '0'),
            acceptingBids: Boolean(listing[6]),
            isInspected: Boolean(listing[7]),
            inspectionRating: Number(listing[8] || 0),
            isSold: Boolean(listing[9]),
            isRented: Boolean(listing[10])
          },
          details: {
            name: String(details[0] || ''),
            physicalAddress: String(details[1] || ''),
            residenceType: String(details[2] || ''),
            bedrooms: Number(details[3] || 0),
            bathrooms: Number(details[4] || 0),
            squareFeet: BigInt(details[5]?.toString() || '0'),
            yearBuilt: BigInt(details[6]?.toString() || '0'),
            keyFeatures: Array.isArray(details[7]) ? details[7] : [],
            amenities: Array.isArray(details[8]) ? details[8] : [],
            description: String(details[9] || '')
          }
        };

        console.log('Parsed property:', parsedProperty);
        setProperty(parsedProperty);
      } catch (error) {
        console.error('Error parsing property details:', error);
      }
    }
  }, [propertyDetails]);

  console.log('Property Details:', propertyDetails);
  console.log('Parsed Property:', property);

  const handleBidPlacement = async () => {
    // Add logic to handle bid placement
  };

  if (!propertyDetails) {
    console.log('No property details available');
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!property) {
    console.log('Property details not parsed yet');
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

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
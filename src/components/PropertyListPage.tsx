import React from 'react';
import { Link } from '@tanstack/react-router';
import { formatEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/index';
import { useReadContract } from 'wagmi';
import { ConnectWallet } from '@/components/connect-wallet'; 
import { ModeToggle } from '@/components/mode-toggle';

const PropertyListPage: React.FC = () => {
  // Read all properties from the contract
  const { data: propertiesCount } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'propertyCounter',
    watch: true
  });

  console.log('Properties count:', propertiesCount?.toString());

  const { data: propertiesData } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
    functionName: 'getAllProperties',
    watch: true
  });

  console.log('Raw properties data:', propertiesData);

  // Convert properties to the correct type and handle undefined
  const propertyList = React.useMemo(() => {
    if (!propertiesData) {
      console.log('No properties data available');
      return [];
    }

    const [listings, details] = propertiesData as [any[], any[]];
    console.log('Parsed data:', { listings, details });

    if (!Array.isArray(listings) || !Array.isArray(details)) {
      console.log('Invalid data structure');
      return [];
    }

    return listings.map((listing: any, index) => {
      try {
        const detail = details[index];
        if (!listing || !detail) {
          console.log(`Missing data for property ${index}`);
          return null;
        }

        return {
          id: (index + 1).toString(),
          listing: {
            owner: listing[0],
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
            name: String(detail[0] || ''),
            physicalAddress: String(detail[1] || ''),
            residenceType: String(detail[2] || ''),
            bedrooms: Number(detail[3] || 0),
            bathrooms: Number(detail[4] || 0),
            squareFeet: BigInt(detail[5]?.toString() || '0'),
            yearBuilt: BigInt(detail[6]?.toString() || '0'),
            keyFeatures: Array.isArray(detail[7]) ? [...detail[7]] : [],
            amenities: Array.isArray(detail[8]) ? [...detail[8]] : [],
            description: String(detail[9] || '')
          }
        };
      } catch (error) {
        console.error('Error parsing property:', error);
        console.error('Property data:', { listing, detail: details[index] });
        return null;
      }
    }).filter(Boolean);
  }, [propertiesData]);

  // Function to get default image based on property type
  const getPropertyImage = (propertyType: string | undefined) => {
    if (!propertyType) return '/default-property.jpg';
    
    switch (propertyType.toLowerCase()) {
      case 'house':
        return '/modern-house.jpg';
      case 'apartment':
        return '/modern-apartment.jpg';
      case 'villa':
        return '/luxury-villa.jpg';
      default:
        return '/default-property.jpg';
    }
  };

  if (!propertyList || propertyList.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <p>No properties available.</p>
      </div>
    );
  }

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
        {propertyList.map((property) => property && (
          <Link
            key={property.id}
            to={`/property/${property.id}`}
            className="bg-gray-900 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow"
          >
            <img
              src={getPropertyImage(property.details.residenceType)}
              alt={property.details.name}
              className="w-full h-68 object-cover"
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
                <button className="w-fit bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
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
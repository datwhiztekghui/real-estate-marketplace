import { createFileRoute } from "@tanstack/react-router";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";
import { formatEther } from "viem";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useMemo } from 'react';

interface PropertyListing {
  owner: `0x${string}`;
  price: bigint;
  forSale: boolean;
  forRent: boolean;
  rentAmount: bigint;
  rentDuration: bigint;
  acceptingBids: boolean;
  isInspected: boolean;
  inspectionRating: number;
  isSold: boolean;
  isRented: boolean;
}

interface PropertyDetails {
  name: string;
  physicalAddress: string;
  residenceType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: bigint;
  yearBuilt: bigint;
  keyFeatures: readonly string[];
  amenities: readonly string[];
  description: string;
}

interface Property {
  id: bigint;
  listing: PropertyListing;
  details: PropertyDetails;
}

export const Route = createFileRoute('/browse')({
  component: BrowseProperties
});

function BrowseProperties() {
  // Read all properties from the contract
  const { data: propertiesCount, isLoading: isLoadingCount } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'propertyCounter'
  });

  const { data: properties, isLoading: isLoadingProperties } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getAllProperties'
  });

  // Convert properties to the correct type and handle undefined
  const propertyList: Property[] = useMemo(() => {
    if (!properties || !Array.isArray(properties[0]) || !Array.isArray(properties[1])) {
      return [];
    }

    return properties[0].map((listing: any, index) => {
      try {
        const details = properties[1][index] as any;
        return {
          id: BigInt(index + 1),
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
      } catch (error) {
        console.error('Error parsing property:', error);
        return null;
      }
    }).filter(Boolean) as Property[];
  }, [properties]);

  // Helper function to get property category and description
  const getPropertyCategory = (property: Property) => {
    if (!property?.details?.physicalAddress) {
      return {
        category: "Other Properties",
        description: "A unique property waiting to be discovered..."
      };
    }

    const address = property.details.physicalAddress.toLowerCase();
    
    if (address.includes('beach') || address.includes('coast')) {
      return {
        category: "Coastal Escapes - Where Waves Beckon",
        description: "Wake up to the soothing melody of waves. This beachfront villa offers..."
      };
    } else if (property.details.residenceType === "Apartment") {
      return {
        category: "Urban Oasis - Life in the Heart of the City",
        description: "Immerse yourself in the energy of the city. This modern apartment in the heart..."
      };
    } else {
      return {
        category: "Countryside Charm - Escape to Nature's Embrace",
        description: "Find tranquility in the countryside. This charming property is nestled amidst rolling hills..."
      };
    }
  };

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

  // Add loading check in the return
  if (isLoadingCount || isLoadingProperties) {
    return (
      <div className="bg-gray-900 min-h-screen text-white px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  // Add error check for properties data
  if (!properties) {
    return (
      <div className="bg-gray-900 min-h-screen text-white px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  if (propertyList.length === 0) {
    return (
      <div className="bg-gray-900 min-h-screen text-white px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>No properties found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Discover a World of Possibilities</h1>
        <p className="text-gray-400 mb-8">
          Our portfolio of properties is as diverse as your dreams. Explore the following categories to find the perfect property that resonates with your vision of home.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propertyList.map((property) => {
            const { category, description } = getPropertyCategory(property);
            return (
              <div key={property.id.toString()} className="bg-gray-800/50 rounded-xl overflow-hidden">
                <div className="h-48 bg-gray-700 relative overflow-hidden">
                  <img 
                    src={getPropertyImage(property.details.residenceType)}
                    alt={property.details.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <div className="text-sm text-gray-400 mb-2">{category}</div>
                  <h2 className="text-xl font-semibold mb-2">{property.details.name}</h2>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Bedrooms:</span>
                      <span>{property.details.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Bathrooms:</span>
                      <span>{property.details.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Area:</span>
                      <span>{property.details.squareFeet.toString()} sq ft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Type:</span>
                      <span>{property.details.residenceType}</span>
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">Price</div>
                      <div className="text-lg font-semibold">
                        {property.listing.forSale 
                          ? `${formatEther(property.listing.price)} ETH`
                          : `${formatEther(property.listing.rentAmount)} ETH/month`}
                      </div>
                    </div>

                    <Link
                      to="/property/$id"
                      params={{ id: property.id.toString() }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                  </div>

                  {/* Status Tags */}
                  <div className="flex gap-2 mt-4">
                    {property.listing.forSale && (
                      <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-sm">
                        For Sale
                      </span>
                    )}
                    {property.listing.forRent && (
                      <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded text-sm">
                        For Rent
                      </span>
                    )}
                    {property.listing.acceptingBids && (
                      <span className="bg-purple-500/20 text-purple-500 px-2 py-1 rounded text-sm">
                        Accepting Bids
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div className="text-gray-400">
            {propertyList.length} of {propertiesCount?.toString() || '0'}
          </div>
          
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
              <ArrowRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
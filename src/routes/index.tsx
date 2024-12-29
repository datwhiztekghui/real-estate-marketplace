import { createFileRoute } from "@tanstack/react-router";
import { useReadContract } from "wagmi";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";
import { StarIcon, BedDoubleIcon, BathIcon, HomeIcon, Building2Icon, BarChart3Icon, Brain } from "lucide-react";
import { readContract } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import HomeBackground from "../assets/home_4.jpg"


// Type definitions
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

export const Route = createFileRoute('/')({
  component: Index
});

export function Index() {
  const [featuredProperties, setFeaturedProperties] = useState<Array<{
    id: number;
    listing: PropertyListing;
    details: PropertyDetails;
  }>>([]);

  // Get the total number of properties
  const { data: propertyCounter } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'propertyCounter',
  });

  // Fetch property details for each property
  useEffect(() => {
    const fetchProperties = async () => {
      if (!propertyCounter) return;

      const properties = [];
      for (let i = 1; i <= Number(propertyCounter); i++) {
        const data = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getPropertyDetails',
          args: [BigInt(i)],
        });

        if (data && data[0].isInspected && !data[0].isSold) {
          properties.push({
            id: i,
            listing: data[0],
            details: data[1],
          });
        }
      }
      setFeaturedProperties(properties);
    };

    fetchProperties();
  }, [propertyCounter]);

  return (
    <div>

      {/* Hero Section */}
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          {/* Main Hero Content */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="lg:w-1/2 space-y-8">
              <h1 className="text-6xl font-bold leading-tight ">
                Discover Your Dream Property with PropStake
              </h1>
              <p className="text-gray-300 text-lg">
                Your journey to finding the perfect property begins here. Explore our listings to find the home
                that matches your dreams.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex gap-4 pt-4">
                <Link
                  to="/browse"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg transition-colors"
                >
                  Browse Properties
                </Link>
                <Link
                  to="/learn"
                  className="border border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-lg transition-colors"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-12">
                <div>
                  <div className="text-4xl font-bold text-indigo-500">
                    {propertyCounter?.toString() || '0'}+
                  </div>
                  <p className="text-gray-400">Listed Properties</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-indigo-500">
                    {featuredProperties.length}+
                  </div>
                  <p className="text-gray-400">Verified Properties</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-indigo-500">5+</div>
                  <p className="text-gray-400">Years Experience</p>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="lg:w-1/2">
              <img 
                src={HomeBackground} 
                alt="Modern Property" 
                className="w-full h-[600px] object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* Bottom Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {/* Buy Card */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm group hover:bg-gray-700/50 transition-all cursor-pointer">
              <div className="flex justify-between items-start">
                <HomeIcon className="w-10 h-10 text-pro-500" />
                <div className="p-2 bg-gray-700/50 rounded-full">
                  <svg 
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-2">Buy Your Dream Home</h3>
              <p className="text-gray-400">Find and purchase your perfect property through our secure blockchain platform</p>
            </div>

            {/* Rent Card */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm group hover:bg-gray-700/50 transition-all cursor-pointer">
              <div className="flex justify-between items-start">
                <Building2Icon className="w-10 h-10 text-indigo-500" />
                <div className="p-2 bg-gray-700/50 rounded-full">
                  <svg 
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-2">Rent Your Dream Home</h3>
              <p className="text-gray-400">Explore rental properties with verified inspection ratings and secure contracts</p>
            </div>

            {/* Property Management Card */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm group hover:bg-gray-700/50 transition-all cursor-pointer">
              <div className="flex justify-between items-start">
                <BarChart3Icon className="w-10 h-10 text-indigo-500" />
                <div className="p-2 bg-gray-700/50 rounded-full">
                  <svg 
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-2">Property Management</h3>
              <p className="text-gray-400">Efficient blockchain-based property management and maintenance tracking</p>
            </div>

            {/* Smart Investments Card */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm group hover:bg-gray-700/50 transition-all cursor-pointer">
              <div className="flex justify-between items-start">
                <Brain className="w-10 h-10 text-indigo-500" />
                <div className="p-2 bg-gray-700/50 rounded-full">
                  <svg 
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-2">Smart Investments</h3>
              <p className="text-gray-400">Make informed decisions with transparent property inspection data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Featured Properties section remains the same... */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Featured Properties</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <div key={property.id} className="bg-indigo-900 rounded-lg shadow-lg overflow-hidden">
              {/* Property Card */}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{property.details.name}</h2>
                <p className="text-gray-600 mb-4">{property.details.physicalAddress}</p>
                
                {/* Rating Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(property.listing.inspectionRating)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-amber-500 fill-current" />
                  ))}
                </div>
                
                {/* Property Details */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <BedDoubleIcon className="w-5 h-5 mr-1" />
                    <span>{property.details.bedrooms} beds</span>
                  </div>  
                  <div className="flex items-center">
                    <BathIcon className="w-5 h-5 mr-1" />
                    <span>{property.details.bathrooms} baths</span>
                  </div>
                </div>
                
                {/* Price */}
                <div className="mb-4">
                  <p className="text-lg font-bold">
                    {property.listing.forSale 
                      ? `${Number(property.listing.price) / 1e18} ETH`
                      : `${Number(property.listing.rentAmount) / 1e18} ETH/month`}
                  </p>
                </div>
                
                {/* View Details Button */}
                <Link
                  to="/property/$id"
                  params={{ id: property.id.toString() }}
                  className="block w-fit text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
    
  );
}

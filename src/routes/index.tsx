import { createFileRoute } from "@tanstack/react-router";
import { useReadContract } from "wagmi";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";
import { StarIcon, BedDoubleIcon, BathIcon, HomeIcon, Building2Icon, BarChart3Icon, Brain } from "lucide-react";
import { readContract } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import HomeBackground from "../assets/home_4.jpg"
import LogoBackground from '../assets/propstake_logo.jpg'

// Type definitions
interface PropertyListing {
  owner: string;
  price: bigint;
  rentAmount: bigint;
  rentDuration: bigint;
  forSale: boolean;
  forRent: boolean;
  isInspected: boolean;
  inspectionRating: number;
  isSold: boolean;
  isRented: boolean;
  acceptingBids: boolean;
}

interface PropertyDetails {
  name: string;
  physicalAddress: string;
  residenceType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: bigint;
  yearBuilt: number;
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
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={HomeBackground} 
            alt="Property Background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        {/* Logo */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-8 z-10">
          <img 
            src={LogoBackground} 
            alt="PropStake Logo" 
            className="h-16"
          />
        </div>

        <div className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between relative z-10">
          {/* Left Content */}
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-5xl font-bold mb-6">
              Discover Your Dream Property with PropStake
            </h1>
            <p className="text-gray-300 mb-8 text-lg">
              Your journey to finding the perfect property begins here. Explore our listings to find the home
              that matches your dreams, verified through our trusted inspection system.
            </p>
            <div className="flex gap-4">
              <Link
                to="/browse"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Browse Properties
              </Link>
              <Link
                to="/learn"
                className="border border-white hover:bg-white hover:text-gray-900 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Learn More
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-500">{propertyCounter?.toString() || '0'}+</div>
                <p className="text-gray-400 mt-2">Listed Properties</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-500">
                  {featuredProperties.length}+
                </div>
                <p className="text-gray-400 mt-2">Verified Properties</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-500">5+</div>
                <p className="text-gray-400 mt-2">Years Experience</p>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
              <HomeIcon className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Find Your Dream Home</h3>
              <p className="text-gray-400">Browse through our extensive collection of verified properties</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
              <BarChart3Icon className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Property Value</h3>
              <p className="text-gray-400">Get accurate property valuations backed by inspection data</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
              <Building2Icon className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Property Management</h3>
              <p className="text-gray-400">Efficient property management with blockchain technology</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm">
              <Brain className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Decisions</h3>
              <p className="text-gray-400">Make informed decisions with inspection ratings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Previous Featured Properties section remains the same... */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Featured Properties</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Property Card */}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{property.details.name}</h2>
                <p className="text-gray-600 mb-4">{property.details.physicalAddress}</p>
                
                {/* Rating Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(property.listing.inspectionRating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
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
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
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

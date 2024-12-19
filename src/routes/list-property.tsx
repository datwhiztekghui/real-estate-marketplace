import { createFileRoute } from "@tanstack/react-router";
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useState } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";
import { parseEther } from "viem";

console.log("Contract ABI:", CONTRACT_ABI);

export const Route = createFileRoute('/list-property')({
  component: ListProperty
});

function ListProperty() {
  const publicClient = usePublicClient();
  if (!publicClient) {
    throw new Error("Public client is not available");
  }
  // Form state
  const [error, setError] = useState<string | null>(null);
  const [propertyDetails, setPropertyDetails] = useState({
    name: "",
    physicalAddress: "",
    residenceType: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    yearBuilt: BigInt(new Date().getFullYear()),
    price: "",
    rentAmount: "",
    rentDuration: "",
    forSale: true,
    forRent: false,
    acceptingBids: false,
    keyFeatures: [""],
    amenities: [""],
    description: ""
  });

  // Contract interactions
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!propertyDetails.forSale && !propertyDetails.forRent) {
        throw new Error("Property must be either for sale or rent");
      }

      // Validate required fields based on listing type
      if (propertyDetails.forSale && !propertyDetails.price) {
        throw new Error("Sale price is required");
      }
      if (propertyDetails.forRent && (!propertyDetails.rentAmount || !propertyDetails.rentDuration)) {
        throw new Error("Rent amount and duration are required");
      }

      console.log("Listing property with args:", {
        price: propertyDetails.forSale ? parseEther(propertyDetails.price) : 0n,
        forSale: propertyDetails.forSale,
        forRent: propertyDetails.forRent,
        rentAmount: propertyDetails.forRent ? parseEther(propertyDetails.rentAmount) : 0n,
        rentDuration: propertyDetails.forRent ? BigInt(propertyDetails.rentDuration) : 0n,
        acceptingBids: propertyDetails.acceptingBids
      });

      // Add this before the writeContract call
      if (propertyDetails.forSale) {
        if (!propertyDetails.price || parseFloat(propertyDetails.price) <= 0) {
          throw new Error("Sale price must be greater than 0");
        }
      }

      if (propertyDetails.forRent) {
        if (!propertyDetails.rentAmount || parseFloat(propertyDetails.rentAmount) <= 0) {
          throw new Error("Rent amount must be greater than 0");
        }
        if (!propertyDetails.rentDuration || parseInt(propertyDetails.rentDuration) <= 0) {
          throw new Error("Rent duration must be greater than 0");
        }
      }

      console.log("Contract address:", CONTRACT_ADDRESS);
      console.log("Function signature:", CONTRACT_ABI.find(x => 'name' in x && x.name === 'listProperty'));

      // First transaction - list property
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not found");

      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'listProperty',
        args: [
          propertyDetails.forSale ? parseEther(propertyDetails.price) : 0n,
          propertyDetails.forSale,
          propertyDetails.forRent,
          propertyDetails.forRent ? parseEther(propertyDetails.rentAmount) : 0n,
          propertyDetails.forRent ? BigInt(propertyDetails.rentDuration) : 0n,
          propertyDetails.acceptingBids
        ]
      });

      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: hash as `0x${string}` 
      });

      console.log("First transaction receipt:", receipt);

      // Get the property ID from the event
      const propertyId = receipt?.logs[0]?.topics[1];
      if (!propertyId) {
        throw new Error("Failed to get property ID from transaction");
      }

      console.log("Setting property details with args:", {
        propertyId: BigInt(parseInt(propertyId, 16)),
        name: propertyDetails.name,
        physicalAddress: propertyDetails.physicalAddress,
        residenceType: propertyDetails.residenceType,
        bedrooms: Number(propertyDetails.bedrooms),
        bathrooms: Number(propertyDetails.bathrooms),
        squareFeet: BigInt(propertyDetails.squareFeet),
        yearBuilt: propertyDetails.yearBuilt,
        keyFeatures: propertyDetails.keyFeatures.filter(f => f.trim() !== ""),
        amenities: propertyDetails.amenities.filter(a => a.trim() !== ""),
        description: propertyDetails.description
      });

      // Second transaction - set property details
      const detailsReceipt = await publicClient.waitForTransactionReceipt({ 
        hash: hash as `0x${string}` 
      });
      console.log("Second transaction receipt:", detailsReceipt);

    } catch (err) {
      console.error("Error listing property:", err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">List Your Property</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-800/50 p-6 rounded-xl space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Property Name</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={propertyDetails.name}
                    onChange={(e) => setPropertyDetails(prev => ({...prev, name: e.target.value}))}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Physical Address</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={propertyDetails.physicalAddress}
                    onChange={(e) => setPropertyDetails(prev => ({...prev, physicalAddress: e.target.value}))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Residence Type</label>
                  <select
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={propertyDetails.residenceType}
                    onChange={(e) => setPropertyDetails(prev => ({...prev, residenceType: e.target.value}))}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-gray-800/50 p-6 rounded-xl space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Bedrooms</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={propertyDetails.bedrooms}
                    onChange={(e) => setPropertyDetails(prev => ({...prev, bedrooms: e.target.value}))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bathrooms</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={propertyDetails.bathrooms}
                    onChange={(e) => setPropertyDetails(prev => ({...prev, bathrooms: e.target.value}))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Square Feet</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={propertyDetails.squareFeet}
                    onChange={(e) => setPropertyDetails(prev => ({...prev, squareFeet: e.target.value || ""}))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Year Built</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={Number(propertyDetails.yearBuilt)}
                    onChange={(e) => setPropertyDetails(prev => ({
                      ...prev, 
                      yearBuilt: BigInt(e.target.value)
                    }))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Property Description */}
            <div className="bg-gray-800/50 p-6 rounded-xl space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Property Description</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  value={propertyDetails.description}
                  onChange={(e) => setPropertyDetails(prev => ({...prev, description: e.target.value}))}
                  required
                  placeholder="Describe your property..."
                />
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-gray-800/50 p-6 rounded-xl space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
              {propertyDetails.keyFeatures.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...propertyDetails.keyFeatures];
                      newFeatures[index] = e.target.value;
                      setPropertyDetails(prev => ({...prev, keyFeatures: newFeatures}));
                    }}
                    placeholder="e.g., Swimming Pool, Garden, etc."
                  />
                  {propertyDetails.keyFeatures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newFeatures = propertyDetails.keyFeatures.filter((_, i) => i !== index);
                        setPropertyDetails(prev => ({...prev, keyFeatures: newFeatures}));
                      }}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-500 p-2 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPropertyDetails(prev => ({
                  ...prev,
                  keyFeatures: [...prev.keyFeatures, ""]
                }))}
                className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-500 px-4 py-2 rounded-lg transition-colors"
              >
                Add Feature
              </button>
            </div>

            {/* Amenities */}
            <div className="bg-gray-800/50 p-6 rounded-xl space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              {propertyDetails.amenities.map((amenity, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={amenity}
                    onChange={(e) => {
                      const newAmenities = [...propertyDetails.amenities];
                      newAmenities[index] = e.target.value;
                      setPropertyDetails(prev => ({...prev, amenities: newAmenities}));
                    }}
                    placeholder="e.g., Air Conditioning, Parking, etc."
                  />
                  {propertyDetails.amenities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newAmenities = propertyDetails.amenities.filter((_, i) => i !== index);
                        setPropertyDetails(prev => ({...prev, amenities: newAmenities}));
                      }}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-500 p-2 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPropertyDetails(prev => ({
                  ...prev,
                  amenities: [...prev.amenities, ""]
                }))}
                className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-500 px-4 py-2 rounded-lg transition-colors"
              >
                Add Amenity
              </button>
            </div>

            {/* Listing Details */}
            <div className="bg-gray-800/50 p-6 rounded-xl space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Listing Details</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={propertyDetails.forSale}
                      onChange={(e) => setPropertyDetails(prev => ({...prev, forSale: e.target.checked}))}
                      className="rounded bg-gray-700/50"
                    />
                    <span>For Sale</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={propertyDetails.forRent}
                      onChange={(e) => setPropertyDetails(prev => ({...prev, forRent: e.target.checked}))}
                      className="rounded bg-gray-700/50"
                    />
                    <span>For Rent</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={propertyDetails.acceptingBids}
                      onChange={(e) => setPropertyDetails(prev => ({...prev, acceptingBids: e.target.checked}))}
                      className="rounded bg-gray-700/50"
                    />
                    <span>Accept Bids</span>
                  </label>
                </div>

                {propertyDetails.forSale && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Sale Price (ETH)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                      value={propertyDetails.price}
                      onChange={(e) => setPropertyDetails(prev => ({...prev, price: e.target.value}))}
                      required={propertyDetails.forSale}
                    />
                  </div>
                )}

                {propertyDetails.forRent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rent Amount (ETH/month)</label>
                      <input
                        type="text"
                        className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                        value={propertyDetails.rentAmount}
                        onChange={(e) => setPropertyDetails(prev => ({...prev, rentAmount: e.target.value}))}
                        required={propertyDetails.forRent}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Rent Duration (months)</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                        value={propertyDetails.rentDuration}
                        onChange={(e) => setPropertyDetails(prev => ({...prev, rentDuration: e.target.value}))}
                        required={propertyDetails.forRent}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isConfirming}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isConfirming ? 'Confirming...' : 'List Property'}
            </button>

            {error && (
              <div className="text-red-500 mt-4">
                Error: {error}
              </div>
            )}

            {isConfirmed && (
              <div className="text-green-500 mt-4">
                Property listed successfully!
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 
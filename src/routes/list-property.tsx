import { createFileRoute } from "@tanstack/react-router";
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useState } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";
import { parseEther } from "viem";

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
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    yearBuilt: new Date().getFullYear(),
    price: "",
    rentAmount: "",
    rentDuration: "",
    forSale: true,
    forRent: false,
    acceptingBids: false
  });

  // Contract interactions
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug logs
    console.log("Property Details:", propertyDetails);
    if (!propertyDetails.price || isNaN(Number(propertyDetails.price))) {
      console.error("Invalid price value");
      return;
    }

    const priceInWei = parseEther(propertyDetails.price);
    console.log("Price in Wei:", priceInWei.toString());

    try {
      if (!propertyDetails.forSale && !propertyDetails.forRent) {
        throw new Error("Property must be either for sale or rent");
      }

      // First transaction - list property
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'listProperty',
        value: 0n,
        args: [
          BigInt(priceInWei),
          propertyDetails.forSale,
          propertyDetails.forRent,
          0n,
          0n,
          propertyDetails.acceptingBids
        ]
      });

      if (!hash) throw new Error("No transaction hash received");
      
      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("First transaction receipt:", receipt);

      // Get the property ID from the event
      const propertyId = receipt?.logs[0]?.topics[1];
      if (!propertyId) {
        throw new Error("Failed to get property ID from transaction");
      }

      // Second transaction - set property details
      if (propertyId) {
        console.log("Setting details for property ID:", propertyId);
        await writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'setPropertyDetails',
          args: [
            BigInt(parseInt(propertyId, 16)), // Convert hex to decimal
            propertyDetails.name,
            propertyDetails.physicalAddress,
            propertyDetails.residenceType,
            propertyDetails.bedrooms,
            propertyDetails.bathrooms,
            BigInt(propertyDetails.squareFeet),
            propertyDetails.yearBuilt
          ]
        });
      }
    } catch (err) {
      console.error("Error listing property:", err instanceof Error ? err.message : String(err));
      setError(err instanceof Error ? err.message : String(err));
      return;
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
                    onChange={(e) => setPropertyDetails(prev => ({...prev, bedrooms: parseInt(e.target.value)}))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bathrooms</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={propertyDetails.bathrooms}
                    onChange={(e) => setPropertyDetails(prev => ({...prev, bathrooms: parseInt(e.target.value)}))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Square Feet</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={propertyDetails.squareFeet}
                    onChange={(e) => setPropertyDetails(prev => ({...prev, squareFeet: parseInt(e.target.value)}))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Year Built</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={propertyDetails.yearBuilt}
                    onChange={(e) => setPropertyDetails(prev => ({...prev, yearBuilt: parseInt(e.target.value)}))}
                    required
                  />
                </div>
              </div>
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
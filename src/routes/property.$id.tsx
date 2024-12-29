import { createFileRoute } from "@tanstack/react-router";
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseEther, formatEther } from 'viem';
import { useState } from "react";

// Add these interfaces
interface PropertyListing {
  owner: `0x${string}`
  price: bigint
  forSale: boolean
  forRent: boolean
  rentAmount: bigint
  rentDuration: bigint
  acceptingBids: boolean
  isInspected: boolean
  inspectionRating: number
  isSold: boolean
  isRented: boolean
}

interface PropertyDetails {
  name: string
  physicalAddress: string
  residenceType: string
  bedrooms: number
  bathrooms: number
  squareFeet: bigint
  yearBuilt: bigint
  keyFeatures: readonly string[]
  amenities: readonly string[]
  description: string
}

export const Route = createFileRoute('/property/$id')({
  component: PropertyDetails
});

function PropertyDetails() {
  const { address } = useAccount();
  const { id } = Route.useParams();
  const [bidAmount, setBidAmount] = useState('');

  // Fetch all properties first
  const { data: propertiesData, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getAllProperties',
  });

  const { writeContractAsync: placeBid } = useWriteContract();

  if (isLoading) return <div>Loading...</div>;
  if (!propertiesData) return <div>Property not found</div>;

  // Get the specific property using the ID
  const [listings, details] = propertiesData;
  const propertyIndex = parseInt(id) - 1; // Convert from 1-based to 0-based index
  
  const listing = listings[propertyIndex] as PropertyListing;
  const detail = details[propertyIndex] as PropertyDetails;

  if (!listing || !detail) return <div>Property not found</div>;

  const handleBid = async () => {
    if (!address || !bidAmount) return;

    try {
      const bidInWei = parseEther(bidAmount)
      
      await placeBid({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'placeBid',
        args: [BigInt(id), bidInWei] as const,
        value: bidInWei,
      });
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Images */}
        <div className="space-y-4">
          <div className="relative">
            <img src="../src/assets/home_1.jpg" alt={detail.name}className="w-full h-[400px] object-cover rounded-lg"/>
            {/* Status Badges */}
            {listing.forSale && (
              <span className="absolute bottom-4 right-4 border-2 border-collapse border-r-2">
                {listing.isSold ? (
                  <img src="../src/assets/sold-out.gif" alt="Sold" className="w-12 h-12" />
                ) : (
                  <img src="../src/assets/for-sale.gif" alt="For Sale" className="w-12 h-12" />
                )}
              </span>
            )}
            {listing.forRent && (
              <span className="absolute bottom-4 right-4 border-2 border-collapse border-r-2">
                {listing.isRented ? (
                  <img src="../src/assets/rented.gif" alt="Rented" className="w-12 h-12" />
                ) : (
                  <img src="../src/assets/rent.gif" alt="For Rent" className="w-12 h-12" />
                )}
              </span>
            )}
          </div>

          {/* Description Section */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{detail.description}</p>
            </CardContent>
          </Card>


        </div>


        {/* Right Column - Property Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{detail.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Price</h3>
                  <p className="text-2xl font-bold text-cyan-400">
                    {listing.forSale ? formatEther(listing.price) : formatEther(listing.rentAmount)} ETH
                    {listing.forRent && '/month'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold border-r-4">Bedrooms</h3>
                    <p className=" ">{detail.bedrooms}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Bathrooms</h3>
                    <p>{detail.bathrooms}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Square Feet</h3>
                    <p>{detail.squareFeet.toString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Year Built</h3>
                    <p>{detail.yearBuilt.toString()}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold">Inspection Status</h3>
                    <p>{listing.isInspected ? 'Inspected' : 'Not Inspected'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p>{detail.physicalAddress}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Category</h3>
                  <p>{detail.residenceType}</p>
                </div>

                <div className="flex flex-row gap-2"> 
                     {listing.forSale && (
                        <span className="">
                          <h3 className="font-semibold">Listing Status:</h3>
                          {listing.isSold ? (
                            // <img src="../src/assets/sold-out.gif" alt="Sold" className="w-12 h-12 ml-4" />
                            <p>Sold</p>
                          ) : (
                            // <img src="../src/assets/for-sale.gif" alt="For Sale" className="w-12 h-12 ml-2" />
                            <p>For Sale</p>
                          )}
                        </span>
                      )}
                      {listing.forRent && (
                        <span className="">

                          <h3 className="font-semibold">Listing Status:</h3>
                          {listing.isRented ? (
                            // <img src="../src/assets/rented.gif" alt="Rented" className="w-12 h-12 ml-2" />
                            <p>Rented</p>
                          ) : (
                            // <img src="../src/assets/rent.gif" alt="For Rent" className="w-12 h-12" />
                            <p>For Rent</p>
                          )}
                        </span>
                      )}
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Features and Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Key Features</h3>
                  <ul className="list-disc list-inside">
                    {detail.keyFeatures.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Amenities</h3>
                  <ul className="list-disc list-inside">
                    {detail.amenities.map((amenity, index) => (
                      <li key={index}>{amenity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bidding Section */}
          {listing.acceptingBids && !listing.isSold && (
            <Card>
              <CardHeader>
                <CardTitle>Place a Bid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      type="number"
                      placeholder="Bid Amount (ETH)"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      step="0.01"
                    />
                    <Button onClick={handleBid}>Make an Offer</Button>
                  </div>
                  {listing.isInspected && (
                    <div className="mt-2">
                      <p className="text-sm">
                        Inspection Rating: {listing.inspectionRating}/5
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 
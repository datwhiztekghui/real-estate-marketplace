import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';
import { keccak256, toBytes } from 'viem';

// Export the Route for TanStack Router
export const Route = createFileRoute('/list-property')({
  component: ListProperty
});

// Rename the default export to match the component name
function ListProperty() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { writeContractAsync: listProperty } = useWriteContract();
  const { writeContractAsync: setPropertyDetails } = useWriteContract();
  const publicClient = usePublicClient();
  if (!publicClient) throw new Error("Public client not available");
  
  // Form states for listing
  const [listingForm, setListingForm] = useState({
    price: '',
    forSale: true,
    forRent: false,
    rentAmount: '',
    rentDuration: '',
    acceptingBids: true
  });

  // Form states for property details
  const [detailsForm, setDetailsForm] = useState({
    name: '',
    physicalAddress: '',
    residenceType: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    yearBuilt: '',
    keyFeatures: '',
    amenities: '',
    description: ''
  });

  // Transaction states
  const [propertyId, setPropertyId] = useState<number | null>(null);
  
  // Handle listing form changes
  const handleListingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setListingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle details form changes
  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDetailsForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Submit handler for listing property
  const handleListProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      const hash = await listProperty({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'listProperty',
        args: [
          parseEther(listingForm.price),
          listingForm.forSale,
          listingForm.forRent,
          listingForm.rentAmount ? parseEther(listingForm.rentAmount) : 0n,
          BigInt(listingForm.rentDuration || '0'),
          listingForm.acceptingBids
        ]
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Find the PropertyListed event and get the propertyId
      if (receipt?.logs) {
        console.log('Transaction logs:', receipt.logs);
        
        // Get the first log as it's likely our PropertyListed event
        const event = receipt.logs[0];
        if (event?.topics[1]) {
          // The property ID should be in topics[1]
          const hexString = event.topics[1].replace('0x', '');
          const id = parseInt(hexString, 16);
          console.log('Property ID:', id);
          setPropertyId(id);
        } else {
          console.error('Property ID not found in event topics');
          // Log the full event for debugging
          console.log('Event details:', {
            topics: event?.topics,
            data: event?.data
          });
        }
      } else {
        console.error('No logs found in receipt');
      }

      queryClient.invalidateQueries({ queryKey: ['properties'] });
    } catch (error) {
      console.error('Error listing property:', error);
    }
  };

  // Submit handler for setting property details
  const handleSetDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !propertyId) return;

    try {
      const hash = await setPropertyDetails({
        address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'setPropertyDetails',
          args: [
          BigInt(propertyId),
          detailsForm.name,
          detailsForm.physicalAddress,
          detailsForm.residenceType,
          parseInt(detailsForm.bedrooms),
          parseInt(detailsForm.bathrooms),
          BigInt(detailsForm.squareFeet),
          BigInt(detailsForm.yearBuilt),
          detailsForm.keyFeatures.split(','),
          detailsForm.amenities.split(','),
          detailsForm.description
        ]
      });

      await publicClient.waitForTransactionReceipt({ hash });

      // Reset forms after successful submission
      setListingForm({
        price: '',
        forSale: true,
        forRent: false,
        rentAmount: '',
        rentDuration: '',
        acceptingBids: true
      });
      
      setDetailsForm({
        name: '',
        physicalAddress: '',
        residenceType: '',
        bedrooms: '',
        bathrooms: '',
        squareFeet: '',
        yearBuilt: '',
        keyFeatures: '',
        amenities: '',
        description: ''
      });

      setPropertyId(null);

      // Invalidate queries to refetch property list
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    } catch (error) {
      console.error('Error setting property details:', error);
    }
  };

  // Add this near the top of your component to debug
  useEffect(() => {
    console.log('Property ID changed:', propertyId);
  }, [propertyId]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>List Your Property</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleListProperty} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Sale Price (ETH)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.001"
                value={listingForm.price}
                onChange={handleListingChange}
                required={listingForm.forSale}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="forSale"
                  name="forSale"
                  checked={listingForm.forSale}
                  onCheckedChange={(checked) => 
                    setListingForm(prev => ({ ...prev, forSale: checked }))
                  }
                />
                <Label htmlFor="forSale">For Sale</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="forRent"
                  name="forRent"
                  checked={listingForm.forRent}
                  onCheckedChange={(checked) => 
                    setListingForm(prev => ({ ...prev, forRent: checked }))
                  }
                />
                <Label htmlFor="forRent">For Rent</Label>
              </div>
            </div>

            {listingForm.forRent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rentAmount">Rent Amount (ETH)</Label>
                  <Input
                    id="rentAmount"
                    name="rentAmount"
                    type="number"
                    step="0.001"
                    value={listingForm.rentAmount}
                    onChange={handleListingChange}
                    required={listingForm.forRent}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rentDuration">Rent Duration (days)</Label>
                  <Input
                    id="rentDuration"
                    name="rentDuration"
                    type="number"
                    value={listingForm.rentDuration}
                    onChange={handleListingChange}
                    required={listingForm.forRent}
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="acceptingBids"
                name="acceptingBids"
                checked={listingForm.acceptingBids}
                onCheckedChange={(checked) => 
                  setListingForm(prev => ({ ...prev, acceptingBids: checked }))
                }
              />
              <Label htmlFor="acceptingBids">Accept Bids</Label>
            </div>

            <Button type="submit" className="w-full">
              List Property
            </Button>
          </form>
        </CardContent>
      </Card>

      {propertyId !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Set Property Details (ID: {propertyId})</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetDetails} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={detailsForm.name}
                  onChange={handleDetailsChange}
                    required
                />
                </div>

              <div className="space-y-2">
                <Label htmlFor="physicalAddress">Physical Address</Label>
                <Input
                  id="physicalAddress"
                  name="physicalAddress"
                  value={detailsForm.physicalAddress}
                  onChange={handleDetailsChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residenceType">Residence Type</Label>
                <Input
                  id="residenceType"
                  name="residenceType"
                  value={detailsForm.residenceType}
                  onChange={handleDetailsChange}
                  required
                />
            </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    value={detailsForm.bedrooms}
                    onChange={handleDetailsChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    value={detailsForm.bathrooms}
                    onChange={handleDetailsChange}
                    required
                  />
                </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="squareFeet">Square Feet</Label>
                  <Input
                    id="squareFeet"
                    name="squareFeet"
                    type="number"
                    value={detailsForm.squareFeet}
                    onChange={handleDetailsChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    name="yearBuilt"
                    type="number"
                    value={detailsForm.yearBuilt}
                    onChange={handleDetailsChange}
                    required
                  />
              </div>
            </div>

              <div className="space-y-2">
                <Label htmlFor="keyFeatures">Key Features (comma-separated)</Label>
                <Input
                  id="keyFeatures"
                  name="keyFeatures"
                  value={detailsForm.keyFeatures}
                  onChange={handleDetailsChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  name="amenities"
                  value={detailsForm.amenities}
                  onChange={handleDetailsChange}
                  required
                      />
                    </div>
                    
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={detailsForm.description}
                  onChange={handleDetailsChange}
                  required
                />
            </div>

              <Button type="submit" className="w-full">
                Set Property Details
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
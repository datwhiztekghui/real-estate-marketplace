export interface PropertyDetails {
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

export interface PropertyListing {
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
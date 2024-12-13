export interface PropertyDetails {
  name: string;
  physicalAddress: string;
  residenceType: string;
  bedrooms: number;
  squareFeet: bigint;
  yearBuilt: number;
}

export interface PropertyListing {
  owner: string;
  price: bigint;
  rentAmount: bigint;
  rentDuration: bigint;
  forSale: boolean;
  forRent: boolean;
  isInspected: boolean;
  isSold: boolean;
  isRented: boolean;
  acceptingBids: boolean;
} 
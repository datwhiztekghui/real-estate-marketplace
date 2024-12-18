//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ownable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ownableAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RealEstateMarketplace
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const realEstateMarketplaceAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'propertyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'bidder',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'bidAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'BidPlaced',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'inspector',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'InspectorAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'inspector',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'InspectorRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'propertyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'PropertyDetailsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'propertyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'inspector',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'rating', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'PropertyInspected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'propertyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'price',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'forSale', internalType: 'bool', type: 'bool', indexed: false },
      { name: 'forRent', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'PropertyListed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'propertyId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'PropertyUnlisted',
  },
  {
    type: 'function',
    inputs: [
      { name: '_propertyId', internalType: 'uint256', type: 'uint256' },
      { name: '_bidder', internalType: 'address', type: 'address' },
    ],
    name: 'acceptBid',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_inspector', internalType: 'address', type: 'address' }],
    name: 'addInspector',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_inspector', internalType: 'address', type: 'address' }],
    name: 'getInspectorDetails',
    outputs: [
      { name: 'isRegistered', internalType: 'bool', type: 'bool' },
      {
        name: 'successfulInspections',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'totalInspections', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_propertyId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPropertyDetails',
    outputs: [
      {
        name: 'listing',
        internalType: 'struct RealEstateMarketplace.PropertyListing',
        type: 'tuple',
        components: [
          { name: 'owner', internalType: 'address', type: 'address' },
          { name: 'price', internalType: 'uint256', type: 'uint256' },
          { name: 'rentAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'rentDuration', internalType: 'uint256', type: 'uint256' },
          { name: 'forSale', internalType: 'bool', type: 'bool' },
          { name: 'forRent', internalType: 'bool', type: 'bool' },
          { name: 'isInspected', internalType: 'bool', type: 'bool' },
          { name: 'inspectionRating', internalType: 'uint8', type: 'uint8' },
          { name: 'isSold', internalType: 'bool', type: 'bool' },
          { name: 'isRented', internalType: 'bool', type: 'bool' },
          { name: 'acceptingBids', internalType: 'bool', type: 'bool' },
        ],
      },
      {
        name: 'details',
        internalType: 'struct RealEstateMarketplace.PropertyDetails',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'physicalAddress', internalType: 'string', type: 'string' },
          { name: 'residenceType', internalType: 'string', type: 'string' },
          { name: 'bedrooms', internalType: 'uint8', type: 'uint8' },
          { name: 'bathrooms', internalType: 'uint8', type: 'uint8' },
          { name: 'squareFeet', internalType: 'uint256', type: 'uint256' },
          { name: 'yearBuilt', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_propertyId', internalType: 'uint256', type: 'uint256' },
      { name: '_rating', internalType: 'uint8', type: 'uint8' },
      { name: '_passInspection', internalType: 'bool', type: 'bool' },
    ],
    name: 'inspectProperty',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'inspectors',
    outputs: [
      { name: 'isRegistered', internalType: 'bool', type: 'bool' },
      {
        name: 'successfulInspections',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'totalInspections', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_price', internalType: 'uint256', type: 'uint256' },
      { name: '_forSale', internalType: 'bool', type: 'bool' },
      { name: '_forRent', internalType: 'bool', type: 'bool' },
      { name: '_rentAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_rentDuration', internalType: 'uint256', type: 'uint256' },
      { name: '_acceptingBids', internalType: 'bool', type: 'bool' },
    ],
    name: 'listProperty',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_propertyId', internalType: 'uint256', type: 'uint256' },
      { name: '_bidAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'placeBid',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'properties',
    outputs: [
      {
        name: 'listing',
        internalType: 'struct RealEstateMarketplace.PropertyListing',
        type: 'tuple',
        components: [
          { name: 'owner', internalType: 'address', type: 'address' },
          { name: 'price', internalType: 'uint256', type: 'uint256' },
          { name: 'rentAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'rentDuration', internalType: 'uint256', type: 'uint256' },
          { name: 'forSale', internalType: 'bool', type: 'bool' },
          { name: 'forRent', internalType: 'bool', type: 'bool' },
          { name: 'isInspected', internalType: 'bool', type: 'bool' },
          { name: 'inspectionRating', internalType: 'uint8', type: 'uint8' },
          { name: 'isSold', internalType: 'bool', type: 'bool' },
          { name: 'isRented', internalType: 'bool', type: 'bool' },
          { name: 'acceptingBids', internalType: 'bool', type: 'bool' },
        ],
      },
      {
        name: 'details',
        internalType: 'struct RealEstateMarketplace.PropertyDetails',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'physicalAddress', internalType: 'string', type: 'string' },
          { name: 'residenceType', internalType: 'string', type: 'string' },
          { name: 'bedrooms', internalType: 'uint8', type: 'uint8' },
          { name: 'bathrooms', internalType: 'uint8', type: 'uint8' },
          { name: 'squareFeet', internalType: 'uint256', type: 'uint256' },
          { name: 'yearBuilt', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'propertyBids',
    outputs: [
      { name: 'bidder', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'isActive', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'propertyCounter',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_inspector', internalType: 'address', type: 'address' }],
    name: 'removeInspector',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_propertyId', internalType: 'uint256', type: 'uint256' }],
    name: 'rentProperty',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_propertyId', internalType: 'uint256', type: 'uint256' },
      { name: '_name', internalType: 'string', type: 'string' },
      { name: '_physicalAddress', internalType: 'string', type: 'string' },
      { name: '_residenceType', internalType: 'string', type: 'string' },
      { name: '_bedrooms', internalType: 'uint8', type: 'uint8' },
      { name: '_bathrooms', internalType: 'uint8', type: 'uint8' },
      { name: '_squareFeet', internalType: 'uint256', type: 'uint256' },
      { name: '_yearBuilt', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'setPropertyDetails',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_propertyId', internalType: 'uint256', type: 'uint256' },
      { name: '_acceptingBids', internalType: 'bool', type: 'bool' },
    ],
    name: 'toggleBidAcceptance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_propertyId', internalType: 'uint256', type: 'uint256' }],
    name: 'unlistProperty',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

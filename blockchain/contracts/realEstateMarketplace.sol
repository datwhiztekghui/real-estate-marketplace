// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RealEstateMarketplace is Ownable, ReentrancyGuard {
   constructor() {
       _transferOwnership(msg.sender);
   }
    
    // Structs
    struct PropertyDetails {
        string name;
        string physicalAddress;
        string residenceType;
        uint8 bedrooms;
        uint8 bathrooms;
        uint256 squareFeet;
        uint256 yearBuilt;
        string[] keyFeatures;
        string[] amenities;
        string description;
    }

    struct PropertyListing {
        address owner;
        uint256 price;
        bool forSale;
        bool forRent;
        uint256 rentAmount;
        uint256 rentDuration;
        bool acceptingBids;
        bool isInspected;
        uint8 inspectionRating;
        bool isSold;
        bool isRented;
    }

    struct Property {
        PropertyListing listing;
        PropertyDetails details;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        bool isActive;
    }

    // New struct for inspectors
    struct Inspector {
        bool isRegistered;
        uint256 successfulInspections;
        uint256 totalInspections;
    }

    // Events
    event PropertyListed(
        uint256 indexed propertyId,
        address indexed owner,
        uint256 price,
        bool forSale,
        bool forRent
    );

    event BidPlaced(
        uint256 indexed propertyId, 
        address indexed bidder, 
        uint256 bidAmount
    );

    event PropertyUnlisted(
        uint256 indexed propertyId
    );

    event PropertyDetailsUpdated(
        uint256 indexed propertyId
    );

    // New inspector-related events
    event InspectorAdded(address indexed inspector);
    event InspectorRemoved(address indexed inspector);
    event PropertyInspected(
        uint256 indexed propertyId, 
        address indexed inspector, 
        uint8 rating
    );

    // Mappings
    mapping(uint256 => Property) public properties;
    mapping(uint256 => Bid[]) public propertyBids;
    mapping(address => Inspector) public inspectors;
    uint256 public propertyCounter;

    // Modifier to check if caller is a registered inspector
    modifier onlyInspector() {
        require(inspectors[msg.sender].isRegistered, "Not a registered inspector");
        _;
    }

    // Add inspector (only contract owner can add)
    function addInspector(address _inspector) external onlyOwner {
        require(!inspectors[_inspector].isRegistered, "Inspector already registered");
        
        inspectors[_inspector] = Inspector({
            isRegistered: true,
            successfulInspections: 0,
            totalInspections: 0
        });

        emit InspectorAdded(_inspector);
    }

    // Remove inspector (only contract owner can remove)
    function removeInspector(address _inspector) external onlyOwner {
        require(inspectors[_inspector].isRegistered, "Inspector not registered");
        
        delete inspectors[_inspector];

        emit InspectorRemoved(_inspector);
    }

    // Inspect property and assign rating
    function inspectProperty(
        uint256 _propertyId, 
        uint8 _rating, 
        bool _passInspection
    ) external onlyInspector {
        Property storage property = properties[_propertyId];
        
        // Ensure property hasn't been inspected before
        require(!property.listing.isInspected, "Property already inspected");
        
        // Rating must be between 1 and 10
        require(_rating >= 1 && _rating <= 10, "Invalid rating");

        // Update property inspection status
        property.listing.isInspected = true;
        property.listing.inspectionRating = _rating;

        // Update inspector stats
        Inspector storage inspector = inspectors[msg.sender];
        inspector.totalInspections++;
        if (_passInspection) {
            inspector.successfulInspections++;
        }

        emit PropertyInspected(_propertyId, msg.sender, _rating);
    }

    // List property with separate function for details
    function listProperty(
        uint256 _price,
        bool _forSale,
        bool _forRent,
        uint256 _rentAmount,
        uint256 _rentDuration,
        bool _acceptingBids
    ) external returns (uint256) {
        require(_forSale || _forRent, "Property must be either for sale or rent");
        if (_forSale) {
            require(_price > 0, "Sale price must be greater than 0");
        }
        if (_forRent) {
            require(_rentAmount > 0, "Rent amount must be greater than 0");
            require(_rentDuration > 0, "Rent duration must be greater than 0");
        }
        
        propertyCounter++;

        properties[propertyCounter].listing = PropertyListing({
            owner: msg.sender,
            price: _price,
            forSale: _forSale,
            forRent: _forRent,
            rentAmount: _rentAmount,
            rentDuration: _rentDuration,
            acceptingBids: _acceptingBids,
            isInspected: false,
            inspectionRating: 0,
            isSold: false,
            isRented: false
        });

        emit PropertyListed(
            propertyCounter,
            msg.sender,
            _price,
            _forSale,
            _forRent
        );

        return propertyCounter;
    }

    // Separate function to add property details
    function setPropertyDetails(
        uint256 _propertyId,
        string memory _name,
        string memory _physicalAddress,
        string memory _residenceType,
        uint8 _bedrooms,
        uint8 _bathrooms,
        uint256 _squareFeet,
        uint256 _yearBuilt,
        string[] memory _keyFeatures,
        string[] memory _amenities,
        string memory _description
    ) external {
        require(_propertyId <= propertyCounter, "Property does not exist");
        require(properties[_propertyId].listing.owner == msg.sender, "Not the owner");

        properties[_propertyId].details = PropertyDetails({
            name: _name,
            physicalAddress: _physicalAddress,
            residenceType: _residenceType,
            bedrooms: _bedrooms,
            bathrooms: _bathrooms,
            squareFeet: _squareFeet,
            yearBuilt: _yearBuilt,
            keyFeatures: _keyFeatures,
            amenities: _amenities,
            description: _description
        });

        emit PropertyDetailsUpdated(_propertyId);
    }

    // Place a bid
    function placeBid(uint256 _propertyId, uint256 _bidAmount) external payable nonReentrant {
            Property storage property = properties[_propertyId];
            PropertyListing storage listing = property.listing;
            
            require(listing.isInspected, "Property must be inspected first");
            require(listing.acceptingBids, "Property not accepting bids");
            require(
                (listing.forSale && !listing.isSold) || 
                (listing.forRent && !listing.isRented), 
                "Property not available"
            );
            require(msg.value == _bidAmount, "Bid amount must match sent value");
            require(_bidAmount > 0, "Bid amount must be greater than 0");

            propertyBids[_propertyId].push(Bid({
                bidder: msg.sender,
                amount: _bidAmount,
                isActive: true
            }));

            emit BidPlaced(_propertyId, msg.sender, _bidAmount);
        }


    // Toggle bid acceptance
    function toggleBidAcceptance(uint256 _propertyId, bool _acceptingBids) external {
        Property storage property = properties[_propertyId];
        
        require(msg.sender == property.listing.owner, "Only owner can toggle");
        
        property.listing.acceptingBids = _acceptingBids;
    }

    // Unlist property
    function unlistProperty(uint256 _propertyId) external {
        Property storage property = properties[_propertyId];
        PropertyListing storage listing = property.listing;
        
        require(msg.sender == listing.owner, "Only owner can unlist");
        require(!listing.isSold && !listing.isRented, "Cannot unlist");
        
        listing.forSale = false;
        listing.forRent = false;
        listing.acceptingBids = false;
        
        // Refund active bids
        Bid[] storage bids = propertyBids[_propertyId];
        for (uint256 i = 0; i < bids.length; i++) {
            if (bids[i].isActive) {
                payable(bids[i].bidder).transfer(bids[i].amount);
                bids[i].isActive = false;
            }
        }
        
        emit PropertyUnlisted(_propertyId);
    }

    // Get property details
    function getPropertyDetails(uint256 _propertyId) external view returns (
        PropertyListing memory listing, 
        PropertyDetails memory details
    ) {
        Property storage property = properties[_propertyId];
        return (property.listing, property.details);
    }

    // Accept a bid
    function acceptBid(uint256 _propertyId, address _bidder) external nonReentrant {
        Property storage property = properties[_propertyId];
        PropertyListing storage listing = property.listing;
        
        require(msg.sender == listing.owner, "Only property owner can accept bids");
        require(listing.forSale, "Property not for sale");
        require(!listing.isSold, "Property already sold");

        // Find the bid
        Bid memory acceptedBid;
        uint256 bidIndex;
        bool bidFound = false;

        Bid[] storage bids = propertyBids[_propertyId];
        for (uint256 i = 0; i < bids.length; i++) {
            if (bids[i].bidder == _bidder && bids[i].isActive) {
                acceptedBid = bids[i];
                bidIndex = i;
                bidFound = true;
                break;
            }
        }

        require(bidFound, "Bid not found");

        // Transfer property ownership
        listing.owner = _bidder;
        listing.isSold = true;
        listing.forSale = false;

        // Transfer funds to previous owner
        payable(msg.sender).transfer(acceptedBid.amount);

        // Mark the bid as inactive
        bids[bidIndex].isActive = false;
    }

    // Rent a property
    function rentProperty(uint256 _propertyId) external payable nonReentrant {
        Property storage property = properties[_propertyId];
        PropertyListing storage listing = property.listing;
        
        require(listing.isInspected, "Property must be inspected first");
        require(listing.forRent, "Property not for rent");
        require(!listing.isRented, "Property already rented");
        require(msg.value >= listing.rentAmount, "Insufficient rent payment");

        // Transfer rent to property owner
        payable(listing.owner).transfer(listing.rentAmount);

        // Update property status
        listing.isRented = true;

        // Refund excess payment
        if (msg.value > listing.rentAmount) {
            payable(msg.sender).transfer(msg.value - listing.rentAmount);
        }
    }

    // Additional view function to get inspector details
    function getInspectorDetails(address _inspector) external view returns (
        bool isRegistered, 
        uint256 successfulInspections, 
        uint256 totalInspections
    ) {
        Inspector storage inspector = inspectors[_inspector];
        return (
            inspector.isRegistered, 
            inspector.successfulInspections, 
            inspector.totalInspections
        );
    }

    function getAllProperties() public view returns (
        PropertyListing[] memory listings,
        PropertyDetails[] memory details
    ) {
        PropertyListing[] memory allListings = new PropertyListing[](propertyCounter);
        PropertyDetails[] memory allDetails = new PropertyDetails[](propertyCounter);

        for (uint256 i = 1; i <= propertyCounter; i++) {
            allListings[i-1] = properties[i].listing;
            allDetails[i-1] = properties[i].details;
        }

        return (allListings, allDetails);
    }
}
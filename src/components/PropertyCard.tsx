import React from 'react';
import { Link } from '@tanstack/react-router';
import { PropertyDetails, PropertyListing } from '@/types';

interface PropertyCardProps {
  id: string;
  details: PropertyDetails;
  listing: PropertyListing;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ id, details, listing }) => {
  return (
    <Link
      to="/property/$id"
      params={{ id }}
      className="block bg-card hover:shadow-lg transition-shadow rounded-lg overflow-hidden"
    >
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{details.name}</h3>
        <p className="text-muted-foreground mb-4">{details.physicalAddress}</p>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <span>{details.bedrooms} beds</span>
            <span>{details.squareFeet.toString()} sqft</span>
          </div>
          <p className="text-xl font-bold">
            ${Number(listing.price).toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
};    
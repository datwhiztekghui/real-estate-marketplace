import { createFileRoute, Link } from '@tanstack/react-router'
import { useReadContract, useWriteContract, useAccount, useTransaction } from 'wagmi'
import { StarIcon, BedDoubleIcon, School, LandPlot, BathIcon, HomeIcon, Building2Icon, BarChart3Icon, Brain, MapPin } from "lucide-react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from 'react'

// Define types for property data
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

interface InspectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, passed: boolean) => void
}

// Inspection Dialog Component
function InspectionDialog({ isOpen, onClose, onSubmit }: InspectionDialogProps) {
  const [rating, setRating] = useState<number>(1)
  const [passed, setPassed] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    // Validate rating
    if (rating < 1 || rating > 10) {
      alert('Rating must be between 1 and 10')
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit(rating, passed)
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[url('../src/assets/Modal2_bg.png')] bg-no-repeat bg-cover border border-propstakeIndigoHover rounded-2xl shadow-2xl z-50">
        <DialogHeader>
          <DialogTitle>Property Inspection</DialogTitle>
          <p className="text-sm text-gray-300">
            Rate this property according to your inspection.
          </p>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rating">Rating (1-10)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="passed"
              checked={passed}
              onChange={(e) => setPassed(e.target.checked)}
              className="rounded border-gray-300 text-propstakeIndigoHover focus:ring-propstakeIndigoHover"
            />
            <Label htmlFor="passed">Pass Inspection</Label>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-propstakeIndigoHover hover:bg-propstakeIndigoHover"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const Route = createFileRoute('/browse')({
  component: BrowseProperties,
})

function BrowseProperties() {
  const { address } = useAccount()
  const [inspectionDialog, setInspectionDialog] = useState({
    isOpen: false,
    propertyId: 0,
  })
  const [pendingTx, setPendingTx] = useState<string | null>(null)
  const [showMoreStates, setShowMoreStates] = useState<{ [key: number]: boolean }>({});

  // Add useWaitForTransaction hook to monitor transaction status
  const { isSuccess: isTxSuccess } = useTransaction({
    hash: pendingTx as `0x${string}`,
  })

  // Modify the read contract call to enable refresh
  const { data: propertiesData, refetch: refetchProperties } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllProperties',
  })

  // Watch for successful transactions and refresh data
  useEffect(() => {
    if (isTxSuccess && pendingTx) {
      refetchProperties()
      setPendingTx(null)
    }
  }, [isTxSuccess, pendingTx])

  const { data: inspectorData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getInspectorDetails',
    args: [address ?? '0x0'],
  })
  const isInspector = inspectorData?.[0] ?? false

  // Contract write function for inspection
  const { writeContract } = useWriteContract()

  const [listings, details] = propertiesData || [[], []]

  const formatPrice = (price: bigint): string => {
    return `${Number(price) / 1e18} ETH`
  }

  const handleInspectionSubmit = async (rating: number, passed: boolean) => {
    try {
      if (!writeContract) {
        console.error('Write contract not available')
        return
      }

      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'inspectProperty',
        args: [BigInt(inspectionDialog.propertyId), rating, passed],
      })

      console.log('Transaction submitted:', hash)
      setPendingTx(hash)
      setInspectionDialog({ isOpen: false, propertyId: 0 })

      } catch (error) {
      console.error('Error submitting inspection:', error)
      alert('Failed to submit inspection. Please try again.')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Browse Properties</h1>

        <div className="w-512 h-692 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings &&
          details &&
          listings.map((listing: PropertyListing, index: number) => {
            const detail: PropertyDetails = details[index]
            if (!detail.name) return null

            const isPending = pendingTx && inspectionDialog.propertyId === index + 1

            return (
              <Card
                key={index}
                className="overflow-hidden bg-rgb(20,20,20,1) text-white"
              >
                <div className="w-full h-58 bg-slate-800 relative">
                  {isInspector && (
                    <button
                      onClick={() => setInspectionDialog({ 
                        isOpen: true, 
                        propertyId: index + 1 
                      })}
                      disabled={listing.isInspected || isPending}
                      className={`absolute top-20 right-4 px-1.5 py-2 rounded-md z-10 ${
                        listing.isInspected 
                          ? 'bg-green-600 cursor-default'
                          : isPending
                          ? 'bg-yellow-600 cursor-wait'
                          : 'bg-red-600 hover:bg-red-700'
                      } text-white`}
                    >
                      {listing.isInspected 
                        ? <img src="../src/assets/home_inspection.png" alt="Inspect Property" className="w-10 h-10" />
                        : isPending
                        ? 'Processing...'
                        : <img src="../src/assets/home_inspection.png" alt="Inspect Property" className="w-10 h-10" />
                      }
                    </button>
                  )}
                  <img
                    src="../src/assets/home_1.jpg"
                    alt={detail.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {listing.forSale && (
                    <span className="absolute top-4 right-4 border-2 border-collapse border-r-2">
                      {listing.isSold ? (
                        <img src="../src/assets/sold-out.gif" alt="Sold" className="w-12 h-12" />
                      ) : (
                        <img src="../src/assets/for-sale.gif" alt="For Sale" className="w-12 h-12" />
                      )}
                    </span>
                  )}
                  
                  {listing.forRent && (
                    <span className="absolute top-4 right-4 border-2 border-collapse border-r-2">
                      {listing.isRented ? (
                        <img src="../src/assets/rented.gif" alt="Rented" className="w-12 h-12" />
                      ) : (
                        <img src="../src/assets/rent.gif" alt="For Rent" className="w-12 h-12" />
                      )}
                    </span>
                  )}
                </div>
                
                <CardContent className="p-4">
                <div className="mb-4">
                    <h3 className="text-xl font-semibold text-purple-300">
                      {detail.name || 'Other Properties'}
                    </h3>
                    <p className="flex items-center text-sm text-purple-300 ">
                        <MapPin className="w-4 h-4 mr-2 text-gray-300"/>
                        <span className="text-white">{detail.physicalAddress}</span>
                       {' '}
                      </p>
        
                    <p className="text-sm text-gray-300 mt-2">
                      {showMoreStates[index] 
                        ? detail.description 
                        : detail.description.slice(0, 100).concat('...')}
                      <span 
                        className="text-sm text-purple-300 cursor-pointer ml-2" 
                        onClick={() => setShowMoreStates(prev => ({
                          ...prev, 
                          [index]: !prev[index]
                        }))}
                      >
                        {showMoreStates[index] ? 'Show less' : 'Read more'}
                      </span>
                    </p>

                    
       

                  </div>

                  <div className="grid grid-flow-row-2 gap-2">
                    <div className="flex flex-col-3 sm:flex-col-1 gap-4">

                      <p className="flex items-center text-sm text-gray-300 border-2 w-fit h-fit  border-collapse border-r-20 bg-slate-700 rounded-md">
                        <BedDoubleIcon className="w-5 h-5 mr-1"/>
                        <span className="text-white">{detail.bedrooms}-</span>
                        Bedrooms{' '}
                      </p>

                      
                      <p className="flex items-center text-sm text-gray-300 border-2 w-fit h-fit border-r-20 bg-slate-700 rounded-md">
                        <BathIcon className="w-5 h-5 mr-1"/>
                        <span className="text-white">{detail.bathrooms}-</span>
                        Bathrooms {' '}
                      </p>

                      <p className="flex items-center text-sm text-gray-300 border-2 w-fit h-fit  border-collapse border-r-20 bg-slate-700 rounded-md">
                        <LandPlot className="w-5 h-5 mr-1"/>
                        <span className="text-white">{detail.squareFeet.toString()}-</span>
                        sq-ft {' '}
                      </p>
                    </div>
                    
                    <div className="flex flex-col-2 mt-2 gap-4">
                    <p className="flex items-center text-sm text-gray-300 mb-2">
                        <School className="w-5 h-5 mr-1"/>
                        <span className="text-white">{detail.residenceType}-</span>
                        Category {' '}
                      </p>

                      <p className="text-sm text-gray-300">
                        Year Built:{' '}
                        <span className="text-white">
                          {detail.yearBuilt.toString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between flex-cols-3 mt-2 space-y-1">
                  {(listing.isInspected || isPending) && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-300">
                        Inspection Status: {' '} 
                        <span className={`${
                          isPending ? 'text-yellow-400' : 'text-purple-300'
                        }`}>
                          {isPending ? 'Processing...' : 'Completed'}
                        </span>
                      </p>
                      {listing.isInspected && (
                        <>
                          <p className="text-sm text-gray-300">
                            Rating:{' '}
                            <span className="text-indigo-400">
                              {listing.inspectionRating}/5
                            </span>
                          </p>
                          <p className="text-sm text-gray-300">
                            Status:{' '}
                            <span className={`${
                              listing.isInspected ? 'text-indigo-400' : 'text-red-400'
                            }`}>
                              {listing.isInspected ? 'Passed' : 'Failed'}
                            </span>
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold ">
                        {listing.forRent
                          ? formatPrice(listing.rentAmount)
                          : formatPrice(listing.price)}
                      </p>
                    </div>
                    <Link
                      to={`/property/${index + 1}`}
                      className="w-fit"
                    >
                      <Button
                        variant="default"
                        className="w-fit bg-propstakeIndigoHover hover:bg-purple-500 text-gray-200 border-gray-200"
                    >
                      View Details
                      </Button>
                    </Link>
                  </div>


                </CardContent>
              </Card>
            )
          })}
        </div>

      <InspectionDialog
        isOpen={inspectionDialog.isOpen}
        onClose={() => setInspectionDialog({ isOpen: false, propertyId: 0 })}
        onSubmit={handleInspectionSubmit}
      />

      {(!listings || listings.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">No properties listed yet.</p>
        </div>
      )}
    </div>
  )
}

export default BrowseProperties
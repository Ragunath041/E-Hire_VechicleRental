import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Star, 
  MessageCircle, 
  Check, 
  Car, 
  Bike,
  User,
  Shield
} from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useVehicles } from '@/contexts/VehicleContext';
import { useAuth } from '@/contexts/AuthContext';
import { createBooking } from '@/lib/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";

const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { currentVehicle, fetchVehicleById, loading: isLoading } = useVehicles();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadVehicle = async () => {
      if (id) {
        try {
          await fetchVehicleById(id);
        } catch (error) {
          console.error('Error fetching vehicle:', error);
          navigate('/not-found');
        }
      }
    };
    
    loadVehicle();
  }, [id, fetchVehicleById, navigate]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to book this vehicle.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    if (!startDate || !endDate) {
      toast({
        title: "Missing dates",
        description: "Please select both start and end dates for your booking.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const bookingData = {
        vehicleId: id!,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        message: bookingMessage
      };
      
      await createBooking(bookingData);
      
      toast({
        title: "Booking request sent!",
        description: `Your booking for ${currentVehicle?.title} has been sent to the owner for approval.`,
      });
      
      // Reset form
      setStartDate(null);
      setEndDate(null);
      setBookingMessage('');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Failed to create booking",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDays = (start: Date, end: Date): number => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Including both start and end days
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!currentVehicle) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Vehicle Not Found</h2>
        <p className="mb-4">The vehicle you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/vehicles')}>Browse Vehicles</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Vehicle Details */}
        <div className="md:col-span-2">
          {/* Vehicle Images */}
          <div className="mb-6">
            <img 
              src={currentVehicle.imageUrl} 
              alt={currentVehicle.title} 
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
          </div>
          
          {/* Vehicle Title and Location */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Badge 
                className="mr-2"
                variant={currentVehicle.type === 'car' ? 'default' : 'secondary'}
              >
                {currentVehicle.type === 'car' ? (
                  <span className="flex items-center">
                    <Car className="mr-1 h-3 w-3" />
                    Car
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Bike className="mr-1 h-3 w-3" />
                    Bike
                  </span>
                )}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {currentVehicle.location}
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{currentVehicle.title}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-4 w-4 text-yellow-500" 
                    fill={i < Math.floor(currentVehicle.rating) ? "#f59e0b" : "#e5e7eb"}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{currentVehicle.rating}</span>
              <span className="text-sm text-muted-foreground ml-1">({currentVehicle.reviewCount} reviews)</span>
            </div>
          </div>
          
          {/* Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About this {currentVehicle.type}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{currentVehicle.description}</p>
              
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                {currentVehicle.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {currentVehicle.specifications && (
                <>
                  <h4 className="font-semibold mb-2">Specifications:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentVehicle.type === 'car' ? (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Make</p>
                          <p className="font-medium">{currentVehicle.specifications.make}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Model</p>
                          <p className="font-medium">{currentVehicle.specifications.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Year</p>
                          <p className="font-medium">{currentVehicle.specifications.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Transmission</p>
                          <p className="font-medium capitalize">{currentVehicle.specifications.transmission}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Seats</p>
                          <p className="font-medium">{currentVehicle.specifications.seats}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fuel Type</p>
                          <p className="font-medium capitalize">{currentVehicle.specifications.fuelType}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Make</p>
                          <p className="font-medium">{currentVehicle.specifications.make}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Model</p>
                          <p className="font-medium">{currentVehicle.specifications.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Year</p>
                          <p className="font-medium">{currentVehicle.specifications.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium">{currentVehicle.specifications.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Gears</p>
                          <p className="font-medium">{currentVehicle.specifications.gears}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Electric</p>
                          <p className="font-medium">{currentVehicle.specifications.electric ? 'Yes' : 'No'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Owner Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={currentVehicle.owner.imageUrl} alt={currentVehicle.owner.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-lg">{currentVehicle.owner.name}</h4>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" fill="#f59e0b" />
                    <span className="text-sm font-medium">{currentVehicle.owner.rating}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Responds within {100 - currentVehicle.owner.responseRate}h
                    </span>
                  </div>
                </div>
              </div>
              <Button className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Owner
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: Booking Form */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>
                <span className="text-2xl font-bold">₹{currentVehicle.price}</span>
                <span className="text-gray-600">/{currentVehicle.priceUnit}</span>
              </CardTitle>
              <CardDescription>Book this {currentVehicle.type} now</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookingSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Dates</label>
                    <div className="space-y-2">
                      <div className="w-full">
                        <div className="border border-input rounded-md p-2">
                          <label className="block text-sm text-muted-foreground mb-1">Start Date</label>
                          <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            // minDate={new Date()}
                            // maxDate={currentVehicle?.availability?.endDate ? new Date(currentVehicle.availability.endDate) : undefined}
                            dateFormat="MMMM d, yyyy"
                            placeholderText="Select start date"
                            className="w-full border-none p-0 focus:ring-0 focus:outline-none"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                          />
                        </div>
                      </div>
                      
                      <div className="w-full">
                        <div className="border border-input rounded-md p-2">
                          <label className="block text-sm text-muted-foreground mb-1">End Date</label>
                          <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            // minDate={startDate || new Date()}
                            // maxDate={currentVehicle?.availability?.endDate ? new Date(currentVehicle.availability.endDate) : undefined}
                            dateFormat="MMMM d, yyyy"
                            placeholderText="Select end date"
                            className="w-full border-none p-0 focus:ring-0 focus:outline-none"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message to Owner (Optional)</label>
                    <Textarea 
                      placeholder="Any special requests or questions for the owner?"
                      value={bookingMessage}
                      onChange={(e) => setBookingMessage(e.target.value)}
                      className="resize-none h-24"
                    />
                  </div>

                  {startDate && endDate && (
                    <div className="text-sm">
                      <div className="flex justify-between mb-2">
                        <span>Daily rate:</span>
                        <span>₹{currentVehicle?.price} per {currentVehicle?.priceUnit}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₹{currentVehicle?.price * calculateDays(startDate, endDate)}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-4"
                  disabled={isSubmitting || currentVehicle?.owner?.id === user?.id}
                >
                  {isSubmitting ? 'Submitting...' : 'Book Now'}
                </Button>
                
                {currentVehicle?.owner?.id === user?.id && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    You cannot book your own vehicle
                  </p>
                )}
              </form>
            </CardContent>
            <Separator />
            <CardFooter className="flex flex-col items-start pt-4">
              <div className="flex items-center mb-2 w-full">
                <Shield className="h-5 w-5 text-blue-500 mr-2" />
                <div className="flex-1">
                  <h4 className="font-medium">Secure booking</h4>
                  <p className="text-xs text-muted-foreground">Your payment is protected</p>
                </div>
              </div>
              <div className="flex items-center w-full">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <div className="flex-1">
                  <h4 className="font-medium">Flexible cancellation</h4>
                  <p className="text-xs text-muted-foreground">Free cancellation up to 24h before</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;

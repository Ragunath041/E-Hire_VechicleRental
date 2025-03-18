import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/contexts/VehicleContext';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import VehicleCard from '@/components/VehicleCard';
import {
  Car,
  Bike,
  User,
  Settings,
  Calendar,
  Star,
  DollarSign,
  Plus,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Booking, getOwnerBookings, getUserBookings, updateBookingStatus, updateBookingMessage } from '@/lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { user: authUser, isAuthenticated } = useAuth();
  const { userVehicles, fetchUserVehicles, loading: vehiclesLoading, removeVehicle } = useVehicles();
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState('');
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated from context
    if (isAuthenticated) {
      setIsLoading(false);
      fetchUserVehicles();
      fetchBookings();
    }
  }, [isAuthenticated, fetchUserVehicles]);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const [ownerData, userData] = await Promise.all([
        getOwnerBookings(),
        getUserBookings()
      ]);
      setOwnerBookings(ownerData);
      setUserBookings(userData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  // User data from authentication only
  const user = {
    name: authUser?.name || "User",
    email: authUser?.email || "user@example.com",
  };

  // Add a function to navigate to list vehicle page
  const handleAddVehicle = () => {
    navigate('/list-vehicle');
  };

  // Add a function to handle vehicle editing
  const handleEditVehicle = (id: string) => {
    navigate(`/list-vehicle?edit=${id}`);
  };

  // Add a function to handle vehicle deletion
  const handleDeleteVehicle = async (id: string) => {
    try {
      await removeVehicle(id);
      toast({
        title: "Vehicle deleted!",
        description: "Your vehicle has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error deleting vehicle",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleBookingAction = async (bookingId: string, status: 'approved' | 'declined' | 'completed') => {
    setActionLoading(true);
    try {
      await updateBookingStatus(bookingId, status);
      // Refresh bookings
      fetchBookings();
      toast({
        title: "Booking updated!",
        description: `The booking has been ${status} successfully.`,
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error updating booking",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedBooking || !message.trim()) {
      return;
    }
    
    setActionLoading(true);
    try {
      await updateBookingMessage(selectedBooking.id, message);
      // Refresh bookings
      fetchBookings();
      toast({
        title: "Message sent!",
        description: "Your message has been sent successfully.",
      });
      setMessage('');
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Add a new TabsContent for user vehicles
  // This should be inside the Tabs component in your render
  const renderUserVehiclesTab = () => (
    <TabsContent value="vehicles" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Vehicles</h2>
        <Button onClick={handleAddVehicle} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Button>
      </div>
      
      {vehiclesLoading ? (
        <div className="text-center py-8">Loading your vehicles...</div>
      ) : userVehicles.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/50">
          <Car className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No vehicles listed yet</h3>
          <p className="text-muted-foreground mb-4">Start earning by sharing your vehicles.</p>
          <Button onClick={handleAddVehicle}>List a Vehicle</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userVehicles.map(vehicle => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              isOwner={true}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
            />
          ))}
        </div>
      )}
    </TabsContent>
  );

  // Render bookings tab
  const renderBookingsTab = () => (
    <TabsContent value="bookings" className="space-y-4">
      <Tabs defaultValue="received">
        <TabsList className="mb-4">
          <TabsTrigger value="received">Bookings Received</TabsTrigger>
          <TabsTrigger value="made">Your Bookings</TabsTrigger>
        </TabsList>
        
        {/* Bookings Received (as owner) */}
        <TabsContent value="received" className="space-y-4">
          <h2 className="text-xl font-bold">Booking Requests for Your Vehicles</h2>
          
          {bookingsLoading ? (
            <div className="text-center py-8">Loading bookings...</div>
          ) : ownerBookings.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/50">
              <Calendar className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No booking requests yet</h3>
              <p className="text-muted-foreground mb-4">You haven't received any booking requests for your vehicles yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ownerBookings.map(booking => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4">
                      <img 
                        src={booking.vehicleImage} 
                        alt={booking.vehicleTitle} 
                        className="h-32 md:h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{booking.vehicleTitle}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          </div>
                        </div>
                        <div className="md:text-right">
                          <Badge 
                            variant={
                              booking.status === 'approved' ? 'default' :
                              booking.status === 'declined' ? 'destructive' :
                              booking.status === 'completed' ? 'secondary' : 'outline'
                            }
                            className="mb-2"
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <p className="text-lg font-bold">₹{booking.totalPrice}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {booking.renterName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{booking.renterName}</p>
                          <p className="text-xs text-muted-foreground">{booking.renterEmail}</p>
                        </div>
                      </div>
                      
                      {booking.message && (
                        <div className="bg-muted/50 p-3 rounded-md mb-4">
                          <p className="text-sm text-muted-foreground">{booking.message}</p>
                        </div>
                      )}
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            onClick={() => handleBookingAction(booking.id, 'approved')}
                            disabled={actionLoading}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleBookingAction(booking.id, 'declined')}
                            disabled={actionLoading}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="h-4 w-4" />
                            Decline
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setMessage(booking.message);
                                }}
                                className="flex items-center gap-1 ml-auto"
                              >
                                <MessageCircle className="h-4 w-4" />
                                Send Message
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Message to {booking.renterName}</DialogTitle>
                                <DialogDescription>
                                  Send a message regarding the booking request.
                                </DialogDescription>
                              </DialogHeader>
                              <Textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message here..."
                                className="min-h-[100px]"
                              />
                              <DialogFooter>
                                <Button onClick={handleSendMessage} disabled={actionLoading}>
                                  Send Message
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      
                      {booking.status === 'approved' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            onClick={() => handleBookingAction(booking.id, 'completed')}
                            disabled={actionLoading}
                          >
                            Mark as Completed
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setMessage(booking.message);
                                }}
                                className="flex items-center gap-1 ml-auto"
                              >
                                <MessageCircle className="h-4 w-4" />
                                Send Message
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Message to {booking.renterName}</DialogTitle>
                                <DialogDescription>
                                  Send a message regarding the booking.
                                </DialogDescription>
                              </DialogHeader>
                              <Textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message here..."
                                className="min-h-[100px]"
                              />
                              <DialogFooter>
                                <Button onClick={handleSendMessage} disabled={actionLoading}>
                                  Send Message
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Bookings Made (as renter) */}
        <TabsContent value="made" className="space-y-4">
          <h2 className="text-xl font-bold">Your Booking Requests</h2>
          
          {bookingsLoading ? (
            <div className="text-center py-8">Loading your bookings...</div>
          ) : userBookings.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/50">
              <Calendar className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p>
              <Button asChild>
                <a href="/vehicles">Browse Vehicles</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userBookings.map(booking => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4">
                      <img 
                        src={booking.vehicleImage} 
                        alt={booking.vehicleTitle} 
                        className="h-32 md:h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{booking.vehicleTitle}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <CalendarIcon className="h-3 w-3" />
                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          </div>
                        </div>
                        <div className="md:text-right">
                          <Badge 
                            variant={
                              booking.status === 'approved' ? 'default' :
                              booking.status === 'declined' ? 'destructive' :
                              booking.status === 'completed' ? 'secondary' : 'outline'
                            }
                            className="mb-2"
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <p className="text-lg font-bold">₹{booking.totalPrice}</p>
                        </div>
                      </div>
                      
                      {booking.message && (
                        <div className="bg-muted/50 p-3 rounded-md mt-4">
                          <p className="text-sm text-muted-foreground">{booking.message}</p>
                        </div>
                      )}
                      
                      <div className="flex mt-4">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/vehicles/${booking.vehicleId}`)}
                          className="flex items-center gap-1"
                        >
                          View Vehicle
                        </Button>
                        
                        {booking.status === 'pending' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setMessage(booking.message);
                                }}
                                className="flex items-center gap-1 ml-auto"
                              >
                                <MessageCircle className="h-4 w-4" />
                                Send Message
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Message to Booking</DialogTitle>
                                <DialogDescription>
                                  Send a message about your booking request.
                                </DialogDescription>
                              </DialogHeader>
                              <Textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message here..."
                                className="min-h-[100px]"
                              />
                              <DialogFooter>
                                <Button onClick={handleSendMessage} disabled={actionLoading}>
                                  Send Message
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </TabsContent>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-40 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-44 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with User Profile */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to your Dashboard</h2>
            <p>Your account has been created successfully. This is where you'll manage your vehicles and bookings.</p>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{userVehicles.length}</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" onClick={() => handleAddVehicle()}>Add Vehicle</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Booking Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ownerBookings.filter(b => b.status === 'pending').length}</div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    const element = document.querySelector('[data-value="bookings"]');
                    if (element instanceof HTMLElement) {
                      element.click();
                    }
                  }}
                >
                  View Bookings
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{userBookings.length}</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" asChild>
                  <a href="/vehicles">Browse Vehicles</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Vehicles Tab */}
        {renderUserVehiclesTab()}
        
        {/* Bookings Tab */}
        {renderBookingsTab()}
      </Tabs>
    </div>
  );
};

export default Dashboard;

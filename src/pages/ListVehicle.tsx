import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Car, Bike, Upload, Plus, Trash2, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/contexts/VehicleContext';
import { VehicleFormData } from '@/lib/api';

// Create a separate component for the form to avoid conditional hooks
const VehicleForm = () => {
  const { addNewVehicle, updateExistingVehicle, fetchVehicleById } = useVehicles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;
  
  // All state declarations
  const [vehicleType, setVehicleType] = useState<'car' | 'bike'>('car');
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [formStep, setFormStep] = useState(1);
  const maxSteps = 3;

  // Vehicle fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [priceUnit, setPriceUnit] = useState<'hour' | 'day'>('day');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Car specific fields
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | undefined>(undefined);
  const [transmission, setTransmission] = useState<'automatic' | 'manual'>('automatic');
  const [seats, setSeats] = useState<number | undefined>(undefined);
  const [fuelType, setFuelType] = useState('');
  const [mileage, setMileage] = useState<number | undefined>(undefined);
  
  // Bike specific fields
  const [bikeType, setBikeType] = useState('');
  const [gears, setGears] = useState<number | undefined>(undefined);
  const [isElectric, setIsElectric] = useState(false);
  const [brand, setBrand] = useState('');
  const [frameSize, setFrameSize] = useState('');

  // Availability fields
  const [availabilityStart, setAvailabilityStart] = useState('2025-01-01');
  const [availabilityEnd, setAvailabilityEnd] = useState('2025-12-31');

  // Fetch vehicle data if in edit mode
  useEffect(() => {
    const loadVehicleData = async () => {
      if (isEditing && editId) {
        setLoading(true);
        try {
          const vehicle = await fetchVehicleById(editId);
          // Populate form with vehicle data
          setVehicleType(vehicle.type);
          setTitle(vehicle.title);
          setDescription(vehicle.description);
          setPrice(vehicle.price);
          setPriceUnit(vehicle.priceUnit || 'day');
          setLocation(vehicle.location);
          setFeatures(vehicle.features || []);
          
          // Handle image
          if (vehicle.imageUrl) {
            setImages([vehicle.imageUrl]);
          }
        } catch (error) {
          console.error('Error loading vehicle data:', error);
          toast({
            title: "Error loading vehicle data",
            description: "Could not load the vehicle for editing.",
            variant: "destructive",
          });
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadVehicleData();
  }, [editId, isEditing, fetchVehicleById, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages([...images, reader.result]);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() !== '') {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Check if all required fields are filled
    if (!title || !description || !price || !location || images.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and upload at least one image.",
        variant: "destructive",
      });
      return;
    }
    
    // Format the vehicle data
    const vehicleData: VehicleFormData = {
      type: vehicleType,
      title,
      description,
      price,
      priceUnit,
      location,
      features,
      // Use the first image as the main image - it's already base64 encoded
      imageUrl: images[0],
      ...(vehicleType === 'car' && {
        carDetails: {
          make,
          model,
          year,
          transmission,
          seats,
          fuelType,
          mileage,
        }
      }),
      ...(vehicleType === 'bike' && {
        bikeDetails: {
          brand,
          frameSize,
          bikeType,
          gears,
        }
      }),
      availability: {
        startDate: availabilityStart,
        endDate: availabilityEnd,
      }
    };
    
    try {
      if (isEditing && editId) {
        // Update existing vehicle
        await updateExistingVehicle(editId, vehicleData);
        toast({
          title: "Vehicle updated!",
          description: "Your vehicle has been updated successfully.",
        });
      } else {
        // Create new vehicle
        await addNewVehicle(vehicleData);
        toast({
          title: "Vehicle listed!",
          description: "Your vehicle has been listed successfully.",
        });
      }
      
      // Return to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Error saving vehicle",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (formStep < maxSteps) {
      setFormStep(formStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Your Vehicle" : "List Your Vehicle"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditing 
              ? "Update your vehicle's information below." 
              : "Share your car or bike with others and earn money when they rent it."}
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            {[...Array(maxSteps)].map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formStep > index + 1 
                      ? 'bg-green-500 text-white' 
                      : formStep === index + 1 
                        ? 'bg-brand-blue text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {formStep > index + 1 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm mt-1">
                  {index === 0 ? 'Basic Info' : index === 1 ? 'Details' : 'Photos & Features'}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
            </div>
            <div className="absolute inset-0 flex items-center">
              <div 
                className="h-1 bg-brand-blue rounded transition-all"
                style={{ width: `${((formStep - 1) / (maxSteps - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {formStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label className="text-base">Vehicle Type</Label>
                <RadioGroup
                  value={vehicleType}
                  onValueChange={(value: 'car' | 'bike') => setVehicleType(value)}
                  className="flex flex-col space-y-3 mt-2"
                >
                  <div className="flex items-center space-x-3 border rounded-md p-4">
                    <RadioGroupItem value="car" id="car" />
                    <Label htmlFor="car" className="flex items-center cursor-pointer">
                      <Car className="h-5 w-5 mr-2 text-brand-blue" />
                      <div>
                        <span className="font-medium">Car</span>
                        <p className="text-sm text-muted-foreground">List your car, SUV, truck, or van</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-md p-4">
                    <RadioGroupItem value="bike" id="bike" />
                    <Label htmlFor="bike" className="flex items-center cursor-pointer">
                      <Bike className="h-5 w-5 mr-2 text-brand-green" />
                      <div>
                        <span className="font-medium">Bike</span>
                        <p className="text-sm text-muted-foreground">List your bicycle, e-bike, or scooter</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder={vehicleType === 'car' ? "e.g., Tesla Model 3 - Electric Sedan" : "e.g., Trek FX 3 - Urban Commuter Bike"}
                  className="mt-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Be descriptive - include make, model, and a key feature
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your vehicle, its condition, and what makes it special..."
                  className="mt-1 min-h-[150px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Mumbai"
                  className="mt-1"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="button" onClick={nextStep}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Pricing and Availability */}
          {formStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="price-unit">Per</Label>
                  <Select defaultValue="day" value={priceUnit} onValueChange={(value) => setPriceUnit(value as 'hour' | 'day')}>
                    <SelectTrigger id="price-unit" className="mt-1">
                      <SelectValue placeholder="Select pricing unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availability-start">Available From</Label>
                  <Input
                    id="availability-start"
                    type="date"
                    className="mt-1"
                    min={new Date().toISOString().split('T')[0]}
                    value={availabilityStart}
                    onChange={(e) => setAvailabilityStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="availability-end">Available Until</Label>
                  <Input
                    id="availability-end"
                    type="date"
                    className="mt-1"
                    min={availabilityStart || new Date().toISOString().split('T')[0]}
                    value={availabilityEnd}
                    onChange={(e) => setAvailabilityEnd(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              {vehicleType === 'car' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        placeholder="e.g., Toyota"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g., Corolla"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={year || ''}
                        onChange={(e) => setYear(Number(e.target.value))}
                        placeholder="e.g., 2023"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transmission">Transmission</Label>
                      <Select
                        value={transmission}
                        onValueChange={(value: 'automatic' | 'manual') => setTransmission(value)}
                      >
                        <SelectTrigger id="transmission">
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seats">Number of Seats</Label>
                      <Input
                        id="seats"
                        type="number"
                        value={seats || ''}
                        onChange={(e) => setSeats(Number(e.target.value))}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuelType">Fuel Type</Label>
                      <Input
                        id="fuelType"
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        placeholder="e.g., Petrol"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage (km)</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={mileage || ''}
                      onChange={(e) => setMileage(Number(e.target.value))}
                      placeholder="e.g., 15000"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g., Trek"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bikeType">Type</Label>
                      <Input
                        id="bikeType"
                        value={bikeType}
                        onChange={(e) => setBikeType(e.target.value)}
                        placeholder="e.g., Mountain Bike"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frameSize">Frame Size</Label>
                      <Input
                        id="frameSize"
                        value={frameSize}
                        onChange={(e) => setFrameSize(e.target.value)}
                        placeholder="e.g., Medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gears">Number of Gears</Label>
                      <Input
                        id="gears"
                        type="number"
                        value={gears || ''}
                        onChange={(e) => setGears(Number(e.target.value))}
                        placeholder="e.g., 21"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isElectric"
                        checked={isElectric}
                        onChange={(e) => setIsElectric(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="isElectric">Electric Bike</Label>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button type="button" onClick={nextStep}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Photos and Features */}
          {formStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label>Photos</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Add photos of your vehicle. High-quality images increase booking chances.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Vehicle image ${index + 1}`} 
                        className="h-32 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <Label htmlFor="image-upload" className="cursor-pointer text-center p-4 flex flex-col items-center">
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Upload Image</span>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Features</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  List key features that make your vehicle special.
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    className="flex-1"
                  />
                  <Button type="button" size="icon" onClick={handleAddFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full flex items-center group"
                    >
                      <span className="text-sm">{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="ml-2 rounded-full h-4 w-4 flex items-center justify-center hover:bg-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button type="submit">
                  {isEditing ? "Update Vehicle" : "List Vehicle"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Main component that checks authentication and renders the form
const ListVehicle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to add a vehicle.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return <VehicleForm />;
};

export default ListVehicle;

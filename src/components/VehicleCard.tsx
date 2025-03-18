import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Car, Bike, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/data/mockData";

interface VehicleCardProps {
  vehicle: Vehicle; // Using Vehicle interface from mockData.ts
  onClick?: () => void;
  isOwner?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const VehicleCard = ({ 
  vehicle, 
  onClick, 
  isOwner = false,
  onEdit,
  onDelete
}: VehicleCardProps) => {
  // Extract properties with fallbacks for missing data
  const { 
    id, 
    type, 
    title, 
    price, 
    priceUnit = "day", 
    location, 
    imageUrl, 
    rating = 4.5, 
    reviewCount = 0 
  } = vehicle;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit && id) onEdit(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && id) onDelete(id);
  };

  // Skip rendering if essential data is missing
  if (!id || !title || !imageUrl) {
    return null;
  }

  return (
    <Link to={`/vehicles/${id}`}>
      <Card className="vehicle-card h-full cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Badge 
            variant="secondary" 
            className="absolute top-3 left-3 flex items-center gap-1"
          >
            {type === 'car' ? <Car className="h-3 w-3" /> : <Bike className="h-3 w-3" />}
            {type === 'car' ? 'Car' : 'Bike'}
          </Badge>
          
          {isOwner && (
            <div className="absolute top-3 right-3 flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 bg-white/80 hover:bg-white"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 bg-white/80 hover:bg-white text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm flex items-center text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {location || "Location not specified"}
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{rating}</span>
              <span className="text-xs text-muted-foreground ml-1">({reviewCount})</span>
            </div>
          </div>
          <h3 className="font-semibold text-lg line-clamp-1 mb-2">{title}</h3>
          <div className="flex items-end justify-between">
            <div>
              <span className="font-bold text-lg">₹{price}</span>
              <span className="text-muted-foreground">/{priceUnit}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default VehicleCard;

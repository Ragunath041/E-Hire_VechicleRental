from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import pymongo
from bson.objectid import ObjectId
import bcrypt
import jwt
from datetime import datetime, timedelta
import json

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, 
     resources={r"/*": {
         "origins": "*",
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization", "Accept"]
     }})

# MongoDB connection
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client.get_database("wheelshare")
users_collection = db.get_collection("users")
vehicles_collection = db.get_collection("vachile")
bookings_collection = db.get_collection("bookings")  # Add bookings collection

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXPIRATION_HOURS = 24

# Authentication middleware
def authenticate(f):
    def wrapper(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Authentication token is missing'}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Find user
        user = users_collection.find_one({'_id': ObjectId(payload['sub'])})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Add user to request context
        kwargs['user'] = {
            'id': str(user['_id']),
            'email': user['email'],
            'name': user['name']
        }
        
        return f(*args, **kwargs)
    
    wrapper.__name__ = f.__name__
    return wrapper


# Helper function to format a vehicle document to JSON response
def format_vehicle(vehicle):
    return {
        "id": str(vehicle["_id"]),
        "type": vehicle["type"],
        "title": vehicle["title"],
        "description": vehicle["description"],
        "price": vehicle["price"],
        "priceUnit": vehicle["priceUnit"],
        "location": vehicle["location"],
        "imageUrl": vehicle["imageUrl"],
        "features": vehicle["features"],
        "availability": vehicle["availability"],
        "specifications": vehicle.get("specifications", {}),
        "owner": vehicle["owner"],
        "createdAt": vehicle.get("createdAt", datetime.now().isoformat()),
        "rating": vehicle.get("rating", 4.5),
        "reviewCount": vehicle.get("reviewCount", 0)
    }

# Authentication helper functions
def hash_password(password):
    """Hash a password for storing."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt)


def verify_password(stored_password, provided_password):
    """Verify a stored password against a provided password."""
    return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)


def generate_token(user_id, email):
    """Generate a JWT token."""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'sub': str(user_id),
        'email': email,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def verify_token(token):
    """Verify a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# API Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    
    # Check if user already exists
    if users_collection.find_one({'email': email}):
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create new user
    hashed_password = hash_password(password)
    user_id = users_collection.insert_one({
        'name': name,
        'email': email,
        'password': hashed_password,
        'created_at': datetime.utcnow()
    }).inserted_id
    
    # Generate token
    token = generate_token(user_id, email)
    
    return jsonify({
        'message': 'User registered successfully',
        'token': token
    }), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate input
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user
    user = users_collection.find_one({'email': email})
    
    if not user or not verify_password(user['password'], password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate token
    token = generate_token(user['_id'], email)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'name': user['name'],
            'email': user['email']
        }
    }), 200


@app.route('/api/verify-token', methods=['POST'])
def verify():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Token is required'}), 400
    
    payload = verify_token(token)
    
    if not payload:
        return jsonify({'error': 'Invalid or expired token'}), 401
    
    # Find user
    user = users_collection.find_one({'_id': ObjectId(payload['sub'])})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'valid': True,
        'user': {
            'name': user['name'],
            'email': user['email']
        }
    }), 200


# Vehicle API Routes
@app.route('/api/vehicles', methods=['POST'])
@authenticate
def add_vehicle(user):
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['type', 'title', 'description', 'price', 'priceUnit', 
                      'location', 'imageUrl', 'features', 'availability']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Field {field} is required'}), 400
    
    # Create new vehicle document
    vehicle = {
        'type': data['type'],
        'title': data['title'],
        'description': data['description'],
        'price': data['price'],
        'priceUnit': data['priceUnit'],
        'location': data['location'],
        'imageUrl': data['imageUrl'],
        'rating': 0,  # New vehicles start with no ratings
        'reviewCount': 0,
        'features': data['features'],
        'owner': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'rating': 4.5,  # Default owner rating
            'imageUrl': "https://randomuser.me/api/portraits/men/32.jpg",  # Default image
            'responseRate': 95
        },
        'availability': data['availability'],
        'specifications': data.get('specifications', {}),
        'createdAt': datetime.utcnow()
    }
    
    # Insert into database
    result = vehicles_collection.insert_one(vehicle)
    
    # Get the inserted document with ID
    inserted_vehicle = vehicles_collection.find_one({'_id': result.inserted_id})
    
    return jsonify(format_vehicle(inserted_vehicle)), 201


@app.route('/api/vehicles', methods=['GET'])
def get_all_vehicles():
    # Get query parameters for filtering
    vehicle_type = request.args.get('type')
    location = request.args.get('location')
    price_min = request.args.get('priceMin')
    price_max = request.args.get('priceMax')
    
    # Build query
    query = {}
    
    if vehicle_type:
        query['type'] = vehicle_type
    
    if location:
        query['location'] = {'$regex': location, '$options': 'i'}  # Case-insensitive search
    
    if price_min or price_max:
        price_query = {}
        if price_min:
            price_query['$gte'] = float(price_min)
        if price_max:
            price_query['$lte'] = float(price_max)
        if price_query:
            query['price'] = price_query
    
    # Execute query
    vehicles = list(vehicles_collection.find(query).sort('createdAt', -1))
    
    # Format response
    formatted_vehicles = [format_vehicle(vehicle) for vehicle in vehicles]
    
    return jsonify(formatted_vehicles), 200


@app.route('/api/vehicles/<vehicle_id>', methods=['GET'])
def get_vehicle(vehicle_id):
    try:
        vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle_id)})
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        return jsonify(format_vehicle(vehicle)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/vehicles/<vehicle_id>', methods=['PUT'])
@authenticate
def update_vehicle(vehicle_id, user):
    try:
        data = request.get_json()
        vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle_id)})
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        # Check if user is the owner
        if vehicle['owner']['id'] != user['id']:
            return jsonify({'error': 'Unauthorized to update this vehicle'}), 403
        
        # Update fields that are provided
        update_data = {}
        allowed_fields = ['type', 'title', 'description', 'price', 'priceUnit', 
                         'location', 'imageUrl', 'features', 'availability', 'specifications']
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        # Add updated timestamp
        update_data['updatedAt'] = datetime.utcnow()
        
        # Update the document
        vehicles_collection.update_one(
            {'_id': ObjectId(vehicle_id)},
            {'$set': update_data}
        )
        
        # Get the updated document
        updated_vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle_id)})
        
        return jsonify(format_vehicle(updated_vehicle)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/vehicles/<vehicle_id>', methods=['DELETE'])
@authenticate
def delete_vehicle(vehicle_id, user):
    try:
        vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle_id)})
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        # Check if user is the owner
        if vehicle['owner']['id'] != user['id']:
            return jsonify({'error': 'Unauthorized to delete this vehicle'}), 403
        
        # Delete the vehicle
        vehicles_collection.delete_one({'_id': ObjectId(vehicle_id)})
        
        return jsonify({'success': True, 'message': 'Vehicle deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/user/vehicles', methods=['GET'])
@authenticate
def get_user_vehicles(user):
    # Get the user's vehicles
    vehicles = list(vehicles_collection.find({'owner.id': user['id']}).sort('createdAt', -1))
    
    # Format response
    formatted_vehicles = [format_vehicle(vehicle) for vehicle in vehicles]
    
    return jsonify(formatted_vehicles), 200


@app.route('/api/vehicles/search', methods=['GET'])
def search_vehicles():
    query = request.args.get('q', '')
    
    if not query:
        return jsonify([]), 200
    
    # Search across multiple fields
    search_query = {
        '$or': [
            {'title': {'$regex': query, '$options': 'i'}},
            {'description': {'$regex': query, '$options': 'i'}},
            {'location': {'$regex': query, '$options': 'i'}}
        ]
    }
    
    vehicles = list(vehicles_collection.find(search_query).sort('createdAt', -1))
    formatted_vehicles = [format_vehicle(vehicle) for vehicle in vehicles]
    
    return jsonify(formatted_vehicles), 200


# Add a route for filtering vehicles that redirects to the same function as get_all_vehicles
@app.route('/api/vehicles/filter', methods=['GET'])
def filter_vehicles():
    return get_all_vehicles()

# Format booking document for JSON response
def format_booking(booking):
    return {
        "id": str(booking["_id"]),
        "vehicleId": booking["vehicleId"],
        "vehicleTitle": booking.get("vehicleTitle", ""),
        "vehicleImage": booking.get("vehicleImage", ""),
        "renterId": booking["renterId"],
        "renterName": booking.get("renterName", ""),
        "renterEmail": booking.get("renterEmail", ""),
        "startDate": booking["startDate"],
        "endDate": booking["endDate"],
        "totalPrice": booking["totalPrice"],
        "status": booking["status"],
        "createdAt": booking.get("createdAt", datetime.now().isoformat()),
        "message": booking.get("message", "")
    }

# Booking endpoints
@app.route('/api/bookings', methods=['POST'])
@authenticate
def create_booking(user):
    try:
        data = request.get_json()
        required_fields = ['vehicleId', 'startDate', 'endDate']
        
        # Validate required fields
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if vehicle exists
        vehicle = vehicles_collection.find_one({'_id': ObjectId(data['vehicleId'])})
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        # Prevent booking your own vehicle
        if vehicle['owner']['id'] == user['id']:
            return jsonify({'error': 'You cannot book your own vehicle'}), 400
            
        # Calculate total price
        start_date = datetime.fromisoformat(data['startDate'].replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(data['endDate'].replace('Z', '+00:00'))
        days = (end_date - start_date).days + 1
        
        if days < 1:
            return jsonify({'error': 'Invalid booking dates'}), 400
            
        total_price = vehicle['price'] * days
        
        # Create booking document
        booking = {
            'vehicleId': data['vehicleId'],
            'vehicleTitle': vehicle['title'],
            'vehicleImage': vehicle['imageUrl'],
            'renterId': user['id'],
            'renterName': user['name'],
            'renterEmail': user['email'],
            'ownerId': vehicle['owner']['id'],
            'ownerName': vehicle['owner']['name'],
            'startDate': data['startDate'],
            'endDate': data['endDate'],
            'totalPrice': total_price,
            'status': 'pending',  # pending, approved, declined, completed
            'createdAt': datetime.now().isoformat(),
            'message': data.get('message', '')
        }
        
        result = bookings_collection.insert_one(booking)
        booking['_id'] = result.inserted_id
        
        return jsonify(format_booking(booking)), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/bookings/user', methods=['GET'])
@authenticate
def get_user_bookings(user):
    try:
        # Get bookings where the user is the renter
        bookings = list(bookings_collection.find({'renterId': user['id']}).sort('createdAt', -1))
        formatted_bookings = [format_booking(booking) for booking in bookings]
        
        return jsonify(formatted_bookings), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/bookings/owner', methods=['GET'])
@authenticate
def get_owner_bookings(user):
    try:
        # Get bookings for vehicles owned by the user
        bookings = list(bookings_collection.find({'ownerId': user['id']}).sort('createdAt', -1))
        formatted_bookings = [format_booking(booking) for booking in bookings]
        
        return jsonify(formatted_bookings), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/bookings/<booking_id>/status', methods=['PUT'])
@authenticate
def update_booking_status(booking_id, user):
    try:
        data = request.get_json()
        if 'status' not in data:
            return jsonify({'error': 'Missing status field'}), 400
            
        status = data['status']
        if status not in ['approved', 'declined', 'completed']:
            return jsonify({'error': 'Invalid status value'}), 400
        
        # Find the booking
        booking = bookings_collection.find_one({'_id': ObjectId(booking_id)})
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
            
        # Check if user is the owner of the vehicle
        if booking['ownerId'] != user['id']:
            return jsonify({'error': 'You are not authorized to update this booking'}), 403
            
        # Update the booking status
        bookings_collection.update_one(
            {'_id': ObjectId(booking_id)},
            {'$set': {'status': status}}
        )
        
        # Get the updated booking
        updated_booking = bookings_collection.find_one({'_id': ObjectId(booking_id)})
        
        return jsonify(format_booking(updated_booking)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/bookings/<booking_id>/message', methods=['PUT'])
@authenticate
def add_booking_message(booking_id, user):
    try:
        data = request.get_json()
        if 'message' not in data:
            return jsonify({'error': 'Missing message field'}), 400
            
        # Find the booking
        booking = bookings_collection.find_one({'_id': ObjectId(booking_id)})
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
            
        # Check if user is either the owner or renter
        if booking['ownerId'] != user['id'] and booking['renterId'] != user['id']:
            return jsonify({'error': 'You are not authorized to add a message to this booking'}), 403
            
        # Update the booking message
        bookings_collection.update_one(
            {'_id': ObjectId(booking_id)},
            {'$set': {'message': data['message']}}
        )
        
        # Get the updated booking
        updated_booking = bookings_collection.find_one({'_id': ObjectId(booking_id)})
        
        return jsonify(format_booking(updated_booking)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Main entry point
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port) 
# WheelShare Backend

This is the backend API for the WheelShare Hub application.

## Technologies Used

- Flask (Python web framework)
- MongoDB (NoSQL database)
- JWT for authentication
- bcrypt for password hashing

## Setup Instructions

1. Install MongoDB on your local machine
   - The database will be created automatically when you first connect
   - No need to manually create the database
2. Create a virtual environment:
   ```
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
5. Copy `.env.example` to `.env` and update the values if needed
   - The default settings will work for local development
   - The FRONTEND_URL is set to "*" to allow requests from any origin
6. Run the server:
   ```
   python app.py
   ```

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user
- `POST /api/verify-token` - Verify a JWT token

## Development

The server runs on `http://localhost:5000` by default. 
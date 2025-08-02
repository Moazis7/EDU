EduBack - Backend API
📋 Overview
Backend API for an educational platform built using Node.js, Express, and MongoDB.

🚀 Features
✅ User registration & login system

✅ Role management (User/Admin)

✅ Upload & manage educational files

✅ Content categories system

✅ Shopping cart

✅ Content search

✅ JWT authentication system

✅ Rate limiting

✅ Logging system

🛠️ Technologies Used
Node.js – Runtime Environment

Express.js – Web Framework

MongoDB – Database

Mongoose – ODM

JWT – Authentication

bcrypt – Password Hashing

multer – File Upload

winston – Logging

helmet – Security

cors – Cross-Origin Resource Sharing

📦 Installation & Setup
Requirements
Node.js (v14 or higher)

MongoDB

npm or yarn

Installation Steps
Clone the repository:

bash
Copy
Edit
git clone <repository-url>
cd eduback
Install dependencies:

bash
Copy
Edit
npm install
Set up environment variables:

bash
Copy
Edit
# Copy the configuration file
cp config.env.example config.env
# Edit the variables as needed
Start the database:

bash
Copy
Edit
# Make sure MongoDB is running
mongod
Run the server:

bash
Copy
Edit
# Development mode
npm run dev

# Production mode
npm start
🔧 Configuration
Environment Variables
env
Copy
Edit
# Server Configuration
PORT=3009
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost/EDU1

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload Configuration
MAX_FILE_SIZE=1073741824
UPLOAD_PATH=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
📚 API Endpoints
Authentication
POST /api/auth – Login

POST /api/auth/logout – Logout

GET /api/auth/verify – Verify token

Users
POST /api/user – Register a new user

GET /api/user/me – Get current user data

GET /api/user/all – Get all users (Admin only)

Files/Courses
POST /api/upload/upload – Upload files (Admin only)

GET /api/upload/files – Get all files

GET /api/upload/my-files – Get user’s files

GET /api/upload/category/:category – Get files by category

GET /api/upload/files/stream/:id – Stream a file

DELETE /api/upload/files/:id – Delete a file (Admin only)

Categories
GET /api/category – Get all categories

POST /api/category – Create a new category

GET /api/category/:category – Get specific category

PUT /api/category/:id – Update category

DELETE /api/category/:id – Delete category

Cart
POST /api/cart/cart – Add to cart

GET /api/cart/cart – Get cart contents

DELETE /api/cart/cart/:id – Remove from cart

Search
GET /api/search?query=searchTerm – Search content

🔒 Security
JWT Authentication

Password hashing with bcrypt

Rate limiting

CORS protection

Helmet security headers

Input validation with Joi

📝 Logging
Logs are stored in:

logs/error.log – Errors only

logs/combined.log – All logs

🐛 Troubleshooting
Common Issues
Database connection error

Make sure MongoDB is running

Check the MONGODB_URI value

Authentication error

Verify JWT_SECRET is correct

Ensure token is sent in the y-auth-token header

File upload error

Ensure the uploads folder exists

Check file size (Max 1GB)

📈 Future Improvements
 Add Redis for caching

 Add WebSocket for real-time messaging

 Add notifications system

 Add API documentation with Swagger

 Add unit tests

 Add Docker support

🤝 Contribution
Fork the repository

Create a new branch

Make your changes

Add tests

Create a pull request

📄 License
ISC License

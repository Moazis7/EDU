# 🎓 Educational Platform Backend - Professional Architecture

## 🚀 Overview

A professional educational platform backend built with Node.js, Express, and MongoDB using modern design patterns and clean architecture principles.

## 🏗️ Architecture

This project implements several design patterns:

- **Repository Pattern** - Data access abstraction
- **Service Layer Pattern** - Business logic separation
- **Controller Pattern** - HTTP request handling
- **Dependency Injection** - Loose coupling
- **Factory Pattern** - Object creation

## 📁 Project Structure

```
src/
├── app.js                    # Main application class
├── server.js                 # Server entry point
├── controllers/              # HTTP request handlers
│   ├── BaseController.js
│   └── UserController.js
├── services/                 # Business logic layer
│   ├── BaseService.js
│   └── UserService.js
├── repositories/             # Data access layer
│   ├── BaseRepository.js
│   ├── UserRepository.js
│   └── CourseRepository.js
├── container/                # Dependency injection
│   ├── DIContainer.js
│   └── ServiceRegistry.js
├── factories/                # Object creation patterns
│   └── ResponseFactory.js
├── routes/                   # Route definitions
│   └── userRoutes.js
├── middleware/               # Express middleware
├── models/                   # Database models
└── utils/                    # Utility functions
```

## 🛠️ Features

- ✅ **User Management** - Registration, authentication, profile management
- ✅ **Course Management** - Upload, categorize, and manage educational content
- ✅ **Role-based Access Control** - Admin and user roles
- ✅ **File Upload** - Support for videos, images, and documents
- ✅ **Search & Filter** - Advanced search capabilities
- ✅ **Payment Integration** - Course purchase system
- ✅ **Security** - JWT authentication, rate limiting, CORS
- ✅ **Professional Architecture** - Clean code, design patterns

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 6.0
- npm >= 8.0.0

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/edu-backend.git
cd edu-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp config.env.example config.env
# Edit config.env with your configuration
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t edu-backend .
docker run -p 3009:3009 edu-backend
```

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/users/register
POST /api/users/login
GET  /api/users/me
PUT  /api/users/profile
PUT  /api/users/change-password
```

### Course Endpoints

```http
GET    /api/courses
POST   /api/courses
GET    /api/courses/:id
PUT    /api/courses/:id
DELETE /api/courses/:id
```

### Admin Endpoints

```http
GET /api/users/all
GET /api/users/admin/stats
PUT /api/users/:id/deactivate
PUT /api/users/:id/activate
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Database

```bash
# Run migrations
npm run migrate

# Seed database
npm run seed
```

## 🐳 Docker

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Production

```bash
# Build production image
docker build -t edu-backend:latest .

# Run production container
docker run -d \
  --name edu-backend \
  -p 3009:3009 \
  -e NODE_ENV=production \
  edu-backend:latest
```

## 📊 Monitoring

### Health Check

```http
GET /api/health
```

### Metrics

- Request rate limiting
- Error logging
- Performance monitoring
- Database connection status

## 🔒 Security

- JWT Authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection

## 📈 Performance

- Connection pooling
- Query optimization
- Caching strategies
- Compression
- Static file serving

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@eduplatform.com
- 📖 Documentation: [docs.eduplatform.com](https://docs.eduplatform.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/edu-backend/issues)

## 🙏 Acknowledgments

- Express.js team
- MongoDB team
- Node.js community
- All contributors

---

**Built with ❤️ using modern architecture patterns** 
const DIContainer = require('./DIContainer');

// Repositories
const UserRepository = require('../repositories/UserRepository');
const CourseRepository = require('../repositories/CourseRepository');

// Services
const UserService = require('../services/UserService');

// Controllers
const UserController = require('../controllers/UserController');

class ServiceRegistry {
  constructor() {
    this.container = new DIContainer();
    this.registerServices();
  }

  registerServices() {
    // تسجيل Repositories
    this.container.registerSingleton('UserRepository', () => {
      return new UserRepository();
    });

    this.container.registerSingleton('CourseRepository', () => {
      return new CourseRepository();
    });

    // تسجيل Services
    this.container.registerSingleton('UserService', (container) => {
      const userRepository = container.resolve('UserRepository');
      return new UserService(userRepository);
    });

    // تسجيل Controllers
    this.container.registerSingleton('UserController', (container) => {
      const userService = container.resolve('UserService');
      return new UserController(userService);
    });
  }

  // Helper method للحصول على controller
  getController(name) {
    return this.container.resolve(name);
  }

  // Helper method للحصول على service
  getService(name) {
    return this.container.resolve(name);
  }

  // Helper method للحصول على repository
  getRepository(name) {
    return this.container.resolve(name);
  }
}

module.exports = ServiceRegistry; 
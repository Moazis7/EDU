const UserService = require('../../../src/services/UserService');
const UserRepository = require('../../../src/repositories/UserRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../../src/repositories/UserRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UserService', () => {
  let userService;
  let mockUserRepository;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create mock repository
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      addPurchasedCourse: jest.fn(),
      getAdminStats: jest.fn(),
      findUsersWithCourses: jest.fn()
    };

    // Create service instance
    userService = new UserService(mockUserRepository);
  });

  describe('registerUser', () => {
    const mockUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890',
      governorate: 'Cairo'
    };

    const mockUser = {
      _id: 'user123',
      ...mockUserData,
      generateAuthToken: jest.fn().mockReturnValue('mock-token')
    };

    it('should register a new user successfully', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockUserRepository.updateById.mockResolvedValue(mockUser);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed-password');

      // Act
      const result = await userService.registerUser(mockUserData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUserData.email);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 'salt');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...mockUserData,
        password: 'hashed-password',
        role: 'user'
      });
      expect(result).toEqual({
        user: {
          _id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          phone: '1234567890',
          governorate: 'Cairo'
        },
        token: 'mock-token'
      });
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue({ email: 'test@example.com' });

      // Act & Assert
      await expect(userService.registerUser(mockUserData))
        .rejects
        .toThrow('Email already exists.');
    });

    it('should throw error for invalid user data', async () => {
      // Arrange
      const invalidData = { email: 'invalid-email' };

      // Act & Assert
      await expect(userService.registerUser(invalidData))
        .rejects
        .toThrow();
    });
  });

  describe('loginUser', () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashed-password',
      isActive: true,
      generateAuthToken: jest.fn().mockReturnValue('new-token')
    };

    it('should login user successfully', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      mockUserRepository.updateById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.loginUser('test@example.com', 'password123');

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(mockUserRepository.updateById).toHaveBeenCalledWith('user123', {
        authToken: 'new-token',
        lastLogin: expect.any(Date)
      });
      expect(result).toEqual({
        user: {
          _id: 'user123',
          email: 'test@example.com'
        },
        token: 'new-token'
      });
    });

    it('should throw error for invalid credentials', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.loginUser('test@example.com', 'wrong-password'))
        .rejects
        .toThrow('Invalid email or password.');
    });

    it('should throw error for inactive account', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findByEmail.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(userService.loginUser('test@example.com', 'password123'))
        .rejects
        .toThrow('Account is deactivated.');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile', async () => {
      // Arrange
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        phone: '1234567890',
        governorate: 'Cairo',
        purchasedCourses: ['course1', 'course2']
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserProfile('user123');

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        phone: '1234567890',
        governorate: 'Cairo',
        purchasedCourses: ['course1', 'course2']
      });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserProfile('nonexistent'))
        .rejects
        .toThrow('User not found.');
    });
  });

  describe('purchaseCourse', () => {
    it('should purchase course successfully', async () => {
      // Arrange
      const mockUser = {
        _id: 'user123',
        purchasedCourses: ['course1']
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.addPurchasedCourse.mockResolvedValue({
        ...mockUser,
        purchasedCourses: ['course1', 'course2']
      });

      // Act
      const result = await userService.purchaseCourse('user123', 'course2');

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
      expect(mockUserRepository.addPurchasedCourse).toHaveBeenCalledWith('user123', 'course2');
      expect(result).toEqual({
        _id: 'user123',
        name: undefined,
        purchasedCourses: ['course1', 'course2']
      });
    });

    it('should throw error if course already purchased', async () => {
      // Arrange
      const mockUser = {
        _id: 'user123',
        purchasedCourses: ['course1']
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.purchaseCourse('user123', 'course1'))
        .rejects
        .toThrow('Course already purchased.');
    });
  });

  describe('getAdminStats', () => {
    it('should return admin statistics', async () => {
      // Arrange
      const mockStats = {
        totalUsers: 100,
        activeUsers: 85
      };
      mockUserRepository.getAdminStats.mockResolvedValue(mockStats);

      // Act
      const result = await userService.getAdminStats();

      // Assert
      expect(mockUserRepository.getAdminStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
}); 
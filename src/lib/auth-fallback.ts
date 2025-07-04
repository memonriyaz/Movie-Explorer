import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

interface UserCredentials {
  email: string;
  password: string;
  name: string;
}

// Mock user database for fallback (in production, use MongoDB)
const users: Map<string, UserCredentials & { id: string; favorites: number[] }> = new Map();

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const registerUser = async (credentials: UserCredentials): Promise<User> => {
  const { email, password, name } = credentials;
  
  // Check if user already exists
  if (users.has(email)) {
    throw new Error('User already exists');
  }
  
  const hashedPassword = await hashPassword(password);
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const user = {
    id: userId,
    email,
    password: hashedPassword,
    name,
    favorites: []
  };
  
  users.set(email, user);
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    favorites: user.favorites
  };
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const user = users.get(email);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    favorites: user.favorites
  };
};

export const getUserById = async (userId: string): Promise<User | null> => {
  for (const [email, user] of users.entries()) {
    if (user.id === userId) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        favorites: user.favorites
      };
    }
  }
  return null;
};

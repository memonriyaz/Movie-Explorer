import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types';
import connectMongoDB from '@/lib/mongodb';
import UserModel from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret';

interface UserCredentials {
  email: string;
  password: string;
  name: string;
}

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

export const verifyToken = (token: string): User | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
    };
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      favorites: []
    };
  } catch {
    return null;
  }
};

export const registerUser = async (credentials: UserCredentials): Promise<User> => {
  await connectMongoDB();
  
  const { email, password, name } = credentials;
  
  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  const hashedPassword = await hashPassword(password);
  
  const newUser = new UserModel({
    email,
    password: hashedPassword,
    name,
    favorites: []
  });
  
  const savedUser = await newUser.save();
  
  return {
    id: savedUser._id.toString(),
    email: savedUser.email,
    name: savedUser.name,
    favorites: savedUser.favorites
  };
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  await connectMongoDB();
  
  const user = await UserModel.findOne({ email });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    favorites: user.favorites
  };
};

export const getUserById = async (userId: string): Promise<User | null> => {
  await connectMongoDB();
  
  const user = await UserModel.findById(userId);
  
  if (!user) {
    return null;
  }
  
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    favorites: user.favorites
  };
};


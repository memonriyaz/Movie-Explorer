import bcrypt from 'bcryptjs';
import { User } from '@/types';
import connectMongoDB from '@/lib/mongodb';
import UserModel from '@/models/User';

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

// Manual JWT functions removed - using NextAuth.js JWT instead

export const registerUser = async (credentials: UserCredentials): Promise<User> => {
  await connectMongoDB();
  
  const { email, password, name } = credentials;
  
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    if (existingUser.googleId && !existingUser.password) {
      throw new Error('An account with this email already exists via Google. Please sign in with Google.');
    }
    throw new Error('User already exists');
  }
  
  if (!email || !password || !name) {
    throw new Error('All fields are required');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  const hashedPassword = await hashPassword(password);
  
  const newUser = new UserModel({
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    name: name.trim(),
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
  
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (user.googleId && !user.password) {
    throw new Error('This account was created with Google. Please sign in with Google.');
  }
  
  if (!user.password) {
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


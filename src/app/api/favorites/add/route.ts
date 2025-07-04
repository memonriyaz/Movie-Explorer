import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import UserModel from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { movieId } = await request.json();

    if (!movieId) {
      return NextResponse.json(
        { error: 'Movie ID is required' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Try to find user by ID first, fallback to email if ID is invalid
    let updatedUser;
    try {
      // Add movie to favorites using $addToSet to avoid duplicates
      updatedUser = await UserModel.findByIdAndUpdate(
        decoded.id,
        { $addToSet: { favorites: movieId } },
        { new: true }
      );
    } catch (error) {
      // If findByIdAndUpdate fails (invalid ObjectId), try finding by email
      console.log('Invalid ObjectId, trying to find user by email:', decoded.email);
      updatedUser = await UserModel.findOneAndUpdate(
        { email: decoded.email },
        { $addToSet: { favorites: movieId } },
        { new: true }
      );
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Movie added to favorites',
      favorites: updatedUser.favorites
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

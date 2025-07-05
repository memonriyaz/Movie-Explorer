# 🎬 Movie Explorer

A modern, full-stack movie discovery application built with Next.js 14, featuring authentication, favorites management, and infinite scroll.

## ✨ Features

- **🔐 Authentication**: NextAuth.js v4 with Google OAuth and Credentials
- **🎯 Movie Discovery**: Browse popular, top-rated, now playing, and upcoming movies
- **🔍 Search**: Real-time movie search powered by TMDB API
- **❤️ Favorites**: Save and manage your favorite movies
- **♾️ Infinite Scroll**: Seamless pagination with automatic loading
- **🌓 Dark/Light Theme**: Beautiful responsive design with theme toggle
- **📱 Responsive**: Mobile-first design that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Authentication**: NextAuth.js v5
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS
- **API**: The Movie Database (TMDB)
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- TMDB API key
- Google OAuth credentials (optional)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# TMDB API Configuration
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
TMDB_API_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# JWT Secret
JWT_SECRET=your_jwt_secret

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/movie-explorer.git
   cd movie-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in all required environment variables

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── favorites/         # Favorites page
│   └── movie/[id]/        # Movie detail page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   ├── movies/            # Movie-related components
│   ├── providers/         # Context providers
│   └── ui/                # UI components
├── lib/                   # Utility libraries
├── models/                # Database models
└── types/                 # TypeScript type definitions
```

## 🔧 API Routes

- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `GET /api/favorites` - Get user's favorite movies
- `POST /api/favorites/add` - Add movie to favorites
- `POST /api/favorites/remove` - Remove movie from favorites

## 🎯 Key Features Explained

### Authentication System
- **NextAuth.js v5**: Modern authentication with JWT sessions
- **Google OAuth**: One-click sign-in with Google
- **Credentials**: Email/password authentication with bcrypt
- **Session Management**: Automatic session handling and protection

### Movie Data Integration
- **TMDB API**: Real-time movie data from The Movie Database
- **Categories**: Popular, top-rated, now playing, upcoming
- **Search**: Instant search with debouncing
- **Images**: Optimized image loading with Next.js Image component

### Favorites Management
- **MongoDB Storage**: User favorites stored in database
- **Real-time Updates**: Optimistic UI updates
- **Sync**: Automatic synchronization between client and server

### Performance Optimizations
- **Infinite Scroll**: Efficient pagination with automatic loading
- **Image Optimization**: Next.js Image component with lazy loading
- **Client-side Caching**: Smart caching of API responses
- **Code Splitting**: Automatic code splitting with Next.js

## 🚀 Deployment

### Vercel 

**Link: ** - https://movie-explorer-sooty.vercel.app/


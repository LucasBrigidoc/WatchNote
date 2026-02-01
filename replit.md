# CultureHub

## Overview

CultureHub is a cross-platform mobile social app (iOS, Android, Web) built with React Native and Expo. It serves as a unified cultural hub where users can track, rate, review, and share their experiences across multiple media types including films, series, music, anime, manga, and books. Think of it as a Letterboxd-style experience expanded to encompass all cultural media in one profile.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54 (New Architecture enabled)
- **Navigation**: React Navigation v7 with native stack navigators and bottom tabs
- **State Management**: React Context for auth state, TanStack React Query for server state
- **Styling**: StyleSheet-based with a custom theming system supporting dark mode
- **Animations**: React Native Reanimated for fluid animations and gesture handling

### Design System
The app follows a "Fluid Dark Editorial" design language with:
- Deep dark backgrounds (#0D0D0D) with cyan accent colors (#00D9FF)
- Glass-morphism effects using expo-blur
- Consistent spacing, typography, and border radius defined in `client/constants/theme.ts`
- Reusable components: GlassCard, Button, MediaCard, PostCard, Avatar, StarRating

### Project Structure
```
client/           # React Native app code
  ├── components/ # Reusable UI components
  ├── screens/    # Screen components (Home, Profile, Discover, etc.)
  ├── navigation/ # Navigation configuration (stacks, tabs)
  ├── contexts/   # React Context providers (AuthContext)
  ├── hooks/      # Custom hooks (useTheme, useScreenOptions)
  ├── constants/  # Theme definitions, colors, spacing
  └── lib/        # Utilities (query-client for API calls)

server/           # Express.js backend
  ├── index.ts    # Server entry point with CORS setup
  ├── routes.ts   # API route definitions
  └── storage.ts  # Data storage abstraction (currently in-memory)

shared/           # Shared code between client and server
  └── schema.ts   # Drizzle ORM schema definitions with Zod validation
```

### Backend Architecture
- **Framework**: Express.js v5
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Validation**: Zod (via drizzle-zod)
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Storage**: Currently uses in-memory storage with interface ready for database integration

### Authentication
- Context-based auth state management in `AuthContext`
- Persistent sessions using AsyncStorage
- Currently mocked; ready for real implementation

### Data Flow
1. Client makes requests via TanStack Query using `apiRequest` helper
2. Server handles requests through Express routes
3. Drizzle ORM manages database operations with type-safe schemas
4. Shared types ensure consistency between client and server

## External Dependencies

### Third-Party Services (Planned)
Based on project requirements, the app is designed to integrate with:
- **TMDB API**: Films and series metadata
- **Spotify API**: Music/album data
- **Jikan API**: Anime information
- **Google Books API**: Book metadata

### Key NPM Dependencies
- **expo**: Core framework for cross-platform development
- **drizzle-orm** + **pg**: Database ORM and PostgreSQL driver
- **@tanstack/react-query**: Server state management
- **react-native-reanimated**: Animation library
- **expo-blur**, **expo-linear-gradient**, **expo-image**: UI effects
- **expo-haptics**: Tactile feedback on interactions

### Database
- PostgreSQL (configured via `DATABASE_URL` environment variable)
- Migrations managed through `drizzle-kit`
- Schema defined in `shared/schema.ts`

### Development Environment
- Runs on Replit with environment variables for domain configuration
- Metro bundler proxied through Replit's dev domain
- Hot reload supported for both client and server
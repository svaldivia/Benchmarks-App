# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands

- **Start the development server:**
  ```bash
  npx expo start
  ```
  This will start the Expo development server and provide options to run the app on various platforms.

- **Run on specific platforms:**
  ```bash
  # Run on iOS simulator
  npm run ios

  # Run on Android emulator
  npm run android

  # Run in web browser
  npm run web
  ```

- **Linting:**
  ```bash
  npm run lint
  ```
  This runs ESLint to check for code quality and style issues.

### Project Structure Overview

- **Entry Point**: `expo-router/entry` (configured in package.json)
- **Core App Structure**: Follows Expo Router's file-based routing system, with files in the `app` directory defining routes

## Code Architecture

### Routing

This project uses Expo Router with file-based routing:

- `app/_layout.tsx`: Root layout component with theme setup
- `app/(tabs)/_layout.tsx`: Tab navigation layout
- Individual screens in `app/(tabs)/` directory correspond to tab items
- Non-tab screens (like `entry-detail.tsx`) are defined at the root `app/` level
- Navigation is handled using `router.push()` from `expo-router`

### Components

The project follows a component-based architecture with:

1. **Themed Components:** 
   - `ThemedView`, `ThemedText` - Components that automatically apply theme colors
   - These use the `useThemeColor` hook to handle light/dark modes

2. **UI Components:**
   - Platform-specific components (like `IconSymbol.ios.tsx` vs `IconSymbol.tsx`)
   - Reusable UI elements like `TabBarBackground`, `ParallaxScrollView`

3. **Feature Components:**
   - Components specific to app features (like `HelloWave`, `Collapsible`)

### Data Management

- Data is stored in static objects in the `data/` directory
- TypeScript interfaces define the shape of data (e.g., `Entry`, `Exercise`)
- No complex state management libraries (Redux, MobX, etc.) are in use

### Styling

- Uses React Native's `StyleSheet` for styling
- Theme colors defined in `constants/Colors.ts`
- Responsive design patterns with Platform-specific adjustments

### TypeScript Configuration

- Uses TypeScript with strict mode enabled
- Path alias `@/*` configured for cleaner imports from project root
- Extends Expo's base TypeScript configuration

## Development Workflow

This is an Expo-based React Native application. When making changes:

1. Ensure the Expo development server is running (`npx expo start`)
2. Changes to files will automatically refresh in the development environment
3. Use appropriate platform simulators/emulators for testing
4. Platform-specific code can be created with `.ios.tsx` or `.android.tsx` extensions
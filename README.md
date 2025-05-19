# Horse Racing Championship Simulation

A Vue 3 application that simulates horse racing competitions with realistic race mechanics, animation, and statistics.

## Project Overview

This project is a horse racing simulation built with Vue 3, TypeScript, and Vite. It features:

- Dynamic race generation with configurable distances
- Realistic horse movement with variable speeds based on horse condition
- Real-time race visualization with animation
- Race results tracking and statistics
- Multiple race rounds with different tracks
- Adjustable simulation speed multiplier

## Technologies Used

- **Frontend Framework**: Vue 3 with Composition API
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Language**: TypeScript
- **Testing**:
  - Unit Tests: Vitest + Vue Test Utils
  - E2E Tests: Playwright
- **Animation**: Vue transitions, CSS animations and motion-v
- **UI Components**: Shadcn UI Vue components
- **Internationalization**: Vue I18n

## Project Structure

- `/src/components` - Vue components including race tracks, controls, and UI elements
- `/src/stores` - Pinia stores for managing horses, races, and results
- `/src/composables` - Reusable composition functions
- `/src/views` - Main application views
- `/src/assets` - Static assets
- `/src/lib` - Utility functions and helpers
- `/e2e` - End-to-end tests with Playwright

## Features

- **Horse Management**: Generate horses with unique names, colors, and condition scores
- **Race Schedule**: Create a multi-round racing schedule with varying distances
- **Race Simulation**: Simulate races with realistic movement and random events
- **Racing Controls**: Start, pause, reset races, and adjust simulation speed
- **Results Tracking**: Track race results and performance statistics
- **Responsive Design**: Works on different screen sizes

## Build Features

- **Console Log Removal**: All console.log statements are automatically removed in production builds to improve performance and security

## Testing

The application has comprehensive test coverage:

- **Unit Tests**: Cover individual components and stores
- **Component Tests**: Test component interactions and rendering
- **E2E Tests**: Test the full application flow from race generation to completion

## Project Setup

```sh
# Install dependencies
pnpm install

# Compile and hot-reload for development
pnpm dev

# Type-check, compile and minify for production
pnpm build

# Run unit tests
pnpm test:unit

# Run end-to-end tests
pnpm test:e2e
```

## E2E Testing

End-to-end tests use Playwright to verify that:

- The application loads correctly with all controls
- Users can generate races and view the race track
- Race controls function as expected
- Races run correctly and show results

To run E2E tests, first install Playwright browsers:

```sh
npx playwright install
```

Then run the tests:

```sh
pnpm test:e2e
```

## Future Improvements

While the current version meets all the requirements, with more time these enhancements could improve the user experience:

- **Betting System**: Allow users to place virtual bets on horses
- **Custom Horse Creation**: Let users create and name their own horses
- **Race History**: Persistent storage of past race results and statistics
- **Tournament Mode**: Multi-race tournaments with cumulative scoring
- **Enhanced Animations**: More realistic horse animations during races
- **Dynamic Events**: Random events during races (weather changes, horse injuries)
- **Mobile Optimization**: Improved responsive design for mobile devices
- **Sound Effects**: Audio feedback for race events and atmosphere
- **Multi-Player Mode**: Allow multiple users to participate in the same race events
- **Profile System**: User profiles to track betting history and preferences

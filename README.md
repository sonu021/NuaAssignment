# Nua Take-Home Assignment - Product Listing & Cart App

A production-grade React Native application built with **Expo SDK 54**, **TypeScript**, and **Expo Router**. Designed to showcase senior-level frontend engineering practices, including race-condition-safe asynchronous search, resilient networking with exponential backoff retries, persistent state management, webview document integration, structured event analytics tracking, and full dark mode support.

---

## 🌟 Features Overview

### 1. Product Listing Screen
- **Paginated Infinite Scroll**: Automatically fetches products from `https://dummyjson.com/products` in batches (`limit` & `skip`) without manual "Load More" buttons.
- **Debounced Search with Race-Condition Protection**: Queries `/products/search?q=` with a 500ms debounce. Prevents out-of-order response overwrites using `requestId` sequence tracking and `AbortController` cancellation.
- **Pull-to-Refresh**: Cleanly resets pagination without conflicting with active infinite scroll fetches.
- **Resilient API Retries**: Exponential backoff algorithm (`fetchWithRetry`) retries 5xx server errors before reporting UI errors.

### 2. Product Detail Screen
- **Image Carousel**: Horizontal scrolling FlatList with active dot pagination indicators.
- **Discount Price Calculation**: Accurately computes and formats discounted prices (`$ price * (1 - discountPercentage/100)`).
- **Stock & Availability Guard**: Real-time stock status badges; prevents adding items to cart beyond available inventory.
- **WebView Integration**: Includes a "Return Policy" button opening a dedicated WebView screen with navigation controls, loading overlays, and external browser fallbacks.

### 3. Cart Management & Persistence
- **Full Cart Functionality**: Add, increment, decrement (auto-removes at 0), remove, and clear cart, plus order checkout simulation.
- **AsyncStorage Persistence**: Restores cart state on launch and automatically saves updates under `@nua-assignment/cart`.
- **Dynamic Badge Count**: Real-time cart badge in header and bottom tab navigation.

### 4. Mock Analytics & AppState Event Logging
- **Event Logger Service**: Structured logger recording required events:
  - `product_viewed` (productId, title, category, price)
  - `add_to_cart` (productId, title, price, quantity)
  - `search_performed` (query, resultCount)
  - `app_backgrounded` (tracked automatically via React Native `AppState` listener with session duration)
- **In-App Visual Analytics Viewer**: Evaluators can tap the chart icon (`📊`) in the header to inspect all real-time logged analytics events in an interactive modal.

### 5. Persistent Dark Mode
- **Theme Context**: Supports Light, Dark, and System modes with smooth design token switching across all components.
- **Persistence**: Remembers theme preference in `AsyncStorage` under `@nua-assignment/theme`.

---

## 🏗️ Technical Architecture & Trade-Offs

### State Management: Context API vs. Zustand vs. Redux Toolkit

| Criteria | Context API (Chosen) | Zustand | Redux Toolkit |
| :--- | :--- | :--- | :--- |
| **Bundle Size & Dependencies** | **0 KB** (Built into React) | Small (~1.5 KB) | Larger (~15 KB + boilerplate) |
| **Complexity** | Minimal, clean TypeScript context | Low | High (reducers, slices, thunks) |
| **Performance** | Optimized with `useMemo` & `useCallback` | Fine-grained selector subscriptions | Fine-grained selector subscriptions |
| **Trade-Off Justification** | Ideal for app-wide cart & theme state in small-to-medium apps. Avoids extra dependency overhead while maintaining zero unnecessary component re-renders through memoized context values. | Excellent alternative if cart size scales significantly with high update frequency across complex sub-trees. | Overkill for this application scope. |

### Race Condition Search Strategy

Fast typing in search inputs often fires multiple network requests. Without proper guards, a slower earlier request (e.g. `query="iph"`, takes 400ms) could resolve **after** a faster later request (e.g. `query="iphone"`, takes 100ms), resulting in stale results overwriting current state.

**Solution Implemented**:
1. **Sequence ID Reference (`requestIdRef`)**: Increment an atomic request counter before every network request. When the response arrives, the state update is applied **only if** `requestId === currentRequestId`.
2. **AbortController Cancellation**: In-flight HTTP requests are explicitly aborted via `controller.abort()` as soon as the user types a new character or clears the search.

---

## 🧪 Testing

Includes a unit test suite verifying race-condition search behavior and exponential backoff retries.

Run the test suite:
```bash
npm test
```

Test output verifies:
- Discarding slow out-of-order API responses (`superseded_by_newer_request`).
- Handling 3 rapid keystrokes cleanly.
- Exponential backoff retry logic on server failures.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start Expo development server
npm start
```

### Running on Platforms
- **iOS**: `npm run ios` (or press `i` in terminal)
- **Android**: `npm run android` (or press `a` in terminal)
- **Web**: `npm run web` (or press `w` in terminal)

---

## 🔮 Future Improvements (With More Time)

1. **TanStack Query (React Query)**: Replace custom fetch handlers with `@tanstack/react-query` for automatic offline query caching, background revalidation, and request deduplication.
2. **Offline-First Cache**: Cache DummyJSON products in local SQLite / WatermelonDB so the app remains fully usable without internet connectivity.
3. **End-to-End Testing**: Add E2E automated test flows using Detox or Maestro to test full user journeys (Search -> Detail -> Add to Cart -> Checkout).

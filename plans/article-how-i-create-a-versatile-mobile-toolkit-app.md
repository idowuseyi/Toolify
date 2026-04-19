# How I Created a Versatile Mobile Toolkit App

## Introduction

In a world where we constantly switch between dozens of single-purpose apps, I wanted to build something different — a single, beautifully designed mobile application that bundles everyday utility tools into one cohesive experience. That idea became **Toolify**, a React Native toolkit app packing 11 fully functional tools with a sleek dark UI, modular architecture, and native device capabilities.

In this article, I walk through the entire journey — from the initial concept and technology choices, to the architecture, design system, and the implementation details of each tool.

---

## The Vision

The goal was simple: create a Swiss-army-knife mobile app that feels native, looks premium, and works offline. Instead of cluttering your home screen with a compass app, a calculator, a unit converter, a password generator, and a stopwatch, Toolify brings them all under one roof with a consistent, polished experience.

---

## Technology Stack

Choosing the right technology was critical. Here is what I went with and why:

| Technology                     | Purpose                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| **React Native + Expo SDK 54** | Cross-platform mobile development with access to native APIs |
| **TypeScript**                 | Type safety and better developer experience                  |
| **React Navigation 7**         | Native stack navigation between tools                        |
| **Zustand**                    | Lightweight state management with persistence                |
| **Lucide React Native**        | Beautiful, consistent icon set                               |
| **expo-camera**                | Camera access for QR scanning and text capture               |
| **expo-sensors**               | Magnetometer and accelerometer for Compass and Bubble Level  |
| **expo-clipboard**             | Clipboard operations for password and text tools             |
| **expo-image-picker**          | Image capture and gallery selection                          |
| **react-native-svg**           | Custom SVG-based gauges, compass dials, and QR codes         |
| **react-native-qrcode-svg**    | QR code generation                                           |
| **AsyncStorage**               | Persistent local storage via Zustand middleware              |

The Expo ecosystem was the natural choice — it provides managed workflow, OTA updates via EAS, and straightforward access to native device capabilities without writing native code.

---

## Architecture and Project Structure

A key principle was **modularity**. Each tool lives in its own self-contained module directory, making it trivial to add, remove, or modify tools independently.

```
src/
├── components/          # Shared UI components
│   └── ToolCard.tsx     # Reusable grid card for the home screen
├── constants/
│   └── theme.ts         # Centralized design tokens
├── modules/             # Feature modules - one per tool
│   ├── bmiCalculator/
│   ├── bubbleLevel/
│   ├── calculator/
│   ├── compass/
│   ├── passwordGenerator/
│   ├── qrScanner/
│   ├── speedTest/
│   ├── stopwatch/
│   ├── taskManager/
│   │   ├── store.ts     # Zustand store with persistence
│   │   └── TaskManagerScreen.tsx
│   ├── textScanner/
│   └── unitConverter/
├── navigation/
│   └── RootNavigator.tsx # Central navigation config
└── screens/
    └── HomeScreen.tsx    # Tool grid dashboard
```

### Why This Structure Works

- **Separation of concerns**: Each module owns its UI, logic, and — where needed — its state store. No cross-module coupling.
- **Scalability**: Adding a new tool means creating a folder under `src/modules/`, registering a route in `RootNavigator.tsx`, and adding a card to the `TOOLS` array in `HomeScreen.tsx`. Three touch points, zero refactoring.
- **Discoverability**: The folder structure is self-documenting. You can see every feature at a glance.

---

## The Design System

Consistency was non-negotiable. Every screen, every card, every button draws from a single source of truth in `src/constants/theme.ts`:

```typescript
export const Theme = {
  colors: {
    background: '#121212', // Deep charcoal
    surface: '#1E1E1E', // Card background
    surfaceLight: '#2C2C2C', // Inputs and hover states
    primary: '#00E5FF', // Electric Blue accent
    secondary: '#8a2be2', // Neon purple alternative
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#333333',
    error: '#CF6679',
    success: '#03DAC6',
  },
  spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 },
  radii: { s: 4, m: 8, l: 12, xl: 20, round: 9999 },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' },
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 14, fontWeight: 'normal' },
  },
};
```

The dark theme with an electric blue accent (`#00E5FF`) gives the app a modern, tech-forward aesthetic. Every component references `Theme` directly — no magic numbers, no inconsistent padding, no color drift.

The navigation bar also inherits from this theme by extending React Navigation's `DarkTheme`:

```typescript
theme={{
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Theme.colors.primary,
    background: Theme.colors.background,
    card: Theme.colors.surface,
    text: Theme.colors.text,
    border: Theme.colors.border,
  },
}}
```

---

## The Home Screen — A Tool Dashboard

The home screen is a responsive 2-column grid of tool cards, each rendered by a reusable `ToolCard` component. The `TOOLS` array maps each tool to an icon from Lucide and a navigation route:

```typescript
const TOOLS = [
  {
    id: 'unit-converter',
    title: 'Unit Converter',
    icon: Scale,
    route: 'UnitConverter',
  },
  { id: 'qr-scanner', title: 'QR Tools', icon: QrCode, route: 'QrScanner' },
  {
    id: 'bmi-calculator',
    title: 'BMI Calculator',
    icon: Calculator,
    route: 'BmiCalculator',
  },
  {
    id: 'password-gen',
    title: 'Pass Generator',
    icon: Key,
    route: 'PasswordGenerator',
  },
  {
    id: 'task-manager',
    title: 'Task Manager',
    icon: ListTodo,
    route: 'TaskManager',
  },
  {
    id: 'calculator',
    title: 'Calculator',
    icon: FunctionSquare,
    route: 'Calculator',
  },
  { id: 'stopwatch', title: 'Timer', icon: Timer, route: 'Stopwatch' },
  { id: 'bubble-level', title: 'Level', icon: CircleDot, route: 'BubbleLevel' },
  { id: 'compass', title: 'Compass', icon: Compass, route: 'Compass' },
  {
    id: 'text-scanner',
    title: 'Text Scan',
    icon: ScanText,
    route: 'TextScanner',
  },
  { id: 'speed-test', title: 'Speed Test', icon: Gauge, route: 'SpeedTest' },
];
```

Each `ToolCard` is a square card with a centered Lucide icon and label, styled with surface background, rounded corners, subtle shadow, and a border — all from the shared theme.

---

## Deep Dive: The 11 Tools

### 1. Calculator — Basic and Scientific Modes

The calculator supports two modes toggled via a tab bar:

- **Basic mode**: Standard arithmetic operations — addition, subtraction, multiplication, division, percentages, parentheses, and backspace.
- **Scientific mode**: Trigonometric functions (sin, cos, tan), logarithms (log, ln), square roots, exponents, factorial, and constants (π, e).

The expression is built as a string and evaluated using a sandboxed `new Function()` call. A `prepareExpression()` function transforms human-readable math notation into JavaScript-compatible expressions (e.g., `sin(` → `Math.sin(`, `^` → `**`). Factorials are handled via a custom recursive replacement before evaluation.

### 2. Unit Converter

Supports three categories — **Length**, **Weight**, and **Temperature** — with instant conversion as you type. Length and Weight use a base-unit conversion strategy (everything converts to/from a base unit like meters or grams). Temperature uses explicit formula-based conversion through Celsius as the intermediary.

The UI features category tabs, a numeric input field, and selectable unit chips for both source and target units.

### 3. QR Tools — Scanner and Generator

A dual-mode tool:

- **Scanner**: Uses `expo-camera`'s `CameraView` with barcode scanning enabled. When a QR code is detected, the data is displayed in an overlay with options to copy to clipboard or scan again.
- **Generator**: Accepts text or URL input and renders a QR code using `react-native-qrcode-svg`, styled with the app's primary color.

### 4. BMI Calculator

A straightforward health tool: enter weight in kilograms and height in centimeters, tap calculate, and get your BMI with a color-coded category label:

- Underweight (< 18.5) — Orange
- Normal (18.5–24.9) — Green
- Overweight (25–29.9) — Orange
- Obese (30+) — Red

The UI uses a card-based layout with proper keyboard avoidance for iOS.

### 5. Password Generator

Generates cryptographically random passwords with configurable options:

- **Length**: Adjustable from 8 to 32 characters via +/- buttons
- **Character sets**: Toggle uppercase, numbers, and symbols via switches

The generated password is displayed prominently with a copy-to-clipboard button powered by `expo-clipboard`.

### 6. Task Manager — Persistent To-Do List

A full CRUD task manager with:

- **Add tasks** via a text input with submit-on-enter
- **Toggle completion** with checkbox icons
- **Edit tasks** inline with auto-focus
- **Delete tasks** with a trash icon

State is managed by **Zustand** with the `persist` middleware backed by `AsyncStorage`, so tasks survive app restarts. The store defines a clean interface:

```typescript
interface TaskState {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string) => void;
}
```

### 7. Stopwatch and Timer

A dual-mode time tool:

- **Stopwatch**: Start, stop, reset, and lap functionality. Laps are displayed in a scrollable list with the fastest lap highlighted in green and the slowest in red. Time is displayed in `MM:SS.cs` format (or `HH:MM:SS.cs` when hours are present), updated every 50ms for smooth display.
- **Timer**: Input hours, minutes, and seconds, then count down. Fires an alert when complete. Supports pause and reset.

Both modes share a single interval ref that is properly cleaned up on mode switch and component unmount.

### 8. Bubble Level — Accelerometer-Powered

Uses the device's **accelerometer** via `expo-sensors` to measure tilt on the X and Y axes. The UI renders a circular level with:

- A **bubble** that moves based on tilt angle, clamped to a maximum offset
- **Crosshair lines** for visual alignment
- A **status indicator** that changes color: green when level (< 2°), orange when slightly tilted (< 10°), red when tilted
- Numerical readouts for both axes

Sensor availability is checked on mount with graceful fallback messaging for simulators.

### 9. Compass — Magnetometer-Powered

Uses the device's **magnetometer** via `expo-sensors` to determine heading. Key technical details:

- Raw heading is calculated via `atan2(y, x)` from magnetometer readings
- A **low-pass filter** (0.8/0.2 smoothing) reduces jitter
- **Wrap-around handling** prevents jumps at the 359°→0° boundary
- The compass dial is rendered entirely in SVG with rotating tick marks, cardinal labels (N/E/S/W), and a red north pointer
- The north indicator is colored red for quick orientation

### 10. Text Scanner

A camera-based text capture tool that:

- Opens the device camera with a scan frame overlay
- Allows capturing a photo or picking from the gallery via `expo-image-picker`
- Displays the captured image alongside an editable text field where users can type or paste the text they see
- Provides copy-to-clipboard functionality

This tool is designed as a manual transcription assistant — capturing the image for reference while the user types the text.

### 11. Speed Test — Real Network Benchmarks

A genuine internet speed test that measures three metrics against **Cloudflare's speed test endpoints**:

1. **Ping**: Sends 5 requests to `speed.cloudflare.com/__down?bytes=0` and takes the median latency
2. **Download**: Downloads a 10MB file with streaming progress tracking, calculating Mbps in real-time using a `ReadableStream` reader
3. **Upload**: POSTs 2MB of data to `speed.cloudflare.com/__up` and measures throughput

The UI features a semicircular SVG gauge that animates during the test, showing current speed in Mbps. Results are displayed in clean metric cards. All requests include a 30-second timeout via `AbortController`.

---

## Navigation Flow

The app uses a simple **native stack navigator** with the home screen as the root. Each tool is a separate screen pushed onto the stack. The back button returns to the home grid.

```
Home Screen (Tool Grid)
├── Unit Converter
├── QR Tools
├── BMI Calculator
├── Password Generator
├── Task Manager
├── Calculator
├── Timer / Stopwatch
├── Bubble Level
├── Compass
├── Text Scanner
└── Speed Test
```

All screen transitions use the default native platform animations for a natural feel.

---

## Key Technical Decisions

### Why Zustand over Redux or Context?

For Toolify's needs, Zustand was the perfect fit:

- **Minimal boilerplate**: The entire task store is under 50 lines
- **Built-in persistence**: The `persist` middleware with `createJSONStorage` made AsyncStorage integration trivial
- **No provider wrapping**: Stores are imported directly, keeping the component tree clean
- **TypeScript-first**: Full type inference out of the box

### Why expo-sensors?

The Compass and Bubble Level require real-time device sensor data. `expo-sensors` provides a unified API for both magnetometer and accelerometer with:

- Availability checking before subscription
- Configurable update intervals (60ms for compass, 80ms for level)
- Clean subscription lifecycle management via refs and cleanup functions

### Why SVG for Custom Visualizations?

The compass dial, speed test gauge, and QR code all use `react-native-svg` for resolution-independent rendering. This ensures crisp visuals on any screen density without bundling static images.

---

## Handling Edge Cases

Throughout the development, several edge cases were carefully handled:

- **Sensor unavailability**: Both the Compass and Bubble Level check for sensor availability on mount and display clear error messages on simulators or devices without the required hardware.
- **Camera permissions**: QR Scanner and Text Scanner request camera permissions asynchronously and handle both the pending and denied states gracefully.
- **Mathematical edge cases**: The Calculator handles NaN, Infinity, factorial limits (n > 170), and expression errors with proper error display.
- **Timer completion**: The countdown timer fires a native alert when it reaches zero and properly cleans up the interval.
- **Network failures**: The Speed Test catches errors and displays a user-friendly message suggesting the user check their internet connection.
- **Keyboard management**: BMI Calculator and Task Manager properly dismiss the keyboard on submit and use `KeyboardAvoidingView` for iOS.

---

## Performance Considerations

- **Sensor update intervals** are tuned per tool: 60ms for the compass (needs smooth rotation), 80ms for the bubble level (slightly less critical).
- **Low-pass filtering** on the compass prevents jittery heading readings without introducing noticeable lag.
- **Streaming downloads** in the Speed Test use `ReadableStream` readers for real-time progress updates instead of waiting for the entire download to complete.
- **FlatList** is used for the tool grid and task list for efficient rendering of lists.
- **useCallback** and **useRef** are used throughout to prevent unnecessary re-renders and memory leaks.

---

## Building and Deployment

Toolify is configured for **EAS Build** with:

- Android package: `com.toolify.app`
- Edge-to-edge display enabled
- Portrait orientation lock
- Adaptive icons for Android
- Tablet support for iOS
- New Architecture enabled for React Native

---

## Lessons Learned

1. **Start with the design system**: Defining colors, spacing, radii, and typography upfront saved enormous time and ensured visual consistency across 11+ screens.
2. **Modular architecture pays off**: Being able to work on one tool without touching any other file made development fast and conflict-free.
3. **Sensor APIs need real devices**: Many sensor features cannot be tested on simulators. Building graceful fallbacks from day one was essential.
4. **TypeScript is worth it**: With 11 modules and complex state interactions, TypeScript caught countless bugs at compile time rather than runtime.
5. **Expo removes friction**: From camera access to sensor subscriptions to build management, Expo eliminated the need for any native code while still accessing powerful device capabilities.

---

## What is Next

Toolify is designed to grow. The modular architecture makes it straightforward to add new tools. Some ideas for the future:

- **Color Picker** using the camera
- **Currency Converter** with live exchange rates
- **Sound Meter** using the microphone
- **Flashlight toggle** using the device torch
- **Ruler / Measurement tool** using AR
- **Widget support** for quick access to favorite tools

---

## Conclusion

Building Toolify proved that a well-architected React Native app can deliver a premium, native-feeling experience across a wide range of device capabilities — from camera and sensors to network benchmarks and persistent storage. By investing in a solid design system and modular architecture early on, adding new tools became a predictable, low-risk process.

The entire app is built with TypeScript, uses no native modules beyond what Expo provides, and maintains a consistent dark aesthetic across every screen. It is a testament to how far the React Native and Expo ecosystems have come for building production-quality utility apps.

---

_Toolify is built with React Native 0.81.5, Expo SDK 54, and TypeScript 5.9._

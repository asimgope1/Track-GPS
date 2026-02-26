# TrackGPS Project Documentation

## 1) Project Overview
TrackGPS is a React Native (0.77) fleet management app with role-based UX for:
- `admin` / `manager`: analytics-first fleet dashboard + operations modules
- `driver`: trip execution dashboard (start/stop trip, add expenses)

Core capabilities include vehicle tracking, trip lifecycle, maintenance workflows, driver rating, and route optimization.

## 2) Tech Stack
- Framework: React Native, React 18
- Navigation: `@react-navigation/native`, drawer + native stack
- State: Redux Toolkit + `react-redux`
- Persistence: AsyncStorage
- Network: fetch wrappers in `src/utils/Network.js`
- Maps/GPS:
  - `react-native-maps`
  - `react-native-maps-directions`
  - `@react-native-community/geolocation`
  - Google Places autocomplete
  - OpenRouteService APIs
- UI libs: RNE UI, React Native Paper, DropDownPicker, Toast
- Charts: `react-native-gifted-charts`
- Date/time: `moment`, RN DateTimePicker

## 3) App Architecture
### Entry and Providers
- `App.tsx` -> `Navigation`
- `src/navigation/Navigation.js` wraps app with:
  - Redux `Provider`
  - `ThemeProvider`
  - `NavigationContainer`
  - global gradient background + themed navigation colors

### Auth Gate
- `src/navigation/Appnavigator.js`
  - Dispatches `checkuserToken()` to read `loginResponse` from AsyncStorage
  - Routes:
    - Authenticated -> `HomeStack`
    - Not authenticated -> `LoginStack`

### Navigation Structure
- `LoginStack`
  - `Splash` -> `Login`
- `HomeStack` (drawer + stack)
  - Main stack: `Home`, `DashBoard`, `VehicleMap`, `Track`, `HistoryModal`, `DescriptionData`, `MaintenanceSchedule`
  - Drawer pages: maintenance/trip/rating/optimization modules

## 4) Role and Permission Model
### Source of Truth
- Stored login payload key: `loginResponse`
- Used fields: `user_type`, `permissions`, `access_token`, `driver_id`, `project_sl`

### Home Role Split
- In `src/Pages/Home/Home.js`:
  - `admin` / `manager` -> Fleet dashboard UI
  - others (including `driver`) -> `DriverDash`

### Drawer Permission Filtering
- Implemented in `src/navigation/HomeStack.js`
- `menuConfig` maps screen to required permission keys
- Logic:
  - `permissions` contains `all` -> full menu access
  - otherwise menu shown if any configured permission matches
  - `driver` additionally gets `TripStart` and `TripStop`

## 5) End-to-End User Flow
1. App opens `Splash` (requests location permission).
2. Navigates to `Login`.
3. Login calls `POST /user/auth/`, stores `loginResponse` + `project_sl`.
4. Auth state flips to true (`AUTH_STATUS`), app enters `HomeStack`.
5. User lands on `Home`:
   - admin/manager: fleet analytics, vehicle modal, history, live track
   - driver: assigned trips list + start/stop/expense actions
6. Drawer exposes modules based on permission set.

## 6) Screen/Module Catalog
### Core Pages
- `Splash`: permission bootstrap + redirect
- `Login`: auth form and token bootstrap
- `Home`:
  - fleet status classification (`Running/Stopped/Unreachable`) from `updated_on`
  - pie/line/bar visual cards
  - vehicle details modal
  - track and history overlays
- `DriverDash`:
  - driver-assigned trips
  - filters by trip status
  - launches `TripStart`, `TripStop`, `TripExpenses`
- `Track`:
  - projected path via `MapViewDirections`
  - animated actual path polyline
  - source/destination/via markers
- `HistoryModal`:
  - date-range query to datalog API
  - map polyline history + vehicle telemetry summary
- `Dash` / `DashBoard`:
  - legacy/alternate dashboard flow with websocket + bottom sheet UI

### Drawer Feature Modules
- `MaintenanceScheduleScreen`: schedule maintenance by vehicle/type/date
- `MaintenanceCalendarScreen`: month/day maintenance calendar with overdue logic
- `MaintenanceJob`: create and list maintenance job cards
- `VehicleInspection`: checklist-based inspection submission
- `VehicleBreakdown`: incident report with location + attachment
- `TripMaster`: create trip blueprint (origin/destination/cost/time)
- `TripAssignment`: assign trip to vehicle and driver with estimates
- `TripStart`: start trip form + checklist + proof attachment
- `TripStop`: end trip form + checklist + fuel/remarks + proof
- `TripExpenses`: trip expense entry and listing
- `DriverRating`: checklist rating (stars/yes-no) and remarks
- `RouteOptimization`: multi-stop route planning with ORS + map visualization

## 7) API and Integration Matrix
### Base URLs
- REST: `http://185.190.143.5:9100/`
- WS: `ws://185.190.143.5:9100`

### Main API Groups
- Auth/User
  - `user/auth/`
  - `user/profile/`
- Fleet/Things
  - `projects/{project_sl}/things/?page=1&search=&type=gps`
  - `things/?thing_id=...&project_id=117`
  - `things/datalog/`
- Routing
  - `route/assign-route/{id}/`
- Maintenance
  - `maintenance/checklist/`
  - `maintenance/maintenance_master/`
  - `maintenance/maintenance_schedule/`
  - `maintenance/calendar_view/?from_date=...&to_date=...`
  - `maintenance/maintenance_job_card/`
  - `maintenance/inspection_checklist/`
  - `maintenance/vehicle_breakdown/`
- Trips/Driver
  - `trips/trip_master/`
  - `trips/trip_assignment/`
  - `trips/trip_start/{tripAssignmentId}/`
  - `trips/trip_end/{tripId}/`
  - `trips/driver_master/`
  - `trips/driver_checklist_master/`
  - `trips/driver_rating/`
  - `trips/expense_master/`
  - `trips/trip_expense_entry/`

### External APIs
- Google Maps Directions (`react-native-maps-directions`)
- Google Places Autocomplete
- OpenRouteService:
  - Reverse geocode
  - Directions optimization

### Realtime
- WebSocket (legacy `Dash`): `ws://.../thing/r/{thingid}/`

## 8) Maps and Location Features
- Location permission requested in `Splash`
- Map screens use hybrid map type and markers/polylines
- Trip start/stop and breakdown auto-capture current location
- Reverse geocoding used for human-readable address
- Route optimization supports stop search and route rendering

## 9) Shared Functions and Utilities
### `src/utils/Network.js`
- `GETNETWORK(url, token?)`
- `POSTNETWORK(url, payload, token?, content?)`
- `PUTNETWORK(url, payload, token?, content?)`
- Injects bearer token from AsyncStorage when `token=true`

### `src/utils/Storage.js`
- `storeObjByKey`, `getObjByKey`, `clearAll`, etc.

### Redux
- `authStatus` reducer controls logged-in state
- `checkuserToken()` checks `loginResponse` presence

## 10) Design Language
### Theme System
- Defined in `src/theme/index.js`, consumed via `useAppTheme()`
- Dual palettes: `darkTheme` and `lightTheme`
- Brand primary: indigo (`#4F46E5`)
- Shared tokens:
  - `spacing`, `radius`, `typography`, `shadows`

### Visual Style Patterns
- Full-screen gradient app background
- Glass/elevated cards with rounded corners
- Strong status color semantics:
  - success green, warning amber, error red, info blue
- Poppins font family across app
- Reusable form style factory in `src/styles/FormStyles.js`

## 11) Native Platform Configuration
### Android
- Permissions in `AndroidManifest.xml`:
  - internet, fine/coarse/background location
  - read/write external storage
- Google Maps API key configured in manifest metadata
- `usesCleartextTraffic=true`

### iOS
- `Info.plist` includes `NSLocationWhenInUseUsageDescription`
- Poppins fonts registered under `UIAppFonts`

## 12) Reusable Components
- `Header`: menu/close, theme toggle, optional logout action
- `Loader`: full-screen modal activity indicator
- Custom UI helpers:
  - button, text input, alert/exit modals

## 13) Known Implementation Notes
- Some modules still mix old and new theming styles.
- Several endpoints are hardcoded with project `117`.
- API keys are currently hardcoded in source (Google/ORS) and should be moved to env-secured config.
- Some legacy pages (`Dash`) overlap with newer `Home`/`DriverDash` workflows.

## 14) Suggested File for Team Onboarding
Start with these files in order:
1. `src/navigation/Navigation.js`
2. `src/navigation/Appnavigator.js`
3. `src/navigation/HomeStack.js`
4. `src/Pages/Home/Home.js`
5. `src/Pages/Home/DriverDash.js`
6. `src/utils/Network.js`
7. `src/theme/index.js`

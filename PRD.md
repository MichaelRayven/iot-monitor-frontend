# PRD — Frontend MVP for IoT Vega Building Activity Dashboard

## 1. Product Summary

Build a React-based web dashboard that works alongside IoT Vega Server to visualize device activity on a building floor plan.

The MVP supports three device types:

- Smart badges
- BLE beacons
- Alarm buttons

The dashboard is intended for operators who need to:

- Upload and view floor plans
- Place stationary devices on a floor plan manually
- See current device activity in near real time
- Respond to alarm-button events quickly
- Inspect badge proximity relative to beacons

## 2. Goals

### Primary goals

- Show a floor plan with interactive device overlays
- Support manual placement of stationary devices
- Show current state of badges, beacons, and alarm buttons
- Update the UI in near real time from backend events
- Make alarm events obvious and actionable

### Non-goals for MVP

- Automatic indoor trilateration
- Historical playback UI
- Multi-building portfolio analytics
- Device provisioning/configuration UI
- Advanced admin permissions
- Mobile-native app

## 3. Users

### Primary user

- Security/operator monitoring staff

### Secondary users

- Facility manager
- Installer/technician during initial map setup

## 4. Supported Device Types

### Smart badge

A moving person-carried device shown as a current badge marker on the floor plan.

Frontend should display:

- Device name / ID
- Current inferred location or nearest beacon association
- Last seen time
- Battery level if available
- Motion / fall / search-related state if decoded by backend
- Alert state if present

### Beacon

A stationary reference point manually placed on the floor plan.

Frontend should display:

- Device name / ID
- Fixed position
- Online / offline state
- Last seen time
- Nearby badges count

### Alarm button

A stationary device manually placed on the floor plan.

Frontend should display:

- Device name / ID
- Fixed position
- Current state: idle / alarm sent / alarm acknowledged / alarm handled
- Last event time
- Battery level if available

## 5. MVP User Stories

### Floor plan management

- As an operator, I can upload a floor plan image so I can monitor devices on a building map.
- As an installer, I can open a floor plan and place beacons and alarm buttons manually.
- As an installer, I can reposition stationary devices by drag and drop.

### Live monitoring

- As an operator, I can see all supported devices on the floor plan.
- As an operator, I can see badges associated with nearby beacons.
- As an operator, I can inspect device details from the map or side panel.
- As an operator, I can see when a device is stale or offline.

### Alarm handling

- As an operator, I can clearly see when an alarm button event occurs.
- As an operator, I can filter to active alarms only.
- As an operator, I can open alarm details and see where the button is located on the floor plan.

### Device browsing

- As an operator, I can filter devices by type, status, and floor.
- As an operator, I can search by device name or ID.

## 6. Functional Requirements

### 6.1 Floor plan canvas

The system must:

- Render one floor plan image at a time
- Support pan and zoom
- Support layered drawing over the floor plan
- Render stationary device markers at saved coordinates
- Render moving badge markers from backend-provided current positions
- Highlight selected device

### 6.2 Device markers

The system must:

- Use distinct marker styles for badges, beacons, and alarm buttons
- Show status via icon state, ring, or badge
- Support hover tooltip and click selection
- Show stale/offline visual treatment when device freshness exceeds threshold

### 6.3 Badge-to-beacon visualization

The system must:

- Show badge markers around the associated nearest beacon
- Not require independent floor-plan coordinates for badges in the MVP
- Support stacked/cluster display when multiple badges are near the same beacon
- Show nearby badge count on beacon markers when zoomed out

### 6.4 Alarm visualization

The system must:

- Visually emphasize active alarm buttons on the map
- Show alarms in a dedicated alert list
- Keep alarm indicators visible until backend state changes
- Allow selecting an alarm from the list and centering the floor plan on that device

### 6.5 Device details panel

The system must show a details drawer or side panel with:

- Device type
- Device ID / DevEUI
- Human-friendly name
- Current status
- Last seen timestamp
- Battery level when available
- Telemetry summary supplied by backend
- For beacon: nearby badges list
- For alarm button: current alarm lifecycle state

### 6.6 Filtering and search

The system must allow filtering by:

- Device type
- Online / offline / stale
- Alarm active / inactive
- Floor plan

The system must allow text search by:

- Device name
- Device ID

### 6.7 Real-time updates

The system must:

- Receive live updates from backend over WebSocket
- Update only affected markers instead of full-page refresh
- Show connection state for live updates
- Recover gracefully after reconnect

### 6.8 Stationary device placement

The system must:

- Allow manual placement for beacons and alarm buttons
- Allow drag to reposition
- Persist coordinates via backend API
- Confirm successful save or show failure state

## 7. UX Requirements

### Layout

The main layout should have:

- Top header
- Left or right device/alarm sidebar
- Main floor plan canvas
- Optional collapsible details drawer

### Interaction model

- Single click selects device
- Double click or action button opens details
- Mouse wheel or trackpad zooms
- Drag pans the map
- Drag selected stationary marker to reposition in edit mode

### Visual hierarchy

- Alarm states are highest priority
- Selected device is second priority
- Normal badges and beacons are lower priority

### Empty and error states

- No floor plan uploaded
- No devices on this floor
- Live connection disconnected
- Device location unavailable

## 8. Screens for MVP

### Screen 1: Monitoring dashboard

Contains:

- Floor plan canvas
- Live device overlays
- Sidebar with device list and alarm list
- Filter/search controls

### Screen 2: Floor plan setup / edit mode

Contains:

- Floor plan canvas
- Stationary device placement tools
- Save / cancel changes

### Screen 3: Device details drawer

Contains:

- Device metadata
- Current status
- Last seen
- Alarm or proximity context

## 9. Frontend Technical Approach

### Stack

- React
- TypeScript
- react-konva / Konva for floor plan rendering
- React Query for API data fetching/cache
- Zustand or Context for local UI state
- Native WebSocket client

### Rendering model

- Layer 1: floor plan image
- Layer 2: beacon and alarm button markers
- Layer 3: badge markers
- Layer 4: selection, pulse, and alarm highlights

### Data flow

- Initial page load fetches floor plans, stationary devices, and current device snapshot
- WebSocket streams incremental updates
- Client merges updates into in-memory store
- Konva canvas rerenders only changed nodes where possible

## 10. Backend Contract Needed by Frontend

### Read APIs

- Get floor plans
- Get devices for floor plan
- Get current alarms
- Get current badge associations / positions

### Write APIs

- Upload floor plan
- Save stationary device position
- Update stationary device metadata

### WebSocket events

- device.updated
- badge.location.updated
- alarm.created
- alarm.updated
- connection.status

## 11. Data Model Expected by Frontend

### Common device shape

- id
- devEui
- name
- type
- floorPlanId
- x
- y
- status
- lastSeenAt
- batteryPercent

Note: `x` and `y` are required for stationary devices only in the MVP, including beacons and alarm buttons. Badges do not require independent coordinates.

### Badge extension

- associatedBeaconId
- locationMode = `nearest_beacon`
- motionState
- alertState

### Beacon extension

- nearbyBadgeCount
- nearbyBadgeIds

### Alarm button extension

- alarmState
- activeAlarmId
- lastAlarmAt

## 12. MVP Acceptance Criteria

### Floor plan

- User can upload and display a floor plan image
- User can zoom and pan without losing marker alignment

### Stationary devices

- User can place and save beacon and alarm button positions
- Reloading the page shows saved positions correctly

### Live monitoring

- Badge, beacon, and alarm button markers render on the map
- Incoming backend updates reflect on screen within a few seconds
- Stale devices are visually differentiated

### Alarm handling

- Active alarm buttons are visible on the map and in the alarm list
- Clicking an alarm centers and selects the related device

### Device details

- Selecting any supported device opens current details

## 13. Out of Scope for MVP

- Multi-floor pathfinding
- Heatmaps
- Historical timeline playback
- Role-based UI permissions beyond basic login
- Beacon auto-discovery placement
- Full device configuration editor
- Mobile responsive optimization beyond tablet-friendly layout

## 14. Risks and Mitigations

### Badge positioning model

Decision: badges are rendered around their nearest beacon in the MVP rather than at independent map coordinates.

Implications:

- Backend must provide `associatedBeaconId` for each visible badge
- Frontend computes small local offsets around the beacon marker to lay out nearby badges
- Stationary devices keep persisted `x` and `y` coordinates on the floor plan

### High event volume

Risk: frequent updates may degrade rendering performance.
Mitigation: throttle UI updates, batch WebSocket events, and render with Konva layers.

### Incomplete telemetry decoding

Risk: some payload details may not be decoded in MVP.
Mitigation: define a minimal normalized backend payload contract and expose raw status when needed.

## 15. Success Metrics

- Operator can identify the location of an active alarm button in under 10 seconds
- Operator can locate a selected badge from search in under 5 seconds
- Device update latency on UI is typically under 3 seconds after backend receipt
- Stationary device placement success rate is above 95%

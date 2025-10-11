# Design Guidelines: Vacation Rental Management Dashboard

## Design Approach: Utility-First Dashboard System

**Selected Framework**: Material Design principles adapted for operational dashboard  
**Rationale**: Information-dense property management tool requiring clear data hierarchy, efficient workflows, and reliable interaction patterns for daily remote operations.

**Core Principles**:
- Operational efficiency over visual flair
- Clear information hierarchy for quick decision-making
- Consistent patterns for reliable daily use
- Responsive design for desktop and mobile monitoring

---

## Color Palette

### Primary Colors
**Light Mode:**
- Primary: 349 45% 87% (White Shrimp Pink - #F6C6D0)
- Primary Hover: 349 45% 82%
- Background: 0 0% 100% (White)
- Surface: 0 0% 98%
- Border: 0 0% 90%

**Dark Mode:**
- Primary: 349 45% 75%
- Primary Hover: 349 45% 70%
- Background: 222 47% 11%
- Surface: 217 33% 17%
- Border: 217 33% 25%

### Semantic Colors
- Success: 142 71% 45% (Green for device status, confirmations)
- Warning: 38 92% 50% (Amber for pending alerts)
- Danger: 0 84% 60% (Red for critical discrepancy alerts)
- Info: 217 91% 60% (Blue for informational messages)

### Text Colors
- Primary Text (Light): 0 0% 20%
- Secondary Text (Light): 0 0% 45%
- Primary Text (Dark): 0 0% 95%
- Secondary Text (Dark): 0 0% 70%

---

## Typography

### Font Families
- **Primary**: Inter (Google Fonts) - Clean, readable for data tables and UI
- **Monospace**: JetBrains Mono - For timestamps, IDs, device codes

### Type Scale
- Display (Dashboard Titles): 2.25rem / 36px, font-weight 700
- H1 (Page Headers): 1.875rem / 30px, font-weight 600
- H2 (Section Headers): 1.5rem / 24px, font-weight 600
- H3 (Card Headers): 1.25rem / 20px, font-weight 600
- Body Large: 1rem / 16px, font-weight 400
- Body: 0.875rem / 14px, font-weight 400
- Small (Metadata): 0.75rem / 12px, font-weight 400

---

## Layout System

### Spacing Primitives
**Consistent spacing using Tailwind units**: 2, 4, 6, 8, 12, 16, 24  
- Tight spacing (p-2, gap-2): Within compact UI elements
- Standard spacing (p-4, gap-4): Cards, form fields
- Generous spacing (p-6, p-8): Section padding, page containers
- Extra spacing (p-12, p-16, p-24): Major section separations

### Grid & Containers
- Max container width: max-w-7xl (1280px)
- Dashboard grid: 12-column responsive grid
- Card layouts: 1 column mobile, 2-3 columns tablet/desktop
- Data tables: Full-width with horizontal scroll on mobile

---

## Component Library

### Navigation
- **Top Navigation Bar**: Fixed header with logo, property selector dropdown, user menu, notification badge
- **Sidebar Navigation**: Collapsible on mobile, persistent on desktop with icon + label pattern
- **Breadcrumbs**: For deep navigation within guest/booking details

### Data Display
- **Dashboard Cards**: Metric cards showing key stats (today's arrivals, active alerts, device status) with icon, number, and trend indicator
- **Data Tables**: Sortable, filterable tables with row actions (view, edit, notify)
- **Timeline**: Vertical timeline for entry/exit events with timestamps and people count badges
- **Alert List**: Card-based alerts with severity indicators, timestamp, and action buttons

### Forms & Inputs
- **Form Fields**: Floating labels, clear validation states, helper text
- **Date/Time Pickers**: For reservation management
- **File Upload**: Drag-drop zones for license/face images
- **Multi-select**: For filtering and batch operations

### Action Components
- **Primary Button**: White shrimp pink background, white text, rounded-md
- **Secondary Button**: Outline with pink border, pink text
- **Danger Button**: Red background for critical actions (lock override)
- **Icon Buttons**: For device controls and quick actions
- **FAB (Floating Action)**: Bottom-right for quick "Add Booking" on mobile

### Feedback Elements
- **Toast Notifications**: Top-right positioned, auto-dismiss with progress bar
- **Alert Banners**: Full-width contextual alerts above content
- **Status Badges**: Pill-shaped indicators (booked/checked-in/checked-out)
- **Loading States**: Skeleton screens for tables, spinner for buttons

### Device Control Panel
- **Device Cards**: Visual representation of locks/breakers with large toggle/action buttons
- **Status Indicators**: Color-coded icons (green=active, gray=inactive, red=error)
- **Execution Log**: Compact log list with timestamp, action, result

---

## Specialized Dashboard Elements

### Guest Detail Page Layout
- **Hero Section**: Guest photo (if available) with name, reservation details
- **Info Grid**: 3-column grid (mobile: 1-col) showing age, phone, email, license preview
- **Tab Navigation**: Switch between Overview, Entry Logs, Alerts, Communication History
- **Action Toolbar**: Sticky footer with Call, Email, Device Control quick actions

### Alert Management
- **Alert Cards**: 
  - Header: Severity icon + "Reserved: 4, Actual: 6" in bold
  - Body: Guest name, room, detection timestamp
  - Footer: Action buttons (Acknowledge, Contact Guest, View Details)
- **Filtering**: Quick filters for Open/Acknowledged/Resolved

### Communication Panel
- **Template Selector**: Dropdown with pre-written messages (overbooking, check-in reminder)
- **Channel Tabs**: Switch between Email/Phone/SMS
- **Send History**: Table showing all communications with delivery status

---

## Animation Guidelines

**Minimal & Purposeful**:
- Page transitions: Simple 200ms fade
- Dropdown/modal: 150ms scale + fade
- Button feedback: Subtle 100ms background color transition
- NO scroll-triggered animations
- NO decorative motion

---

## Responsive Breakpoints

- Mobile: < 640px (sm) - Single column, collapsible nav
- Tablet: 640px - 1024px (md-lg) - 2-column cards, visible sidebar
- Desktop: > 1024px (xl) - Full multi-column layout, expanded nav

---

## Images

**Dashboard doesn't require hero images** - this is an operational tool. Images used are:
- **Guest Photos**: Small circular avatars (48px) in tables, large (200px) in detail view
- **License Images**: Thumbnail (80px) with click to enlarge modal
- **Empty States**: Simple illustrations for "No bookings today", "No alerts"
- **Device Icons**: SVG icons from Heroicons (lock, lightning bolt, bell)

No marketing imagery needed - focus on clear iconography and data visualization.
# Design Guidelines - Cultural Hub Social App

## 1. Brand Identity

**Purpose**: A social platform where users curate their cultural identity across films, series, music, anime, manga, and books in one unified profile.

**Aesthetic Direction**: Editorial/Magazine meets Modern Social
- Clean, content-first layouts with strong typographic hierarchy
- Sophisticated yet approachable
- Emphasis on user-generated content and curation
- Minimal decorative elements - let the cultural content shine

**Memorable Element**: The unified cultural profile as a personal "cultural portfolio" - a single hub for all media consumption.

## 2. Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs + Floating Action Button)

Tabs:
1. **Home** (Feed icon) - Social feed with posts and launches
2. **Search** (Search icon) - Global search across all media types
3. **Create** (Plus icon, Floating Action Button) - Create new post
4. **Profile** (User icon) - User profile with tabs

All screens use stack navigation within their respective tabs.

## 3. Screen-by-Screen Specifications

### 3.1 Authentication Screens

**Login Screen**
- Layout: Centered form on scrollable view
- Components:
  - App logo/wordmark at top
  - Email input field
  - Password input field
  - "Login" button (full width)
  - "Don't have an account? Sign up" text link
- Top inset: insets.top + Spacing.xl
- Bottom inset: insets.bottom + Spacing.xl

**Signup Screen**
- Similar to Login with additional name field
- Privacy policy and terms links below button

### 3.2 Home (Feed) Tab

**Home Screen**
- Header: Transparent, app wordmark centered, no back button
- Layout: Vertical scrollable feed (FlatList)
- Components:
  - Section header "Latest Releases" with subtle divider
  - Horizontal carousel of new releases (auto-generated posts)
  - Section header "Community Posts"
  - Vertical list of user posts
  - Each post card contains:
    - User avatar + name + timestamp
    - Media thumbnail (left) + title + type badge
    - Star rating display
    - Comment text (truncated if long)
    - Comment count icon + count
- Empty State: "empty-feed.png" illustration with "Start following users or create your first post"
- Top inset: headerHeight + Spacing.xl
- Bottom inset: tabBarHeight + Spacing.xl

**Post Detail Screen** (Modal)
- Header: Default with back button, "Post" title
- Layout: Scrollable
- Components:
  - Full post card (expanded)
  - Comments list below
  - Comment input at bottom (sticky)
- Bottom inset: insets.bottom + Spacing.xl

### 3.3 Search Tab

**Search Screen**
- Header: Large search bar, transparent background
- Layout: Scrollable results list
- Components:
  - Search input with filter chips below (Film, Series, Music, Anime, Manga, Books, All)
  - Results as media cards with thumbnail + title + year + type badge
- Empty State (no search): "empty-search.png" illustration with "Search across all media types"
- Empty State (no results): "no-results.png" illustration
- Top inset: headerHeight + Spacing.xl
- Bottom inset: tabBarHeight + Spacing.xl

**Media Detail Screen**
- Header: Transparent, back button, share button (right)
- Layout: Scrollable
- Components:
  - Hero section: Large thumbnail, title, year, genres
  - Stats row: Community average rating, number of reviews
  - Action buttons row:
    - "Rate & Review" (primary button)
    - Status dropdown (Want/Consuming/Completed)
    - "Add to List" icon button
  - Description text
  - Community reviews section
- Top inset: headerHeight + Spacing.xl
- Bottom inset: insets.bottom + Spacing.xl

### 3.4 Create (Floating Action Button)

**Create Post Modal**
- Presented as full-screen modal
- Header: "Cancel" (left), "Create Post" title, "Publish" (right, disabled until valid)
- Layout: Scrollable form
- Components:
  - Media type selector (horizontal chips)
  - Search input to find media
  - Selected media preview card
  - Star rating input (5 stars)
  - Multi-line text input for comment
- Top inset: Spacing.xl
- Bottom inset: insets.bottom + Spacing.xl

### 3.5 Profile Tab

**Profile Screen**
- Header: Transparent, settings button (right), no title
- Layout: Scrollable with nested tabs
- Components:
  - Profile header:
    - Avatar (large, centered)
    - Name
    - Bio
    - Stats row (Posts count, Reviews count)
  - Tab selector: Posts | Reviews | Lists | Status
  - Content area changes based on selected tab
- Top inset: headerHeight + Spacing.xl
- Bottom inset: tabBarHeight + Spacing.xl

**Profile Tab: Posts**
- Vertical list of user's posts (same card as feed)
- Empty State: "empty-posts.png"

**Profile Tab: Reviews**
- Grid of media thumbnails with star overlay
- Empty State: "empty-reviews.png"

**Profile Tab: Lists**
- Vertical list of custom lists
- "Create New List" button at top
- Each list shows name, item count, preview thumbnails
- Empty State: "empty-lists.png"

**Profile Tab: Status**
- Three sections: Want, Consuming, Completed
- Collapsible sections
- Grid of thumbnails
- Empty State: "empty-status.png"

**List Detail Screen**
- Header: Default, back button, "Edit" button (right)
- Layout: Scrollable
- Components:
  - List name + description
  - Grid of media items
  - Empty state if no items
- Bottom inset: insets.bottom + Spacing.xl

**Settings Screen**
- Header: Default, back button, "Settings" title
- Layout: Scrollable form
- Components:
  - Section: Account (Name, Email, Avatar upload, Bio)
  - Section: Preferences (Theme toggle, Notifications)
  - Section: Account Actions (Log out, Delete account nested)

## 4. Color Palette

**Primary**: #E63946 (Vibrant Red) - Editorial accent, CTAs, ratings
**Secondary**: #1D3557 (Deep Navy) - Headers, primary text
**Accent**: #457B9D (Muted Blue) - Links, secondary actions
**Background**: #F1FAEE (Off-White Cream) - Main background
**Surface**: #FFFFFF (White) - Cards, modals
**Text Primary**: #1D3557
**Text Secondary**: #A8DADC (Soft Teal)
**Border**: #E5E5E5
**Success**: #06D6A0
**Warning**: #F77F00

## 5. Typography

**Primary Font**: Montserrat (Google Font) - Bold, modern, editorial
**Secondary Font**: Inter (Google Font) - Clean, legible body text

**Type Scale**:
- Hero: Montserrat Bold, 32px
- Title: Montserrat Bold, 24px
- Heading: Montserrat SemiBold, 18px
- Body: Inter Regular, 16px
- Caption: Inter Regular, 14px
- Small: Inter Regular, 12px

## 6. Visual Design

- Use Feather icons from @expo/vector-icons
- Touchables have 10% opacity reduction on press
- Cards have subtle border, no shadow
- Floating Action Button (Create): Use drop shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- Star ratings use filled/outlined star icons in Primary color
- Media type badges use small chip style with type-specific colors

## 7. Assets to Generate

**App Identity**:
- `icon.png` - App icon with stylized cultural media grid
- `splash-icon.png` - Launch screen icon

**Empty States**:
- `empty-feed.png` - Minimalist illustration of empty feed (used: Home screen when no posts)
- `empty-search.png` - Magnifying glass with media icons (used: Search screen initial state)
- `no-results.png` - Simple "not found" visual (used: Search screen no results)
- `empty-posts.png` - Post icon outline (used: Profile Posts tab)
- `empty-reviews.png` - Star rating outline (used: Profile Reviews tab)
- `empty-lists.png` - List icon outline (used: Profile Lists tab)
- `empty-status.png` - Bookmark outline (used: Profile Status tab)

**User Avatars** (presets):
- `avatar-1.png` through `avatar-5.png` - Abstract geometric avatars in brand colors

All illustrations should use the brand color palette (red, navy, muted blue) with simple, clean line art style—no photographic elements.
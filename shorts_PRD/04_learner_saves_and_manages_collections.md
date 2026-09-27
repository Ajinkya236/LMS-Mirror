# PRD: Learner Saves to Collections and Manages Collections

## 1. Overview & Goal
Enable learners to save shorts into default or custom collections, create new collections via drag-to-dismiss bottom sheets, view collections in a clean 3x3 grid, and access dedicated collection pages with privacy and sharing controls.

## 2. User Persona
- **Role:** Enterprise Learner
- **Goal:** Organize bookmarked shorts into private or public custom collections for personal review or team sharing.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Save to Collection Modal / Bottom Sheet
- Triggered by clicking the Save (Bookmark) button on any short.
- Formatted as a mobile drag-to-dismiss bottom sheet drawer on mobile and centered modal on desktop.
- DOES NOT contain a top-right close `X` cross button; dismissal is done via dragging down or tapping backdrop.
- Features a top center drag handle bar.
- Contains a compact **`+ New collection`** button positioned above the saved collection list on the right-hand side.
- DOES NOT display generic promotional copy like "organize reels into private or public collections".
- Creating a new collection requires ONLY a Title input and Public/Private toggle. Description field is REMOVED.

### B. Collection List Item in Save Drawer
- Each collection row displays:
  - Collection thumbnail image on the left.
  - Collection title name on the right.
  - Active checkmark if the current short is saved inside.
- DOES NOT display item count or default tag labels in the drawer.

### C. Saved Tab in Profile & 3x3 Grid
- Navigating to Saved tab on Profile page displays a minimal header with a single `+` (Create Collection) button.
- DOES NOT display introductory helper texts like "folders and playlists for your bookmark learning".
- Collections are rendered in a clean **3x3 grid layout** (or list cards with thumbnail on the left, collection name and number of reels on the right).

### D. Dedicated Collection Page
- Clicking any collection card MUST open a standalone page (`/shorts/collection/:collectionId`).
- Top bar MUST feature a `<` (less-than symbol) back button.
- Displays collection Title name, Privacy badge (Public/Private), and total count of reels.
- MUST NOT display an "Add Reels" button.
- Custom (non-default) collections feature:
  - **Edit button:** Icon-only (`Edit3`), NO "Edit Name" text.
  - **Delete button:** Icon-only (`Trash2`), NO "Delete" text.
- Public collections feature:
  - **Share button:** Icon-only (`Share2`).
  - Clicking Share opens a bottom sheet with only the tiny URL (`https://jio.learn/c/:id`) and a copy link button with **icon only (`Copy` / `Check`)**, NO text.
- Default "Saved" collection is private, immutable, and cannot be deleted.
- Reels inside a collection can be removed by tapping the remove trash icon on the reel card.

---

## 4. Non-Functional Requirements (NFRs)
1. **Touch Gesture Support:** Drag-down gesture threshold smooth dismissal for mobile drawers.
2. **Data Consistency:** Immediate state updates across profile collections tab and save modals upon adding/removing items.
3. **URL Copy Reliability:** Clipboard API integration with fallback for sharing collection URLs.

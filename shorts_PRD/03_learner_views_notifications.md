# PRD: Learner Views Shorts Notifications

## 1. Overview & Goal
Provide a dedicated notifications page accessible strictly from the user's Profile page, enabling learners to view alerts regarding likes, comments, collection saves, and content approvals.

## 2. User Persona
- **Role:** Enterprise Learner / Content Creator
- **Goal:** View updates about interactions on published shorts, follower alerts, and system moderation decisions.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Access Control & Entry Point
- Notifications button (`Bell` icon) MUST be located at the **top-right corner of the Profile page** (`CreatorProfilePage`).
- Notifications button MUST NOT be present on the active video feed viewer page or search page.
- Clicking the Notification button MUST navigate directly to the dedicated Notifications page (`/shorts/notifications`).

### B. Notifications Page Interface
- The Notifications page MUST feature a top header with a `<` (less-than symbol) back button navigating back to the previous page.
- Top header title MUST display "Notifications" alongside an "Unread" filter toggle and a "Mark all as read" button.

### C. Notification List Item Structure
- Notifications list MUST render items grouped or listed chronologically.
- Each notification item MUST display:
  - Actor avatar and name.
  - Notification type icon (Like, Save, Follow, Comment, Moderation approval/rejection).
  - Concise description text (e.g., "liked your short", "saved your short to collection").
  - Timestamp.
  - Thumbnail preview of the target short (if applicable).
  - Unread visual indicator dot.
- Clicking a notification item MUST mark it as read and navigate to the target short or profile.

### D. Empty State & Read All
- An empty state illustration and message MUST render when no notifications are present.
- Clicking "Mark all as read" clears all unread indicator badges instantly.

---

## 4. Non-Functional Requirements (NFRs)
1. **Real-Time Sync:** Unread counter updates immediately upon new interaction events.
2. **Smooth Navigation:** Page transition to notifications completes in <200ms.
3. **Responsive Display:** Notification cards scale cleanly across mobile viewports and desktop web view.

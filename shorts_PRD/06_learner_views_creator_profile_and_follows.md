# PRD: Learner Views Creator Profile and Follows Creator

## 1. Overview & Goal
Allow learners to inspect the profile of other content creators, view their employee domain handle, explore their published learning shorts, and follow/unfollow creators to personalize feed subscriptions.

## 2. User Persona
- **Role:** Enterprise Learner
- **Goal:** Discover subject matter experts across the organization, review their published shorts, and follow them for content updates.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Creator Profile View
- Clicking creator name/avatar anywhere in the app navigates to `/shorts/creator/:creatorId`.
- Profile displays:
  - Creator Avatar.
  - Creator Full Name.
  - Creator Employee Domain Handle (e.g. `creator.name.patil`).
  - Role, Department, and Entity.
  - Follower count, Following count, Total Likes.
  - Creator Bio/About summary.

### B. Follow / Unfollow Mechanics
- Header MUST feature a prominent **Follow / Following** button.
- Unfollowed state shows blue "Follow" button with `UserPlus` icon.
- Tapping "Follow" instantly updates state to "Following" with check icon and increments follower count.
- Tapping "Following" toggles back to "Follow" state.
- Follow status updates immediately reflect across reel overlays and creator cards.

### C. Published Shorts Grid
- Displays grid of all published shorts created by this creator.
- Each grid item displays video thumbnail, title, view count, and duration.
- Clicking any grid item opens the reel viewer starting at that short.

---

## 4. Non-Functional Requirements (NFRs)
1. **Instant Follow Toggle:** Follow/unfollow response latency under 150ms.
2. **Data Consistency:** Follower counts synchronized in real-time across feed overlays and profile pages.
3. **Empty States:** Graceful empty state placeholder if creator has no public published shorts.

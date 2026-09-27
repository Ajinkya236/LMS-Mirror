# PRD: Learner Views Own Shorts Profile, and Manages Profile

## 1. Overview & Goal
Provide learners with a personalized profile hub to view their employee domain handle, track learning statistics, manage custom avatar/bio, view published shorts, and access bookmarked saved collections.

## 2. User Persona
- **Role:** Enterprise Learner / Employee
- **Goal:** Manage profile identity, review personal engagement stats, inspect created/saved shorts, and access notification settings.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Header & Top Navigation
- Header MUST display a `<` (less-than symbol) back button on top-left navigating back to `/shorts`.
- Header MUST display a **Notification button (`Bell` icon)** at the top-right corner.
- Clicking Notification button navigates directly to `/shorts/notifications`.

### B. Profile Info & Domain Display
- Profile picture avatar displayed on left with upload camera overlay icon.
- Profile header MUST display:
  - User Full Name (e.g., "Ajinkya Patil").
  - **Employee User Domain Handle** explicitly formatted under name (e.g., `ajinkya4.patil`).
  - Role title, department, and company entity (e.g. "Senior Software Engineer • Enterprise Engineering").
  - Follower count, Following count, and Total Likes received.
- Bio description text block with "Edit Profile" button.

### C. Profile Tabs Navigation
- Tab selection bar with tabs:
  - **Shorts:** Published shorts created by the user.
  - **Saved:** Saved collections hub with 3x3 grid display.
  - **Analytics:** Personal engagement stats (views, watch time, top topics).
  - **About:** Role details and enterprise skills.

### D. Profile Management Modal
- Clicking "Edit Profile" opens modal to modify:
  - Full Name.
  - Employee Domain Handle.
  - Bio description.
  - Avatar image URL or photo upload.
- Virtual keyboard support available when typing text in form fields.

---

## 4. Non-Functional Requirements (NFRs)
1. **Avatar Upload:** Fast local image preview generation under 100ms.
2. **Domain Uniqueness Format:** Standardized handle format `username.domain` for enterprise employees.
3. **State Persistence:** Local storage/state persistence for profile modifications across sessions.

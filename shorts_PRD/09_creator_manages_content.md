# PRD: Content Creator Manages Their Content

## 1. Overview & Goal
Enable creators to view all their submitted shorts, track submission approval status (Pending, Approved, Rejected), inspect feedback from content managers, edit draft details, or withdraw submissions.

## 2. User Persona
- **Role:** Content Creator / Employee Author
- **Goal:** Track status of submitted learning shorts, respond to rejection feedback, and manage published videos.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Creator Management Dashboard
- Accessible from profile page under "My Submissions" tab.
- Displays lists categorized by status badges:
  - **Pending:** Shorts awaiting manager review.
  - **Approved / Published:** Active shorts live on employee feeds.
  - **Rejected / Feedback Required:** Shorts requiring changes before re-submission.

### B. Handling Rejection Feedback
- Rejected items display manager feedback note (e.g. "Select Rejection Reason: Compliance guidelines violation").
- Creator can click "Edit & Resubmit" to update title, description, or tags based on manager feedback.
- Resubmitting resets status back to `pending` review.

### C. Deleting or Unpublishing Content
- Creator can delete unpublished drafts or request removal of approved shorts.
- Deletion requires a confirmation modal to prevent accidental data loss.

---

## 4. Non-Functional Requirements (NFRs)
1. **Status Accuracy:** Real-time reflection of manager approval/rejection events via notifications and dashboard status badges.
2. **Data Safety:** Deletion actions are guarded with confirmation prompts.
3. **Audit History:** Preserves manager rejection notes for audit reference during editing.

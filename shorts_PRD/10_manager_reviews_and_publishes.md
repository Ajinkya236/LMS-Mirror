# PRD: Content Manager Reviews and Publishes Learning Shorts

## 1. Overview & Goal
Provide content managers/administrators with a moderation portal (`ShortsModerationPage`) to audit pending short submissions, inspect video media and custom tags, approve content for public feed publishing, or reject content with predefined feedback.

## 2. User Persona
- **Role:** Content Manager / Enterprise Administrator
- **Goal:** Ensure all published learning shorts meet enterprise compliance, technical accuracy, and community quality standards.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Approval Portal Navigation (`ShortsModerationPage`)
- Features top portal section selector with 3 submenus:
  - **Content Management:** Submissions audit queue.
  - **Reported Content:** Violation reports review queue.
  - **Enterprise Tags:** Taxonomy and topic management.
- Content Management tab provides sub-filters for **Pending**, **Approved**, and **Rejected** queues.

### B. Audit Reel Workspace (`ShortsModerationPreviewPage`)
- Clicking "Audit Short" (`Eye` icon) on any submission item opens the dedicated Audit workspace (`/shorts/moderation/preview/:shortId`).
- Left column displays live 9:16 video player or photo carousel preview with audio playback controls.
- Right column displays metadata, author details, and custom tag audit options.

### C. Submission Approval & Rejection Flow
- **Approval:**
  - Manager clicks "Approve & Publish Short".
  - Sets short status to `approved`.
  - Content immediately publishes to all employee feeds, and author receives an approval notification.
- **Rejection:**
  - Manager clicks "Reject Short" to expand rejection options box.
  - MUST select a predefined rejection reason (e.g., "Violates Enterprise Community Guidelines", "Confidential Information Disclosed").
  - MUST type specific text feedback for the creator explaining required changes.
  - Clicking "Confirm Rejection & Notify Uploader" sets status to `rejected` and sends notification to creator with reason.

---

## 4. Non-Functional Requirements (NFRs)
1. **Audit Security:** Restricted portal access to authorized manager roles only.
2. **Review Speed:** Audit workspace preview renders video in under 300ms.
3. **Audit Trail:** Stores manager identity, timestamp, and rejection reason for compliance auditing.

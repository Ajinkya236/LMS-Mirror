# PRD: Content Manager Manages Reported Content

## 1. Overview & Goal
Enable content managers to review policy violation reports submitted by learners, audit flagged shorts, and take decisive action to either revoke content or dismiss invalid reports.

## 2. User Persona
- **Role:** Content Manager / Compliance Officer
- **Goal:** Audit reported policy violations quickly, uphold community safety, and revoke non-compliant content while dismissing false alarms.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Reported Content List View (`ShortsModerationPage`)
- Located under "Reported Content" tab in `ShortsModerationPage`.
- Features status sub-tabs: **Pending (Needs Action)**, **Approved / Dismissed (Content Kept)**, and **Rejected / Revoked**.
- **List View Item Structure:**
  - MUST NOT display Approve Content or Revoke Content buttons in the list view itself.
  - MUST display ONLY:
    1. **Reel Name** (`title`).
    2. **Violation Type** (e.g. `Violation: Misleading Content, Policy Violation`).
    3. **Audit Reel** button.
  - Nothing else is rendered in the list item row.

### B. Audit Reel Workspace (`ShortsModerationPreviewPage`)
- Clicking "Audit Reel" navigates to `/shorts/moderation/preview/:shortId`.
- Displays reported violation details card listing flag reason, reporter details, and timestamp.
- **Single Decision Buttons Set:**
  - Displays **`Revoke`** and **`Let Stay`** decision buttons **EXACTLY ONCE** on the page.
  - Duplicate decision sections or duplicate Revoke/Approve buttons MUST NOT render when auditing reported content.

### C. Taking Moderation Action
- **Let Stay (Dismiss Report):**
  - Clicking "Let Stay" dismisses open reports and keeps content active on employee feeds.
  - Uploader is NOT disturbed or notified.
- **Revoke Content:**
  - Clicking "Revoke" opens modal prompting for mandatory Audit Revoke Reason.
  - Confirming revoke immediately unpublishes content from employee feeds and notifies creator with the revocation reason.

---

## 4. Non-Functional Requirements (NFRs)
1. **Compliance Speed:** Urgent reported content queue highlighted with visual badge indicators for fast triage.
2. **Single-Action Guarantee:** UI architecture prevents duplicate decision button rendering to avoid user confusion.
3. **Audit Logging:** Full recording of reporter identity, violation category, manager decision, and uploader notification log.

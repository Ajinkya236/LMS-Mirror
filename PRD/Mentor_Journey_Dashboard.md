
# User Story: Mentor Journey Dashboard

## 1. Overview
**As a** Mentor,
**I want to** access a centralized dashboard to manage my mentoring activities,
**So that** I can handle incoming requests, track active mentorships (both 1:1 and programs), update my preferences, and view my history.

---

## 2. User Journey & Product Description

### Step 1: Dashboard Access & Profile Overview
*   **Action:** User navigates to **Mentoring > Mentor Journey**.
*   **Product Description:**
    *   **Header Section:** Displays Mentor's Profile Picture, Name, and Title (e.g., "Priya Sharma, Director of Engineering").
    *   **Action Buttons:**
        *   **"Find Programs":** Navigates to the "Discover Programs" page where the mentor can browse and apply to be a mentor for structured programs.
        *   **"Edit Preferences":** Opens a modal to update mentoring preferences (Ideal Mentee, Mentoring Philosophy, Max Mentees count).
*   **Rules/Conditions:**
    *   The "Find Programs" button is specific to the Mentor role.

### Step 2: Key Statistics & Navigation
*   **Action:** User views the high-level statistics cards.
*   **Product Description:**
    *   **Requests:** Count of pending requests requiring attention. Clicking sets the active tab to "Requests".
    *   **Active Mentorships:** Count of current 1:1 mentees. Clicking sets the active tab to "Active Mentorships".
    *   **Active Programs:** Count of programs currently mentoring in. Clicking sets the active tab to "Active Programs".
    *   **Completed:** Count of finished engagements. Clicking sets the active tab to "Completed".
*   **Rules/Conditions:**
    *   Counts must update in real-time based on status changes (e.g., accepting a request moves count from Requests to Active).

### Step 3: Managing Requests (Tab: Requests)
*   **Action:** User selects the **"Requests"** tab.
*   **Product Description:**
    *   **Filters:**
        *   **"Require Attention":** (Default) 1:1 requests from mentees waiting for approval.
        *   **"Programs Applied":** Applications sent by the mentor to join programs (Status: Pending/Waitlisted).
        *   **"Accepted":** History of accepted requests.
        *   **"Rejected":** History of rejected requests.
    *   **Request Card (1:1):** Shows Mentee Name, Grade, Topic, Note, and Goals.
        *   **Actions:** "Accept" (moves to Active) and "Reject" (prompts for reason, then moves to Rejected history).
    *   **Request Card (Program):** Shows Program Name, Status badge (e.g., "Pending Program Approval").
*   **Rules/Conditions:**
    *   Only "Pending Mentor Approval" requests show Accept/Reject buttons.
    *   Program applications are read-only status updates.

### Step 4: Tracking Active Mentorships (Tab: Active Mentorships)
*   **Action:** User selects the **"Active Mentorships"** tab.
*   **Product Description:**
    *   Displays a list of cards for current 1:1 mentees.
    *   **Card Content:** Mentee Name, Title/Grade, Topic.
    *   **Actions:**
        *   **"View Engagement":** Navigates to the **Mentorship Engagement Page** (1:1 view) to manage sessions, tasks, and notes.
        *   **"View Goals":** Opens a modal displaying the mentee's submitted goals.
*   **Rules/Conditions:**
    *   Clicking "View Engagement" passes the `userRole: 'mentor'` state to the next page.

### Step 5: Tracking Active Programs (Tab: Active Programs)
*   **Action:** User selects the **"Active Programs"** tab.
*   **Product Description:**
    *   Displays cards for Group Mentoring Programs the mentor is part of.
    *   **Card Content:** Program Title, Image, Topic (e.g., System Design).
    *   **Actions:**
        *   **"View Engagement":** Navigates to the **Program Engagement Page** (Group view) to manage cohort sessions, view enrolled mentees, and upload resources.
*   **Rules/Conditions:**
    *   Distinguishes between "Open" (1:1) and "Program" (Group) visually via tags.

### Step 6: Viewing History (Tab: Completed)
*   **Action:** User selects the **"Completed"** tab.
*   **Product Description:**
    *   Lists all past mentorships and programs.
    *   **Actions:**
        *   **"View Engagement":** Navigates to the engagement page in read-only mode (or with limited "Post-program feedback" actions).
*   **Rules/Conditions:**
    *   Completed engagements cannot be reopened from this view.

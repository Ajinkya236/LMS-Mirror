# User Story: Mentor Journey - Active and Completed Program Engagement Page

## 1. Overview
**As a** Mentor,
**I want to** manage my group mentoring program activities via a dedicated engagement page,
**So that** I can schedule sessions, track attendance, monitor cohort progress, share resources, and formally complete the program.

---

## 2. User Journey & Product Description

### Step 1: Accessing the Program Engagement Page
*   **Action:**
    *   From the **Mentor Journey Dashboard**, the user clicks "View Engagement" on a card in the "Active Programs" or "Completed" tab.
*   **Product Description:**
    *   **Header:** Displays Program Title, Image, "Mentoring Program" tag, and Type tag (e.g., "Group Mentoring").
    *   **Mentor Info:** Shows "With [Mentor Name]" (Self).
    *   **Dashboard Statistics:**
        *   **Expected Sessions:** Total planned sessions defined in program setup.
        *   **Scheduled Sessions:** Count of sessions currently created.
        *   **Completed Sessions:** Count of sessions marked as complete.
        *   **Assigned Courses:** Total unique courses assigned across the cohort.
    *   **Attendance Requirement:** Displays the minimum attendance percentage required for mentees to certify.
    *   **Primary Action (Active):** "End Engagement" button (Red) to conclude the program.
    *   **Primary Action (Completed):** "View Certificate" button (Green) (if applicable/generated).

### Step 2: Managing Sessions (Tab: Sessions)
*   **Action:** User selects the **"Sessions"** tab (Default).
*   **Product Description:**
    *   **"Add Session" Button:** (Active Programs only) Opens a modal to schedule a new session.
        *   **Fields:** Title, Category (Workshop, Q&A, etc.), Date, Start Time, End Time, Agenda.
    *   **Sessions List:** Table displaying Session Title, Date & Time, Actions, and Status.
    *   **Session Actions:**
        *   **"Start Session":** Visible if the session is currently "Upcoming" and within the time window.
        *   **"Mark as Complete":** Visible for past/open sessions. Updates status to "Completed".
        *   **Attendance:** Accessed via the "More" (three-dot) menu. Opens a modal to mark specific mentees as Present, Absent, or Pending.
        *   **Edit/Delete:** Accessed via the "More" menu.
        *   **Notes Icon:** Opens a modal to view/edit shared notes (Mentor Note, Mentee Note) and tasks specific to that session.
*   **Rules/Conditions:**
    *   Sessions cannot be edited if the program is "Completed".
    *   Attendance must be saved to update the "Attended Sessions" count for mentees.

### Step 3: Viewing Cohort Mentees (Tab: Mentees)
*   **Action:** User selects the **"Mentees"** tab.
*   **Product Description:**
    *   Displays a grid or list of all enrolled mentees.
    *   **Card Content:** Mentee Photo, Name, and Grade/Title.
    *   **Interaction:** Clicking a mentee card navigates to the **Mentee Program Progress Page** (`/program-engagement/:programId/mentee/:menteeId`) to view individual attendance, course progress, and tasks.

### Step 4: Managing Assigned Courses (Tab: Assigned Courses)
*   **Action:** User selects the **"Assigned Courses"** tab.
*   **Product Description:**
    *   Displays a grid of course cards assigned to the program cohort.
    *   **Card Content:** Course Image, Title, Provider, Status tags.
*   **Rules/Conditions:**
    *   Shows an aggregate view of courses involved in the program.

### Step 5: Managing Resources (Tab: Reference Docs)
*   **Action:** User selects the **"Reference Docs"** tab.
*   **Product Description:**
    *   **"Add Document" Button:** (Active Programs only) Opens a form to upload a file (mock) and enter a Title.
    *   **Documents List:** Shows Title, Uploaded By, Date, and a Download button.
*   **Rules/Conditions:**
    *   Uploaded documents are visible to all mentees in the program.

### Step 6: Viewing Session Outline (Tab: Sessions Outline)
*   **Action:** User selects the **"Sessions Outline"** tab.
*   **Product Description:**
    *   Displays the structured curriculum/outline defined during program creation.
    *   **Accordion View:** Each item shows Title and Details (expandable).
*   **Rules/Conditions:**
    *   Read-only view for reference during the program.

### Step 7: Ending the Engagement
*   **Action:** User clicks the **"End Engagement"** button in the header.
*   **Product Description:**
    *   **Feedback Modal:** Prompts the mentor to provide a star rating (1-5) and textual feedback/remarks about the program batch.
    *   **Confirmation:** Clicking "End Engagement" in the modal transitions the program status to "Completed".
*   **Rules/Conditions:**
    *   This action moves the program to the "Completed" tab in the dashboard.
    *   No further sessions can be added or edited after this step.

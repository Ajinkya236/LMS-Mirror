
# User Journeys: Job Role Based Personalization

## 1. Overview
Job Role Based Personalization ensures that every employee, from an intern to a C-suite executive, sees an LMS interface tailored to their specific function, grade, and career trajectory. This reduces "search fatigue" and aligns individual learning with organizational goals.

---

## 2. Key Personas

| Persona | Role | Grade | Focus Area |
| :--- | :--- | :--- | :--- |
| **Arjun (The Builder)** | Senior Software Engineer | L5 | Technical depth, System Architecture, Cloud Certifications. |
| **Sarah (The Seller)** | Regional Sales Manager | L6 | Team Management, Revenue Strategy, Negotiation, Compliance. |
| **Vikram (The Leader)** | VP of Operations | L8 | Strategy, Organizational Health, Mentoring, Industry Trends. |

---

## 3. User Journeys

### Journey 1: The "Role-Ready" Start (Arjun - Engineer)
**Goal:** Enable the user to become productive in their specific tech stack immediately.

1.  **Trigger:** Arjun logs in. His HR data indicates `Function: Technology` and `Role: Backend Engineer`.
2.  **System Action:**
    *   **Homepage "For your Job" Row:** Populates with "Microservices with Java", "AWS Security Standards", and "Internal Coding Guidelines".
    *   **Skills Modal:** Pre-selects "Java", "Spring Boot", and "Kubernetes" as suggested skills.
3.  **User Action:**
    *   Arjun confirms the skills.
    *   He sees a **"Trending Now in your Job Role"** row featuring a new course on "AI-Assisted Coding" (ranked #1 because other engineers are watching it).
4.  **Outcome:**
    *   Arjun skips generic soft-skills content and dives straight into technical material relevant to his daily tasks.

### Journey 2: The Leadership Transition (Sarah - Sales Manager)
**Goal:** Support vertical movement from mid-level management to senior leadership.

1.  **Context:** Sarah is an L6 Manager aspiring for an L7 Director role.
2.  **System Action:**
    *   **Homepage "For your next level Job" Row:** Identifies the gap between L6 and L7 competencies.
    *   Displays courses like: *"Strategic Financial Planning"*, *"Leading Large Teams"*, and *"Executive Presence"*.
3.  **User Action:**
    *   Sarah clicks on "Strategic Financial Planning".
    *   The system prompts: *"This skill is crucial for L7 roles. Would you like to find a Mentor for this?"*
4.  **Outcome:**
    *   Sarah enrolls in the course and applies for the *"Senior Management Fast Track"* mentorship program (Closed Program) visible only to L6+ employees.

### Journey 3: The Knowledge Giver (Vikram - VP)
**Goal:** Leverage senior roles to generate content and mentor others.

1.  **Trigger:** Vikram logs in. His profile is tagged as `Senior Leadership`.
2.  **System Action:**
    *   **Dashboard:** Highlights a "Mentoring" widget prominently.
    *   **Notifications:** "3 High-Potential Managers (L6) in Operations are looking for mentorship in Strategy."
3.  **User Action:**
    *   Vikram accesses the **Mentor Journey Dashboard**.
    *   He accepts a request from a promising Sales Manager.
    *   He uses the **"Create Program"** feature to draft a "Operational Excellence Masterclass" for internal distribution.
4.  **Outcome:**
    *   The system utilizes the expert's knowledge to upscale the organization, creating a cycle of learning.

### Journey 4: Compliance & Role Safety (Blue Collar / Field Staff)
**Goal:** Ensure mandatory safety and compliance training is completed first.

1.  **Context:** A Field Technician logs in via mobile.
2.  **System Action:**
    *   **Homepage:** Hides "Explore" and "Trending" sections initially.
    *   **Hero Section:** Replaced by a **"Mandatory Compliance"** block.
    *   **Content:** Shows "Site Safety Protocols", "Equipment Handling", and "POSH Awareness".
3.  **User Action:**
    *   User sees a "Due in 3 Days" badge.
    *   Completes the video modules.
4.  **Outcome:**
    *   Only after completing mandatory role-based safety training does the rest of the catalog unlock (optional configuration), ensuring compliance is prioritized.

---

## 4. System Logic Table

| Feature | Logic Source | Experience Impact |
| :--- | :--- | :--- |
| **"For your Job"** | `User.Department` + `User.Designation` | Shows content mapped to current competency framework. |
| **"For your next level"** | `User.Grade` + 1 | Shows content mapped to the next grade in the hierarchy. |
| **"Trending in Role"** | `Peer Activity` + `User.Function` | Shows what peers with the same Job Title are consuming. |
| **Mentorship Visibility** | `User.Grade` (Mentee vs Mentor) | L5+ can be Mentors; L1-L4 are nudged to be Mentees. |
| **Program Access** | `Program.TargetAudience` matching `User.Attributes` | "Closed" programs only appear if the user matches specific criteria (e.g., High Potential). |

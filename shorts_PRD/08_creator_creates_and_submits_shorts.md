# PRD: Content Creator Creates and Submits Learning Short

## 1. Overview & Goal
Provide employees with a creator portal to author, record/upload, tag, and submit bite-sized educational video shorts or photo carousels for enterprise moderation and publishing.

## 2. User Persona
- **Role:** Employee / Subject Matter Expert / Content Creator
- **Goal:** Share quick technical knowledge, code tips, or product demos with colleagues across the company.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Creation Studio Modal / Drawer
- Triggered by clicking the Create Short (`+`) button from reel header or profile page.
- Supports two media format choices:
  - **Video Short:** Upload vertical 9:16 MP4 video file or record via web camera.
  - **Photo Carousel:** Upload deck of up to 5 image slides with optional audio voiceover track.

### B. Form Metadata Requirements
- **Title (Required):** Short title describing the learning concept.
- **Caption / Description:** Text summary explaining the key take-aways.
- **Learning Tags Selection:**
  - Select from predefined enterprise admin tags.
  - Input custom tag suggestions (entered without hashtags).
  - Custom tag input MUST NOT require or force `#` symbols.
- Description is NOT required when creating collections, but mandatory or optional for shorts submission.
- On-screen virtual keyboard toggle MUST be accessible for text inputs.

### C. Submission & Moderation Status Flow
- Submitting a short sets its status to `pending` review.
- Toast confirmation informs creator: "Short submitted for manager approval!".
- Short appears in creator's "Pending Approvals" list until reviewed by Content Manager.

---

## 4. Non-Functional Requirements (NFRs)
1. **File Validation:** Video file upload max size 100MB, duration cap 90 seconds.
2. **Upload Progress Indicator:** Visual progress bar during video asset processing.
3. **Form Resilience:** Draft retention if creator accidentally minimizes creation studio.

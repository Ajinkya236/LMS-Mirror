# PRD: Content Manager Manages Enterprise Tags

## 1. Overview & Goal
Enable content managers to standardize enterprise learning taxonomy by creating admin tags, auditing creator-suggested custom tags, filtering tags by creator role, and removing outdated topics.

## 2. User Persona
- **Role:** Content Manager / Taxonomy Admin
- **Goal:** Maintain clean, standardized enterprise learning topics for accurate content discovery across departments.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Enterprise Tags Portal Section
- Located under "Enterprise Tags" tab in `ShortsModerationPage`.
- Top section includes "Add Enterprise Learning Tag" creation form.
- Admin enters standardized topic name without hashtags (e.g. `DistributedSystems`, `Microservices`).
- Clicking "Add Admin Tag" adds tag to global enterprise taxonomy.

### B. 3-Way Tag Filter
- Filter toolbar allows toggling between:
  - **All Tags:** Complete tag list with total count badge.
  - **Admin-Created:** Tags created directly by administrators.
  - **User-Created:** Custom tags suggested by creators in their short submissions.
- Search input enables quick filtering within selected tag subset.

### C. Custom Tag Approval in Audit Workspace
- When auditing a short with custom creator-suggested tags:
  - "Approve Tag" button approves tag and promotes it into global enterprise taxonomy.
  - "Do Not Approve" button discards tag from the short.
- Active tags displayed on short use neutral styling without forced `#` symbols.

### D. Deleting Enterprise Tags
- Manager can delete existing tags from the platform.
- Confirmation dialog prevents accidental taxonomy deletion.

---

## 4. Non-Functional Requirements (NFRs)
1. **Uniqueness Enforcement:** Case-insensitive duplicate tag prevention.
2. **Instant Search:** Tag list filtering with zero noticeable latency.
3. **Data Integrity:** Graceful detachment of deleted tags from historical shorts without breaking video playback.

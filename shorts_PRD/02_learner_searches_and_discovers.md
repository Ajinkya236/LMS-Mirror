# PRD: Learner Searches and Discovers Learning Shorts

## 1. Overview & Goal
Provide learners with search and discovery tools to find relevant educational shorts, search by keyword or topic, filter by enterprise tags, and view curated topic pages.

## 2. User Persona
- **Role:** Enterprise Learner
- **Goal:** Discover specific technical topics, browse learning tags, and search for shorts matching current skills or interest.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Search Page Interface
- Search page MUST feature a clean light mode theme (`bg-gray-50 text-gray-900`).
- The top header MUST contain a back button, search input field with clear (`X`) button, and virtual keyboard toggle button.
- Notification icon MUST NOT be present on the search page header.
- On-screen virtual keyboard MUST be toggleable for mobile and interactive desktop text input.

### B. Submenu Toggle (Reels vs. Tags)
- Positioned directly below the search bar, a toggle submenu with compact icon buttons MUST allow switching between:
  - **Reels Tab:** Search matching short video titles and descriptions.
  - **Tags Tab:** Search and browse enterprise topics/tags.

### C. Tags Search & Topic Discovery
- In the Tags view, category MUST be labeled cleanly as **Tags** (not "Hashtags").
- Each topic item in the list MUST show:
  - Only the **Topic Name**.
  - The **Number of Reels** associated with that topic.
- The tag item MUST NOT display subtitle descriptions, match scores, top writers, or extra decorative icons.
- Clicking on a tag item MUST navigate to search results filtered specifically for that topic tag.

### D. Search Results Grid & Playback
- Search results for shorts MUST display in a responsive grid.
- Each result card MUST show thumbnail preview, title, creator name, duration badge, and view count.
- Clicking any result card MUST open the video player centered on that short.

---

## 4. Non-Functional Requirements (NFRs)
1. **Search Speed:** Instant search filtering results as user types, with debounce under 200ms.
2. **Clutter-Free Visuals:** Minimalist UI layout prioritizing content visibility over heavy decorative elements.
3. **Keyboard Accessibility:** Complete virtual keyboard input support without breaking layout.

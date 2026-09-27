# PRD: Learner Consumes and Interacts with Learning Shorts

## 1. Overview & Goal
Enable learners to watch short-form educational videos and photo carousels in a vertical, immersive media player. Provide seamless social interactions (like, share, save to collection) and adaptive layout support for both desktop web view and mobile view.

## 2. User Persona
- **Role:** Enterprise Learner / Employee
- **Goal:** Quickly consume bite-sized technical/educational knowledge, engage with relevant learning content, and interact via like, share, and save actions.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Desktop Web View Layout
- The reel player MUST feature a 3-column layout on desktop web view.
- The **left side (outside the reel video)** MUST contain:
  - Create Short button (`+`) or Back button.
  - Content Creator profile avatar, full name, employee handle (`ajinkya4.patil`), department, and Follow button.
  - Reel title, full description / caption, and topic tags.
  - Audio track title with music icon.
- The **center column** MUST display the 9:16 vertical media player container.
- The **right side (outside the reel video)** MUST contain:
  - Search icon button and Profile icon button at the top-right.
  - Action column containing:
    - **Like (Heart) button** with live counter.
    - **Share button** with live share count.
    - **Save (Bookmark) button** for collection bookmarking.
    - **Three-dot (More Options) button** for options menu (e.g., Report content).
    - **Up/Down Chevrons** for vertical reel navigation.
  - Notifications icon button MUST NOT be present on the watching short page.

### B. Mobile View Layout
- On mobile screens, controls and overlay information MUST render directly over the 9:16 video viewport with vertical gradient overlays for legibility.
- The mobile top overlay MUST include:
  - Create Short (`+`) / Back button on top-left.
  - Search icon and Profile icon on top-right.
- The mobile bottom overlay MUST include creator avatar, name, caption/title, and tags.
- The right action column MUST include Heart (like), Share, Save, and Three-dot buttons.

### C. Media Playback & Controls
- Single tap on video toggles pause and play state.
- A centered pause/play indicator appears when video is paused.
- Double tap anywhere on video triggers a heart burst animation and likes the short.
- Long-press / hold on video accelerates playback to 2x speed with a "2X SPEED" badge indicator.
- Single tap mute/unmute button toggles audio state.
- Thin progress bar at the bottom indicates video completion percentage.

### D. Social Engagement
- Clicking the Like (Heart) button toggles liked state and increments/decrements count.
- Clicking Share button opens a share modal/menu with copy link functionality.
- Clicking Save (Bookmark) button opens the "Save to Collection" bottom sheet drawer.

---

## 4. Non-Functional Requirements (NFRs)
1. **Response Time:** Video playback initiation and tap response time must be under 300ms.
2. **Responsive Design:** Seamless transitions between mobile (<768px) and desktop web view (>=768px) layouts without broken elements.
3. **Usability & Accessibility:** Visual contrast compliance for overlays against bright video backgrounds using gradient backdrops.
4. **Performance:** Auto-preload next adjacent reel in background for smooth continuous scrolling.

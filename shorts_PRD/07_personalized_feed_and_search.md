# PRD: Personalized Learning Shorts Feed and Search

## 1. Overview & Goal
Deliver a personalized vertical video feed based on learner interests, followed creators, department tags, and search query parameters.

## 2. User Persona
- **Role:** Enterprise Learner
- **Goal:** Consume continuous, contextually relevant learning content customized to user department, skills, and followed SME creators.

---

## 3. Functional Requirements & Acceptance Criteria

### A. Feed Personalization & Ranking
- Feed algorithm prioritizes shorts based on:
  - Followed creators' newly published shorts.
  - User's department tags and skill topics.
  - High engagement metrics (likes, saves, completions).
- Supports seamless vertical swiping or chevron navigation between items.

### B. Deep-Linking & Source Parameter Handling
- Supports URL query parameters (e.g. `/shorts?shortId=xyz`, `/shorts?source=profile`, `/shorts?topic=Microservices`).
- When opened with a specific `shortId`, feed opens centered directly on that short.
- When opened from a profile or search page (`source=profile` or `source=search`), top-left button shows a `<` Back button returning to source.

### C. Continuous Scroll & Preloading
- Infinite scroll loop seamlessly appends additional shorts as user reaches the end of current queue.
- Preloads adjacent video assets to avoid buffering delays during vertical swipes.

---

## 4. Non-Functional Requirements (NFRs)
1. **Feed Load Time:** Initial feed render and first video start under 400ms (Doherty Threshold compliant).
2. **Smooth Scrolling:** 60fps vertical swipe animations on touch devices.
3. **Bandwidth Optimization:** Adaptive video asset loading to minimize memory footprint.

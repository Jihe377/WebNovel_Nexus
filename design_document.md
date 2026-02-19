# Design Document: WebNove Nexus
## 1. Project Description 
Currently, the landscape of internet novels (web fiction, serialized online stories, fanfiction) is highly fragmented. Readers consume content across dozens of disparate platforms like Royal Road, Wattpad, AO3, Scribble Hub, and various translation sites. To create a centralized web application that acts as a universal "bookshelf" for internet novels. It will allow users to track what they read regardless of source, gauge community sentiment through ratings, and discover new content through personalized recommendation algorithms. 

## 2. Technical Stack
 - Frontend: Bootstrap, HTML
 - Backend: Node.js, Express
 - Database: MongoDB

## 3. User Personas

### Persona 1 — The Power Reader (Alex, 24)
Alex reads 5–10 chapters of serialized web novels daily across Royal Road, Wattpad, and a handful of fan-translation sites. They constantly lose track of which chapter they stopped on for each title, and switching between tabs and bookmarks is frustrating. Alex wants one dashboard that shows all their in-progress novels with a direct link to the source and a chapter note field.
 - Goals: Track reading progress, never lose their place, quickly resume reading.
 - Pain Points: No cross-platform progress tracking, managing browser bookmarks is chaotic.

### Persona 2 — The Niche Seeker (Mei, 19)
Mei exclusively reads Xianxia, LitRPG, and Progression Fantasy. She's frustrated that mainstream book sites either don't carry these genres or use generic tags that don't match web fiction conventions. She spends hours manually filtering results and still ends up with poorly matched recommendations.
 - Goals: Find novels with very specific tags/tropes fast, avoid content she dislikes (e.g., harem, NTR).
 - Pain Points: Generic tag systems on existing platforms, no negative filtering, no web-fiction-aware recommendations.

### Persona 3 — The Community Member (Jordan, 28)
Jordan loves discussing web fiction with others who actually understand the difference between a "system apocalypse" story and a standard fantasy. They want to create curated reading lists to share with their Discord communities, follow trusted readers with similar tastes, and write reviews that reference tropes without having to explain them from scratch.
 - Goals: Share curated lists, follow other readers, write community-relevant reviews.
 - Pain Points: Existing platforms (Goodreads) have audiences unfamiliar with web fiction conventions; no social layer built around this niche.


## 3. User Stories

### Story 1 — Adding a Novel (Power Reader)
Alex is reading a LitRPG on Royal Road that doesn't exist on any mainstream database. They open NovelNest, click "Add Novel," fill out a form with the title, author, source URL, genre tags (LitRPG, Dungeon Core), and current chapter (Ch. 347). NovelNest saves this to their personal bookshelf. The next day, Alex opens their dashboard, sees the novel listed with the chapter note, and clicks the source link to resume reading immediately.
This story exercises: the Add Novel form (at least 1 form requirement), the Novels MongoDB collection, CREATE operation.

### Story 2 — Filtering by Niche Tags (Niche Seeker)
Mei opens NovelNest's Discover page and selects "Xianxia" and "Cultivation" from the tag filter panel, then adds "Harem" to her exclusion list. The page re-renders client-side, showing only novels that match her included tags and contain none of her excluded ones. She finds a highly-rated title she hadn't seen before and adds it to her "Want to Read" list.
This story exercises: client-side rendering, tag filtering logic, READ operations on the Novels collection.

### Story 3 — Writing a Review (Community Member)
Jordan finishes a novel and navigates to its detail page. They click "Write Review," fill out a star rating (1–5), a review body using community-recognized terminology ("great face-slapping arc, weak side characters"), and submit. The review appears immediately on the novel's page. Other users can see Jordan's review and upvote it.
This story exercises: the Reviews MongoDB collection, CREATE + READ operations, at least 1 form.

### Story 4 — Getting Personalized Recommendations (Niche Seeker)
Mei navigates to her Recommendations page. NovelNest analyzes her bookshelf tags — the genres and tropes of novels she rated 4–5 stars — and surfaces the top 10 novels in the database that share the most tag overlap. Mei can also click "I don't like this trope" on any displayed tag to downweight it in future recommendations.
This story exercises: recommendation algorithm (tag-overlap scoring), READ across the Novels collection, UPDATE on user preference data.

## 4. Design Mockups
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/ef75d314-2767-4531-a7bb-6fbaf40754a8" />
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/b06c70bc-939c-438e-a587-7bb9900ee644" />
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/6d60c113-0ca2-4ecc-bcb5-e93d3347bbe5" />



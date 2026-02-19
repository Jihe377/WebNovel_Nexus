# Design Document: WebNove Nexus
## 1. Project Description 
Currently, the landscape of internet novels (web fiction, serialized online stories, fanfiction) is highly fragmented. Readers consume content across dozens of disparate platforms like Royal Road, Wattpad, AO3, Scribble Hub, and various translation sites. To create a centralized web application that acts as a universal "bookshelf" for internet novels. It will allow users to track what they read regardless of source, gauge community sentiment through ratings, and discover new content through personalized recommendation algorithms. 

## 2. Technical Stack
 - Frontend: Bootstrap, HTML
 - Backend: Node.js, Express
 - Database: MongoDB

## 3. User Personas

### Persona 1 — The Power Reader (Alex, 24)
Individuals who consume a high volume of serialized web content weekly across multiple hosting sites. Alex wants one dashboard that shows all his novels with a direct link to the source.
 - Goals: Track all their novels, never lose their place, quickly resume reading.
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
Alex is reading a LitRPG on Royal Road that doesn't exist on any mainstream database. They open NovelNest, click "Add Novel," fill out a form with the title, author, source URL, genre tags, and current status. The new novel will add to our novel libary.
This story exercises: the Add Novel form (at least 1 form requirement), the Novels MongoDB collection, CREATE operation.

### Story 2 — Filtering by Niche Tags (Niche Seeker)
Mei opens  Discover page and selects "Xianxia" and "Cultivation" from the category and tag filter panel, then adds "Harem" to her exclusion list. The page re-renders client-side, showing only novels that match her included tags and contain none of her excluded ones. She finds a highly-rated title she hadn't seen before and adds it to her "Want to Read" list.
This story exercises: client-side rendering, tag filtering logic, READ operations on the Novels collection.

### Story 3 — Writing a Review (Community Member)
Jordan finishes a novel and navigates to its detail page. They click "Write Review," fill out a star rating (1–5), a review body using community-recognized terminology ("great face-slapping arc, weak side characters"), and submit. The review appears immediately on the novel's page. Other users can see Jordan's review and upvote it.
This story exercises: the Reviews MongoDB collection, CREATE + READ operations, at least 1 form.

### Story 4 — Getting Personalized Recommendations (Niche Seeker)
Mei navigates to her Recommendations page. NovelNest analyzes her bookshelf tags — the genres and tropes of novels she rated 4–5 stars — and surfaces the top 5 novels in the database that share the most tag overlap.
This story exercises: recommendation algorithm (tag-overlap scoring), READ across the Novels collection, UPDATE on user preference data.

## 4. Design Mockups
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/ef75d314-2767-4531-a7bb-6fbaf40754a8" />
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/4f9e9c43-d91c-4b96-b28e-68364c7791d4" />
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/b06c70bc-939c-438e-a587-7bb9900ee644" />
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/6d60c113-0ca2-4ecc-bcb5-e93d3347bbe5" />

## 5. Work Distribution
### Danyan Gu -- Novel Search, Discover, and Add Novel
Danyan Gu will lead the design and implementation of the novel search infrastructure, including metadata extraction pipelines and advanced filtering systems. She will architect the search index and develop the query interface, enabling users to discover novels across multiple sources using web-novel-specific tags, tropes, and metadata filters. Additionally, she will build the "Add Novel" page to support full CRUD operations for the novel dataset.

### Xing Zhou -- Homepage, Novel Detail with Recommendation, and Add Review
Xing Zhou will lead the development of the Homepage, which will display ranked categories based on user reading statistics. She will also design and implement recommendation algorithms for the novel detail page, utilizing machine learning techniques to cluster and suggest novels with similar categories and tags. Additionally, he will build the "Add Review" feature to support full CRUD operations for the review dataset.



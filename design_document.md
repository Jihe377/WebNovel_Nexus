# Design Document: WebNove Nexus
## 1. Project Description 
Currently, the landscape of internet novels (web fiction, serialized online stories, fanfiction) is highly fragmented. Readers consume content across dozens of disparate platforms like Royal Road, Wattpad, AO3, Scribble Hub, and various translation sites. To create a centralized web application that acts as a universal "bookshelf" for internet novels. It will allow users to track what they read regardless of source, gauge community sentiment through ratings, and discover new content through recommendation algorithms. 

### Core Features
 - Browse Novels: A homepage to browse all novels by category
 - Novel Rank: Ranked category by readings
 - Novel detail: A novel detail page, where I can see the name, author, category, tags and status of the novels
 - Recommendation: Based on the novel I selected, I can recommend novels for myself
 - Tag selection: I can search novels by category and tags
 - Add Novel: I can add my own novel source
 - Add booklist: I can add novels to my bookshelf

### Technical Stack
 - **Frontend:** Bootstrap, HTML
 - **Backend:** Node.js, Express
 - **Database:** MongoDB

### Database Schema
**Database**: 'novel_db'\
**Type**: MongoDB\
**Collections**: 2

#### Collection 1: NOVEL
Stores web novel metadata and content information.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | MongoDB auto-generated primary key |
| `id` | Number | Custom novel ID (901, 902, etc.) |
| `book_name` | String | Novel title |
| `author` | String | Author name |
| `genre` | String | Primary genre (e.g., "Fanfiction", "Romance") |
| `source_url` | String | External link to novel source |
| `description` | String | Plot summary or synopsis |
| `read` | Number | Read count for ranking |
| `tag1` | String | Primary tag/trope |
| `tag2` | String | Secondary tag |
| `tag3` | String | Tertiary tag |
| `cover_url` | String | Novel cover image URL |
| `status` | String | Completion status ("completed", "ongoing", etc.) |

#### Collection 2: REVIEW
Stores user reviews and ratings for novels.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | MongoDB auto-generated primary key |
| `novelId` | Number | Reference to NOVEL.id (foreign key) |
| `username` | String | Reviewer name |
| `rating` | Number | Star rating (1-5 scale) |
| `body` | String | Review text content |
| `createdAt` | String | Review date (MM/DD/YYYY format) |

## 2. User Personas

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
 - Pain Points: Existing platforms (Goodreads) have audiences unfamiliar with web fiction conventions; no social layer has been built around this niche.

## 3. User Stories

### Filtering by Niche Tags (Niche Seeker)
 - US1: As a Niche Seeker, I want to filter by web-novel-specific tags, so that I can find exactly what I'm craving.\
 - US2: As a Niche Seeker, I want to exclude specific tags/tropes from search results so that I can avoid content I dislike.

### Adding a Novel (Power Reader)
 - US3: As a Power Reader, I want to manually add novels from any format, so that I can track them in one place.

### Writing a Review (Community Member)
 - US4: As a Community Member, I want to write a review of a novel.
 - US5: As a Community Member, I want to see my review immediately on the novel's page once I have submitted my review.

### Recommendations (Niche Seeker)
 - US6: As a Niche Seeker, I want to see recommended novels based on novels viewed.

### Community Booklist (Community Member)
 - US7: As a Community Member, I want to follow other users' booklists.
 - US8: As a Community Member, I want to unfollow other users' booklists.

### Day/Night Mode
 - US9: As a website user, I want to switch Day and Night mode.

## 4. Design Mockups
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/ef75d314-2767-4531-a7bb-6fbaf40754a8" />
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/4f9e9c43-d91c-4b96-b28e-68364c7791d4" />
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/6d60c113-0ca2-4ecc-bcb5-e93d3347bbe5" />
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/3d85aabd-f846-4c17-ab4e-fa7516915ba8" />
<img width="420" height="532" alt="image" src="https://github.com/user-attachments/assets/b06c70bc-939c-438e-a587-7bb9900ee644" />

## 5. Work Distribution
### Danyan Gu -- Novel Search, Discover, and Add Novel
Danyan Gu will lead the design and implementation of the novel search infrastructure, including metadata extraction pipelines and advanced filtering systems. She will architect the search index and develop the query interface, enabling users to discover novels across multiple sources using web-novel-specific tags, tropes, and metadata filters. Additionally, she will build the "Add Novel" page to support full CRUD operations for the novel dataset.

### Xing Zhou -- Homepage, Novel Detail with Recommendation, and Add Review
Xing Zhou will lead the development of the Homepage, which will display ranked categories based on user reading statistics. She will also design and implement recommendation algorithms for the novel detail page, utilizing machine learning techniques to cluster and suggest novels with similar categories and tags. Additionally, he will build the "Add Review" feature to support full CRUD operations for the review dataset.



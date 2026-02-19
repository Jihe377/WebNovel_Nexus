# WebNovel Nexus

A centralized web application for tracking, discovering, and reviewing internet novels (web fiction, serialized stories, fanfiction) across platforms like Royal Road, Wattpad, AO3, and more.

**Live Demo:** [https://webnovel-nexus.onrender.com](https://webnovel-nexus.onrender.com)

---

## Features

- **Homepage / Novel Rank** — Browse the top 5 most-read novels per genre, ranked by read count
- **Discover Page** — Search and filter novels by title, genre, include/exclude tags, with pagination
- **Novel Detail Page** — View full novel info, community reviews, ratings, and recommendations
- **Add Novel** — Submit new novels to the shared library with full metadata
- **Booklist** — Browse and like community-curated reading lists
- **Recommendation Engine** — Tag-overlap and genre-based algorithm suggests similar novels
- **Dark / Light Mode** — Persistent theme toggle across all pages

---

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | HTML, Bootstrap |
| Backend  | Node.js, Express |
| Database | MongoDB Atlas |
| Linting | ESLint + Prettier |
| Deployment | Render |

---

## Project Structure

```
WebNovel_Nexus/
├── frontend/
│   ├── homepage.html     # Novel rank by genre
│   ├── index.html        # Discover / search page
│   ├── novel.html        # Novel detail + reviews + recommendations
│   ├── add.html          # Add a new novel
│   └── booklist.html     # Community booklists
├── src/
│   ├── modules/
│   │   ├── mongodb-connect.js   # MongoDB connection
│   │   └── recommender.js       # Recommendation algorithm
│   ├── routes/
│   │   ├── novelRouter.js       # Novel CRUD + recommendations API
│   │   └── reviewRouter.js      # Review CRUD API
│   └── index.js                 # Express app entry point
├── package.json
└── .env                         # Environment variables (not committed)
```

---

## Database Schema

**Database:** `novel_db` (MongoDB)

### NOVEL Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | MongoDB primary key |
| `id` | Number | Custom novel ID |
| `book_name` | String | Novel title |
| `author` | String | Author name |
| `genre` | String | Primary genre |
| `description` | String | Synopsis |
| `status` | String | `"Ongoing"` / `"Completed"` / `"Hiatus"` |
| `tag1/2/3` | String | Up to 3 tags/tropes |
| `source_url` | String | Link to original source |
| `read` | Number | Read count for ranking |

### REVIEW Collection

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | MongoDB primary key |
| `novelId` | Number | Foreign key → NOVEL.id |
| `username` | String | Reviewer name |
| `rating` | Number | 1–5 stars |
| `body` | String | Review text |
| `createdAt` | Date | Submission timestamp |

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
git clone https://github.com/Jihe377/WebNovel_Nexus.git
cd WebNovel_Nexus
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
DB_NAME=novel_db
PORT=3000
```

### Running Locally

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authors

- **Danyan Gu** — Novel Search, Discover page, Add Novel, tag filtering
- **Xing Zhou** — Homepage ranking, Novel Detail, Recommendation algorithm, Reviews

---

## License

MIT

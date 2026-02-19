# WebNovel Nexus

A centralized web application for tracking, discovering, and reviewing internet novels (web fiction, serialized stories, fanfiction) across platforms like Royal Road, Wattpad, AO3, and more.

**Live Demo:** [https://webnovel-nexus.onrender.com](https://webnovel-nexus.onrender.com)\
**Class Link** [Course Detail](https://johnguerra.co/classes/webDevelopment_online_spring_2026/)\
**YouTube Link** [Introduction Video](https://youtu.be/kN3GpWVhOtU)

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

## Design Mockup
<img width="2772" height="2404" alt="image" src="https://github.com/user-attachments/assets/c8c3978c-64fe-400e-83ac-3d2154a88c2b" />

## Screenshot

<img width="2578" height="1990" alt="image" src="https://github.com/user-attachments/assets/d385db34-33ad-405c-94b6-3f4be18371e3" />
<img width="2576" height="1992" alt="image" src="https://github.com/user-attachments/assets/097483f8-33fd-4373-8218-09e79470ca0f" />
<img width="2576" height="1994" alt="image" src="https://github.com/user-attachments/assets/3c9e21a9-208b-4f3b-97b3-4dd9f5070b23" />
<img width="2580" height="1986" alt="image" src="https://github.com/user-attachments/assets/f6823a0c-0747-405d-9391-5ff93441f3ca" />
<img width="2576" height="1986" alt="image" src="https://github.com/user-attachments/assets/587ed107-ddbd-4fcd-ba1d-79503bfce6ba" />


## Project Structure

```
WebNovel_Nexus/
├── frontend/
│   ├── css/
│   │   ├── add.css
│   │   ├── booklist.css
│   │   ├── discover.css
│   │   └── novel.css
│   ├── js/                      # Client-side scripts
│   ├── homepage.html            # Novel rank by genre
│   ├── index.html               # Discover / search page
│   ├── novel.html               # Novel detail + reviews + recommendations
│   ├── add.html                 # Add a new novel
│   └── booklist.html            # Community booklists
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

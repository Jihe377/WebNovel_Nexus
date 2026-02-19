import { Router } from "express";
import { ObjectId } from "mongodb";
import connectDB from "../modules/mongodb-connect.js";
import { getRecommendations } from "../modules/recommender.js";

const router = Router();

// GET /api/novels
// Supports ?search=, ?genre=, ?tags=, ?exclude=, ?page=, ?limit=
router.get("/", async (req, res) => {
  try {
    const { novelCol } = await connectDB();
    const { search, genre, tags, exclude, page = 1, limit = 20 } = req.query;

    const query = {};

    // Title search (case-insensitive)
    if (search && search.trim()) {
      query.book_name = { $regex: search.trim(), $options: "i" };
    }

    // Genre filter (case-insensitive exact match)
    if (genre && genre.trim()) {
      query.genre = { $regex: `^${genre.trim()}$`, $options: "i" };
    }

    // Include tags — novel must have ALL specified tags in tag1/tag2/tag3
    if (tags && tags.trim()) {
      const includeTags = tags.split(",").map(t => t.trim()).filter(Boolean);
      if (includeTags.length > 0) {
        query.$and = includeTags.map(t => ({
          $or: [
            { tag1: { $regex: `^${t}$`, $options: "i" } },
            { tag2: { $regex: `^${t}$`, $options: "i" } },
            { tag3: { $regex: `^${t}$`, $options: "i" } },
          ]
        }));
      }
    }
    
    // Exclude tags — novel must NOT have any of these in tag1/tag2/tag3
    if (exclude && exclude.trim()) {
      const excludeTags = exclude.split(",").map(t => t.trim()).filter(Boolean);
      if (excludeTags.length > 0) {
        const notConditions = excludeTags.map(t => ({
          tag1: { $not: { $regex: `^${t}$`, $options: "i" } },
          tag2: { $not: { $regex: `^${t}$`, $options: "i" } },
          tag3: { $not: { $regex: `^${t}$`, $options: "i" } },
        }));
        query.$and = [...(query.$and || []), ...notConditions];
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [novels, total] = await Promise.all([
      novelCol.find(query).skip(skip).limit(parseInt(limit)).toArray(),
      novelCol.countDocuments(query),
    ]);

    res.json({
      novels,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("GET /api/novels error:", err);
    res.status(500).json({ error: "Failed to fetch novels" });
  }
});

// GET /api/novels/:id/recommendations
// MUST be before /:id to prevent Express matching "recommendations" as an id
router.get("/:id/recommendations", async (req, res) => {
  try {
    const { novelCol } = await connectDB();
    const { id } = req.params;
    const numId = parseInt(id);

    const currentNovel = isNaN(numId)
      ? await novelCol.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : null })
      : await novelCol.findOne({ id: numId });

    if (!currentNovel) {
      return res.status(404).json({ error: "Novel not found" });
    }

    const allNovels = await novelCol.find({}).toArray();
    const recs = getRecommendations(currentNovel, allNovels);

    res.json(recs);
  } catch (err) {
    console.error("GET /api/novels/:id/recommendations error:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// GET /api/novels/:id
router.get("/:id", async (req, res) => {
  try {
    const { novelCol } = await connectDB();
    const { id } = req.params;
    const numId = parseInt(id);

    const novel = isNaN(numId)
      ? await novelCol.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : null })
      : await novelCol.findOne({ id: numId });

    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }

    res.json(novel);
  } catch (err) {
    console.error("GET /api/novels/:id error:", err);
    res.status(500).json({ error: "Failed to fetch novel" });
  }
});

// POST /api/novels
router.post("/", async (req, res) => {
  try {
    const { novelCol } = await connectDB();
    const {
      id,
      book_name, author, description, status, genre,
      tag1, tag2, tag3,
      source_url,
      read,
    } = req.body;

    // Required field validation
    if (!book_name || !book_name.trim())
      return res.status(400).json({ error: "Book name is required" });
    if (!author || !author.trim())
      return res.status(400).json({ error: "Author is required" });
    if (!description || !description.trim())
      return res.status(400).json({ error: "Description is required" });
    if (!genre || !genre.trim())
      return res.status(400).json({ error: "Genre is required" });
    if (!source_url || !source_url.trim())
      return res.status(400).json({ error: "Source URL is required" });

    // Duplicate check
    const existing = await novelCol.findOne({
      book_name: { $regex: `^${book_name.trim()}$`, $options: "i" },
      author:    { $regex: `^${author.trim()}$`,    $options: "i" },
    });
    if (existing) {
      return res.status(409).json({ error: "This novel already exists in the database" });
    }

    // Status validation
    const validStatuses = ["Ongoing", "Completed", "Hiatus"];
    const novelStatus = validStatuses.includes(status) ? status : "Ongoing";

    // Determine next id if not provided
    let novelId = parseInt(id);
    if (isNaN(novelId)) {
      const last = await novelCol.find({}).sort({ id: -1 }).limit(1).toArray();
      novelId = last.length > 0 ? (last[0].id || 0) + 1 : 1;
    }

    const newNovel = {
      id:          novelId,
      book_name:   book_name.trim(),
      author:      author.trim(),
      description: description.trim(),
      status:      novelStatus,
      genre:       genre.trim(),
      tag1:        (tag1 || '').toString().trim(),
      tag2:        (tag2 || '').toString().trim(),
      tag3:        (tag3 || '').toString().trim(),
      source_url:  source_url.trim(),
      read:        typeof read === 'number' ? read : 0,
      createdAt:   new Date(),
    };

    const result = await novelCol.insertOne(newNovel);

    res.status(201).json({
      message: "Novel added successfully",
      novel: { ...newNovel, _id: result.insertedId },
    });
  } catch (err) {
    console.error("POST /api/novels error:", err);
    res.status(500).json({ error: "Failed to add novel" });
  }
});

// PUT /api/novels/:id
router.put("/:id", async (req, res) => {
  try {
    const { novelCol } = await connectDB();
    const { id } = req.params;
    const numId = parseInt(id);

    if (isNaN(numId)) {
      return res.status(400).json({ error: "Invalid novel ID" });
    }

    const {
      book_name, author, description, status, genre,
      tag1, tag2, tag3, source_url,
    } = req.body;

    const updates = {};
    if (book_name   !== undefined) updates.book_name   = book_name.trim();
    if (author      !== undefined) updates.author      = author.trim();
    if (description !== undefined) updates.description = description.trim();
    if (genre       !== undefined) updates.genre       = genre.trim();
    if (source_url  !== undefined) updates.source_url  = source_url.trim();
    if (tag1        !== undefined) updates.tag1        = tag1.toString().trim();
    if (tag2        !== undefined) updates.tag2        = tag2.toString().trim();
    if (tag3        !== undefined) updates.tag3        = tag3.toString().trim();

    if (status !== undefined) {
      const validStatuses = ["Ongoing", "Completed", "Hiatus"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.updatedAt = new Date();

    const result = await novelCol.findOneAndUpdate(
      { id: numId },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "Novel not found" });
    }

    res.json({ message: "Novel updated successfully", novel: result });
  } catch (err) {
    console.error("PUT /api/novels/:id error:", err);
    res.status(500).json({ error: "Failed to update novel" });
  }
});

// DELETE /api/novels/:id
router.delete("/:id", async (req, res) => {
  try {
    const { novelCol, reviewCol } = await connectDB();
    const { id } = req.params;
    const numId = parseInt(id);

    if (isNaN(numId)) {
      return res.status(400).json({ error: "Invalid novel ID" });
    }

    const result = await novelCol.deleteOne({ id: numId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Novel not found" });
    }

    // Cascade delete all reviews for this novel
    await reviewCol.deleteMany({ novelId: numId });

    res.json({ message: "Novel deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/novels/:id error:", err);
    res.status(500).json({ error: "Failed to delete novel" });
  }
});

export default router;
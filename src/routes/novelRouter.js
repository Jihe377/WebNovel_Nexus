import { Router } from "express";
import { ObjectId } from "mongodb";
import connectDB from "../modules/mongodb-connect.js";
import { getRecommendations } from "../modules/recommender.js";

const router = Router();

// GET /api/novels
// Supports ?search=, ?tags=, ?exclude=, ?page=, ?limit=
router.get("/", async (req, res) => {
  try {
    const { novelCol } = await connectDB();
    const { search, tags, exclude, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    if (tags && tags.trim()) {
      const includeTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (includeTags.length > 0) {
        query.tags = { $all: includeTags };
      }
    }

    if (exclude && exclude.trim()) {
      const excludeTags = exclude.split(",").map((t) => t.trim()).filter(Boolean);
      if (excludeTags.length > 0) {
        query.tags = { ...(query.tags || {}), $nin: excludeTags };
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
    const { name, author, genre, source, description, tags, coverUrl, status } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ error: "Title is required" });
    if (!author || !author.trim())
      return res.status(400).json({ error: "Author is required" });
    if (!genre || !genre.trim())
      return res.status(400).json({ error: "Genre is required" });
    if (!source || !source.trim())
      return res.status(400).json({ error: "Source URL is required" });
    if (!description || !description.trim())
      return res.status(400).json({ error: "Description is required" });

    const parsedTags = Array.isArray(tags)
      ? tags.map((t) => t.trim()).filter(Boolean)
      : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

    if (parsedTags.length > 3) {
      return res.status(400).json({ error: "Maximum 3 tags allowed" });
    }

    const existing = await novelCol.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      author: { $regex: `^${author.trim()}$`, $options: "i" },
    });

    if (existing) {
      return res.status(409).json({ error: "This novel already exists in the database" });
    }

    const validStatuses = ["Ongoing", "Completed", "Hiatus"];
    const novelStatus = validStatuses.includes(status) ? status : "Ongoing";

    const newNovel = {
      name: name.trim(),
      author: author.trim(),
      genre: genre.trim(),
      source: source.trim(),
      description: description.trim(),
      tags: parsedTags,
      coverUrl: coverUrl ? coverUrl.trim() : "",
      status: novelStatus,
      read: 0,
      createdAt: new Date(),
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

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid novel ID" });
    }

    const { name, author, genre, source, description, tags, coverUrl, status } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (author !== undefined) updates.author = author.trim();
    if (genre !== undefined) updates.genre = genre.trim();
    if (source !== undefined) updates.source = source.trim();
    if (description !== undefined) updates.description = description.trim();
    if (coverUrl !== undefined) updates.coverUrl = coverUrl.trim();

    if (status !== undefined) {
      const validStatuses = ["Ongoing", "Completed", "Hiatus"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      updates.status = status;
    }

    if (tags !== undefined) {
      const parsedTags = Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : typeof tags === "string"
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [];

      if (parsedTags.length > 3) {
        return res.status(400).json({ error: "Maximum 3 tags allowed" });
      }
      updates.tags = parsedTags;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.updatedAt = new Date();

    const result = await novelCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
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

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid novel ID" });
    }

    const result = await novelCol.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Novel not found" });
    }

    await reviewCol.deleteMany({ novelId: new ObjectId(id) });

    res.json({ message: "Novel deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/novels/:id error:", err);
    res.status(500).json({ error: "Failed to delete novel" });
  }
});

export default router;
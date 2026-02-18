import { Router } from "express";
import { ObjectId } from "mongodb";
import connectDB from "../modules/mongodb-connect.js";
// import { getRecommendations } from "../recommender.js";

const router = Router();

// GET /api/novels/:id/reviews
// Get all reviews for a novel, sorted newest first
router.get("/novels/:id/reviews", async (req, res) => {
  try {
    const { reviewCol } = await connectDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid novel ID" });
    }

    const reviews = await reviewCol
      .find({ novelId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(reviews);
  } catch (err) {
    console.error("GET /api/novels/:id/reviews error:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/novels/:id/reviews
// Submit a new review for a novel
router.post("/novels/:id/reviews", async (req, res) => {
  try {
    const { novelCol, reviewCol } = await connectDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid novel ID" });
    }

    const { username, rating, body } = req.body;

    // Required field validation
    if (!username || !username.trim())
      return res.status(400).json({ error: "Username is required" });
    if (rating === undefined || rating === null)
      return res.status(400).json({ error: "Rating is required" });
    if (!body || !body.trim())
      return res.status(400).json({ error: "Review body is required" });

    // Rating range validation
    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Verify the novel exists
    const novel = await novelCol.findOne({ _id: new ObjectId(id) });
    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }

    const newReview = {
      novelId: new ObjectId(id),
      username: username.trim(),
      rating: parsedRating,
      body: body.trim(),
      createdAt: new Date(),
    };

    const result = await reviewCol.insertOne(newReview);

    res.status(201).json({
      message: "Review submitted successfully",
      review: { ...newReview, _id: result.insertedId },
    });
  } catch (err) {
    console.error("POST /api/novels/:id/reviews error:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// DELETE /api/reviews/:id
// Delete a single review by its own ID
router.delete("/reviews/:id", async (req, res) => {
  try {
    const { reviewCol } = await connectDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    const result = await reviewCol.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/reviews/:id error:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// GET /api/recommendations?tags=X,Y
// Return top 10 novels ranked by Jaccard tag overlap
/**
router.get("/recommendations", async (req, res) => {
  try {
    const { novelCol } = await connectDB();
    const { tags } = req.query;

    if (!tags || !tags.trim()) {
      return res
        .status(400)
        .json({ error: "At least one tag is required for recommendations" });
    }

    const clickedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (clickedTags.length === 0) {
      return res.status(400).json({ error: "No valid tags provided" });
    }

    // Fetch only the fields needed for scoring and display
    const novels = await novelCol
      .find(
        {},
        {
          projection: {
            _id: 1,
            name: 1,
            author: 1,
            tags: 1,
            coverUrl: 1,
            genre: 1,
            status: 1,
            description: 1,
          },
        }
      )
      .toArray();

    const recommendations = getRecommendations(novels, clickedTags, 10);

    res.json(recommendations);
  } catch (err) {
    console.error("GET /api/recommendations error:", err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});
*/

export default router;
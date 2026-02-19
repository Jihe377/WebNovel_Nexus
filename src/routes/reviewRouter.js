import { Router } from "express";
import { ObjectId } from "mongodb";
import connectDB from "../modules/mongodb-connect.js";

const router = Router();

// GET /api/novels/:id/reviews
router.get("/novels/:id/reviews", async (req, res) => {
  try {
    const { reviewCol } = await connectDB();
    const { id } = req.params;
    const numId = parseInt(id);

    // Reviews store novelId as a number matching novel.id
    const query = isNaN(numId) ? { novelId: id } : { novelId: numId };

    const reviews = await reviewCol
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(reviews);
  } catch (err) {
    console.error("GET /api/novels/:id/reviews error:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/novels/:id/reviews
router.post("/novels/:id/reviews", async (req, res) => {
  try {
    const { novelCol, reviewCol } = await connectDB();
    const { id } = req.params;
    const numId = parseInt(id);

    // Find the novel using numeric id
    const novel = isNaN(numId)
      ? null
      : await novelCol.findOne({ id: numId });

    if (!novel) {
      return res.status(404).json({ error: "Novel not found" });
    }

    const { username, rating, body } = req.body;

    if (!username || !username.trim())
      return res.status(400).json({ error: "Username is required" });
    if (rating === undefined || rating === null)
      return res.status(400).json({ error: "Rating is required" });
    if (!body || !body.trim())
      return res.status(400).json({ error: "Review body is required" });

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const newReview = {
      novelId: numId,          // store as number to match novel.id
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

export default router;
import express from "express";
import axios from "axios";
import isAuth from "../middlewares/isAuth.js";

const musicRouter = express.Router();

musicRouter.get("/search", isAuth, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const response = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Music search error:", error);
    return res.status(500).json({ message: `Music search error: ${error.message}` });
  }
});

export default musicRouter;

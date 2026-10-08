import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  editProfile,
  getCurrentUser,
  suggestedUsers,
  getProfile,
  uploadStory,
  getAllStories,
  followUnfollowUser,
  searchUsers
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

// Current Logged-in User
userRouter.get("/current", isAuth, getCurrentUser);

// Suggested Users
userRouter.get("/suggested", isAuth, suggestedUsers);

// get Profile
userRouter.get("/getProfile/:userName", isAuth, getProfile)

// Search Users
userRouter.get("/search", isAuth, searchUsers);

// Edit Profile
userRouter.post("/editProfile",isAuth,upload.single("profileImage"),editProfile)

// Upload Story
userRouter.post("/uploadStory",isAuth,upload.single("media"),uploadStory)

// Get All Stories
userRouter.get("/stories", isAuth, getAllStories)

// Follow / Unfollow User
userRouter.post("/follow/:id", isAuth, followUnfollowUser);

export default userRouter;

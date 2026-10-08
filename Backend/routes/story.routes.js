import express from "express"
import isAuth from "../middlewares/isAuth.js"
import {upload} from "../middlewares/multer.js"
import { uploadStory, getStoryByUserName, viewStory, likeStory, commentStory } from "../controllers/story.controllers.js"


const storyRouter = express.Router()

storyRouter.post("/upload",isAuth, upload.fields([{ name: "media", maxCount: 1 }, { name: "music", maxCount: 1 }]),uploadStory)
storyRouter.get("/getByUserName/:userName",isAuth,getStoryByUserName)
storyRouter.get("/view/:storyId", isAuth, viewStory)
storyRouter.get("/like/:storyId", isAuth, likeStory)
storyRouter.post("/comment/:storyId", isAuth, commentStory)

export default storyRouter
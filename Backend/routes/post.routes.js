import express from "express"
import isAuth from "../middlewares/isAuth.js"
import {upload} from "../middlewares/multer.js"
import { comment, replyToComment, getAllPosts, uploadPost,like,saved, deletePost } from "../controllers/post.controllers.js"

const postRouter = express.Router()

postRouter.post("/upload",isAuth, upload.fields([{ name: "media", maxCount: 1 }, { name: "music", maxCount: 1 }]),uploadPost)
postRouter.get("/getAll",isAuth,getAllPosts)
postRouter.get("/like/:postId", isAuth, like)
postRouter.get("/saved/:postId", isAuth, saved)
postRouter.post("/comment/:postId",isAuth,comment)
postRouter.post("/comment/reply/:postId/:commentId",isAuth,replyToComment)
postRouter.delete("/delete/:postId", isAuth, deletePost)

export default postRouter
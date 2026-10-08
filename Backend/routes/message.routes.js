import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { sendMessage, getMessages, getConversations, deleteMessage } from "../controllers/message.controllers.js";

const router = express.Router();

import { upload } from "../middlewares/multer.js";

router.get("/conversations", isAuth, getConversations);
router.get("/:id", isAuth, getMessages);
router.post("/send/:id", isAuth, upload.single("media"), sendMessage);
router.delete("/delete/:id", isAuth, deleteMessage);

export default router;

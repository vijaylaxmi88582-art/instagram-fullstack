import Loop from "../models/loop.model.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";

export const uploadLoop = async (req, res) => {
  try {
    const { caption, musicUrl, mediaType } = req.body;
    let media;
    let music;
    if (req.files && req.files["media"] && req.files["media"][0]) {
      media = await uploadOnCloudinary(req.files["media"][0].path);
    } else {
      return res.status(400).json({ message: "media  is required" });
    }
    if (musicUrl) {
      music = musicUrl;
    } else if (req.files && req.files["music"] && req.files["music"][0]) {
      music = await uploadOnCloudinary(req.files["music"][0].path);
    }
    const loop = await Loop.create({
      author: req.userId,
      caption,
      mediaType,
      media,
      music,
    });
    const user = await User.findById(req.userId);
    user.loops.push(loop._id);
    await user.save();
    const populatedLoop = await Loop.findById(loop._id).populate(
      "author",
      " name userName profileImage",
    );
    return res.status(200).json(populatedLoop);
  } catch (error) {
    return res.status(500).json({ message: `upload loop error ${error}` });
  }
};



export const like = async (req, res) => {
  try {
    const loopId = req.params.loopId;
    const loop = await Loop.findById(loopId);
    if (!loop) {
      return res.status(400).json({ message: "loop not found" });
    }
    const alreadyLiked = loop.likes.some(
      (id) => id.toString() == req.userId.toString(),
    );
    if (alreadyLiked) {
      loop.likes = loop.likes.filter(
        (id) => id.toString() != req.userId.toString(),
      );
    } else {
      loop.likes.push(req.userId);
    }
    await loop.save();
    await loop.populate("author", " name userName profileImage");
    return res.status(200).json(loop);
  } catch (error) {
    return res.status(500).json({ message: `like loop error ${error}` });
  }
};

export const comment = async (req, res) => {
  try {
    const { message } = req.body;
    const loopId = req.params.postId;
    const loop = await Loop.findById(loopId);
    if (!loop) {
      return res.status(400).json({ message: "loop not found" });
    }
    loop.comments.push({
      author: req.userId,
      message,
    });
    await loop.save();
    await loop.populate("author", " name userName profileImage");
    await loop.populate("comments.author");
    return res.status(200).json(loop);
  } catch (error) {
    return res.status(500).json({ message: `comment loop error ${error}` });
  }
};

export const getAllLoops = async (req, res) => {
  try {
    const loops = await Loop.find({ author: req.userId }).populate(
      "author",
      " name userName profileImage").populate("comments.author")
    return res.status(200).json(loops);
  } catch (error) {
    return res.status(500).json({ message: `get all loops error ${error}` });
  }
};
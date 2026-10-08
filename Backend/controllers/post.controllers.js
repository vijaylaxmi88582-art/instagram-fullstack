import uploadOnCloudinary from "../config/cloudinary.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Check if the current user is the author
    if (post.auther.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }
    
    // Remove post ID from user's posts array
    const user = await User.findById(req.userId);
    if (user) {
      user.posts = user.posts.filter((id) => id.toString() !== postId.toString());
      await user.save();
    }
    
    // Delete the post document
    await Post.findByIdAndDelete(postId);
    
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Delete post error: ${error}` });
  }
};

export const uploadPost = async (req, res) => {
  try {
    const { caption, mediaType, musicUrl } = req.body;
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
    const post = await Post.create({
      auther: req.userId,
      caption,
      mediaType,
      media,
      music,
    });
    const user = await User.findById(req.userId);
    user.posts.push(post._id);
    await user.save();
    const populatedPost = await Post.findById(post._id).populate(
      "auther",
      " name userName profileImage",
    );
    return res.status(200).json(populatedPost);
  } catch (error) {
    return res.status(500).json({ message: `upload post error ${error}` });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).populate(
      "auther",
      " name userName profileImage",
    ).populate("likes", "name userName profileImage").populate("comments.auther").populate("comments.replies.auther");
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: `get all posts error ${error}` });
  }
};
export const like = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "post not found" });
    }
    const alreadyLiked = post.likes.some(
      (id) => id.toString() == req.userId.toString(),
    );
    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() != req.userId.toString(),
      );
    } else {
      post.likes.push(req.userId);
    }
    await post.save();
    await post.populate("auther", " name userName profileImage");
    await post.populate("likes", "name userName profileImage");
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: `like post error ${error}` });
  }
};

export const comment = async (req, res) => {
  try {
    const { message } = req.body;
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "post not found" });
    }
    post.comments.push({
      auther: req.userId,
      message,
    });
    await post.save();
    await post.populate("auther", " name userName profileImage");
    await post.populate("likes", "name userName profileImage");
    await post.populate("comments.auther");
    await post.populate("comments.replies.auther");
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: `comment post error ${error}` });
  }
};

export const replyToComment = async (req, res) => {
  try {
    const { message } = req.body;
    const { postId, commentId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "post not found" });
    }
    
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(400).json({ message: "comment not found" });
    }
    
    comment.replies.push({
      auther: req.userId,
      message
    });
    
    await post.save();
    await post.populate("auther", " name userName profileImage");
    await post.populate("likes", "name userName profileImage");
    await post.populate("comments.auther");
    await post.populate("comments.replies.auther");
    
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: `reply comment error ${error}` });
  }
};

export const saved=async (req,res)=>{
    try {
    const postId = req.params.postId;
    
    const user = await User.findById(req.userId);
   
    const alreadySaved = user.saved.some(
      (id) => id.toString() == req.postId.toString());
    if (alreadySaved) {
      user.saved = user.saved.filter(
        (id) => id.toString() != req.postId.toString());
    } else {
      user.saved.push(postId);
    }
    
    await user.save();
    await user.populate("saved");
    return res.status(200).json(User);
  } catch (error) {
    return res.status(500).json({ message: `saved error ${error}` });
  }
}
import User from '../models/user.model.js';
import Story from '../models/story.model.js';
import uploadOnCloudinary from '../config/cloudinary.js';
export const uploadStory =async(req,res)=>{
    try{
        const user=await User.findById(req.userId)
        if(user.story){
            await Story.findByIdAndDelete(user.story)
            user.story=null
            
        }
        const {mediaType, musicUrl}=req.body
        let media;
        let music;
        if(req.files && req.files["media"] && req.files["media"][0]){
            media=await uploadOnCloudinary(req.files["media"][0].path)
        } else{
            return res.status(400).json({message:"media is required"})
        }
        if(musicUrl){
            music=musicUrl
        } else if(req.files && req.files["music"] && req.files["music"][0]){
            music=await uploadOnCloudinary(req.files["music"][0].path)
        }
        const story=await Story.create({
            auther:user._id,
            mediaType,
            media,
            music
        })
        user.story=story._id
        await user.save()
        const populatedStory=await Story.findById(story._id).populate("auther"," name profileImage userName").populate("viewers", " name profileImage userName")
        return res.status(200).json(populatedStory)

    } catch(error){
        return res.status(500).json({message:`upload story error ${error}`})

    }
}

export const viewStory=async(req, res)=>{
    try{
        const storyId=req.params.storyId
        const story=await Story.findById(storyId)
        if(!story){
            return res.status(400).json({message:"story not found"})
        }
        const viewersIds=story.viewers.map(id=>id.toString())
        if(!viewersIds.includes(req.userId.toString())){
            story.viewers.push(req.userId)
            await story.save()
        }
        const populatedStory=await Story.findById(story._id).populate("auther","name userName profileImage").populate("viewers", "name userName profileImage").populate("likes", "name userName profileImage").populate("comments.auther", "name userName profileImage")
        return res.status(200).json(populatedStory)

    } catch(error){
        return res.status(500).json({message:`view story error ${error}`})

    }
}

export const getStoryByUserName=async(req, res)=>{
    try{
        const userName=req.params.userName
        const user=await User.findOne({userName})
        if(!user){
            return res.status(400).json({messagr:"user not found"})
        }
        const story=await Story.find({
            auther:user._id
        }).populate("viewers", "name userName profileImage").populate("auther", "name userName profileImage").populate("likes", "name userName profileImage").populate("comments.auther", "name userName profileImage")
        return res.status(200).json(story)


    } catch(error){
        return res.status(500).json({message:`get story by user name error ${error}`})

    }
}

export const likeStory = async (req, res) => {
    try {
        const storyId = req.params.storyId;
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(400).json({ message: "story not found" });
        }
        
        const alreadyLiked = story.likes.some(
            (id) => id.toString() === req.userId.toString()
        );
        
        if (alreadyLiked) {
            story.likes = story.likes.filter(
                (id) => id.toString() !== req.userId.toString()
            );
        } else {
            story.likes.push(req.userId);
        }
        
        await story.save();
        const populatedStory = await Story.findById(story._id).populate("auther", "name userName profileImage").populate("viewers", "name userName profileImage").populate("likes", "name userName profileImage").populate("comments.auther", "name userName profileImage");
        return res.status(200).json(populatedStory);
    } catch (error) {
        return res.status(500).json({ message: `like story error ${error}` });
    }
};

export const commentStory = async (req, res) => {
    try {
        const { message } = req.body;
        const storyId = req.params.storyId;
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(400).json({ message: "story not found" });
        }
        
        story.comments.push({
            auther: req.userId,
            message,
        });
        
        await story.save();
        const populatedStory = await Story.findById(story._id).populate("auther", "name userName profileImage").populate("viewers", "name userName profileImage").populate("likes", "name userName profileImage").populate("comments.auther", "name userName profileImage");
        return res.status(200).json(populatedStory);
    } catch (error) {
        return res.status(500).json({ message: `comment story error ${error}` });
    }
};
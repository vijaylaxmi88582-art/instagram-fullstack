import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/user.model.js"
import Story from "../models/story.model.js"

export const getCurrentUser=async(req,res)=>{
    try{
        const userId=req.userId
        const user= await User.findById(userId).populate("posts loops")
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        return res.status(200).json(user)

    } catch (error){
        return res.status(500).json({message:`get current user ${error}`})

    }
}
export const suggestedUsers=async(req,res)=>{
    try{
        const users=await User.find({
            _id:{$ne:req.userId}

        }).select("-password").populate("story")
    return res.status(200).json(users)

    } catch(error){
        return res.status(500).json({message:`get suggested user error ${error}`})

    }
}
export const editProfile=async(req,res)=>{
    try{
        const {name,userName,bio,profession,gender}=req.body
        const user=await User.findById(req.userId).select("-password")
        if(!user){
            return res.status(400).json({message:"user not found"})

        }
        if(userName){
            const sameUserWithUserName=await User.findOne({userName}).select("-password")
            if(sameUserWithUserName && sameUserWithUserName._id.toString() !== req.userId.toString()){
                return res.status(400).json({message:"username already taken"})
            }
        }
        let profileImage;
        if(req.file){
            profileImage=await uploadOnCloudinary(req.file.path)
        }
        user.name=name || user.name
        user.userName=userName || user.userName

        user.profileImage=profileImage || user.profileImage
        user.bio=bio || user.bio
        user.profession=profession || user.profession
        user.gender=gender || user.gender


        await user.save()
        return res.status(200).json(user)

    } catch(error){
        return res.status(500).json({message:`edit profile error ${error}`})

    }
}
export const getProfile=async(req, res)=>{
    try{
        const userName=req.params.userName
        const user=await User.findOne({userName}).select("-password").populate("story").populate("posts").populate("followers", "name userName profileImage").populate("following", "name userName profileImage")
        if(!user){
            return res.status(400).json({message:"user not found"})

        }
        return res.status(200).json(user)

    } catch(error){
        return res.status(500).json({message:`user profile error ${error}`})

    }
}
export const uploadStory=async(req,res)=>{
    try{
        const {mediaType}=req.body
        const user=await User.findById(req.userId)
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        if(!req.file){
            return res.status(400).json({message:"media file required"})
        }
        const media=await uploadOnCloudinary(req.file.path)
        const story=await Story.create({
            auther:user._id,
            mediaType,
            media
        })
        user.story=story._id
        await user.save()
        return res.status(200).json(story)
    } catch(error){
        return res.status(500).json({message:`upload story error ${error}`})
    }
}
export const getAllStories=async(req,res)=>{
    try{
        const users=await User.find({
            story:{$exists:true, $ne:null}
        }).select("userName profileImage story").populate("story")
        return res.status(200).json(users)
    } catch(error){
        return res.status(500).json({message:`get all stories error ${error}`})
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.userId;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(400).json({ message: "User not found" });
        }

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
            return res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // Follow
            await User.findByIdAndUpdate(currentUserId, { $push: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $push: { followers: currentUserId } });
            return res.status(200).json({ message: "User followed successfully" });
        }
    } catch (error) {
        return res.status(500).json({ message: `follow/unfollow error ${error}` });
    }
}

export const searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(200).json([]);
        }
        const users = await User.find({
            $or: [
                { userName: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } }
            ]
        }).select("userName name profileImage");
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: `search user error ${error}` });
    }
}

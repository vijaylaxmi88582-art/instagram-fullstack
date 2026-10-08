import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

import uploadOnCloudinary from "../config/cloudinary.js";

export const sendMessage = async (req, res) => {
    try {
        const { message, messageType, postId } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.userId;

        let mediaUrl = "";
        if (req.file) {
            mediaUrl = await uploadOnCloudinary(req.file.path);
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message: message || "",
            messageType: messageType || "text",
            mediaUrl,
            postId
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        const populatedMessage = await Message.findById(newMessage._id).populate({
            path: "postId",
            populate: { path: "auther", select: "userName profileImage" }
        });

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", populatedMessage);
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.userId;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] }
        }).populate({
            path: "messages",
            populate: {
                path: "postId",
                populate: { path: "auther", select: "userName profileImage" }
            }
        });

        if (!conversation) {
            return res.status(200).json([]);
        }

        res.status(200).json(conversation.messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.userId;
        const conversations = await Conversation.find({
            participants: userId
        }).populate("participants", "name userName profileImage");

        res.status(200).json(conversations);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const senderId = req.userId;

        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Only the sender can delete their message
        if (message.senderId.toString() !== senderId.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this message" });
        }

        await Message.findByIdAndDelete(messageId);

        // Remove from conversation
        await Conversation.updateOne(
            { messages: messageId },
            { $pull: { messages: messageId } }
        );

        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", messageId);
        }

        res.status(200).json({ message: "Message deleted successfully", messageId });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

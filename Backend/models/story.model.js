import mongoose from "mongoose";

const storySchema=new mongoose.Schema({
    auther:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    mediaType:{
        type:String,
        enum:["image","video"],
        required:true
    },
    media:{
        type:String,
        required:true
    },
    music:{
        type:String
    },
    viewers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    ],
    comments:[
        {
            auther:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
            },
            message:{
                type:String,
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:86400
    }
},{timestamps:true})

const Story=mongoose.model("Story",storySchema)
export default Story
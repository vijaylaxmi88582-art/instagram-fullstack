import mongoose from "mongoose";
const postSchema= new mongoose.Schema({
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
    caption:{
        type:String
    },
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
            replies:[
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
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]

    
},{timestamps:true})
const Post = mongoose.model("Post",postSchema)
export default Post
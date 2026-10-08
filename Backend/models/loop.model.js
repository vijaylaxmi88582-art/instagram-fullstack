import { request } from "express";
import mongoose, { mongo, Mongoose } from "mongoose";
const loopSchema=new mongoose.Schema({
    author:{
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
           author:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"},
            message:{
                type:String
            }
        }
    ]

},{timestamps:true})
const Loop = mongoose.model("Loop",loopSchema)
export default Loop;
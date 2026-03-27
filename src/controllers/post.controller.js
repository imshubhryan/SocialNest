const postModel = require('../models/post.model')
const imageKit = require('@imagekit/nodejs')
const { toFile } = require('@imagekit/nodejs')
const { response } = require('express')
const jwt = require('jsonwebtoken')


const client = new imageKit({
     privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
})

const createPostController = async(req,res)=>{

    const file =  await client.files.upload({
        file: await toFile(Buffer.from(req.file.buffer), 'file'),
        fileName:"Test",
        folder:"insta-clone-posts"
    })
    
    const post = await postModel.create({
        caption:req.body.caption,
        imgUrl:file.url,
        user:req.user.id
    })
    res.status(201).json({
        message:"post created successfully",
        post
    })
    
    
}

const getPostController = async(req, res)=>{
    
    const userID = req.user.id
    const post = await postModel.find({
        user: userID
    })
    res.status(200).json({
        message:"Post fetched successfully",
        post
    })
}


const getPostDetailsController = async(req,res)=>{
   
    const userId =  req.user.id
    const postId = req.params.postId

    const post = await postModel.findById(postId)

    if(!post){
        return res.status(404).json({
            message:"Post not Found!!!!"
        })
    }

    const isValidUser = post.user.toString() === userId
    if(!isValidUser){
        return res.status(403).json({
            message:"forbidden content"
        })
    }

    return res.status(200).json({
        message:"post fetched successfully",
        post
    })


}



module.exports = {createPostController,getPostController,getPostDetailsController}
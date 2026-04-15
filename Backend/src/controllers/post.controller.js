const postModel = require("../models/post.model");
const imageKit = require("@imagekit/nodejs");
const { toFile } = require("@imagekit/nodejs");
const { response } = require("express");
const jwt = require("jsonwebtoken");
const likeModel = require("../models/like.model");
const { default: mongoose } = require("mongoose");

const client = new imageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const createPostController = async (req, res) => {
  const file = await client.files.upload({
    file: await toFile(Buffer.from(req.file.buffer), "file"),
    fileName: "Test",
    folder: "insta-clone-posts",
  });

  const post = await postModel.create({
    caption: req.body.caption,
    imgUrl: file.url,
    user: req.user.id,
  });
  res.status(201).json({
    message: "post created successfully",
    post,
  });
};

const getPostController = async (req, res) => {
  const userID = req.user.id;
  const post = await postModel.find({
    user: userID,
  });
  res.status(200).json({
    message: "Post fetched successfully",
    post,
  });
};

const getPostDetailsController = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  const post = await postModel.findById(postId);

  if (!post) {
    return res.status(404).json({
      message: "Post not Found!!!!",
    });
  }

  const isValidUser = post.user.toString() === userId;
  if (!isValidUser) {
    return res.status(403).json({
      message: "forbidden content",
    });
  }

  return res.status(200).json({
    message: "post fetched successfully",
    post,
  });
};

const likePostController = async (req, res) => {
  try {
    const username = req.user.username;
    const postId = req.params.postId;

    //  Invalid ObjectId check
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        message: "Invalid Post Id",
      });
    }

    //  Already liked? → UNLIKE
    const alreadyLiked = await likeModel.findOne({
      post: postId,
      user: username,
    });
    if (alreadyLiked) {
      await likeModel.findByIdAndDelete(alreadyLiked._id);
      return res.status(200).json({
        message: "Post Unliked",
      });
    }

    //  Post exists check
    const isPostIdExists = await postModel.findById(postId);
    if (!isPostIdExists) {
      return res.status(404).json({
        message: "Post Not Found",
      });
    }

    // CREATE LIKE
    const like = await likeModel.create({
      post: postId,
      user: username,
    });
    res.status(200).json({
      message: "Post Liked Successfully",
      like,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Already Liked",
      });
    }
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const getFeed = async (req,res)=>{

  const user = req.user
  const posts =await Promise.all((await  postModel.find().populate("user").lean())
  .map(async(post)=>{
    const isLiked = await likeModel.findOne({
      user:user.username,
      post:post._id
    })
    post.isLiked = !!isLiked
    return post
  }))



  res.status(200).json({
    message:"Post Fetched Successfully",
    posts
  })
}

module.exports = {
  createPostController,
  getPostController,
  getPostDetailsController,
  likePostController,
  getFeed
};

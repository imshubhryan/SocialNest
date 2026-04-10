const mongoose = require('mongoose')

const likesSchema = new mongoose.Schema({
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"posts",
        required: [true, "post is required for creating a like"]
    },
    user:{
        type: String,
        required: [true, "username is required for creating a like"]
    }  
},{
    timestamps: true
})

likesSchema.index({post:1, user:1}, {unique: true})

const likeModel = mongoose.model('likes', likesSchema)

module.exports = likeModel
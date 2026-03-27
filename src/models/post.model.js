const mongoose =  require('mongoose')

const postSchema =  new mongoose.Schema({
    caption: {
        type: String,
        default: ""
    },
    imgUrl: {
        type: String,
        required: [true, "imgUrl is required for creating a post"]
    },
    user:{
        ref:"users",
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "user id is required for creating post"]
    }

})


const postModel =  mongoose.model('posts', postSchema)

module.exports = postModel
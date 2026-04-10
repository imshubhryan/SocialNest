const express = require('express')
const postRouter = express.Router()
const postController = require('../controllers/post.controller')
const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()})
const identifyUser = require('../middlewares/auth.middleware')


/* 
POST /api/posts [protected] - is api pr wahi user req kr skta hai jinke paas ek valid token hoga
 -req.body = {caption, image-file}
 */

 postRouter.post('/',upload.single("image"),identifyUser, postController.createPostController)


 /* 
 GET /api/posts/ [protected]
 */

 postRouter.get('/',identifyUser, postController.getPostController )


 /* 
 GET /api/posts/details/:postid
 -return a detail about specific post with the id, also check weather the post belongs to the user that is request come from
 */
postRouter.get('/details/:postId',identifyUser, postController.getPostDetailsController)

/* 
@route POST /api/posts/like/:postId
@description like a post with the id provided in request params
*/

postRouter.post('/like/:postId', identifyUser, postController.likePostController)

 module.exports = postRouter
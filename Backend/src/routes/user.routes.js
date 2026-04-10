const express = require('express')
const userController = require('../controllers/user.controller')
const identifyUser =  require('../middlewares/auth.middleware')

const userRouter = express.Router()


/* 
@route POST /api/users/follow/:userid
@description follow a user
@access Private
*/
userRouter.post('/follow/:username', identifyUser, userController.followUserController)


/* 
@route POST /api/users/unfollow/:userid
@description follow a user
@access Private
*/
userRouter.post('/unfollow/:username', identifyUser,userController.unfollowUser )


/* follow request ka list dekho */
userRouter.get('/requests/', identifyUser,userController.requestList )

/* follow request accept krna hai ya reject krna h */
userRouter.post('/requests/:id', identifyUser, userController.respondRequests )


module.exports = userRouter
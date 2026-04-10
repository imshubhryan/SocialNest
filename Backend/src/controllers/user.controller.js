const followModel = require("../models/follow.model");
const userModel = require("../models/user.model");

const followUserController = async (req, res) => {
  const followerUsername = req.user.username;
  const followeeUsername = req.params.username;

  if (followerUsername == followeeUsername) {
    return res.status(400).json({
      message: "you cannot follow yourself",
    });
  }

  const isFolloweeExists = await userModel.findOne({
    username: followeeUsername,
  });

  if (!isFolloweeExists) {
    return res.status(404).json({
      message: "User you are trying to follow doesnot exist",
    });
  }

  const isAlreadyFollowing = await followModel.findOne({
    followee: followeeUsername,
    follower: followerUsername,
  });

  if (isAlreadyFollowing) {
    return res.status(200).json({
      message: `follow request already sent to ${followeeUsername}`,
      follow: isAlreadyFollowing,
    });
  }

  const followRecord = await followModel.create({
    follower: followerUsername,
    followee: followeeUsername,
    status: "pending",
  });
  res.status(201).json({
    message: `follwo request send to ${followeeUsername}`,
    follow: followRecord,
  });
};

const requestList = async (req, res) => {
  try {
    const followeeUsername = req.user.username;

    // auth check
    if (!followeeUsername) {
      return res.status(401).json({
        message: "Unauthorized User",
      });
    }

    // Request Fetch
    const requests = await followModel.find({
      followee: followeeUsername,
      status: "pending",
    });

    //  Success Response
    res.status(200).json({
      message: "your follow request",
      requests,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const respondRequests = async (req, res) => {
  try {
    const requestId = req.params.id;
    const action = req.body.action;

    //  request id check
    if (!requestId) {
      return res.status(200).json({
        message: "Invalid Request Id",
      });
    }

    //  valid action check
    if (!["accepted", "rejected"].includes(action)) {
      return res.status(400).json({
        message: "invalid action",
      });
    }

    // find request
    const request = await followModel.findById(requestId);
    if (!request) {
      return res.status(404).json({
        message: "request not found",
      });
    }

    //  update status
    request.status = action;
    await request.save();

    res.status(200).json({
      message: `Requested ${action}`,
    });
  } catch (err) {
    res.status(500).json({
      message: "something Went Wrong",
      error: err.message,
    });
  }
};

const unfollowUser = async (req, res) => {
  const followerUsername = req.user.username;
  const followeeUsername = req.params.username;

  const isUserFollowing = await followModel.findOne({
    follower: followerUsername,
    followee: followeeUsername,
  });

  if (!isUserFollowing) {
    return res.status(200).json({
      message: `you are not following ${followeeUsername}`,
    });
  }

  await followModel.findByIdAndDelete(isUserFollowing._id);
  res.status(200).json({
    message: `you have unfollowed ${followeeUsername}`,
  });
};

module.exports = {
  followUserController,
  unfollowUser,
  requestList,
  respondRequests,
};

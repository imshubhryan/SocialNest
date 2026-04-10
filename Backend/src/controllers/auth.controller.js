const userModel = require("../models/user.model");
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");


const registerController = async (req, res) => {
  const { email, username, password, bio, profileImage } = req.body;

  // const isUSerExistsbyEmail = await userModel.findOne({email})
  // if(isUSerExistsbyEmail){
  //     return res.status(409).json({
  //         message: "User already exists with this email"
  //     })
  // }

  // const isUSerExistsbyUsername = await userModel.findOne({username})
  // if(isUSerExistsbyUsername){
  //     return res.status(409).json({
  //          message: "User already exists with this username"
  //     })
  // }

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (isUserAlreadyExists) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  const hash = await bcrypt.hash(password, 10)
  const user = await userModel.create({
    username,
    email,
    password: hash,
    bio,
    profileImage,
  });

  /* 
        - user ka data hona chahiye
        - data unique hona chahiye
         */
  const token = jwt.sign(
    {
      id: user._id,
      username:user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User register successfully",
    user: {
      email: user.email,
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
}



const loginController = async(req, res) => {
  const { username, email, password } = req.body;

  // ya to email pass se login ya username pass se login
  const user = await userModel.findOne({
    $or: [{ username: username }, { email: email }],
  });
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Password Invalid",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username:user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );


  res.cookie("token", token);
res.status(200).json({
  message: "Login Successfully",
  user:{
    username: user.username,
    email: user.email,
    bio: user.bio,
    profileImage: user.profileImage
  }
});
}


module.exports = {
    registerController,
    loginController
}
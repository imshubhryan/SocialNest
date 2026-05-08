const messageModel = require("../models/message.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const sendMessage = asyncHandler(async (req, res) => {
    const { recipientId, content, groupId } = req.body;
    const io = req.app.get('io');

    const message = await messageModel.create({
        sender: req.user._id,
        recipient: recipientId || undefined,
        group: groupId || undefined,
        content
    });

    const populatedMessage = await message.populate("sender", "username profileImage");

    // Real-time emission
    if (recipientId) {
        io.to(recipientId).emit('new_message', populatedMessage);
    } else if (groupId) {
        io.to(groupId).emit('new_group_message', populatedMessage);
    }

    return res.status(201).json(new ApiResponse(201, populatedMessage, "Message sent"));
});

const getMessages = asyncHandler(async (req, res) => {
    const { otherUserId } = req.params;
    
    const messages = await messageModel.find({
        $or: [
            { sender: req.user._id, recipient: otherUserId },
            { sender: otherUserId, recipient: req.user._id }
        ]
    }).sort({ createdAt: 1 }).limit(100);

    return res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
});

module.exports = {
    sendMessage,
    getMessages
};

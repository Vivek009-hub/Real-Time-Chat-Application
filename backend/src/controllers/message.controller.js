import User from "../models/user.model.js";
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")  //ne = not equal to loggedInUserId

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.log('Error in getUsersForSidebar', error.message);
        res.status(500).json({ message: "Internal Server Error" })

    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userTochatId } = req.params
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userTochatId },
                { senderId: userTochatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log('Error in getMessages controller:', error.message);
        res.status(500).json({ error: "Internal Server Error" })

    }
}


export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;

        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save();

        //todo: realtime dunctionality goes here => socket.io

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);  // only to the receiver  
            // we can also use io.emit() to send to all connected clients ( Group Chats )
        }

        res.status(201).json(newMessage)



    } catch (error) {
        console.log('Error in sendMessage controller:', error.message);
        res.status(500).json({ error: "Internal Server Error" })

    }
}
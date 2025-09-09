import Message from "../../../DB/Models/message.model.js";
import User from "../../../DB/Models/user.model.js";

export const sendMessageService = async (req, res, next) => {
  const { content } = req.body;
  const { receiverId } = req.params;

  const user = await User.findById(receiverId);
  if (!user) {
    res.status(400).json({ message: "user not found", success: false });
  }

  const message = await Message.create({
    content,
    receiverId,
  });

  return res
    .status(201)
    .json({ message: "message added", success: true, data: message });
};

export const getAllMessage = async (req, res, next) => {
  const message = await Message.find();
  res.status(200).json({
    message: "all messages",
    success: true,
    data: message,
  });
};

//child-paraent relationchip child-> Message paraent-> User
export const getUserMessage = async (req, res, next) => {
  const { receiverId } = req.params;
  const message = await Message.find({ receiverId }).populate([
    {
      path: "receiverId",
      select: "firstName lastName",
    },
  ]);
  res.status(200).json({
    message: "User messages",
    success: true,
    data: message,
  });
};

import BlackListedTokens from "../DB/Models/black-listed-token.model.js";
import User from "../DB/Models/user.model.js";
import { verifyToken } from "../Utils/token.utils.js";

export const authenticationMiddleware = async (req, res, next) => {
  const { accesstoken } = req.headers;
  if (!accesstoken) {
    return res.status(400).json({ message: "please provide an access token" });
  }

  const decodedData = verifyToken(accesstoken, process.env.JWT_ACCESS_SECRET);
  if (!decodedData.jti) {
    return res.status(400).json({ message: "invalid access token" });
  }

  const revokedToken = await BlackListedTokens.findOne({
    tokenId: decodedData.jti,
  });
  if (revokedToken) {
    return res
      .status(401)
      .json({ message: ".... Toked revoked ....", success: false });
  }

  const user = await User.findById(decodedData?._id, "-password");
  if (!user) {
    return res.status(404).json({ message: "User not found", success: false });
  }

  req.loggedInUser = {
    user,
    token: { tokenId: decodedData.jti, expirationDate: decodedData.exp },
  };
  next();
};

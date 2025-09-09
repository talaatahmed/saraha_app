import mongoose, { Schema } from "mongoose";

const blackListedToken = new Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
});

const BlackListedTokens = mongoose.model("BlackListedTokens", blackListedToken);
export default BlackListedTokens;

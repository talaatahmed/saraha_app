import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_URL_HOST);
    console.log("DB connected successfully ...");
  } catch (error) {
    console.log("DB Fail", error);
  }
};

export default dbConnection;

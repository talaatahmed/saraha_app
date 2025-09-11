import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import userController from "./Modules/User/user.controller.js";
import messageController from "./Modules/Message/message.controller.js";
import welcomeController from "./Modules/Welcome/welcome.controller.js";
import dbConnection from "./DB/db.connection.js";
import { limiter } from "./Middleware/limiter.middleware.js";
import { corsOptions } from "./Middleware/cors.middleware.js";

const app = express();

//Barsing middleware
app.use(express.json());

//Satitc folders
app.use("/uploads", express.static("Uploads"));

//hemet security middleware
app.use(helmet());

//rate-limiter
app.use(limiter);

//CORS
app.use(cors(corsOptions));

//Handle routes
app.use("/users", userController);
app.use("/messages", messageController);
app.use("/", welcomeController);

//database
dbConnection();

//Global error handling middleware
app.use(async (err, req, res, next) => {
  console.log(err.message);
  if (req.session && req.session.inTransaction()) {
    //abort transaction
    await req.session.abortTransaction();
    //end session
    req.session.endSession();
    console.log("the transaction is aborted");
  }
  res.status(500).json({
    message: "something broke!!!",
    success: false,
    error: err.stack,
  });
});

//Not found middleware
app.use((req, res, next) => {
  res.status(400).json({
    message: "router not found",
    success: false,
  });
});

//server running
app.listen(process.env.PORT, () => {
  console.log("server started on port ", +process.env.PORT);
});

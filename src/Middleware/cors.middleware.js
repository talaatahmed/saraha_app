//CORS middle ware
const whiteList = process.env.WHITE_LISTED_ORIGINS;
export const corsOptions = {
  origin: function (origin, callback) {
    console.log("the origin is => ", origin);

    if (whiteList.includes(origin) || "undefined") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

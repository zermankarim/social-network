const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { User } = require("./models");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.static("public/default"));

app.use(express.json());
app.use("/auth", authRouter);


const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error(
    ".env Error: Variable 'MONGO_URL' is not defined or does not exist"
  );
}
if (!PORT) {
  throw new Error(
    ".env Error: Variable 'PORT'  is not defined or does not exist"
  );
}
// Функция которая подлключается к базе данных монго
async function start() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Server has been conected to Mongo DB");

    app.listen(PORT, () => {
      console.log("Server has been started on port:", PORT);
    });
  } catch (e) {
    console.log("Server error: ", e);
    process.exit(1);
  }
}

start();

app.get("/validation-token", async (req, res) => {
  const tokenForValidation = req.query;
  console.log(tokenForValidation)
  let decoded;
  try {
    decoded = jwt.verify(tokenForValidation.value, process.env.SECRET);
    // If token is verified, response to client success true end user's _id
    if (decoded) {
      const { id: userID } = decoded;
      const foundUser = await User.findOne({ _id: userID });
      const { _id, email, name, surname, role,avatar,background } = foundUser;
      res.json({
        success: true,
        foundUser: { _id, email, name, surname,role,avatar,background },
      });
    }
  } catch (err) {
    if(err instanceof jwt.JsonWebTokenError) {
      console.log(err);
      res.sendStatus(401)
    }
    if (err instanceof jwt.TokenExpiredError) {
      // If token is expired
      console.log(err);
      res.json({ success: false, message: "Token expired" });
    }
  }
});
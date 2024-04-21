const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const { config } = require("dotenv");
config();

// Middleware
app.use(bodyParser.json());
app.use(cors());
// MongoDB Connection
const connectionToDb = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGODB_URL);
    if (connection) {
      console.log(`Connected to Db:${connection.host}`);
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};
connectionToDb();
// User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
});

// User Model
const User = mongoose.model("User", UserSchema);

// Signup Route
app.post("/signup", async (req, res) => {
  try {
    console.log("--", req);

    const { email, password, firstName, lastName, username, mobileNumber } =
      req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create new user
    user = new User({
      email,
      password,
      username,
      firstName,
      mobileNumber,
      lastName,
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();
    // alert("User registered successfully");
    res.json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Create JWT Token

    res.status(200).json("SuccessFull Login"); // Send the token in the response

    // res.redirect("/homepage.html"); // Redirect to the homepage after sending the token
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

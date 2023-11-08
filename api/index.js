// index.js

// File imports
const secret = require('./secret');
const network = require('./src/network');
const User = require("./models/user");
// Package imports
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(secret.mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error Connecting to MongoDB");
  });

const serverPort = 3001;
app.listen(serverPort, async () => {
  console.log(`Server is running`);
  const publicIp = await network.getPublicIp();
  const localIp = await network.getLocalIp();
  const serverUp = await network.isServerUp(publicIp, serverPort);
  if (serverUp) {
    console.log(`Server is available to the Internet at IP ${publicIp} and port ${serverPort}`);
    network.postIp(publicIp, serverPort);
  } else {
    console.log(`Server is available only locally at IP ${localIp} and port ${serverPort}`);
    network.postIp(localIp, serverPort);
  }
});

//endpoint to register a user in the backend
app.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ message: "Email already registered" });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(402).json({ message: "Username already taken" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ name, username, email, password: hashedPassword });

    newUser.verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    network.sendMail(newUser.email, newUser.verificationToken);
    await newUser.save();

    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.log("error registering user", error);
    res.status(500).json({ message: "error registering user" });
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { username, userCode } = req.body;

    const user = await User.findOne({ username });

    if (user.verificationToken !== userCode) {
      return res.status(403).json({ message: "Invalid token" });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log("error getting token", error);
    res.status(500).json({ message: "Email verification failed" });
  }
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};

const secretKey = generateSecretKey();

app.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or username" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(405).json({ message: "Invalid password" });
    }

    if (!user.verified) {
      return res.status(406).json({ message: "Email not verified" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);
    return res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

//endpoint to access all the users except the logged in the user
app.get("/user/:userId", (req, res) => {
  try {
    const loggedInUserId = req.params.userId;

    User.find({ _id: { $ne: loggedInUserId } })
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((error) => {
        console.log("Error: ", error);
        res.status(500).json("errror");
      });
  } catch (error) {
    res.status(500).json({ message: "error getting the users" });
  }
});
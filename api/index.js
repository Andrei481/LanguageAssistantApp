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
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const https = require("https");
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
});

setTimeout(async () => {
  const publicIp = await network.getPublicIp();
  const localIp = await network.getLocalIp();
  let serverIp;
  if (await network.isPortOpen(publicIp, serverPort)) {
    serverIp = publicIp;
    console.log(`Server is available to the Internet at IP ${serverIp} and port ${serverPort}`);
  } else {
    serverIp = localIp;
    console.log(`Server is available only locally at IP ${serverIp} and port ${serverPort}`);
  }
  network.postIp(serverIp, serverPort);
}, 10000); // 10 seconds delay

const saltRounds = 10; // this is used for hashing

//endpoint to register a user in the backend
app.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //create a new user
    const newUser = new User({ name, username, email, password: hashedPassword });

    //generate and store the verification token
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    //save the  user to the database
    await newUser.save();

    //send the verification email to the user
    network.sendMail(newUser.email, newUser.verificationToken);

    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.log("error registering user", error);
    res.status(500).json({ message: "error registering user" });
  }
});

app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
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
    const { identifier, password } = req.body; // Use 'identifier' to represent email or username

    // Try to find a user by email
    const userByEmail = await User.findOne({ email: identifier });
    console.log(userByEmail);

    // Try to find a user by username
    const userByUsername = await User.findOne({ username: identifier });
    console.log(userByUsername);

    if (!userByEmail && !userByUsername) {
      return res.status(404).json({ message: "Invalid email or username" });
    }

    // Check the password for the found user (either by email or username)
    if (userByEmail && (await bcrypt.compare(password, userByEmail.password))) {
      const token = jwt.sign({ userId: userByEmail._id }, secretKey);
      return res.status(200).json({ token });
    }

    if (userByUsername && (await bcrypt.compare(password, userByUsername.password))) {
      const token = jwt.sign({ userId: userByUsername._id }, secretKey);
      return res.status(200).json({ token });
    }

    // If the password doesn't match for both cases, return an error
    return res.status(404).json({ message: "Invalid password" });
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
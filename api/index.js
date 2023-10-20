require('dotenv').config({ path: '../.env'});
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const jwt = require("jsonwebtoken");

mongoose
  .connect("mongodb+srv://Andrei0408:parola12345@cluster0.sa6zj9o.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error Connecting to MongoDB");
  });

app.listen(port, () => {
  console.log("server is running on port 3000");
});

const User = require("./models/user");

const IP_ADDRESS = process.env.IP_ADDRESS;
const EMAIL_USER= process.env.EMAIL_USER;
const EMAIL_PASS= process.env.EMAIL_PASS;

//endpoint to register a user in the backend
app.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    //create a new user
    const newUser = new User({ name, username, email, password });

    //generate and store the verification token
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    //save the  user to the database
    await newUser.save();

    //send the verification email to the user
    sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.log("error registering user", error);
    res.status(500).json({ message: "error registering user" });
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER, // Use the environment variable
      pass: EMAIL_PASS, // Use the environment variable
    },
    tls: {
      rejectUnauthorized: false, // Bypass SSL certificate verification
    },
  });

  const mailOptions = {
    from: "LanguageAssistant",
    to: email,
    subject: "Email Verification",
    text: `Please click the following link to verify your email http://${IP_ADDRESS}:3000/verify/${verificationToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("error sending email", error);
  }
};

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
    if (userByEmail && userByEmail.password === password) {
      const token = jwt.sign({ userId: userByEmail._id }, secretKey);
      return res.status(200).json({ token });
    }

    if (userByUsername && userByUsername.password === password) {
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
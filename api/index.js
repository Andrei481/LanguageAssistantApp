const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");

const secret = require('./secret');
const network = require('./src/network');
const User = require("./models/user");
const Detection = require("./models/detection")

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
    subject = 'Language Assistant registration';
    text = `Hello, ${name}! Here is your verification code: ${newUser.verificationToken}`;
    network.sendMail(email, subject, text);
    await newUser.save();

    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.log("error registering user", error);
    res.status(500).json({ message: "error registering user" });
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { identifier, userCode } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (user.verificationToken !== userCode) {
      return res.status(403).json({ message: "Invalid token" });
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully", userId: user._id });
  } catch (error) {
    console.log("error getting token", error);
    res.status(500).json({ message: "Email verification failed" });
  }
});

app.post("/forgotpass", async (req, res) => {
  try {
    const { identifier } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or username" });
    }

    user.verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    subject = 'Language Assistant password reset';
    text = `Hello, ${user.name}! Here is your password reset code: ${user.verificationToken}`;
    network.sendMail(user.email, subject, text);
    await user.save();

    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    res.status(500).json({ message: "Error sending mail" });
  }
});

app.post("/resetpass", async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or username" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    res.status(500).json({ message: "Error sending mail" });
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
    return res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// const authenticateUser = async (req, res, next) => {
//   const token = req.header("Authorization");

//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized - No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, secretKey);
//     req.user = await User.findById(decoded.userId);

//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized - Invalid token" });
//     }

//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Unauthorized - Invalid token" });
//   }
// };


app.route("/detection")
  .post(async (req, res) => {
    try {
      const { userId, image, className, probability } = req.body;

      if (!userId || !image || !className || !probability) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const detection = new Detection({
        userId,
        image,
        className,
        probability,
      });
      await detection.save();

      res.status(200).json({ message: "Detection saved successfully" });
    } catch (error) {
      console.error("Error saving detection:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
  .get(async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ message: "Missing userId parameter" });
      }

      const detections = await Detection.find({ userId });

      res.status(200).json({ detectedImages: detections });
    } catch (error) {
      console.error("Error fetching detected images:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


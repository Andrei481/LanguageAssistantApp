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
    .connect(secret.mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true, })
    .then(() => { console.log("Connected to MongoDB"); })
    .catch((err) => { console.log("Error Connecting to MongoDB"); });

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

        const emailTemplate = require('./email_templates/register');
        const { subject, text, html } = emailTemplate(name, newUser.verificationToken);

        network.sendMail(email, subject, text, html);

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

        const emailTemplate = require('./email_templates/resetpass');
        const { subject, text, html } = emailTemplate(user.name, user.verificationToken);

        network.sendMail(user.email, subject, text, html);

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

app.route("/detection")
    .post(async (req, res) => {
        try {
            const { userId, className, probability, image } = req.body;

            if (!userId || !className || !probability || !image) {
                return res.status(400).json({ message: "Invalid request data" });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Check if user already uploaded this photo
            const existingDetection = await Detection.findOne({ userId, className });
            if (existingDetection) {
                return res.status(409).json({ message: "Image already exists for this class" });
            }

            const detection = new Detection({
                userId,
                className,
                probability,
                image: Buffer.from(image, 'base64'), // Convert base64 image to Buffer
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

            // Convert each image buffer to base64
            const detectedImages = detections.map((detection) => {
                return {
                    _id: detection._id,
                    image: detection.image.toString('base64'),
                    className: detection.className,
                    probability: detection.probability,
                    createdAt: detection.createdAt,
                };
            });

            res.status(200).json({ detectedImages });
        } catch (error) {
            console.error("Error fetching detected images:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });

app.route("/deleteAllImages")
    .delete(async (req, res) => {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ message: "Missing userId parameter" });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Delete all detections associated with the user
            await Detection.deleteMany({ userId });

            res.status(200).json({ message: "All images deleted successfully" });
        } catch (error) {
            console.error("Error deleting images:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });

app.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            name: user.name,
            username: user.username,
            email: user.email
        };

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.route('/progressPoints')
    .post(async (req, res) => {
        try {
            const { userId, progressIncrement } = req.body;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.progressPoints === 0) {
                user.progressPoints += 100;
            } else {
                user.progressPoints += progressIncrement;
            }

            await user.save();

            res.status(200).json({ message: 'Progress points updated successfully', progressPoints: user.progressPoints });
        } catch (error) {
            console.error("Error updating progress points:", error);
            res.status(500).json({ message: 'Internal server error at POST progressPoints' });
        }
    })
    .get(async (req, res) => {
        try {
            const { userId } = req.body;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ progressPoints: user.progressPoints });
        } catch (error) {
            console.error("Error getting progress points:", error);
            res.status(500).json({ message: 'Internal server error at GET progressPoints' });
        }
    });

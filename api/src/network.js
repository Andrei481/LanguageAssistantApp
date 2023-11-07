// network.js
const secret = require('../secret');
const https = require('https');
const os = require('os');
const interfaces = os.networkInterfaces();
const net = require('net');
const nodemailer = require('nodemailer');
const snoowrap = require('snoowrap');

exports.getPublicIp = function () {
    return new Promise((resolve, reject) => {
        https.get("https://checkip.amazonaws.com", (response) => {
            if (response.statusCode === 200) {
                response.on("data", (data) => {
                    resolve(data.toString());
                });
            } else {
                reject(new Error("Failed to get public IP address"));
            }
        });
    });
}

exports.getLocalIp = function () {
    for (let devName in interfaces) {
        let iface = interfaces[devName];

        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                localIp = alias.address;
            }
        }
    }
    return localIp;
}

exports.isPortOpen = function (ip, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        socket.once('connect', () => {
            resolve(true);
            socket.end();
        });

        socket.once('error', () => {
            resolve(false);
        });

        socket.connect(port, ip);
    });
}

exports.postIp = function (ip, port) {

    const reddit = new snoowrap({
        userAgent: 'Lily Language Assistant',
        username: secret.redditUser,
        password: secret.redditPass,
        clientId: secret.redditId,
        clientSecret: secret.redditSecret
    });

    const selftext = `LanguageAssistant server is running on ${ip}:${port}`;

    reddit.getSubmission(secret.redditSubmission)
        .fetch()
        .then((post) => {
            post.edit(selftext)
                .then(() => {
                    console.log('IP address shared on reddit lol');
                })
                .catch((error) => {
                    console.error('Error updating reddit post:', error);
                });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

exports.sendMail = function (recipient, code) {

    const transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com', // Hotmail's SMTP server
        port: 587, // Port for TLS (587) or SSL (465)
        secure: false, // true for 465, false for other ports
        auth: {
            user: secret.lilyMail,
            pass: secret.lilyPass,
        },
    });

    // Email data
    const mailOptions = {
        from: secret.lilyMail,
        to: recipient,
        subject: "Please verify your Language Assistant account",
        text: 'Thanks for joining Language Assistant! Here is your verification code: ' + code + '.',
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}
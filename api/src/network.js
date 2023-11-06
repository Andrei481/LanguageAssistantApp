// network.js
const secret = require('../secret');
const https = require('https');
const os = require('os');
const interfaces = os.networkInterfaces();
const net = require('net');
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
    const formData = require('form-data');
    const Mailgun = require('mailgun.js');
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({ username: 'api', key: secret.mailgunKey });
    const mailText = 'Thanks for joining Language Assistant! Here is your verification code: ' + code + '.';
    mg.messages.create('sandbox70c310efbbf34753b121ea51d61b0594.mailgun.org', {
        from: "Lily Language Assistant <mailgun@sandbox70c310efbbf34753b121ea51d61b0594.mailgun.org>",
        to: [recipient],
        subject: "Please verify your Language Assistant account",
        text: mailText,
        html: mailText
    })
        .then(msg => console.log('Mail sent.')) // logs response data
        .catch(err => console.log(err)); // logs any error
}
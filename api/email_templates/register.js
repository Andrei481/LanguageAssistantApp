// register.js

module.exports = (name, verificationToken) => {
    const subject = `Language Assistant verification code: ${verificationToken}`;
    const text = `Hello, ${name}! Here is your verification code: ${verificationToken}`;
    const html =
        `
        <html>
            <body>
                <br>
                <h3 style="color: darkblue;">Welcome, ${name}!</h3>
                <p>Thank you for registering to <strong>Language Assistant!</strong></p>
                <p>Here is your verification code:
                <h1><strong>${verificationToken}</strong></p></h1>
                <p>Best regards,<br><strong>A² Team</strong></p>
                <p>
                    <img src="https://content.cdn.sap.com/is/image/sap/289135:HeroL-3840x1044?wid=1920&hei=522&fit=stretch,1" alt="Tech banner" width="320"  height="87">
                </p>
            </body>
        </html>
        `
    return { subject, html };
};

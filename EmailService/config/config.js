require("dotenv").config({ path: __dirname + "/../app.env" });
const crypto = require("crypto");
const algo = process.env["encryption_algo"];
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
    let cipher = crypto.createCipheriv(algo, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

//configuration for email service
const config = {
    encryption: {
        algorithm: algo,
        key: key
    },
    smtp: {
        server: process.env["smtp_server"],
        port: process.env["smtp_server_port"],
        secure: false,
        auth: {
            user: process.env["email"],
            pass: encrypt(process.env["email_credential"])
        }
    }
};

module.exports = config;
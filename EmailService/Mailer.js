'use strict';
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const PdfDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const config = require("./config/config");
require("dotenv").config({ path: __dirname + "/../app.env" });

function decrypt(text) {
    let iv = Buffer.from(text.iv, "hex");
    let encryptedData = Buffer.from(text.encryptedData, "hex");
    let decipher = crypto.createDecipheriv(config.encryption.algorithm, Buffer.from(config.encryption.key), iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

async function SendEmail() {
    router.post("/", (request, response) => {
        const pdf = new PdfDocument();
        let filename = request.body.content["lastName"];
        filename = encodeURIComponent(filename) + ".pdf";
        const content = request.body.content;
        let dataBuffer = [];
        pdf.on("data", dataBuffer.push.bind(dataBuffer));
        pdf.on("end", () => {
            var transporter = nodemailer.createTransport({
                host: config.smtp.server,
                port: config.smtp.port,
                secure: config.smtp.secure,
                auth: {
                    user: config.smtp.auth.user,
                    pass: decrypt(config.smtp.auth.pass)
                }
            });

            //email specifications
            var mailOptions = transporter.sendMail({
                from: process.env["email"],
                to: request.body.content["email"],
                subject: "Your Application",
                text: "Hello " + request.body.content["firstName"] + ", your application is attached below.",
                attachments: [{
                    filename: filename,
                    content: Buffer.concat(dataBuffer)
                }]
            });

            //send email
            transporter.sendMail(mailOptions, function (error, info) {
                if (error)
                    console.log(error);
                else
                    console.log('Email sent: ' + info.response);
            });
        })

        pdf.font("Times-Roman")
            .fontSize(12)
            .text(content, 50, 50)
            .pipe(response)
            .end();

    });
}

SendEmail().catch(console.error);
import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";

export const emmiter = new EventEmitter();
emmiter.on("sendEmail", (args) => {
  sendEmail(args);
});

export const sendEmail = async ({ to, subject, content, attachments = [] }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", //"localhost",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, //only for testing but in production it should be true (the default value)
    },
  });

  const info = await transporter.sendMail({
    from: "talaatahmed.806@gmail.com",
    to,
    subject,
    html: content,
    attachments,
  });

  // console.log("info ==> ", info);
  return info;
};

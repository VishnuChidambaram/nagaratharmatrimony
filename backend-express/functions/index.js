const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const db = admin.firestore();

// Email transporter (use your SMTP or service)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "magali.koss@ethereal.email",
    pass: "fkHcqWuJG4h3CfGgPB",
  },
});

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

exports.sendForgotPasswordOtp = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { email } = req.body;

  if (!email) {
    res.json({ success: false, message: "Email required" });
    return;
  }

  const otp = generateOtp();
  const expiration = Date.now() + 10 * 60 * 1000; // 10 minutes

  try {
    // Store OTP in Firestore
    await db.collection("otpResets").doc(email).set({
      otp,
      expiration,
    });

    const mailOptions = {
      from: "noreply@yourapp.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email send error:", error);
        res.json({ success: false, message: "Failed to send OTP" });
      } else {
        console.log("OTP sent:", otp);
        res.json({ success: true, message: "OTP sent to your email" });
      }
    });
  } catch (error) {
    console.error("Error storing OTP:", error);
    res.json({ success: false, message: "Failed to send OTP" });
  }
});

exports.verifyResetOtp = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    res.json({ success: false, message: "Email and OTP required" });
    return;
  }

  try {
    const doc = await db.collection("otpResets").doc(email).get();
    if (!doc.exists) {
      res.json({ success: false, message: "Invalid OTP" });
      return;
    }

    const data = doc.data();
    if (data.otp !== otp || Date.now() > data.expiration) {
      res.json({ success: false, message: "Invalid or expired OTP" });
      return;
    }

    // OTP verified, delete it
    await db.collection("otpResets").doc(email).delete();
    res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.json({ success: false, message: "Failed to verify OTP" });
  }
});

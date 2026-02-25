const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/send-email", async (req, res) => {
  const { email, remaining } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yourgmail@gmail.com",
      pass: "your_app_password",
    },
  });

  await transporter.sendMail({
    from: "yourgmail@gmail.com",
    to: email,
    subject: "Loan Payment Reminder",
    text: `Outstanding Amount: ₹${remaining}\nPlease pay soon.`,
  });

  res.send("Email Sent");
});

app.listen(5000, () => console.log("Server running on port 5000"));